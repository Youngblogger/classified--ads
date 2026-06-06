<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\File\File;

class ImageStorageService
{
    protected const MAX_IMAGES_PER_AD = 10;
    protected const MAX_FILE_SIZE = 10 * 1024 * 1024;

    protected const ALLOWED_MIMES = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
    ];

    public function __construct(
        protected CloudinaryService $cloudinary,
    ) {}

    public function upload(UploadedFile|File $file, array $options = []): array
    {
        $folder = $options['folder'] ?? 'ads';
        $userId = $options['user_id'] ?? null;
        $publicId = $options['public_id'] ?? null;

        $uploadOptions = [
            'folder' => $folder,
            'user_id' => $userId,
            'check_rate_limit' => $options['check_rate_limit'] ?? true,
        ];

        if ($publicId) {
            $uploadOptions['public_id'] = $publicId;
        }

        if (!empty($options['tags'])) {
            $uploadOptions['tags'] = $options['tags'];
        }

        $filePath = $file instanceof UploadedFile
            ? $file->getPathname()
            : $file->getPathname();

        $result = $this->cloudinary->uploadImage($filePath, $uploadOptions);

        if (!$result['success']) {
            Log::error('ImageStorage: upload failed', [
                'error' => $result['error'] ?? 'Unknown error',
                'folder' => $folder,
            ]);
            throw new \RuntimeException($result['error'] ?? 'Image upload failed');
        }

        return [
            'public_id' => $result['public_id'],
            'url' => $result['optimized_url'] ?? $result['secure_url'],
            'original_url' => $result['secure_url'],
            'thumbnail_url' => $result['thumbnail_url'],
            'medium_url' => $result['listing_url'] ?? $result['optimized_url'],
            'width' => $result['width'] ?? null,
            'height' => $result['height'] ?? null,
            'file_size' => $result['bytes'] ?? null,
        ];
    }

    public function delete(string $publicId): void
    {
        if (empty($publicId)) {
            Log::warning('ImageStorage: delete skipped — empty public_id');
            return;
        }

        $result = $this->cloudinary->deleteImage($publicId);

        if (!$result['success']) {
            Log::warning('ImageStorage: delete failed', [
                'public_id' => $publicId,
                'error' => $result['error'] ?? 'Unknown error',
            ]);
        }
    }

    public function deleteMany(array $publicIds): void
    {
        foreach ($publicIds as $publicId) {
            $this->delete($publicId);
        }
    }

    public function url(string $publicId): string
    {
        return $this->cloudinary->getOptimizedUrl($publicId);
    }

    public function thumbnailUrl(string $publicId, int $width = 300, int $height = 300): string
    {
        return $this->cloudinary->getThumbnailUrl($publicId, $width, $height);
    }

    public function mediumUrl(string $publicId, int $width = 800, int $height = 600): string
    {
        return $this->cloudinary->getListingUrl($publicId);
    }

    public function placeholderUrl(string $type = 'default'): string
    {
        return $this->cloudinary->getPlaceholderUrl($type);
    }

    public function validateImage(UploadedFile $file): array
    {
        if (!in_array($file->getMimeType(), self::ALLOWED_MIMES)) {
            throw new \InvalidArgumentException(
                'Invalid image type. Allowed: ' . implode(', ', self::ALLOWED_MIMES)
            );
        }

        if ($file->getSize() > self::MAX_FILE_SIZE) {
            throw new \InvalidArgumentException(
                'Image too large. Maximum: ' . (self::MAX_FILE_SIZE / 1024 / 1024) . 'MB'
            );
        }

        $imageInfo = @getimagesize($file->getPathname());

        return [
            'width' => $imageInfo[0] ?? 0,
            'height' => $imageInfo[1] ?? 0,
            'size' => $file->getSize(),
        ];
    }

    public static function getMaxImagesPerAd(): int
    {
        return self::MAX_IMAGES_PER_AD;
    }

    public static function getAllowedFormats(): array
    {
        return ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    }

    public static function getMaxFileSize(): int
    {
        return self::MAX_FILE_SIZE;
    }
}
