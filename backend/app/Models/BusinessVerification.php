<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BusinessVerification extends Model
{
    protected $fillable = [
        'user_id', 'business_name', 'cac_number', 'cac_document',
        'address_document', 'utility_bill', 'tax_registration',
        'status', 'rejection_reason', 'admin_notes',
        'verified_at', 'reviewed_by',
    ];

    protected $casts = [
        'verified_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function approve(int $reviewedBy): void
    {
        $this->update([
            'status' => 'approved',
            'reviewed_by' => $reviewedBy,
            'verified_at' => now(),
            'rejection_reason' => null,
        ]);

        $this->user->update([
            'is_verified_business' => true,
            'business_verified_at' => now(),
        ]);
    }

    public function reject(string $reason, int $reviewedBy): void
    {
        $this->update([
            'status' => 'rejected',
            'rejection_reason' => $reason,
            'reviewed_by' => $reviewedBy,
        ]);
    }

    public static function getLatestForUser(int $userId): ?self
    {
        return self::where('user_id', $userId)->latest()->first();
    }

    public static function isBusinessVerified(int $userId): bool
    {
        return self::where('user_id', $userId)
            ->where('status', 'approved')
            ->exists();
    }
}
