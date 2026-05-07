<?php

namespace App\Services;

use App\Models\Ad;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class RecentlyViewedService
{
    protected const MAX_ITEMS = 20;
    protected const CACHE_TTL = 604800;
    protected const CACHE_PREFIX = 'recently_viewed:';

    public function trackView(int $userId, int $adId): void
    {
        $key = $this->getUserKey($userId);

        $recentlyViewed = Cache::get($key, []);

        $recentlyViewed = array_values(array_filter($recentlyViewed, fn($id) => $id !== $adId));

        array_unshift($recentlyViewed, $adId);

        if (count($recentlyViewed) > self::MAX_ITEMS) {
            $recentlyViewed = array_slice($recentlyViewed, 0, self::MAX_ITEMS);
        }

        Cache::put($key, $recentlyViewed, self::CACHE_TTL);
    }

    public function getRecentlyViewed(int $userId, int $limit = 10): array
    {
        $key = $this->getUserKey($userId);
        $adIds = Cache::get($key, []);

        if (empty($adIds)) {
            return [];
        }

        $orderedIds = $adIds;

        $ads = Ad::with(['images', 'category', 'location'])
            ->whereIn('id', $orderedIds)
            ->where('status', 'active')
            ->get()
            ->keyBy('id');

        $result = [];
        foreach ($orderedIds as $id) {
            if (isset($ads[$id])) {
                $result[] = $ads[$id];
            }

            if (count($result) >= $limit) {
                break;
            }
        }

        return $result;
    }

    public function clearHistory(int $userId): void
    {
        Cache::forget($this->getUserKey($userId));
    }

    public function removeItem(int $userId, int $adId): void
    {
        $key = $this->getUserKey($userId);
        $recentlyViewed = Cache::get($key, []);

        $recentlyViewed = array_values(array_filter($recentlyViewed, fn($id) => $id !== $adId));

        Cache::put($key, $recentlyViewed, self::CACHE_TTL);
    }

    public function hasViewed(int $userId, int $adId): bool
    {
        $key = $this->getUserKey($userId);
        $recentlyViewed = Cache::get($key, []);

        return in_array($adId, $recentlyViewed);
    }

    protected function getUserKey(int $userId): string
    {
        return self::CACHE_PREFIX . $userId;
    }
}
