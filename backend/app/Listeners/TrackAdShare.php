<?php

namespace App\Listeners;

use App\Events\AdShared;
use App\Services\AnalyticsService;

class TrackAdShare
{
    protected AnalyticsService $analytics;

    public function __construct(AnalyticsService $analytics)
    {
        $this->analytics = $analytics;
    }

    public function handle(AdShared $event): void
    {
        $this->analytics->increment('ad_shares');
    }
}
