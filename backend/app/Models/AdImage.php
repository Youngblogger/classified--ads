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
        'medium_url',
        'thumbnail_url',
        'file_size',
        'width',
        'height',
        'is_primary',
        'sort_order',
        'public_id',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'file_size' => 'integer',
        'width' => 'integer',
        'height' => 'integer',
    ];

    protected $appends = ['display_url', 'thumbnail', 'full_url', 'full_thumbnail_url'];

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

    public function getFullUrlAttribute(): string
    {
        $url = $this->url ?? $this->original_url ?? '';
        if (empty($url)) return '';
        return $this->buildFullUrl($url);
    }

    public function getFullThumbnailUrlAttribute(): string
    {
        $url = $this->thumbnail_url ?? $this->url ?? $this->original_url ?? '';
        if (empty($url)) return '';
        return $this->buildFullUrl($url);
    }

    protected function buildFullUrl(string $path): string
    {
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }
        $baseUrl = rtrim(config('app.url'), '/');
        if (!str_starts_with($path, '/')) {
            $path = '/' . $path;
        }
        return $baseUrl . $path;
    }
}
