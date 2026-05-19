<?php

namespace App\Services;

use App\Models\Ad;
use App\Models\Category;
use App\Models\CategoryField;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class FilterMetaService
{
    public function getMeta(?string $categorySlug, ?string $subcategorySlug): array
    {
        $cacheKey = 'filter_meta_' . ($categorySlug ?? 'all') . '_' . ($subcategorySlug ?? 'all');

        return Cache::remember($cacheKey, 300, function () use ($categorySlug, $subcategorySlug) {
            $category = null;
            $subcategory = null;
            $categoryId = null;
            $subcategoryId = null;

            if ($subcategorySlug) {
                $subcategory = Category::where('slug', $subcategorySlug)->first();
                $subcategoryId = $subcategory?->id;
                if ($subcategory && $subcategory->parent_id) {
                    $categoryId = $subcategory->parent_id;
                    $category = Category::find($categoryId);
                }
            }

            if (!$category && $categorySlug) {
                $category = Category::where('slug', $categorySlug)->first();
                $categoryId = $category?->id;
            }

            $priceMeta = $this->computePriceMeta($categoryId, $subcategoryId);
            $filterType = $this->determineFilterType($category, $subcategory);
            $fields = $this->getFilterableFields($categoryId, $subcategoryId);
            $conditions = $this->getAvailableConditions($categoryId, $subcategoryId);
            $distribution = $this->getPriceDistribution($categoryId, $subcategoryId);

            return [
                'filter_type' => $filterType,
                'price_label' => $this->priceLabel($filterType),
                'currency' => 'NGN',
                'price' => $priceMeta,
                'price_distribution' => $distribution,
                'conditions' => $conditions,
                'fields' => $fields,
                'category' => $category ? ['id' => $category->id, 'name' => $category->name, 'slug' => $category->slug] : null,
                'subcategory' => $subcategory ? ['id' => $subcategory->id, 'name' => $subcategory->name, 'slug' => $subcategory->slug] : null,
            ];
        });
    }

    private function computePriceMeta(?int $categoryId, ?int $subcategoryId): array
    {
        $query = Ad::active()->where(function ($q) {
            $q->where('is_seeded', true)
              ->orWhere(fn($sq) => $sq->where('is_seeded', false)->where('processing_status', 'completed'));
        });

        if ($subcategoryId) {
            $query->where('subcategory_id', $subcategoryId);
        } elseif ($categoryId) {
            $query->whereIn('category_id', $this->getCategoryAndDescendantIds($categoryId));
        }

        $stats = (clone $query)->selectRaw(
            'COALESCE(MIN(price), 0) as min_price, COALESCE(MAX(price), 0) as max_price, COALESCE(AVG(price), 0) as avg_price, COUNT(*) as total'
        )->first();

        if (!$stats || $stats->total === 0) {
            return ['min' => 0, 'max' => 10000000, 'avg' => 0, 'total' => 0];
        }

        return [
            'min' => (float) $stats->min_price,
            'max' => (float) $stats->max_price,
            'avg' => round((float) $stats->avg_price, 2),
            'total' => (int) $stats->total,
        ];
    }

    private function getPriceDistribution(?int $categoryId, ?int $subcategoryId, int $buckets = 10): array
    {
        $query = Ad::active()->where(function ($q) {
            $q->where('is_seeded', true)
              ->orWhere(fn($sq) => $sq->where('is_seeded', false)->where('processing_status', 'completed'));
        });

        if ($subcategoryId) {
            $query->where('subcategory_id', $subcategoryId);
        } elseif ($categoryId) {
            $query->whereIn('category_id', $this->getCategoryAndDescendantIds($categoryId));
        }

        $stats = (clone $query)->selectRaw(
            'COALESCE(MIN(price), 0) as min_p, COALESCE(MAX(price), 0) as max_p'
        )->first();

        if (!$stats || $stats->min_p == $stats->max_p) {
            return [];
        }

        $min = (float) $stats->min_p;
        $max = (float) $stats->max_p;
        $bucketSize = ($max - $min) / $buckets;

        if ($bucketSize <= 0) return [];

        $cases = [];
        $labels = [];
        for ($i = 0; $i < $buckets; $i++) {
            $lo = $min + $i * $bucketSize;
            $hi = $min + ($i + 1) * $bucketSize;
            $cases[] = "WHEN price >= {$lo} AND price < {$hi} THEN {$i}";
            $labels[] = ['min' => round($lo), 'max' => round($hi), 'label' => $this->formatMoney($lo) . ' - ' . $this->formatMoney($hi)];
        }
        $cases[] = "WHEN price >= {$max} THEN " . ($buckets - 1);

        $distribution = (clone $query)->selectRaw(
            'CASE ' . implode(' ', $cases) . ' END as bucket, COUNT(*) as count'
        )->groupBy('bucket')->orderBy('bucket')->pluck('count', 'bucket')->toArray();

        $result = [];
        for ($i = 0; $i < $buckets; $i++) {
            $result[] = [
                'bucket' => $i,
                'count' => (int) ($distribution[$i] ?? 0),
                'label' => $labels[$i]['label'] ?? '',
                'min' => $labels[$i]['min'] ?? 0,
                'max' => $labels[$i]['max'] ?? 0,
            ];
        }

        return $result;
    }

    private function getFilterableFields(?int $categoryId, ?int $subcategoryId): array
    {
        $targetId = $subcategoryId ?? $categoryId;
        if (!$targetId) return [];

        $fields = CategoryField::where('category_id', $targetId)
            ->ordered()
            ->get()
            ->map(function ($field) {
                $filterType = match ($field->type) {
                    'number' => 'range',
                    'select' => 'select',
                    'multi_select' => 'multi_select',
                    'boolean' => 'boolean',
                    default => 'text',
                };
                return [
                    'name' => $field->name,
                    'label' => $field->label,
                    'type' => $field->type,
                    'filter_type' => $filterType,
                    'options' => $field->options ?? [],
                    'is_required' => $field->is_required,
                    'group_name' => $field->group_name,
                ];
            });

        return $fields->toArray();
    }

    private function getAvailableConditions(?int $categoryId, ?int $subcategoryId): array
    {
        $query = Ad::active()->where(function ($q) {
            $q->where('is_seeded', true)
              ->orWhere(fn($sq) => $sq->where('is_seeded', false)->where('processing_status', 'completed'));
        });

        if ($subcategoryId) {
            $query->where('subcategory_id', $subcategoryId);
        } elseif ($categoryId) {
            $query->whereIn('category_id', $this->getCategoryAndDescendantIds($categoryId));
        }

        $conditions = (clone $query)->whereNotNull('condition')
            ->select('condition', DB::raw('COUNT(*) as count'))
            ->groupBy('condition')
            ->orderByDesc('count')
            ->get()
            ->map(function ($row) {
                return [
                    'value' => $row->condition,
                    'label' => $this->conditionLabel($row->condition),
                    'count' => (int) $row->count,
                ];
            });

        return $conditions->toArray();
    }

    private function determineFilterType(?Category $category, ?Category $subcategory): string
    {
        $name = '';
        if ($subcategory) $name = $subcategory->name;
        elseif ($category) $name = $category->name;

        $lower = mb_strtolower($name);

        if (str_contains($lower, 'job') || str_contains($lower, 'employment')) return 'salary';
        if (str_contains($lower, 'service')) return 'fee';
        if (str_contains($lower, 'rent') || str_contains($lower, 'property') || str_contains($lower, 'house') || str_contains($lower, 'apartment')) return 'rent';
        if (str_contains($lower, 'vehicle') || str_contains($lower, 'car') || str_contains($lower, 'automotive')) return 'price';

        return 'price';
    }

    private function priceLabel(string $filterType): string
    {
        return match ($filterType) {
            'salary' => 'Salary',
            'fee' => 'Service Fee',
            'rent' => 'Rent',
            default => 'Price',
        };
    }

    private function conditionLabel(string $condition): string
    {
        return match ($condition) {
            'new' => 'Brand New',
            'like_new' => 'Like New',
            'good' => 'Used - Good',
            'fair' => 'Used - Fair',
            default => ucfirst(str_replace('_', ' ', $condition)),
        };
    }

    private function getCategoryAndDescendantIds(int $categoryId): array
    {
        return Cache::remember('filter_cat_desc_' . $categoryId, 3600, function () use ($categoryId) {
            $ids = [$categoryId];
            $children = Category::where('parent_id', $categoryId)->pluck('id')->toArray();
            foreach ($children as $childId) {
                $ids = array_merge($ids, $this->getCategoryAndDescendantIds($childId));
            }
            return array_unique($ids);
        });
    }

    private function formatMoney(float $amount): string
    {
        if ($amount >= 1000000) {
            return '₦' . number_format($amount / 1000000, 1) . 'M';
        }
        if ($amount >= 1000) {
            return '₦' . number_format($amount / 1000) . 'K';
        }
        return '₦' . number_format($amount);
    }
}
