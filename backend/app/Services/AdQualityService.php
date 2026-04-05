<?php

namespace App\Services;

use App\Models\Ad;
use App\Models\AdImage;
use Illuminate\Support\Facades\DB;

class AdQualityService
{
    protected const CATEGORY_KEYWORDS = [
        'cars' => ['car', 'vehicle', 'toyota', 'honda', 'mercedes', 'bmw', 'ford', 'nissan', 'vehicle', 'automobile', 'jeep', 'suv', 'sedan'],
        'mobile-phones' => ['phone', 'iphone', 'samsung', 'tecno', 'infinix', 'huawei', 'mobile', 'smartphone', 'android', 'apple'],
        'electronics' => ['tv', 'laptop', 'computer', 'macbook', 'dell', 'hp', 'sony', 'lg', 'samsung', 'electronics', 'tv', 'refrigerator', 'washing'],
        'property' => ['house', 'apartment', 'flat', 'duplex', 'land', 'property', 'building', 'estate', 'rent', 'sale', 'bedroom', 'bathroom'],
        'jobs' => ['job', 'career', 'hiring', 'vacancy', 'employment', 'position', 'manager', 'engineer', 'developer', 'sales'],
    ];

    public static function getCategoryKeywords(): array
    {
        return [
            'cars' => ['car', 'vehicle', 'toyota', 'honda', 'mercedes', 'bmw', 'ford', 'nissan', 'vehicle', 'automobile', 'jeep', 'suv', 'sedan'],
            'mobile-phones' => ['phone', 'iphone', 'samsung', 'tecno', 'infinix', 'huawei', 'mobile', 'smartphone', 'android', 'apple'],
            'electronics' => ['tv', 'laptop', 'computer', 'macbook', 'dell', 'hp', 'sony', 'lg', 'samsung', 'electronics', 'tv', 'refrigerator', 'washing'],
            'property' => ['house', 'apartment', 'flat', 'duplex', 'land', 'property', 'building', 'estate', 'rent', 'sale', 'bedroom', 'bathroom'],
            'jobs' => ['job', 'career', 'hiring', 'vacancy', 'employment', 'position', 'manager', 'engineer', 'developer', 'sales'],
        ];
    }

    private const IMAGE_HASHES = [];

    public function analyze(Ad $ad): array
    {
        $flags = [];
        $score = 100;

        // Check 1: Missing images
        $imageCount = $ad->images->count();
        if ($imageCount === 0) {
            $flags[] = 'no_images';
            $score -= 50;
        } elseif ($imageCount < 2) {
            $flags[] = 'few_images';
            $score -= 20;
        }

        // Check 2: Duplicate images across ads
        $duplicateCheck = $this->checkDuplicateImages($ad);
        if ($duplicateCheck['has_duplicates']) {
            $flags[] = 'duplicate_images';
            $score -= 30;
        }

        // Check 3: Category mismatch
        $categoryMismatch = $this->checkCategoryMismatch($ad);
        if ($categoryMismatch['mismatched']) {
            $flags[] = 'category_mismatch';
            $score -= 25;
            $flags[] = ['detail' => $categoryMismatch['detail']];
        }

        // Check 4: Title-category keyword mismatch
        $titleMismatch = $this->checkTitleCategoryMismatch($ad);
        if ($titleMismatch['mismatched']) {
            $flags[] = 'title_mismatch';
            $score -= 15;
        }

        // Check 5: Low quality images (if URL contains placeholder patterns)
        $lowQualityCheck = $this->checkLowQualityImages($ad);
        if ($lowQualityCheck['has_low_quality']) {
            $flags[] = 'low_quality_images';
            $score -= 10;
        }

        // Check 6: Description length
        if (strlen($ad->description) < 50) {
            $flags[] = 'short_description';
            $score -= 10;
        }

        // Check 7: Price anomalies
        if ($this->checkPriceAnomaly($ad)) {
            $flags[] = 'price_anomaly';
            $score -= 10;
        }

        // Ensure score is between 0 and 100
        $score = max(0, min(100, $score));

        return [
            'score' => $score,
            'flags' => $flags,
            'is_flagged' => $score < 80 || count($flags) > 0,
            'image_count' => $imageCount,
            'has_duplicate_images' => $duplicateCheck['has_duplicates'],
            'category_mismatch' => $categoryMismatch['mismatched'],
            'title_mismatch' => $titleMismatch['mismatched'],
        ];
    }

    public function analyzeAndUpdate(Ad $ad): array
    {
        $result = $this->analyze($ad);

        $ad->update([
            'quality_score' => $result['score'],
            'is_flagged' => $result['is_flagged'],
            'quality_flags' => json_encode($result['flags']),
            'last_quality_check' => now(),
        ]);

        return $result;
    }

    public function analyzeAll(): array
    {
        $ads = Ad::with('images', 'category')->get();
        $results = [];

        foreach ($ads as $ad) {
            $results[$ad->id] = $this->analyzeAndUpdate($ad);
        }

        return $results;
    }

