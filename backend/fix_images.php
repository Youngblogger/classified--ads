<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Ad;
use App\Models\AdImage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

echo "Fixing ad images...\n";

// Get all ads
$ads = Ad::all();
echo "Total ads: " . $ads->count() . "\n";

foreach ($ads as $ad) {
    $adId = $ad->id;
    $storagePath = storage_path('app/public/ads/' . $adId);

    // Check if directory exists
    if (!is_dir($storagePath)) {
        echo "Ad $adId ($ad->title): No storage directory\n";
        continue;
    }

    // Get all files in the directory
    $files = scandir($storagePath);
    $imageFiles = [];

    foreach ($files as $file) {
        if (in_array(pathinfo($file, PATHINFO_EXTENSION), ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
            $imageFiles[] = $file;
        }
    }

    if (empty($imageFiles)) {
        echo "Ad $adId ($ad->title): No image files\n";
        continue;
    }

    // Check if images already exist in database
    $existingImages = AdImage::where('ad_id', $adId)->count();

    if ($existingImages > 0) {
        echo "Ad $adId ($ad->title): Already has $existingImages images\n";
        continue;
    }

    echo "Ad $adId ($ad->title): Adding " . count($imageFiles) . " images\n";

    // Sort files to ensure consistent ordering
    sort($imageFiles);

    foreach ($imageFiles as $index => $filename) {
        $fullPath = $storagePath . '/' . $filename;
        $fileSize = filesize($fullPath);

        // Determine if this is original, optimized, or thumbnail
        $isOriginal = strpos($filename, '_original') !== false;
        $isThumb = strpos($filename, '_thumb') !== false;

        // Get the base UUID from filename
        preg_match('/([a-f0-9-]+)/', $filename, $matches);
        $uuid = $matches[1] ?? null;

        if ($isOriginal) {
            $url = '/storage/ads/' . $adId . '/' . $filename;
            $originalUrl = $url;
        } elseif ($isThumb) {
            $url = '/storage/ads/' . $adId . '/' . $filename;
            $originalUrl = '/storage/ads/' . $adId . '/' . $uuid . '_original.' . pathinfo($filename, PATHINFO_EXTENSION);
        } else {
            $url = '/storage/ads/' . $adId . '/' . $filename;
            $originalUrl = '/storage/ads/' . $adId . '/' . $uuid . '_original.' . pathinfo($filename, PATHINFO_EXTENSION);
        }

        // Create image record
        AdImage::create([
            'ad_id' => $adId,
            'url' => $url,
            'original_url' => $originalUrl,
            'thumbnail_url' => $isThumb ? $url : '/storage/ads/' . $adId . '/' . $uuid . '_thumb.' . pathinfo($filename, PATHINFO_EXTENSION),
            'file_size' => $fileSize,
            'is_primary' => $index === 0,
            'sort_order' => $index,
        ]);

        echo "  - Added: $filename\n";
    }
}

echo "\nDone!\n";

// Show final status
echo "\nFinal status:\n";
$ads = Ad::all();
foreach ($ads as $ad) {
    $imageCount = AdImage::where('ad_id', $ad->id)->count();
    echo "Ad $ad->id ($ad->title): $imageCount images\n";
}
