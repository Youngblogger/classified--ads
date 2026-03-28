<?php

use App\Jobs\AutoApproveAdsJob;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Auto-approve ads every minute
Schedule::job(new AutoApproveAdsJob())->everyMinute();
