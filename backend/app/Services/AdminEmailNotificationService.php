<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class AdminEmailNotificationService
{
    public static function getAdminEmail(): string
    {
        return config('mail.admin_email', 'admin@ilist.com');
    }

    public static function send($subject, $title, $message, $data = null)
    {
        try {
            Mail::raw($message, function ($mail) use ($subject, $title) {
                $mail->to(self::getAdminEmail())
                     ->subject("[iList Admin] {$subject}")
                     ->from(config('mail.from.address', 'noreply@ilist.com'), 'iList Admin');
            });
            
            Log::info("Admin email notification sent: {$subject}");
            return true;
        } catch (\Exception $e) {
            Log::error("Failed to send admin email notification: " . $e->getMessage());
            return false;
        }
    }
    
    public static function sendHtml($subject, $title, $htmlContent)
    {
        try {
            Mail::html($htmlContent, function ($mail) use ($subject, $title) {
                $mail->to(self::getAdminEmail())
                     ->subject("[iList Admin] {$subject}")
                     ->from(config('mail.from.address', 'noreply@ilist.com'), 'iList Admin');
            });
            
            Log::info("Admin HTML email notification sent: {$subject}");
            return true;
        } catch (\Exception $e) {
            Log::error("Failed to send admin HTML email notification: " . $e->getMessage());
            return false;
        }
    }

    public static function newAdSubmitted($ad)
    {
        $subject = "New Ad Submitted: {$ad->title}";
        $message = "A new ad has been submitted and is awaiting review.\n\n" .
                   "Title: {$ad->title}\n" .
                   "Category: " . ($ad->category->name ?? 'N/A') . "\n" .
                   "Price: ₦" . number_format($ad->price, 2) . "\n" .
                   "Seller: {$ad->user->name} ({$ad->user->email})\n" .
                   "Location: " . ($ad->location->name ?? 'N/A') . "\n\n" .
                   "View in admin panel: " . url("/admin/ads-moderation");
        
        return self::send($subject, 'New Ad Submitted', $message, ['ad_id' => $ad->id]);
    }

    public static function adReported($report)
    {
        $subject = "Ad Reported: {$report->ad->title}";
        $message = "An ad has been reported by a user.\n\n" .
                   "Ad Title: {$report->ad->title}\n" .
                   "Reported By: {$report->user->name} ({$report->user->email})\n" .
                   "Reason: {$report->reason}\n" .
                   "Description: {$report->description}\n\n" .
                   "View in admin panel: " . url("/admin/reports");
        
        return self::send($subject, 'Ad Reported', $message, ['report_id' => $report->id]);
    }

    public static function newUserRegistered($user)
    {
        $subject = "New User Registered: {$user->name}";
        $message = "A new user has registered on the platform.\n\n" .
                   "Name: {$user->name}\n" .
                   "Email: {$user->email}\n" .
                   "Phone: " . ($user->phone ?? 'N/A') . "\n" .
                   "Location: " . ($user->location->name ?? 'N/A') . "\n" .
                   "Joined: {$user->created_at->format('Y-m-d H:i:s')}\n\n" .
                   "View in admin panel: " . url("/admin/users");
        
        return self::send($subject, 'New User Registered', $message, ['user_id' => $user->id]);
    }

    public static function userBanned($user, $admin, $reason)
    {
        $subject = "User Banned: {$user->name}";
        $message = "A user has been banned by admin.\n\n" .
                   "User Name: {$user->name}\n" .
                   "User Email: {$user->email}\n" .
                   "Banned By: {$admin->name}\n" .
                   "Reason: {$reason}\n" .
                   "Date: " . now()->format('Y-m-d H:i:s');
        
        return self::send($subject, 'User Banned', $message, ['user_id' => $user->id]);
    }

    public static function userSuspended($user, $admin, $reason)
    {
        $subject = "User Suspended: {$user->name}";
        $message = "A user account has been suspended.\n\n" .
                   "User Name: {$user->name}\n" .
                   "User Email: {$user->email}\n" .
                   "Suspended By: {$admin->name}\n" .
                   "Reason: {$reason}\n" .
                   "Date: " . now()->format('Y-m-d H:i:s');
        
        return self::send($subject, 'User Suspended', $message, ['user_id' => $user->id]);
    }

    public static function newReviewSubmitted($review)
    {
        $ratingStars = str_repeat('⭐', $review->rating);
        $subject = "New Review: {$review->rating} stars on {$review->ad->title}";
        $message = "A new review has been submitted.\n\n" .
                   "Ad Title: {$review->ad->title}\n" .
                   "Rating: {$ratingStars}\n" .
                   "Reviewer: {$review->reviewer->name}\n" .
                   "Comment: " . ($review->comment ?? 'No comment') . "\n" .
                   "Date: {$review->created_at->format('Y-m-d H:i:s')}\n\n" .
                   "View in admin panel: " . url("/admin/reviews");
        
        return self::send($subject, 'New Review Submitted', $message, ['review_id' => $review->id]);
    }

    public static function adFlaggedForReview($ad, $reason)
    {
        $subject = "Ad Flagged: {$ad->title}";
        $message = "An ad has been automatically flagged for review.\n\n" .
                   "Ad Title: {$ad->title}\n" .
                   "Category: " . ($ad->category->name ?? 'N/A') . "\n" .
                   "Seller: {$ad->user->name} ({$ad->user->email})\n" .
                   "Flag Reason: {$reason}\n" .
                   "Views: {$ad->views}\n\n" .
                   "View in admin panel: " . url("/admin/ads-moderation");
        
        return self::send($subject, 'Ad Flagged for Review', $message, ['ad_id' => $ad->id]);
    }

    public static function suspiciousActivity($user, $activity, $details)
    {
        $subject = "Suspicious Activity: {$user->name}";
        $message = "Suspicious activity detected on user account.\n\n" .
                   "User: {$user->name} ({$user->email})\n" .
                   "Activity Type: {$activity}\n" .
                   "Details: {$details}\n" .
                   "IP Address: " . request()->ip() . "\n" .
                   "User Agent: " . request()->userAgent() . "\n" .
                   "Date: " . now()->format('Y-m-d H:i:s') . "\n\n" .
                   "Immediate attention may be required.";
        
        return self::send($subject, 'Suspicious Activity Detected', $message, ['user_id' => $user->id]);
    }

    public static function paymentReceived($payment)
    {
        $subject = "Payment Received: ₦" . number_format($payment->amount, 2);
        $message = "A payment has been successfully processed.\n\n" .
                   "User: {$payment->user->name} ({$payment->user->email})\n" .
                   "Amount: ₦" . number_format($payment->amount, 2) . "\n" .
                   "Type: " . ($payment->type ?? 'Wallet Top-up') . "\n" .
                   "Reference: {$payment->reference}\n" .
                   "Date: {$payment->created_at->format('Y-m-d H:i:s')}\n\n" .
                   "View in admin panel: " . url("/admin/payments");
        
        return self::send($subject, 'Payment Received', $message, ['payment_id' => $payment->id]);
    }

    public static function bulkUserRegistration($count, $timeframe)
    {
        $subject = "Bulk User Registration Alert";
        $message = "Unusual number of user registrations detected.\n\n" .
                   "New Users: {$count}\n" .
                   "Timeframe: Last {$timeframe}\n" .
                   "This may indicate automated registration.\n\n" .
                   "View in admin panel: " . url("/admin/users");
        
        return self::send($subject, 'Bulk Registration Alert', $message);
    }

    public static function systemAlert($alertType, $message, $severity = 'info')
    {
        $subject = "System Alert [{$severity}]: {$alertType}";
        $fullMessage = "System Alert\n\n" .
                       "Type: {$alertType}\n" .
                       "Severity: " . strtoupper($severity) . "\n" .
                       "Message: {$message}\n" .
                       "Time: " . now()->format('Y-m-d H:i:s') . "\n" .
                       "Server: " . gethostname();
        
        return self::send($subject, 'System Alert', $fullMessage);
    }

    public static function newMessageReported($conversation, $reporter)
    {
        $subject = "Message Reported in Ad: {$conversation->ad->title}";
        $message = "A message has been reported by a user.\n\n" .
                   "Ad: {$conversation->ad->title}\n" .
                   "Reported By: {$reporter->name} ({$reporter->email})\n" .
                   "Reporter's Message: {$reporter->report_reason}\n" .
                   "Date: " . now()->format('Y-m-d H:i:s') . "\n\n" .
                   "View in admin panel: " . url("/admin/messages");
        
        return self::send($subject, 'Message Reported', $message, ['conversation_id' => $conversation->id]);
    }

    public static function adApprovalRequired($ad)
    {
        $categoryName = $ad->category ? $ad->category->name : 'N/A';
        $locationName = $ad->location ? $ad->location->name : 'N/A';
        $qualityScore = $ad->quality_score ?? 'N/A';
        
        $subject = "Ad Requires Approval: {$ad->title}";
        $message = "An ad is pending approval and requires your attention.\n\n" .
                   "Title: {$ad->title}\n" .
                   "Category: {$categoryName}\n" .
                   "Price: ₦" . number_format($ad->price, 2) . "\n" .
                   "Seller: {$ad->user->name} ({$ad->user->email})\n" .
                   "Phone: {$ad->phone}\n" .
                   "Location: {$locationName}\n" .
                   "Images: " . $ad->images->count() . " uploaded\n" .
                   "Views: {$ad->views}\n" .
                   "Quality Score: {$qualityScore}\n" .
                   "Submitted: {$ad->created_at->format('Y-m-d H:i:s')}\n\n" .
                   "Action Required: Review and approve/reject this ad.\n\n" .
                   "View in admin panel: " . url("/admin/ads-moderation");
        
        return self::send($subject, 'Ad Requires Approval', $message, ['ad_id' => $ad->id]);
    }

    public static function newBankTransfer($transfer)
    {
        $subject = "New Bank Transfer: ₦" . number_format($transfer->amount, 2);
        $message = "A new bank transfer has been submitted for verification.\n\n" .
                   "User: {$transfer->user->name} ({$transfer->user->email})\n" .
                   "Amount: ₦" . number_format($transfer->amount, 2) . "\n" .
                   "Bank: {$transfer->bank_name}\n" .
                   "Account Number: {$transfer->account_number}\n" .
                   "Account Name: {$transfer->account_name}\n" .
                   "Reference: {$transfer->reference}\n" .
                   "Status: Pending Verification\n" .
                   "Date: {$transfer->created_at->format('Y-m-d H:i:s')}\n\n" .
                   "View in admin panel: " . url("/admin/bank-transfers");
        
        return self::send($subject, 'New Bank Transfer', $message, ['transfer_id' => $transfer->id]);
    }

    public static function walletWithdrawalRequest($withdrawal)
    {
        $subject = "Withdrawal Request: ₦" . number_format($withdrawal->amount, 2);
        $message = "A new withdrawal request requires approval.\n\n" .
                   "User: {$withdrawal->user->name} ({$withdrawal->user->email})\n" .
                   "Amount: ₦" . number_format($withdrawal->amount, 2) . "\n" .
                   "Bank: {$withdrawal->bank_name}\n" .
                   "Account Number: {$withdrawal->account_number}\n" .
                   "Account Name: {$withdrawal->account_name}\n" .
                   "Date: {$withdrawal->created_at->format('Y-m-d H:i:s')}\n\n" .
                   "View in admin panel: " . url("/admin/wallets");
        
        return self::send($subject, 'Withdrawal Request', $message, ['withdrawal_id' => $withdrawal->id]);
    }
}
