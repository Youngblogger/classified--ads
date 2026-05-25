<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class CleanupTempUploads extends Command
{
    protected $signature = 'uploads:cleanup-temp
                           {--hours= : Override the temp file lifetime in hours}
                           {--dry-run : Simulate without deleting files}';

    protected $description = 'Delete temporary uploaded files older than the configured threshold';

    public function handle(): int
    {
        $lifetimeHours = (int) ($this->option('hours') ?: config('app.temp_upload_lifetime_hours', 24));
        $cutoff = now()->subHours($lifetimeHours);
        $disk = Storage::disk('public');
        $tempDir = 'temp';

        if (!$disk->exists($tempDir)) {
            $this->info("Temp directory does not exist. Nothing to clean.");
            return Command::SUCCESS;
        }

        $allFiles = $disk->files($tempDir);
        $scanned = 0;
        $deleted = 0;
        $totalSize = 0;
        $errors = 0;

        foreach ($allFiles as $file) {
            $scanned++;

            // Safety: verify file is in temp directory (prevent path traversal)
            $normalized = str_replace('\\', '/', $file);
            if (strpos($normalized, 'temp/') !== 0) {
                $this->warn("Skipping file outside temp directory: {$file}");
                continue;
            }

            $lastModified = $disk->lastModified($file);
            if (!$lastModified || $lastModified < $cutoff->timestamp) {
                if ($this->option('dry-run')) {
                    $size = $disk->size($file);
                    $totalSize += $size;
                    $deleted++;
                    $this->line("[DRY RUN] Would delete: {$file} (" . $this->formatBytes($size) . ")");
                } else {
                    try {
                        $size = $disk->size($file);
                        if ($disk->delete($file)) {
                            $deleted++;
                            $totalSize += $size;
                            $this->line("Deleted: {$file} (" . $this->formatBytes($size) . ")");
                        } else {
                            $errors++;
                            $this->error("Failed to delete: {$file}");
                        }
                    } catch (\Exception $e) {
                        $errors++;
                        $this->error("Error deleting {$file}: {$e->getMessage()}");
                    }
                }
            }
        }

        $reclaimed = $this->formatBytes($totalSize);

        if ($this->option('dry-run')) {
            $this->info("[DRY RUN] Scanned {$scanned} files. Would delete {$deleted} files, reclaiming {$reclaimed}.");
        } else {
            $message = "Cleaned up {$deleted} of {$scanned} scanned temp files, reclaimed {$reclaimed}.";
            if ($errors > 0) {
                $message .= " {$errors} errors encountered.";
            }
            $this->info($message);

            Log::info('Temp upload cleanup completed', [
                'scanned' => $scanned,
                'deleted' => $deleted,
                'space_reclaimed_bytes' => $totalSize,
                'errors' => $errors,
                'lifetime_hours' => $lifetimeHours,
            ]);
        }

        return Command::SUCCESS;
    }

    private function formatBytes(int $bytes): string
    {
        if ($bytes >= 1048576) {
            return round($bytes / 1048576, 2) . ' MB';
        }
        if ($bytes >= 1024) {
            return round($bytes / 1024, 2) . ' KB';
        }
        return $bytes . ' B';
    }
}
