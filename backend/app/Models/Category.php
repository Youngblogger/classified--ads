<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    protected $fillable = ['name', 'slug', 'icon', 'description', 'parent_id', 'ad_count', 'is_active', 'sort_order'];

    protected $casts = ['is_active' => 'boolean'];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    public function ads(): HasMany
    {
        return $this->hasMany(Ad::class);
    }

    public function allChildren(): HasMany
    {
        return $this->children()->with('allChildren');
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
