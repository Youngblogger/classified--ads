<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class AuthOtpController extends Controller
{
    public function __construct(
        private OtpService $otpService
    ) {}

    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
            'role' => 'user',
            'status' => 'active',
            'verified' => false,
        ]);

        $otpData = $this->otpService->createOrUpdateVerification($user);

        try {
            $this->otpService->sendOtpEmail($user, $otpData['otp']);
        } catch (\Exception $e) {
            // Log the error but don't fail registration
            \Illuminate\Support\Facades\Log::error('Email send failed: ' . $e->getMessage());
        }

        $response = [
            'success' => true,
            'message' => 'Registration successful! Please check your email for the verification code.',
            'user_id' => $user->id,
            'email' => $user->email,
            'expires_at' => $otpData['expires_at']->toIso8601String(),
        ];

        // Include OTP in response for development
        if (config('app.debug')) {
            $response['otp'] = $otpData['otp'];
            $response['dev_note'] = 'OTP shown for development only. In production, check your email.';
        }

        return response()->json($response, 201);
    }

    public function verifyOtp(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $rateLimitKey = 'otp_verify:' . $request->ip();
        if (RateLimiter::tooManyAttempts($rateLimitKey, 10)) {
            $seconds = RateLimiter::availableIn($rateLimitKey);
            return response()->json([
                'success' => false,
                'message' => 'Too many verification attempts. Please try again later.',
                'retry_after' => $seconds,
            ], 429);
        }
        RateLimiter::hit($rateLimitKey, 60);

        $user = User::where('email', $request->email)->first();
        $result = $this->otpService->validateOtp($user, $request->otp);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['error'],
                'code' => $result['code'] ?? 'error',
                'remaining_attempts' => $result['remaining_attempts'] ?? null,
            ], 400);
        }

        RateLimiter::clear($rateLimitKey);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => $result['message'],
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'verified' => true,
            ],
            'token' => $token,
        ]);
    }

    public function resendOtp(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $rateLimitKey = 'otp_resend:' . $request->ip();
        if (RateLimiter::tooManyAttempts($rateLimitKey, 5)) {
            $seconds = RateLimiter::availableIn($rateLimitKey);
            return response()->json([
                'success' => false,
                'message' => 'Too many resend requests. Please try again later.',
                'retry_after' => $seconds,
            ], 429);
        }
        RateLimiter::hit($rateLimitKey, 60);

        $user = User::where('email', $request->email)->first();

        if ($user->isEmailVerified()) {
            return response()->json([
                'success' => false,
                'message' => 'Email already verified.',
                'code' => 'already_verified',
            ], 400);
        }

        $canResend = $this->otpService->canResend($user);
        if (!$canResend['can_resend']) {
            return response()->json([
                'success' => false,
                'message' => 'Please wait before requesting a new code.',
                'cooldown_remaining' => $canResend['cooldown_remaining'],
                'retry_after' => $canResend['cooldown_remaining'],
            ], 429);
        }

        $otpData = $this->otpService->createOrUpdateVerification($user);

        try {
            $this->otpService->sendOtpEmail($user, $otpData['otp']);
        } catch (\Exception $e) {
            // Log the error but don't fail the request
            \Illuminate\Support\Facades\Log::error('Email send failed: ' . $e->getMessage());
        }

        $response = [
            'success' => true,
            'message' => 'A new verification code has been sent to your email.',
            'expires_at' => $otpData['expires_at']->toIso8601String(),
            'cooldown_remaining' => 60,
        ];

        // Include OTP in response for development
        if (config('app.debug')) {
            $response['otp'] = $otpData['otp'];
            $response['dev_note'] = 'OTP shown for development only. Check email in production.';
        }

        return response()->json($response);
    }

    public function checkStatus(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::where('email', $request->email)->first();
        $verification = $user->emailVerification;

        if (!$verification || $verification->is_verified) {
            return response()->json([
                'success' => true,
                'is_verified' => true,
            ]);
        }

        $canResend = $this->otpService->canResend($user);
        $isExpired = $verification->isExpired();
        $remainingAttempts = 5 - $verification->attempts;

        return response()->json([
            'success' => true,
            'is_verified' => false,
            'is_expired' => $isExpired,
            'can_resend' => $canResend['can_resend'],
            'cooldown_remaining' => $canResend['cooldown_remaining'],
            'remaining_attempts' => max(0, $remainingAttempts),
            'expires_at' => $verification->otp_expires_at?->toIso8601String(),
        ]);
    }
}
