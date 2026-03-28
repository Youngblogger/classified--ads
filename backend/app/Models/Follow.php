<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Follow extends Model
{
    public $timestamps = false;
    
    protected $fillable = [
        'follower_id',
        'following_id',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function follower(): BelongsTo
    {
        return $this->belongsTo(User::class, 'follower_id');
    }

    public function following(): BelongsTo
    {
        return $this->belongsTo(User::class, 'following_id');
    }

    public static function isFollowing(int $followerId, int $followingId): bool
    {
        return self::where('follower_id', $followerId)
            ->where('following_id', $followingId)
            ->exists();
    }

    public static function getFollowersCount(int $userId): int
    {
        return self::where('following_id', $userId)->count();
    }

    public static function getFollowingCount(int $userId): int
    {
        return self::where('follower_id', $userId)->count();
    }

    public static function getFollowers(int $userId, int $limit = 20)
    {
        return User::whereHas('followers', function ($query) use ($userId) {
            $query->where('following_id', $userId);
        })->limit($limit)->get();
    }

    public static function getFollowing(int $userId, int $limit = 20)
    {
        return User::whereHas('following', function ($query) use ($userId) {
            $query->where('follower_id', $userId);
        })->limit($limit)->get();
    }
}
