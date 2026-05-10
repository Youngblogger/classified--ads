<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use App\Models\Transaction;
use App\Services\CloudinaryService;
use App\Services\FraudDetectionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class WalletController extends Controller
{
    public function index(Request $request)
    {
        $wallet = Wallet::firstOrCreate(
            ['user_id' => $request->user()->id],
            ['balance' => 0, 'pending_balance' => 0, 'currency' => 'NGN']
        );

        $transactions = $request->user()->transactions()
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'wallet' => $wallet,
            'transactions' => $transactions,
        ]);
    }

    public function balance(Request $request)
    {
        $wallet = Wallet::firstOrCreate(
            ['user_id' => $request->user()->id],
            ['balance' => 0, 'pending_balance' => 0, 'currency' => 'NGN']
        );

        return response()->json([
            'balance' => $wallet->balance,
            'available_balance' => $wallet->available_balance,
            'pending_balance' => $wallet->pending_balance,
        ]);
    }

    public function fund(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:100',
            'method' => 'required|string|in:paystack,bank_transfer',
        ]);

        $user = $request->user();
        $amount = (float) $validated['amount'];
        $method = $validated['method'];

        $wallet = Wallet::firstOrCreate(
            ['user_id' => $user->id],
            ['balance' => 0, 'pending_balance' => 0, 'currency' => 'NGN']
        );

        if ($method === 'paystack') {
            return $this->initiatePaystackPayment($user, $wallet, $amount);
        } elseif ($method === 'bank_transfer') {
            return $this->initiateBankTransfer($user, $wallet, $amount);
        }

        return response()->json(['message' => 'Invalid payment method'], 400);
    }

    protected function initiatePaystackPayment($user, Wallet $wallet, float $amount)
    {
        $reference = 'WAL_' . Str::uuid()->toString();
        $amountInKobo = (int) ($amount * 100);

        try {
            $response = Http::withToken(config('services.paystack.secret_key'))
                ->post('https://api.paystack.co/transaction/initialize', [
                    'email' => $user->email,
                    'amount' => $amountInKobo,
                    'reference' => $reference,
                    'callback_url' => config('app.frontend_url', 'http://127.0.0.1:3000') . '/dashboard/wallet?verified=true',
                    'metadata' => [
                        'user_id' => $user->id,
                        'wallet_id' => $wallet->id,
                        'type' => 'wallet_funding',
                    ],
                ]);

            $data = $response->json();

            if (!$data['status']) {
                Log::error('Paystack initialization failed', $data);
                return response()->json([
                    'message' => $data['message'] ?? 'Failed to initialize payment',
                ], 400);
            }

            // Track pending balance
            $wallet->increment('pending_balance', $amount);

            // Create pending transaction
            Transaction::create([
                'user_id' => $user->id,
                'wallet_id' => $wallet->id,
                'type' => 'credit',
                'amount' => $amount,
                'balance_before' => $wallet->balance,
                'balance_after' => $wallet->balance,
                'reference' => $reference,
                'description' => 'Wallet funding - pending',
                'status' => 'pending',
                'payment_method' => 'paystack',
            ]);

            return response()->json([
                'reference' => $reference,
                'authorization_url' => $data['data']['authorization_url'],
                'amount' => $amount,
            ]);
        } catch (\Exception $e) {
            Log::error('Paystack payment initialization error', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to initialize payment'], 500);
        }
    }

    protected function initiateBankTransfer($user, Wallet $wallet, float $amount)
    {
        $reference = 'WAL_BT_' . Str::uuid()->toString();
        
        // Generate unique account details
        $accountNumber = rand(1000000000, 9999999999);
        
        // Run fraud detection
        $fraudService = new FraudDetectionService();
        $fraudAnalysis = $fraudService->analyze([
            'user_id' => $user->id,
            'amount' => $amount,
            'reference' => $reference,
        ]);
        
        // Create pending transaction
        $transaction = Transaction::create([
            'user_id' => $user->id,
            'wallet_id' => $wallet->id,
            'type' => 'credit',
            'amount' => $amount,
            'balance_before' => $wallet->balance,
            'balance_after' => $wallet->balance,
            'reference' => $reference,
            'description' => 'Bank transfer - pending',
            'status' => 'pending',
            'payment_method' => 'bank_transfer',
            'is_suspicious' => $fraudAnalysis['is_suspicious'],
            'metadata' => json_encode([
                'risk_flags' => $fraudAnalysis['flags'],
                'risk_level' => $fraudAnalysis['risk_level'],
            ]),
        ]);

        return response()->json([
            'reference' => $reference,
            'amount' => $amount,
            'is_suspicious' => $fraudAnalysis['is_suspicious'],
            'warning' => $fraudAnalysis['is_suspicious'] ? 'This transaction has been flagged for review' : null,
            'bank_details' => [
                'bank_name' => 'First Bank of Nigeria',
                'account_number' => $accountNumber,
                'account_name' => 'iList Wallet Funding',
            ],
            'instructions' => [
                '1. Transfer exactly ₦' . number_format($amount, 2) . ' to the account number above',
                '2. Use your email (' . $user->email . ') as the payment reference',
                '3. Upload your payment proof after transfer',
                '4. Your wallet will be credited within 24 hours after verification',
            ],
        ]);
    }

    public function verify(Request $request)
    {
        $validated = $request->validate([
            'reference' => 'required|string',
        ]);

        $reference = $validated['reference'];

        // Check if already processed
        $existingTransaction = Transaction::where('reference', $reference)
            ->where('status', 'success')
            ->first();

        if ($existingTransaction) {
            return response()->json(['message' => 'Transaction already processed']);
        }

        try {
            $response = Http::withToken(config('services.paystack.secret_key'))
                ->get("https://api.paystack.co/transaction/verify/{$reference}");

            $data = $response->json();

            if (!$data['status'] || $data['data']['status'] !== 'success') {
                return response()->json(['message' => 'Payment verification failed'], 400);
            }

            $transaction = Transaction::where('reference', $reference)
                ->where('status', 'pending')
                ->first();

            if (!$transaction) {
                return response()->json(['message' => 'Transaction not found'], 404);
            }

            $wallet = Wallet::find($transaction->wallet_id);
            if (!$wallet) {
                return response()->json(['message' => 'Wallet not found'], 404);
            }

            // Process the payment
            $balanceBefore = $wallet->balance;
            $wallet->increment('balance', $transaction->amount);
            $wallet->decrement('pending_balance', $transaction->amount);
            $wallet->refresh();

            // Update transaction
            $transaction->update([
                'status' => 'success',
                'balance_before' => $balanceBefore,
                'balance_after' => $wallet->balance,
                'processed_at' => now(),
            ]);

            return response()->json([
                'message' => 'Wallet funded successfully',
                'wallet' => $wallet->fresh(),
                'transaction' => $transaction->fresh(),
            ]);
        } catch (\Exception $e) {
            Log::error('Paystack verification error', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Verification failed'], 500);
        }
    }

    public function bankTransferProof(Request $request)
    {
        $validated = $request->validate([
            'reference' => 'required|string',
            'proof' => 'required|file|mimes:jpg,jpeg,png|max:2048',
        ]);

        $transaction = Transaction::where('reference', $validated['reference'])
            ->where('status', 'pending')
            ->where('payment_method', 'bank_transfer')
            ->first();

        if (!$transaction) {
            return response()->json(['message' => 'Transaction not found'], 404);
        }

        // Store the proof image
        $cloudinary = new CloudinaryService();
        $proofFile = $request->file('proof');
        $tempPath = $proofFile->getPathname();
        $publicId = 'bank-proofs/' . $transaction->reference . '_' . time();

        $uploadResult = $cloudinary->uploadImage($tempPath, [
            'folder' => 'classified-ads/bank-proofs',
            'public_id' => $publicId,
        ]);

        if (!$uploadResult['success']) {
            return response()->json([
                'message' => 'Failed to upload proof: ' . ($uploadResult['error'] ?? 'Unknown error'),
            ], 500);
        }
        
        // Get image hash for fraud detection (use local temp file before upload)
        $fraudService = new FraudDetectionService();
        $proofHash = $fraudService->getImageHash($proofFile);
        
        // Run fraud detection on the proof
        $fraudAnalysis = $fraudService->analyze([
            'user_id' => $transaction->user_id,
            'amount' => $transaction->amount,
            'reference' => $transaction->reference,
            'proof_hash' => $proofHash,
            'filename' => $proofFile->getClientOriginalName(),
        ]);

        $metadata = json_decode($transaction->metadata ?? '{}', true);
        $metadata['proof_path'] = $uploadResult['public_id'];
        $metadata['proof_public_id'] = $uploadResult['public_id'];
        $metadata['proof_hash'] = $proofHash;
        $metadata['risk_flags'] = array_merge(
            $metadata['risk_flags'] ?? [],
            $fraudAnalysis['flags']
        );
        $metadata['risk_level'] = $fraudAnalysis['risk_level'];

        $transaction->update([
            'proof_image_url' => $uploadResult['secure_url'],
            'is_suspicious' => $fraudAnalysis['is_suspicious'],
            'metadata' => json_encode($metadata),
        ]);

        return response()->json([
            'message' => 'Payment proof uploaded successfully. Your wallet will be credited after verification.',
            'is_suspicious' => $fraudAnalysis['is_suspicious'],
            'warning' => $fraudAnalysis['is_suspicious'] ? 'This transaction requires manual review' : null,
        ]);
    }

    public function checkBalance(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
        ]);

        $wallet = Wallet::firstOrCreate(
            ['user_id' => $request->user()->id],
            ['balance' => 0, 'pending_balance' => 0, 'currency' => 'NGN']
        );

        $hasEnough = $wallet->balance >= (float) $validated['amount'];

        return response()->json([
            'has_enough_balance' => $hasEnough,
            'balance' => $wallet->balance,
            'required' => (float) $validated['amount'],
        ]);
    }
}
