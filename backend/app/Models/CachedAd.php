<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CachedAd extends Model
{
    protected $fillable = [
        'ad_id', 'category_id', 'location_id', 'user_id',
        'data', 'boost_data', 'expires_at',
    ];

    protected $casts = [
        'data' => 'array',
        'boost_data' => 'array',
        'expires_at' => 'datetime',
    ];

    public function ad()
    {
        return $this->belongsTo(Ad::class);
    }
}
