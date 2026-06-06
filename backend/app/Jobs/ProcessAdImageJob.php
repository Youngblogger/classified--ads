<?php

namespace App\Jobs;

use App\Models\Ad;
use App\Models\AdImage;
use App\Services\ImageStorageService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessAdImageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 120;
    public int $backoff = 30;

    public function __construct(
        public int $adId,
        public string $filePath,
        public int $sortOrder,
        public bool $isPrimary = false,
    ) {
        $this->onQueue('image-processing');
    }

    public function handle(ImageStorageService $storage): void
    {
        Log::info("Processing image for ad {$this->adId}", [
            'sort_order' => $this->sortOrder,
        ]);

        try {
            $ad = Ad::find($this->adId);
            if (!$ad) {
                Log::error("Ad not found: {$this->adId}");
                return;
            }

            if (!file_exists($this->filePath)) {
                Log::error("File not found: {$this->filePath}");
                throw new \Exception("File not found: {$this->filePath}");
            }

            $result = $storage->upload(
                new \Illuminate\Http\File($this->filePath),
                [
                    'folder' => 'ads',
                    'tags' => ['ad', 'ad_' . $this->adId],
                    'check_rate_limit' => false,
                ]
            );

            AdImage::create([
                'ad_id' => $this->adId,
                'url' => $result['url'],
                'original_url' => $result['original_url'],
                'medium_url' => $result['medium_url'],
                'thumbnail_url' => $result['thumbnail_url'],
                'public_id' => $result['public_id'],
                'width' => $result['width'],
                'height' => $result['height'],
                'file_size' => $result['file_size'],
                'is_primary' => $this->isPrimary,
                'sort_order' => $this->sortOrder,
            ]);

            @unlink($this->filePath);

            Log::info("Image processed successfully for ad {$this->adId}");
        } catch (\Exception $e) {
            Log::error("Failed to process image for ad {$this->adId}", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("ProcessAdImageJob failed for ad {$this->adId}", [
            'error' => $exception->getMessage(),
        ]);

        @unlink($this->filePath);
    }
}
