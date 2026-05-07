<?php

namespace App\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AdSaved
{
    use Dispatchable, SerializesModels;

    public int $userId;
    public int $adId;

    public function __construct(int $userId, int $adId)
    {
        $this->userId = $userId;
        $this->adId = $adId;
    }
}
