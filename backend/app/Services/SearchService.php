<?php

namespace App\Services;

use App\Models\Ad;
use App\Models\Category;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SearchService
{
    private array $stopWords = [
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
        'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
        'could', 'should', 'may', 'might', 'must', 'this', 'that', 'these',
        'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which',
        'who', 'their', 'its', 'very', 'just', 'also', 'now', 'here', 'there',
        'then', 'so', 'not', 'no', 'yes', 'all', 'any', 'some', 'much', 'many',
        'more', 'most', 'other', 'such', 'only', 'own', 'same', 'than', 'too',
    ];

    public function search(array $params): array
    {
        $query = $params['search_query'] ?? '';
        $categoryId = $params['category_id'] ?? null;
        $subcategoryId = $params['subcategory_id'] ?? null;
        $minPrice = $params['min_price'] ?? null;
        $maxPrice = $params['max_price'] ?? null;
        $location = $params['location'] ?? null;
        $limit = $params['limit'] ?? 60;

        $attrFilters = [];
        foreach ($params as $key => $value) {
            if (str_starts_with($key, 'attr_') && $value !== null && $value !== '') {
                $attrFilters[substr($key, 5)] = $value;
            }
        }

        $cacheKey = 'search:' . md5(serialize($params));
        if (!empty($query) && strlen($query) >= 2) {
            $cached = Cache::get($cacheKey);
            if ($cached) {
                return $cached;
            }
        }

        $ads = $this->buildQuery($query, $categoryId, $subcategoryId, $minPrice, $maxPrice, $location, $attrFilters)
            ->limit($limit)
            ->get();

        $scoredResults = $this->scoreAndSort($ads, $query, $categoryId);

        $results = [];
        foreach ($scoredResults as $item) {
            if ($item['ad']) {
                $results[] = $this->formatAdForResponse($item['ad']);
            }
        }

        $results = array_slice($results, 0, $limit);

        $relatedAds = $this->findRelatedAds($scoredResults, $categoryId, (int) ($limit / 3));
        $autocomplete = $this->getAutocompleteSuggestions($query, $ads);

        $returnData = [
            'results' => $results,
            'related_ads' => $relatedAds,
            'autocomplete_suggestions' => $autocomplete,
            'total' => count($results),
            'query' => $query,
        ];

        if (!empty($query) && strlen($query) >= 2) {
            Cache::put($cacheKey, $returnData, 120);
        }

        return $returnData;
    }

    private function formatAdForResponse($ad): array
    {
        $attributes = $ad->attributes ?? [];
        $image = $ad->images->first();

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

    private function buildQuery(string $query, ?int $categoryId, ?int $subcategoryId, ?float $minPrice, ?float $maxPrice, ?string $location, array $attrFilters = [])
    {
        $baseQuery = Ad::with(['images', 'category', 'location', 'user'])
            ->active()
            ->where(function($q) {
                $q->where('is_seeded', true)
                  ->orWhere(fn($sq) => $sq->where('is_seeded', false)->where('processing_status', 'completed'));
            });

        if ($query) {
            $searchTerms = $this->extractKeywords($query);
            $baseQuery->where(function($q) use ($searchTerms) {
                foreach ($searchTerms as $term) {
                    $q->orWhere('title', 'like', '%' . $term . '%')
                      ->orWhere('tags', 'like', '%"' . $term . '"%')
                      ->orWhere('ai_summary', 'like', '%' . $term . '%')
                      ->orWhere('description', 'like', '%' . $term . '%');
                }
            });
        }

        if ($categoryId) {
            $categoryIds = $this->getCategoryAndDescendants($categoryId);
            $baseQuery->whereIn('category_id', $categoryIds);
        }

        if ($subcategoryId) {
            $baseQuery->where('subcategory_id', $subcategoryId);
        }

        if ($minPrice !== null) {
            $baseQuery->where('price', '>=', $minPrice);
        }

        if ($maxPrice !== null) {
            $baseQuery->where('price', '<=', $maxPrice);
        }

        if ($location) {
            $baseQuery->whereHas('location', fn($q) => $q->where('name', 'like', '%' . $location . '%')
                ->orWhere('slug', 'like', '%' . Str::slug($location) . '%'));
        }

        foreach ($attrFilters as $field => $value) {
            $this->applyAttributeFilter($baseQuery, $field, $value);
        }

        return $baseQuery;
    }

    private function applyAttributeFilter($query, string $field, $value): void
    {
        $jsonPath = 'attributes->"$."' . $field . '"';

        if (is_array($value)) {
            $query->where(function ($q) use ($jsonPath, $value) {
                foreach ($value as $v) {
                    $q->orWhereRaw("JSON_EXTRACT({$jsonPath}) = ?", [$v]);
                }
            });
        } elseif (str_contains($value, ',')) {
            $parts = array_map('trim', explode(',', $value));
            $query->where(function ($q) use ($jsonPath, $parts) {
                foreach ($parts as $v) {
                    $q->orWhereRaw("JSON_EXTRACT({$jsonPath}) = ?", [$v]);
                }
            });
        } elseif (str_contains($value, '-')) {
            $rangeParts = explode('-', $value);
            if (count($rangeParts) === 2) {
                $from = (float) $rangeParts[0];
                $to = (float) $rangeParts[1];
                $query->whereRaw("JSON_EXTRACT({$jsonPath}) >= ?", [$from])
                      ->whereRaw("JSON_EXTRACT({$jsonPath}) <= ?", [$to]);
            }
        } else {
            $query->whereRaw("JSON_EXTRACT({$jsonPath}) = ?", [$value]);
        }
    }

    private function getCategoryAndDescendants(int $categoryId): array
    {
        return Cache::remember('cat_descendants_' . $categoryId, 3600, function () use ($categoryId) {
            $ids = [$categoryId];
            $descendants = Category::where('parent_id', $categoryId)->pluck('id')->toArray();
            $ids = array_merge($ids, $descendants);
            foreach ($descendants as $descendantId) {
                $ids = array_merge($ids, $this->getCategoryAndDescendants($descendantId));
            }
            return array_unique($ids);
        });
    }

    private function extractKeywords(string $text): array
    {
        $text = strtolower($text);
        $text = preg_replace('/[^\p{L}\p{N}\s]/u', ' ', $text);
        $words = preg_split('/\s+/', $text, -1, PREG_SPLIT_NO_EMPTY);

        return array_values(array_filter($words, fn($word) =>
            strlen($word) >= 2 && !in_array($word, $this->stopWords)
        ));
    }

    private function scoreAndSort($ads, string $query, ?int $categoryId): array
    {
        $queryTerms = $this->extractKeywords($query);
        $results = [];

        if (!is_iterable($ads)) return $results;

        foreach ($ads as $ad) {
            if (!$ad) continue;
            $score = 0;

            $adTitle = strtolower($ad->title ?? '');
            $adTags = is_array($ad->tags) ? $ad->tags : [];
            $adSummary = strtolower($ad->ai_summary ?? '');
            $adDescription = strtolower($ad->description ?? '');

            foreach ($queryTerms as $term) {
                if (str_contains($adTitle, $term)) $score += 40;
                foreach ($adTags as $tag) {
                    if (stripos($tag, $term) !== false) { $score += 25; break; }
                }
                if (str_contains($adSummary, $term) || str_contains($adDescription, $term)) $score += 15;
            }

            if ($categoryId && $ad->category_id == $categoryId) $score += 20;
            if ($ad->verification_status === 'verified') $score += 10;

            if ($ad->ai_confidence >= 80) $score += 10;
            elseif ($ad->ai_confidence >= 60) $score += 5;

            $daysSinceCreated = $ad->created_at->diffInDays(now());
            if ($daysSinceCreated < 1) $score += 15;
            elseif ($daysSinceCreated < 7) $score += 10;
            elseif ($daysSinceCreated < 30) $score += 5;

            if ($ad->is_featured) $score += 5;

            $results[] = ['score' => $score, 'ad' => $ad];
        }

        usort($results, fn($a, $b) => $b['score'] <=> $a['score']);

        return $results;
    }

    private function findRelatedAds(array $scoredResults, ?int $categoryId, int $limit): array
    {
        if (empty($scoredResults)) return [];

        $firstAd = reset($scoredResults)['ad'];
        if (!$firstAd) return [];

        $adIds = array_filter(array_map(fn($i) => $i['ad']?->id, $scoredResults));

        $query = Ad::with(['images', 'category', 'location'])
            ->active()
            ->where(fn($q) => $q->where('is_seeded', true)
                ->orWhere(fn($sq) => $sq->where('is_seeded', false)->where('processing_status', 'completed')))
            ->whereNotIn('id', $adIds);

        if ($categoryId) {
            $query->whereIn('category_id', $this->getCategoryAndDescendants($categoryId));
        } elseif ($firstAd->category_id) {
            $query->where('category_id', $firstAd->category_id);
        }

        return $query->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(fn($ad) => $this->formatAdForResponse($ad))
            ->toArray();
    }

    private function getAutocompleteSuggestions(string $query, $ads): array
    {
        $suggestions = [];
        $queryLower = strtolower($query);

        if (!is_iterable($ads)) return $suggestions;

        $titleMatches = [];
        foreach ($ads as $ad) {
            if (!$ad) continue;
            $title = strtolower($ad->title ?? '');
            if (stripos($title, $queryLower) !== false && !in_array($ad->title, $titleMatches)) {
                $titleMatches[] = $ad->title;
            }
        }

        $suggestions = $titleMatches;

        if (count($suggestions) < 5) {
            $categoryMatches = Cache::remember('autocomplete_cat_' . md5($query), 3600, function () use ($query) {
                return Category::where('is_active', true)
                    ->where('name', 'like', '%' . $query . '%')
                    ->pluck('name')
                    ->toArray();
            });
            $suggestions = array_merge($suggestions, $categoryMatches);
        }

        return array_slice(array_unique($suggestions), 0, 10);
    }

    public function getSuggestions(string $query): array
    {
        $terms = $this->extractKeywords($query);
        if (empty($terms)) return [];

        $categorySuggestions = Category::where('is_active', true)
            ->where(function($q) use ($terms) {
                foreach ($terms as $term) {
                    $q->orWhere('name', 'like', '%' . $term . '%');
                }
            })
            ->select('id', 'name', 'slug')
            ->limit(5)
            ->get()
            ->toArray();

        $adSuggestions = Ad::active()
            ->where(fn($q) => $q->where('is_seeded', true)
                ->orWhere(fn($sq) => $sq->where('is_seeded', false)->where('processing_status', 'completed')))
            ->where(function($q) use ($terms) {
                foreach ($terms as $term) {
                    $q->orWhere('title', 'like', '%' . $term . '%');
                }
            })
            ->select('id', 'title', 'price', 'category_id')
            ->limit(5)
            ->get()
            ->toArray();

        return [
            'categories' => $categorySuggestions,
            'ads' => $adSuggestions,
        ];
    }
}
