<?php

namespace App\Jobs;

use App\Models\Ad;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendNewAdEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 30;
    
    protected int $followerId;
    protected int $adId;

    public function __construct(int $followerId, int $adId)
    {
        $this->followerId = $followerId;
        $this->adId = $adId;
        $this->onQueue('emails');
    }

    public function handle(): void
    {
        $follower = User::find($this->followerId);
        $ad = Ad::with(['user', 'images'])->find($this->adId);
        
        if (!$follower || !$ad) {
            Log::warning("SendNewAdEmailJob: Follower {$this->followerId} or Ad {$this->adId} not found");
            return;
        }
        
        if (!$follower->email || !$follower->email_verified_at) {
            Log::info("SendNewAdEmailJob: Follower {$this->followerId} has no verified email");
            return;
        }
        
        // Prevent duplicate emails
        $existingNotification = Notification::where('user_id', $this->followerId)
            ->where('type', 'new_ad_followed_email')
            ->whereJsonContains('data', ['ad_id' => $this->adId])
            ->first();
            
        if ($existingNotification) {
            Log::info("SendNewAdEmailJob: Email already sent for ad {$this->adId} to follower {$this->followerId}");
            return;
        }
        
        try {
            Mail::to($follower->email)->send(new \App\Mail\NewAdFromFollowedSeller($follower, $ad));
            
            // Mark as sent
            Notification::create([
                'user_id' => $this->followerId,
                'type' => 'new_ad_followed_email',
                'title' => 'Email: New Ad from Followed Seller',
                'message' => "Email sent to {$follower->email} for ad: {$ad->title}",
                'data' => json_encode([
                    'ad_id' => $this->adId,
                    'email_sent' => true,
                ]),
            ]);
            
            Log::info("SendNewAdEmailJob: Email sent for ad {$this->adId} to {$follower->email}");
        } catch (\Exception $e) {
            Log::error("SendNewAdEmailJob: Failed to send email to {$follower->email}: {$e->getMessage()}");
            throw $e;
        }
    }
    
    public function failed(\Throwable $exception): void
    {
        Log::error("SendNewAdEmailJob failed for follower {$this->followerId}, ad {$this->adId}: {$exception->getMessage()}");
    }
}
