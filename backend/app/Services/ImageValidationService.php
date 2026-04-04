<?php

namespace App\Services;

use App\Models\Ad;
use App\Models\AdImage;
use Illuminate\Support\Facades\Log;

class ImageValidationService
{
    private array $validationRules = [
        'min_images' => 1,
        'max_images' => 10,
        'min_file_size' => 5000, // 5KB
        'max_file_size' => 10485760, // 10MB
        'suspicious_keywords' => [
            'scam', 'fraud', 'hack', 'crack', 'free money', 'make money fast',
            'bitcoin', 'crypto', 'investment', 'lottery', 'prize', 'winner'
        ],
    ];

    public function validate(Ad $ad): void
    {
        $images = $ad->images;
        
        $result = [
            'valid' => true,
            'issues' => [],
            'flags' => [],
            'checked_at' => now()->toIso8601String(),
            'image_count' => $images->count(),
        ];

        $this->validateImageCount($images, $result);
        $this->validateFileSizes($images, $result);
        $this->checkSuspiciousContent($ad, $result);

        $ad->update([
            'image_validation' => $result,
        ]);

        if (!empty($result['flags'])) {
            $ad->update([
                'verification_status' => 'flagged',
            ]);
        } elseif ($result['valid']) {
            $ad->update([
                'verification_status' => 'verified',
            ]);
        }
    }

    private function validateImageCount($images, array &$result): void
    {
        $count = $images->count();
        
        if ($count < $this->validationRules['min_images']) {
            $result['valid'] = false;
            $result['issues'][] = "Minimum {$this->validationRules['min_images']} image required";
        }
        
        if ($count > $this->validationRules['max_images']) {
            $result['valid'] = false;
            $result['issues'][] = "Maximum {$this->validationRules['max_images']} images allowed";
        }

        $categorySlug = $images->first()?->ad?->category?->slug;
        
        if (in_array($categorySlug, ['vehicles', 'cars'])) {
            if ($count < 3) {
                $result['flags'][] = 'Vehicle ads should have at least 3 images';
            }
        }
        
        if (in_array($categorySlug, ['real-estate', 'property'])) {
            if ($count < 2) {
                $result['flags'][] = 'Property ads should have at least 2 images';
            }
        }
    }

    private function validateFileSizes($images, array &$result): void
    {
        foreach ($images as $image) {
            if ($image->file_size < $this->validationRules['min_file_size']) {
                $result['issues'][] = "Image too small (less than 5KB)";
            }
            
            if ($image->file_size > $this->validationRules['max_file_size']) {
                $result['issues'][] = "Image too large (more than 10MB)";
            }
        }
    }

    private function checkSuspiciousContent(Ad $ad, array &$result): void
    {
        $text = strtolower($ad->title . ' ' . $ad->description);
        
        foreach ($this->validationRules['suspicious_keywords'] as $keyword) {
            if (strpos($text, $keyword) !== false) {
                $result['flags'][] = "Suspicious keyword detected: {$keyword}";
            }
        }

        if ($ad->price > 0 && $ad->price < 1) {
            $result['flags'][] = "Suspiciously low price";
        }
    }
}
