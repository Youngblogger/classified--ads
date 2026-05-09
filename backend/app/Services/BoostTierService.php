<?php

namespace App\Services;

use App\Models\Ad;
use App\Models\BoostPlan;
use App\Models\BoostedAd;
use App\Models\PaymentIntent;
use App\Models\User;
use App\Events\AdBoosted;
use App\Events\BoostExpired;
use App\Events\BoostRenewed;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class BoostTierService
{
    public function getActivePlans(): array
    {
        return Cache::remember(CacheService::KEY_BOOST_PLANS, CacheService::TTL_BOOST_PLANS, function () {
            return BoostPlan::active()->ordered()->get()->toArray();
        });
    }

    public function clearPlansCache(): void
    {
        Cache::forget(CacheService::KEY_BOOST_PLANS);
    }

    public function findPlan(string $type): ?BoostPlan
    {
        return BoostPlan::where('type', $type)->where('is_active', true)->first();
    }

    public function findPlanById(int $id): ?BoostPlan
    {
        return BoostPlan::where('id', $id)->where('is_active', true)->first();
    }

    public function getBoostedAdsForListing(): array
    {
        return Cache::remember(CacheService::KEY_BOOSTED_ADS, CacheService::TTL_BOOSTED_ADS, function () {
            $activeBoosts = BoostedAd::with(['ad.images', 'ad.category', 'ad.location', 'plan'])
                ->active()
                ->byPriority()
                ->select([
                    'id', 'ad_id', 'plan_id', 'boost_type', 'priority_score',
                    'start_time', 'end_time', 'status',
                ])
                ->get();

            $boostedAdIds = [];
            $boostData = [];

            foreach ($activeBoosts as $boost) {
                if ($boost->ad && $boost->ad->status === 'active') {
                    $boostedAdIds[] = $boost->ad_id;
                    $boostData[$boost->ad_id] = [
                        'is_boosted' => true,
                        'boost_type' => $boost->boost_type,
                        'plan_id' => $boost->plan_id,
                        'plan_name' => $boost->plan?->name ?? $boost->boost_type,
                        'badge_label' => $boost->badge_label,
                        'priority_score' => $boost->priority_score,
                        'boost_end_time' => $boost->end_time?->toIso8601String(),
                    ];
                }
            }

            return [
                'boosted_ad_ids' => $boostedAdIds,
                'boost_data' => $boostData,
            ];
        });
    }

    public function clearBoostedAdsCache(): void
    {
        CacheService::clearBoostedAds();
    }

    public function getPrioritySortCallback(): callable
    {
        $boostData = $this->getBoostedAdsForListing();
        $boostDataMap = $boostData['boost_data'];

        return function ($ad) use ($boostDataMap) {
            if (!isset($boostDataMap[$ad->id])) {
                return 0;
            }
            $score = $boostDataMap[$ad->id]['priority_score'] ?? 0;
            $createdAt = $ad->created_at ? strtotime($ad->created_at) : 0;
            return $score * 100000 + $createdAt;
        };
    }

    public function expireBoosts(): int
    {
        $count = BoostedAd::where('status', 'active')
            ->where('end_time', '<=', now())
            ->update(['status' => 'expired']);

        if ($count > 0) {
            Log::info('Boosts expired via tier service', ['count' => $count]);
            $this->clearBoostedAdsCache();

            BoostedAd::where('status', 'expired')
                ->where('end_time', '<=', now())
                ->chunk(100, function ($boosts) {
                    foreach ($boosts as $boost) {
                        event(new BoostExpired($boost));
                    }
                });
        }

        return $count;
    }

    public function trackImpression(int $boostId): void
    {
        BoostedAd::where('id', $boostId)->increment('impressions');
    }

    public function trackClick(int $boostId): void
    {
        BoostedAd::where('id', $boostId)->increment('clicks');
    }
}
