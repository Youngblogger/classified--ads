<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ad extends Model
{
    protected $fillable = [
        'user_id', 'category_id', 'location_id', 'title', 'slug', 'description',
        'price', 'currency', 'condition', 'status', 'is_featured', 'is_verified',
        'views', 'phone', 'whatsapp', 'expires_at', 'lga'
    ];

    protected $casts = ['is_featured' => 'boolean', 'is_verified' => 'boolean', 'price' => 'decimal:2'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
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