    public function getFlaggedAds(): \Illuminate\Database\Eloquent\Collection
    {
        return Ad::with('images', 'category', 'user')
            ->where('is_flagged', true)
            ->orderBy('quality_score', 'asc')
            ->get();
    }

    public function getQualityStats(): array
    {
        $total = Ad::count();
        $flagged = Ad::where('is_flagged', true)->count();
        $clean = $total - $flagged;

        $avgScore = Ad::avg('quality_score') ?? 0;

        $byScore = [
            'good' => Ad::where('quality_score', '>=', 80)->count(),
            'fair' => Ad::whereBetween('quality_score', [50, 79])->count(),
            'poor' => Ad::where('quality_score', '<', 50)->count(),
        ];

        return [
            'total' => $total,
            'flagged' => $flagged,
            'clean' => $clean,
            'average_score' => round($avgScore, 1),
            'by_score_range' => $byScore,
        ];
    }

    private function checkDuplicateImages(Ad $ad): array
    {
        $imageUrls = $ad->images->pluck('url')->toArray();
        $hashes = array_map('md5', $imageUrls);
        $uniqueHashes = array_unique($hashes);

        $hasDuplicates = count($hashes) !== count($uniqueHashes);

        // Also check if these URLs are used in other ads
        $otherAdsWithSameImages = AdImage::whereIn('url', $imageUrls)
            ->where('ad_id', '!=', $ad->id)
            ->distinct('ad_id')
            ->count('ad_id');

        return [
            'has_duplicates' => $hasDuplicates || $otherAdsWithSameImages > 0,
            'other_ads_count' => $otherAdsWithSameImages,
        ];
    }

    private function checkCategoryMismatch(Ad $ad): array
    {
        if (!$ad->category) {
            return ['mismatched' => false, 'detail' => null];
        }

        $categorySlug = $ad->category->slug;
        $keywords = self::CATEGORY_KEYWORDS[$categorySlug] ?? [];

        if (empty($keywords)) {
            return ['mismatched' => false, 'detail' => null];
        }

        $titleLower = strtolower($ad->title);
        $descriptionLower = strtolower($ad->description);
        $content = $titleLower . ' ' . $descriptionLower;

        $hasKeyword = false;
        foreach ($keywords as $keyword) {
            if (str_contains($content, $keyword)) {
                $hasKeyword = true;
                break;
            }
        }

        // Check image URLs for category keywords
        $imageUrls = $ad->images->pluck('url')->implode(' ');
        $imageUrlsLower = strtolower($imageUrls);

        $imageHasKeyword = false;
        foreach ($keywords as $keyword) {
            if (str_contains($imageUrlsLower, $keyword)) {
                $imageHasKeyword = true;
                break;
            }
        }

        return [
            'mismatched' => !$hasKeyword && !$imageHasKeyword,
            'detail' => "Title/content doesn't match category '{$ad->category->name}'",
        ];
    }

    private function checkTitleCategoryMismatch(Ad $ad): array
    {
        if (!$ad->category) {
            return ['mismatched' => false];
        }

        $categorySlug = $ad->category->slug;
        $keywords = self::CATEGORY_KEYWORDS[$categorySlug] ?? [];

        if (empty($keywords)) {
            return ['mismatched' => false];
        }

        $titleLower = strtolower($ad->title);
        $titleHasKeyword = false;

        foreach ($keywords as $keyword) {
            if (str_contains($titleLower, $keyword)) {
                $titleHasKeyword = true;
                break;
            }
        }

        return [
            'mismatched' => !$titleHasKeyword,
        ];
    }

    private function checkLowQualityImages(Ad $ad): array
    {
        $placeholderPatterns = [
            'picsum.photos/seed',
            'via.placeholder.com',
            'placeholder.com',
            'placehold.co',
            'loremflickr',
        ];

        $hasLowQuality = false;
        $details = [];

        foreach ($ad->images as $image) {
            $url = strtolower($image->url);
            foreach ($placeholderPatterns as $pattern) {
                if (str_contains($url, $pattern)) {
                    $hasLowQuality = true;
                    $details[] = $image->url;
                    break;
                }
            }
        }

        return [
            'has_low_quality' => $hasLowQuality,
            'details' => $details,
        ];
    }

    private function checkPriceAnomaly(Ad $ad): bool
    {
        if (!$ad->category) {
            return false;
        }

        $price = (float) $ad->price;

        // Check for suspiciously low prices
        if ($price > 0 && $price < 100) {
            return true;
        }

        // Check for unreasonably high prices compared to category average
        $categoryAvg = Ad::where('category_id', $ad->category_id)
            ->where('id', '!=', $ad->id)
            ->avg('price');

        if ($categoryAvg && $categoryAvg > 0) {
            // If price is more than 100x the average, it's likely an error
            if ($price > $categoryAvg * 100) {
                return true;
            }
        }

        return false;
    }
}
