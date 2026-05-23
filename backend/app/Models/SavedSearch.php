<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SavedSearch extends Model
{
    protected $fillable = [
        'user_id', 'name', 'search_params', 'frequency',
        'notify_email', 'notify_in_app', 'last_notified_at',
    ];

    protected $casts = [
        'search_params' => 'array',
        'notify_email' => 'boolean',
        'notify_in_app' => 'boolean',
        'last_notified_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeInstant($query)
    {
        return $query->where('frequency', 'instant');
    }

    public function scopeDaily($query)
    {
        return $query->where('frequency', 'daily');
    }

    public function scopeWeekly($query)
    {
        return $query->where('frequency', 'weekly');
    }

    public function scopeDueForNotification($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('last_notified_at')
                ->orWhere(function ($q2) {
                    $q2->where('frequency', 'daily')
                        ->whereRaw('last_notified_at < NOW() - INTERVAL 1 DAY');
                })
                ->orWhere(function ($q2) {
                    $q2->where('frequency', 'weekly')
                        ->whereRaw('last_notified_at < NOW() - INTERVAL 7 DAY');
                })
                ->orWhere(function ($q2) {
                    $q2->where('frequency', 'instant')
                        ->whereRaw('last_notified_at < NOW() - INTERVAL 1 HOUR');
                });
        });
    }
}
