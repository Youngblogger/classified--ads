<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\File\File;

class ImageProcessingService
{
    public function processAdImage(UploadedFile|File $file, ?int $adId = null): array
    {
        $uuid = (string) Str::uuid();
        
        // Get file extension - try multiple methods
        $extension = 'jpg';
        if (method_exists($file, 'getClientOriginalExtension') && $file->getClientOriginalExtension()) {
            $extension = strtolower($file->getClientOriginalExtension());
        } elseif ($file->getClientOriginalName()) {
            $ext = pathinfo($file->getClientOriginalName(), PATHINFO_EXTENSION);
            if ($ext) {
                $extension = strtolower($ext);
            }
        }
        
        // Ensure valid extension
        $allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (!in_array($extension, $allowedExts)) {
            $extension = 'jpg';
        }
        
        $basePath = $adId ? "ads/{$adId}" : 'temp';
        
        $originalPath = "{$basePath}/{$uuid}_original.{$extension}";
        $optimizedPath = "{$basePath}/{$uuid}.{$extension}";
        $thumbnailPath = "{$basePath}/{$uuid}_thumb.{$extension}";

        $tempFile = $file->getPathname();
        
        // Store original image directly
        Storage::disk('public')->put($originalPath, file_get_contents($tempFile));
        
        // Copy original as optimized and thumbnail (no processing)
        Storage::disk('public')->put($optimizedPath, file_get_contents($tempFile));
        Storage::disk('public')->put($thumbnailPath, file_get_contents($tempFile));

        $fileSize = filesize($tempFile);

        return [
            'uuid' => $uuid,
            'original_url' => '/storage/' . ltrim($originalPath, '/'),
            'url' => '/storage/' . ltrim($optimizedPath, '/'),
            'thumbnail_url' => '/storage/' . ltrim($thumbnailPath, '/'),
            'file_size' => $fileSize,
        ];
    }

    public function validateImage(UploadedFile $file): array
    {
        // No validation - accept all files
        return [
            'width' => 0,
            'height' => 0,
            'size' => $file->getSize(),
            'format' => 'jpg',
        ];
    }

    public function deleteAdImages(string $adId): void
    {
        $basePath = "ads/{$adId}";
        $files = Storage::disk('public')->files($basePath);
        foreach ($files as $file) {
            Storage::disk('public')->delete($file);
        }
    }

    public static function getAllowedFormats(): array
    {
        return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif'];
    }

    public static function getMaxFileSize(): int
    {
        return 10 * 1024 * 1024; // 10MB
    }

    public static function getMaxImagesPerAd(): int
    {
        return 10;
    }
}
