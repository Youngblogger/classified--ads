<?php

namespace App\Providers;

use App\Services\ImageStorageService;
use App\Services\CloudinaryService;
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
        $this->app->singleton(ImageStorageService::class, function () {
            return new ImageStorageService(
                new CloudinaryService(),
            );
        });
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

        // Rate limit for ad posting (strict)
        RateLimiter::for('post-ad', function (Request $request) {
            return Limit::perMinute(3)->by($request->user()?->id ?? $request->ip())->response(function () {
                return response()->json(['message' => 'You are posting too frequently. Please wait before posting another ad.'], 429);
            });
        });

        // Rate limit for boost operations
        RateLimiter::for('boost', function (Request $request) {
            return Limit::perHour(5)->by($request->user()?->id ?? $request->ip())->response(function () {
                return response()->json(['message' => 'Too many boost operations. Please try again later.'], 429);
            });
        });

        // Rate limit for image uploads
        RateLimiter::for('uploads', function (Request $request) {
            return Limit::perMinute(10)->by($request->user()?->id ?? $request->ip())->response(function () {
                return response()->json(['message' => 'Too many uploads. Please slow down.'], 429);
            });
        });

        // Rate limit for payment/verification
        RateLimiter::for('payment', function (Request $request) {
            return Limit::perMinute(10)->by($request->user()?->id ?? $request->ip())->response(function () {
                return response()->json(['message' => 'Too many payment requests.'], 429);
            });
        });

        // Strict rate limit for admin endpoints
        RateLimiter::for('admin-api', function (Request $request) {
            return Limit::perMinute(60)->by($request->ip())->response(function () {
                return response()->json(['message' => 'Admin rate limit exceeded.'], 429);
            });
        });

        // Global API rate limit
        RateLimiter::for('global-api', function (Request $request) {
            if ($request->user()) {
                return Limit::perMinute(300)->by($request->user()->id);
            }
            return Limit::perMinute(100)->by($request->ip());
        });
    }
}
