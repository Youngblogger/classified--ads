<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Wallet extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'balance',
        'pending_balance',
        'currency',
    ];

    protected $casts = [
        'balance' => 'decimal:2',
        'pending_balance' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function getAvailableBalanceAttribute()
    {
        return $this->balance - $this->pending_balance;
    }

    public function credit(float $amount, string $description, ?array $metadata = null): Transaction
    {
        $balanceBefore = $this->balance;
        $this->increment('balance', $amount);
        
        return $this->transactions()->create([
            'type' => 'credit',
            'amount' => $amount,
            'balance_before' => $balanceBefore,
            'balance_after' => $this->balance,
            'description' => $description,
            'metadata' => $metadata,
        ]);
    }

    public function debit(float $amount, string $description, ?array $metadata = null): Transaction
    {
        $balanceBefore = $this->balance;
        $this->decrement('balance', $amount);
        
        return $this->transactions()->create([
            'type' => 'debit',
            'amount' => $amount,
            'balance_before' => $balanceBefore,
            'balance_after' => $this->balance,
            'description' => $description,
            'metadata' => $metadata,
        ]);
    }
}
