<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use App\Models\PromotionPlan;
use App\Models\Wallet;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PromotionController extends Controller
{
    public function plans()
    {
        $plans = PromotionPlan::where('is_active', true)->orderBy('price')->get();
        return response()->json($plans);
    }

    public function buy(Request $request)
    {
        $validated = $request->validate([
            'plan_id' => 'required|exists:promotion_plans,id',
            'ad_id' => 'required|exists:ads,id',
            'payment_method' => 'sometimes|string|in:wallet,card,paystack',
        ]);

        $plan = PromotionPlan::findOrFail($validated['plan_id']);
        $ad = \App\Models\Ad::findOrFail($validated['ad_id']);
        $user = $request->user();
        $paymentMethod = $validated['payment_method'] ?? 'wallet';

        if ($paymentMethod === 'wallet') {
            // Check wallet balance and deduct
            $wallet = Wallet::firstOrCreate(
                ['user_id' => $user->id],
                ['balance' => 0, 'pending_balance' => 0, 'currency' => 'NGN']
            );

            if ($wallet->balance < $plan->price) {
                return response()->json([
                    'message' => 'Insufficient balance. Please fund your wallet.',
                    'code' => 'insufficient_balance',
                    'required' => $plan->price,
                    'available' => $wallet->balance,
                ], 400);
            }

            // Atomic debit from wallet
            $transaction = $wallet->atomicDebit(
                $plan->price,
                "Ad Promotion: {$plan->name}",
                'PROMO_' . Str::uuid()->toString(),
                [
                    'plan_id' => $plan->id,
                    'ad_id' => $ad->id,
                    'plan_name' => $plan->name,
                ]
            );

            if (!$transaction) {
                return response()->json(['message' => 'Failed to process payment'], 500);
            }

            // Create promotion
            $promotion = Promotion::create([
                'user_id' => $user->id,
                'ad_id' => $ad->id,
                'plan_id' => $plan->id,
                'amount_paid' => $plan->price,
                'status' => 'active',
                'started_at' => now(),
                'expires_at' => now()->addDays($plan->duration_days),
            ]);

            // Update ad as featured
            $ad->update(['is_featured' => true]);

            return response()->json([
                'message' => 'Your ad has been promoted successfully',
                'promotion' => $promotion->load(['ad', 'plan']),
                'wallet_balance' => $wallet->fresh()->balance,
            ]);
        }

        // For card/paystack payment, return payment initialization
        $reference = 'PROMO_' . Str::uuid()->toString();
        
        // Create pending promotion
        $promotion = Promotion::create([
            'user_id' => $user->id,
            'ad_id' => $ad->id,
            'plan_id' => $plan->id,
            'amount_paid' => $plan->price,
            'status' => 'pending',
        ]);

        return response()->json([
            'reference' => $reference,
            'amount' => $plan->price,
            'promotion_id' => $promotion->id,
        ]);
    }

    public function myPromotions(Request $request)
    {
        $promotions = Promotion::with(['ad', 'plan'])
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($promotions);
    }

    public function adPromotions(Request $request, $adId)
    {
        $promotions = Promotion::with(['plan'])
            ->where('ad_id', $adId)
            ->where('status', 'active')
            ->get();

        return response()->json($promotions);
    }

    public function cancelPromotion(Request $request, $id)
    {
        $promotion = Promotion::where('user_id', $request->user()->id)->findOrFail($id);
        
        if ($promotion->status !== 'active') {
            return response()->json(['message' => 'Cannot cancel this promotion'], 400);
        }

        $promotion->update(['status' => 'cancelled']);

        return response()->json(['message' => 'Promotion cancelled']);
    }

    // Admin methods below
    public function index(Request $request)
    {
        $this->authorizeAdmin($request);

        $query = Promotion::with(['ad', 'plan']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->ad_id) {
            $query->where('ad_id', $request->ad_id);
        }

        $promotions = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($promotions);
    }

    public function createPlan(Request $request)
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration_days' => 'required|integer|min:1',
            'features' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $plan = PromotionPlan::create($validated);
        return response()->json($plan, 201);
    }

    public function updatePlan(Request $request, $id)
    {
        $this->authorizeAdmin($request);

        $plan = PromotionPlan::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'duration_days' => 'sometimes|integer|min:1',
            'features' => 'nullable|array',
            'is_active' => 'sometimes|boolean',
        ]);

        $plan->update($validated);
        return response()->json($plan);
    }

    public function deletePlan($id, Request $request)
    {
        $this->authorizeAdmin($request);

        $plan = PromotionPlan::findOrFail($id);
        $plan->delete();
        return response()->json(['message' => 'Plan deleted']);
    }

    public function approve($id, Request $request)
    {
        $this->authorizeAdmin($request);

        $promotion = Promotion::with(['ad', 'plan'])->findOrFail($id);
        $promotion->update(['status' => 'active']);
        
        NotificationService::promotionActivated($promotion);
        
        return response()->json($promotion);
    }

    public function cancel($id, Request $request)
    {
        $this->authorizeAdmin($request);

        $promotion = Promotion::with(['ad'])->findOrFail($id);
        $promotion->update(['status' => 'cancelled']);
        
        return response()->json($promotion);
    }

    public function delete($id, Request $request)
    {
        $this->authorizeAdmin($request);

        $promotion = Promotion::findOrFail($id);
        $promotion->delete();
        return response()->json(['message' => 'Promotion deleted']);
    }

    public function stats(Request $request)
    {
        $this->authorizeAdmin($request);

        $stats = [
            'total' => Promotion::count(),
            'active' => Promotion::where('status', 'active')->count(),
            'expired' => Promotion::where('status', 'expired')->count(),
            'cancelled' => Promotion::where('status', 'cancelled')->count(),
            'total_revenue' => Promotion::where('status', 'active')->sum('amount_paid'),
        ];

        return response()->json($stats);
    }

    protected function authorizeAdmin(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            abort(403, 'Unauthorized');
        }
    }
}
