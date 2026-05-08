<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $appends = ['avatar_url', 'full_avatar_url'];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'status',
        'avatar',
        'avatar_public_id',
        'google_avatar',
        'facebook_avatar',
        'phone',
        'location',
        'location_id',
        'verified',
        'banned_at',
        'suspended_at',
        'ban_reason',
        'referral_code',
        'referred_by',
        'profile_completed',
        'notification_settings',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'verified' => 'boolean',
        ];
    }

    public function notifications()
    {
        return $this->hasMany(\App\Models\Notification::class);
    }

    public function favorites()
    {
        return $this->hasMany(\App\Models\Favorite::class);
    }

    public function ads()
    {
        return $this->hasMany(\App\Models\Ad::class);
    }

    public function givenReviews()
    {
        return $this->hasMany(\App\Models\Review::class, 'user_id');
    }

    public function receivedReviews()
    {
        return $this->hasMany(\App\Models\Review::class, 'target_user_id');
    }

    public function conversations()
    {
        return $this->hasMany(\App\Models\Conversation::class, 'sender_id')
            ->orWhere('receiver_id', $this->id);
    }

    public function wallet()
    {
        return $this->hasOne(\App\Models\Wallet::class);
    }

    public function followers()
    {
        return $this->hasMany(\App\Models\Follow::class, 'following_id');
    }

    public function following()
    {
        return $this->hasMany(\App\Models\Follow::class, 'follower_id');
    }

    public function followersCount(): int
    {
        return \App\Models\Follow::where('following_id', $this->id)->count();
    }

    public function followingCount(): int
    {
        return \App\Models\Follow::where('follower_id', $this->id)->count();
    }

    public function isFollowedBy(int $userId): bool
    {
        return \App\Models\Follow::where('follower_id', $userId)
            ->where('following_id', $this->id)
            ->exists();
    }

    public function emailVerification()
    {
        return $this->hasOne(\App\Models\EmailVerification::class);
    }

    public function isEmailVerified(): bool
    {
        return $this->emailVerification && $this->emailVerification->is_verified;
    }

    public function getAvatarUrlAttribute()
    {
        return $this->avatar ?: $this->google_avatar ?: $this->facebook_avatar;
    }
    
    public function getFullAvatarUrlAttribute(): ?string
    {
        $avatar = $this->avatar ?: $this->google_avatar ?: $this->facebook_avatar;
        
        if (!$avatar) return null;
        
        if (str_starts_with($avatar, 'http://') || str_starts_with($avatar, 'https://')) {
            return $avatar;
        }
        
        $baseUrl = rtrim(config('app.url'), '/');
        if (!str_starts_with($avatar, '/')) {
            $avatar = '/' . $avatar;
        }
        
        return $baseUrl . $avatar;
    }

    // Referral Relationships
    public function referrer()
    {
        return $this->belongsTo(User::class, 'referred_by');
    }

    public function referrals()
    {
        return $this->hasMany(Referral::class, 'referrer_id');
    }

    public function referredUsers()
    {
        return $this->hasMany(User::class, 'referred_by');
    }

    // Credit Relationships
    public function creditBalance()
    {
        return $this->hasOne(CreditBalance::class);
    }

    public function creditLedger()
    {
        return $this->hasMany(CreditLedger::class);
    }

    // Recently Viewed Categories
    public function recentlyViewedCategories()
    {
        return $this->belongsToMany(Category::class, 'category_views', 'user_id', 'category_id')
            ->withPivot('viewed_at')
            ->orderByPivot('viewed_at', 'desc');
    }

    public function viewedCategories()
    {
        return $this->hasMany(CategoryView::class);
    }

    // Get tier based on referral count
    public function getReferralTier(): string
    {
        $completedReferrals = $this->referrals()->where('status', 'completed')->count();
        
        if ($completedReferrals >= 25) {
            return 'gold';
        } elseif ($completedReferrals >= 10) {
            return 'silver';
        }
        return 'bronze';
    }

    // Get tier multiplier
    public function getReferralMultiplier(): float
    {
        return match($this->getReferralTier()) {
            'gold' => 2.0,
            'silver' => 1.5,
            default => 1.0,
        };
    }

    // Generate unique referral code
    public static function generateReferralCode(): string
    {
        $code = strtoupper(substr(uniqid(), -6));
        
        // Ensure uniqueness
        while (User::where('referral_code', $code)->exists()) {
            $code = strtoupper(substr(uniqid(), -6));
        }
        
        return $code;
    }
}
