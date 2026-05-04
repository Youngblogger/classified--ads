<?php

namespace App\Services;

use App\Models\Ad;
use App\Models\Category;
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
        $minPrice = $params['min_price'] ?? null;
        $maxPrice = $params['max_price'] ?? null;
        $location = $params['location'] ?? null;
        $limit = $params['limit'] ?? 20;

        Log::info('SearchService::search - Params: ', $params);

        $ads = $this->buildQuery($query, $categoryId, $minPrice, $maxPrice, $location)->get();

        Log::info('SearchService::search - Found ads: ' . count($ads));

        $scoredResults = $this->scoreAndSort($ads, $query, $categoryId);

        // Extract and format Ad objects
        $results = [];
        foreach ($scoredResults as $item) {
            $ad = $item['ad'];
            $results[] = $this->formatAdForResponse($ad);
        }

        $results = array_slice($results, 0, $limit);

        $relatedAds = $this->findRelatedAds($scoredResults, $categoryId, $limit);

        $autocomplete = $this->getAutocompleteSuggestions($query, $ads);

        return [
            'results' => $results,
            'related_ads' => $relatedAds,
            'autocomplete_suggestions' => $autocomplete,
            'total' => count($results),
            'query' => $query,
        ];
    }

    private function formatAdForResponse($ad): array
    {
        return [
            'id' => $ad->id,
            'slug' => $ad->slug ?? 'ad-' . $ad->id,
            'title' => $ad->title,
            'description' => $ad->description ?? '',
            'price' => (float) $ad->price,
            'currency' => $ad->currency ?? 'NGN',
            'condition' => $ad->condition,
            'status' => $ad->status,
            'views' => $ad->views ?? 0,
            'created_at' => $ad->created_at ? $ad->created_at->toIso8601String() : null,
            'updated_at' => $ad->updated_at ? $ad->updated_at->toIso8601String() : null,
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
            'state' => $ad->state ?? ($ad->location ? $ad->location->name : null),
            'lga' => $ad->lga,
            'images' => $ad->images ? $ad->images->map(function($img) {
                return [
                    'id' => $img->id,
                    'url' => $img->url,
                    'full_url' => $img->full_url ?? $img->url,
                    'thumbnail_url' => $img->thumbnail_url,
                    'is_primary' => (bool) $img->is_primary,
                ];
            })->toArray() : [],
            'is_featured' => (bool) $ad->is_featured,
            'is_verified' => (bool) $ad->is_verified,
        ];
    }

    private function buildQuery(string $query, ?int $categoryId, ?float $minPrice, ?float $maxPrice, ?string $location)
    {
        $baseQuery = Ad::with(['images', 'category', 'location', 'user'])
            ->where('status', 'active')
            ->where(function($q) {
                $q->where('is_seeded', true)
                  ->orWhere(function($sq) {
                      $sq->where('is_seeded', false)
                         ->where('processing_status', 'completed');
                  });
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

        if ($minPrice !== null) {
            $baseQuery->where('price', '>=', $minPrice);
        }

        if ($maxPrice !== null) {
            $baseQuery->where('price', '<=', $maxPrice);
        }

        if ($location) {
            $baseQuery->whereHas('location', function($q) use ($location) {
                $q->where('name', 'like', '%' . $location . '%')
                  ->orWhere('slug', 'like', '%' . Str::slug($location) . '%');
            });
        }

        return $baseQuery;
    }

    private function getCategoryAndDescendants(int $categoryId): array
    {
        $ids = [$categoryId];
        
        $descendants = Category::where('parent_id', $categoryId)->pluck('id')->toArray();
        $ids = array_merge($ids, $descendants);
        
        foreach ($descendants as $descendantId) {
            $ids = array_merge($ids, $this->getCategoryAndDescendants($descendantId));
        }
        
        return array_unique($ids);
    }

    private function extractKeywords(string $text): array
    {
        $text = strtolower($text);
        $text = preg_replace('/[^\p{L}\p{N}\s]/u', ' ', $text);
        $words = preg_split('/\s+/', $text, -1, PREG_SPLIT_NO_EMPTY);

        $filtered = array_filter($words, function($word) {
            return strlen($word) >= 2 && !in_array($word, $this->stopWords);
        });

        return array_values($filtered);
    }

    private function scoreAndSort($ads, string $query, ?int $categoryId): array
    {
        $queryTerms = $this->extractKeywords($query);
        $results = [];

        foreach ($ads as $ad) {
            $score = 0;
            $matchedOn = [];

            $adTitle = strtolower($ad->title ?? '');
            $adTags = is_array($ad->tags) ? $ad->tags : [];
            $adSummary = strtolower($ad->ai_summary ?? '');
            $adDescription = strtolower($ad->description ?? '');

            foreach ($queryTerms as $term) {
                if (strpos($adTitle, $term) !== false) {
                    $score += 40;
                    if (!in_array('title', $matchedOn)) {
                        $matchedOn[] = 'title';
                    }
                }

                foreach ($adTags as $tag) {
                    if (stripos($tag, $term) !== false) {
                        $score += 25;
                        if (!in_array('tags', $matchedOn)) {
                            $matchedOn[] = 'tags';
                        }
                    }
                }

                if (strpos($adSummary, $term) !== false || strpos($adDescription, $term) !== false) {
                    $score += 15;
                    if (!in_array('ai_summary', $matchedOn) && !in_array('description', $matchedOn)) {
                        $matchedOn[] = 'ai_summary';
                    }
                }
            }

            if ($categoryId && $ad->category_id == $categoryId) {
                $score += 20;
            }

            if ($ad->verification_status === 'verified') {
                $score += 10;
            }

            if ($ad->ai_confidence >= 80) {
                $score += 10;
            } elseif ($ad->ai_confidence >= 60) {
                $score += 5;
            }

            $daysSinceCreated = $ad->created_at->diffInDays(now());
            if ($daysSinceCreated < 1) {
                $score += 15;
            } elseif ($daysSinceCreated < 7) {
                $score += 10;
            } elseif ($daysSinceCreated < 30) {
                $score += 5;
            }

            if ($ad->is_featured) {
                $score += 5;
            }

            $results[] = [
                'score' => $score,
                'ad' => $ad,
            ];
        }

        usort($results, function($a, $b) {
            return $b['score'] <=> $a['score'];
        });

        return $results;
    }

    private function findRelatedAds(array $scoredResults, ?int $categoryId, int $limit): array
    {
        if (empty($scoredResults)) {
            return [];
        }

        $adIds = array_map(function($item) { return $item['ad']->id; }, $scoredResults);
        $firstAd = reset($scoredResults)['ad'];
        
        $query = Ad::with(['images', 'category', 'location'])
            ->where('status', 'active')
            ->where(function($q) {
                $q->where('is_seeded', true)
                  ->orWhere(function($sq) {
                      $sq->where('is_seeded', false)
                         ->where('processing_status', 'completed');
                  });
            })
            ->whereNotIn('id', $adIds);

        if ($categoryId) {
            $categoryIds = $this->getCategoryAndDescendants($categoryId);
            $query->whereIn('category_id', $categoryIds);
        } else {
            if ($firstAd && isset($firstAd->category_id)) {
                $query->where('category_id', $firstAd->category_id);
            }
        }

        $relatedAds = $query->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        return $relatedAds->map(function($ad) {
            return $this->formatAdForResponse($ad);
        })->toArray();
    }

    private function getAutocompleteSuggestions(string $query, $ads): array
    {
        $suggestions = [];
        $queryLower = strtolower($query);
        
        $titleMatches = [];
        
        foreach ($ads as $ad) {
            $title = strtolower($ad->title ?? '');
            
            if (stripos($title, $queryLower) !== false && !in_array($ad->title, $titleMatches)) {
                $titleMatches[] = $ad->title;
            }
        }
        
        $suggestions = $titleMatches;
        
        if (count($suggestions) < 5) {
            $categoryMatches = Category::where('is_active', true)
                ->where('name', 'like', '%' . $query . '%')
                ->pluck('name')
                ->toArray();
            
            $suggestions = array_merge($suggestions, $categoryMatches);
        }
        
        return array_slice(array_unique($suggestions), 0, 10);
    }

    public function getSuggestions(string $query): array
    {
        $terms = $this->extractKeywords($query);
        
        if (empty($terms)) {
            return [];
        }

        $suggestions = [];
        
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

        $adSuggestions = Ad::where('status', 'active')
            ->where(function($q) {
                $q->where('is_seeded', true)
                  ->orWhere(function($sq) {
                      $sq->where('is_seeded', false)
                         ->where('processing_status', 'completed');
                  });
            })
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
