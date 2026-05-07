<?php

namespace App\Events;

use App\Models\BoostedAd;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BoostExpired
{
    use Dispatchable, SerializesModels;

    public BoostedAd $boostedAd;

    public function __construct(BoostedAd $boostedAd)
    {
        $this->boostedAd = $boostedAd;
    }
}
