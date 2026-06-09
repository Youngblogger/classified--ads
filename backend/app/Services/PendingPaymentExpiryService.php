<?php

namespace App\Services;

use App\Models\PaymentIntent;
use App\Models\PaymentLog;
use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PendingPaymentExpiryService
{
    protected const PAYSTACK_BASE = 'https://api.paystack.co';
    protected const EXPIRY_MINUTES = 15;

    protected function getApiKey(): string
    {
        return config('services.paystack.secret_key') ?? env('PAYSTACK_SECRET_KEY');
    }

    public function getExpiryMinutes(): int
    {
        return (int) config('app.pending_payment_expiry_minutes', self::EXPIRY_MINUTES);
    }

    public function getExpiresAt(\Carbon\Carbon $createdAt = null): \Carbon\Carbon
    {
        return ($createdAt ?? now())->copy()->addMinutes($this->getExpiryMinutes());
    }

    public function getRemainingSeconds(PaymentIntent|Transaction $record): int
    {
        $expiresAt = match (true) {
            $record instanceof PaymentIntent => $record->expires_at,
            $record instanceof Transaction => $record->expires_at,
            default => null,
        };

        if (!$expiresAt) {
            $expiresAt = $record->created_at->addMinutes($this->getExpiryMinutes());
        }

        return max(0, now()->diffInSeconds($expiresAt, false));
    }

    /**
     * Verify with Paystack before marking as failed.
     * Only marks as failed if Paystack confirms it was NOT successful.
     */
    public function verifyAndExpirePendingPaymentIntents(): int
    {
        $cutoff = now()->subMinutes($this->getExpiryMinutes());

        $pendingIntents = PaymentIntent::where('status', 'pending')
            ->where('created_at', '<=', $cutoff)
            ->get();

        $expiredCount = 0;

        foreach ($pendingIntents as $intent) {
            $result = $this->verifyWithPaystackAndExpire($intent);
            if ($result) {
                $expiredCount++;
            }
        }

        return $expiredCount;
    }

    public function verifyWithPaystackAndExpire(PaymentIntent $intent): bool
    {
        $reference = $intent->reference;

        try {
            $response = Http::withToken($this->getApiKey())
                ->timeout(10)
                ->get(self::PAYSTACK_BASE . '/transaction/verify/' . $reference);

            if ($response->successful()) {
                $gatewayData = $response->json('data');
                $gatewayStatus = $gatewayData['status'] ?? null;

                if ($gatewayStatus === 'success') {
                    Log::info('Pending payment recovered via Paystack verification', [
                        'reference' => $reference,
                        'payment_intent_id' => $intent->id,
                    ]);

                    $paymentService = app(PaymentService::class);
                    $paymentService->processSuccessfulPayment($intent, $gatewayData);

                    $this->sendSuccessNotification($intent);
                    return false;
                }

                if ($gatewayStatus === 'failed' || $gatewayStatus === 'abandoned') {
                    $this->expirePaymentIntent($intent, 'failed', [
                        'gateway_status' => $gatewayStatus,
                        'verified_at' => now()->toIso8601String(),
                    ]);
                    $this->sendExpiredNotification($intent);
                    return true;
                }
            } else {
                Log::warning('Paystack verification request failed for pending payment', [
                    'reference' => $reference,
                    'status' => $response->status(),
                ]);
            }
        } catch (\Throwable $e) {
            Log::error('Exception verifying pending payment with Paystack', [
                'reference' => $reference,
                'error' => $e->getMessage(),
            ]);
        }

        $this->expirePaymentIntent($intent, 'expired', [
            'verified_at' => now()->toIso8601String(),
            'note' => 'No Paystack confirmation received within expiry window',
        ]);
        $this->sendExpiredNotification($intent);
        return true;
    }

    protected function expirePaymentIntent(PaymentIntent $intent, string $status, array $metadata = []): void
    {
        DB::transaction(function () use ($intent, $status, $metadata) {
            $intent->update([
                'status' => $status,
                'expires_at' => $intent->expires_at ?? now(),
                'gateway_response' => array_merge(
                    $intent->gateway_response ?? [],
                    $metadata
                ),
            ]);

            $this->logExpiryEvent(
                $intent->id,
                $intent->reference,
                'pending_expiry',
                $status,
                $metadata,
                "Payment auto-expired after {$this->getExpiryMinutes()} minutes"
            );
        });
    }

    /**
     * Expire pending wallet funding transactions.
     * Releases the pending_balance lock.
     */
    public function verifyAndExpirePendingTransactions(): int
    {
        $cutoff = now()->subMinutes($this->getExpiryMinutes());

        $pendingTransactions = Transaction::where('status', 'pending')
            ->where('type', 'credit')
            ->where('payment_method', 'paystack')
            ->where('created_at', '<=', $cutoff)
            ->get();

        $expiredCount = 0;

        foreach ($pendingTransactions as $transaction) {
            $result = $this->verifyTransactionAndExpire($transaction);
            if ($result) {
                $expiredCount++;
            }
        }

        return $expiredCount;
    }

    public function verifyTransactionAndExpire(Transaction $transaction): bool
    {
        $reference = $transaction->reference;

        try {
            $response = Http::withToken($this->getApiKey())
                ->timeout(10)
                ->get(self::PAYSTACK_BASE . '/transaction/verify/' . $reference);

            if ($response->successful()) {
                $gatewayData = $response->json('data');
                $gatewayStatus = $gatewayData['status'] ?? null;

                if ($gatewayStatus === 'success') {
                    Log::info('Pending wallet funding recovered via Paystack verification', [
                        'reference' => $reference,
                        'transaction_id' => $transaction->id,
                    ]);

                    $this->completeWalletFunding($transaction, $gatewayData);
                    $this->sendSuccessNotification(null, $transaction->user_id, 'wallet_funding',
                        'Wallet Funding Successful',
                        "Your wallet funding of ₦" . number_format($transaction->amount, 2) . " has been confirmed."
                    );
                    return false;
                }
            }
        } catch (\Throwable $e) {
            Log::error('Exception verifying pending wallet transaction', [
                'reference' => $reference,
                'error' => $e->getMessage(),
            ]);
        }

        $this->expireTransaction($transaction);
        $this->sendExpiredNotification(null, $transaction, 'wallet_funding',
            'Wallet Funding Expired',
            "Your wallet funding session of ₦" . number_format($transaction->amount, 2) . " has expired. Please try again."
        );
        return true;
    }

    protected function expireTransaction(Transaction $transaction): void
    {
        DB::transaction(function () use ($transaction) {
            $transaction->update([
                'status' => 'expired',
                'expired_at' => now(),
                'expires_at' => $transaction->expires_at ?? now(),
            ]);

            $wallet = Wallet::find($transaction->wallet_id);
            if ($wallet && $wallet->pending_balance >= $transaction->amount) {
                $wallet->decrement('pending_balance', $transaction->amount);
                Log::info('Released pending balance for expired wallet funding', [
                    'transaction_id' => $transaction->id,
                    'wallet_id' => $wallet->id,
                    'amount' => $transaction->amount,
                ]);
            }

            $this->logExpiryEvent(
                null,
                $transaction->reference,
                'pending_expiry',
                'expired',
                ['transaction_id' => $transaction->id],
                "Wallet funding auto-expired after {$this->getExpiryMinutes()} minutes, pending balance released"
            );
        });
    }

    protected function completeWalletFunding(Transaction $transaction, array $gatewayData): void
    {
        DB::transaction(function () use ($transaction, $gatewayData) {
            $wallet = Wallet::find($transaction->wallet_id);
            if (!$wallet) return;

            $balanceBefore = $wallet->balance;
            $wallet->increment('balance', $transaction->amount);
            $wallet->decrement('pending_balance', $transaction->amount);
            $wallet->refresh();

            $transaction->update([
                'status' => 'success',
                'balance_before' => $balanceBefore,
                'balance_after' => $wallet->balance,
                'processed_at' => now(),
                'expires_at' => null,
            ]);

            $this->logExpiryEvent(
                null,
                $transaction->reference,
                'pending_expiry',
                'recovered',
                ['gateway_status' => 'success'],
                "Pending wallet funding recovered and completed via Paystack verification"
            );
        });
    }

    public function cancelPendingPaymentIntent(int $paymentIntentId, int $userId): array
    {
        $intent = PaymentIntent::where('id', $paymentIntentId)
            ->where('user_id', $userId)
            ->where('status', 'pending')
            ->first();

        if (!$intent) {
            return ['success' => false, 'error' => 'Pending payment not found'];
        }

        $this->expirePaymentIntent($intent, 'cancelled', [
            'cancelled_by_user' => true,
            'cancelled_at' => now()->toIso8601String(),
        ]);

        return ['success' => true, 'message' => 'Payment cancelled'];
    }

    public function getPendingPayments(int $userId): array
    {
        $paymentIntents = PaymentIntent::where('user_id', $userId)
            ->where('status', 'pending')
            ->get()
            ->map(function ($intent) {
                return [
                    'id' => $intent->id,
                    'type' => $intent->type,
                    'amount' => $intent->amount,
                    'currency' => $intent->currency,
                    'reference' => $intent->reference,
                    'status' => $intent->status,
                    'created_at' => $intent->created_at->toIso8601String(),
                    'expires_at' => ($intent->expires_at ?? $intent->created_at->addMinutes($this->getExpiryMinutes()))->toIso8601String(),
                    'remaining_seconds' => $this->getRemainingSeconds($intent),
                    'ad_id' => $intent->ad_id,
                ];
            });

        $walletTransactions = Transaction::where('user_id', $userId)
            ->where('status', 'pending')
            ->where('type', 'credit')
            ->where('payment_method', 'paystack')
            ->get()
            ->map(function ($tx) {
                return [
                    'id' => $tx->id,
                    'type' => 'wallet_funding',
                    'amount' => $tx->amount,
                    'currency' => 'NGN',
                    'reference' => $tx->reference,
                    'status' => 'pending',
                    'created_at' => $tx->created_at->toIso8601String(),
                    'expires_at' => ($tx->expires_at ?? $tx->created_at->addMinutes($this->getExpiryMinutes()))->toIso8601String(),
                    'remaining_seconds' => $this->getRemainingSeconds($tx),
                    'wallet_id' => $tx->wallet_id,
                ];
            });

        return array_merge($paymentIntents->toArray(), $walletTransactions->toArray());
    }

    protected function sendSuccessNotification(?PaymentIntent $intent = null, ?int $userId = null, string $type = 'boost', string $title = '', string $message = ''): void
    {
        try {
            if ($intent) {
                $userId = $intent->user_id;
                $type = $intent->type === 'boost' ? 'boost_activated' : $intent->type;
                $title = $intent->type === 'boost' ? 'Boost Activated!' : 'Payment Successful';
                $message = $intent->type === 'boost'
                    ? 'Your boost payment has been confirmed and your ad is now boosted!'
                    : 'Your payment has been confirmed successfully.';
            }

            if ($userId) {
                NotificationService::send(
                    $userId,
                    $type,
                    $title,
                    $message,
                    $intent ? ['payment_intent_id' => $intent->id, 'reference' => $intent->reference] : null
                );
            }
        } catch (\Throwable $e) {
            Log::warning('Failed to send success notification', ['error' => $e->getMessage()]);
        }
    }

    protected function sendExpiredNotification(?PaymentIntent $intent = null, ?Transaction $transaction = null, string $type = 'payment_expired', string $title = '', string $message = ''): void
    {
        try {
            $userId = null;
            $data = null;

            if ($intent) {
                $userId = $intent->user_id;
                $type = 'payment_expired';
                $title = $title ?: 'Payment Session Expired';
                $message = $message ?: 'Your payment session has expired. Please try again if you still wish to complete this transaction.';
                $data = ['payment_intent_id' => $intent->id, 'reference' => $intent->reference];
            } elseif ($transaction) {
                $userId = $transaction->user_id;
                $data = ['transaction_id' => $transaction->id, 'reference' => $transaction->reference];
            }

            if ($userId) {
                NotificationService::send($userId, $type, $title, $message, $data);
            }
        } catch (\Throwable $e) {
            Log::warning('Failed to send expiry notification', ['error' => $e->getMessage()]);
        }
    }

    protected function logExpiryEvent(
        ?int $paymentIntentId,
        ?string $reference,
        string $eventType,
        string $status,
        array $payload = [],
        ?string $notes = null
    ): void {
        try {
            PaymentLog::create([
                'payment_intent_id' => $paymentIntentId,
                'reference' => $reference,
                'event_type' => $eventType,
                'status' => $status,
                'payload' => $payload,
                'ip_address' => null,
                'notes' => $notes,
            ]);
        } catch (\Throwable $e) {
            Log::warning('Failed to write payment log from expiry service', ['error' => $e->getMessage()]);
        }
    }
}
