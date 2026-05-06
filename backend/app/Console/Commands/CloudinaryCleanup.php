<?php

namespace App\Console\Commands;

use App\Services\CloudinaryCleanupService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CloudinaryCleanup extends Command
{
    protected $signature = 'cloudinary:cleanup
                            {--type= : Cleanup type: ads|banners|avatars|all}
                            {--batch=100 : Number of items to process per batch}
                            {--dry-run : Show what would be deleted without actually deleting}
                            {--report : Generate a report only}
                            {--force : Skip confirmation prompt}';

    protected $description = 'Clean up orphaned Cloudinary files and sync database';

    public function handle(CloudinaryCleanupService $cleanup): int
    {
        $type = $this->option('type') ?: 'all';
        $batchSize = (int) $this->option('batch');
        $dryRun = $this->option('dry-run');
        $report = $this->option('report');
        $force = $this->option('force');

        if ($report) {
            $this->generateReport($cleanup);
            return 0;
        }

        if ($dryRun) {
            $this->warn('DRY RUN MODE - No files will be deleted');
            $this->newLine();
            return $this->runDryRun($cleanup, $type, $batchSize);
        }

        if (!$force) {
            $this->warn('This will permanently delete orphaned Cloudinary files.');
            if (!$this->confirm('Do you want to proceed?')) {
                $this->info('Cleanup cancelled.');
                return 0;
            }
        }

        $this->info('Starting Cloudinary cleanup...');
        $this->newLine();

        $types = match ($type) {
            'ads' => ['ads'],
            'banners' => ['banners'],
            'avatars' => ['avatars'],
            default => ['ads', 'banners', 'avatars'],
        };

        foreach ($types as $cleanupType) {
            $this->processType($cleanup, $cleanupType, $batchSize, false);
        }

        $this->newLine();
        $this->info('Cleanup completed!');

        return 0;
    }

    protected function runDryRun(CloudinaryCleanupService $cleanup, string $type, int $batchSize): int
    {
        $types = match ($type) {
            'ads' => ['ads'],
            'banners' => ['banners'],
            'avatars' => ['avatars'],
            default => ['ads', 'banners', 'avatars'],
        };

        $totalOrphans = 0;

        foreach ($types as $cleanupType) {
            $count = match ($cleanupType) {
                'ads' => $this->countOrphanedAdImages(),
                'banners' => $this->countOrphanedBanners(),
                'avatars' => $this->countOrphanedAvatars(),
            };

            $totalOrphans += $count;
            $this->info("Orphaned {$cleanupType}: {$count}");

            if ($count > 0 && $count <= 20) {
                $this->showDryRunDetails($cleanupType);
            }
        }

        $this->newLine();
        $this->info("Total orphaned files: {$totalOrphans}");

        if ($totalOrphans > 0) {
            $this->warn('Run without --dry-run to delete these files.');
        }

        return 0;
    }

    protected function countOrphanedAdImages(): int
    {
        return DB::table('ad_images')
            ->leftJoin('ads', 'ad_images.ad_id', '=', 'ads.id')
            ->whereNull('ads.id')
            ->whereNotNull('ad_images.public_id')
            ->count();
    }

    protected function countOrphanedBanners(): int
    {
        return DB::table('banners')
            ->where(function ($q) {
                $q->whereNull('image_url')->orWhere('image_url', '');
            })
            ->whereNotNull('banner_public_id')
            ->count();
    }

    protected function countOrphanedAvatars(): int
    {
        return DB::table('users')
            ->whereNull('avatar')
            ->orWhere('avatar', '')
            ->whereNotNull('avatar_public_id')
            ->count();
    }

    protected function showDryRunDetails(string $type): void
    {
        $this->line('  Details:');

        match ($type) {
            'ads' => DB::table('ad_images')
                ->leftJoin('ads', 'ad_images.ad_id', '=', 'ads.id')
                ->whereNull('ads.id')
                ->whereNotNull('ad_images.public_id')
                ->select('ad_images.id', 'ad_images.public_id', 'ad_images.url')
                ->limit(20)
                ->get()
                ->each(fn($row) => $this->line("    - ID: {$row->id}, public_id: {$row->public_id}")),
            'banners' => DB::table('banners')
                ->where(function ($q) {
                    $q->whereNull('image_url')->orWhere('image_url', '');
                })
                ->whereNotNull('banner_public_id')
                ->select('id', 'banner_public_id')
                ->limit(20)
                ->get()
                ->each(fn($row) => $this->line("    - ID: {$row->id}, public_id: {$row->banner_public_id}")),
            'avatars' => DB::table('users')
                ->whereNull('avatar')
                ->orWhere('avatar', '')
                ->whereNotNull('avatar_public_id')
                ->select('id', 'name', 'avatar_public_id')
                ->limit(20)
                ->get()
                ->each(fn($row) => $this->line("    - User: {$row->name} (ID: {$row->id}), public_id: {$row->avatar_public_id}")),
        };

        $this->newLine();
    }

    protected function processType(CloudinaryCleanupService $cleanup, string $type, int $batchSize, bool $dryRun): void
    {
        $this->info("Processing {$type}...");

        $totalDeleted = 0;
        $totalFailed = 0;
        $batch = 0;

        while (true) {
            $result = match ($type) {
                'ads' => $cleanup->cleanupOrphanedAdImages($batchSize),
                'banners' => $cleanup->cleanupOrphanedBanners($batchSize),
                'avatars' => $cleanup->cleanupOrphanedAvatars($batchSize),
            };

            $deleted = $result['deleted'] ?? 0;
            $failed = $result['failed'] ?? 0;

            if ($deleted === 0 && $failed === 0) {
                break;
            }

            $totalDeleted += $deleted;
            $totalFailed += $failed;
            $batch++;

            $this->line("  Batch {$batch}: Deleted {$deleted}, Failed {$failed}");

            if ($batch >= 10) {
                $this->warn('  Maximum batches reached. Run again to continue.');
                break;
            }

            usleep(500000);
        }

        $this->info("  Total: Deleted {$totalDeleted}, Failed {$totalFailed}");
        $this->newLine();
    }

    protected function generateReport(CloudinaryCleanupService $cleanup): void
    {
        $this->info('Cloudinary Database Report');
        $this->newLine();

        $report = $cleanup->generateReport();

        foreach ($report as $model => $stats) {
            $this->info(ucfirst($model));
            foreach ($stats as $key => $value) {
                $this->line("  {$key}: {$value}");
            }
            $this->newLine();
        }

        $this->info('Running sync check...');
        $syncResult = $cleanup->syncAdImages();
        $this->line("  Total images: {$syncResult['total']}");
        $this->line("  Synced: {$syncResult['synced']}");
        $this->line("  Missing from Cloudinary: {$syncResult['missing']}");
    }
}
