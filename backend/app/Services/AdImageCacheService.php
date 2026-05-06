<?php

namespace App\Services;

use App\Models\AdImage;
use Illuminate\Support\Facades\Cache;

class AdImageCacheService
{
    protected const CACHE_TTL = 3600; // 1 hour
    protected const CACHE_PREFIX = 'ad_image:';

    public function getCachedUrls(int $adId): array
    {
        $key = self::CACHE_PREFIX . 'urls:' . $adId;

        return Cache::remember($key, self::CACHE_TTL, function () use ($adId) {
            return AdImage::where('ad_id', $adId)
                ->orderBy('sort_order')
                ->get(['id', 'url', 'original_url', 'thumbnail_url', 'public_id', 'is_primary'])
                ->map(function (AdImage $image) {
                    return [
                        'id' => $image->id,
                        'url' => $image->url,
                        'original_url' => $image->original_url,
                        'thumbnail_url' => $image->thumbnail_url,
                        'public_id' => $image->public_id,
                        'is_primary' => $image->is_primary,
                        'display_url' => $image->display_url,
                        'thumbnail' => $image->thumbnail,
                    ];
                })
                ->toArray();
        });
    }

    public function getCachedUrl(int $imageId): ?array
    {
        $key = self::CACHE_PREFIX . 'image:' . $imageId;

        return Cache::remember($key, self::CACHE_TTL, function () use ($imageId) {
            $image = AdImage::find($imageId);
            if (!$image) {
                return null;
            }

            return [
                'id' => $image->id,
                'url' => $image->url,
                'original_url' => $image->original_url,
                'thumbnail_url' => $image->thumbnail_url,
                'public_id' => $image->public_id,
                'is_primary' => $image->is_primary,
                'display_url' => $image->display_url,
                'thumbnail' => $image->thumbnail,
            ];
        });
    }

    public function invalidateAdCache(int $adId): void
    {
        Cache::forget(self::CACHE_PREFIX . 'urls:' . $adId);
    }

    public function invalidateImageCache(int $imageId): void
    {
        Cache::forget(self::CACHE_PREFIX . 'image:' . $imageId);
    }

    public function invalidateAll(): void
    {
        Cache::tags([self::CACHE_PREFIX])->flush();
    }
}
