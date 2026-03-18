<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdImage extends Model
{
    protected $fillable = ['ad_id', 'url', 'is_primary', 'sort_order'];

    protected $casts = ['is_primary' => 'boolean'];

    public function ad(): BelongsTo
    {
        return $this->belongsTo(Ad::class);
    }
}
