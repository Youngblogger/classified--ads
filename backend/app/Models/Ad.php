<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ad extends Model
{
    protected $fillable = [
        'user_id', 'category_id', 'subcategory_id', 'location_id', 'title', 'slug', 'description',
        'short_description', 'attributes', 'currency', 'condition', 'status', 'is_featured', 'is_verified',
        'views', 'phone', 'whatsapp', 'expires_at', 'lga',
        'tags', 'ai_summary', 'image_validation', 'verification_status', 'processing_status',
        'ai_category_id', 'ai_confidence', 'is_auto_categorized', 'rejection_reason', 'processed_at', 'price'
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'is_verified' => 'boolean',
        'price' => 'decimal:2',
        'attributes' => 'array',
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
        return $this->hasMany(AdImage::class);
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }
}
