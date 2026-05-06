<?php

namespace App\Services;

use App\Models\AdImage;
use App\Models\Banner;
use App\Models\User;
use App\Services\CloudinaryService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CloudinaryCleanupService
{
    protected CloudinaryService $cloudinary;

    public function __construct(CloudinaryService $cloudinary)
    {
        $this->cloudinary = $cloudinary;
    }

    public function cleanupOrphanedAdImages(int $batchSize = 100): array
    {
        Log::info('Starting orphaned ad image cleanup', ['batch_size' => $batchSize]);

        $orphans = DB::table('ad_images')
            ->leftJoin('ads', 'ad_images.ad_id', '=', 'ads.id')
            ->whereNull('ads.id')
            ->whereNotNull('ad_images.public_id')
            ->select('ad_images.id', 'ad_images.public_id', 'ad_images.url')
            ->limit($batchSize)
            ->get();

        $deleted = 0;
        $failed = 0;
        $errors = [];

        foreach ($orphans as $orphan) {
            try {
                $result = $this->cloudinary->deleteImage($orphan->public_id);

                if ($result['success']) {
                    DB::table('ad_images')->where('id', $orphan->id)->delete();
                    $deleted++;
                } else {
                    $failed++;
                    $errors[] = "Failed to delete {$orphan->public_id}: {$result['error']}";
                }
            } catch (\Exception $e) {
                $failed++;
                $errors[] = "Exception deleting {$orphan->public_id}: {$e->getMessage()}";
            }
        }

        Log::info('Orphaned ad image cleanup completed', [
            'deleted' => $deleted,
            'failed' => $failed,
            'errors' => $errors,
        ]);

        return [
            'deleted' => $deleted,
            'failed' => $failed,
            'errors' => $errors,
        ];
    }

    public function cleanupOrphanedBanners(int $batchSize = 50): array
    {
        Log::info('Starting orphaned banner cleanup', ['batch_size' => $batchSize]);

        $orphans = DB::table('banners')
            ->whereNull('image_url')
            ->orWhere('image_url', '')
            ->whereNotNull('banner_public_id')
            ->select('id', 'banner_public_id')
            ->limit($batchSize)
            ->get();

        $deleted = 0;
        $failed = 0;

        foreach ($orphans as $orphan) {
            try {
                $result = $this->cloudinary->deleteImage($orphan->banner_public_id);

                if ($result['success']) {
                    DB::table('banners')->where('id', $orphan->id)->delete();
                    $deleted++;
                } else {
                    $failed++;
                }
            } catch (\Exception $e) {
                $failed++;
                Log::error("Exception deleting banner {$orphan->banner_public_id}: {$e->getMessage()}");
            }
        }

        return ['deleted' => $deleted, 'failed' => $failed];
    }

    public function cleanupOrphanedAvatars(int $batchSize = 50): array
    {
        Log::info('Starting orphaned avatar cleanup', ['batch_size' => $batchSize]);

        $orphans = DB::table('users')
            ->whereNull('avatar')
            ->orWhere('avatar', '')
            ->whereNotNull('avatar_public_id')
            ->select('id', 'avatar_public_id')
            ->limit($batchSize)
            ->get();

        $deleted = 0;
        $failed = 0;

        foreach ($orphans as $orphan) {
            try {
                $result = $this->cloudinary->deleteImage($orphan->avatar_public_id);

                if ($result['success']) {
                    $deleted++;
                } else {
                    $failed++;
                }
            } catch (\Exception $e) {
                $failed++;
            }
        }

        return ['deleted' => $deleted, 'failed' => $failed];
    }

    public function syncAdImages(): array
    {
        Log::info('Starting ad image sync with Cloudinary');

        $images = AdImage::whereNotNull('public_id')->get();
        $missing = 0;
        $synced = 0;

        foreach ($images as $image) {
            try {
                $url = $this->cloudinary->getOptimizedUrl($image->public_id);

                $headers = @get_headers($url);

                if ($headers && str_contains($headers[0], '200')) {
                    $synced++;
                } else {
                    $missing++;
                    Log::warning("Ad image not found on Cloudinary: {$image->public_id}");
                }
            } catch (\Exception $e) {
                $missing++;
                Log::error("Error checking ad image {$image->public_id}: {$e->getMessage()}");
            }
        }

        return ['total' => $images->count(), 'synced' => $synced, 'missing' => $missing];
    }

    public function generateReport(): array
    {
        return [
            'ad_images' => [
                'total' => AdImage::count(),
                'with_public_id' => AdImage::whereNotNull('public_id')->count(),
                'without_public_id' => AdImage::whereNull('public_id')->count(),
            ],
            'banners' => [
                'total' => Banner::count(),
                'with_public_id' => Banner::whereNotNull('banner_public_id')->count(),
                'without_public_id' => Banner::whereNull('banner_public_id')->count(),
            ],
            'users' => [
                'total' => User::count(),
                'with_avatar_public_id' => User::whereNotNull('avatar_public_id')->count(),
                'without_avatar_public_id' => User::whereNull('avatar_public_id')->count(),
            ],
        ];
    }
}
