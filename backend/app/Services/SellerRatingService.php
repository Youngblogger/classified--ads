<?php

namespace App\Services;

use App\Models\Review;
use Illuminate\Support\Facades\Cache;

class SellerRatingService
{
    const CACHE_PREFIX = 'seller_rating_';
    const CACHE_TTL = 3600; // 1 hour

    public static function getSummary($sellerId)
    {
        $cacheKey = self::CACHE_PREFIX . $sellerId;
        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($sellerId) {
            $reviews = Review::where('target_user_id', $sellerId)->get();

            $total = $reviews->count();
            $average = $total > 0 ? round($reviews->avg('rating'), 1) : 0;

            $calcPercent = function ($count) use ($total) {
                return $total > 0 ? round(($count / $total) * 100) : 0;
            };

            $distribution = [
                5 => $calcPercent($reviews->where('rating', 5)->count()),
                4 => $calcPercent($reviews->where('rating', 4)->count()),
                3 => $calcPercent($reviews->where('rating', 3)->count()),
                2 => $calcPercent($reviews->where('rating', 2)->count()),
                1 => $calcPercent($reviews->where('rating', 1)->count()),
            ];

            $counts = [
                5 => $reviews->where('rating', 5)->count(),
                4 => $reviews->where('rating', 4)->count(),
                3 => $reviews->where('rating', 3)->count(),
                2 => $reviews->where('rating', 2)->count(),
                1 => $reviews->where('rating', 1)->count(),
            ];

            return [
                'average_rating' => $average,
                'total_reviews' => $total,
                'distribution' => $distribution,
                'counts' => $counts,
            ];
        });
    }

    public static function clearCache($sellerId)
    {
        Cache::forget(self::CACHE_PREFIX . $sellerId);
    }

    public static function getTopReviewers($sellerId, $limit = 3)
    {
        return Review::where('target_user_id', $sellerId)
            ->with('user:id,name,avatar,google_avatar,facebook_avatar')
            ->orderBy('rating', 'desc')
            ->orderBy('helpful_count', 'desc')
            ->limit($limit)
            ->get();
    }
}
