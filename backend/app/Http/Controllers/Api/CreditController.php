<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CreditService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CreditController extends Controller
{
    public function __construct(
        private CreditService $creditService
    ) {}

    public function balance(Request $request): JsonResponse
    {
        $balance = $this->creditService->getBalance($request->user()->id);
        $balanceModel = $this->creditService->getOrCreateBalance($request->user()->id);

        return response()->json([
            'balance' => $balance,
            'total_earned' => $balanceModel->total_earned,
            'total_spent' => $balanceModel->total_spent,
        ]);
    }

    public function history(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 20);
        $history = $this->creditService->getHistory($request->user()->id, $perPage);

        return response()->json($history);
    }

    public function features(): JsonResponse
    {
        $features = $this->creditService->getFeatures();

        return response()->json([
            'features' => $features,
        ]);
    }

    public function use(Request $request): JsonResponse
    {
        $request->validate([
            'feature' => 'required|string|in:boost_ad,featured_listing,top_placement',
            'ad_id' => 'nullable|integer',
        ]);

        $featureCosts = [
            'boost_ad' => CreditService::COST_BOOST_AD,
            'featured_listing' => CreditService::COST_FEATURED_LISTING,
            'top_placement' => CreditService::COST_TOP_PLACEMENT,
        ];

        $cost = $featureCosts[$request->feature];
        $reason = match($request->feature) {
            'boost_ad' => 'Boost Ad',
            'featured_listing' => 'Featured Listing',
            'top_placement' => 'Top Placement',
        };

        $result = $this->creditService->spendCredits(
            $request->user()->id,
            $cost,
            $reason,
            $request->ad_id
        );

        return response()->json($result, $result['success'] ? 200 : 400);
    }

    public function checkBalance(Request $request): JsonResponse
    {
        $request->validate([
            'feature' => 'required|string|in:boost_ad,featured_listing,top_placement',
        ]);

        $cost = $this->creditService->getFeatureCost($request->feature);
        $currentBalance = $this->creditService->getBalance($request->user()->id);

        return response()->json([
            'can_afford' => $currentBalance >= $cost,
            'current_balance' => $currentBalance,
            'required' => $cost,
        ]);
    }
}
