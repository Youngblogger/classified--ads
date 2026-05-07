<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BoostedAd extends Model
{
    protected $fillable = [
        'ad_id',
        'user_id',
        'boost_type',
        'start_time',
        'end_time',
        'status',
        'payment_reference',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];

    public function ad(): BelongsTo
    {
        return $this->belongsTo(Ad::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'active' && $this->end_time > now();
    }

    public function isExpired(): bool
    {
        return $this->status === 'expired' || $this->end_time <= now();
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active')
            ->where('end_time', '>', now());
    }

    public function scopeExpired($query)
    {
        return $query->where('status', 'active')
            ->where('end_time', '<=', now());
    }

    public function scopeForAd($query, int $adId)
    {
        return $query->where('ad_id', $adId);
    }
}
