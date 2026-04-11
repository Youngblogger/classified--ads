<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CleanDuplicatePrados extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:clean-duplicate-prados';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean duplicate Toyota Prado 2025 ads';

    public function handle()
    {
        $prados = \App\Models\Ad::where('title', 'Toyota Prado 2025')->orderBy('id', 'desc')->get();
        $count = $prados->count();
        
        if ($count <= 1) {
            $this->info('No duplicate Toyota Prado ads found.');
            return;
        }
        
        $this->info("Found {$count} Toyota Prado ads. Keeping the newest one.");
        
        // Delete all except the first (newest)
        $deleted = 0;
        foreach ($prados as $index => $prado) {
            if ($index > 0) {
                $prado->delete();
                $deleted++;
            }
        }
        
        $this->info("Deleted {$deleted} duplicate ads.");
    }
}
