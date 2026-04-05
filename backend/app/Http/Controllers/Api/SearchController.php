<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Models\Category;
use App\Services\SearchService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        try {
            $searchService = app(SearchService::class);
            
            // Check if category slug is passed instead of category_id
            $categoryId = $request->get('category_id');
            if (!$categoryId && $request->get('category')) {
                // Find category by slug
                $category = \App\Models\Category::where('slug', $request->get('category'))->first();
                $categoryId = $category ? $category->id : null;
            }
            
            $params = [
                'search_query' => $request->get('q', ''),
                'category_id' => $categoryId,
                'min_price' => $request->get('min_price'),
                'max_price' => $request->get('max_price'),
                'location' => $request->get('location'),
                'limit' => $request->get('per_page', 20),
            ];

            $results = $searchService->search($params);

            $perPage = $request->get('per_page', 20);
            $page = $request->get('page', 1);
            
            $paginatedResults = array_slice(
                $results['results'], 
                ($page - 1) * $perPage, 
                $perPage
            );

            return response()->json([
                'data' => $paginatedResults,
                'meta' => [
                    'current_page' => (int) $page,
                    'per_page' => (int) $perPage,
                    'total' => $results['total'],
                    'query' => $results['query'],
                ],
                'related_ads' => $results['related_ads'],
                'autocomplete_suggestions' => $results['autocomplete_suggestions'],
            ]);
        } catch (\Exception $e) {
            Log::error('Search failed: ' . $e->getMessage());
            return response()->json(['error' => 'Search failed', 'message' => $e->getMessage()], 500);
        }
    }

    public function advancedSearch(Request $request)
    {
        try {
            $searchService = app(SearchService::class);
            
            $params = [
                'search_query' => $request->get('q', ''),
                'category_id' => $request->get('category_id'),
                'min_price' => $request->get('min_price'),
                'max_price' => $request->get('max_price'),
                'location' => $request->get('location'),
                'limit' => $request->get('per_page', 20),
            ];

            $results = $searchService->search($params);

            return response()->json($results);
        } catch (\Exception $e) {
            Log::error('Advanced search failed: ' . $e->getMessage());
            return response()->json(['error' => 'Search failed', 'message' => $e->getMessage()], 500);
        }
    }

    public function suggestions(Request $request)
    {
        try {
            $query = $request->get('q', '');
            
            if (strlen($query) < 2) {
                return response()->json([
                    'ads' => [],
                    'categories' => [],
                ]);
            }

            $searchService = app(SearchService::class);
            $suggestions = $searchService->getSuggestions($query);

            return response()->json($suggestions);
        } catch (\Exception $e) {
            Log::error('Suggestions failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to get suggestions', 'message' => $e->getMessage()], 500);
        }
    }

    public function trending(Request $request)
    {
        try {
            $trendingAds = Ad::with(['images', 'category', 'location'])
                ->where('status', 'active')
                ->where(function($q) {
                    $q->where('is_seeded', true)
                      ->orWhere(function($sq) {
                          $sq->where('is_seeded', false)
                             ->where('processing_status', 'completed');
                      });
                })
                ->where('created_at', '>=', now()->subDays(7))
                ->orderBy('views', 'desc')
                ->limit(10)
                ->get();

            return response()->json(['data' => $trendingAds]);
        } catch (\Exception $e) {
            Log::error('Trending failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to get trending ads', 'message' => $e->getMessage()], 500);
        }
    }

    public function recentSearches(Request $request)
    {
        return response()->json([
            'searches' => [
                'iPhone 15',
                'Toyota Camry',
                'Laptop',
                'House for rent',
                'Samsung Galaxy',
            ],
        ]);
    }
}
