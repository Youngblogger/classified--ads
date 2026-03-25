<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentWebhookController extends Controller
{
    public function handlePaystackWebhook(Request $request)
    {
        $secret = config('services.paystack.secret_key');
        
        // Verify webhook signature
        $signature = $request->header('x-paystack-signature');
        $payload = $request->getContent();
        
        if ($signature !== hash_hmac('sha512', $payload, $secret)) {
            Log::warning('Paystack webhook signature verification failed', [
                'expected' => hash_hmac('sha512', $payload, $secret),
                'received' => $signature,
            ]);
            return response()->json(['message' => 'Invalid signature'], 401);
        }

        $event = $request->event;
        $data = $request->data;

        Log::info("Paystack webhook: {$event}", ['reference' => $data['reference'] ?? null]);

        switch ($event) {
            case 'charge.success':
                $this->handleSuccessfulPayment($data);
                break;
                
            case 'charge.failed':
                $this->handleFailedPayment($data);
                break;
                
            case 'payment.session.completed':
                $this->handlePaymentSessionCompleted($data);
                break;
                
            default:
                Log::info("Unhandled Paystack event: {$event}");
        }

        return response()->json(['received' => true]);
    }

    protected function handleSuccessfulPayment(array $data): void
    {
        $reference = $data['reference'];
        $amount = $data['amount'] / 100; // Convert from kobo to naira
        $customerEmail = $data['customer']['email'] ?? null;

        // Check for duplicate transaction
        $existingTransaction = Transaction::where('reference', $reference)
            ->where('status', 'success')
            ->first();
            
        if ($existingTransaction) {
            Log::info("Duplicate Paystack payment detected: {$reference}");
            return;
        }

        // Find user by email or look for pending transaction
        $user = \App\Models\User::where('email', $customerEmail)->first();
        
        if (!$user) {
            Log::error("Paystack webhook: User not found for email {$customerEmail}");
            return;
        }

        // Create or get wallet
        $wallet = Wallet::firstOrCreate(
            ['user_id' => $user->id],
            ['balance' => 0, 'pending_balance' => 0, 'currency' => 'NGN']
        );

        // Process payment in atomic transaction
        DB::transaction(function () use ($wallet, $amount, $reference, $data) {
            $balanceBefore = $wallet->balance;
            
            // Update wallet balance
            $wallet->increment('balance', $amount);
            $wallet->refresh();
            
            // Create transaction record
            Transaction::create([
                'user_id' => $wallet->user_id,
                'wallet_id' => $wallet->id,
                'type' => 'credit',
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $wallet->balance,
                'reference' => $reference,
                'description' => 'Wallet funding via Paystack',
                'status' => 'success',
                'payment_method' => 'paystack',
                'metadata' => json_encode($data),
                'processed_at' => now(),
            ]);
        });

        Log::info("Wallet funded successfully: {$reference} - ₦{$amount}");
    }

    protected function handleFailedPayment(array $data): void
    {
        $reference = $data['reference'];
        
        // Find pending transaction and mark as failed
        $transaction = Transaction::where('reference', $reference)
            ->where('status', 'pending')
            ->first();
            
        if ($transaction) {
            $transaction->update([
                'status' => 'failed',
                'processed_at' => now(),
                'metadata' => json_encode($data),
            ]);
        }
        
        Log::info("Payment failed: {$reference}");
    }

    protected function handlePaymentSessionCompleted(array $data): void
    {
        // Handle payment session completed event
        $this->handleSuccessfulPayment($data);
    }
}
