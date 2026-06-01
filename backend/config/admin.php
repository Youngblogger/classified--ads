<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Admin Session Timeout (minutes)
    |--------------------------------------------------------------------------
    |
    | The number of minutes of inactivity before a session expires and the
    | admin is required to login again.
    |
    */
    'session_timeout' => (int) env('ADMIN_SESSION_TIMEOUT', 30),

    /*
    |--------------------------------------------------------------------------
    | Admin Secret Key
    |--------------------------------------------------------------------------
    |
    | Optional: A secret key that must be provided during login for extra
    | security. If not set, the key is not required.
    |
    */
    'secret_key' => env('ADMIN_SECRET_KEY'),
    
    /*
    |--------------------------------------------------------------------------
    | Admin Secret Key Hash (SHA-256)
    |--------------------------------------------------------------------------
    |
    | SHA-256 hash of the secret key for secure transmission.
    | Generate with: php -r "echo hash('sha256', 'your_secret_key');"
    |
    */
    'secret_key_hash' => env('ADMIN_SECRET_KEY_HASH'),

    /*
    |--------------------------------------------------------------------------
    | Allowed IP Addresses
    |--------------------------------------------------------------------------
    |
    | Optional: Array of IP addresses that are allowed to access admin panel.
    | If empty, all IPs are allowed.
    |
    */
    'allowed_ips' => array_filter(explode(',', env('ADMIN_ALLOWED_IPS', ''))),

    /*
    |--------------------------------------------------------------------------
    | Rate Limiting
    |--------------------------------------------------------------------------
    */
    'rate_limit' => [
        'max_attempts' => (int) env('ADMIN_RATE_LIMIT_ATTEMPTS', 5),
        'decay_minutes' => (int) env('ADMIN_RATE_LIMIT_DECAY', 15),
    ],

    /*
    |--------------------------------------------------------------------------
    | Admin Email
    |--------------------------------------------------------------------------
    |
    | The primary admin email used for notifications and alerts.
    |
    */
    'notification_email' => env('ADMIN_NOTIFICATION_EMAIL'),

];
