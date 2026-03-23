<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    protected static ?string $socketUrl = null;

    public static function send($userId, $type, $title, $message, $data = null)
    {
        $notification = Notification::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data ? json_encode($data) : null,
            'read_at' => null,
        ]);

        self::emitToSocket($userId, $notification);

        return $notification;
    }

    protected static function emitToSocket($userId, $notification)
    {
        $socketUrl = env('SOCKET_URL', 'http://localhost:3001');
        
        try {
            Http::timeout(2)->post("{$socketUrl}/emit-notification", [
                'userId' => $userId,
                'notification' => [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'data' => $notification->data,
                    'created_at' => $notification->created_at->toISOString(),
                ],
            ]);
        } catch (\Exception $e) {
            Log::warning('Failed to emit notification via socket: ' . $e->getMessage());
        }
    }

    public static function sendToAdOwner($ad, $type, $title, $message, $data = null)
    {
        return self::send($ad->user_id, $type, $title, $message, array_merge([
            'ad_id' => $ad->id,
            'ad_slug' => $ad->slug,
        ], $data ?: []));
    }

    // Ad Notifications
    public static function adApproved($ad)
    {
        return self::sendToAdOwner($ad, 'ad_approved', 'Ad Approved! 🎉', 
            "Great news! Your ad '{$ad->title}' has been approved and is now live on the marketplace.", [
                'status' => 'approved'
            ]);
    }

    public static function adRejected($ad, $reason = null)
    {
        $reasonText = $reason ?: 'Your ad does not meet our listing guidelines.';
        return self::sendToAdOwner($ad, 'ad_rejected', 'Ad Requires Attention', 
            "Your ad '{$ad->title}' was not approved. Reason: {$reasonText}", [
                'reason' => $reasonText
            ]);
    }

    public static function adDeleted($ad, $reason = null)
    {
        $reasonText = $reason ?: 'Your ad was removed for violating our terms of service.';
        return self::sendToAdOwner($ad, 'ad_deleted', 'Ad Removed', 
            "Your ad '{$ad->title}' has been removed. Reason: {$reasonText}", [
                'reason' => $reasonText
            ]);
    }

    public static function newMessageOnAd($ad, $sender, $messagePreview)
    {
        return self::sendToAdOwner($ad, 'new_message', 'New Message on Your Ad', 
            "You have a new message on '{$ad->title}': " . substr($messagePreview, 0, 50) . "...", [
                'sender_id' => $sender->id,
                'sender_name' => $sender->name
            ]);
    }

    // Promotion Notifications
    public static function promotionActivated($promotion)
    {
        return self::send($promotion->user_id ?? $promotion->ad->user_id, 'promotion_activated', 'Promotion Activated! 🚀', 
            "Your promotion '{$promotion->plan->name}' has been activated!", [
                'promotion_id' => $promotion->id,
                'plan_name' => $promotion->plan->name ?? 'Premium'
            ]);
    }

    public static function promotionExpired($promotion)
    {
        return self::send($promotion->user_id ?? $promotion->ad->user_id, 'promotion_expired', 'Promotion Expired', 
            "Your promotion on '{$promotion->ad->title}' has expired. Renew to keep your ad featured!", [
                'promotion_id' => $promotion->id,
                'ad_id' => $promotion->ad_id
            ]);
    }

    // User Notifications
    public static function accountVerified($user)
    {
        return self::send($user->id, 'account_verified', 'Account Verified! ✅', 
            "Congratulations! Your account has been verified. You now have access to all features.", []);
    }

    public static function accountSuspended($user, $reason = null)
    {
        $reasonText = $reason ?: 'Your account has been suspended for violating our terms.';
        return self::send($user->id, 'account_suspended', 'Account Suspended ⚠️', 
            "Your account has been suspended. Reason: {$reasonText}", [
                'reason' => $reasonText
            ]);
    }

    public static function accountBanned($user, $reason = null)
    {
        $reasonText = $reason ?: 'Your account has been permanently banned for violating our terms.';
        return self::send($user->id, 'account_banned', 'Account Banned 🚫', 
            "Your account has been permanently banned. Reason: {$reasonText}", [
                'reason' => $reasonText
            ]);
    }

    public static function accountUnsuspended($user)
    {
        return self::send($user->id, 'account_unsuspended', 'Account Restored! 🎉', 
            "Your account has been restored. Welcome back!", []);
    }

    // Review Notifications
    public static function newReview($review)
    {
        $reviewerName = $review->reviewer ? $review->reviewer->name : 'Someone';
        return self::send($review->target_user_id, 'new_review', 'New Review Received ⭐', 
            "{$reviewerName} left a {$review->rating}-star review on your ad.", [
                'review_id' => $review->id,
                'rating' => $review->rating
            ]);
    }

    public static function reviewReceived($review)
    {
        $reviewerName = $review->user ? $review->user->name : 'A buyer';
        $adTitle = $review->ad ? $review->ad->title : 'your ad';
        return self::send($review->target_user_id, 'review_received', 'New Review! ⭐', 
            "{$reviewerName} left a {$review->rating}-star review on '{$adTitle}'", [
                'review_id' => $review->id,
                'ad_id' => $review->ad_id,
                'rating' => $review->rating
            ]);
    }

    // Report Notifications
    public static function reportReceived($report)
    {
        return self::send($report->user_id, 'report_received', 'Report Received 📋', 
            "We have received your report and will review it shortly.", [
                'report_id' => $report->id
            ]);
    }

    public static function reportActioned($report, $action)
    {
        return self::send($report->user_id, 'report_actioned', 'Report Update 📋', 
            "Your report has been {$action}. Thank you for helping keep our marketplace safe.", [
                'report_id' => $report->id,
                'action' => $action
            ]);
    }

    // Admin Broadcast Notifications
    public static function adminBroadcast($userIds, $title, $message)
    {
        $notifications = [];
        foreach ($userIds as $userId) {
            $notifications[] = self::send($userId, 'admin_broadcast', $title, $message, [
                'broadcast' => true
            ]);
        }
        return $notifications;
    }

    public static function broadcastToAll($title, $message)
    {
        $userIds = User::where('role', '!=', 'admin')->pluck('id')->toArray();
        return self::broadcastToRole($userIds, $title, $message);
    }

    public static function broadcastToRole($userIds, $title, $message)
    {
        $notifications = [];
        foreach ($userIds as $userId) {
            $notifications[] = self::send($userId, 'admin_broadcast', $title, $message, [
                'broadcast' => true
            ]);
        }
        return $notifications;
    }

    // Favorite Notifications
    public static function newFavorite($ad, $user)
    {
        return self::sendToAdOwner($ad, 'new_favorite', 'Someone Saved Your Ad ❤️', 
            "{$user->name} saved your ad '{$ad->title}' to their favorites!", [
                'favoriter_id' => $user->id,
                'favoriter_name' => $user->name
            ]);
    }

    // System Notifications
    public static function systemNotice($userId, $title, $message)
    {
        return self::send($userId, 'system_notice', $title, $message, [
            'system' => true
        ]);
    }
}
