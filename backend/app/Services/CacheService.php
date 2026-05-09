<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class CacheService
{
    // Cache TTLs in seconds
    const TTL_HOMEPAGE = 300;
    const TTL_CATEGORIES = 3600;
    const TTL_LOCATIONS = 3600;
    const TTL_BOOSTED_ADS = 300;
    const TTL_AD_DETAIL = 600;
    const TTL_TRENDING_SEARCHES = 900;
    const TTL_CATEGORY_PAGE = 300;
    const TTL_BOOST_PLANS = 3600;
    const TTL_UNREAD_COUNT = 60;

    // Cache key prefixes
    const KEY_HOMEPAGE = 'homepage_data';
    const KEY_CATEGORIES = 'categories';
    const KEY_LOCATIONS = 'locations';
    const KEY_BOOSTED_ADS = 'boosted_ads_listing';
    const KEY_AD_DETAIL = 'ad_detail';
    const KEY_TRENDING = 'trending_searches';
    const KEY_CATEGORY_PAGE = 'category_page';
    const KEY_BOOST_PLANS = 'boost_plans_active';
    const KEY_UNREAD_COUNT = 'unread_count';

    public static function remember(string $key, int $ttl, callable $callback, ?string $tag = null): mixed
    {
        if ($tag) {
            $cacheKey = self::taggedKey($tag, $key);
        } else {
            $cacheKey = $key;
        }

        return Cache::remember($cacheKey, $ttl, $callback);
    }

    public static function get(string $key, ?string $tag = null): mixed
    {
        $cacheKey = $tag ? self::taggedKey($tag, $key) : $key;
        return Cache::get($cacheKey);
    }

    public static function put(string $key, mixed $value, int $ttl, ?string $tag = null): void
    {
        $cacheKey = $tag ? self::taggedKey($tag, $key) : $key;
        Cache::put($cacheKey, $value, $ttl);
    }

    public static function forget(string $key, ?string $tag = null): void
    {
        $cacheKey = $tag ? self::taggedKey($tag, $key) : $key;
        Cache::forget($cacheKey);
    }

    public static function taggedKey(string $tag, string $key): string
    {
        return "{$tag}:{$key}";
    }

    // Homepage Cache
    public static function getHomepage(string $lang = 'en'): mixed
    {
        return Cache::get(self::KEY_HOMEPAGE . '_' . $lang);
    }

    public static function setHomepage(string $lang, mixed $data): void
    {
        Cache::put(self::KEY_HOMEPAGE . '_' . $lang, $data, self::TTL_HOMEPAGE);
    }

    public static function clearHomepage(): void
    {
        Cache::forget(self::KEY_HOMEPAGE . '_en');
        Cache::forget(self::KEY_HOMEPAGE);
    }

    // Category Cache
    public static function getCategories(): mixed
    {
        return Cache::get(self::KEY_CATEGORIES);
    }

    public static function setCategories(mixed $data): void
    {
        Cache::put(self::KEY_CATEGORIES, $data, self::TTL_CATEGORIES);
    }

    public static function clearCategories(): void
    {
        Cache::forget(self::KEY_CATEGORIES);
    }

    // Locations Cache
    public static function getLocations(): mixed
    {
        return Cache::get(self::KEY_LOCATIONS);
    }

    public static function setLocations(mixed $data): void
    {
        Cache::put(self::KEY_LOCATIONS, $data, self::TTL_LOCATIONS);
    }

    public static function clearLocations(): void
    {
        Cache::forget(self::KEY_LOCATIONS);
    }

    // Boosted Ads Cache
    public static function getBoostedAds(): mixed
    {
        return Cache::get(self::KEY_BOOSTED_ADS);
    }

    public static function setBoostedAds(mixed $data): void
    {
        Cache::put(self::KEY_BOOSTED_ADS, $data, self::TTL_BOOSTED_ADS);
    }

    public static function clearBoostedAds(): void
    {
        Cache::forget(self::KEY_BOOSTED_ADS);
    }

    // Ad Detail Cache
    public static function getAdDetail(int $adId): mixed
    {
        return Cache::get(self::KEY_AD_DETAIL . ":{$adId}");
    }

    public static function setAdDetail(int $adId, mixed $data): void
    {
        Cache::put(self::KEY_AD_DETAIL . ":{$adId}", $data, self::TTL_AD_DETAIL);
    }

    public static function clearAdDetail(int $adId): void
    {
        Cache::forget(self::KEY_AD_DETAIL . ":{$adId}");
    }

    public static function clearAllAdDetails(): void
    {
        Log::warning('CacheService: Cannot selectively clear all ad details without Redis tags. Consider using Redis for tag-based invalidation.');
    }

    // Category Page Cache
    public static function getCategoryPage(string $slug, array $params): mixed
    {
        $key = self::KEY_CATEGORY_PAGE . ":{$slug}:" . md5(serialize($params));
        return Cache::get($key);
    }

    public static function setCategoryPage(string $slug, array $params, mixed $data): void
    {
        $key = self::KEY_CATEGORY_PAGE . ":{$slug}:" . md5(serialize($params));
        Cache::put($key, $data, self::TTL_CATEGORY_PAGE);
    }

    public static function clearCategoryPage(string $slug): void
    {
        $pattern = self::KEY_CATEGORY_PAGE . ":{$slug}:*";
        Log::info("CacheService: Category page cache invalidation requested for {$slug}. Full cleanup requires Redis.");
    }

    // Trending Searches Cache
    public static function getTrendingSearches(): mixed
    {
        return Cache::get(self::KEY_TRENDING);
    }

    public static function setTrendingSearches(mixed $data): void
    {
        Cache::put(self::KEY_TRENDING, $data, self::TTL_TRENDING_SEARCHES);
    }

    public static function clearTrendingSearches(): void
    {
        Cache::forget(self::KEY_TRENDING);
    }

    // Ad Cache Invalidation (comprehensive)
    public static function invalidateAdCache(int $adId, ?string $categorySlug = null): void
    {
        self::clearAdDetail($adId);
        self::clearHomepage();
        self::clearBoostedAds();

        if ($categorySlug) {
            self::clearCategoryPage($categorySlug);
        }

        Cache::forget(self::KEY_AD_DETAIL . ":{$adId}");
    }

    // Unread Count Cache
    public static function getUnreadCount(int $userId): mixed
    {
        return Cache::get(self::KEY_UNREAD_COUNT . ":{$userId}");
    }

    public static function setUnreadCount(int $userId, int $count): void
    {
        Cache::put(self::KEY_UNREAD_COUNT . ":{$userId}", $count, self::TTL_UNREAD_COUNT);
    }

    public static function clearUnreadCount(int $userId): void
    {
        Cache::forget(self::KEY_UNREAD_COUNT . ":{$userId}");
    }

    // Bulk Cache Invalidation
    public static function invalidateAll(): void
    {
        self::clearHomepage();
        self::clearCategories();
        self::clearLocations();
        self::clearBoostedAds();
        self::clearTrendingSearches();
        self::clearAllAdDetails();
        Cache::forget(self::KEY_BOOST_PLANS);
    }
}
