<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Store extends Model
{
    protected $fillable = [
        'user_id', 'name', 'slug', 'description', 'logo', 'logo_public_id',
        'banner', 'banner_public_id', 'email', 'phone', 'address', 'location_id',
        'website', 'social_links', 'is_verified', 'verification_document',
        'verification_status', 'verified_at', 'verified_by', 'status', 'settings',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
        'social_links' => 'array',
        'settings' => 'array',
    ];

    protected $appends = ['logo_url', 'banner_url', 'followers_count', 'active_ads_count'];

    protected static function booted()
    {
        static::creating(function ($store) {
            if (empty($store->slug)) {
                $store->slug = Str::slug($store->name) . '-' . Str::random(5);
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function followers(): HasMany
    {
        return $this->hasMany(StoreFollower::class);
    }

    public function ads()
    {
        return $this->hasMany(Ad::class, 'store_id');
    }

    public function analytics()
    {
        return $this->hasMany(StoreAnalytic::class);
    }

    public function getLogoUrlAttribute(): ?string
    {
        if ($this->logo) {
            return asset('storage/' . $this->logo);
        }
        return null;
    }

    public function getBannerUrlAttribute(): ?string
    {
        if ($this->banner) {
            return asset('storage/' . $this->banner);
        }
        return null;
    }

    public function getFollowersCountAttribute(): int
    {
        return $this->followers()->count();
    }

    public function getActiveAdsCountAttribute(): int
    {
        return $this->ads()->where('status', 'active')->count();
    }

    public function isFollowedBy(int $userId): bool
    {
        return $this->followers()->where('user_id', $userId)->exists();
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }
}
