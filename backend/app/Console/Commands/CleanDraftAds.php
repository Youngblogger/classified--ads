<?php

namespace App\Console\Commands;

use App\Models\Ad;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CleanDraftAds extends Command
{
    protected $signature = 'ads:clean-drafts {--hours=24 : Remove drafts older than this many hours}';
    protected $description = 'Clean up draft ads that were never published';

    public function handle(): int
    {
        $hours = (int) $this->option('hours');

        $deletedCount = Ad::where('status', 'draft')
            ->where('created_at', '<', now()->subHours($hours))
            ->delete();

        if ($deletedCount > 0) {
            Log::info('Draft ads cleaned up', ['count' => $deletedCount, 'hours' => $hours]);
            $this->info("Deleted {$deletedCount} draft ads older than {$hours} hours.");
        } else {
            $this->info('No draft ads to clean up.');
        }

        return Command::SUCCESS;
    }
}
