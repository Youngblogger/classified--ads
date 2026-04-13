<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\RateLimiter;

class AdminRateLimiter
{
    protected $maxAttempts = 5;
    protected $decayMinutes = 15;

    public function handle(Request $request, Closure $next): Response
    {
        $key = $this->resolveRequestKey($request);
        
        if (RateLimiter::tooManyAttempts($key, $this->maxAttempts)) {
            $seconds = RateLimiter::availableIn($key);
            
            $response = response()->json([
                'success' => false,
                'message' => 'Too many login attempts. Please try again later.',
                'retry_after' => $seconds,
            ], 429);
            
            $response->headers->set('Retry-After', $seconds);
            $response->headers->set('X-RateLimit-Limit', $this->maxAttempts);
            $response->headers->set('X-RateLimit-Remaining', 0);
            
            return $response;
        }

        RateLimiter::hit($key, $this->decayMinutes * 60);

        $response = $next($request);

        if ($response instanceof \Symfony\Component\HttpFoundation\Response) {
            $remaining = RateLimiter::remaining($key, $this->maxAttempts);
            
            $response->headers->set('X-RateLimit-Limit', $this->maxAttempts);
            $response->headers->set('X-RateLimit-Remaining', max(0, $remaining));
        }

        return $response;
    }

    protected function resolveRequestKey(Request $request): string
    {
        $email = $request->input('login') ?? $request->input('email') ?? 'unknown';
        return 'admin_login|' . strtolower($email) . '|' . $request->ip();
    }
}

