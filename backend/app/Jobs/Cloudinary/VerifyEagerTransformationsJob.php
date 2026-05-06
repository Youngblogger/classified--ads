<?php

namespace App\Jobs\Cloudinary;

use App\Models\AdImage;
use App\Services\CloudinaryService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class VerifyEagerTransformationsJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $backoff = 30;

    public function __construct(
        public string $publicId,
        public int $adImageId,
        public ?int $userId = null,
    ) {
    }

    public function handle(CloudinaryService $cloudinary): void
    {
        $context = [
            'public_id' => $this->publicId,
            'ad_image_id' => $this->adImageId,
            'user_id' => $this->userId,
        ];

        Log::info('Cloudinary eager transformation verification started', $context);

        try {
            $adImage = AdImage::find($this->adImageId);

            if (!$adImage) {
                Log::warning('AdImage not found for eager verification', $context);
                return;
            }

            $transformations = [
                'thumbnail' => $cloudinary->getThumbnailUrl($this->publicId),
                'optimized' => $cloudinary->getOptimizedUrl($this->publicId),
            ];

            foreach ($transformations as $name => $url) {
                $headers = @get_headers($url);

                if ($headers && str_contains($headers[0], '200')) {
                    Log::info("Eager transformation verified: {$name}", $context);
                } else {
                    Log::warning("Eager transformation missing: {$name}", [
                        ...$context,
                        'url' => $url,
                    ]);

                    if ($name === 'thumbnail') {
                        $adImage->update(['thumbnail_url' => $cloudinary->getThumbnailUrl($this->publicId, 300, 300)]);
                    }
                }
            }
        } catch (\Exception $e) {
            Log::error('Cloudinary eager verification failed', [
                ...$context,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
