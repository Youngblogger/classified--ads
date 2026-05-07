<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaymentLog;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentWebhookController extends Controller
{
    protected PaymentService $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    public function handlePaystackWebhook(Request $request)
    {
        $signature = $request->header('X-Paystack-Signature');

        if (!$signature) {
            Log::warning('Webhook received without signature', [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            $this->logSuspiciousAttempt($request, 'missing_signature');

            return response()->json(['error' => 'No signature provided'], 401);
        }

        $rawPayload = $request->getContent();

        if (!$this->paymentService->validateWebhookSignature($rawPayload, $signature)) {
            Log::warning('Invalid webhook signature detected', [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            $this->logSuspiciousAttempt($request, 'invalid_signature');

            return response()->json(['error' => 'Invalid signature'], 403);
        }

        $payload = $request->all();

        if (!isset($payload['event']) || !isset($payload['data'])) {
            Log::warning('Malformed webhook payload', [
                'ip' => $request->ip(),
            ]);

            return response()->json(['error' => 'Invalid payload'], 400);
        }

        $reference = $payload['data']['reference'] ?? 'unknown';

        Log::info('Webhook signature verified', [
            'event' => $payload['event'],
            'reference' => $reference,
        ]);

        $result = $this->paymentService->handleWebhook($payload);

        if (!$result['success']) {
            return response()->json(['error' => $result['error'] ?? 'Processing failed'], 400);
        }

        return response()->json(['message' => 'Webhook processed']);
    }

    protected function logSuspiciousAttempt(Request $request, string $reason): void
    {
        try {
            PaymentLog::create([
                'reference' => null,
                'event_type' => 'webhook_security',
                'status' => 'rejected',
                'payload' => [
                    'reason' => $reason,
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ],
                'ip_address' => $request->ip(),
                'notes' => 'Suspicious webhook attempt: ' . $reason,
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to log suspicious webhook attempt: ' . $e->getMessage());
        }
    }
}
