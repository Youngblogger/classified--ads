<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CdnService
{
    private string $provider;
    private ?string $distributionId;
    private ?string $apiKey;
    private ?string $email;

    public function __construct()
    {
        $this->provider = env('CDN_PROVIDER', 'cloudflare');
        $this->distributionId = env('CDN_DISTRIBUTION_ID');
        $this->apiKey = env('CDN_API_KEY');
        $this->email = env('CDN_EMAIL');
    }

    public function invalidateAdCache(int $adId, ?string $categorySlug = null): void
    {
        $paths = [
            "/api/ads/{$adId}",
            "/api/ads/{$adId}*",
            "/api/ads/similar*",
            "/api/homepage*",
        ];

        if ($categorySlug) {
            $paths[] = "/api/ads?category={$categorySlug}*";
            $paths[] = "/api/categories/{$categorySlug}*";
        }

        if (!empty($ad->slug ?? null)) {
            $paths[] = "/ad/{$ad->slug}*";
        }

        $this->purge($paths);
        CacheService::invalidateAdCache($adId, $categorySlug);
    }

    public function invalidateBoostCache(): void
    {
        $this->purge([
            "/api/ads*boost*",
            "/api/homepage*",
            "/api/ads/featured*",
        ]);

        CacheService::clearBoostedAds();
        CacheService::clearHomepage();
    }

    public function invalidateHomepage(): void
    {
        $this->purge(["/api/homepage*"]);
        CacheService::clearHomepage();
    }

    public function invalidateCategoryCache(?string $slug = null): void
    {
        if ($slug) {
            $this->purge(["/api/categories/{$slug}*", "/api/ads?category={$slug}*"]);
            CacheService::clearCategoryPage($slug);
        } else {
            $this->purge(["/api/categories*", "/api/ads*"]);
            CacheService::clearCategories();
        }
    }

    public function invalidateSearchCache(): void
    {
        Cache::forget(CacheService::KEY_TRENDING);
        Cache::forget('trending_ads');
    }

    public function invalidateAll(): void
    {
        $this->purge(['/*']);
        CacheService::invalidateAll();
    }

    public function addCacheTags(string $path, array $tags): void
    {
        $key = 'cdn:tag_map:' . md5($path);
        $existing = Cache::get($key, []);
        $existing = array_unique(array_merge($existing, $tags));
        Cache::put($key, $existing, 86400);
    }

    public function invalidateByTag(string $tag): void
    {
        $paths = [];
        $keys = Cache::get('cdn:tag_index:' . $tag, []);
        foreach ($keys as $key) {
            $paths[] = str_replace('*', '', $key);
        }
        if (!empty($paths)) {
            $this->purge($paths);
        }
    }

    private function purge(array $paths): void
    {
        if (!$this->distributionId) {
            return;
        }

        try {
            match ($this->provider) {
                'cloudflare' => $this->purgeCloudflare($paths),
                'cloudfront' => $this->purgeCloudFront($paths),
                'fastly' => $this->purgeFastly($paths),
                default => null,
            };

            Log::info('CDN purge sent', [
                'provider' => $this->provider,
                'paths' => $paths,
            ]);
        } catch (\Throwable $e) {
            Log::error('CDN purge failed', [
                'provider' => $this->provider,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function purgeCloudflare(array $paths): void
    {
        if (!$this->apiKey || !$this->email) return;

        $zoneId = env('CDN_ZONE_ID');
        if (!$zoneId) return;

        $chunks = array_chunk($paths, 30);
        foreach ($chunks as $chunk) {
            Http::withHeaders([
                'X-Auth-Email' => $this->email,
                'X-Auth-Key' => $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post("https://api.cloudflare.com/client/v4/zones/{$zoneId}/purge_cache", [
                'files' => $chunk,
            ]);
        }
    }

    private function purgeCloudFront(array $paths): void
    {
        $items = [];
        foreach ($paths as $path) {
            $items[] = ['/' . ltrim($path, '/')];
        }

        Http::withToken($this->apiKey)->post(
            "https://cloudfront.amazonaws.com/2020-05-31/distribution/{$this->distributionId}/invalidation",
            [
                'InvalidationBatch' => [
                    'Paths' => ['Items' => $items, 'Quantity' => count($items)],
                    'CallerReference' => 'inval-' . time() . '-' . md5(implode(',', $paths)),
                ],
            ]
        );
    }

    private function purgeFastly(array $paths): void
    {
        $serviceId = env('FASTLY_SERVICE_ID');
        if (!$serviceId) return;

        Http::withToken($this->apiKey)->purge("https://api.fastly.com/service/{$serviceId}/purge");
    }

    public function getEdgeCacheHeaders(int $ttl = 300, bool $isPublic = true, bool $staleWhileRevalidate = true): array
    {
        $headers = [];

        if ($isPublic) {
            $cacheControl = "public, max-age={$ttl}, s-maxage={$ttl}";
            if ($staleWhileRevalidate) {
                $cacheControl .= ", stale-while-revalidate=" . ($ttl * 2);
                $cacheControl .= ", stale-if-error=" . ($ttl * 4);
            }
        } else {
            $cacheControl = "private, max-age={$ttl}";
        }

        $headers['Cache-Control'] = $cacheControl;
        $headers['Expires'] = gmdate('D, d M Y H:i:s', time() + $ttl) . ' GMT';
        $headers['Vary'] = 'Accept-Encoding, Accept-Language';

        if ($isPublic && $this->distributionId) {
            $headers['CDN-Cache-Control'] = "max-age={$ttl}";
        }

        return $headers;
    }

    public static function getCacheTiers(): array
    {
        return [
            'static_asset' => 31536000,
            'ad_image' => 86400,
            'category_icon' => 86400,
            'homepage' => 300,
            'ad_listing' => 120,
            'ad_detail' => 600,
            'search_results' => 60,
            'user_profile' => 120,
            'boost_plans' => 3600,
        ];
    }
}
