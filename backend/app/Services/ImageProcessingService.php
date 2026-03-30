<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
use Intervention\Image\Encoders\WebpEncoder;
use Intervention\Image\Encoders\JpegEncoder;
use Intervention\Image\Encoders\PngEncoder;
use Symfony\Component\HttpFoundation\File\File;

class ImageProcessingService
{
    private ImageManager $imageManager;

    private const MAX_WIDTH = 1200;
    private const MAX_HEIGHT = 1200;
    private const THUMBNAIL_WIDTH = 300;
    private const THUMBNAIL_HEIGHT = 300;
    private const MEDIUM_WIDTH = 600;
    private const MEDIUM_HEIGHT = 600;
    private const LARGE_WIDTH = 1200;
    private const LARGE_HEIGHT = 1200;
    private const QUALITY = 80;
    private const THUMBNAIL_QUALITY = 70;

    public function __construct()
    {
        $this->imageManager = new ImageManager(new GdDriver());
    }

    public function processAdImage(UploadedFile|File $file, ?int $adId = null): array
    {
        $uuid = (string) Str::uuid();
        $basePath = $adId ? "ads/{$adId}" : 'temp';

        $tempFile = $file->getPathname();
        
        try {
            $image = $this->imageManager->read($tempFile);
            $originalWidth = $image->width();
            $originalHeight = $image->height();
            $originalSize = filesize($tempFile);

            $originalPath = "{$basePath}/{$uuid}_original.webp";
            $largePath = "{$basePath}/{$uuid}_large.webp";
            $mediumPath = "{$basePath}/{$uuid}_medium.webp";
            $thumbnailPath = "{$basePath}/{$uuid}_thumb.webp";

            $encodedImage = $image->encode(new WebpEncoder(self::QUALITY));
            Storage::disk('public')->put($originalPath, $encodedImage->toString());

            $large = $this->imageManager->read($tempFile);
            if ($large->width() > self::LARGE_WIDTH || $large->height() > self::LARGE_HEIGHT) {
                $large->scaleDown(self::LARGE_WIDTH, self::LARGE_HEIGHT);
            }
            $encodedLarge = $large->encode(new WebpEncoder(self::QUALITY));
            Storage::disk('public')->put($largePath, $encodedLarge->toString());

            $medium = $this->imageManager->read($tempFile);
            if ($medium->width() > self::MEDIUM_WIDTH || $medium->height() > self::MEDIUM_HEIGHT) {
                $medium->scaleDown(self::MEDIUM_WIDTH, self::MEDIUM_HEIGHT);
            }
            $encodedMedium = $medium->encode(new WebpEncoder(self::QUALITY));
            Storage::disk('public')->put($mediumPath, $encodedMedium->toString());

            $thumbnail = $this->imageManager->read($tempFile);
            $thumbnail->cover(self::THUMBNAIL_WIDTH, self::THUMBNAIL_HEIGHT);
            $encodedThumb = $thumbnail->encode(new WebpEncoder(self::THUMBNAIL_QUALITY));
            Storage::disk('public')->put($thumbnailPath, $encodedThumb->toString());

            $optimizedSize = strlen($encodedLarge->toString());

            Log::info("Image processed", [
                'uuid' => $uuid,
                'original_size' => $originalSize,
                'optimized_size' => $optimizedSize,
                'saved' => round((1 - $optimizedSize / $originalSize) * 100) . '%'
            ]);

            return [
                'uuid' => $uuid,
                'original_url' => '/storage/' . ltrim($originalPath, '/'),
                'url' => '/storage/' . ltrim($largePath, '/'),
                'medium_url' => '/storage/' . ltrim($mediumPath, '/'),
                'thumbnail_url' => '/storage/' . ltrim($thumbnailPath, '/'),
                'file_size' => $optimizedSize,
                'width' => min($originalWidth, self::LARGE_WIDTH),
                'height' => min($originalHeight, self::LARGE_HEIGHT),
            ];

        } catch (\Exception $e) {
            Log::error("Image processing failed: " . $e->getMessage());
            
            return $this->fallbackProcess($file, $uuid, $basePath, $tempFile);
        }
    }

    private function fallbackProcess(UploadedFile|File $file, string $uuid, string $basePath, string $tempFile): array
    {
        $extension = 'jpg';
        if (method_exists($file, 'getClientOriginalExtension') && $file->getClientOriginalExtension()) {
            $extension = strtolower($file->getClientOriginalExtension());
        }

        $originalPath = "{$basePath}/{$uuid}_original.{$extension}";
        $largePath = "{$basePath}/{$uuid}_large.{$extension}";
        $thumbnailPath = "{$basePath}/{$uuid}_thumb.{$extension}";

        Storage::disk('public')->put($originalPath, file_get_contents($tempFile));
        Storage::disk('public')->put($largePath, file_get_contents($tempFile));
        Storage::disk('public')->put($thumbnailPath, file_get_contents($tempFile));

        $fileSize = filesize($tempFile);

        return [
            'uuid' => $uuid,
            'original_url' => '/storage/' . ltrim($originalPath, '/'),
            'url' => '/storage/' . ltrim($largePath, '/'),
            'medium_url' => '/storage/' . ltrim($largePath, '/'),
            'thumbnail_url' => '/storage/' . ltrim($thumbnailPath, '/'),
            'file_size' => $fileSize,
        ];
    }

    public function validateImage(UploadedFile $file): array
    {
        try {
            $image = $this->imageManager->read($file->getPathname());
            return [
                'width' => $image->width(),
                'height' => $image->height(),
                'size' => $file->getSize(),
                'format' => 'webp',
            ];
        } catch (\Exception $e) {
            return [
                'width' => 0,
                'height' => 0,
                'size' => $file->getSize(),
                'format' => 'unknown',
            ];
        }
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
        return 10 * 1024 * 1024;
    }

    public static function getMaxImagesPerAd(): int
    {
        return 10;
    }
}
