<?php

namespace App\Console\Commands;

use App\Models\Ad;
use App\Jobs\ProcessAdJob;
use Illuminate\Console\Command;

class ReprocessAds extends Command
{
    protected $signature = 'ads:reprocess {--force : Force reprocessing of all ads}';

    protected $description = 'Reprocess ads that are not completed';

    public function handle(): int
    {
        $query = Ad::query();

        if (!$this->option('force')) {
            $query->whereIn('processing_status', ['pending', 'failed']);
        }

        $ads = $query->get();

        if ($ads->isEmpty()) {
            $this->info('No ads to reprocess.');
            return Command::SUCCESS;
        }

        $this->info("Dispatching {$ads->count()} ads for processing...");

        $bar = $this->output->createProgressBar($ads->count());
        $bar->start();

        foreach ($ads as $ad) {
            ProcessAdJob::dispatch($ad->id);
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info('All ads dispatched for processing!');

        return Command::SUCCESS;
    }
}
