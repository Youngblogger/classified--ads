<?php

namespace App\Events;

use App\Models\Ad;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AdShared
{
    use Dispatchable, SerializesModels;

    public Ad $ad;

    public function __construct(Ad $ad)
    {
        $this->ad = $ad;
    }
}
