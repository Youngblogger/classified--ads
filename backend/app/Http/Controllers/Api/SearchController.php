<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\SearchAnalytic;
use App\Services\MeiliSearchService;
use App\Services\SearchService;
use App\Services\MonitoringService;
use App\Services\BoostTierService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SearchController extends Controller
{
    private MeiliSearchService $meiliSearch;
    private SearchService $dbSearch;
    private MonitoringService $monitoring;
    private BoostTierService $boostTier;

    public function __construct(
        MeiliSearchService $meiliSearch,
        SearchService $dbSearch,
        MonitoringService $monitoring,
        BoostTierService $boostTier
    ) {
        $this->meiliSearch = $meiliSearch;
        $this->dbSearch = $dbSearch;
        $this->monitoring = $monitoring;
        $this->boostTier = $boostTier;
    }

    public function search(Request $request)
    {
        $start = microtime(true);

        try {
            $categoryId = $request->get('category_id');
            if (!$categoryId && $request->get('category')) {
                $category = Category::where('slug', $request->get('category'))->select('id')->first();
                $categoryId = $category?->id;
            }

            $subcategoryId = $request->get('subcategory_id');
            if (!$subcategoryId && $request->get('subcategory')) {
                $subcategory = Category::where('slug', $request->get('subcategory'))->select('id')->first();
                $subcategoryId = $subcategory?->id;
            }

            $page = max((int) $request->get('page', 1), 1);
            $perPage = min((int) $request->get('per_page', 20), 50);

            $params = [
                'search_query' => $request->get('q', ''),
                'category_id' => $categoryId,
                'subcategory_id' => $subcategoryId,
                'min_price' => $request->get('min_price'),
                'max_price' => $request->get('max_price'),
                'location' => $request->get('location'),
                'condition' => $request->get('condition'),
                'page' => $page,
                'per_page' => $perPage,
            ];

            $results = $this->meiliSearch->search($params);

            $engine = $results['engine'] ?? 'database';
            $data = $results['results'] ?? [];
            $total = $results['total'] ?? 0;

            $duration = (microtime(true) - $start) * 1000;
            $this->monitoring->recordSearchLatency($duration, $engine);

            $this->logSearchAnalytics($request, $params, $results, $engine, $duration);

            return response()->json([
                'data' => $data,
                'meta' => [
                    'current_page' => $page,
                    'per_page' => $perPage,
                    'total' => $total,
                    'query' => $results['query'] ?? '',
                    'engine' => $engine,
                    'fallback_level' => $results['fallback_level'] ?? 0,
                ],
                'related_ads' => $results['related_ads'] ?? [],
                'autocomplete_suggestions' => $results['autocomplete_suggestions'] ?? [],
            ])->header('Cache-Control', 'private, max-age=60');

        } catch (\Exception $e) {
            $this->monitoring->logError($e, ['context' => 'search']);
            Log::error('Search failed: ' . $e->getMessage());

            return response()->json([
                'error' => 'Search failed',
                'message' => config('app.debug') ? $e->getMessage() : 'Search temporarily unavailable',
            ], 500);
        }
    }

    public function trending(Request $request)
    {
        try {
            $trendingAds = \Illuminate\Support\Facades\Cache::remember(
                'trending_ads',
                \App\Services\CacheService::TTL_TRENDING_SEARCHES,
                function () {
                    return \App\Models\Ad::with(['images', 'category', 'location'])
                        ->active()
                        ->where(function ($q) {
                            $q->where('is_seeded', true)
                                ->orWhere(fn($sq) => $sq->where('is_seeded', false)->where('processing_status', 'completed'));
                        })
                        ->where('created_at', '>=', now()->subDays(7))
                        ->orderByRaw('(views + clicks_count * 3) DESC')
                        ->limit(10)
                        ->get();
                }
            );

            return response()->json(['data' => $trendingAds])
                ->header('Cache-Control', 'public, max-age=900, s-maxage=900');
        } catch (\Exception $e) {
            $this->monitoring->logError($e, ['context' => 'trending']);
            Log::error('Trending failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to get trending ads'], 500);
        }
    }

    public function suggestions(Request $request)
    {
        $query = $request->get('q', '');
        if (strlen($query) < 2) {
            return response()->json(['data' => []]);
        }

        return response()->json([
            'data' => $this->dbSearch->getSuggestions($query),
        ])->header('Cache-Control', 'private, max-age=30');
    }

    public function advancedSearch(Request $request)
    {
        return $this->search($request);
    }

    public function recentSearches(Request $request)
    {
        return response()->json(['data' => []]);
    }

    private function logSearchAnalytics(Request $request, array $params, array $results, string $engine, float $durationMs): void
    {
        try {
            $query = $params['search_query'] ?? '';
            if (empty($query) && empty($params['location']) && empty($params['category_id'])) {
                return;
            }

            $intent = $this->dbSearch->detectIntent($query);

            SearchAnalytic::create([
                'query' => mb_substr($query, 0, 255),
                'normalized_query' => mb_substr(implode(' ', $this->dbSearch->extractKeywords($query)), 0, 255),
                'location' => $params['location'] ?? null,
                'category_id' => $params['category_id'] ?? null,
                'fallback_level' => $results['fallback_level'] ?? 0,
                'results_count' => $results['total'] ?? count($results['results'] ?? []),
                'results_before_fallback' => 0,
                'intent' => $intent['intent'],
                'has_price_intent' => $intent['has_price_intent'],
                'engine' => $engine,
                'user_id' => $request->user()?->id,
                'ip_address' => $request->ip(),
                'session_id' => $request->session()?->getId() ?? $request->header('X-Session-ID'),
                'duration_ms' => (int) $durationMs,
                'created_at' => now(),
            ]);
        } catch (\Throwable $e) {
            Log::warning('Failed to log search analytics: ' . $e->getMessage());
        }
    }
}
