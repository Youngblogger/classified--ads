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
        'google_avatar',
        'facebook_avatar',
        'phone',
        'location',
        'location_id',
        'verified',
        'is_verified_seller',
        'verified_seller_at',
        'banned_at',
        'suspended_at',
        'ban_reason',
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
            'verified_seller_at' => 'datetime',
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

    public function emailVerification()
    {
        return $this->hasOne(\App\Models\EmailVerification::class);
    }

    public function isEmailVerified(): bool
    {
        return $this->emailVerification && $this->emailVerification->is_verified;
    }

    public function isVerifiedSeller(): bool
    {
        return (bool) $this->is_verified_seller;
    }

    public function verifyAsSeller(): void
    {
        $this->update([
            'is_verified_seller' => true,
            'verified_seller_at' => now(),
        ]);
    }

    public function revokeSellerVerification(): void
    {
        $this->update([
            'is_verified_seller' => false,
            'verified_seller_at' => null,
        ]);
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
}
