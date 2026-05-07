<?php

use App\Jobs\AutoApproveAdsJob;
use App\Jobs\ProcessScheduledPostsJob;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Auto-approve ads every minute
Schedule::job(new AutoApproveAdsJob())->everyMinute();

// Process scheduled social media posts every minute
Schedule::job(new ProcessScheduledPostsJob())->everyMinute();

// Expire old boosts every hour
Schedule::command('boosts:expire')->hourly();

// Clean up draft ads older than 24 hours daily
Schedule::command('ads:clean-drafts --hours=24')->daily();
