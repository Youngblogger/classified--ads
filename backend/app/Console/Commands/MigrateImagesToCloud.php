<?php

namespace App\Console\Commands;

use App\Models\AdImage;
use App\Services\ImageStorageService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class MigrateImagesToCloud extends Command
{
    protected $signature = 'images:migrate-to-cloud
                           {--batch=50 : Number of images to process per batch}
                           {--dry-run : Simulate without uploading}
                           {--force : Skip confirmation prompt}';

    protected $description = 'Migrate locally stored ad images to Cloudinary cloud storage';

    public function handle(ImageStorageService $storage): int
    {
        if (!$this->option('dry-run') && !$this->option('force')) {
            if (!$this->confirm('This will upload local ad images to Cloudinary and update database records. Continue?')) {
                $this->info('Migration cancelled.');
                return Command::SUCCESS;
            }
        }

        $images = AdImage::whereNull('public_id')
            ->orderBy('id')
            ->get();

        if ($images->isEmpty()) {
            $this->info('No images to migrate. All images already have Cloudinary references.');
            return Command::SUCCESS;
        }

        $this->info("Found {$images->count()} images to migrate.");
        $bar = $this->output->createProgressBar($images->count());
        $bar->start();

        $migrated = 0;
        $failed = 0;
        $skipped = 0;

        foreach ($images as $image) {
            $localPath = $this->resolveLocalPath($image);

            if (!$localPath || !file_exists($localPath)) {
                $this->warn("\nLocal file not found for image ID {$image->id}: {$image->url}");
                $skipped++;
                $bar->advance();
                continue;
            }

            if ($this->option('dry-run')) {
                $bar->advance();
                $migrated++;
                continue;
            }

            try {
                $result = $storage->upload(
                    new \Illuminate\Http\File($localPath),
                    [
                        'folder' => 'ads',
                        'public_id' => $this->generatePublicId($image),
                        'check_rate_limit' => false,
                    ]
                );

                $image->update([
                    'public_id' => $result['public_id'],
                    'url' => $result['url'],
                    'original_url' => $result['original_url'],
                    'thumbnail_url' => $result['thumbnail_url'],
                    'medium_url' => $result['medium_url'],
                    'width' => $result['width'] ?? $image->width,
                    'height' => $result['height'] ?? $image->height,
                    'file_size' => $result['file_size'] ?? $image->file_size,
                ]);

                $migrated++;
            } catch (\Exception $e) {
                $this->warn("\nFailed to migrate image ID {$image->id}: {$e->getMessage()}");
                Log::error('Image migration failed', [
                    'image_id' => $image->id,
                    'error' => $e->getMessage(),
                ]);
                $failed++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->table(
            ['Status', 'Count'],
            [
                ['Migrated', $migrated],
                ['Failed', $failed],
                ['Skipped (file not found)', $skipped],
                ['Total', $images->count()],
            ]
        );

        $this->info('Migration completed.');
        return $failed > 0 ? Command::FAILURE : Command::SUCCESS;
    }

    protected function resolveLocalPath(AdImage $image): ?string
    {
        $candidates = [];

        $url = $image->original_url ?: $image->url;
        if (empty($url)) {
            return null;
        }

        $parsed = parse_url($url, PHP_URL_PATH);
        if ($parsed) {
            $path = ltrim($parsed, '/');
            $path = preg_replace('#^storage/#', '', $path);
            $candidates[] = storage_path("app/public/{$path}");
            $candidates[] = storage_path("app/private/{$path}");
        }

        $relative = ltrim($url, '/');
        $relative = preg_replace('#^storage/#', '', $relative);
        $candidates[] = storage_path("app/public/{$relative}");

        foreach ($candidates as $candidate) {
            if (file_exists($candidate)) {
                return $candidate;
            }
        }

        return null;
    }

    protected function generatePublicId(AdImage $image): string
    {
        $prefix = 'ads';
        $adId = $image->ad_id ?? 'unknown';
        return "{$prefix}/{$adId}_" . now()->timestamp . '_' . bin2hex(random_bytes(4));
    }
}
