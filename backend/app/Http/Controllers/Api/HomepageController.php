<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Models\Banner;
use App\Models\Category;
use App\Models\Location;
use App\Services\BoostTierService;
use App\Services\CacheService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class HomepageController extends Controller
{
    public function index(Request $request)
    {
        $lang = $request->get('lang', 'en');
        $cacheKey = CacheService::KEY_HOMEPAGE.'_'.$lang;

        $data = Cache::remember($cacheKey, CacheService::TTL_HOMEPAGE, function () {
            $featured = $this->getFeaturedAds();
            $latest = $this->getLatestAds();
            $boosted = $this->getBoostedAdsForHomepage();

            return [
                'featured' => $featured,
                'boosted' => $boosted,
                'latest' => $latest,
                'categories' => $this->getCategories(),
                'locations' => $this->getLocations(),
                'banners' => $this->getBanners(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ])->header('Cache-Control', 'public, max-age=300, s-maxage=300');
    }

    private function getFeaturedAds()
    {
        return Ad::with(['images', 'category', 'location'])
            ->where('status', 'active')
            ->where('is_featured', true)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(fn ($ad) => $this->formatHomepageAd($ad));
    }

    private function getLatestAds()
    {
        return Ad::with(['images', 'category', 'location'])
            ->where('status', 'active')
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(fn ($ad) => $this->formatHomepageAd($ad));
    }

    private function formatHomepageAd($ad)
    {
        $images = $ad->relationLoaded('images') ? $ad->images : collect();
        $firstImage = $images->first();

        return [
            'id' => $ad->id,
            'title' => $ad->title,
            'slug' => $ad->slug,
            'price' => (float) $ad->price,
            'created_at' => $ad->created_at?->toIso8601String(),
            'views' => $ad->views,
            'state' => $ad->state,
            'lga' => $ad->lga,
            'is_featured' => (bool) $ad->is_featured,
            'is_verified' => (bool) $ad->is_verified,
            'category_name' => $ad->category?->name,
            'category_slug' => $ad->category?->slug,
            'location_name' => $ad->location?->name,
            'image' => $firstImage ? [
                'id' => $firstImage->id,
                'url' => $firstImage->url,
                'thumbnail_url' => $firstImage->thumbnail,
                'medium_url' => $firstImage->medium_url,
                'is_primary' => (bool) $firstImage->is_primary,
            ] : null,
            'image_url' => $firstImage?->url ?? $firstImage?->original_url,
            'images_count' => $images->count(),
            'images' => $images->take(5)->map(fn ($img) => [
                'id' => $img->id,
                'url' => $img->url,
                'thumbnail_url' => $img->thumbnail,
                'medium_url' => $img->medium_url,
                'is_primary' => (bool) $img->is_primary,
            ]),
        ];
    }

    private function getBoostedAdsForHomepage()
    {
        try {
            $tierService = app(BoostTierService::class);
            $boostData = $tierService->getBoostedAdsForListing();
            $boostedAdIds = $boostData['boosted_ad_ids'] ?? [];

            if (empty($boostedAdIds)) {
                return [];
            }

            return Ad::with(['images', 'category', 'location'])
                ->whereIn('ads.id', $boostedAdIds)
                ->where('ads.status', 'active')
                ->get()
                ->map(function ($ad) use ($boostData) {
                    $boostInfo = $boostData['boost_data'][$ad->id] ?? null;
                    $formatted = $this->formatHomepageAd($ad);
                    $formatted['is_boosted'] = true;
                    $formatted['boost_status'] = 'active';
                    $formatted['boost_type'] = $boostInfo['boost_type'] ?? null;
                    $formatted['boost_plan'] = $boostInfo['plan_type'] ?? $boostInfo['boost_type'] ?? null;
                    $formatted['boost_expires_at'] = $boostInfo['end_time']?->toIso8601String();
                    $formatted['boost_priority_score'] = $boostInfo['priority_score'] ?? 0;

                    return $formatted;
                })
                ->sortByDesc(fn ($ad) => $ad['boost_priority_score'] ?? 0)
                ->values();
        } catch (\Exception $e) {
            return [];
        }
    }

    private function getCategories()
    {
        return Cache::remember('categories_homepage', CacheService::TTL_CATEGORIES, function () {
            return Category::where('is_active', true)
                ->whereNull('parent_id')
                ->with(['children' => fn ($q) => $q->select('id', 'name', 'slug', 'parent_id')])
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(['id', 'name', 'slug', 'icon', 'ad_count']);
        });
    }

    private function getLocations()
    {
        return Cache::remember('locations_homepage', CacheService::TTL_LOCATIONS, function () {
            return Location::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'slug']);
        });
    }

    private function getBanners()
    {
        return Banner::where('status', 'active')
            ->where(function ($q) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>=', now());
            })
            ->orderBy('position')
            ->get(['id', 'title', 'image_url', 'link', 'position']);
    }

    public function clearCache()
    {
        Cache::forget('homepage_data_en');
        Cache::forget('homepage_data');
        Cache::forget('categories_homepage');
        Cache::forget('locations_homepage');

        return response()->json([
            'success' => true,
            'message' => 'Cache cleared successfully',
        ]);
    }
}
