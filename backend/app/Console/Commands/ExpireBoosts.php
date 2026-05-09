<?php

namespace App\Console\Commands;

use App\Services\BoostTierService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ExpireBoosts extends Command
{
    protected $signature = 'boosts:expire';
    protected $description = 'Expire all boosts that have passed their end time and fire events';

    public function handle(BoostTierService $boostTierService): int
    {
        $expiredCount = $boostTierService->expireBoosts();

        Log::info('Expired boosts command executed', ['expired_count' => $expiredCount]);

        $this->info("Expired {$expiredCount} boosts.");

        return Command::SUCCESS;
    }
}
