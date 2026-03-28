<?php

namespace App\Jobs;

use App\Models\Ad;
use App\Services\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class AutoApproveAdsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        $settings = $this->getSettings();
        
        if (!$settings['auto_approval_enabled']) {
            return;
        }

        $durationMinutes = $settings['approval_duration_minutes'] ?? 2;
        
        // If duration is 0 (immediately), approve all pending ads
        if ($durationMinutes === 0) {
            $this->approveImmediately();
            return;
        }

        // Otherwise, approve ads that have been pending longer than the duration
        $cutoffTime = now()->subMinutes($durationMinutes);
        
        $pendingAds = Ad::where('status', 'pending')
            ->where('created_at', '<=', $cutoffTime)
            ->get();

        foreach ($pendingAds as $ad) {
            $this->approveAd($ad);
        }
    }

    protected function approveImmediately(): void
    {
        $pendingAds = Ad::where('status', 'pending')->get();

        foreach ($pendingAds as $ad) {
            $this->approveAd($ad);
        }
    }

    protected function approveAd(Ad $ad): void
    {
        $ad->update(['status' => 'active']);
        
        // Send notification to user
        NotificationService::adPublished($ad);
    }

    protected function getSettings(): array
    {
        try {
            $settings = DB::table('settings')->pluck('value', 'key')->toArray();
            
            return [
                'auto_approval_enabled' => filter_var($settings['auto_approval_enabled'] ?? false, FILTER_VALIDATE_BOOLEAN),
                'approval_duration_minutes' => (int) ($settings['approval_duration_minutes'] ?? 2),
            ];
        } catch (\Exception $e) {
            return [
                'auto_approval_enabled' => false,
                'approval_duration_minutes' => 2,
            ];
        }
    }
}
