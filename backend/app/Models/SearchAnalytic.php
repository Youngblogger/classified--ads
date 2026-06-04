<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SearchAnalytic extends Model
{
    protected $fillable = [
        'query',
        'normalized_query',
        'location',
        'category_id',
        'fallback_level',
        'results_count',
        'results_before_fallback',
        'intent',
        'has_price_intent',
        'engine',
        'user_id',
        'ip_address',
        'session_id',
        'duration_ms',
    ];

    public $timestamps = false;

    public function scopeNoResults($query)
    {
        return $query->where('results_count', 0);
    }

    public function scopeWithFallback($query)
    {
        return $query->where('fallback_level', '>', 0);
    }

    public function scopeRecent($query, int $minutes = 60)
    {
        return $query->where('created_at', '>=', now()->subMinutes($minutes));
    }
}
