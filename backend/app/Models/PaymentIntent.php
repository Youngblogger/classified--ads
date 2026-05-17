<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PaymentIntent extends Model
{
    protected $fillable = [
        'user_id',
        'ad_id',
        'amount',
        'currency',
        'reference',
        'type',
        'gateway',
        'gateway_reference',
        'gateway_response',
        'processed_webhook_id',
        'status',
        'metadata',
        'paid_at',
        'expires_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'metadata' => 'array',
        'gateway_response' => 'array',
        'paid_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function ad(): BelongsTo
    {
        return $this->belongsTo(Ad::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(PaymentLog::class);
    }

    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function markAsPaid(): void
    {
        $this->update([
            'status' => 'paid',
            'paid_at' => now(),
            'expires_at' => null,
        ]);
    }

    public function markAsFailed(): void
    {
        $this->update(['status' => 'failed']);
    }

    public function markAsExpired(): void
    {
        $this->update([
            'status' => 'expired',
            'expires_at' => $this->expires_at ?? now(),
        ]);
    }

    public function markAsCancelled(): void
    {
        $this->update([
            'status' => 'cancelled',
            'expires_at' => $this->expires_at ?? now(),
        ]);
    }

    public function isExpired(): bool
    {
        return in_array($this->status, ['expired', 'failed', 'cancelled']);
    }
}
