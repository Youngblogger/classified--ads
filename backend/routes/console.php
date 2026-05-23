<?php

use App\Jobs\AutoApproveAdsJob;
use App\Jobs\ProcessScheduledPostsJob;
use App\Jobs\ProcessAnalyticsJob;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// ============================================
// HIGH FREQUENCY (every minute)
// ============================================

// Auto-approve pending ads
Schedule::job(new AutoApproveAdsJob())->everyMinute();

// Process scheduled social media posts
Schedule::job(new ProcessScheduledPostsJob())->everyMinute();

// ============================================
// MEDIUM FREQUENCY (every 5 minutes)
// ============================================

// Sync recent ads to Meilisearch
Schedule::command('ads:sync-search --recent')->everyFiveMinutes()
    ->environments(['production'])
    ->onFailure(function () {
        Log::warning('Search sync failed');
    });

// Cleanup expired pending payments (verify with Paystack, mark as failed/expired)
Schedule::command('payments:cleanup-expired')->everyFiveMinutes()
    ->onSuccess(function () {
        Log::info('Pending payments cleanup completed successfully');
    })
    ->onFailure(function () {
        Log::warning('Pending payments cleanup failed');
    });

// Aggregate analytics metrics
Schedule::call(function () {
    Cache::forever('metrics:snapshot:hourly', [
        'timestamp' => now()->toIso8601String(),
        'data' => app(\App\Services\MonitoringService::class)->getMetricsSummary(),
    ]);
})->hourly();

// ============================================
// LOW FREQUENCY (hourly)
// ============================================

// Expire old boosts
Schedule::command('boosts:expire')->hourly()
    ->onSuccess(function () {
        app(\App\Services\CacheService::class)->clearBoostedAds();
        app(\App\Services\CdnService::class)->invalidateBoostCache();
    });

// Warm homepage cache
Schedule::call(function () {
    try {
        $controller = app(\App\Http\Controllers\Api\HomepageController::class);
        $request = request()->create('/api/homepage', 'GET');
        $controller->index($request);
        Log::info('Homepage cache warmed successfully');
    } catch (\Throwable $e) {
        Log::warning('Homepage cache warm failed: ' . $e->getMessage());
    }
})->everyTenMinutes()->environments(['production']);

// ============================================
// DAILY
// ============================================

// Clean up draft ads older than 24 hours
Schedule::command('ads:clean-drafts --hours=24')->daily();

// Sync all ads to Meilisearch (full reindex)
Schedule::command('ads:sync-search')->daily()
    ->environments(['production']);

// Compute quality scores for stale ads
Schedule::call(function () {
    \App\Models\Ad::whereNull('quality_score')
        ->orWhere('updated_at', '<', now()->subDays(7))
        ->limit(100)
        ->get()
        ->each(function ($ad) {
            ProcessAnalyticsJob::dispatch('recompute_quality_score', ['ad_id' => $ad->id])
                ->onQueue('analytics');
        });
})->daily();

// Process saved searches (daily notifications)
Schedule::command('saved-searches:process')->hourly();

// Clean up expired cache entries
Schedule::command('cache:clear --tags=metrics')->daily();

// Prune failed jobs older than 7 days
Schedule::command('queue:prune-failed --hours=168')->daily();
