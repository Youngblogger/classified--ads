<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SocialPostLog extends Model
{
    protected $fillable = [
        'ad_id',
        'scheduled_post_id',
        'platform',
        'status',
        'platform_post_id',
        'platform_post_url',
        'error_message',
        'attempt_count',
        'api_response',
    ];

    protected $casts = [
        'api_response' => 'array',
    ];

    public function ad(): BelongsTo
    {
        return $this->belongsTo(Ad::class);
    }

    public function scheduledPost(): BelongsTo
    {
        return $this->belongsTo(ScheduledPost::class);
    }
}
