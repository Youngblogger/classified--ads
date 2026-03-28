<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ScheduledPost extends Model
{
    protected $fillable = [
        'ad_id',
        'scheduled_time',
        'status',
        'platform_statuses',
        'created_by',
    ];

    protected $casts = [
        'scheduled_time' => 'datetime',
        'platform_statuses' => 'array',
    ];

    public function ad(): BelongsTo
    {
        return $this->belongsTo(Ad::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function logs(): HasMany
    {
        return $this->hasMany(SocialPostLog::class, 'scheduled_post_id');
    }
}
