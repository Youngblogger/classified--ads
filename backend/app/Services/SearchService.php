<?php

namespace App\Services;

use App\Models\Ad;
use App\Models\Category;
use Illuminate\Support\Facades\DB;
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

        $ads = $this->buildQuery($query, $categoryId, $minPrice, $maxPrice, $location)
            ->where('processing_status', 'completed')
            ->where('status', 'active')
            ->get();

        $results = $this->scoreAndSort($ads, $query, $categoryId);

        $results = array_slice($results, 0, $limit);

        $relatedAds = $this->findRelatedAds($results, $categoryId, $limit);

        $autocomplete = $this->getAutocompleteSuggestions($query, $results);

        return [
            'results' => $results,
            'related_ads' => $relatedAds,
            'autocomplete_suggestions' => $autocomplete,
            'total' => count($results),
            'query' => $query,
        ];
    }

    private function buildQuery(string $query, ?int $categoryId, ?float $minPrice, ?float $maxPrice, ?string $location)
    {
        $baseQuery = Ad::with(['images', 'category', 'location']);

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
                'ad_id' => $ad->id,
                'title' => $ad->title,
                'price' => (float) $ad->price,
                'currency' => $ad->currency,
                'location' => $ad->location?->name,
                'category' => $ad->category?->name,
                'relevance_score' => min(100, $score),
                'matched_on' => $matchedOn,
                'verified' => $ad->verification_status === 'verified',
                'featured' => $ad->is_featured,
                'ai_confidence' => $ad->ai_confidence,
                'created_at' => $ad->created_at->toIso8601String(),
                'tags' => $adTags,
                'images' => $ad->images->take(3)->map(fn($img) => [
                    'url' => $img->thumbnail_url ?? $img->url,
                    'is_primary' => $img->is_primary,
                ])->toArray(),
            ];
        }

        usort($results, function($a, $b) {
            if ($b['relevance_score'] !== $a['relevance_score']) {
                return $b['relevance_score'] <=> $a['relevance_score'];
            }
            return $b['ai_confidence'] <=> $a['ai_confidence'];
        });

        return $results;
    }

    private function findRelatedAds(array $currentResults, ?int $categoryId, int $limit): array
    {
        if (empty($currentResults)) {
            return [];
        }

        $adIds = array_column($currentResults, 'ad_id');
        $firstAd = reset($currentResults);
        
        $query = Ad::with(['images', 'category', 'location'])
            ->where('processing_status', 'completed')
            ->where('status', 'active')
            ->whereNotIn('id', $adIds);

        if ($categoryId) {
            $categoryIds = $this->getCategoryAndDescendants($categoryId);
            $query->whereIn('category_id', $categoryIds);
        } else {
            $categoryIds = [];
            foreach ($currentResults as $result) {
                $ad = Ad::find($result['ad_id']);
                if ($ad) {
                    $categoryIds[] = $ad->category_id;
                }
            }
            if (!empty($categoryIds)) {
                $query->whereIn('category_id', array_unique($categoryIds));
            }
        }

        $relatedAds = $query->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        $results = [];
        foreach ($relatedAds as $ad) {
            $reasons = [];
            
            if ($ad->category_id == ($firstAd['category'] ?? null)) {
                $reasons[] = 'Similar category';
            }

            $adTags = is_array($ad->tags) ? $ad->tags : [];
            if (!empty($adTags)) {
                $reasons[] = 'Related tags';
            }

            if ($ad->ai_confidence >= 70) {
                $reasons[] = 'AI verified';
            }

            $results[] = [
                'ad_id' => $ad->id,
                'title' => $ad->title,
                'price' => (float) $ad->price,
                'location' => $ad->location?->name,
                'relevance_reason' => implode(', ', $reasons) ?: 'Similar category and tags',
                'image' => $ad->images->first()?->thumbnail_url ?? $ad->images->first()?->url,
            ];
        }

        return $results;
    }

    private function getAutocompleteSuggestions(string $query, array $results): array
    {
        $suggestions = [];
        $queryLower = strtolower($query);
        
        $titleMatches = [];
        $tagMatches = [];
        
        foreach ($results as $result) {
            $title = strtolower($result['title'] ?? '');
            
            if (stripos($title, $queryLower) !== false && !in_array($result['title'], $titleMatches)) {
                $titleMatches[] = $result['title'];
            }
            
            $tags = is_array($result['tags'] ?? []) ? $result['tags'] : [];
            foreach ($tags as $tag) {
                $tagLower = strtolower($tag);
                if (stripos($tagLower, $queryLower) !== false && !in_array($tag, $tagMatches)) {
                    $tagMatches[] = $tag;
                }
            }
        }
        
        $suggestions = array_merge($titleMatches, $tagMatches);
        
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

        $adSuggestions = Ad::where('processing_status', 'completed')
            ->where('status', 'active')
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
