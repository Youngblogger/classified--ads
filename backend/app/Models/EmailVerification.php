<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

class EmailVerification extends Model
{
    protected $fillable = [
        'user_id',
        'otp',
        'otp_hash',
        'otp_expires_at',
        'attempts',
        'last_attempt_at',
        'resend_cooldown_until',
        'is_verified',
        'verified_at',
    ];

    protected $casts = [
        'otp_expires_at' => 'datetime',
        'last_attempt_at' => 'datetime',
        'resend_cooldown_until' => 'datetime',
        'verified_at' => 'datetime',
        'is_verified' => 'boolean',
        'attempts' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isExpired(): bool
    {
        return $this->otp_expires_at && Carbon::now()->greaterThan($this->otp_expires_at);
    }

    public function canResend(): bool
    {
        return !$this->resend_cooldown_until || Carbon::now()->greaterThan($this->resend_cooldown_until);
    }

    public function canAttempt(): bool
    {
        return $this->attempts < 5 && !$this->isExpired();
    }

    public function incrementAttempts(): void
    {
        $this->attempts++;
        $this->last_attempt_at = Carbon::now();
        $this->save();
    }

    public function resetAttempts(): void
    {
        $this->attempts = 0;
        $this->save();
    }
}
