<?php

namespace App\Services;

use Cloudinary\Configuration\Configuration;
use Cloudinary\Api\Upload\UploadApi;
use Cloudinary\Transformation\Quality;
use Cloudinary\Transformation\Format;
use Cloudinary\Transformation\Resize;
use Cloudinary\Transformation\Gravity;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;

class CloudinaryService
{
    protected UploadApi $uploadApi;
    protected string $cloudName;
    protected string $apiKey;
    protected string $apiSecret;

    protected const MAX_UPLOAD_RETRIES = 3;
    protected const MAX_DELETE_RETRIES = 2;
    protected const RETRY_BASE_DELAY_MS = 1000; // 1s base for exponential backoff

    protected const ALLOWED_MIME_TYPES = [
        'image/jpeg' => 'jpg',
        'image/jpg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/gif' => 'gif',
    ];

    protected const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    protected const MAX_UPLOADS_PER_MINUTE = 10;

    protected const FOLDERS = [
        'ad' => 'classified-ads/ads',
        'ads' => 'classified-ads/ads',
        'avatar' => 'classified-ads/users/avatars',
        'avatars' => 'classified-ads/users/avatars',
        'banner' => 'classified-ads/banners',
        'banners' => 'classified-ads/banners',
        'proof' => 'classified-ads/documents/proofs',
        'proofs' => 'classified-ads/documents/proofs',
        'logo' => 'classified-ads/watermarks',
        'watermark' => 'classified-ads/watermarks',
        'font' => 'classified-ads/fonts',
        'document' => 'classified-ads/documents',
        'default' => 'classified-ads/uploads',
    ];

    protected const EAGER_TRANSFORMATIONS = [
        'thumbnail' => [
            'width' => 300,
            'height' => 300,
            'crop' => 'fill',
            'gravity' => 'auto',
            'quality' => 80,
            'format' => 'webp',
        ],
        'medium' => [
            'width' => 800,
            'height' => 600,
            'crop' => 'fill',
            'gravity' => 'auto',
            'quality' => 80,
            'format' => 'webp',
        ],
    ];

    public function __construct()
    {
        $this->cloudName = Config::get('services.cloudinary.cloud_name');
        $this->apiKey = Config::get('services.cloudinary.api_key');
        $this->apiSecret = Config::get('services.cloudinary.api_secret');

        if (!$this->cloudName || !$this->apiKey || !$this->apiSecret) {
            throw new \RuntimeException('Cloudinary configuration is incomplete');
        }

        Configuration::instance([
            'cloud' => [
                'cloud_name' => $this->cloudName,
                'api_key' => $this->apiKey,
                'api_secret' => $this->apiSecret,
            ],
            'url' => [
                'secure' => true,
            ],
        ]);

        $this->uploadApi = new UploadApi();
    }

    public function uploadImage(string $filePath, array $options = []): array
    {
        $folder = $this->resolveFolder($options['folder'] ?? 'default');
        $publicId = $options['public_id'] ?? $this->generatePublicId($folder);
        $maxFileSize = $options['max_file_size'] ?? self::MAX_FILE_SIZE;
        $userId = $options['user_id'] ?? null;

        $context = [
            'public_id' => $publicId,
            'user_id' => $userId,
            'folder' => $folder,
            'file_size' => file_exists($filePath) ? filesize($filePath) : 0,
        ];

        if (!file_exists($filePath)) {
            Log::error('Cloudinary upload failed: file not found', $context);
            return $this->errorResponse('File not found: ' . $filePath);
        }

        if (filesize($filePath) > $maxFileSize) {
            Log::warning('Cloudinary upload rejected: file too large', [
                ...$context,
                'max_size' => $maxFileSize,
            ]);
            return $this->errorResponse('File exceeds maximum size of ' . ($maxFileSize / 1024 / 1024) . 'MB');
        }

        if ($options['check_rate_limit'] ?? true) {
            $rateLimitResult = $this->checkRateLimit($userId);
            if (!$rateLimitResult['allowed']) {
                Log::warning('Cloudinary upload blocked: rate limit exceeded', $context);
                return $this->errorResponse($rateLimitResult['message'], 429);
            }
        }

        Log::info('Cloudinary upload started', $context);

        $eager = $this->buildEagerTransformations($options['eager'] ?? true);

        $uploadParams = [
            'folder' => $folder,
            'public_id' => $publicId,
            'resource_type' => 'image',
            'quality' => 'auto',
            'fetch_format' => 'auto',
            'eager' => $eager,
            'eager_async' => true,
            'invalidate' => true,
        ];

        if (!empty($options['tags'])) {
            $uploadParams['tags'] = $options['tags'];
        }

        if (!empty($options['context'])) {
            $uploadParams['context'] = $options['context'];
        }

        $result = $this->retryUpload(function () use ($filePath, $uploadParams, $publicId) {
            $result = $this->uploadApi->upload($filePath, $uploadParams);
            return $this->buildSuccessResponse($result, $publicId);
        }, self::MAX_UPLOAD_RETRIES, 'upload', $context);

        if ($result['success']) {
            Log::info('Cloudinary upload completed', [
                ...$context,
                'width' => $result['width'] ?? null,
                'height' => $result['height'] ?? null,
                'format' => $result['format'] ?? null,
            ]);
        } else {
            Log::error('Cloudinary upload failed after retries', [
                ...$context,
                'error' => $result['error'] ?? 'Unknown error',
            ]);
        }

        return $result;
    }

