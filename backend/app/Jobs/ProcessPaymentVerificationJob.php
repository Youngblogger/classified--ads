<?php

namespace App\Jobs;

use App\Models\PaymentIntent;
use App\Services\MonitoringService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProcessPaymentVerificationJob implements ShouldQueue
{
    use Queueable;

    public int $timeout = 60;
    public int $tries = 5;
    public array $backoff = [10, 30, 60, 120, 300];

    public function __construct(
        private int $paymentIntentId
    ) {}

    public function handle(MonitoringService $monitoring): void
    {
        $intent = PaymentIntent::find($this->paymentIntentId);
        if (!$intent) {
            Log::warning('Payment intent not found for verification', ['id' => $this->paymentIntentId]);
            return;
        }

        if ($intent->status === 'completed') {
            return;
        }

        try {
            $reference = $intent->reference;
            $secretKey = config('services.paystack.secret_key');

            $response = Http::withToken($secretKey)
                ->get("https://api.paystack.co/transaction/verify/{$reference}");

            if ($response->successful()) {
                $data = $response->json();

                if ($data['status'] && ($data['data']['status'] ?? '') === 'success') {
                    $intent->status = 'completed';
                    $intent->verified_at = now();
                    $intent->save();

                    if ($intent->model_type === 'App\\Models\\BoostedAd' && $intent->model_id) {
                        ProcessBoostActivationJob::dispatch($intent->model_id);
                    }

                    Log::info('Payment verified successfully', [
                        'intent_id' => $intent->id,
                        'reference' => $reference,
                    ]);
                } elseif (in_array($data['data']['status'] ?? '', ['failed', 'abandoned'])) {
                    $intent->status = 'failed';
                    $intent->save();
                    Log::info('Payment verification failed', [
                        'intent_id' => $intent->id,
                        'status' => $data['data']['status'] ?? 'unknown',
                    ]);
                } else {
                    throw new \Exception('Payment still pending, will retry');
                }
            } else {
                throw new \Exception('Paystack API error: ' . $response->body());
            }
        } catch (\Throwable $e) {
            $monitoring->logError($e, ['payment_intent_id' => $this->paymentIntentId]);

            if ($this->attempts() < $this->tries) {
                $releaseDelay = $this->backoff[$this->attempts() - 1] ?? 120;
                $this->release($releaseDelay);
            } else {
                $intent->status = 'failed';
                $intent->failure_reason = $e->getMessage();
                $intent->save();
                Log::error('Payment verification exhausted', [
                    'intent_id' => $this->paymentIntentId,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    public function failed(\Throwable $e): void
    {
        Log::error('Payment verification job failed permanently', [
            'payment_intent_id' => $this->paymentIntentId,
            'error' => $e->getMessage(),
        ]);
    }
}
