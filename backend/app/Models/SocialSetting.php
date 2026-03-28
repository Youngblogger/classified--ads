<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SocialSetting extends Model
{
    protected $fillable = [
        'platform',
        'app_id',
        'app_secret',
        'access_token',
        'page_id',
        'instagram_business_id',
        'is_enabled',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
    ];

    /**
     * Get masked access token for display
     */
    public function getMaskedAccessTokenAttribute(): string
    {
        if (empty($this->access_token)) {
            return '';
        }
        $token = $this->access_token;
        if (strlen($token) <= 8) {
            return '***';
        }
        return substr($token, 0, 4) . '...' . substr($token, -4);
    }

    /**
     * Check if credentials are complete
     */
    public function getHasCredentialsAttribute(): bool
    {
        return !empty($this->app_id) && 
               !empty($this->app_secret) && 
               !empty($this->access_token);
    }
}
