<?php

namespace App\Services;

use Cloudinary\Configuration\Configuration;
use Cloudinary\Api\Upload\UploadApi;
use Cloudinary\Transformation\Quality;
use Cloudinary\Transformation\Format;
use Cloudinary\Transformation\Resize;
use Cloudinary\Transformation\Gravity;
use Illuminate\Support\Facades\Log;

class CloudinaryService
{
    protected UploadApi $uploadApi;
    protected string $cloudName;
    protected string $apiKey;
    protected string $apiSecret;

    public function __construct()
    {
        $this->cloudName = config('services.cloudinary.cloud_name');
        $this->apiKey = config('services.cloudinary.api_key');
        $this->apiSecret = config('services.cloudinary.api_secret');

        Configuration::instance([
            'cloud' => [
                'cloud_name' => $this->cloudName,
                'api_key' => $this->apiKey,
                'api_secret' => $this->apiSecret,
            ],
        ]);

        $this->uploadApi = new UploadApi();
    }

    public function uploadImage(string $filePath, array $options = []): array
    {
        $folder = $options['folder'] ?? 'classified-ads';
        $publicId = $options['public_id'] ?? null;
        $transformation = $options['transformation'] ?? null;

        $uploadParams = [
            'folder' => $folder,
            'resource_type' => 'image',
            'quality' => 'auto',
            'fetch_format' => 'auto',
        ];

        if ($publicId) {
            $uploadParams['public_id'] = $publicId;
        }

        if ($transformation) {
            $uploadParams['transformation'] = $transformation;
        }

        try {
            $result = $this->uploadApi->upload($filePath, $uploadParams);

            return [
                'success' => true,
                'public_id' => $result->getPublicId(),
                'secure_url' => $result->getSecureUrl(),
                'url' => $result->getUrl(),
                'width' => $result->getWidth(),
                'height' => $result->getHeight(),
                'format' => $result->getFormat(),
                'bytes' => $result->getBytes(),
                'thumbnail_url' => $this->getThumbnailUrl($result->getPublicId()),
                'optimized_url' => $this->getOptimizedUrl($result->getPublicId()),
            ];
        } catch (\Exception $e) {
            Log::error('Cloudinary upload failed: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    public function uploadImageFromPath(string $localPath, array $options = []): array
    {
        return $this->uploadImage($localPath, $options);
    }

    public function deleteImage(string $publicId): array
    {
        try {
            $result = $this->uploadApi->destroy($publicId);

            return [
                'success' => $result->getResult() === 'ok',
                'result' => $result->getResult(),
            ];
        } catch (\Exception $e) {
            Log::error('Cloudinary delete failed: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    public function getOptimizedUrl(string $publicId): string
    {
        return "https://res.cloudinary.com/{$this->cloudName}/image/upload/f_auto,q_auto/{$publicId}";
    }

    public function getThumbnailUrl(string $publicId, int $width = 400, int $height = 300): string
    {
        return "https://res.cloudinary.com/{$this->cloudName}/image/upload/c_fill,f_auto,g_auto,h_{$height},q_80,w_{$width}/{$publicId}";
    }

    public function getTransformedUrl(string $publicId, array $options = []): string
    {
        $transformations = [];

        if (isset($options['width'])) {
            $transformations[] = "w_{$options['width']}";
        }

        if (isset($options['height'])) {
            $transformations[] = "h_{$options['height']}";
        }

        if (isset($options['crop'])) {
            $transformations[] = "c_{$options['crop']}";
        }

        if (isset($options['gravity'])) {
            $transformations[] = "g_{$options['gravity']}";
        }

        $quality = $options['quality'] ?? 'auto';
        $transformations[] = "q_{$quality}";
        $transformations[] = 'f_auto';

        $transformation = implode(',', $transformations);

        return "https://res.cloudinary.com/{$this->cloudName}/image/upload/{$transformation}/{$publicId}";
    }

    public function extractPublicIdFromUrl(string $url): ?string
    {
        $pattern = '/\/v\d+\/(.+?)(?:\.\w+)?$/';
        if (preg_match($pattern, $url, $matches)) {
            return $matches[1];
        }
        return null;
    }
}
