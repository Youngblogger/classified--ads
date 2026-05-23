<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmailVerificationToken;
use App\Models\User;
use App\Models\UserVerification;
use App\Mail\EmailVerificationMail;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class EmailVerificationController extends Controller
{
    const RESEND_COOLDOWN_SECONDS = 60;

    public function sendVerificationEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = $request->user();

        if ($user->email !== $request->email) {
            return response()->json([
                'success' => false,
                'message' => 'Email does not match your account email.',
            ], 400);
        }

        if ($user->email_verified_at) {
            return response()->json([
                'success' => false,
                'message' => 'Email already verified.',
            ], 400);
        }

        $existing = UserVerification::forUser($user->id)->ofType('email')->approved()->exists();
        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Email already verified.',
            ], 400);
        }

        $lastToken = EmailVerificationToken::where('user_id', $user->id)
            ->whereNull('used_at')
            ->latest('id')
            ->first();

        // Remove any existing old unused tokens so resend always works
        if ($lastToken && $lastToken->isExpired()) {
            $lastToken->markAsUsed();
        }

        try {
            $rawToken = \Illuminate\Support\Str::random(64);
            $hashedToken = hash('sha256', $rawToken);

            EmailVerificationToken::create([
                'user_id' => $user->id,
                'token' => $hashedToken,
                'expires_at' => now()->addHours(24),
            ]);

            $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
            $verificationUrl = "{$frontendUrl}/auth/verify-email?token={$rawToken}";

            Mail::to($user->email)->send(new EmailVerificationMail($user, $verificationUrl));

            UserVerification::updateOrCreate(
                ['user_id' => $user->id, 'type' => 'email'],
                [
                    'status' => 'pending',
                    'verified_at' => null,
                ]
            );

            Log::info('Email verification sent', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Verification email sent successfully. Please check your inbox and click the verification link.',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send verification email: ' . $e->getMessage(), [
                'user_id' => $user->id,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to send verification email. Please try again later.',
            ], 500);
        }
    }

    public function verify(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
        ]);

        $hashedToken = hash('sha256', $request->token);

        $token = EmailVerificationToken::where('token', $hashedToken)
            ->whereNull('used_at')
            ->first();

        if (!$token) {
            Log::warning('Email verification: invalid or expired token used');
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired verification link.',
                'code' => 'invalid_token',
            ], 400);
        }

        if ($token->isExpired()) {
            Log::warning('Email verification: expired token used', ['user_id' => $token->user_id]);
            return response()->json([
                'success' => false,
                'message' => 'This verification link has expired. Please request a new one.',
                'code' => 'token_expired',
            ], 400);
        }

        $user = $token->user;

        if ($user->email_verified_at) {
            $token->markAsUsed();
            return response()->json([
                'success' => true,
                'message' => 'Email already verified.',
                'already_verified' => true,
            ]);
        }

        $token->markAsUsed();
        $user->update([
            'email_verified_at' => now(),
        ]);

        UserVerification::updateOrCreate(
            ['user_id' => $user->id, 'type' => 'email'],
            [
                'status' => 'approved',
                'verified_at' => now(),
            ]
        );

        $this->activateVerifiedSellerBadge($user);

        Log::info('Email verified successfully via link', [
            'user_id' => $user->id,
            'email' => $user->email,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Your email address has been verified successfully.',
        ]);
    }

    public function resendVerificationEmail(Request $request)
    {
        $user = $request->user();

        if ($user->email_verified_at) {
            return response()->json([
                'success' => false,
                'message' => 'Email already verified.',
            ], 400);
        }

        $existingVerified = UserVerification::forUser($user->id)->ofType('email')->approved()->exists();
        if ($existingVerified) {
            return response()->json([
                'success' => false,
                'message' => 'Email already verified.',
            ], 400);
        }

        $lastToken = EmailVerificationToken::where('user_id', $user->id)
            ->latest('id')
            ->first();

        if ($lastToken && $lastToken->isExpired()) {
            $lastToken->markAsUsed();
        }

        try {
            $rawToken = \Illuminate\Support\Str::random(64);
            $hashedToken = hash('sha256', $rawToken);

            EmailVerificationToken::create([
                'user_id' => $user->id,
                'token' => $hashedToken,
                'expires_at' => now()->addHours(24),
            ]);

            $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
            $verificationUrl = "{$frontendUrl}/auth/verify-email?token={$rawToken}";

            Mail::to($user->email)->send(new EmailVerificationMail($user, $verificationUrl));

            Log::info('Verification email resent', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Verification email sent successfully. Please check your inbox.',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to resend verification email: ' . $e->getMessage(), [
                'user_id' => $user->id,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to send verification email. Please try again later.',
            ], 500);
        }
    }

    public function status(Request $request)
    {
        $user = $request->user();

        $verification = UserVerification::forUser($user->id)->ofType('email')->latest()->first();
        $token = EmailVerificationToken::where('user_id', $user->id)
            ->whereNull('used_at')
            ->latest('id')
            ->first();

        if ($user->email_verified_at) {
            $status = 'verified';
        } elseif ($verification && $verification->status === 'pending') {
            $status = 'pending';
        } else {
            $status = 'not_verified';
        }

        $cooldownRemaining = 0;
        if ($token) {
            $cooldownRemaining = self::RESEND_COOLDOWN_SECONDS - $token->created_at->diffInSeconds(now());
            $cooldownRemaining = max(0, (int) $cooldownRemaining);
        }

        return response()->json([
            'success' => true,
            'status' => $status,
            'email' => $user->email,
            'email_verified_at' => $user->email_verified_at,
            'cooldown_remaining' => $cooldownRemaining,
            'can_resend' => $cooldownRemaining <= 0,
        ]);
    }

    private function activateVerifiedSellerBadge(User $user): void
    {
        try {
            $phoneVerified = UserVerification::isUserVerified($user->id, 'phone');
            $emailVerified = UserVerification::isUserVerified($user->id, 'email');
            $identityVerified = UserVerification::isUserVerified($user->id, 'identity');

            if ($phoneVerified && $emailVerified && $identityVerified) {
                if (!$user->is_verified_seller) {
                    $user->update([
                        'is_verified_seller' => true,
                        'seller_verified_at' => now(),
                    ]);

                    NotificationService::send($user->id, 'seller_badge_activated', 'Verified Seller Badge Activated!',
                        'Congratulations! You have completed all verification steps and your blue Verified Seller badge is now active.', []);

                    Log::info('Verified seller badge activated', [
                        'user_id' => $user->id,
                    ]);
                }
            }
        } catch (\Exception $e) {
            Log::error('Failed to activate verified seller badge: ' . $e->getMessage());
        }
    }
}
