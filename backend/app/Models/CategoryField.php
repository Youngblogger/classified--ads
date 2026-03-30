<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class CategoryField extends Model
{
    protected $fillable = [
        'category_id',
        'name',
        'label',
        'type',
        'options',
        'is_required',
        'sort_order',
        'group_name',
    ];

    protected $casts = [
        'options' => 'array',
        'is_required' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function scopeForCategory(Builder $query, int $categoryId): Builder
    {
        return $query->where('category_id', $categoryId)->ordered();
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('group_name')->orderBy('sort_order')->orderBy('id');
    }

    public function scopeGrouped(Builder $query): array
    {
        $fields = $query->get();
        
        return $fields->groupBy('group_name')->map(function ($group) {
            return $group->values();
        })->toArray();
    }

    public function getOptionsAttribute($value)
    {
        if (is_array($value)) {
            return $value;
        }
        if (is_string($value)) {
            return json_decode($value, true) ?? [];
        }
        return $value ?? [];
    }
}
