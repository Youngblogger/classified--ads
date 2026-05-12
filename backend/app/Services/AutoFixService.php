<?php

namespace App\Services;

use App\Models\Ad;
use App\Models\AdImage;
use App\Models\AdFixLog;
use App\Jobs\AutoFixAdJob;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AutoFixService
{
    private AdQualityService $qualityService;

    private const CATEGORY_IMAGES = [
        'cars' => [
            'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1580273916550-e323be2ed5f6?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&h=600&fit=crop',
        ],
        'mobile-phones' => [
            'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1598327105666-5b89351aff70?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&h=600&fit=crop',
        ],
        'electronics' => [
            'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1588702547923-b3c1859b71fa?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&h=600&fit=crop',
        ],
        'property' => [
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
        ],
        'jobs' => [
            'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&h=600&fit=crop',
        ],
    ];

    private const FALLBACK_IMAGES = [
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
    ];

    public function __construct(AdQualityService $qualityService)
    {
        $this->qualityService = $qualityService;
    }

    public function fix(Ad $ad, ?int $userId = null): array
    {
        // Safety: Only auto-fix seeded ads unless explicitly allowed
        if (!$ad->is_seeded) {
            return [
                'success' => false,
                'message' => 'Cannot auto-fix non-seeded ads. Manual approval required.',
                'ad_id' => $ad->id,
            ];
        }

        $oldData = [
            'images' => $ad->images->toArray(),
            'title' => $ad->title,
            'quality_score' => $ad->quality_score,
            'is_flagged' => $ad->is_flagged,
        ];

        try {
            DB::beginTransaction();

            // Fix images
            $this->fixImages($ad);

            // Fix title if needed
            $this->fixTitle($ad);

            // Re-analyze and update quality
            $qualityResult = $this->qualityService->analyzeAndUpdate($ad);

            DB::commit();

            // Log the fix
            $this->logFix($ad, $userId, 'auto_fix', $oldData, [
                'images' => $ad->fresh()->images->toArray(),
                'title' => $ad->title,
                'quality_score' => $qualityResult['score'],
                'flags' => $qualityResult['flags'],
            ]);

            return [
                'success' => true,
                'message' => 'Ad fixed successfully',
                'ad_id' => $ad->id,
                'new_score' => $qualityResult['score'],
                'flags_fixed' => $qualityResult['flags'],
            ];
        } catch (\Exception $e) {
            DB::rollBack();

            $this->logFix($ad, $userId, 'auto_fix', $oldData, null, 'failed', $e->getMessage());

            Log::error('AutoFixService fix failed', [
                'ad_id' => $ad->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to fix ad: ' . $e->getMessage(),
                'ad_id' => $ad->id,
            ];
        }
    }

    public function fixBulk(array $adIds, ?int $userId = null): array
    {
        $results = [];

        foreach ($adIds as $adId) {
            $ad = Ad::find($adId);
            if ($ad) {
                $results[] = $this->fix($ad, $userId);
            } else {
                $results[] = [
                    'success' => false,
                    'message' => 'Ad not found',
                    'ad_id' => $adId,
                ];
            }
        }

        return $results;
    }

    public function fixAllFlagged(?int $userId = null): array
    {
        $flaggedAds = Ad::where('is_flagged', true)
            ->where('is_seeded', true)
            ->pluck('id')
            ->toArray();

        return $this->fixBulk($flaggedAds, $userId);
    }

    public function dispatchFixAllFlagged(?int $userId = null): void
    {
        $flaggedAds = Ad::where('is_flagged', true)
            ->where('is_seeded', true)
            ->pluck('id')
            ->toArray();

        foreach ($flaggedAds as $adId) {
            AutoFixAdJob::dispatch($adId, $userId);
        }
    }

    public function deleteImages(Ad $ad, ?int $userId = null): array
    {
        $oldImages = $ad->images->toArray();

        try {
            DB::beginTransaction();

            $ad->images()->delete();

            // Re-analyze quality
            $qualityResult = $this->qualityService->analyzeAndUpdate($ad);

            DB::commit();

            $this->logFix($ad, $userId, 'delete_images', ['images' => $oldImages], [
                'images' => [],
            ]);

            return [
                'success' => true,
                'message' => 'Images deleted successfully',
                'ad_id' => $ad->id,
            ];
        } catch (\Exception $e) {
            DB::rollBack();

            return [
                'success' => false,
                'message' => 'Failed to delete images: ' . $e->getMessage(),
                'ad_id' => $ad->id,
            ];
        }
    }

    public function replaceImages(Ad $ad, ?int $userId = null): array
    {
        $oldImages = $ad->images->toArray();
        $adId = $ad->id;

        if (!$adId) {
            return [
                'success' => false,
                'message' => 'Ad ID not found',
                'ad_id' => null,
            ];
        }

        try {
            DB::beginTransaction();

            // Re-fetch the ad to ensure we have a clean model with all data
            $ad = Ad::with('category')->findOrFail($adId);

            // Delete old images
            $ad->images()->delete();

            // Add new images
            $this->addNewImages($ad);

            // Re-analyze quality
            $qualityResult = $this->qualityService->analyzeAndUpdate($ad);

            DB::commit();

            $this->logFix($ad, $userId, 'replace_images', ['images' => $oldImages], [
                'images' => $ad->fresh()->images->toArray(),
            ]);

            return [
                'success' => true,
                'message' => 'Images replaced successfully',
                'ad_id' => $ad->id,
                'new_image_count' => $ad->fresh()->images->count(),
            ];
        } catch (\Exception $e) {
            DB::rollBack();

            return [
                'success' => false,
                'message' => 'Failed to replace images: ' . $e->getMessage(),
                'ad_id' => $adId,
            ];
        }
    }

    private function fixImages(Ad $ad): void
    {
        // Delete all existing images
        $ad->images()->delete();

        // Add new, appropriate images
        $this->addNewImages($ad);
    }

    private function addNewImages(Ad $ad): void
    {
        $adId = $ad->id;
        
        if (!$adId) {
            Log::error('addNewImages: Ad ID is null', ['ad' => $ad]);
            throw new \Exception('Cannot add images: Ad ID is null');
        }
        
        $categorySlug = $ad->category?->slug ?? 'cars';
        $images = self::CATEGORY_IMAGES[$categorySlug] ?? self::FALLBACK_IMAGES;

        // Shuffle to get random selection
        $shuffled = $images;
        shuffle($shuffled);

        // Get 3-6 random images
        $count = rand(3, min(6, count($shuffled)));
        $selectedImages = array_slice($shuffled, 0, $count);

        foreach ($selectedImages as $index => $imageUrl) {
            AdImage::create([
                'ad_id' => $adId,
                'url' => $imageUrl,
                'original_url' => $imageUrl,
                'is_primary' => ($index === 0),
                'sort_order' => $index,
            ]);
        }
    }

    private function fixTitle(Ad $ad): void
    {
        if (!$ad->category) {
            return;
        }

        $title = $ad->title;
        $categoryName = $ad->category->name;

        // If title doesn't contain any relevant keywords, try to improve it
        $titleLower = strtolower($title);
        $categoryKeywords = AdQualityService::getCategoryKeywords()[$ad->category->slug] ?? [];

        $hasKeyword = false;
        foreach ($categoryKeywords as $keyword) {
            if (str_contains($titleLower, $keyword)) {
                $hasKeyword = true;
                break;
            }
        }

        // Only fix if clearly mismatched (e.g., "iPhone" ad in Cars category)
        if (!$hasKeyword && strlen($title) < 30) {
            // Just flag it, don't auto-change title
            Log::info('Title may need review', [
                'ad_id' => $ad->id,
                'title' => $title,
                'category' => $categoryName,
            ]);
        }
    }

    private function logFix(
        Ad $ad,
        ?int $userId,
        string $action,
        ?array $oldData,
        ?array $newData,
        string $status = 'completed',
        ?string $errorMessage = null
    ): void {
        AdFixLog::create([
            'ad_id' => $ad->id,
            'user_id' => $userId,
            'action' => $action,
            'old_data' => $oldData,
            'new_data' => $newData,
            'status' => $status,
            'error_message' => $errorMessage,
        ]);
    }

    public function getFixLogs(?int $adId = null, int $limit = 50): \Illuminate\Database\Eloquent\Collection
    {
        $query = AdFixLog::with(['ad', 'user'])
            ->orderBy('created_at', 'desc');

        if ($adId) {
            $query->where('ad_id', $adId);
        }

        return $query->limit($limit)->get();
    }

    public function getImageUsageStats(): array
    {
        $imageUsage = AdImage::select('url', DB::raw('COUNT(DISTINCT ad_id) as ad_count'))
            ->groupBy('url')
            ->having('ad_count', '>', 1)
            ->orderBy('ad_count', 'desc')
            ->limit(20)
            ->get();

        return [
            'duplicate_image_count' => $imageUsage->count(),
            'most_shared_images' => $imageUsage,
        ];
    }
}
