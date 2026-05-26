<?php

namespace App\Services;

use App\Models\Ad;
use App\Models\Category;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class MeiliSearchService
{
    private bool $enabled = false;
    private ?\Meilisearch\Client $client = null;
    private string $indexName = 'ads';

    public function __construct()
    {
        $host = config('scout.meilisearch.host', 'http://127.0.0.1:7700');
        $key = config('scout.meilisearch.key', '');

        if ($host && class_exists(\Meilisearch\Client::class)) {
            try {
                $this->client = new \Meilisearch\Client($host, $key);
                $this->enabled = true;
            } catch (\Throwable $e) {
                Log::warning('Meilisearch not available, falling back to DB search: ' . $e->getMessage());
                $this->enabled = false;
            }
        }
    }

    public function isEnabled(): bool
    {
        return $this->enabled;
    }

    public function search(array $params): array
    {
        if (!$this->enabled) {
            return $this->fallbackSearch($params);
        }

        try {
            $index = $this->client->index($this->indexName);
            $query = $params['search_query'] ?? '';
            $page = max((int) ($params['page'] ?? 1), 1);
            $perPage = min((int) ($params['per_page'] ?? 20), 50);

            $filters = [];
            if (!empty($params['category_id'])) {
                $filters[] = 'category_id = ' . (int) $params['category_id'];
            }
            if (!empty($params['subcategory_id'])) {
                $filters[] = 'subcategory_id = ' . (int) $params['subcategory_id'];
            }
            if (!empty($params['min_price'])) {
                $filters[] = 'price >= ' . (float) $params['min_price'];
            }
            if (!empty($params['max_price'])) {
                $filters[] = 'price <= ' . (float) $params['max_price'];
            }
            if (!empty($params['location'])) {
                $locationIds = $this->resolveLocationIds($params['location']);
                if (!empty($locationIds)) {
                    $filters[] = 'location_id IN (' . implode(',', $locationIds) . ')';
                }
            }
            if (!empty($params['condition'])) {
                $filters[] = '`condition` = "' . addslashes($params['condition']) . '"';
            }

            $searchParams = [
                'limit' => $perPage,
                'offset' => ($page - 1) * $perPage,
                'attributesToRetrieve' => [
                    'id', 'title', 'slug', 'price', 'currency', 'condition', 'status',
                    'views', 'created_at', 'short_description', 'state', 'lga',
                    'is_featured', 'is_verified', 'category_id', 'location_id', 'user_id',
                ],
                'attributesToCrop' => ['description'],
                'cropLength' => 100,
                'sort' => ['_rankingScore:desc'],
            ];

            if (!empty($filters)) {
                $searchParams['filter'] = implode(' AND ', $filters);
            }

            if (!empty($query)) {
                $searchParams['attributesToHighlight'] = ['title', 'description'];
                $result = $index->search($query, $searchParams);
            } else {
                $result = $index->search('', $searchParams);
            }

            $hits = $result->getHits();
            $total = $result->getEstimatedTotalHits() ?? 0;
            $adIds = array_column($hits, 'id');

            $ads = [];
            if (!empty($adIds)) {
                $ads = Ad::with(['images', 'category', 'location', 'user', 'activeBoost.plan'])
                    ->whereIn('id', $adIds)
                    ->active()
                    ->get()
                    ->keyBy('id');
            }

            $boostData = app(BoostTierService::class)->getBoostedAdsForListing();
            $boostDataMap = $boostData['boost_data'] ?? [];

            $boostedHits = [];
            $regularHits = [];
            foreach ($hits as $hit) {
                $ad = $ads[$hit['id']] ?? null;
                if (!$ad) continue;
                $isBoosted = isset($boostDataMap[$ad->id]);
                $entry = [
                    'score' => $hit['_rankingScore'] ?? 0,
                    'ad' => $ad,
                    'is_boosted' => $isBoosted,
                    'boost_priority' => $boostDataMap[$ad->id]['priority_score'] ?? 0,
                ];
                if ($isBoosted) {
                    $boostedHits[] = $entry;
                } else {
                    $regularHits[] = $entry;
                }
            }

            usort($boostedHits, fn($a, $b) => $b['boost_priority'] <=> $a['boost_priority']);
            $scored = array_merge($boostedHits, $regularHits);

            $formatted = [];
            foreach ($scored as $entry) {
                $formatted[] = $this->formatResult($entry['ad']);
            }

            return [
                'results' => $formatted,
                'total' => $total,
                'query' => $query,
                'engine' => 'meilisearch',
                'related_ads' => [],
                'autocomplete_suggestions' => $this->getSuggestions($query, $adIds),
            ];

        } catch (\Throwable $e) {
            Log::error('Meilisearch search failed, falling back: ' . $e->getMessage());
            return $this->fallbackSearch($params);
        }
    }

    public function syncAd(int $adId): bool
    {
        if (!$this->enabled) return false;

        try {
            $ad = Ad::with(['category', 'location', 'user'])->find($adId);
            if (!$ad || $ad->status !== 'active') {
                $this->deleteAd($adId);
                return true;
            }

            $doc = $this->adToDocument($ad);
            $this->client->index($this->indexName)->addDocuments([$doc]);
            return true;
        } catch (\Throwable $e) {
            Log::error('Failed to sync ad to Meilisearch: ' . $e->getMessage());
            return false;
        }
    }

    public function deleteAd(int $adId): bool
    {
        if (!$this->enabled) return false;
        try {
            $this->client->index($this->indexName)->deleteDocument((string) $adId);
            return true;
        } catch (\Throwable $e) {
            Log::error('Failed to delete ad from Meilisearch: ' . $e->getMessage());
            return false;
        }
    }

    public function syncAllAds(): array
    {
        if (!$this->enabled) return ['error' => 'Meilisearch not enabled'];

        try {
            $this->configureIndex();

            $count = 0;
            Ad::active()
                ->where(function ($q) {
                    $q->where('is_seeded', true)
                        ->orWhere(fn($sq) => $sq->where('is_seeded', false)->where('processing_status', 'completed'));
                })
                ->chunk(200, function ($ads) use (&$count) {
                    $documents = [];
                    foreach ($ads as $ad) {
                        $documents[] = $this->adToDocument($ad);
                    }
                    $this->client->index($this->indexName)->addDocuments($documents);
                    $count += count($documents);
                });

            return ['indexed' => $count, 'engine' => 'meilisearch'];
        } catch (\Throwable $e) {
            Log::error('Failed to sync all ads: ' . $e->getMessage());
            return ['error' => $e->getMessage()];
        }
    }

    private function configureIndex(): void
    {
        $index = $this->client->index($this->indexName);

        $index->updateSearchableAttributes([
            'title', 'description', 'short_description', 'tags', 'ai_summary',
        ]);

        $index->updateFilterableAttributes([
            'category_id', 'subcategory_id', 'location_id', 'price', 'condition', 'status',
            'is_featured', 'is_verified', 'user_id',
        ]);

        $index->updateSortableAttributes([
            'price', 'created_at', 'views', 'priority_score',
        ]);

        $index->updateRankingRules([
            'words',
            'typo',
            'proximity',
            'attribute',
            'sort',
            'exactness',
        ]);

        $index->updateTypoTolerance([
            'enabled' => true,
            'minWordSizeForTypos' => [
                'oneTypo' => 5,
                'twoTypos' => 9,
            ],
        ]);

        $index->updateSynonyms([
            'phone' => ['mobile', 'cellphone', 'smartphone'],
            'car' => ['vehicle', 'automobile', 'auto'],
            'laptop' => ['notebook', 'computer'],
            'apartment' => ['flat', 'condo'],
        ]);
    }

    private function adToDocument($ad): array
    {
        return [
            'id' => $ad->id,
            'title' => $ad->title,
            'slug' => $ad->slug ?? 'ad-' . $ad->id,
            'description' => strip_tags($ad->description ?? ''),
            'short_description' => $ad->short_description ?? '',
            'price' => (float) $ad->price,
            'currency' => $ad->currency ?? 'NGN',
            'condition' => $ad->condition,
            'status' => $ad->status,
            'views' => (int) $ad->views,
            'clicks_count' => (int) $ad->clicks_count,
            'share_count' => (int) $ad->share_count,
            'category_id' => $ad->category_id,
            'subcategory_id' => $ad->subcategory_id,
            'location_id' => $ad->location_id,
            'user_id' => $ad->user_id,
            'state' => $ad->state ?? '',
            'lga' => $ad->lga ?? '',
            'is_featured' => (bool) $ad->is_featured,
            'is_verified' => (bool) $ad->is_verified,
            'tags' => is_array($ad->tags) ? implode(', ', $ad->tags) : ($ad->tags ?? ''),
            'ai_summary' => $ad->ai_summary ?? '',
            'created_at' => $ad->created_at?->timestamp ?? time(),
            'updated_at' => $ad->updated_at?->timestamp ?? time(),
        ];
    }

    private function formatResult($ad): array
    {
        $image = $ad->images->first();
        $boost = $ad->activeBoost;

        return [
            'id' => $ad->id,
            'slug' => $ad->slug ?? 'ad-' . $ad->id,
            'title' => $ad->title,
            'price' => (float) $ad->price,
            'currency' => $ad->currency ?? 'NGN',
            'condition' => $ad->condition,
            'status' => $ad->status,
            'views' => $ad->views ?? 0,
            'created_at' => $ad->created_at?->toIso8601String(),
            'short_description' => $ad->short_description,
            'state' => $ad->state ?? ($ad->location ? $ad->location->name : null),
            'lga' => $ad->lga,
            'is_featured' => (bool) $ad->is_featured,
            'is_verified' => (bool) $ad->is_verified,
            'is_boosted' => $boost !== null,
            'boost_type' => $boost?->boost_type,
            'boost_priority_score' => $boost?->priority_score ?? 0,
            'user' => $ad->user ? [
                'id' => $ad->user->id,
                'name' => $ad->user->name,
                'avatar' => $ad->user->full_avatar_url ?? $ad->user->avatar_url,
            ] : null,
            'category' => $ad->category ? [
                'id' => $ad->category->id,
                'name' => $ad->category->name,
                'slug' => $ad->category->slug,
            ] : null,
            'location' => $ad->location ? [
                'id' => $ad->location->id,
                'name' => $ad->location->name,
            ] : null,
            'image' => $image ? [
                'id' => $image->id,
                'url' => $image->url,
                'thumbnail_url' => $image->thumbnail_url,
                'is_primary' => (bool) $image->is_primary,
            ] : null,
            'images_count' => $ad->images->count(),
        ];
    }

    private function fallbackSearch(array $params): array
    {
        $searchService = app(SearchService::class);
        $result = $searchService->search($params);
        $result['engine'] = 'database';
        return $result;
    }

    private function resolveLocationIds(string $location): array
    {
        return Cache::remember('meili_loc_ids:' . md5($location), 3600, function () use ($location) {
            return \App\Models\Location::where('name', 'like', '%' . $location . '%')
                ->orWhere('slug', 'like', '%' . Str::slug($location) . '%')
                ->pluck('id')
                ->toArray();
        });
    }

    private function getSuggestions(string $query, array $excludeIds): array
    {
        if (empty($query) || strlen($query) < 2) return [];

        return Cache::remember('meili_suggestions:' . md5($query), 300, function () use ($query, $excludeIds) {
            $titleMatches = Ad::active()
                ->where('title', 'like', '%' . $query . '%')
                ->whereNotIn('id', $excludeIds)
                ->limit(5)
                ->pluck('title')
                ->toArray();

            $categoryMatches = Category::where('is_active', true)
                ->where('name', 'like', '%' . $query . '%')
                ->limit(3)
                ->pluck('name')
                ->toArray();

            return array_slice(array_unique(array_merge($titleMatches, $categoryMatches)), 0, 8);
        });
    }
}
