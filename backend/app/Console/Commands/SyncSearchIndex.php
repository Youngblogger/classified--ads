<?php

namespace App\Console\Commands;

use App\Services\MeiliSearchService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SyncSearchIndex extends Command
{
    protected $signature = 'ads:sync-search {--recent : Only sync recent ads}';
    protected $description = 'Sync ads to Meilisearch search index';

    public function handle(MeiliSearchService $meiliSearch): int
    {
        $this->info('Starting search index sync...');

        if (!$meiliSearch->isEnabled()) {
            $this->warn('Meilisearch is not enabled. Skipping.');
            return Command::SUCCESS;
        }

        try {
            if ($this->option('recent')) {
                $this->info('Syncing recent ads...');
                \App\Models\Ad::active()
                    ->where('updated_at', '>=', now()->subHour())
                    ->chunk(100, function ($ads) use ($meiliSearch) {
                        foreach ($ads as $ad) {
                            $meiliSearch->syncAd($ad->id);
                        }
                        $this->output->write('.');
                    });
                $this->newLine();
                $this->info('Recent ads synced successfully.');
            } else {
                $this->info('Performing full reindex...');
                $result = $meiliSearch->syncAllAds();
                if (isset($result['error'])) {
                    $this->error('Sync failed: ' . $result['error']);
                    return Command::FAILURE;
                }
                $this->info("Full reindex completed: {$result['indexed']} ads indexed.");
            }

            return Command::SUCCESS;
        } catch (\Throwable $e) {
            Log::error('Search index sync failed: ' . $e->getMessage());
            $this->error('Sync failed: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
