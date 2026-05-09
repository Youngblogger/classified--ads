<?php

namespace App\Jobs;

use App\Models\Ad;
use App\Services\MonitoringService;
use App\Services\RankingService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class ProcessAnalyticsJob implements ShouldQueue
{
    use Queueable;

    public int $timeout = 120;
    public int $tries = 3;
    public array $backoff = [5, 30, 120];

    public function __construct(
        private string $action,
        private array $data = []
    ) {}

    public function handle(MonitoringService $monitoring, RankingService $rankingService): void
    {
        try {
            match ($this->action) {
                'ad_view' => $this->processAdView(),
                'ad_click' => $this->processAdClick(),
                'search_query' => $this->processSearchQuery(),
                'boost_impression' => $this->processBoostImpression(),
                'recompute_quality_score' => $this->recomputeQualityScore($rankingService),
                default => Log::warning('Unknown analytics action', ['action' => $this->action]),
            };
        } catch (\Throwable $e) {
            $monitoring->logError($e, ['action' => $this->action, 'data' => $this->data]);
            throw $e;
        }
    }

    private function processAdView(): void
    {
        $adId = $this->data['ad_id'] ?? null;
        if ($adId) {
            Ad::where('id', $adId)->increment('views');
        }
    }

    private function processAdClick(): void
    {
        $adId = $this->data['ad_id'] ?? null;
        if ($adId) {
            Ad::where('id', $adId)->increment('clicks_count');
        }
    }

    private function processSearchQuery(): void
    {
        $query = $this->data['query'] ?? '';
        if (empty($query)) return;

        $cacheKey = 'search:trending:' . md5(strtolower(trim($query)));
        $count = (int) cache()->get($cacheKey, 0);
        cache()->put($cacheKey, $count + 1, 86400);
    }

    private function processBoostImpression(): void
    {
        $boostId = $this->data['boost_id'] ?? null;
        if ($boostId) {
            \App\Models\BoostedAd::where('id', $boostId)->increment('impressions');
        }
    }

    private function recomputeQualityScore(RankingService $rankingService): void
    {
        $adId = $this->data['ad_id'] ?? null;
        if ($adId) {
            $rankingService->computeAdsQualityScore($adId);
        }
    }

    public function failed(\Throwable $e): void
    {
        Log::error('Analytics job failed permanently', [
            'action' => $this->action,
            'data' => $this->data,
            'error' => $e->getMessage(),
        ]);
    }
}
