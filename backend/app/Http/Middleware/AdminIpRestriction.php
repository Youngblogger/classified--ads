<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class AdminIpRestriction
{
    public function handle(Request $request, Closure $next): Response
    {
        $allowedIps = config('admin.allowed_ips', []);
        
        // If no IPs are configured, allow all
        if (empty($allowedIps)) {
            return $next($request);
        }
        
        $clientIp = $request->ip();
        
        if (!in_array($clientIp, $allowedIps)) {
            // Log blocked IP attempt
            Log::warning('Admin access blocked: Unauthorized IP', [
                'ip' => $clientIp,
                'user_agent' => $request->userAgent(),
                'path' => $request->path(),
                'method' => $request->method(),
            ]);
            
            // Try to log to admin_login_logs if table exists
            try {
                \Illuminate\Support\Facades\DB::table('admin_login_logs')->insert([
                    'user_id' => null,
                    'login' => $request->input('login', 'unknown'),
                    'ip_address' => $clientIp,
                    'user_agent' => $request->userAgent(),
                    'success' => false,
                    'reason' => 'IP_NOT_ALLOWED: ' . $clientIp,
                    'created_at' => now(),
                ]);
            } catch (\Exception $e) {
                // Silently fail if table doesn't exist
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Access denied: Unauthorized IP address.',
                'error_code' => 'IP_NOT_ALLOWED',
            ], 403);
        }

        return $next($request);
    }
}
