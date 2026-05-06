<?php

namespace App\Jobs\Cloudinary;

use App\Services\CloudinaryCleanupService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class CleanupOrphanFilesJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 1;

    public bool $timeout = 300;

    public function __construct(
        public string $type = 'all',
        public int $batchSize = 100,
        public bool $dryRun = false,
        public ?int $initiatedByUserId = null,
    ) {
    }

    public function handle(CloudinaryCleanupService $cleanup): void
    {
        $context = [
            'type' => $this->type,
            'batch_size' => $this->batchSize,
            'dry_run' => $this->dryRun,
            'initiated_by' => $this->initiatedByUserId,
            'job_id' => $this->job?->getJobId(),
        ];

        Log::info('Cloudinary cleanup job started', $context);

        try {
            $results = [];
            $totalDeleted = 0;
            $totalFailed = 0;

            $types = match ($this->type) {
                'ads' => ['ads'],
                'banners' => ['banners'],
                'avatars' => ['avatars'],
                default => ['ads', 'banners', 'avatars'],
            };

            foreach ($types as $cleanupType) {
                $batch = 0;
                $typeDeleted = 0;
                $typeFailed = 0;

                while (true) {
                    $result = match ($cleanupType) {
                        'ads' => $cleanup->cleanupOrphanedAdImages($this->batchSize),
                        'banners' => $cleanup->cleanupOrphanedBanners($this->batchSize),
                        'avatars' => $cleanup->cleanupOrphanedAvatars($this->batchSize),
                    };

                    $deleted = $result['deleted'] ?? 0;
                    $failed = $result['failed'] ?? 0;

                    if ($deleted === 0 && $failed === 0) {
                        break;
                    }

                    $typeDeleted += $deleted;
                    $typeFailed += $failed;
                    $batch++;

                    if ($batch >= 10) {
                        self::dispatch($this->type, $this->batchSize, $this->dryRun, $this->initiatedByUserId)
                            ->delay(now()->addMinutes(1));
                        break;
                    }
                }

                $totalDeleted += $typeDeleted;
                $totalFailed += $typeFailed;
                $results[$cleanupType] = ['deleted' => $typeDeleted, 'failed' => $typeFailed];
            }

            Log::info('Cloudinary cleanup job completed', [
                ...$context,
                'total_deleted' => $totalDeleted,
                'total_failed' => $totalFailed,
                'results' => $results,
            ]);
        } catch (\Exception $e) {
            Log::error('Cloudinary cleanup job failed', [
                ...$context,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('Cloudinary cleanup job permanently failed', [
            'type' => $this->type,
            'initiated_by' => $this->initiatedByUserId,
            'error' => $exception->getMessage(),
        ]);
    }
}
