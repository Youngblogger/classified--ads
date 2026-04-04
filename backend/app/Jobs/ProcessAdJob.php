<?php

namespace App\Jobs;

use App\Models\Ad;
use App\Models\Category;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessAdJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $adId;
    public int $tries = 3;
    public int $timeout = 90;

    public function __construct(int $adId)
    {
        $this->adId = $adId;
    }

    public function handle(): void
    {
        $ad = Ad::find($this->adId);
        
        if (!$ad) {
            return;
        }

        $ad->update(['processing_status' => 'processing']);

        try {
            $ad->refresh();

            $categorizationService = app(\App\Services\HybridCategorizationService::class);
            $result = $categorizationService->processWithFallback($ad);
            
            $ad->update([
                'ai_category_id' => $result['ai_category_id'],
                'ai_confidence' => $result['ai_confidence'],
                'tags' => $result['tags'] ?? [],
                'ai_summary' => $result['ai_summary'] ?? null,
                'is_auto_categorized' => $result['is_auto_categorized'] ?? false,
            ]);
            
            app(\App\Services\ImageValidationService::class)->validate($ad);

            if ($result['ai_confidence'] < 60) {
                $ad->update([
                    'processing_status' => 'flagged',
                    'processed_at' => now(),
                ]);
            } else {
                $ad->update([
                    'processing_status' => 'completed',
                    'processed_at' => now(),
                ]);
            }
        } catch (\Exception $e) {
            Log::error('ProcessAdJob failed: ' . $e->getMessage());
            
            $ad->update([
                'processing_status' => 'failed',
                'rejection_reason' => $e->getMessage(),
            ]);
        }
    }

    public function failed(\Throwable $exception): void
    {
        $ad = Ad::find($this->adId);
        
        if ($ad) {
            $ad->update([
                'processing_status' => 'failed',
                'rejection_reason' => 'Queue failed after retries: ' . $exception->getMessage(),
            ]);
        }
    }
}