    public function uploadImageFromBase64(string $base64Data, array $options = []): array
    {
        $tempFile = tempnam(sys_get_temp_dir(), 'cloudinary_');

        try {
            if (str_starts_with($base64Data, 'data:')) {
                $base64Data = explode(',', $base64Data, 2)[1] ?? '';
            }

            $decoded = base64_decode($base64Data, true);
            if ($decoded === false) {
                return $this->errorResponse('Invalid base64 data');
            }

            file_put_contents($tempFile, $decoded);

            return $this->uploadImage($tempFile, $options);
        } finally {
            if (file_exists($tempFile)) {
                unlink($tempFile);
            }
        }
    }

    public function deleteImage(string $publicId): array
    {
        if (empty($publicId)) {
            return $this->errorResponse('Empty public_id provided');
        }

        $context = ['public_id' => $publicId];
        Log::info('Cloudinary delete started', $context);

        return $this->retry(function () use ($publicId) {
            $result = $this->uploadApi->destroy($publicId);
            return [
                'success' => $result->getResult() === 'ok',
                'result' => $result->getResult(),
                'public_id' => $publicId,
            ];
        }, self::MAX_DELETE_RETRIES, 'delete', $context);
    }

    public function deleteMultipleImages(array $publicIds): array
    {
        $results = [];
        foreach ($publicIds as $publicId) {
            $results[$publicId] = $this->deleteImage($publicId);
        }
        return $results;
    }

    public function generateSignedUploadParams(array $options = []): array
    {
        $folder = $this->resolveFolder($options['folder'] ?? 'default');
        $timestamp = time();

        $params = [
            'timestamp' => $timestamp,
            'folder' => $folder,
            'quality' => 'auto',
            'fetch_format' => 'auto',
        ];

        if (!empty($options['public_id_prefix'])) {
            $params['public_id'] = $options['public_id_prefix'] . '_' . time();
        }

        if (!empty($options['eager'])) {
            $params['eager'] = $this->buildEagerTransformations($options['eager']);
            $params['eager_async'] = true;
        }

        if (!empty($options['tags'])) {
            $params['tags'] = implode(',', $options['tags']);
        }

        $params['api_key'] = $this->apiKey;

        $signature = $this->generateSignature($params);

        return [
            'cloud_name' => $this->cloudName,
            'api_key' => $this->apiKey,
            'timestamp' => $timestamp,
            'signature' => $signature,
            'folder' => $folder,
            'quality' => 'auto',
            'fetch_format' => 'auto',
            'eager' => $params['eager'] ?? null,
            'eager_async' => true,
            'public_id' => $params['public_id'] ?? null,
        ];
    }

    public function getOptimizedUrl(string $publicId, array $options = []): string
    {
        if (empty($publicId)) {
            return $this->getPlaceholderUrl($options['placeholder'] ?? 'default');
        }

        $transformations = $this->buildTransformations($options);
        $transformation = implode(',', $transformations);

        return "https://res.cloudinary.com/{$this->cloudName}/image/upload/{$transformation}/{$publicId}";
    }

    public function getThumbnailUrl(string $publicId, int $width = 300, int $height = 300): string
    {
        return $this->getOptimizedUrl($publicId, [
            'width' => $width,
            'height' => $height,
            'crop' => 'fill',
            'gravity' => 'auto',
            'quality' => 80,
        ]);
    }

