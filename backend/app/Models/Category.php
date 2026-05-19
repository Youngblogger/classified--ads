<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    protected $fillable = [
        'name', 'slug', 'icon', 'image', 'description', 'parent_id', 'level',
        'ad_count', 'is_active', 'is_featured', 'is_trending', 'category_badge',
        'meta_title', 'meta_description', 'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'is_trending' => 'boolean',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    public function activeChildren(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id')->where('is_active', true)->orderBy('sort_order')->orderBy('name');
    }

    public function ads(): HasMany
    {
        return $this->hasMany(Ad::class);
    }

    public function allChildren(): HasMany
    {
        return $this->children()->with('allChildren');
    }

    public function categoryFields(): HasMany
    {
        return $this->hasMany(CategoryField::class, 'category_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeParents($query)
    {
        return $query->whereNull('parent_id');
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    public function getAllDescendantsAttribute()
    {
        $descendants = collect();
        foreach ($this->children as $child) {
            $descendants->push($child);
            $descendants = $descendants->merge($child->allDescendants);
        }
        return $descendants;
    }
}
