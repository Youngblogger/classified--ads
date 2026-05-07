<?php

namespace App\Events;

use App\Models\BoostedAd;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BoostRenewed
{
    use Dispatchable, SerializesModels;

    public BoostedAd $boostedAd;
    public bool $wasExpired;

    public function __construct(BoostedAd $boostedAd, bool $wasExpired = false)
    {
        $this->boostedAd = $boostedAd;
        $this->wasExpired = $wasExpired;
    }
}
