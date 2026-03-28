<?php

namespace App\Jobs;

use App\Models\Ad;
use App\Models\ScheduledPost;
use App\Services\SocialMediaService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Post Ad Job
 * 
 * Handles posting a single ad to social media platforms
 * Can be dispatched immediately or for scheduled posting
 */
class PostAdJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $adId;
    public ?int $scheduledPostId;
    public array $platforms;
    public int $attemptCount = 0;

    /**
     * Create a new job instance.
     */
    public function __construct(int $adId, array $platforms = [], ?int $scheduledPostId = null)
    {
        $this->adId = $adId;
        $this->platforms = $platforms;
        $this->scheduledPostId = $scheduledPostId;
    }

    /**
     * Execute the job.
     */
    public function handle(SocialMediaService $socialService): void
    {
        $ad = Ad::with(['images', 'location', 'category'])->find($this->adId);

        if (!$ad) {
            Log::error('PostAdJob: Ad not found', ['ad_id' => $this->adId]);
            return;
        }

        // Skip if ad is not active
        if ($ad->status !== 'active') {
            Log::info('PostAdJob: Skipping ad - not active', [
                'ad_id' => $this->adId,
                'status' => $ad->status,
            ]);
            return;
        }

        try {
            // Get enabled platforms if none specified
            $platforms = $this->platforms;
            if (empty($platforms)) {
                $platforms = $socialService->getEnabledPlatforms();
            }

            // Post to each platform
            $results = $socialService->postAd($ad, $platforms, $this->scheduledPostId);

            // Update scheduled post status if exists
            if ($this->scheduledPostId) {
                $this->updateScheduledPost($results);
            }

            Log::info('PostAdJob: Completed', [
                'ad_id' => $this->adId,
                'results' => $results,
            ]);
        } catch (\Exception $e) {
            Log::error('PostAdJob: Failed', [
                'ad_id' => $this->adId,
                'error' => $e->getMessage(),
            ]);

            // Retry if under max attempts
            if ($this->attemptCount < 3) {
                $this->attemptCount++;
                $this->release(60 * $this->attemptCount); // Exponential backoff
            }
        }
    }

    /**
     * Update scheduled post with results
     */
    protected function updateScheduledPost(array $results): void
    {
        if (!$this->scheduledPostId) {
            return;
        }

        $scheduledPost = ScheduledPost::find($this->scheduledPostId);
        
        if (!$scheduledPost) {
            return;
        }

        // Determine overall status
        $statuses = array_column($results, 'status');
        
        if (in_array('failed', $statuses)) {
            $newStatus = 'failed';
        } elseif (in_array('pending', $statuses) || in_array('skipped', $statuses)) {
            $newStatus = 'pending';
        } else {
            $newStatus = 'posted';
        }

        $scheduledPost->update([
            'status' => $newStatus,
            'platform_statuses' => $results,
        ]);
    }
}
