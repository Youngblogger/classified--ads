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

    // Seller Verification Notifications
    public static function sellerVerified($user)
    {
        return self::send($user->id, 'seller_verified', 'Seller Verified! ✅', 
            "Congratulations! You are now a verified seller on iList. Your listings will display a blue verification badge.", []);
    }

    public static function sellerVerificationRevoked($user)
    {
        return self::send($user->id, 'seller_verification_revoked', 'Verification Removed ⚠️', 
            "Your verified seller status has been removed. Contact support if you have questions.", []);
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
            "A buyer saved your ad '{$ad->title}' to their favorites!", [
                'favoriter_id' => $user->id,
                'favoriter_name' => $user->name
            ]);
    }

    // Ad Status Notifications
    public static function adPublished($ad)
    {
        return self::send($ad->user_id, 'ad_published', '🎉 Your Ad is Live!', 
            "Great news! Your ad '{$ad->title}' is now live and visible to buyers.", [
                'ad_id' => $ad->id,
                'ad_slug' => $ad->slug,
                'status' => 'published'
            ]);
    }

    public static function adPendingReview($ad)
    {
        return self::send($ad->user_id, 'ad_pending', '⏳ Ad Pending Review', 
            "Your ad '{$ad->title}' has been submitted and is awaiting admin approval. You'll be notified once it's reviewed.", [
                'ad_id' => $ad->id,
                'ad_slug' => $ad->slug,
                'status' => 'pending'
            ]);
    }

    public static function newAdFromFollowedSeller($ad, $follower)
    {
        return self::send($follower->id, 'new_ad_followed', '🆕 New Item from Seller You Follow', 
            "{$ad->user->name} just posted a new item: {$ad->title}", [
                'ad_id' => $ad->id,
                'ad_slug' => $ad->slug,
                'seller_id' => $ad->user_id,
                'seller_name' => $ad->user->name,
                'ad_title' => $ad->title,
                'ad_price' => $ad->price,
            ]);
    }

    public static function notifyFollowersOfNewAd($ad)
    {
        // Dispatch to queue for better performance (non-blocking)
        \App\Jobs\NotifyFollowersOfNewAdJob::dispatch($ad->id, $ad->user_id);
        
        return \App\Models\Follow::where('following_id', $ad->user_id)->count();
    }

    // Store Notifications
    public static function storeCreated($store)
    {
        return self::send($store->user_id, 'store_created', 'Store Created 🏪',
            "Your store '{$store->name}' has been created successfully.",
            ['store_id' => $store->id, 'store_slug' => $store->slug]
        );
    }

    public static function newStoreFollower($store, $follower)
    {
        return self::send($store->user_id, 'store_followed', 'New Store Follower 👥',
            "{$follower->name} is now following your store '{$store->name}'.",
            ['store_id' => $store->id, 'follower_id' => $follower->id, 'follower_name' => $follower->name]
        );
    }

    // Verification Notifications
    public static function verificationSubmitted($userId, $type)
    {
        return self::send($userId, 'verification_submitted', 'Verification Submitted 📋',
            "Your {$type} verification has been submitted for review.",
            ['type' => $type]
        );
    }

    public static function verificationApproved($userId, $type)
    {
        return self::send($userId, 'verification_approved', 'Verification Approved ✅',
            "Your {$type} verification has been approved!",
            ['type' => $type]
        );
    }

    public static function verificationRejected($userId, $type, $reason)
    {
        return self::send($userId, 'verification_rejected', 'Verification Rejected ❌',
            "Your {$type} verification was not approved. Reason: {$reason}",
            ['type' => $type, 'reason' => $reason]
        );
    }

    // Badge Notifications
    public static function sellerBadgeActivated($user)
    {
        return self::send($user->id, 'seller_badge_activated', '🔵 Verified Seller Badge Active!',
            "Congratulations! You've completed all verification steps. Your blue Verified Seller badge is now displayed across the marketplace.",
            ['badge' => 'verified_seller']
        );
    }

    public static function businessBadgeActivated($user, $businessName)
    {
        return self::send($user->id, 'business_badge_activated', '🏢 Verified Business Badge Active!',
            "Your business '{$businessName}' is now verified. Your Verified Business badge is displayed on your store and listings.",
            ['badge' => 'verified_business', 'business_name' => $businessName]
        );
    }

    public static function documentsRequested($userId, $type, $message)
    {
        return self::send($userId, 'verification_documents_requested', 'Additional Documents Required 📄',
            $message,
            ['type' => $type]
        );
    }

    // Saved Search Notifications
    public static function savedSearchMatch($user, $savedSearch, $ad)
    {
        return self::send($user->id, 'saved_search_match', 'New Ad Matching Your Search 🔍',
            "A new ad '{$ad->title}' matches your saved search '{$savedSearch->name}'.",
            [
                'saved_search_id' => $savedSearch->id,
                'saved_search_name' => $savedSearch->name,
                'ad_id' => $ad->id,
                'ad_slug' => $ad->slug,
                'ad_title' => $ad->title,
                'ad_price' => $ad->price,
            ]
        );
    }

    // System Notifications
    public static function systemNotice($userId, $title, $message)
    {
        return self::send($userId, 'system_notice', $title, $message, [
            'system' => true
        ]);
    }

    // Admin Notifications
    public static function adminLogin($user, $ip = null, $userAgent = null)
    {
        $location = $ip ? self::getLocationFromIp($ip) : 'Unknown location';
        
        return self::send($user->id, 'admin_login', 'Admin Login Detected', 
            "Your admin account was accessed from {$location}.", [
                'ip_address' => $ip,
                'user_agent' => $userAgent,
                'location' => $location,
                'timestamp' => now()->toISOString(),
            ]);
    }

    protected static function getLocationFromIp($ip)
    {
        // Simple location detection (you can integrate with a real IP geolocation service)
        if (in_array($ip, ['127.0.0.1', '::1', 'localhost'])) {
            return 'Localhost';
        }
        
        return 'IP: ' . $ip;
    }
}
