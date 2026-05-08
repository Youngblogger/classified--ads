<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Ad extends Model
{
    protected $fillable = [
        'user_id', 'category_id', 'subcategory_id', 'location_id', 'title', 'slug', 'description',
        'short_description', 'attributes', 'currency', 'condition', 'status', 'is_featured', 'is_verified',
        'views', 'clicks_count', 'whatsapp_clicks', 'share_count', 'phone', 'whatsapp', 'expires_at', 'lga', 'state',
        'tags', 'ai_summary', 'image_validation', 'verification_status', 'processing_status',
        'ai_category_id', 'ai_confidence', 'is_auto_categorized', 'rejection_reason', 'processed_at', 'price',
        'edited_by_admin'
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'is_verified' => 'boolean',
        'price' => 'decimal:2',
        'tags' => 'array',
        'image_validation' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function subcategory(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'subcategory_id');
    }

    public function aiCategory(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'ai_category_id');
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(AdImage::class)->orderBy('sort_order')->orderBy('is_primary', 'desc');
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    public function boostedAds(): HasMany
    {
        return $this->hasMany(BoostedAd::class);
    }

    public function savedByUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'saved_ads')->withTimestamps();
    }

    public function activeBoost()
    {
        return $this->hasOne(BoostedAd::class)->where('status', 'active')->where('end_time', '>', now());
    }

    public function savedByCurrentUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'saved_ads')->withTimestamps();
    }

    public function getStateAttribute($value)
    {
        if ($value) {
            return $value;
        }
        
        return $this->location ? $this->location->name : null;
    }
}