    public function getBlurPlaceholderUrl(string $publicId, int $width = 50): string
    {
        return $this->getOptimizedUrl($publicId, [
            'width' => $width,
            'effect' => 'blur:500',
            'quality' => 1,
        ]);
    }

    public function getPlaceholderUrl(string $type = 'default'): string
    {
        $placeholders = [
            'default' => "https://res.cloudinary.com/{$this->cloudName}/image/upload/w_800,h_600,c_fill,g_auto,q_auto,f_auto/v1/placeholder/default",
            'avatar' => "https://res.cloudinary.com/{$this->cloudName}/image/upload/w_200,h_200,c_fill,g_face,q_auto,f_auto/v1/placeholder/avatar",
            'banner' => "https://res.cloudinary.com/{$this->cloudName}/image/upload/w_1200,h_400,c_fill,g_auto,q_auto,f_auto/v1/placeholder/banner",
            'thumbnail' => "https://res.cloudinary.com/{$this->cloudName}/image/upload/w_300,h_300,c_fill,g_auto,q_auto,f_auto/v1/placeholder/thumbnail",
        ];

        return $placeholders[$type] ?? $placeholders['default'];
    }

    public function generateResponsiveSrcset(string $publicId, array $breakpoints = [320, 640, 768, 1024, 1280]): string
    {
        $sources = [];
        foreach ($breakpoints as $width) {
            $url = $this->getOptimizedUrl($publicId, [
                'width' => $width,
                'crop' => 'scale',
                'quality' => 'auto',
            ]);
            $sources[] = "{$url} {$width}w";
        }

        return implode(', ', $sources);
    }

    public function getResponsiveSizesAttribute(int $defaultWidth = 800): string
    {
        return "(max-width: 640px) 320px, (max-width: 768px) 640px, (max-width: 1024px) 768px, {$defaultWidth}px";
    }

    public function buildImageUrl(string $publicId, array $options = []): array
    {
        if (empty($publicId)) {
            return [
                'src' => $this->getPlaceholderUrl($options['placeholder'] ?? 'default'),
                'srcset' => '',
                'sizes' => '',
                'thumbnail' => $this->getPlaceholderUrl('thumbnail'),
                'blur' => '',
            ];
        }

        return [
            'src' => $this->getOptimizedUrl($publicId, $options),
            'srcset' => $this->generateResponsiveSrcset($publicId),
            'sizes' => $this->getResponsiveSizesAttribute($options['default_width'] ?? 800),
            'thumbnail' => $this->getThumbnailUrl($publicId, 300, 300),
            'blur' => $this->getBlurPlaceholderUrl($publicId),
        ];
    }

    public function validateImageFile(string $filePath): array
    {
        if (!file_exists($filePath)) {
            return ['valid' => false, 'error' => 'File not found'];
        }

        $fileSize = filesize($filePath);
        if ($fileSize > self::MAX_FILE_SIZE) {
            return [
                'valid' => false,
                'error' => 'File size exceeds ' . (self::MAX_FILE_SIZE / 1024 / 1024) . 'MB limit',
            ];
        }

        if ($fileSize === 0) {
            return ['valid' => false, 'error' => 'File is empty'];
        }

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $filePath);
        finfo_close($finfo);

        if (!array_key_exists($mimeType, self::ALLOWED_MIME_TYPES)) {
            return [
                'valid' => false,
                'error' => 'Invalid file type. Allowed: ' . implode(', ', array_keys(self::ALLOWED_MIME_TYPES)),
            ];
        }

        $imageInfo = getimagesize($filePath);
        if ($imageInfo === false) {
            return ['valid' => false, 'error' => 'Invalid image file'];
        }

