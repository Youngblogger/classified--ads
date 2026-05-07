<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use App\Events\AdBoosted;
use App\Events\AdSaved;
use App\Events\AdShared;
use App\Listeners\TrackBoostConversion;
use App\Listeners\TrackAdSave;
use App\Listeners\TrackAdShare;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        AdBoosted::class => [
            TrackBoostConversion::class,
        ],
        AdSaved::class => [
            TrackAdSave::class,
        ],
        AdShared::class => [
            TrackAdShare::class,
        ],
    ];

    public function boot(): void
    {
        //
    }
}
