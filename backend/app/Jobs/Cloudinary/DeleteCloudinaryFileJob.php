<?php

namespace App\Jobs\Cloudinary;

use App\Services\CloudinaryService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class DeleteCloudinaryFileJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 2;

    public int $backoff = 10;

    public bool $timeout = 30;

    public function __construct(
        public string $publicId,
        public ?int $userId = null,
        public string $type = 'unknown',
    ) {
    }

    public function handle(CloudinaryService $cloudinary): void
    {
        if (empty($this->publicId)) {
            Log::warning('DeleteCloudinaryFileJob skipped: empty public_id');
            return;
        }

        $context = [
            'public_id' => $this->publicId,
            'user_id' => $this->userId,
            'type' => $this->type,
            'job_id' => $this->job?->getJobId(),
        ];

        Log::info('Cloudinary delete job started', $context);

        try {
            $result = $cloudinary->deleteImage($this->publicId);

            if ($result['success']) {
                Log::info('Cloudinary delete job completed', $context);
            } else {
                Log::error('Cloudinary delete job failed', [
                    ...$context,
                    'error' => $result['error'] ?? 'Unknown error',
                ]);

                $this->fail(new \Exception($result['error'] ?? 'Delete failed'));
            }
        } catch (\Exception $e) {
            Log::error('Cloudinary delete job exception', [
                ...$context,
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('Cloudinary delete job permanently failed', [
            'public_id' => $this->publicId,
            'user_id' => $this->userId,
            'type' => $this->type,
            'error' => $exception->getMessage(),
        ]);
    }
}
