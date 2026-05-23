<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserVerification extends Model
{
    protected $fillable = [
        'user_id', 'type', 'status', 'document_type', 'document_number',
        'document_front', 'document_back', 'document_selfie',
        'verified_at', 'verified_by', 'rejection_reason', 'notes', 'expires_at',
    ];

    protected $casts = [
        'verified_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
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

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function approve(int $verifiedBy): void
    {
        $this->update([
            'status' => 'approved',
            'verified_by' => $verifiedBy,
            'verified_at' => now(),
            'rejection_reason' => null,
        ]);
    }

    public function reject(string $reason, ?int $verifiedBy = null): void
    {
        $this->update([
            'status' => 'rejected',
            'rejection_reason' => $reason,
            'verified_by' => $verifiedBy,
        ]);
    }

    public static function getUserVerificationStatus(int $userId): array
    {
        $types = ['phone', 'email', 'identity', 'business'];
        $statuses = [];

        foreach ($types as $type) {
            $verification = self::forUser($userId)->ofType($type)->latest()->first();
            $statuses[$type] = $verification ? $verification->status : 'none';
        }

        return $statuses;
    }

    public static function isUserVerified(int $userId, string $type): bool
    {
        return self::forUser($userId)
            ->ofType($type)
            ->approved()
            ->exists();
    }
}
