<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Laravel\Sanctum\PersonalAccessToken;

class AdminAuthController extends Controller
{
    protected $maxLoginAttempts;
    protected $lockoutDuration;

    public function __construct()
    {
        $this->maxLoginAttempts = (int) config('admin.rate_limit.max_attempts', 5);
        $this->lockoutDuration = (int) config('admin.rate_limit.decay_minutes', 15);
    }

    /**
     * Admin Login - Enterprise Security Enhanced
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'login' => 'required|string',
            'password' => 'required|string',
            'admin_secret' => 'nullable|string',
        ]);

        $login = $request->input('login');
        $password = $request->input('password');
        $adminSecret = $request->input('admin_secret');
        
        $clientIp = $this->getClientIp($request);
        $deviceInfo = $this->getDeviceInfo($request);
        $isNewDevice = false;
        $riskLevel = 'low';

        // Check rate limiting
        $rateLimitKey = 'admin_login|' . strtolower($login) . '|' . $clientIp;
        
        if ($this->isRateLimited($rateLimitKey)) {
            $this->logLoginAttempt($request, null, false, 'Rate limited', $clientIp, $deviceInfo, 'high', false, $clientIp);
            $this->triggerAlert('RATE_LIMITED', 'Admin login rate limited', [
                'ip' => $clientIp,
                'login' => $login,
                'device' => $deviceInfo,
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Too many login attempts. Please try again later.',
                'error_code' => 'RATE_LIMITED',
                'retry_after' => $this->getRetryAfter($rateLimitKey),
            ], 429);
        }

        // Find user by email or phone
        $user = User::where('email', $login)
            ->orWhere('phone', $login)
            ->first();

        // Log failed attempt (even if user not found - prevents user enumeration)
        if (!$user) {
            $this->logLoginAttempt($request, null, false, 'User not found', $clientIp, $deviceInfo, 'medium', false, $clientIp);
            $this->checkSuspiciousActivity($clientIp, $login, 'unknown_user');
            
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials.',
                'error_code' => 'INVALID_CREDENTIALS',
            ], 401);
        }

        // Check for suspicious activity from this IP
        $riskLevel = $this->assessLoginRisk($request, $user, $clientIp);
        if ($riskLevel === 'high') {
            $this->triggerAlert('HIGH_RISK_LOGIN', 'High risk login attempt detected', [
                'user_id' => $user->id,
                'ip' => $clientIp,
                'login' => $login,
                'risk_level' => $riskLevel,
            ]);
        }

        // Verify password
        if (!Hash::check($password, $user->password)) {
            $this->logLoginAttempt($request, $user->id, false, 'Invalid password', $clientIp, $deviceInfo, $riskLevel, false, $clientIp);
            $this->incrementLoginAttempts($rateLimitKey);
            $this->checkSuspiciousActivity($clientIp, $login, 'invalid_password');
            $this->triggerAlert('FAILED_LOGIN', 'Admin login failed - invalid password', [
                'user_id' => $user->id,
                'ip' => $clientIp,
                'login' => $login,
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials.',
                'error_code' => 'INVALID_CREDENTIALS',
                'attempts_remaining' => $this->getRemainingAttempts($rateLimitKey),
            ], 401);
        }

        // Check if user is admin
        if ($user->role !== 'admin') {
            $this->logLoginAttempt($request, $user->id, false, 'Not an admin', $clientIp, $deviceInfo, 'high', false, $clientIp);
            $this->triggerAlert('UNAUTHORIZED_ACCESS', 'Non-admin user attempted admin login', [
                'user_id' => $user->id,
                'ip' => $clientIp,
                'login' => $login,
                'role' => $user->role,
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Admin privileges required.',
                'error_code' => 'ADMIN_REQUIRED',
            ], 403);
        }

        // Check if user is banned or suspended
        if ($user->banned_at || $user->suspended_at) {
            $reason = $user->banned_at ? 'banned' : 'suspended';
            $this->logLoginAttempt($request, $user->id, false, "Account {$reason}", $clientIp, $deviceInfo, 'high', false, $clientIp);
            $this->triggerAlert('SUSPENDED_ACCESS', 'Suspended/banned user attempted login', [
                'user_id' => $user->id,
                'ip' => $clientIp,
                'login' => $login,
                'status' => $reason,
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Your account has been suspended.',
                'error_code' => 'ACCOUNT_SUSPENDED',
            ], 403);
        }

        // Check for new device
        $isNewDevice = $this->isNewDevice($user->id, $deviceInfo, $clientIp);

        // Clear rate limit on successful login
        $this->clearLoginAttempts($rateLimitKey);

        // Generate token with short expiration
        $token = $this->generateAdminToken($user);

        // Log successful login with full device info
        $this->logLoginAttempt($request, $user->id, true, 'Login successful', $clientIp, $deviceInfo, 'low', $isNewDevice, $clientIp);

        // Log to Laravel
        Log::info('Admin login successful', [
            'user_id' => $user->id,
            'ip' => $clientIp,
            'email' => $login,
            'new_device' => $isNewDevice,
            'risk_level' => $riskLevel,
        ]);

        // Alert for new device login
        if ($isNewDevice) {
            $this->triggerAlert('NEW_DEVICE_LOGIN', 'Admin login from new device', [
                'user_id' => $user->id,
                'ip' => $clientIp,
                'device' => $deviceInfo,
            ]);
        }

        // Send notification
        try {
            NotificationService::adminLogin($user, $clientIp, $request->userAgent());
        } catch (\Exception $e) {
            Log::error('Failed to send admin login notification: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'avatar' => $user->avatar_url,
            ],
            'token' => $token['token'],
            'token_type' => 'Bearer',
            'expires_at' => $token['expires_at'],
        ])->withCookie(
            $this->createSecureCookie('admin_token', $token['token'], $token['expires_minutes'])
        );
    }

    /**
     * Admin Logout - Invalidate all tokens
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $clientIp = $this->getClientIp($request);
            
            if ($user) {
                // Delete ALL admin tokens for this user (prevent token reuse)
                PersonalAccessToken::where('tokenable_type', 'App\\Models\\User')
                    ->where('tokenable_id', $user->id)
                    ->delete();

                $this->logLoginAttempt($request, $user->id, true, 'Logout', $clientIp, $this->getDeviceInfo($request), 'low', false, $clientIp);
                
                Log::info('Admin logout', [
                    'user_id' => $user->id,
                    'ip' => $clientIp,
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully',
            ])->withCookie(
                $this->deleteSecureCookie('admin_token')
            );
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logout failed',
            ], 500);
        }
    }

    /**
     * Get current admin info
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        
        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'avatar' => $user->avatar_url,
                'created_at' => $user->created_at,
            ],
        ]);
    }

    /**
     * Refresh token - Issue new token, invalidate old
     */
    public function refresh(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user || $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        // Delete old tokens immediately
        PersonalAccessToken::where('tokenable_type', 'App\\Models\\User')
            ->where('tokenable_id', $user->id)
            ->delete();

        // Generate new token with fresh expiration
        $token = $this->generateAdminToken($user);

        return response()->json([
            'success' => true,
            'token' => $token['token'],
            'token_type' => 'Bearer',
            'expires_at' => $token['expires_at'],
        ])->withCookie(
            $this->createSecureCookie('admin_token', $token['token'], $token['expires_minutes'])
        );
    }

