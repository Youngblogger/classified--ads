<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\AdListResource;
use App\Models\Ad;
use App\Models\Category;
use App\Services\SearchService;
use App\Services\CacheService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        try {
            $searchService = app(SearchService::class);

            $categoryId = $request->get('category_id');
            if (!$categoryId && $request->get('category')) {
                $category = Category::where('slug', $request->get('category'))->select('id')->first();
                $categoryId = $category?->id;
            }

            $page = max((int) $request->get('page', 1), 1);
            $perPage = min((int) $request->get('per_page', 20), 50);

            $params = [
                'search_query' => $request->get('q', ''),
                'category_id' => $categoryId,
                'min_price' => $request->get('min_price'),
                'max_price' => $request->get('max_price'),
                'location' => $request->get('location'),
                'limit' => $perPage * 3,
            ];

            $results = $searchService->search($params);

            $paginatedResults = array_slice(
                $results['results'],
                ($page - 1) * $perPage,
                $perPage
            );

            return response()->json([
                'data' => $paginatedResults,
                'meta' => [
                    'current_page' => $page,
                    'per_page' => $perPage,
                    'total' => $results['total'],
                    'query' => $results['query'],
                ],
                'related_ads' => $results['related_ads'],
                'autocomplete_suggestions' => $results['autocomplete_suggestions'],
            ])->header('Cache-Control', 'private, max-age=60');
        } catch (\Exception $e) {
            Log::error('Search failed: ' . $e->getMessage());
            return response()->json(['error' => 'Search failed'], 500);
        }
    }

    public function trending(Request $request)
    {
        try {
            $trendingAds = Cache::remember('trending_ads', CacheService::TTL_TRENDING_SEARCHES, function () {
                return Ad::with(['images', 'category', 'location'])
                    ->active()
                    ->where(function($q) {
                        $q->where('is_seeded', true)
                          ->orWhere(fn($sq) => $sq->where('is_seeded', false)->where('processing_status', 'completed'));
                    })
                    ->where('created_at', '>=', now()->subDays(7))
                    ->orderBy('views', 'desc')
                    ->limit(10)
                    ->get();
            });

            return response()->json(['data' => $trendingAds])
                ->header('Cache-Control', 'public, max-age=900, s-maxage=900');
        } catch (\Exception $e) {
            Log::error('Trending failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to get trending ads'], 500);
        }
    }
}
