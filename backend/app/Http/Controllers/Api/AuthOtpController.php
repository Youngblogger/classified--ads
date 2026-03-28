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
        // Log incoming request
        \Illuminate\Support\Facades\Log::info('Register request data: ', $request->all());
        
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
        ]);

        if ($validator->fails()) {
            \Illuminate\Support\Facades\Log::warning('Register validation failed: ', $validator->errors()->toArray());
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Check if email already exists
        $existingUser = User::where('email', $request->email)->first();
        
        if ($existingUser) {
            // Check if user is already verified
            $isVerified = $existingUser->emailVerification && $existingUser->emailVerification->is_verified;
            
            if ($isVerified) {
                // User is verified - cannot register again
                return response()->json([
                    'success' => false,
                    'message' => 'Email is already registered',
                    'code' => 'email_exists',
                ], 409);
            }
            
            // User exists but not verified - delete and allow re-registration
            $existingUser->emailVerification()->delete();
            $existingUser->delete();
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
        $emailSent = false;

        try {
            $this->otpService->sendOtpEmail($user, $otpData['otp']);
            $emailSent = true;
        } catch (\Exception $e) {
            // Log the error but don't fail registration
            \Illuminate\Support\Facades\Log::error('Email send failed: ' . $e->getMessage());
        }

        $response = [
            'success' => true,
            'message' => $emailSent 
                ? 'Registration successful! Please check your email for the verification code.'
                : 'Registration successful! Use the OTP code below to verify.',
            'user_id' => $user->id,
            'email' => $user->email,
            'expires_at' => $otpData['expires_at']->toIso8601String(),
            'email_sent' => $emailSent,
        ];

        // Always include OTP in response for development
        if (config('app.debug')) {
            $response['otp'] = $otpData['otp'];
            $response['dev_note'] = 'OTP shown for development. In production, check your email.';
        }

        return response()->json($response, 201);
    }

    public function verifyOtp(Request $request): JsonResponse
    {
        // Log the incoming request for debugging
        \Illuminate\Support\Facades\Log::info('Verify OTP request: ', $request->all());
        
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|string|min:4|max:4',
        ]);

        if ($validator->fails()) {
            \Illuminate\Support\Facades\Log::warning('OTP validation failed: ', $validator->errors()->toArray());
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
