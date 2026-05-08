<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class SecureAdminAuth
{
    protected $sessionTimeout; // minutes

    public function handle(Request $request, Closure $next): Response
    {
        // Use config value, fall back to 15 (matching token expiry)
        $this->sessionTimeout = (int) config('admin.session_timeout', 15);

        $token = $request->bearerToken();
        
        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication required. Please provide a valid token.',
                'error_code' => 'AUTH_REQUIRED',
            ], 401)->withHeaders([
                'WWW-Authenticate' => 'Bearer',
            ]);
        }
        
        // Validate token format (basic security check)
        if (!$this->isValidTokenFormat($token)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid token format.',
                'error_code' => 'INVALID_TOKEN_FORMAT',
            ], 401);
        }

        $accessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
        
        if (!$accessToken) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired token.',
                'error_code' => 'INVALID_TOKEN',
            ], 401);
        }
        
        // Check token expiration
        if ($accessToken->expires_at && Carbon::parse($accessToken->expires_at)->isPast()) {
            $accessToken->delete();
            return response()->json([
                'success' => false,
                'message' => 'Token has expired. Please login again.',
                'error_code' => 'TOKEN_EXPIRED',
            ], 401);
        }

        $user = $accessToken->tokenable;

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
                'error_code' => 'USER_NOT_FOUND',
            ], 401);
        }

        // Check if user is admin
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Admin privileges required.',
                'error_code' => 'ADMIN_REQUIRED',
            ], 403);
        }

        // Check if user is banned or suspended
        if ($user->banned_at || $user->suspended_at) {
            $reason = $user->banned_at ? 'banned' : 'suspended';
            return response()->json([
                'success' => false,
                'message' => "Your account has been {$reason}.",
                'error_code' => 'ACCOUNT_' . strtoupper($reason),
            ], 403);
        }

        // Check session timeout (inactivity)
        $lastActivity = $accessToken->last_used_at;
        if ($lastActivity) {
            $minutesSinceActivity = Carbon::parse($lastActivity)->diffInMinutes(Carbon::now());
            if ($minutesSinceActivity > $this->sessionTimeout) {
                // Session expired due to inactivity
                $accessToken->delete();
                return response()->json([
                    'success' => false,
                    'message' => 'Session expired due to inactivity. Please login again.',
                    'error_code' => 'SESSION_EXPIRED',
                ], 401);
            }
        }

        // Update last used timestamp
        $accessToken->last_used_at = Carbon::now();
        $accessToken->save();

        // Set user on request
        $request->setUserResolver(function () use ($user) {
            return $user;
        });

        // Log admin activity
        $this->logActivity($request, $user);

        return $next($request);
    }

    protected function isValidTokenFormat(string $token): bool
    {
        // Basic validation: tokens should be alphanumeric with some special chars, reasonable length
        if (strlen($token) < 32 || strlen($token) > 255) {
            return false;
        }
        
        // Check for suspicious patterns
        if (preg_match('/[\x00-\x1F\x7F]/', $token)) {
            return false;
        }
        
        return true;
    }

    protected function logActivity(Request $request, $user): void
    {
        try {
            $ip = $request->ip();
            $userAgent = $request->userAgent();
            $method = $request->method();
            $path = $request->path();
            
            // Don't log certain read-only endpoints to reduce noise
            $skipPaths = ['/api/admin/ads', '/api/admin/dashboard', '/api/admin/stats'];
            if (in_array('/' . $path, $skipPaths) && $method === 'GET') {
                return;
            }
            
            DB::table('admin_activity_logs')->insert([
                'user_id' => $user->id,
                'action' => $method . ' ' . $path,
                'ip_address' => $ip,
                'user_agent' => $userAgent,
                'request_data' => json_encode($request->except(['password', 'token', 'secret_key'])),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
        } catch (\Exception $e) {
            // Silently fail - don't break functionality
            \Log::error('Failed to log admin activity: ' . $e->getMessage());
        }
    }
}
