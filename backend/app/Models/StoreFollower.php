<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StoreFollower extends Model
{
    public $timestamps = true;
    public $updated_at = false;

    protected $fillable = [
        'store_id',
        'user_id',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    protected static function booted()
    {
        static::creating(function ($follower) {
            $follower->created_at = $follower->created_at ?? now();
        });
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function isFollowing(int $storeId, int $userId): bool
    {
        return self::where('store_id', $storeId)
            ->where('user_id', $userId)
            ->exists();
    }

    public static function getFollowersCount(int $storeId): int
    {
        return self::where('store_id', $storeId)->count();
    }

    public static function getFollowerIds(int $storeId): array
    {
        return self::where('store_id', $storeId)->pluck('user_id')->toArray();
    }
}
