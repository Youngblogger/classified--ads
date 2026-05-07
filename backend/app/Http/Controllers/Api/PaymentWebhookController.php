<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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
            Log::warning('Webhook received without signature');
            return response()->json(['error' => 'No signature provided'], 401);
        }

        $rawPayload = $request->getContent();

        if (!$this->paymentService->validateWebhookSignature($rawPayload, $signature)) {
            Log::warning('Invalid webhook signature detected', [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
            return response()->json(['error' => 'Invalid signature'], 403);
        }

        $payload = $request->all();

        if (!isset($payload['event']) || !isset($payload['data'])) {
            Log::warning('Malformed webhook payload');
            return response()->json(['error' => 'Invalid payload'], 400);
        }

        $result = $this->paymentService->handleWebhook($payload);

        if (!$result['success']) {
            return response()->json(['error' => $result['error'] ?? 'Processing failed'], 400);
        }

        return response()->json(['message' => 'Webhook processed']);
    }
}
