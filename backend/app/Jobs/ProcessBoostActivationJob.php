<?php

namespace App\Jobs;

use App\Models\BoostedAd;
use App\Models\Ad;
use App\Services\BoostTierService;
use App\Services\CacheService;
use App\Services\MonitoringService;
use App\Services\RankingService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class ProcessBoostActivationJob implements ShouldQueue
{
    use Queueable;

    public int $timeout = 60;
    public int $tries = 3;
    public array $backoff = [10, 30, 60];

    public function __construct(
        private int $boostedAdId
    ) {}

    public function handle(
        BoostTierService $boostTierService,
        CacheService $cacheService,
        RankingService $rankingService,
        MonitoringService $monitoring
    ): void {
        try {
            $boost = BoostedAd::with(['plan', 'ad'])->find($this->boostedAdId);
            if (!$boost) {
                Log::warning('Boost not found for activation', ['id' => $this->boostedAdId]);
                return;
            }

            if ($boost->status === 'active') {
                return;
            }

            $boost->status = 'active';
            $boost->activated_at = now();

            if ($boost->plan) {
                $boost->priority_score = $boost->plan->priority_score;
                $boost->boost_type = $boost->plan->type;
                $boost->badge_label = $boost->plan->badge_label;
                $boost->badge_icon = $boost->plan->badge_icon;
            } else {
                $priorityMap = ['silver' => 10, 'gold' => 20, 'platinum' => 30];
                $boost->priority_score = $priorityMap[$boost->boost_type] ?? 10;
            }

            $boost->save();

            $ad = $boost->ad;
            if ($ad) {
                $rankingService->computeAdsQualityScore($ad->id);
            }

            $boostTierService->clearBoostedAdsCache();
            $cacheService->clearHomepage();

            if ($ad && $ad->category_id) {
                $category = $ad->category;
                $rankingService->invalidateFeedCache($category?->slug);
            }

            Log::info('Boost activated successfully', [
                'boost_id' => $this->boostedAdId,
                'ad_id' => $boost->ad_id,
                'type' => $boost->boost_type,
            ]);

        } catch (\Throwable $e) {
            $monitoring->logError($e, ['boosted_ad_id' => $this->boostedAdId]);
            throw $e;
        }
    }

    public function failed(\Throwable $e): void
    {
        Log::error('Boost activation failed permanently', [
            'boosted_ad_id' => $this->boostedAdId,
            'error' => $e->getMessage(),
        ]);
    }
}
