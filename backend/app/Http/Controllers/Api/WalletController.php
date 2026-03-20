<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use App\Models\Transaction;
use Illuminate\Http\Request;

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
            ->limit(20)
            ->get();

        return response()->json([
            'wallet' => $wallet,
            'transactions' => $transactions,
        ]);
    }

    public function fund(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:100',
            'method' => 'required|string',
        ]);

        $wallet = Wallet::firstOrCreate(
            ['user_id' => $request->user()->id],
            ['balance' => 0, 'pending_balance' => 0, 'currency' => 'NGN']
        );

        $reference = 'WALLET_' . time() . '_' . rand(1000, 9999);

        return response()->json([
            'reference' => $reference,
            'amount' => $validated['amount'],
            'authorization_url' => null,
            'bank_details' => [
                'bank_name' => 'First Bank',
                'account_number' => '3081748291',
                'account_name' => 'iList Marketplace',
            ],
            'ussd' => [
                'code' => '*894*' . rand(10000, 99999) . '#',
                'bank_name' => 'First Bank',
            ],
        ]);
    }

    public function verify(Request $request)
    {
        $validated = $request->validate([
            'reference' => 'required|string',
        ]);

        $wallet = Wallet::firstOrCreate(
            ['user_id' => $request->user()->id],
            ['balance' => 0, 'pending_balance' => 0, 'currency' => 'NGN']
        );

        $wallet->increment('balance', 1000);

        Transaction::create([
            'user_id' => $request->user()->id,
            'wallet_id' => $wallet->id,
            'type' => 'credit',
            'amount' => 1000,
            'balance_before' => $wallet->balance - 1000,
            'balance_after' => $wallet->balance,
            'reference' => $validated['reference'],
            'description' => 'Wallet funding',
        ]);

        return response()->json(['message' => 'Wallet funded successfully']);
    }
}
