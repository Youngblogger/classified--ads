<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Models\Category;
use App\Models\Banner;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class HomepageController extends Controller
{
    private const CACHE_TTL = 300;
    private const FEATURED_LIMIT = 10;
    private const LATEST_LIMIT = 20;

    public function index(Request $request)
    {
        $cacheKey = 'homepage_data_' . $request->get('lang', 'en');
        
        $data = Cache::remember($cacheKey, self::CACHE_TTL, function () {
            return [
                'featured' => $this->getFeaturedAds(),
                'latest' => $this->getLatestAds(),
                'categories' => $this->getCategories(),
                'locations' => $this->getLocations(),
                'banners' => $this->getBanners(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
            'cached' => Cache::has('homepage_data_' . app()->getLocale()),
        ]);
    }

    private function getFeaturedAds()
    {
        return Ad::select([
            'ads.id',
            'ads.title',
            'ads.price',
            'ads.slug',
            'ads.status',
            'ads.created_at',
            'ads.views',
            'categories.name as category_name',
            'categories.slug as category_slug',
            'locations.name as location_name',
            DB::raw('(SELECT url FROM ad_images WHERE ad_images.ad_id = ads.id AND ad_images.is_primary = 1 LIMIT 1) as image_url'),
        ])
        ->join('categories', 'ads.category_id', '=', 'categories.id')
        ->join('locations', 'ads.location_id', '=', 'locations.id')
        ->where('ads.status', 'active')
        ->where('ads.is_featured', true)
        ->orderBy('ads.created_at', 'desc')
        ->limit(self::FEATURED_LIMIT)
        ->get();
    }

    private function getLatestAds()
    {
        return Ad::select([
            'ads.id',
            'ads.title',
            'ads.price',
            'ads.slug',
            'ads.status',
            'ads.created_at',
            'ads.views',
            'categories.name as category_name',
            'categories.slug as category_slug',
            'locations.name as location_name',
            DB::raw('(SELECT url FROM ad_images WHERE ad_images.ad_id = ads.id AND ad_images.is_primary = 1 LIMIT 1) as image_url'),
        ])
        ->join('categories', 'ads.category_id', '=', 'categories.id')
        ->join('locations', 'ads.location_id', '=', 'locations.id')
        ->where('ads.status', 'active')
        ->orderBy('ads.created_at', 'desc')
        ->limit(self::LATEST_LIMIT)
        ->get();
    }

    private function getCategories()
    {
        return Cache::remember('categories_homepage', 3600, function () {
            return Category::where('is_active', true)
                ->whereNull('parent_id')
                ->with(['children' => function ($query) {
                    $query->select('id', 'name', 'slug', 'parent_id');
                }])
            ->orderBy('position')
                ->orderBy('name')
                ->get(['id', 'name', 'slug', 'icon', 'ad_count']);
        });
    }

    private function getLocations()
    {
        return Cache::remember('locations_homepage', 3600, function () {
            return Location::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'slug']);
        });
    }

    private function getBanners()
    {
        return Banner::where('status', 'active')
            ->where(function ($query) {
                $query->whereNull('starts_at')
                    ->orWhere('starts_at', '<=', now());
            })
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>=', now());
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
