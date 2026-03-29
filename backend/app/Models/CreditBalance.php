<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CreditBalance extends Model
{
    protected $fillable = [
        'user_id',
        'balance',
        'total_earned',
        'total_spent',
    ];

    protected $casts = [
        'balance' => 'integer',
        'total_earned' => 'integer',
        'total_spent' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function addCredits(int $amount): void
    {
        $this->update([
            'balance' => $this->balance + $amount,
            'total_earned' => $this->total_earned + $amount,
        ]);
    }

    public function deductCredits(int $amount): bool
    {
        if ($this->balance < $amount) {
            return false;
        }

        $this->update([
            'balance' => $this->balance - $amount,
            'total_spent' => $this->total_spent + $amount,
        ]);

        return true;
    }

    public function hasEnough(int $amount): bool
    {
        return $this->balance >= $amount;
    }
}
