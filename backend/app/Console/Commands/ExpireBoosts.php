<?php

namespace App\Console\Commands;

use App\Models\BoostedAd;
use App\Services\AnalyticsService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ExpireBoosts extends Command
{
    protected $signature = 'boosts:expire';
    protected $description = 'Expire all boosts that have passed their end time';

    public function handle(): int
    {
        $analytics = app(AnalyticsService::class);

        $expiredCount = BoostedAd::where('status', 'active')
            ->where('end_time', '<=', now())
            ->update(['status' => 'expired']);

        if ($expiredCount > 0) {
            $analytics->increment('boost_expires', $expiredCount);
        }

        Log::info('Expired boosts command executed', ['expired_count' => $expiredCount]);

        $this->info("Expired {$expiredCount} boosts.");

        return 0;
    }
}
