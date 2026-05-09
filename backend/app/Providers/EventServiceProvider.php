<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use App\Events\AdBoosted;
use App\Events\AdSaved;
use App\Events\AdShared;
use App\Events\BoostExpired;
use App\Events\BoostRenewed;
use App\Listeners\TrackBoostConversion;
use App\Listeners\TrackAdSave;
use App\Listeners\TrackAdShare;
use App\Listeners\InvalidateAdCache;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        AdBoosted::class => [
            TrackBoostConversion::class,
            [InvalidateAdCache::class, 'handleAdBoosted'],
        ],
        AdSaved::class => [
            TrackAdSave::class,
            [InvalidateAdCache::class, 'handleAdSaved'],
        ],
        AdShared::class => [
            TrackAdShare::class,
        ],
        BoostExpired::class => [
            [InvalidateAdCache::class, 'handleBoostExpired'],
        ],
        BoostRenewed::class => [
            [InvalidateAdCache::class, 'handleBoostRenewed'],
        ],
    ];

    public function boot(): void
    {
        //
    }
}
