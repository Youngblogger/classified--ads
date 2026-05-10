<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BoostedAd extends Model
{
    protected $fillable = [
        'ad_id',
        'plan_id',
        'user_id',
        'boost_type',
        'priority_score',
        'start_time',
        'end_time',
        'status',
        'payment_reference',
        'payment_intent_id',
        'paid_from',
        'impressions',
        'clicks',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'priority_score' => 'integer',
    ];

    public function ad(): BelongsTo
    {
        return $this->belongsTo(Ad::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(BoostPlan::class, 'plan_id');
    }

    public function paymentIntent(): BelongsTo
    {
        return $this->belongsTo(PaymentIntent::class, 'payment_intent_id');
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

    public function scopeByPriority($query)
    {
        return $query->orderBy('priority_score', 'desc')
            ->orderBy('start_time', 'desc');
    }

    public function getCtrAttribute(): float
    {
        return $this->impressions > 0
            ? round($this->clicks / $this->impressions * 100, 2)
            : 0;
    }

    public function getPlanNameAttribute(): ?string
    {
        return $this->plan?->name ?? $this->boost_type;
    }

    public function getBadgeLabelAttribute(): ?string
    {
        return $this->plan?->badge_label ?? ucfirst($this->boost_type);
    }
}
