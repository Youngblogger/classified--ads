<?php

namespace App\Services;

use App\Models\PaymentIntent;
use App\Models\PaymentLog;
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
    protected const WEBHOOK_LOCK_TTL = 300;
    protected const VERIFICATION_CACHE_TTL = 60;

    protected function getApiKey(): string
    {
        return config('services.paystack.secret_key') ?? env('PAYSTACK_SECRET_KEY');
    }

    protected function getPublicKey(): string
    {
        return config('services.paystack.public_key') ?? env('PAYSTACK_PUBLIC_KEY');
    }

    protected function getWebhookSecret(): string
    {
        return config('services.paystack.webhook_secret')
            ?? config('services.paystack.secret_key')
            ?? env('PAYSTACK_WEBHOOK_SECRET')
            ?? env('PAYSTACK_SECRET_KEY');
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

        if (!in_array($currency, ['NGN', 'USD', 'EUR', 'GBP'])) {
            return [
                'success' => false,
                'error' => 'Unsupported currency',
                'code' => 'invalid_currency',
            ];
        }

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
                    'amount' => $this->toSubunit($amount, $currency),
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
                'currency' => $currency,
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

        $cacheKey = 'payment_verify:' . $reference;

        $cached = Cache::get($cacheKey);
        if ($cached !== null) {
            if ($cached['status'] === 'pending') {
                return [
                    'success' => false,
                    'payment' => $paymentIntent,
                    'message' => 'Payment still processing',
                    'code' => 'pending',
                ];
            }

            return [
                'success' => true,
                'payment' => $paymentIntent,
            ];
        }

        $response = Http::withToken($this->getApiKey())
            ->get(self::PAYSTACK_BASE . '/transaction/verify/' . $reference);

        if (!$response->successful()) {
            $this->logPaymentEvent(
                $paymentIntent->id,
                $reference,
                'verification',
                'failed',
                ['gateway_status' => $response->status()],
                'Gateway verification request failed'
            );

            return [
                'success' => false,
                'error' => 'Failed to verify with gateway',
                'code' => 'gateway_error',
            ];
        }

        $gatewayData = $response->json('data');

        if (!$gatewayData) {
            return [
                'success' => false,
                'error' => 'Invalid gateway response',
                'code' => 'gateway_error',
            ];
        }

        $validationError = $this->validateGatewayResponse($paymentIntent, $gatewayData);

        if ($validationError) {
            $this->logPaymentEvent(
                $paymentIntent->id,
                $reference,
                'verification',
                'rejected',
                ['gateway_data' => $gatewayData],
                $validationError
            );

            $paymentIntent->markAsFailed();

            return [
                'success' => false,
                'error' => $validationError,
                'code' => 'validation_failed',
            ];
        }

        if ($gatewayData['status'] === 'success') {
            return $this->processSuccessfulPayment($paymentIntent, $gatewayData);
        }

        Cache::put($cacheKey, ['status' => $gatewayData['status']], self::VERIFICATION_CACHE_TTL);

        return [
            'success' => false,
            'payment' => $paymentIntent,
            'message' => 'Payment not completed',
            'gateway_status' => $gatewayData['status'],
        ];
    }

    public function handleWebhook(array $payload): array
    {
        $eventId = $payload['event'] ?? '';
        $data = $payload['data'] ?? [];
        $reference = $data['reference'] ?? '';
        $gatewayTransactionId = $data['id'] ?? 'unknown';

        $lockKey = 'webhook_lock:' . $reference . ':' . $gatewayTransactionId;

        if (Cache::has($lockKey)) {
            $this->logPaymentEvent(
                null,
                $reference,
                'webhook',
                'duplicate',
                ['event' => $eventId, 'gateway_id' => $gatewayTransactionId],
                'Duplicate webhook ignored'
            );

            return ['success' => true, 'message' => 'Already processed'];
        }

        Cache::put($lockKey, true, self::WEBHOOK_LOCK_TTL);

        $this->logPaymentEvent(
            null,
            $reference,
            'webhook',
            'received',
            ['event' => $eventId, 'status' => $data['status'] ?? 'unknown'],
            null
        );

        return match ($eventId) {
            'charge.success' => $this->handleChargeSuccess($data),
            'charge.failed' => $this->handleChargeFailed($data),
            default => [
                'success' => true,
                'message' => 'Event ignored: ' . $eventId,
            ],
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
                $this->logPaymentEvent(
                    $paymentIntent->id,
                    $reference,
                    'webhook_charge_success',
                    'duplicate',
                    ['gateway_data' => $data],
                    'Payment already processed'
                );

                return ['success' => true, 'message' => 'Already processed'];
            }

            $this->logPaymentEvent(
                null,
                $reference,
                'webhook_charge_success',
                'not_found',
                ['gateway_data' => $data],
                'Webhook for unknown payment reference'
            );

            return ['success' => false, 'error' => 'Payment not found'];
        }

        $validationError = $this->validateGatewayResponse($paymentIntent, $data);

        if ($validationError) {
            $this->logPaymentEvent(
                $paymentIntent->id,
                $reference,
                'webhook_charge_success',
                'rejected',
                ['gateway_data' => $data],
                $validationError
            );

            return ['success' => false, 'error' => $validationError];
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

        $this->logPaymentEvent(
            $paymentIntent->id,
            $reference,
            'webhook_charge_failed',
            'failed',
            ['gateway_response' => $data['gateway_response'] ?? 'Unknown'],
            'Payment failed via webhook'
        );

        return ['success' => true];
    }

    public function attachBoostAfterPayment(PaymentIntent $paymentIntent): array
    {
        if ($paymentIntent->ad_id === null) {
            $this->logPaymentEvent(
                $paymentIntent->id,
                $paymentIntent->reference,
                'boost_activation',
                'failed',
                [],
                'No ad associated with payment'
            );

            return [
                'success' => false,
                'error' => 'No ad associated with payment',
            ];
        }

        $metadata = $paymentIntent->metadata ?? [];
        $boostType = $metadata['boost_type'] ?? 'top';
        $durationDays = $metadata['duration_days'] ?? 7;

        if (!in_array($boostType, ['top', 'featured', 'highlight'])) {
            $this->logPaymentEvent(
                $paymentIntent->id,
                $paymentIntent->reference,
                'boost_activation',
                'rejected',
                ['boost_type' => $boostType],
                'Invalid boost type in metadata'
            );

            return [
                'success' => false,
                'error' => 'Invalid boost type',
            ];
        }

        if (!in_array((int) $durationDays, [1, 3, 7, 14, 30])) {
            $this->logPaymentEvent(
                $paymentIntent->id,
                $paymentIntent->reference,
                'boost_activation',
                'rejected',
                ['duration_days' => $durationDays],
                'Invalid duration in metadata'
            );

            return [
                'success' => false,
                'error' => 'Invalid duration',
            ];
        }

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

        $this->logPaymentEvent(
            $paymentIntent->id,
            $paymentIntent->reference,
            'boost_activation',
            'success',
            [
                'ad_id' => $paymentIntent->ad_id,
                'boost_id' => $boost->id,
                'boost_type' => $boostType,
            ],
            null
        );

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
        $webhookSecret = $this->getWebhookSecret();

        if (empty($webhookSecret)) {
            Log::error('Webhook secret not configured');

            return false;
        }

        $expectedHash = hash_hmac('sha512', $payload, $webhookSecret);

        return hash_equals($expectedHash, $signature);
    }

    public function getPublicConfig(): array
    {
        return [
            'gateway' => self::GATEWAY,
            'public_key' => $this->getPublicKey(),
        ];
    }

    protected function validateGatewayResponse(PaymentIntent $paymentIntent, array $gatewayData): ?string
    {
        $expectedSubunit = $this->toSubunit((float) $paymentIntent->amount, $paymentIntent->currency);
        $gatewayAmount = (int) ($gatewayData['amount'] ?? 0);

        if ($gatewayAmount > 0 && $gatewayAmount !== $expectedSubunit) {
            $this->logPaymentEvent(
                $paymentIntent->id,
                $paymentIntent->reference,
                'amount_validation',
                'mismatch',
                [
                    'expected_amount' => $expectedSubunit,
                    'gateway_amount' => $gatewayAmount,
                    'currency' => $paymentIntent->currency,
                ],
                'Amount mismatch detected'
            );

            return 'Payment amount does not match expected amount';
        }

        $gatewayCurrency = $gatewayData['currency'] ?? null;

        if ($gatewayCurrency && strtoupper($gatewayCurrency) !== strtoupper($paymentIntent->currency)) {
            $this->logPaymentEvent(
                $paymentIntent->id,
                $paymentIntent->reference,
                'currency_validation',
                'mismatch',
                [
                    'expected_currency' => $paymentIntent->currency,
                    'gateway_currency' => $gatewayCurrency,
                ],
                'Currency mismatch detected'
            );

            return 'Payment currency does not match expected currency';
        }

        $gatewayMetadata = $gatewayData['metadata'] ?? [];
        $localMetadata = $paymentIntent->metadata ?? [];

        if ($paymentIntent->type === 'boost') {
            if (!empty($gatewayMetadata['boost_type']) && !empty($localMetadata['boost_type'])) {
                if ($gatewayMetadata['boost_type'] !== $localMetadata['boost_type']) {
                    return 'Boost type mismatch between gateway and local record';
                }
            }

            if (!empty($gatewayMetadata['duration_days']) && !empty($localMetadata['duration_days'])) {
                if ((int) $gatewayMetadata['duration_days'] !== (int) $localMetadata['duration_days']) {
                    return 'Duration mismatch between gateway and local record';
                }
            }
        }

        $gatewayUserId = $gatewayMetadata['user_id'] ?? null;

        if ($gatewayUserId && (int) $gatewayUserId !== $paymentIntent->user_id) {
            $this->logPaymentEvent(
                $paymentIntent->id,
                $paymentIntent->reference,
                'user_validation',
                'mismatch',
                [
                    'expected_user_id' => $paymentIntent->user_id,
                    'gateway_user_id' => $gatewayUserId,
                ],
                'User ID mismatch detected'
            );

            return 'Payment user mismatch';
        }

        return null;
    }

    protected function processSuccessfulPayment(PaymentIntent $paymentIntent, array $gatewayData): array
    {
        if ($paymentIntent->isPaid()) {
            $this->logPaymentEvent(
                $paymentIntent->id,
                $paymentIntent->reference,
                'process_successful',
                'duplicate',
                ['gateway_data' => $gatewayData],
                'Payment already marked as paid, skipping activation'
            );

            return [
                'success' => true,
                'payment' => $paymentIntent,
                'message' => 'Already processed',
            ];
        }

        return DB::transaction(function () use ($paymentIntent, $gatewayData) {
            $paymentIntent->markAsPaid();
            $paymentIntent->update([
                'gateway_reference' => $gatewayData['reference'] ?? $paymentIntent->gateway_reference,
                'gateway_response' => $gatewayData,
                'processed_webhook_id' => $gatewayData['id'] ?? $paymentIntent->processed_webhook_id,
            ]);

            $cacheKey = 'payment_verify:' . $paymentIntent->reference;
            Cache::put($cacheKey, ['status' => 'paid'], self::VERIFICATION_CACHE_TTL);

            if ($paymentIntent->type === 'boost') {
                $this->attachBoostAfterPayment($paymentIntent);
            }

            $this->logPaymentEvent(
                $paymentIntent->id,
                $paymentIntent->reference,
                'process_successful',
                'success',
                [
                    'type' => $paymentIntent->type,
                    'amount' => $paymentIntent->amount,
                    'currency' => $paymentIntent->currency,
                ],
                null
            );

            Log::info('Payment confirmed via gateway', [
                'reference' => $paymentIntent->reference,
                'type' => $paymentIntent->type,
                'amount' => $paymentIntent->amount,
                'currency' => $paymentIntent->currency,
                'gateway_amount' => $gatewayData['amount'] ?? null,
            ]);

            return [
                'success' => true,
                'payment' => $paymentIntent,
            ];
        });
    }

    protected function logPaymentEvent(
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
                'ip_address' => request()?->ip(),
                'notes' => $notes,
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to write payment log', [
                'event_type' => $eventType,
                'status' => $status,
                'error' => $e->getMessage(),
            ]);
        }
    }

    protected function toSubunit(float $amount, string $currency): int
    {
        return in_array(strtoupper($currency), ['NGN', 'GHS', 'KES', 'ZAR'])
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
