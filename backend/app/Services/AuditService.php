<?php

namespace App\Services;

use App\Models\AdminNotification;
use Illuminate\Support\Facades\Log;

class AuditService
{
    public static function log(string $action, string $description, ?int $adminId = null, ?array $metadata = null): void
    {
        $data = [
            'action' => $action,
            'description' => $description,
            'admin_id' => $adminId,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'metadata' => $metadata,
        ];

        AdminNotification::create([
            'type' => 'audit_log',
            'title' => $action,
            'message' => $description,
            'reference_type' => $metadata['reference_type'] ?? null,
            'reference_id' => $metadata['reference_id'] ?? null,
        ]);

        Log::info('Audit: ' . $action, $data);
    }

    public static function verificationApproved(int $verificationId, int $adminId, int $userId, string $type): void
    {
        self::log(
            'verification_approved',
            "Admin #{$adminId} approved {$type} verification #{$verificationId} for user #{$userId}",
            $adminId,
            ['reference_type' => 'verification', 'reference_id' => $verificationId, 'user_id' => $userId, 'type' => $type]
        );
    }

    public static function verificationRejected(int $verificationId, int $adminId, int $userId, string $type, string $reason): void
    {
        self::log(
            'verification_rejected',
            "Admin #{$adminId} rejected {$type} verification #{$verificationId} for user #{$userId}. Reason: {$reason}",
            $adminId,
            ['reference_type' => 'verification', 'reference_id' => $verificationId, 'user_id' => $userId, 'type' => $type, 'reason' => $reason]
        );
    }

    public static function businessVerificationApproved(int $verificationId, int $adminId, int $userId, string $businessName): void
    {
        self::log(
            'business_verification_approved',
            "Admin #{$adminId} approved business verification #{$verificationId} for '{$businessName}' (user #{$userId})",
            $adminId,
            ['reference_type' => 'business_verification', 'reference_id' => $verificationId, 'user_id' => $userId, 'business_name' => $businessName]
        );
    }

    public static function businessVerificationRejected(int $verificationId, int $adminId, int $userId, string $businessName, string $reason): void
    {
        self::log(
            'business_verification_rejected',
            "Admin #{$adminId} rejected business verification #{$verificationId} for '{$businessName}' (user #{$userId}). Reason: {$reason}",
            $adminId,
            ['reference_type' => 'business_verification', 'reference_id' => $verificationId, 'user_id' => $userId, 'business_name' => $businessName, 'reason' => $reason]
        );
    }
}
