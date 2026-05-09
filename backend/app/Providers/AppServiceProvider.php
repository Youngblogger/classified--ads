<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Rate limit for OTP verification
        RateLimiter::for('otp-verify', function (Request $request) {
            return Limit::perAttempts(10)->by($request->ip())->response(function () {
                return response()->json([
                    'success' => false,
                    'message' => 'Too many verification attempts. Please try again later.',
                ], 429);
            });
        });

        // Rate limit for OTP resend
        RateLimiter::for('otp-resend', function (Request $request) {
            return Limit::perAttempts(5)->by($request->ip())->response(function () {
                return response()->json([
                    'success' => false,
                    'message' => 'Too many resend requests. Please try again later.',
                ], 429);
            });
        });

        // Rate limit for registration
        RateLimiter::for('register', function (Request $request) {
            return Limit::perAttempts(5)->by($request->ip())->response(function () {
                return response()->json([
                    'success' => false,
                    'message' => 'Too many registration attempts. Please try again later.',
                ], 429);
            });
        });

        // Rate limit for public API (ads listing, search)
        RateLimiter::for('public-api', function (Request $request) {
            return Limit::perMinute(120)->by($request->ip() ?? 'guest')->response(function () {
                return response()->json(['message' => 'Too many requests. Please slow down.'], 429);
            });
        });

        // Rate limit for authenticated API
        RateLimiter::for('auth-api', function (Request $request) {
            return Limit::perMinute(200)->by($request->user()?->id ?? $request->ip());
        });

        // Stricter rate limit for search
        RateLimiter::for('search', function (Request $request) {
            return Limit::perMinute(60)->by($request->ip() ?? 'guest')->response(function () {
                return response()->json(['message' => 'Too many search requests.'], 429);
            });
        });

        // Rate limit for message sending
        RateLimiter::for('messages', function (Request $request) {
            return Limit::perMinute(30)->by($request->user()?->id ?? $request->ip())->response(function () {
                return response()->json(['message' => 'Too many messages. Please slow down.'], 429);
            });
        });

        // Rate limit for homepage
        RateLimiter::for('homepage', function (Request $request) {
            return Limit::perMinute(60)->by($request->ip() ?? 'guest');
        });
    }
}
