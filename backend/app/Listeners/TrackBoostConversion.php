<?php

namespace App\Listeners;

use App\Events\AdBoosted;
use App\Services\AnalyticsService;
use Illuminate\Support\Facades\Log;

class TrackBoostConversion
{
    protected AnalyticsService $analytics;

    public function __construct(AnalyticsService $analytics)
    {
        $this->analytics = $analytics;
    }

    public function handle(AdBoosted $event): void
    {
        $this->analytics->increment('boost_conversions');

        Log::info('Boost conversion tracked', [
            'boost_id' => $event->boostedAd->id,
            'ad_id' => $event->boostedAd->ad_id,
            'boost_type' => $event->boostedAd->boost_type,
        ]);
    }
}
