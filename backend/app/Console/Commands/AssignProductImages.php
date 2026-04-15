<?php

namespace App\Console\Commands;

use App\Models\Ad;
use App\Models\AdImage;
use App\Models\ProductImageMap;
use Illuminate\Console\Command;

class AssignProductImages extends Command
{
    protected $signature = 'ads:assign-images';
    protected $description = 'Assign exact product images to ads based on keyword mapping';

    public function handle()
    {
        $ads = Ad::all();
        $assigned = 0;
        $unmatched = 0;

        foreach ($ads as $ad) {
            $ad->images()->delete();
            
            $matchedImage = $this->findMappedImage($ad->title);
            
            if ($matchedImage) {
                AdImage::create([
                    'ad_id' => $ad->id,
                    'url' => $matchedImage->image_path,
                    'is_primary' => true,
                    'sort_order' => 1,
                ]);
                $assigned++;
                $this->line("Assigned: {$ad->title} -> {$matchedImage->image_path}");
            } else {
                $unmatched++;
                $this->warn("No match: {$ad->title}");
            }
        }

        $this->info("Done! Assigned: {$assigned}, Unmatched: {$unmatched}");
    }

    private function findMappedImage(string $title): ?ProductImageMap
    {
        $titleLower = strtolower($title);
        
        $exactMatch = ProductImageMap::whereRaw('LOWER(keyword) = ?', [$titleLower])->first();
        if ($exactMatch) {
            return $exactMatch;
        }

        $words = explode(' ', $titleLower);
        $significantWords = array_filter($words, function($word) {
            $stopWords = ['for', 'sale', 'rent', 'in', 'with', 'the', 'a', 'an', 'and', 'or', 'new', 'used', 'like', 'new', 'good', 'condition'];
            return !in_array($word, $stopWords) && strlen($word) > 2;
        });

        foreach (ProductImageMap::all() as $mapping) {
            $keywordLower = strtolower($mapping->keyword);
            if (strpos($titleLower, $keywordLower) !== false) {
                return $mapping;
            }
        }

        foreach ($significantWords as $word) {
            $match = ProductImageMap::where('keyword', 'like', "%{$word}%")->first();
            if ($match) {
                return $match;
            }
        }

        return null;
    }
}
