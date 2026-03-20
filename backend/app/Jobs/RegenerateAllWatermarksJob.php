<?php

namespace App\Jobs;

use App\Models\Ad;
use App\Models\AdImage;
use App\Services\ImageProcessingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class RegenerateAllWatermarksJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;
    public int $timeout = 3600;

    public function __construct(
        public ?int $adId = null,
        public int $batchSize = 10
    ) {
        $this->onQueue('watermark-regeneration');
    }

    public function handle(ImageProcessingService $imageService): void
    {
        Log::info("Starting watermark regeneration", [
            'ad_id' => $this->adId,
        ]);

        try {
            $query = AdImage::with('ad');

            if ($this->adId) {
                $query->where('ad_id', $this->adId);
            }

            $totalImages = $query->count();
            $processed = 0;
            $failed = 0;

            $query->chunk($this->batchSize, function ($images) use ($imageService, &$processed, &$failed) {
                foreach ($images as $image) {
                    try {
                        $originalPath = $this->getOriginalPath($image->original_url);
                        
                        if (!$originalPath || !file_exists($originalPath)) {
                            Log::warning("Original not found for image {$image->id}");
                            $failed++;
                            continue;
                        }

                        $newUrl = $imageService->regenerateWatermarkForImage(
                            $originalPath,
                            $image->ad_id
                        );

                        $image->update([
                            'url' => $newUrl,
                        ]);

                        $processed++;
                        Log::info("Regenerated watermark for image {$image->id}");

                    } catch (\Exception $e) {
                        Log::error("Failed to regenerate image {$image->id}", [
                            'error' => $e->getMessage(),
                        ]);
                        $failed++;
                    }
                }
            });

            Log::info("Watermark regeneration completed", [
                'total' => $totalImages,
                'processed' => $processed,
                'failed' => $failed,
            ]);

        } catch (\Exception $e) {
            Log::error("Watermark regeneration failed", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    private function getOriginalPath(?string $url): ?string
    {
        if (!$url) {
            return null;
        }

        $path = str_replace('/storage/', '', parse_url($url, PHP_URL_PATH));
        return storage_path('app/public/' . $path);
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("RegenerateAllWatermarksJob failed", [
            'error' => $exception->getMessage(),
        ]);
    }
}
