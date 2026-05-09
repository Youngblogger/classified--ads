<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BoostPlan extends Model
{
    protected $fillable = [
        'name',
        'type',
        'price',
        'duration_days',
        'priority_score',
        'badge_label',
        'badge_icon',
        'color_scheme',
        'features',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'color_scheme' => 'array',
        'features' => 'array',
        'is_active' => 'boolean',
    ];

    public function boostedAds(): HasMany
    {
        return $this->hasMany(BoostedAd::class, 'plan_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('price');
    }

    public function getFormattedPriceAttribute(): string
    {
        return '₦' . number_format($this->price, 0);
    }

    public static function getDefaultPlans(): array
    {
        return [
            [
                'name' => 'Silver Boost',
                'type' => 'silver',
                'price' => 2000,
                'duration_days' => 3,
                'priority_score' => 1000,
                'badge_label' => 'Boosted',
                'badge_icon' => 'zap',
                'color_scheme' => [
                    'gradient' => 'from-slate-400 via-slate-300 to-slate-400',
                    'border' => 'from-slate-300 to-slate-400',
                    'glow' => 'shadow-slate-400/30',
                    'text' => 'text-slate-900',
                    'bg' => 'bg-gradient-to-r from-slate-50 to-gray-50',
                    'accent' => '#94a3b8',
                ],
                'features' => [
                    'Appears above normal listings',
                    'Highlighted ad card',
                    'Better search ranking',
                    '"Boosted" badge',
                    'Increased impressions',
                ],
                'sort_order' => 1,
            ],
            [
                'name' => 'Gold Featured',
                'type' => 'gold',
                'price' => 5000,
                'duration_days' => 7,
                'priority_score' => 2000,
                'badge_label' => 'Featured',
                'badge_icon' => 'crown',
                'color_scheme' => [
                    'gradient' => 'from-amber-400 via-yellow-300 to-amber-400',
                    'border' => 'from-amber-400 to-amber-600',
                    'glow' => 'shadow-amber-400/30',
                    'text' => 'text-amber-900',
                    'bg' => 'bg-gradient-to-r from-amber-50 to-yellow-50',
                    'accent' => '#f59e0b',
                ],
                'features' => [
                    'Homepage exposure',
                    'Priority category placement',
                    'Higher search visibility',
                    '"Featured" badge',
                    'More impressions than Silver',
                ],
                'sort_order' => 2,
            ],
            [
                'name' => 'Platinum VIP',
                'type' => 'platinum',
                'price' => 10000,
                'duration_days' => 14,
                'priority_score' => 3000,
                'badge_label' => 'VIP',
                'badge_icon' => 'diamond',
                'color_scheme' => [
                    'gradient' => 'from-violet-500 via-purple-400 to-violet-500',
                    'border' => 'from-violet-400 to-purple-600',
                    'glow' => 'shadow-purple-400/30',
                    'text' => 'text-purple-900',
                    'bg' => 'bg-gradient-to-r from-purple-50 to-violet-50',
                    'accent' => '#8b5cf6',
                ],
                'features' => [
                    'Top homepage placement',
                    'Always pinned above lower tiers',
                    'Highest search priority',
                    'VIP animated badge',
                    'Priority in recommended ads',
                    'Increased click visibility',
                    'Extra premium styling',
                ],
                'sort_order' => 3,
            ],
        ];
    }
}
