<?php

namespace App\Services;

use App\Models\WatermarkSetting;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\File\File;

class ImageProcessingService
{
    private ImageManager $imageManager;
    private WatermarkSetting $settings;

    const MAX_WIDTH = 1000;
    const MAX_HEIGHT = 1000;
    const THUMBNAIL_SIZE = 300;
    const WEBP_QUALITY = 83;
    const THUMB_WEBP_QUALITY = 80;

    public function __construct()
    {
        $this->imageManager = new ImageManager(new Driver());
        $this->settings = WatermarkSetting::getSettings();
    }

    private function getFullUrl(string $path): string
    {
        $baseUrl = rtrim(env('APP_URL', 'http://localhost:3000'), '/');
        return $baseUrl . '/storage/' . ltrim($path, '/');
    }

    public function processAdImage(UploadedFile|File $file, ?int $adId = null): array
    {
        $uuid = (string) Str::uuid();
        $extension = strtolower($file->getClientOriginalExtension()) ?: 'jpg';
        $originalExtension = in_array($extension, ['jpg', 'jpeg', 'png', 'webp', 'gif']) ? $extension : 'jpg';
        
        $basePath = $adId ? "ads/{$adId}" : 'temp';

        $originalPath = "{$basePath}/{$uuid}_original.{$originalExtension}";
        $optimizedPath = "{$basePath}/{$uuid}.webp";
        $thumbnailPath = "{$basePath}/{$uuid}_thumb.webp";

        $tempFile = $file->getPathname();

        // Store original
        $this->storeOriginal($file, $originalPath);
        
        // Process main image
        $image = $this->imageManager->read($tempFile);
        $this->resize($image);
        
        if ($this->settings->enabled) {
            $this->applyWatermark($image, $adId);
        }
        
        $image->toWebp((int)(self::WEBP_QUALITY / 100))->save(
            Storage::disk('public')->path($optimizedPath)
        );
        
        // Process thumbnail
        $thumbnail = $this->imageManager->read($tempFile);
        $this->resize($thumbnail, self::THUMBNAIL_SIZE, self::THUMBNAIL_SIZE);
        
        if ($this->settings->enabled && $this->settings->apply_to_thumbnail) {
            $this->applyWatermark($thumbnail, $adId);
        }
        
        $thumbnail->toWebp((int)(self::THUMB_WEBP_QUALITY / 100))->save(
            Storage::disk('public')->path($thumbnailPath)
        );

        return [
            'uuid' => $uuid,
            'original_url' => $this->getFullUrl($originalPath),
            'url' => $this->getFullUrl($optimizedPath),
            'thumbnail_url' => $this->getFullUrl($thumbnailPath),
            'file_size' => filesize(Storage::disk('public')->path($optimizedPath)),
        ];
    }

    public function validateImage(UploadedFile $file): array
    {
        $allowedMimes = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif'];
        $maxSize = 5 * 1024 * 1024;
        $minWidth = 300;
        $minHeight = 300;

        $extension = strtolower($file->getClientOriginalExtension()) ?: 'jpg';
        
        if (!in_array($extension, $allowedMimes)) {
            throw new \InvalidArgumentException("Invalid image format. Allowed: " . implode(', ', $allowedMimes));
        }

        if ($file->getSize() > $maxSize) {
            throw new \InvalidArgumentException("File size exceeds maximum allowed (5MB)");
        }

        $imageInfo = @getimagesize($file->getPathname());
        if ($imageInfo) {
            $width = $imageInfo[0];
            $height = $imageInfo[1];
            
            if ($width < $minWidth || $height < $minHeight) {
                throw new \InvalidArgumentException("Image dimensions too small. Minimum: {$minWidth}x{$minHeight}px");
            }
        }

        return [
            'width' => $width ?? 0,
            'height' => $height ?? 0,
            'size' => $file->getSize(),
            'format' => $extension,
        ];
    }

    public function resize($image, int $maxWidth = self::MAX_WIDTH, int $maxHeight = self::MAX_HEIGHT): void
    {
        $width = $image->width();
        $height = $image->height();

        if ($width <= $maxWidth && $height <= $maxHeight) {
            return;
        }

        $ratio = min($maxWidth / $width, $maxHeight / $height);
        $newWidth = (int) round($width * $ratio);
        $newHeight = (int) round($height * $ratio);

        $image->resize($newWidth, $newHeight);
    }

