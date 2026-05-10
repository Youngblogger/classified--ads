<?php

namespace App\Listeners;

use App\Events\AdSaved;
use App\Events\AdBoosted;
use App\Events\BoostExpired;
use App\Events\BoostRenewed;
use App\Services\CacheService;
use App\Services\BoostTierService;
use Illuminate\Events\Dispatcher;
use Illuminate\Support\Facades\Log;

class InvalidateAdCache
{
    public function handleAdSaved(AdSaved $event): void
    {
        CacheService::invalidateAdCache($event->ad->id, $event->ad->category?->slug);
        Log::debug('Cache invalidated: AdSaved', ['ad_id' => $event->ad->id]);
    }

    public function handleAdBoosted(AdBoosted $event): void
    {
        CacheService::clearBoostedAds();
        CacheService::clearHomepage();
        if ($event->boostedAd->ad) {
            CacheService::clearAdDetail($event->boostedAd->ad_id);
        }
        app(BoostTierService::class)->clearBoostedAdsCache();
        Log::debug('Cache invalidated: AdBoosted', ['ad_id' => $event->boostedAd->ad_id]);
    }

    public function handleBoostExpired(BoostExpired $event): void
    {
        CacheService::clearBoostedAds();
        CacheService::clearHomepage();
        if ($event->boostedAd->ad) {
            CacheService::clearAdDetail($event->boostedAd->ad_id);
        }
        app(BoostTierService::class)->clearBoostedAdsCache();
        Log::debug('Cache invalidated: BoostExpired', ['ad_id' => $event->boostedAd->ad_id]);
    }

    public function handleBoostRenewed(BoostRenewed $event): void
    {
        CacheService::clearBoostedAds();
        CacheService::clearHomepage();
        if ($event->boostedAd->ad) {
            CacheService::clearAdDetail($event->boostedAd->ad_id);
        }
        app(BoostTierService::class)->clearBoostedAdsCache();
        Log::debug('Cache invalidated: BoostRenewed', ['ad_id' => $event->boostedAd->ad_id]);
    }

    public function subscribe(Dispatcher $events): void
    {
        $events->listen(
            AdSaved::class,
            [self::class, 'handleAdSaved']
        );

        $events->listen(
            AdBoosted::class,
            [self::class, 'handleAdBoosted']
        );

        $events->listen(
            BoostExpired::class,
            [self::class, 'handleBoostExpired']
        );

        $events->listen(
            BoostRenewed::class,
            [self::class, 'handleBoostRenewed']
        );
    }
}
