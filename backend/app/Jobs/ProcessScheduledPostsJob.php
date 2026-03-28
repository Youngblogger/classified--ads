<?php

namespace App\Jobs;

use App\Models\ScheduledPost;
use App\Models\SocialPostLog;
use App\Services\SocialMediaService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Process Scheduled Posts Job
 * 
 * Laravel Scheduler job that runs every minute to:
 * - Find posts scheduled for the current time
 * - Dispatch PostAdJob for each
 * - Retry failed posts automatically
 */
class ProcessScheduledPostsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Execute the job.
     */
    public function handle(SocialMediaService $socialService): void
    {
        $this->processScheduledPosts($socialService);
        $this->retryFailedPosts($socialService);
    }

    /**
     * Process posts that are due to be published
     */
    protected function processScheduledPosts(SocialMediaService $socialService): void
    {
        // Find pending posts where scheduled_time has passed
        $scheduledPosts = ScheduledPost::where('status', 'pending')
            ->where('scheduled_time', '<=', now())
            ->with(['ad.images', 'ad.location'])
            ->get();

        foreach ($scheduledPosts as $scheduledPost) {
            // Double check the ad exists and is active
            if (!$scheduledPost->ad) {
                $scheduledPost->update(['status' => 'failed']);
                continue;
            }

            if ($scheduledPost->ad->status !== 'active') {
                $scheduledPost->update(['status' => 'failed']);
                continue;
            }

            // Get platforms from status or use enabled platforms
            $platformStatuses = $scheduledPost->platform_statuses ?? [];
            $platforms = array_keys(array_filter($platformStatuses, fn($status) => $status === 'pending'));

            if (empty($platforms)) {
                $platforms = $socialService->getEnabledPlatforms();
            }

            // Dispatch the job
            PostAdJob::dispatch(
                $scheduledPost->ad_id,
                $platforms,
                $scheduledPost->id
            );

            Log::info('ProcessScheduledPostsJob: Dispatched post', [
                'scheduled_post_id' => $scheduledPost->id,
                'ad_id' => $scheduledPost->ad_id,
                'platforms' => $platforms,
            ]);
        }

        Log::info('ProcessScheduledPostsJob: Processed ' . $scheduledPosts->count() . ' scheduled posts');
    }

    /**
     * Retry failed posts that haven't exceeded max attempts
     * @param SocialMediaService $socialService
     */
    protected function retryFailedPosts($socialService): void
    {
        // Find failed posts that haven't exceeded retry limit
        $failedLogs = SocialPostLog::where('status', 'failed')
            ->where('attempt_count', '<', 3)
            ->where('created_at', '>', now()->subHours(24)) // Only retry within 24 hours
            ->get();

        foreach ($failedLogs as $log) {
            try {
                $result = $socialService->retryPost($log);

                Log::info('ProcessScheduledPostsJob: Retried post', [
                    'log_id' => $log->id,
                    'platform' => $log->platform,
                    'result' => $result,
                ]);
            } catch (\Exception $e) {
                Log::error('ProcessScheduledPostsJob: Retry failed', [
                    'log_id' => $log->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        if ($failedLogs->count() > 0) {
            Log::info('ProcessScheduledPostsJob: Retried ' . $failedLogs->count() . ' failed posts');
        }
    }
}