        return [
            'valid' => true,
            'mime_type' => $mimeType,
            'width' => $imageInfo[0],
            'height' => $imageInfo[1],
            'size' => $fileSize,
        ];
    }

    public function getCloudinaryConfig(): array
    {
        return [
            'cloud_name' => $this->cloudName,
            'api_key' => $this->apiKey,
            'folders' => self::FOLDERS,
            'max_file_size' => self::MAX_FILE_SIZE,
            'allowed_mime_types' => array_keys(self::ALLOWED_MIME_TYPES),
            'max_uploads_per_minute' => self::MAX_UPLOADS_PER_MINUTE,
        ];
    }

    protected function retry(callable $callback, int $maxRetries, string $operation, array $context = []): array
    {
        $attempts = 0;

        while ($attempts < $maxRetries) {
            try {
                $result = $callback();

                Log::info("Cloudinary {$operation} succeeded", [
                    ...$context,
                    'attempt' => $attempts + 1,
                ]);

                return $result;
            } catch (\Exception $e) {
                $attempts++;
                $delayMs = self::RETRY_BASE_DELAY_MS * (2 ** ($attempts - 1)); // 1s, 2s, 4s

                Log::warning("Cloudinary {$operation} attempt {$attempts}/{$maxRetries} failed: " . $e->getMessage(), [
                    ...$context,
                    'exception' => get_class($e),
                    'retry_delay_ms' => $delayMs,
                ]);

                if ($attempts >= $maxRetries) {
                    Log::error("Cloudinary {$operation} failed after {$maxRetries} attempts: " . $e->getMessage(), [
                        ...$context,
                        'exception' => get_class($e),
                        'trace' => $e->getTraceAsString(),
                    ]);
                    return $this->errorResponse("{$operation} failed after {$maxRetries} attempts: " . $e->getMessage());
                }

                usleep($delayMs * 1000);
            }
        }

        return $this->errorResponse("{$operation} failed");
    }

    protected function retryUpload(callable $callback): array
    {
        return $this->retry($callback, self::MAX_UPLOAD_RETRIES, 'upload');
    }

    protected function checkRateLimit(?int $userId = null): array
    {
        $key = 'cloudinary_upload_' . ($userId ?? 'guest') . '_' . now()->format('YmdHi');

        $current = Cache::increment($key);
        Cache::put($key, $current, now()->addMinutes(1));

        if ($current > self::MAX_UPLOADS_PER_MINUTE) {
            return [
                'allowed' => false,
                'message' => 'Upload limit exceeded. Please wait before uploading more images.',
                'retry_after' => 60,
            ];
        }

        return ['allowed' => true];
    }

    protected function generateSignature(array $params): string
    {
        $paramsString = '';

        ksort($params);

        foreach ($params as $key => $value) {
            if ($value !== '' && $value !== null) {
                $paramsString .= "&{$key}={$value}";
            }
        }

        $paramsString = ltrim($paramsString, '&');

        return sha1($paramsString . $this->apiSecret);
    }

    protected function buildEagerTransformations(bool $enabled = true): ?string
    {
        if (!$enabled) {
            return null;
        }

        $transformations = [];

        foreach (self::EAGER_TRANSFORMATIONS as $name => $params) {
            $parts = [];
            foreach ($params as $key => $value) {
                $parts[] = "{$key}_{$value}";
            }
            $transformations[] = implode(',', $parts);
        }

        return implode('|', $transformations);
    }

    protected function buildTransformations(array $options): array
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

        if (isset($options['effect'])) {
            $transformations[] = "e_{$options['effect']}";
        }

        if (isset($options['rotation'])) {
            $transformations[] = "a_{$options['rotation']}";
        }

        $quality = $options['quality'] ?? 'auto';
        $transformations[] = "q_{$quality}";
        $transformations[] = 'f_auto';

        return $transformations;
    }

    protected function buildSuccessResponse($result, string $publicId): array
    {
        return [
            'success' => true,
            'public_id' => $publicId,
            'secure_url' => $result->getSecureUrl(),
            'url' => $result->getUrl(),
            'width' => $result->getWidth(),
            'height' => $result->getHeight(),
            'format' => $result->getFormat(),
            'bytes' => $result->getBytes(),
            'thumbnail_url' => $this->getThumbnailUrl($publicId),
            'optimized_url' => $this->getOptimizedUrl($publicId),
            'blur_url' => $this->getBlurPlaceholderUrl($publicId),
            'responsive' => $this->buildImageUrl($publicId),
        ];
    }

    protected function errorResponse(string $message, int $statusCode = 500): array
    {
        return [
            'success' => false,
            'error' => $message,
            'status_code' => $statusCode,
        ];
    }

    protected function resolveFolder(string $folder): string
    {
        $folder = strtolower($folder);

        foreach (self::FOLDERS as $key => $path) {
            if (str_contains($folder, $key)) {
                return $path;
            }
        }

        return self::FOLDERS['default'];
    }

    protected function generatePublicId(string $folder): string
    {
        $prefix = str_replace('classified-ads/', '', $folder);
        $prefix = str_replace('/', '_', $prefix);

        return "{$prefix}/" . now()->timestamp . '_' . bin2hex(random_bytes(4));
    }
}
