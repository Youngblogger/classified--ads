<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReferralReward extends Model
{
    protected $fillable = [
        'referral_id',
        'action',
        'referrer_credits',
        'referred_credits',
    ];

    protected $casts = [
        'referrer_credits' => 'integer',
        'referred_credits' => 'integer',
    ];

    public function referral(): BelongsTo
    {
        return $this->belongsTo(Referral::class);
    }
}
