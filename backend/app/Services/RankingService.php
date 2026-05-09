<?php

namespace App\Services;

use App\Models\Ad;
use App\Models\BoostedAd;
use App\Models\BoostPlan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RankingService
{
    const CACHE_TTL = 300;
    const CACHE_PREFIX = 'ranking:feed:';

    const WEIGHT_BOOST_TIER = 0.35;
    const WEIGHT_RECENCY = 0.20;
    const WEIGHT_ENGAGEMENT = 0.25;
    const WEIGHT_LOCATION = 0.10;
    const WEIGHT_QUALITY = 0.10;

    private BoostTierService $boostTierService;
    private CacheService $cacheService;

    public function __construct(BoostTierService $boostTierService, CacheService $cacheService)
    {
        $this->boostTierService = $boostTierService;
        $this->cacheService = $cacheService;
    }

    public function getRankedFeed(array $params = []): array
    {
        $page = max((int) ($params['page'] ?? 1), 1);
        $perPage = min((int) ($params['per_page'] ?? 20), 50);
        $categoryId = $params['category_id'] ?? null;
        $locationId = $params['location_id'] ?? null;
        $userId = $params['user_id'] ?? null;

        $cacheKey = $this->buildCacheKey($params);

        $cached = Cache::get($cacheKey);
        if ($cached) {
            return $this->paginateRankedResults($cached, $page, $perPage);
        }

        $ads = $this->fetchCandidates($categoryId, $locationId);
        $ranked = $this->rankAds($ads, $userId, $locationId);

        Cache::put($cacheKey, $ranked, self::CACHE_TTL);

        return $this->paginateRankedResults($ranked, $page, $perPage);
    }

    public function invalidateFeedCache(?string $categorySlug = null): void
    {
        if ($categorySlug) {
            Cache::forget(self::CACHE_PREFIX . "category:{$categorySlug}");
        }
        $keys = Cache::get(self::CACHE_PREFIX . 'keys', []);
        foreach ($keys as $key) {
            Cache::forget($key);
        }
        Cache::forget(self::CACHE_PREFIX . 'keys');
        Cache::forget(CacheService::KEY_BOOSTED_ADS);
    }

    private function buildCacheKey(array $params): string
    {
        $parts = [];
        if (!empty($params['category_id'])) $parts[] = 'cat:' . $params['category_id'];
        if (!empty($params['location_id'])) $parts[] = 'loc:' . $params['location_id'];
        $key = self::CACHE_PREFIX . (empty($parts) ? 'home' : implode('_', $parts));

        $keys = Cache::get(self::CACHE_PREFIX . 'keys', []);
        if (!in_array($key, $keys)) {
            $keys[] = $key;
            Cache::put(self::CACHE_PREFIX . 'keys', $keys, 3600);
        }

        return $key;
    }

    private function fetchCandidates(?int $categoryId, ?int $locationId): iterable
    {
        $query = Ad::with(['images', 'category', 'location', 'activeBoost.plan', 'user'])
            ->active()
            ->where(function ($q) {
                $q->where('is_seeded', true)
                    ->orWhere(fn($sq) => $sq->where('is_seeded', false)->where('processing_status', 'completed'));
            });

        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }

        if ($locationId) {
            $query->where('location_id', $locationId);
        }

        $boostData = $this->boostTierService->getBoostedAdsForListing();
        $boostedIds = $boostData['boosted_ad_ids'] ?? [];

        $allAds = $query->select([
            'id', 'user_id', 'category_id', 'location_id', 'title', 'slug', 'price',
            'views', 'clicks_count', 'share_count', 'is_featured', 'is_verified',
            'verification_status', 'quality_score', 'created_at', 'updated_at',
        ])->limit(200)->get();

        return $allAds;
    }

    private function rankAds(iterable $ads, ?int $userId, ?int $userLocationId): array
    {
        $boostData = $this->boostTierService->getBoostedAdsForListing();
        $boostDataMap = $boostData['boost_data'] ?? [];

        $maxViews = 1;
        $maxClicks = 1;
        $maxSaves = 1;

        foreach ($ads as $ad) {
            $maxViews = max($maxViews, (int) $ad->views);
            $maxClicks = max($maxClicks, (int) $ad->clicks_count);
        }

        $savedCounts = [];
        if ($userId) {
            $adIds = $ads->pluck('id')->toArray();
            $savedCounts = DB::table('ad_user_saves')
                ->whereIn('ad_id', $adIds)
                ->groupBy('ad_id')
                ->selectRaw('ad_id, COUNT(*) as count')
                ->pluck('count', 'ad_id')
                ->toArray();
            $maxSaves = max(1, max($savedCounts));
        }

        $ranked = [];

        foreach ($ads as $ad) {
            $score = 0;

            // 1. Boost tier weight (35%)
            $boostInfo = $boostDataMap[$ad->id] ?? null;
            $boostScore = 0;
            if ($boostInfo) {
                $tierScore = match ($boostInfo['plan_name'] ?? $boostInfo['boost_type'] ?? '') {
                    'Platinum' => 1.0,
                    'Gold' => 0.7,
                    'Silver' => 0.4,
                    default => 0.2,
                };
                $boostScore = $tierScore;

                $daysRemaining = 0;
                if (!empty($boostInfo['boost_end_time'])) {
                    $endTime = strtotime($boostInfo['boost_end_time']);
                    $daysRemaining = max(0, ($endTime - time()) / 86400);
                    $boostScore *= min(1, 0.5 + ($daysRemaining / 30));
                }
            }
            $score += $boostScore * self::WEIGHT_BOOST_TIER;

            // 2. Recency score (20%)
            $hoursSinceCreation = max(1, now()->diffInHours($ad->created_at));
            $recencyScore = max(0, 1 - log($hoursSinceCreation + 1) / log(8760));
            $score += $recencyScore * self::WEIGHT_RECENCY;

            // 3. Engagement score (25%)
            $viewsNorm = min(1, (int) $ad->views / $maxViews);
            $clicksNorm = min(1, (int) $ad->clicks_count / $maxClicks);
            $savesNorm = min(1, ($savedCounts[$ad->id] ?? 0) / $maxSaves);
            $engagementScore = ($viewsNorm * 0.4) + ($clicksNorm * 0.35) + ($savesNorm * 0.25);
            $score += $engagementScore * self::WEIGHT_ENGAGEMENT;

            // 4. Location relevance (10%)
            $locationScore = 0;
            if ($userLocationId && $ad->location_id) {
                $locationScore = $ad->location_id === $userLocationId ? 1.0 : 0.3;
            } else {
                $locationScore = 0.5;
            }
            $score += $locationScore * self::WEIGHT_LOCATION;

            // 5. Quality score (10%)
            $qualityScore = 0.5;
            if ($ad->quality_score !== null) {
                $qualityScore = min(1, max(0, (float) $ad->quality_score / 100));
            }
            if ($ad->is_verified || $ad->verification_status === 'verified') {
                $qualityScore = min(1, $qualityScore + 0.2);
            }
            if ($ad->is_featured) {
                $qualityScore = min(1, $qualityScore + 0.1);
            }
            $score += $qualityScore * self::WEIGHT_QUALITY;

            $ranked[] = [
                'score' => round($score, 4),
                'ad' => $ad,
            ];
        }

        usort($ranked, fn($a, $b) => $b['score'] <=> $a['score']);

        return $ranked;
    }

    private function paginateRankedResults(array $ranked, int $page, int $perPage): array
    {
        $total = count($ranked);
        $offset = ($page - 1) * $perPage;
        $items = array_slice($ranked, $offset, $perPage);

        $results = [];
        foreach ($items as $item) {
            $results[] = $item['ad'];
        }

        return [
            'data' => $results,
            'meta' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => max(1, (int) ceil($total / $perPage)),
            ],
        ];
    }

    public function getBoostPriorityScore(string $planType, int $daysRemaining): float
    {
        $tierScore = match ($planType) {
            'Platinum', 'platinum' => 1.0,
            'Gold', 'gold' => 0.7,
            'Silver', 'silver' => 0.4,
            default => 0.2,
        };
        $timeDecay = min(1, 0.5 + ($daysRemaining / 30));
        return $tierScore * $timeDecay;
    }

    public function computeAdsQualityScore(int $adId): void
    {
        $ad = Ad::find($adId);
        if (!$ad) return;

        $score = 50;

        if ($ad->images()->count() >= 3) $score += 15;
        elseif ($ad->images()->count() >= 1) $score += 5;

        if (!empty($ad->description) && strlen($ad->description) > 100) $score += 10;
        if (!empty($ad->short_description)) $score += 5;
        if (!empty($ad->attributes) && count($ad->attributes) > 0) $score += 5;
        if ($ad->is_verified) $score += 10;
        if (!empty($ad->phone) || !empty($ad->whatsapp)) $score += 5;

        $score = min(100, max(0, $score));

        $ad->quality_score = $score;
        $ad->saveQuietly();
    }
}
