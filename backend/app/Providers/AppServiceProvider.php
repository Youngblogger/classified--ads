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
    }
}
