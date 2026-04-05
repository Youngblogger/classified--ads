<?php

namespace App\Jobs;

use App\Models\Ad;
use App\Services\AutoFixService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class AutoFixAdJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $adId;
    public ?int $userId;
    public int $tries = 3;
    public int $timeout = 120;

    public function __construct(int $adId, ?int $userId = null)
    {
        $this->adId = $adId;
        $this->userId = $userId;
    }

    public function handle(AutoFixService $autoFixService): void
    {
        $ad = Ad::find($this->adId);

        if (!$ad) {
            Log::warning('AutoFixAdJob: Ad not found', ['ad_id' => $this->adId]);
            return;
        }

        if (!$ad->is_seeded) {
            Log::warning('AutoFixAdJob: Cannot auto-fix non-seeded ad', ['ad_id' => $this->adId]);
            return;
        }

        Log::info('AutoFixAdJob: Starting fix', ['ad_id' => $this->adId]);

        $result = $autoFixService->fix($ad, $this->userId);

        if ($result['success']) {
            Log::info('AutoFixAdJob: Fix completed', [
                'ad_id' => $this->adId,
                'new_score' => $result['new_score'] ?? null,
            ]);
        } else {
            Log::error('AutoFixAdJob: Fix failed', [
                'ad_id' => $this->adId,
                'message' => $result['message'] ?? 'Unknown error',
            ]);
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('AutoFixAdJob: Job failed', [
            'ad_id' => $this->adId,
            'error' => $exception->getMessage(),
        ]);
    }
}
