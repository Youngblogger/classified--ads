<?php

namespace App\Listeners;

use App\Events\AdSaved;
use App\Services\AnalyticsService;

class TrackAdSave
{
    protected AnalyticsService $analytics;

    public function __construct(AnalyticsService $analytics)
    {
        $this->analytics = $analytics;
    }

    public function handle(AdSaved $event): void
    {
        $this->analytics->increment('ad_saves');
    }
}