    /**
     * Get activity logs with filtering
     */
    public function activityLogs(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 50);
        $userId = $request->input('user_id');
        $riskLevel = $request->input('risk_level');
        $suspicious = $request->input('suspicious');
        
        $query = DB::table('admin_activity_logs')
            ->orderBy('created_at', 'desc');
        
        if ($userId) {
            $query->where('user_id', $userId);
        }
        
        if ($riskLevel) {
            $query->where('risk_level', $riskLevel);
        }
        
        if ($suspicious) {
            $query->where('is_suspicious', true);
        }
        
        $logs = $query->paginate($perPage);
        
        return response()->json($logs);
    }

    /**
     * Get suspicious activity logs
     */
    public function suspiciousActivity(Request $request): JsonResponse
    {
        $logs = DB::table('admin_login_logs')
            ->whereIn('risk_level', ['medium', 'high'])
            ->orWhere('is_suspicious', true)
            ->orderBy('created_at', 'desc')
            ->limit(100)
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => $logs,
        ]);
    }

    /**
     * Generate admin token with short expiration
     */
    protected function generateAdminToken(User $user): array
    {
        // Delete ALL existing tokens for security
        PersonalAccessToken::where('tokenable_type', 'App\\Models\\User')
            ->where('tokenable_id', $user->id)
            ->delete();

        // Short session timeout (15 minutes)
        $sessionTimeout = (int) config('admin.session_timeout', 15);
        $expiresAt = Carbon::now()->addMinutes($sessionTimeout);
        
        $token = $user->createToken('admin-session', ['admin'], $expiresAt);

        return [
            'token' => $token->plainTextToken,
            'expires_at' => $expiresAt->toIso8601String(),
            'expires_minutes' => $sessionTimeout,
        ];
    }

    /**
     * Create secure HttpOnly cookie
     */
    protected function createSecureCookie(string $name, string $value, int $minutes): \Symfony\Component\HttpFoundation\Cookie
    {
        return cookie(
            $name,
            $value,
            $minutes,
            '/',
            null,
            true,  // Secure (HTTPS only)
            true,  // HttpOnly
            false, // Raw
            'Strict' // SameSite
        );
    }

    /**
     * Delete secure cookie
     */
    protected function deleteSecureCookie(string $name): \Symfony\Component\HttpFoundation\Cookie
    {
        return cookie()->forget($name);
    }

    /**
     * Get real client IP (handle proxies)
     */
    protected function getClientIp(Request $request): string
    {
        // Check for VPN/Proxy headers
        $proxyHeaders = [
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_REAL_IP',
            'HTTP_CF_CONNECTING_IP', // Cloudflare
            'HTTP_X_CLIENT_IP',
            'HTTP_VIA',
            'HTTP_FORWARDED',
        ];
        
        foreach ($proxyHeaders as $header) {
            if ($request->server->has($header)) {
                $ip = $request->server->get($header);
                // X-Forwarded-For can have multiple IPs, get the first one
                if (strpos($ip, ',') !== false) {
                    $ip = trim(explode(',', $ip)[0]);
                }
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }
        
        return $request->ip() ?? '0.0.0.0';
    }

    /**
     * Get device information
     */
    protected function getDeviceInfo(Request $request): array
    {
        $userAgent = $request->userAgent() ?? 'Unknown';
        $ip = $this->getClientIp($request);
        
        // Basic device detection
        $isMobile = preg_match('/Mobile|Android|iPhone|iPad/i', $userAgent);
        $isBot = preg_match('/bot|crawl|spider|slurp|google|yandex|bing/i', $userAgent);
        
        // Detect browser
        $browser = 'Unknown';
        if (preg_match('/Chrome\/[\d.]+/i', $userAgent)) $browser = 'Chrome';
        elseif (preg_match('/Firefox\/[\d.]+/i', $userAgent)) $browser = 'Firefox';
        elseif (preg_match('/Safari\/[\d.]+/i', $userAgent)) $browser = 'Safari';
        elseif (preg_match('/Edge\/[\d.]+/i', $userAgent)) $browser = 'Edge';
        
        // Detect OS
        $os = 'Unknown';
        if (preg_match('/Windows NT/i', $userAgent)) $os = 'Windows';
        elseif (preg_match('/Mac OS X/i', $userAgent)) $os = 'macOS';
        elseif (preg_match('/Linux/i', $userAgent)) $os = 'Linux';
        elseif (preg_match('/Android/i', $userAgent)) $os = 'Android';
        elseif (preg_match('/iPhone|iPad/i', $userAgent)) $os = 'iOS';

        // Check for VPN/Proxy indicators
        $isVpnProxy = $this->detectVpnProxy($request);

        return [
            'browser' => $browser,
            'os' => $os,
            'device_type' => $isMobile ? 'mobile' : 'desktop',
            'is_bot' => $isBot,
            'is_vpn_proxy' => $isVpnProxy,
            'user_agent' => $userAgent,
            'ip' => $ip,
            'detected_at' => now()->toIso8601String(),
        ];
    }

    /**
     * Detect VPN/Proxy
     */
    protected function detectVpnProxy(Request $request): bool
    {
        if (!config('admin.block_vpn_proxy', false)) {
            return false;
        }

        $indicators = 0;
        
        // Check for multiple X-Forwarded-For (potential proxy)
        $xff = $request->server->get('HTTP_X_FORWARDED_FOR');
        if ($xff && strpos($xff, ',') !== false) {
            $indicators++;
        }
        
        // Check Via header (proxy indicator)
        if ($request->server->has('HTTP_VIA')) {
            $indicators++;
        }
        
        // Check for common proxy ports in headers
        if ($request->server->has('HTTP_X_PROXY_USER_IP')) {
            $indicators++;
        }
        
        return $indicators >= 2;
    }

    /**
     * Check if device is new
     */
    protected function isNewDevice(int $userId, array $deviceInfo, string $ip): bool
    {
        try {
            $existingLogin = DB::table('admin_login_logs')
                ->where('user_id', $userId)
                ->where('success', true)
                ->where('is_new_device', false)
                ->orderBy('created_at', 'desc')
                ->first();
                
            if (!$existingLogin) {
                return true; // First login ever
            }
            
            $existingDevice = json_decode($existingLogin->device_info ?? '{}', true);
            
            // Check if same browser, OS, and approximate same location
            if ($existingDevice['browser'] !== $deviceInfo['browser'] ||
                $existingDevice['os'] !== $deviceInfo['os']) {
                return true;
            }
            
            return false;
        } catch (\Exception $e) {
            return true;
        }
    }

    /**
     * Assess login risk level
     */
    protected function assessLoginRisk(Request $request, User $user, string $ip): string
    {
        $riskScore = 0;
        
        // Check failed attempts from this IP in last hour
        $recentFailures = DB::table('admin_login_logs')
            ->where('ip_address', $ip)
            ->where('success', false)
            ->where('created_at', '>=', Carbon::now()->subHour())
            ->count();
            
        if ($recentFailures >= 3) {
            $riskScore += 3;
        } elseif ($recentFailures >= 1) {
            $riskScore += 1;
        }
        
        // Check if this is a known IP for this user
        $knownIp = DB::table('admin_login_logs')
            ->where('user_id', $user->id)
            ->where('success', true)
            ->where('ip_address', $ip)
            ->exists();
            
        if (!$knownIp) {
            $riskScore += 2;
        }
        
        // Check for VPN/Proxy
        $deviceInfo = $this->getDeviceInfo($request);
        if ($deviceInfo['is_vpn_proxy']) {
            $riskScore += 2;
        }
        
        // Check if it's a bot
        if ($deviceInfo['is_bot']) {
            $riskScore += 3;
        }
        
        if ($riskScore >= 5) {
            return 'high';
        } elseif ($riskScore >= 2) {
            return 'medium';
        }
        
        return 'low';
    }

    /**
     * Check for suspicious activity patterns
     */
    protected function checkSuspiciousActivity(string $ip, string $login, string $reason): void
    {
        $maxAttempts = config('admin.max_failed_attempts', 10);
        
        $recentAttempts = DB::table('admin_login_logs')
            ->where('ip_address', $ip)
            ->where('success', false)
            ->where('created_at', '>=', Carbon::now()->subHour())
            ->count();
            
        if ($recentAttempts >= $maxAttempts) {
            $this->triggerAlert('SUSPICIOUS_ACTIVITY', 'Multiple failed login attempts detected', [
                'ip' => $ip,
                'login' => $login,
                'reason' => $reason,
                'attempts' => $recentAttempts,
            ]);
            
            // Mark recent logs as suspicious
            DB::table('admin_login_logs')
                ->where('ip_address', $ip)
                ->where('success', false)
                ->where('created_at', '>=', Carbon::now()->subHour())
                ->update(['is_suspicious' => true, 'risk_level' => 'high']);
        }
    }

    /**
     * Trigger security alert
     */
    protected function triggerAlert(string $type, string $message, array $context): void
    {
        if (!config('admin.alert_on_suspicious', true)) {
            return;
        }
        
        Log::channel('security')->warning($type . ': ' . $message, $context);
        
        // You can also send to external services here:
        // - Email notification
        // - Slack/Discord webhook
        // - SMS alert
        // - External monitoring service
        
        try {
            // Log to dedicated security alerts table if exists
            if (DB::getSchemaBuilder()->hasTable('security_alerts')) {
                DB::table('security_alerts')->insert([
                    'type' => $type,
                    'message' => $message,
                    'context' => json_encode($context),
                    'created_at' => Carbon::now(),
                ]);
            }
        } catch (\Exception $e) {
            // Don't fail if alert logging fails
        }
    }

    /**
     * Check if IP is rate limited
     */
    protected function isRateLimited(string $key): bool
    {
        $hit = DB::table('rate_limit_hits')
            ->where('key', $key)
            ->where('expires_at', '>', Carbon::now())
            ->first();

        return $hit && $hit->hits >= $this->maxLoginAttempts;
    }

    /**
     * Get retry after seconds
     */
    protected function getRetryAfter(string $key): int
    {
        $hit = DB::table('rate_limit_hits')
            ->where('key', $key)
            ->first();
            
        if ($hit) {
            return max(0, Carbon::parse($hit->expires_at)->diffInSeconds(Carbon::now()));
        }
        
        return $this->lockoutDuration * 60;
    }

    /**
     * Increment login attempts
     */
    protected function incrementLoginAttempts(string $key): void
    {
        $existing = DB::table('rate_limit_hits')->where('key', $key)->first();
        
        if ($existing) {
            DB::table('rate_limit_hits')
                ->where('key', $key)
                ->update([
                    'hits' => $existing->hits + 1,
                    'expires_at' => Carbon::now()->addMinutes($this->lockoutDuration),
                ]);
        } else {
            DB::table('rate_limit_hits')->insert([
                'key' => $key,
                'hits' => 1,
                'expires_at' => Carbon::now()->addMinutes($this->lockoutDuration),
                'created_at' => Carbon::now(),
            ]);
        }
    }

    /**
     * Get remaining attempts
     */
    protected function getRemainingAttempts(string $key): int
    {
        $existing = DB::table('rate_limit_hits')->where('key', $key)->first();
        
        if ($existing) {
            return max(0, $this->maxLoginAttempts - $existing->hits);
        }
        
        return $this->maxLoginAttempts;
    }

    /**
     * Clear login attempts
     */
    protected function clearLoginAttempts(string $key): void
    {
        DB::table('rate_limit_hits')->where('key', $key)->delete();
    }

    /**
     * Enhanced log login attempt with full device info and risk level
     */
    protected function logLoginAttempt(
        Request $request, 
        ?int $userId, 
        bool $success, 
        string $reason,
        string $ip = null,
        array $deviceInfo = [],
        string $riskLevel = 'low',
        bool $isNewDevice = false,
        string $clientIp = null
    ): void {
        try {
            DB::table('admin_login_logs')->insert([
                'user_id' => $userId,
                'login' => $request->input('login'),
                'ip_address' => $ip ?? $request->ip(),
                'user_agent' => $request->userAgent(),
                'success' => $success,
                'reason' => $reason,
                'risk_level' => $riskLevel,
                'device_info' => json_encode($deviceInfo),
                'is_new_device' => $isNewDevice,
                'is_suspicious' => $riskLevel === 'high',
                'created_at' => Carbon::now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to log admin login attempt: ' . $e->getMessage());
        }
    }
}
