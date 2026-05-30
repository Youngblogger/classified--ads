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

    protected $appends = ['avatar_url', 'full_avatar_url', 'has_store', 'verification_progress', 'review_display_name'];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'review_display_name',
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
        'is_verified_seller',
        'seller_verified_at',
        'is_verified_business',
        'business_verified_at',
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
            'is_verified_seller' => 'boolean',
            'is_verified_business' => 'boolean',
            'seller_verified_at' => 'datetime',
            'business_verified_at' => 'datetime',
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

    public function transactions()
    {
        return $this->hasManyThrough(\App\Models\Transaction::class, \App\Models\Wallet::class);
    }

    public function followers()
    {
        return $this->hasMany(\App\Models\Follow::class, 'following_id');
    }

    public function following()
    {
        return $this->hasMany(\App\Models\Follow::class, 'follower_id');
    }

    public function store()
    {
        return $this->hasOne(\App\Models\Store::class);
    }

    public function savedSearches()
    {
        return $this->hasMany(\App\Models\SavedSearch::class);
    }

    public function verifications()
    {
        return $this->hasMany(\App\Models\UserVerification::class);
    }

    public function verifiedVerifications()
    {
        return $this->verifications()->where('status', 'approved');
    }

    public function storeFollowers()
    {
        return $this->hasMany(\App\Models\StoreFollower::class);
    }

    public function followedStores()
    {
        return $this->belongsToMany(\App\Models\Store::class, 'store_followers', 'user_id', 'store_id')
            ->withTimestamps();
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

    public function getHasStoreAttribute(): bool
    {
        try {
            return $this->store()->exists();
        } catch (\Exception $e) {
            return false;
        }
    }

    public function getVerificationProgressAttribute(): array
    {
        try {
            $phoneVerified = UserVerification::isUserVerified($this->id, 'phone');
            $emailVerified = UserVerification::isUserVerified($this->id, 'email');
            $identityVerified = UserVerification::isUserVerified($this->id, 'identity');

            $completed = 0;
            if ($phoneVerified) $completed++;
            if ($emailVerified) $completed++;
            if ($identityVerified) $completed++;

            return [
                'phone_verified' => $phoneVerified,
                'email_verified' => $emailVerified,
                'identity_verified' => $identityVerified,
                'completed' => $completed,
                'total' => 3,
                'is_full_verified_seller' => $completed === 3,
            ];
        } catch (\Exception $e) {
            return [
                'phone_verified' => false,
                'email_verified' => false,
                'identity_verified' => false,
                'completed' => 0,
                'total' => 3,
                'is_full_verified_seller' => false,
            ];
        }
    }

    public function getReviewDisplayNameAttribute(): string
    {
        $value = $this->attributes['review_display_name']
            ?? $this->attributes['name']
            ?? null;
        return \App\Services\ReviewerNameUtility::normalize($value);
    }

    public function businessVerification()
    {
        return $this->hasOne(BusinessVerification::class)->latestOfMany();
    }

    public function businessVerifications()
    {
        return $this->hasMany(BusinessVerification::class);
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
