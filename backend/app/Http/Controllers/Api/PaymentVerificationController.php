<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaymentIntent;
use App\Models\Transaction;
use App\Services\PaymentService;
use App\Services\PendingPaymentExpiryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentVerificationController extends Controller
{
    protected PaymentService $paymentService;
    protected PendingPaymentExpiryService $expiryService;

    public function __construct(PaymentService $paymentService, PendingPaymentExpiryService $expiryService)
    {
        $this->paymentService = $paymentService;
        $this->expiryService = $expiryService;
    }

    public function verify(Request $request)
    {
        $validated = $request->validate([
            'reference' => 'required|string|max:255',
        ]);

        $reference = $validated['reference'];

        $result = $this->paymentService->verifyPayment($reference);

        if (!$result['success']) {
            $status = match ($result['code'] ?? '') {
                'payment_not_found' => 404,
                'pending' => 202,
                default => 400,
            };

            return response()->json([
                'success' => false,
                'code' => $result['code'] ?? 'unknown',
                'message' => $result['error'] ?? $result['message'] ?? 'Verification failed',
            ], $status);
        }

        $payment = $result['payment'];

        return response()->json([
            'success' => true,
            'payment' => [
                'id' => $payment->id,
                'reference' => $payment->reference,
                'type' => $payment->type,
                'status' => $payment->status,
                'amount' => $payment->amount,
                'currency' => $payment->currency,
                'ad_id' => $payment->ad_id,
                'metadata' => $payment->metadata,
                'paid_at' => $payment->paid_at,
            ],
        ]);
    }

    public function status(Request $request)
    {
        $validated = $request->validate([
            'reference' => 'required|string|max:255',
        ]);

        $paymentIntent = PaymentIntent::where('reference', $validated['reference'])->first();

        if (!$paymentIntent) {
            return response()->json([
                'success' => false,
                'message' => 'Payment not found',
            ], 404);
        }

        $boostStatus = null;

        if ($paymentIntent->type === 'boost' && $paymentIntent->isPaid()) {
            $activeBoost = \App\Models\BoostedAd::where('ad_id', $paymentIntent->ad_id)
                ->where('payment_reference', $paymentIntent->reference)
                ->active()
                ->first();

            if ($activeBoost) {
                $boostStatus = [
                    'boost_type' => $activeBoost->boost_type,
                    'start_time' => $activeBoost->start_time,
                    'end_time' => $activeBoost->end_time,
                    'days_remaining' => now()->diffInDays($activeBoost->end_time, false),
                ];
            }
        }

        return response()->json([
            'success' => true,
            'payment' => [
                'id' => $paymentIntent->id,
                'reference' => $paymentIntent->reference,
                'type' => $paymentIntent->type,
                'status' => $paymentIntent->status,
                'amount' => $paymentIntent->amount,
                'currency' => $paymentIntent->currency,
                'ad_id' => $paymentIntent->ad_id,
                'expires_at' => $paymentIntent->expires_at?->toIso8601String()
                    ?? $paymentIntent->created_at->addMinutes($this->expiryService->getExpiryMinutes())->toIso8601String(),
                'paid_at' => $paymentIntent->paid_at,
            ],
            'boost_status' => $boostStatus,
        ]);
    }

    public function pendingPayments(Request $request)
    {
        $user = $request->user();
        $payments = $this->expiryService->getPendingPayments($user->id);

        return response()->json([
            'success' => true,
            'data' => $payments,
        ]);
    }

    public function cancelPayment(Request $request, int $paymentIntentId)
    {
        $user = $request->user();
        $result = $this->expiryService->cancelPendingPaymentIntent($paymentIntentId, $user->id);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['error'],
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => $result['message'],
        ]);
    }
}
