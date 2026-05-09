<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BoostPlan;
use App\Models\BoostedAd;
use App\Services\BoostTierService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AdminBoostController extends Controller
{
    public function plans(BoostTierService $tierService)
    {
        $plans = BoostPlan::ordered()->get();
        return response()->json(['data' => $plans]);
    }

    public function createPlan(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:50|unique:boost_plans,type',
            'price' => 'required|numeric|min:0',
            'duration_days' => 'required|integer|min:1',
            'priority_score' => 'required|integer|min:0',
            'badge_label' => 'required|string|max:50',
            'badge_icon' => 'required|string|max:50',
            'color_scheme' => 'nullable|json',
            'features' => 'nullable|json',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        if (isset($validated['color_scheme']) && is_string($validated['color_scheme'])) {
            $validated['color_scheme'] = json_decode($validated['color_scheme'], true);
        }
        if (isset($validated['features']) && is_string($validated['features'])) {
            $validated['features'] = json_decode($validated['features'], true);
        }

        $plan = BoostPlan::create($validated);

        app(BoostTierService::class)->clearPlansCache();

        return response()->json(['data' => $plan, 'message' => 'Boost plan created'], 201);
    }

    public function updatePlan(Request $request, int $id)
    {
        $plan = BoostPlan::findOrFail($id);

        $validated = $request->validate([
            'name' => 'string|max:255',
            'type' => 'string|max:50|unique:boost_plans,type,' . $id,
            'price' => 'numeric|min:0',
            'duration_days' => 'integer|min:1',
            'priority_score' => 'integer|min:0',
            'badge_label' => 'string|max:50',
            'badge_icon' => 'string|max:50',
            'color_scheme' => 'nullable|json',
            'features' => 'nullable|json',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        if (isset($validated['color_scheme']) && is_string($validated['color_scheme'])) {
            $validated['color_scheme'] = json_decode($validated['color_scheme'], true);
        }
        if (isset($validated['features']) && is_string($validated['features'])) {
            $validated['features'] = json_decode($validated['features'], true);
        }

        $plan->update($validated);

        app(BoostTierService::class)->clearPlansCache();

        return response()->json(['data' => $plan->fresh(), 'message' => 'Boost plan updated']);
    }

    public function deletePlan(int $id)
    {
        $plan = BoostPlan::findOrFail($id);

        $activeBoosts = BoostedAd::where('plan_id', $id)->active()->count();
        if ($activeBoosts > 0) {
            return response()->json([
                'error' => 'Cannot delete plan with active boosts',
                'active_boosts' => $activeBoosts,
            ], 422);
        }

        BoostedAd::where('plan_id', $id)->update(['plan_id' => null]);
        $plan->delete();

        app(BoostTierService::class)->clearPlansCache();

        return response()->json(['message' => 'Boost plan deleted']);
    }

    public function allBoosts(Request $request)
    {
        $query = BoostedAd::with(['ad.images', 'ad.category', 'user', 'plan']);

        if ($request->status) {
            if ($request->status === 'active') {
                $query->active();
            } elseif ($request->status === 'expired') {
                $query->expired();
            } else {
                $query->where('status', $request->status);
            }
        }

        if ($request->plan_type) {
            $query->where('boost_type', $request->plan_type);
        }

        $sortField = $request->sort ?? 'created_at';
        $sortDir = $request->dir ?? 'desc';
        $query->orderBy($sortField, $sortDir);

        $perPage = min((int) $request->input('per_page', 20), 100);
        $boosts = $query->paginate($perPage);

        $boosts->getCollection()->transform(function ($boost) {
            return [
                'id' => $boost->id,
                'ad_id' => $boost->ad_id,
                'user_id' => $boost->user_id,
                'plan_id' => $boost->plan_id,
                'boost_type' => $boost->boost_type,
                'plan_name' => $boost->plan?->name ?? $boost->boost_type,
                'priority_score' => $boost->priority_score,
                'start_time' => $boost->start_time?->toISOString(),
                'end_time' => $boost->end_time?->toISOString(),
                'status' => $boost->status,
                'impressions' => $boost->impressions,
                'clicks' => $boost->clicks,
                'ctr' => $boost->ctr,
                'payment_reference' => $boost->payment_reference,
                'created_at' => $boost->created_at?->toISOString(),
                'user' => $boost->user ? [
                    'id' => $boost->user->id,
                    'name' => $boost->user->name,
                    'email' => $boost->user->email,
                ] : null,
                'ad' => $boost->ad ? [
                    'id' => $boost->ad->id,
                    'title' => $boost->ad->title,
                    'slug' => $boost->ad->slug,
                    'price' => $boost->ad->price,
                    'status' => $boost->ad->status,
                    'category' => $boost->ad->category?->name,
                ] : null,
            ];
        });

        return response()->json($boosts);
    }

    public function boostSummary()
    {
        $activeCount = BoostedAd::active()->count();
        $expiredCount = BoostedAd::where('status', 'expired')->count();

        $revenue = \App\Models\PaymentIntent::where('type', 'boost')
            ->where('status', 'paid')
            ->sum('amount');

        $totalImpressions = BoostedAd::sum('impressions');
        $totalClicks = BoostedAd::sum('clicks');
        $avgCtr = $totalImpressions > 0
            ? round($totalClicks / $totalImpressions * 100, 2)
            : 0;

        $byPlan = BoostPlan::ordered()->get()->map(function ($plan) {
            $active = BoostedAd::where('plan_id', $plan->id)->active()->count();
            $allTime = BoostedAd::where('plan_id', $plan->id)->count();
            return [
                'id' => $plan->id,
                'name' => $plan->name,
                'type' => $plan->type,
                'price' => $plan->price,
                'active_boosts' => $active,
                'total_boosts' => $allTime,
            ];
        });

        return response()->json([
            'data' => [
                'active_boosts' => $activeCount,
                'expired_boosts' => $expiredCount,
                'total_revenue' => $revenue,
                'total_impressions' => $totalImpressions,
                'total_clicks' => $totalClicks,
                'average_ctr' => $avgCtr,
                'by_plan' => $byPlan,
            ],
        ]);
    }

    public function deactivateBoost(int $id)
    {
        $boost = BoostedAd::findOrFail($id);
        $boost->update(['status' => 'expired']);

        app(BoostTierService::class)->clearBoostedAdsCache();

        return response()->json(['message' => 'Boost deactivated']);
    }

    public function extendBoost(Request $request, int $id)
    {
        $validated = $request->validate([
            'extra_days' => 'required|integer|min:1|max:365',
        ]);

        $boost = BoostedAd::active()->findOrFail($id);
        $boost->update([
            'end_time' => $boost->end_time->addDays($validated['extra_days']),
        ]);

        app(BoostTierService::class)->clearBoostedAdsCache();

        return response()->json([
            'message' => 'Boost extended by ' . $validated['extra_days'] . ' days',
            'data' => [
                'new_end_time' => $boost->fresh()->end_time->toISOString(),
            ],
        ]);
    }
}
