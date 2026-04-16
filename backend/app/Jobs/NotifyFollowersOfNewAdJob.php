<?php

namespace App\Jobs;

use App\Models\Ad;
use App\Models\User;
use App\Models\Follow;
use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class NotifyFollowersOfNewAdJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;
    
    protected int $adId;
    protected int $userId;

    public function __construct(int $adId, int $userId)
    {
        $this->adId = $adId;
        $this->userId = $userId;
        $this->onQueue('notifications');
    }

    public function handle(): void
    {
        $ad = Ad::with('user')->find($this->adId);
        
        if (!$ad) {
            Log::warning("NotifyFollowersJob: Ad {$this->adId} not found");
            return;
        }
        
        if (!$ad->user) {
            Log::warning("NotifyFollowersJob: Ad {$this->adId} has no user");
            return;
        }
        
        // Get all followers of this seller (optimized query)
        $followerIds = Follow::where('following_id', $this->userId)
            ->pluck('follower_id')
            ->toArray();
        
        if (empty($followerIds)) {
            Log::info("NotifyFollowersJob: No followers for user {$this->userId}");
            return;
        }
        
        // Load users to check notification preferences
        $followers = User::whereIn('id', $followerIds)->get();
        
        $notificationData = [
            'ad_id' => $ad->id,
            'ad_slug' => $ad->slug,
            'ad_title' => $ad->title,
            'ad_price' => $ad->price,
            'seller_id' => $ad->user_id,
            'seller_name' => $ad->user->name,
            'image_url' => $ad->images->first()?->url,
        ];
        
        $notificationCount = 0;
        $emailCount = 0;
        
        foreach ($followers as $follower) {
            // Check if user wants in-app notifications for followed sellers
            if ($this->shouldSendInAppNotification($follower)) {
                $this->createInAppNotification($follower, $ad, $notificationData);
                $notificationCount++;
            }
            
            // Check if user wants email notifications
            if ($this->shouldSendEmailNotification($follower)) {
                SendNewAdEmailJob::dispatch($follower->id, $ad->id);
                $emailCount++;
            }
        }
        
        Log::info("NotifyFollowersJob: Sent {$notificationCount} in-app notifications and {$emailCount} emails for ad {$this->adId}");
    }
    
    protected function shouldSendInAppNotification(User $user): bool
    {
        // Default: send in-app notifications
        // You can add user preference check here
        return true;
    }
    
    protected function shouldSendEmailNotification(User $user): bool
    {
        // Check if user has email notifications enabled for followed sellers
        // For now, check if user has email verified
        if (!$user->email_verified_at) {
            return false;
        }
        
        // You can add more preference checks here
        // e.g., check user's notification_settings
        $settings = $user->notification_settings ?? [];
        
        return $settings['followed_sellers_email'] ?? true;
    }
    
    protected function createInAppNotification(User $follower, Ad $ad, array $data): void
    {
        // Prevent duplicate notifications for same ad
        $existingNotification = Notification::where('user_id', $follower->id)
            ->where('type', 'new_ad_followed')
            ->whereJsonContains('data', ['ad_id' => $ad->id])
            ->first();
            
        if ($existingNotification) {
            return;
        }
        
        NotificationService::send(
            $follower->id,
            'new_ad_followed',
            '🆕 New Item from Seller You Follow',
            "{$ad->user->name} just posted a new item: {$ad->title}",
            $data
        );
    }
    
    public function failed(\Throwable $exception): void
    {
        Log::error("NotifyFollowersJob failed for ad {$this->adId}: {$exception->getMessage()}");
    }
}
