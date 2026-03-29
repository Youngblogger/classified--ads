<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CreditLedger extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'amount',
        'reason',
        'reference_type',
        'reference_id',
        'balance_after',
    ];

    protected $casts = [
        'amount' => 'integer',
        'balance_after' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reference()
    {
        if ($this->reference_type && $this->reference_id) {
            return $this->morphTo('reference', 'reference_type', 'reference_id');
        }
        return null;
    }

    public function isEarned(): bool
    {
        return $this->type === 'earn' || $this->type === 'bonus';
    }

    public function isSpent(): bool
    {
        return $this->type === 'spend';
    }
}
