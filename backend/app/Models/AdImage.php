<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdImage extends Model
{
    protected $fillable = [
        'ad_id',
        'url',
        'original_url',
        'thumbnail_url',
        'file_size',
        'is_primary',
        'sort_order',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'file_size' => 'integer',
    ];

    protected $appends = ['display_url', 'thumbnail'];

    public function ad(): BelongsTo
    {
        return $this->belongsTo(Ad::class);
    }

    public function getDisplayUrlAttribute(): string
    {
        return $this->url ?? $this->original_url ?? '';
    }

    public function getThumbnailAttribute(): string
    {
        return $this->thumbnail_url ?? $this->url ?? $this->original_url ?? '';
    }
}
