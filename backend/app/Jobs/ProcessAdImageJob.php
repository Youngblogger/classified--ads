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
use Illuminate\Support\Facades\Storage;

class ProcessAdImageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 60;
    public int $maxConcurrentProcesses = 3;

    public function __construct(
        public int $adId,
        public string $tempPath,
        public int $sortOrder,
        public bool $isPrimary = false
    ) {
        $this->onQueue('image-processing');
    }

    public function handle(ImageProcessingService $imageService): void
    {
        Log::info("Processing image for ad {$this->adId}", [
            'temp_path' => $this->tempPath,
            'sort_order' => $this->sortOrder,
        ]);

        try {
            $ad = Ad::find($this->adId);
            if (!$ad) {
                Log::error("Ad not found: {$this->adId}");
                return;
            }

            $fullTempPath = Storage::disk('public')->path($this->tempPath);
            
            if (!file_exists($fullTempPath)) {
                Log::error("Temp file not found: {$fullTempPath}");
                throw new \Exception("Temp file not found");
            }

            $result = $imageService->processAdImage(
                new \Illuminate\Http\File($fullTempPath),
                $this->adId
            );

            AdImage::create([
                'ad_id' => $this->adId,
                'url' => $result['url'],
                'original_url' => $result['original_url'],
                'thumbnail_url' => $result['thumbnail_url'],
                'file_size' => $result['file_size'],
                'is_primary' => $this->isPrimary,
                'sort_order' => $this->sortOrder,
            ]);

            Storage::disk('public')->delete($this->tempPath);

            Log::info("Image processed successfully for ad {$this->adId}", [
                'url' => $result['url'],
            ]);

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

        Storage::disk('public')->delete($this->tempPath);
    }
}
