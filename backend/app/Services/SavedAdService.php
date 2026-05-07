<?php

namespace App\Services;

use App\Models\Ad;
use App\Models\SavedAd;
use App\Events\AdSaved;
use Illuminate\Support\Facades\Log;

class SavedAdService
{
    public function saveAd(int $userId, int $adId): array
    {
        $ad = Ad::where('id', $adId)->where('status', 'active')->first();

        if (!$ad) {
            return [
                'success' => false,
                'error' => 'Ad not found or no longer active',
                'code' => 'ad_not_found',
            ];
        }

        $existing = SavedAd::where('user_id', $userId)
            ->where('ad_id', $adId)
            ->first();

        if ($existing) {
            return [
                'success' => false,
                'error' => 'Ad already saved',
                'code' => 'already_saved',
                'already_saved' => true,
            ];
        }

        $savedAd = SavedAd::create([
            'user_id' => $userId,
            'ad_id' => $adId,
        ]);

        event(new AdSaved($userId, $adId));

        Log::info('Ad saved by user', [
            'user_id' => $userId,
            'ad_id' => $adId,
        ]);

        return [
            'success' => true,
            'saved_ad' => $savedAd,
        ];
    }

    public function unsaveAd(int $userId, int $adId): array
    {
        $deleted = SavedAd::where('user_id', $userId)
            ->where('ad_id', $adId)
            ->delete();

        if ($deleted === 0) {
            return [
                'success' => false,
                'error' => 'Saved ad not found',
                'code' => 'not_saved',
            ];
        }

        Log::info('Ad unsaved by user', [
            'user_id' => $userId,
            'ad_id' => $adId,
        ]);

        return ['success' => true];
    }

    public function getSavedAds(int $userId, int $limit = 20, int $page = 1): array
    {
        $offset = ($page - 1) * $limit;

        $query = SavedAd::where('user_id', $userId)
            ->with(['ad' => function ($q) {
                $q->with(['images', 'category', 'location'])
                    ->where('status', 'active');
            }])
            ->orderBy('saved_ads.created_at', 'desc');

        $total = (clone $query)->count();

        $savedAds = $query->offset($offset)->limit($limit)->get();

        $ads = $savedAds->map(fn($saved) => $saved->ad)->filter();

        return [
            'data' => $ads->values(),
            'meta' => [
                'total' => $total,
                'current_page' => $page,
                'per_page' => $limit,
                'last_page' => $limit > 0 ? ceil($total / $limit) : 1,
            ],
        ];
    }

    public function isSaved(int $userId, int $adId): bool
    {
        return SavedAd::where('user_id', $userId)
            ->where('ad_id', $adId)
            ->exists();
    }

    public function getSavedCount(int $userId): int
    {
        return SavedAd::where('user_id', $userId)->count();
    }
}