    public function applyWatermark($image, ?int $adId = null): void
    {
        $settings = $this->settings;
        $width = $image->width();
        $height = $image->height();

        if ($settings->type === 'text') {
            $text = $settings->getWatermarkText($adId);
            $fontSize = (int) round($settings->font_size * min($width, $height) / 1000);
            $fontSize = max(12, min($fontSize, 150));

            $position = $this->calculateTextPosition($width, $height, $fontSize, $settings->margin);

            // Use configured text color with opacity
            $textColor = ltrim($settings->text_color, '#');
            $opacity = (int)$settings->opacity / 100;
            
            $image->text($text, $position['x'], $position['y'], function ($font) use ($fontSize, $settings, $textColor, $opacity) {
                $font->size($fontSize);
                $font->color([255, 255, 255, $opacity]); // White text with configured opacity
                $font->align('center');
                $font->valign('middle');
                
                $fontPath = $settings->getFontPath();
                if ($fontPath && file_exists($fontPath)) {
                    $font->file($fontPath);
                }
            });

            // Add shadow effect
            $shadowOpacity = (int)$settings->shadow_opacity / 100;
            $image->text($text, $position['x'] + 2, $position['y'] + 2, function ($font) use ($fontSize, $settings, $shadowOpacity) {
                $font->size($fontSize);
                $font->color([0, 0, 0, $shadowOpacity]); // Black shadow
                $font->align('center');
                $font->valign('middle');
            });

            if ($settings->rotation != 0) {
                $image->rotate($settings->rotation);
            }

        } elseif ($settings->type === 'logo' && $settings->logo_url) {
            $logoPath = public_path($settings->logo_url);
            
            if (file_exists($logoPath)) {
                $logoWidth = (int) round($width * 0.2);
                
                $position = $this->calculateLogoPosition($width, $height, $logoWidth, $settings->margin);
                
                $image->place($logoPath, $position['x'], $position['y'], function ($insert) use ($logoWidth, $settings) {
                    $insert->size($logoWidth);
                    $insert->opacity((int)$settings->opacity);
                });
            }
        }
    }

    private function calculateTextPosition(int $imageWidth, int $imageHeight, int $fontSize, int $margin): array
    {
        $settings = $this->settings;
        $textWidth = strlen($settings->text) * $fontSize * 0.6;
        $textHeight = $fontSize * 1.5;

        switch ($settings->position) {
            case 'top_left':
                return ['x' => $margin + $textWidth / 2, 'y' => $margin + $textHeight / 2];
            case 'top_right':
                return ['x' => $imageWidth - $margin - $textWidth / 2, 'y' => $margin + $textHeight / 2];
            case 'bottom_left':
                return ['x' => $margin + $textWidth / 2, 'y' => $imageHeight - $margin - $textHeight / 2];
            case 'center':
                return ['x' => $imageWidth / 2, 'y' => $imageHeight / 2];
            case 'bottom_right':
            default:
                return ['x' => $imageWidth - $margin - $textWidth / 2, 'y' => $imageHeight - $margin - $textHeight / 2];
        }
    }

    private function calculateLogoPosition(int $imageWidth, int $imageHeight, int $logoWidth, int $margin): array
    {
        $settings = $this->settings;
        
        switch ($settings->position) {
            case 'top_left':
                return ['x' => $margin, 'y' => $margin];
            case 'top_right':
                return ['x' => $imageWidth - $logoWidth - $margin, 'y' => $margin];
            case 'bottom_left':
                return ['x' => $margin, 'y' => $imageHeight - $logoWidth - $margin];
            case 'center':
                return ['x' => ($imageWidth - $logoWidth) / 2, 'y' => ($imageHeight - $logoWidth) / 2];
            case 'bottom_right':
            default:
                return ['x' => $imageWidth - $logoWidth - $margin, 'y' => $imageHeight - $logoWidth - $margin];
        }
    }

    private function storeOriginal(UploadedFile $file, string $path): void
    {
        Storage::disk('public')->put($path, file_get_contents($file->getPathname()));
    }

    public function deleteAdImages(string $adId): void
    {
        $basePath = "ads/{$adId}";
        $files = Storage::disk('public')->files($basePath);
        
        foreach ($files as $file) {
            Storage::disk('public')->delete($file);
        }
    }

    public function regenerateWatermarkForImage(string $imagePath, ?int $adId = null): string
    {
        $fullPath = Storage::disk('public')->path($imagePath);
        
        if (!file_exists($fullPath)) {
            throw new \InvalidArgumentException("Image not found: {$imagePath}");
        }

        $image = $this->imageManager->read($fullPath);
        $this->applyWatermark($image, $adId);
        
        $newPath = preg_replace('/\.(jpg|jpeg|png|gif|webp)$/i', '.webp', $imagePath);
        $image->toWebp((int)(self::WEBP_QUALITY / 100))->save(
            Storage::disk('public')->path($newPath)
        );

        return $this->getFullUrl($newPath);
    }

    public static function getAllowedFormats(): array
    {
        return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif'];
    }

    public static function getMaxFileSize(): int
    {
        return 5 * 1024 * 1024;
    }

    public static function getMaxImagesPerAd(): int
    {
        return 6;
    }
}
