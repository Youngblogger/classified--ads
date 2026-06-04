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
        $limit = $params['limit'] ?? 60;

        $cacheKey = 'search:' . md5(serialize($params));
        if (!empty($query) && strlen($query) >= 2) {
            $cached = Cache::get($cacheKey);
            if ($cached) {
                return $cached;
            }
        }

        $result = $this->searchWithFallback($params);

        if (!empty($query) && strlen($query) >= 2) {
            Cache::put($cacheKey, $result, 120);
        }

        return $result;
    }

    private function searchWithFallback(array $params): array
    {
        $query = $params['search_query'] ?? '';
        $categoryId = $params['category_id'] ?? null;
        $limit = $params['limit'] ?? 60;
        $fallbackLevel = 0;

        $scoredResults = $this->executeSearch($params);
        $formatted = $this->extractFormattedResults($scoredResults, $limit);

        if (count($formatted) < 3 && !empty($params['location'])) {
            $relaxed = $params;
            unset($relaxed['location']);
            $scoredResults = $this->executeSearch($relaxed);
            $formatted = $this->extractFormattedResults($scoredResults, $limit);
            $fallbackLevel = 1;
        }

        if (count($formatted) < 3 && !empty($query)) {
            $relaxed = $params;
            $relaxed['broad_match'] = true;
            $scoredResults = $this->executeSearch($relaxed);
            $formatted = $this->extractFormattedResults($scoredResults, $limit);
            $fallbackLevel = 2;
        }

        if (count($formatted) < 3 && $categoryId) {
            $scoredResults = $this->executeSearch([
                'category_id' => $categoryId,
                'limit' => $limit,
            ]);
            $formatted = $this->extractFormattedResults($scoredResults, $limit);
            $fallbackLevel = 3;
        }

        if (empty($formatted)) {
            $scoredResults = $this->executeSearch(['limit' => $limit]);
            $formatted = $this->extractFormattedResults($scoredResults, $limit);
            $fallbackLevel = 4;
        }

        $ads = array_filter(array_map(fn($i) => $i['ad'], $scoredResults));
        $relatedAds = $this->findRelatedAds($scoredResults, $categoryId, (int) ($limit / 3));
        $autocomplete = $this->getAutocompleteSuggestions($query, $ads);

        return [
            'results' => $formatted,
            'related_ads' => $relatedAds,
            'autocomplete_suggestions' => $autocomplete,
            'total' => count($formatted),
            'query' => $query,
            'fallback_level' => $fallbackLevel,
        ];
    }

    private function executeSearch(array $params): array
    {
        $query = $params['search_query'] ?? '';
        $categoryId = $params['category_id'] ?? null;
        $subcategoryId = $params['subcategory_id'] ?? null;
        $minPrice = $params['min_price'] ?? null;
        $maxPrice = $params['max_price'] ?? null;
        $location = $params['location'] ?? null;
        $limit = $params['limit'] ?? 60;
        $broadMatch = $params['broad_match'] ?? false;

        $attrFilters = [];
        foreach ($params as $key => $value) {
            if (str_starts_with($key, 'attr_') && $value !== null && $value !== '') {
                $attrFilters[substr($key, 5)] = $value;
            }
        }

        $ads = $this->buildQuery($query, $categoryId, $subcategoryId, $minPrice, $maxPrice, $location, $attrFilters, $broadMatch)
            ->limit($limit)
            ->get();

        return $this->scoreAndSort($ads, $query, $categoryId);
    }

    private function extractFormattedResults(array $scoredResults, int $limit): array
    {
        $results = [];
        foreach ($scoredResults as $item) {
            if ($item['ad']) {
                $results[] = $this->formatAdForResponse($item['ad']);
            }
        }
        return array_slice($results, 0, $limit);
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

    private function buildQuery(string $query, ?int $categoryId, ?int $subcategoryId, ?float $minPrice, ?float $maxPrice, ?string $location, array $attrFilters = [], bool $broadMatch = false)
    {
        $baseQuery = Ad::with(['images', 'category', 'location', 'user'])
            ->active()
            ->where(function($q) {
                $q->where('is_seeded', true)
                  ->orWhere(fn($sq) => $sq->where('is_seeded', false)->where('processing_status', 'completed'));
            });

        if ($query) {
            $searchTerms = $this->extractKeywords($query, $broadMatch);
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
            $exactLocation = $this->resolveLocationExact($location);
            $fuzzyLocation = null;
            if (!$exactLocation) {
                $fuzzyLocation = $this->resolveLocationFuzzy($location);
            }
            $matchedLocation = $exactLocation ?: $fuzzyLocation;

            if ($matchedLocation) {
                $baseQuery->whereHas('location', fn($q) => $q->where('name', $matchedLocation)
                    ->orWhere('slug', Str::slug($matchedLocation)));
            } else {
                $baseQuery->whereHas('location', fn($q) => $q->where('name', 'like', '%' . $location . '%')
                    ->orWhere('slug', 'like', '%' . Str::slug($location) . '%'));
            }
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

    private function extractKeywords(string $text, bool $broadMatch = false): array
    {
        $text = strtolower($text);
        $text = preg_replace('/[^\p{L}\p{N}\s]/u', ' ', $text);
        $words = preg_split('/\s+/', $text, -1, PREG_SPLIT_NO_EMPTY);

        if ($broadMatch) {
            return $words;
        }

        $normalized = array_map(fn($w) => $this->normalizeWord($w), $words);

        return array_values(array_filter($normalized, fn($word) =>
            strlen($word) >= 2 && !in_array($word, $this->stopWords)
        ));
    }

    private function normalizeWord(string $word): string
    {
        $word = strtolower($word);
        if (strlen($word) < 3) return $word;
        if (preg_match('/^(.+?)ies$/', $word, $m)) return $m[1] . 'y';
        if (preg_match('/^(.+?)(?:ves)$/', $word, $m)) return $m[1] . 'f';
        if (preg_match('/^(.+?)(?:es)$/', $word, $m) && strlen($m[1]) >= 2) return $m[1];
        if (preg_match('/^(.+?)s$/', $word, $m) && !preg_match('/ss$/', $word)) return $m[1];
        return $word;
    }

    private function resolveLocationExact(string $location): ?string
    {
        return \App\Models\Location::where('name', $location)
            ->orWhere('slug', Str::slug($location))
            ->value('name');
    }

    private function resolveLocationFuzzy(string $location): ?string
    {
        $location = strtolower(trim($location));
        $allLocations = \App\Models\Location::select('name', 'slug')->get();
        $bestMatch = null;
        $bestDistance = 3;

        foreach ($allLocations as $loc) {
            foreach ([$loc->name, str_replace('-', ' ', $loc->slug)] as $candidate) {
                $candidateLower = strtolower($candidate);
                $dist = levenshtein($location, $candidateLower);
                if ($dist < $bestDistance) {
                    $bestDistance = $dist;
                    $bestMatch = $loc->name;
                }
                foreach (explode(' ', $candidateLower) as $part) {
                    if (strlen($part) < 3) continue;
                    $partDist = levenshtein($location, $part);
                    if ($partDist < $bestDistance) {
                        $bestDistance = $partDist;
                        $bestMatch = $loc->name;
                    }
                }
            }
        }

        return $bestMatch;
    }

    private function detectIntent(string $query): array
    {
        $queryLower = strtolower($query);
        $intent = 'browse';
        $hasPriceIntent = false;

        $rentPatterns = ['/^rent\b/', '/\brent\b/', '/\blease\b/', '/\bshortlet\b/', '/\bshort let\b/',
            '/\bfor rent\b/', '/\brental\b/', '/\bmonthly\b/'];
        foreach ($rentPatterns as $pattern) {
            if (preg_match($pattern, $queryLower)) { $intent = 'rent'; break; }
        }

        if ($intent === 'browse') {
            $buyPatterns = ['/\bbuy\b/', '/\bpurchase\b/', '/\bshop\b/', '/\bwanted\b/', '/\blooking for\b/'];
            foreach ($buyPatterns as $pattern) {
                if (preg_match($pattern, $queryLower)) { $intent = 'buy'; break; }
            }
        }

        $pricePatterns = ['/\bprice\b/', '/\bcost\b/', '/\bhow much\b/', '/\bcheap\b/', '/\bexpensive\b/',
            '/\baffordable\b/', '/\bbudget\b/', '/\bunder\b/', '/\blower\b/'];
        foreach ($pricePatterns as $pattern) {
            if (preg_match($pattern, $queryLower)) { $hasPriceIntent = true; break; }
        }

        return ['intent' => $intent, 'has_price_intent' => $hasPriceIntent];
    }

    private function scoreAndSort($ads, string $query, ?int $categoryId): array
    {
        $queryTerms = $this->extractKeywords($query);
        $queryLower = strtolower(trim($query));
        $results = [];

        if (!is_iterable($ads)) return $results;

        $boostData = app(BoostTierService::class)->getBoostedAdsForListing();
        $boostDataMap = $boostData['boost_data'] ?? [];
        $boostedAdIds = $boostData['boosted_ad_ids'] ?? [];

        foreach ($ads as $ad) {
            if (!$ad) continue;
            $score = 0;

            $isBoosted = isset($boostDataMap[$ad->id]);
            if ($isBoosted) {
                $score += 10000 + ($boostDataMap[$ad->id]['priority_score'] ?? 0);
            }

            $adTitle = strtolower($ad->title ?? '');
            $adTags = is_array($ad->tags) ? $ad->tags : [];
            $adSummary = strtolower($ad->ai_summary ?? '');
            $adDescription = strtolower($ad->description ?? '');

            if ($query) {
                if ($queryLower === $adTitle) {
                    $score += 7000;
                } elseif (preg_match('/\b' . preg_quote($queryLower, '/') . '\b/', $adTitle)) {
                    $score += 6000;
                } elseif (str_contains($adTitle, $queryLower)) {
                    $score += 5000;
                }

                if (count($queryTerms) > 0) {
                    $allInTitle = true;
                    foreach ($queryTerms as $term) {
                        if (str_contains($adTitle, $term)) {
                            $score += 40;
                        } else {
                            $allInTitle = false;
                        }
                        foreach ($adTags as $tag) {
                            if (stripos($tag, $term) !== false) { $score += 25; break; }
                        }
                        if (str_contains($adSummary, $term)) $score += 20;
                        if (str_contains($adDescription, $term)) $score += 15;
                    }
                    if ($allInTitle) $score += 1000;
                }
            }

            if ($categoryId && $ad->category_id == $categoryId) $score += 20;

            if ($ad->verification_status === 'verified') $score += 10;
            if ($ad->is_featured) $score += 5;

            if ($ad->ai_confidence >= 80) $score += 10;
            elseif ($ad->ai_confidence >= 60) $score += 5;

            if ($ad->quality_score) $score += min((int) $ad->quality_score, 20);

            $hoursSinceCreated = $ad->created_at->diffInHours(now());
            if ($hoursSinceCreated < 1) $score += 25;
            elseif ($hoursSinceCreated < 6) $score += 20;
            elseif ($hoursSinceCreated < 24) $score += 15;
            elseif ($hoursSinceCreated < 72) $score += 10;
            elseif ($hoursSinceCreated < 168) $score += 5;

            $results[] = [
                'score' => $score,
                'ad' => $ad,
                'is_boosted' => $isBoosted,
                'boost_priority' => $boostDataMap[$ad->id]['priority_score'] ?? 0,
            ];
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
            ->select('id', 'title', 'price', 'currency', 'category_id')
            ->limit(5)
            ->get()
            ->toArray();

        $locationSuggestions = \App\Models\Location::where(function($q) use ($terms) {
                foreach ($terms as $term) {
                    $q->orWhere('name', 'like', '%' . $term . '%');
                }
            })
            ->select('id', 'name', 'slug')
            ->limit(5)
            ->get()
            ->toArray();

        return [
            'categories' => $categorySuggestions,
            'ads' => $adSuggestions,
            'locations' => $locationSuggestions,
        ];
    }
}
