<?php

namespace App\Services;

use App\Models\PaymentIntent;
use App\Models\BoostedAd;
use App\Events\AdBoosted;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class PaymentService
{
    protected const GATEWAY = 'paystack';
    protected const PAYSTACK_BASE = 'https://api.paystack.co';

    protected function getApiKey(): string
    {
        return config('services.paystack.secret_key') ?? env('PAYSTACK_SECRET_KEY');
    }

    protected function getPublicKey(): string
    {
        return config('services.paystack.public_key') ?? env('PAYSTACK_PUBLIC_KEY');
    }

    public function initializePayment(array $data): array
    {
        $userId = $data['user_id'];
        $amount = $data['amount'];
        $type = $data['type'] ?? 'boost';
        $adId = $data['ad_id'] ?? null;
        $currency = $data['currency'] ?? 'NGN';
        $metadata = $data['metadata'] ?? [];
        $email = $data['email'] ?? '';

        $reference = $this->generateReference($type);

        return DB::transaction(function () use ($userId, $amount, $type, $adId, $currency, $reference, $metadata, $email) {
            $paymentIntent = PaymentIntent::create([
                'user_id' => $userId,
                'ad_id' => $adId,
                'amount' => $amount,
                'currency' => $currency,
                'reference' => $reference,
                'type' => $type,
                'status' => 'pending',
                'gateway' => self::GATEWAY,
                'metadata' => $metadata,
            ]);

            $response = Http::withToken($this->getApiKey())
                ->post(self::PAYSTACK_BASE . '/transaction/initialize', [
                    'email' => $email,
                    'amount' => $this->toKobo($amount, $currency),
                    'currency' => $currency,
                    'reference' => $reference,
                    'callback_url' => route('payments.callback'),
                    'metadata' => [
                        'user_id' => $userId,
                        'payment_intent_id' => $paymentIntent->id,
                        'type' => $type,
                        ...$metadata,
                    ],
                ]);

            if (!$response->successful()) {
                Log::error('Paystack initialization failed', [
                    'reference' => $reference,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                $paymentIntent->markAsFailed();

                return [
                    'success' => false,
                    'error' => 'Failed to initialize payment gateway',
                    'code' => 'gateway_error',
                ];
            }

            $gatewayData = $response->json('data');

            $paymentIntent->update([
                'gateway_reference' => $gatewayData['reference'] ?? $reference,
            ]);

            Log::info('Payment initialized with Paystack', [
                'reference' => $reference,
                'amount' => $amount,
                'authorization_url' => $gatewayData['authorization_url'],
            ]);

            return [
                'success' => true,
                'payment_intent' => $paymentIntent,
                'authorization_url' => $gatewayData['authorization_url'],
                'access_code' => $gatewayData['access_code'] ?? null,
            ];
        });
    }

    public function verifyPayment(string $reference): array
    {
        $paymentIntent = PaymentIntent::where('reference', $reference)->first();

        if (!$paymentIntent) {
            return [
                'success' => false,
                'error' => 'Payment not found',
                'code' => 'payment_not_found',
            ];
        }

        if ($paymentIntent->isPaid()) {
            return [
                'success' => true,
                'payment' => $paymentIntent,
                'message' => 'Payment already verified',
            ];
        }

        $response = Http::withToken($this->getApiKey())
            ->get(self::PAYSTACK_BASE . '/transaction/verify/' . $reference);

        if (!$response->successful()) {
            return [
                'success' => false,
                'error' => 'Failed to verify with gateway',
                'code' => 'gateway_error',
            ];
        }

        $data = $response->json('data');

        if ($data['status'] === 'success') {
            return $this->processSuccessfulPayment($paymentIntent, $data);
        }

        return [
            'success' => false,
            'payment' => $paymentIntent,
            'message' => 'Payment not completed',
            'gateway_status' => $data['status'],
        ];
    }

    public function handleWebhook(array $payload): array
    {
        $eventId = $payload['event'] ?? '';
        $data = $payload['data'] ?? [];
        $reference = $data['reference'] ?? '';

        $lockKey = 'webhook_lock:' . $reference . ':' . ($data['id'] ?? 'unknown');

        if (Cache::has($lockKey)) {
            Log::warning('Duplicate webhook ignored', ['reference' => $reference]);
            return ['success' => true, 'message' => 'Already processed'];
        }

        Cache::put($lockKey, true, 300);

        Log::info('Webhook received', [
            'event' => $eventId,
            'reference' => $reference,
            'status' => $data['status'] ?? 'unknown',
        ]);

        return match ($eventId) {
            'charge.success' => $this->handleChargeSuccess($data),
            'charge.failed' => $this->handleChargeFailed($data),
            default => ['success' => true, 'message' => 'Event ignored: ' . $eventId],
        };
    }

    public function handleChargeSuccess(array $data): array
    {
        $reference = $data['reference'] ?? '';

        $paymentIntent = PaymentIntent::where('reference', $reference)
            ->where('status', 'pending')
            ->first();

        if (!$paymentIntent) {
            $paymentIntent = PaymentIntent::where('reference', $reference)->first();

            if ($paymentIntent && $paymentIntent->isPaid()) {
                return ['success' => true, 'message' => 'Already processed'];
            }

            Log::warning('Webhook for unknown payment', ['reference' => $reference]);
            return ['success' => false, 'error' => 'Payment not found'];
        }

        return $this->processSuccessfulPayment($paymentIntent, $data);
    }

    public function handleChargeFailed(array $data): array
    {
        $reference = $data['reference'] ?? '';

        $paymentIntent = PaymentIntent::where('reference', $reference)
            ->where('status', 'pending')
            ->first();

        if (!$paymentIntent) {
            return ['success' => true, 'message' => 'No pending payment found'];
        }

        $paymentIntent->update([
            'status' => 'failed',
            'gateway_response' => $data,
        ]);

        Log::warning('Payment failed via webhook', [
            'reference' => $reference,
            'reason' => $data['gateway_response'] ?? 'Unknown',
        ]);

        return ['success' => true];
    }

    public function attachBoostAfterPayment(PaymentIntent $paymentIntent): array
    {
        if ($paymentIntent->ad_id === null) {
            return [
                'success' => false,
                'error' => 'No ad associated with payment',
            ];
        }

        $metadata = $paymentIntent->metadata ?? [];
        $boostType = $metadata['boost_type'] ?? 'top';
        $durationDays = $metadata['duration_days'] ?? 7;

        $existingBoost = BoostedAd::where('ad_id', $paymentIntent->ad_id)
            ->active()
            ->where('boost_type', $boostType)
            ->first();

        if ($existingBoost) {
            $endTime = $existingBoost->end_time->addDays($durationDays);
            $existingBoost->update([
                'end_time' => $endTime,
                'payment_reference' => $paymentIntent->reference,
            ]);
            $boost = $existingBoost->fresh();
        } else {
            $boost = BoostedAd::create([
                'ad_id' => $paymentIntent->ad_id,
                'user_id' => $paymentIntent->user_id,
                'boost_type' => $boostType,
                'start_time' => now(),
                'end_time' => now()->addDays($durationDays),
                'status' => 'active',
                'payment_reference' => $paymentIntent->reference,
            ]);
        }

        event(new AdBoosted($boost));

        Log::info('Boost attached after payment', [
            'ad_id' => $paymentIntent->ad_id,
            'boost_id' => $boost->id,
            'boost_type' => $boostType,
        ]);

        return [
            'success' => true,
            'boost' => $boost,
        ];
    }

    public function validateWebhookSignature(string $payload, string $signature): bool
    {
        $expectedHash = hash_hmac('sha512', $payload, $this->getApiKey());

        return hash_equals($expectedHash, $signature);
    }

    public function getPublicConfig(): array
    {
        return [
            'gateway' => self::GATEWAY,
            'public_key' => $this->getPublicKey(),
        ];
    }

    protected function processSuccessfulPayment(PaymentIntent $paymentIntent, array $gatewayData): array
    {
        return DB::transaction(function () use ($paymentIntent, $gatewayData) {
            $paymentIntent->markAsPaid();
            $paymentIntent->update([
                'gateway_response' => $gatewayData,
                'processed_webhook_id' => $gatewayData['id'] ?? null,
            ]);

            if ($paymentIntent->type === 'boost') {
                $this->attachBoostAfterPayment($paymentIntent);
            }

            Log::info('Payment confirmed via gateway', [
                'reference' => $paymentIntent->reference,
                'type' => $paymentIntent->type,
                'amount' => $paymentIntent->amount,
                'gateway_amount' => $gatewayData['amount'] ?? null,
            ]);

            return [
                'success' => true,
                'payment' => $paymentIntent,
            ];
        });
    }

    protected function toKobo(float $amount, string $currency): int
    {
        return in_array($currency, ['NGN', 'GHS', 'KES', 'ZAR'])
            ? (int) round($amount * 100)
            : (int) round($amount * 100);
    }

    protected function generateReference(string $type): string
    {
        $prefix = match ($type) {
            'boost' => 'BST',
            'wallet' => 'WLT',
            default => 'PAY',
        };

        return $prefix . date('Ymd') . strtoupper(Str::random(10));
    }
}
