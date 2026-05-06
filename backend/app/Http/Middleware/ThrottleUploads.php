<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class ThrottleUploads
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();
        $ip = $request->ip();
        $userKey = $user ? 'user:' . $user->id : 'guest:' . $ip;

        $ipLimit = $this->getIpLimit($request);
        $ipKey = 'ip:' . $ip;

        foreach ($ipLimit as $limitName => $maxAttempts) {
            $limiterKey = $this->buildLimiterKey($ipKey, $limitName);

            if (RateLimiter::tooManyAttempts($limiterKey, $maxAttempts)) {
                $retryAfter = RateLimiter::availableIn($limiterKey);
                Log::warning('IP-based upload rate limit exceeded', ['ip' => $ip, 'user_id' => $user?->id]);

                return response()->json([
                    'message' => 'Too many upload attempts from your network. Please try again later.',
                    'retry_after' => $retryAfter,
                    'limit' => $maxAttempts,
                    'period' => str_replace('uploads_per_', '', $limitName),
                ], 429, [
                    'Retry-After' => $retryAfter,
                    'X-RateLimit-Limit' => $maxAttempts,
                    'X-RateLimit-Remaining' => 0,
                ]);
            }

            RateLimiter::hit($limiterKey, $this->getDecaySeconds($limitName));
        }

        $limits = $this->getUserLimits($user);

        foreach ($limits as $limitName => $maxAttempts) {
            $limiterKey = $this->buildLimiterKey($userKey, $limitName);

            if (RateLimiter::tooManyAttempts($limiterKey, $maxAttempts)) {
                $retryAfter = RateLimiter::availableIn($limiterKey);

                return response()->json([
                    'message' => 'Too many upload attempts. Please slow down.',
                    'retry_after' => $retryAfter,
                    'limit' => $maxAttempts,
                    'period' => str_replace('uploads_per_', '', $limitName),
                ], 429, [
                    'Retry-After' => $retryAfter,
                    'X-RateLimit-Limit' => $maxAttempts,
                    'X-RateLimit-Remaining' => 0,
                ]);
            }

            RateLimiter::hit($limiterKey, $this->getDecaySeconds($limitName));
        }

        $response = $next($request);

        $fileCount = $this->countUploadedFiles($request);
        if ($fileCount > 0) {
            $response->headers->set('X-Uploads-Used', $fileCount);
        }

        return $response;
    }

    protected function getIpLimit(Request $request): array
    {
        $user = Auth::user();

        if ($user && $user->role === 'admin') {
            return [
                'uploads_per_minute' => 60,
                'uploads_per_hour' => 500,
                'uploads_per_day' => 2000,
            ];
        }

        return [
            'uploads_per_minute' => 20,
            'uploads_per_hour' => 100,
            'uploads_per_day' => 500,
        ];
    }

    protected function getUserLimits(?object $user): array
    {
        if (!$user) {
            return [
                'uploads_per_minute' => 5,
                'uploads_per_hour' => 20,
                'uploads_per_day' => 100,
            ];
        }

        if ($user->role === 'admin') {
            return [
                'uploads_per_minute' => 30,
                'uploads_per_hour' => 200,
                'uploads_per_day' => 1000,
            ];
        }

        if ($user->role === 'premium' || $user->is_premium) {
            return [
                'uploads_per_minute' => 15,
                'uploads_per_hour' => 100,
                'uploads_per_day' => 500,
            ];
        }

        return [
            'uploads_per_minute' => 10,
            'uploads_per_hour' => 50,
            'uploads_per_day' => 200,
        ];
    }

    protected function buildLimiterKey(string $userKey, string $limitName): string
    {
        $periods = [
            'uploads_per_minute' => now()->format('YmdHi'),
            'uploads_per_hour' => now()->format('YmdH'),
            'uploads_per_day' => now()->format('Ymd'),
        ];

        return "upload:{$userKey}:{$limitName}:{$periods[$limitName]}";
    }

    protected function getDecaySeconds(string $limitName): int
    {
        return match ($limitName) {
            'uploads_per_minute' => 60,
            'uploads_per_hour' => 3600,
            'uploads_per_day' => 86400,
            default => 60,
        };
    }

    protected function countUploadedFiles(Request $request): int
    {
        $count = 0;

        foreach ($request->allFiles() as $key => $files) {
            if (is_array($files)) {
                $count += count($files);
            } else {
                $count++;
            }
        }

        return $count;
    }
}
