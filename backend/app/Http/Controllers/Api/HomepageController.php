<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Models\Category;
use App\Models\Banner;
use App\Models\Location;
use App\Services\CacheService;
use App\Services\BoostTierService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class HomepageController extends Controller
{
    public function index(Request $request)
    {
        $lang = $request->get('lang', 'en');
        $cacheKey = CacheService::KEY_HOMEPAGE . '_' . $lang;

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
        return Ad::select([
            'ads.id', 'ads.title', 'ads.price', 'ads.slug',
            'ads.created_at', 'ads.views', 'ads.state', 'ads.lga',
            'ads.is_featured', 'ads.is_verified',
            'categories.name as category_name',
            'categories.slug as category_slug',
            'locations.name as location_name',
            DB::raw('(SELECT COALESCE(thumbnail_url, url) FROM ad_images WHERE ad_images.ad_id = ads.id ORDER BY is_primary DESC, sort_order ASC LIMIT 1) as image_url'),
            DB::raw('(SELECT COUNT(*) FROM ad_images WHERE ad_images.ad_id = ads.id) as images_count'),
        ])
        ->join('categories', 'ads.category_id', '=', 'categories.id')
        ->leftJoin('locations', 'ads.location_id', '=', 'locations.id')
        ->where('ads.status', 'active')
        ->where('ads.is_featured', true)
        ->orderBy('ads.created_at', 'desc')
        ->limit(10)
        ->get();
    }

    private function getLatestAds()
    {
        return Ad::select([
            'ads.id', 'ads.title', 'ads.price', 'ads.slug',
            'ads.created_at', 'ads.views', 'ads.state', 'ads.lga',
            'ads.is_featured', 'ads.is_verified',
            'categories.name as category_name',
            'categories.slug as category_slug',
            'locations.name as location_name',
            DB::raw('(SELECT COALESCE(thumbnail_url, url) FROM ad_images WHERE ad_images.ad_id = ads.id ORDER BY is_primary DESC, sort_order ASC LIMIT 1) as image_url'),
            DB::raw('(SELECT COUNT(*) FROM ad_images WHERE ad_images.ad_id = ads.id) as images_count'),
        ])
        ->join('categories', 'ads.category_id', '=', 'categories.id')
        ->leftJoin('locations', 'ads.location_id', '=', 'locations.id')
        ->where('ads.status', 'active')
        ->orderBy('ads.created_at', 'desc')
        ->limit(20)
        ->get();
    }

    private function getBoostedAdsForHomepage()
    {
        try {
            $tierService = app(BoostTierService::class);
            $boostData = $tierService->getBoostedAdsForListing();
            $boostedAdIds = $boostData['boosted_ad_ids'] ?? [];

            if (empty($boostedAdIds)) return [];

            return Ad::select([
                'ads.id', 'ads.title', 'ads.price', 'ads.slug',
                'ads.created_at', 'ads.views', 'ads.state', 'ads.lga',
                'ads.is_featured', 'ads.is_verified',
                'categories.name as category_name',
                'categories.slug as category_slug',
                'locations.name as location_name',
                DB::raw('(SELECT COALESCE(thumbnail_url, url) FROM ad_images WHERE ad_images.ad_id = ads.id ORDER BY is_primary DESC, sort_order ASC LIMIT 1) as image_url'),
                DB::raw('(SELECT COUNT(*) FROM ad_images WHERE ad_images.ad_id = ads.id) as images_count'),
            ])
            ->join('categories', 'ads.category_id', '=', 'categories.id')
            ->leftJoin('locations', 'ads.location_id', '=', 'locations.id')
            ->whereIn('ads.id', $boostedAdIds)
            ->where('ads.status', 'active')
            ->get()
            ->map(function ($ad) use ($boostData) {
                $ad->boost_info = $boostData['boost_data'][$ad->id] ?? null;
                return $ad;
            })
            ->sortByDesc(fn($ad) => $ad->boost_info['priority_score'] ?? 0)
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
                ->with(['children' => fn($q) => $q->select('id', 'name', 'slug', 'parent_id')])
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
            'message' => 'Cache cleared successfully'
        ]);
    }
}
