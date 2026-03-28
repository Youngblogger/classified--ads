<?php

namespace App\Services;

use App\Models\EmailVerification;
use App\Models\User;
use App\Mail\OtpVerificationMail;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class OtpService
{
    const OTP_LENGTH = 4;
    const OTP_EXPIRY_MINUTES = 10;
    const MAX_ATTEMPTS = 5;
    const RESEND_COOLDOWN_SECONDS = 30;

    public function generateOtp(): string
    {
        return str_pad((string) random_int(0, 9999), self::OTP_LENGTH, '0', STR_PAD_LEFT);
    }

    public function hashOtp(string $otp): string
    {
        return Hash::make($otp);
    }

    public function verifyOtp(string $otp, string $hashedOtp): bool
    {
        return Hash::check($otp, $hashedOtp);
    }

    public function createOrUpdateVerification(User $user): array
    {
        $otp = $this->generateOtp();
        $otpHash = $this->hashOtp($otp);
        $expiresAt = Carbon::now()->addMinutes(self::OTP_EXPIRY_MINUTES);
        $cooldownUntil = Carbon::now()->addSeconds(self::RESEND_COOLDOWN_SECONDS);

        $verification = EmailVerification::updateOrCreate(
            ['user_id' => $user->id],
            [
                'otp' => $otp,
                'otp_hash' => $otpHash,
                'otp_expires_at' => $expiresAt,
                'attempts' => 0,
                'last_attempt_at' => null,
                'resend_cooldown_until' => $cooldownUntil,
                'is_verified' => false,
                'verified_at' => null,
            ]
        );

        return [
            'otp' => $otp,
            'expires_at' => $expiresAt,
            'cooldown_until' => $cooldownUntil,
        ];
    }

    public function validateOtp(User $user, string $otp): array
    {
        $verification = EmailVerification::where('user_id', $user->id)->first();

        if (!$verification) {
            return [
                'success' => false,
                'error' => 'No verification request found. Please register again.',
            ];
        }

        if ($verification->is_verified) {
            return [
                'success' => false,
                'error' => 'Email already verified.',
            ];
        }

        if ($verification->isExpired()) {
            return [
                'success' => false,
                'error' => 'OTP has expired. Please request a new one.',
                'code' => 'otp_expired',
            ];
        }

        if (!$verification->canAttempt()) {
            return [
                'success' => false,
                'error' => 'Too many failed attempts. Please request a new OTP.',
                'code' => 'max_attempts',
            ];
        }

        if (!$this->verifyOtp($otp, $verification->otp_hash)) {
            $verification->incrementAttempts();
            $remainingAttempts = self::MAX_ATTEMPTS - $verification->attempts;

            return [
                'success' => false,
                'error' => "Invalid OTP. {$remainingAttempts} attempts remaining.",
                'code' => 'invalid_otp',
                'remaining_attempts' => $remainingAttempts,
            ];
        }

        $verification->update([
            'is_verified' => true,
            'verified_at' => Carbon::now(),
            'otp' => null,
            'otp_hash' => null,
            'otp_expires_at' => null,
            'attempts' => 0,
        ]);

        $user->update(['verified' => true]);

        return [
            'success' => true,
            'message' => 'Email verified successfully!',
        ];
    }

    public function canResend(User $user): array
    {
        $verification = EmailVerification::where('user_id', $user->id)->first();

        if (!$verification) {
            return ['can_resend' => true, 'cooldown_remaining' => 0];
        }

        if ($verification->is_verified) {
            return ['can_resend' => false, 'reason' => 'already_verified'];
        }

        if ($verification->resend_cooldown_until && Carbon::now()->lessThan($verification->resend_cooldown_until)) {
            $cooldownRemaining = Carbon::now()->diffInSeconds($verification->resend_cooldown_until);
            return [
                'can_resend' => false,
                'cooldown_remaining' => $cooldownRemaining,
            ];
        }

        return ['can_resend' => true, 'cooldown_remaining' => 0];
    }

    public function invalidateOtp(User $user): void
    {
        EmailVerification::where('user_id', $user->id)->update([
            'otp' => null,
            'otp_hash' => null,
            'otp_expires_at' => null,
            'attempts' => 0,
        ]);
    }

    public function sendOtpEmail(User $user, string $otp): void
    {
        // Log OTP for development
        if (config('app.debug')) {
            \Illuminate\Support\Facades\Log::info("OTP for {$user->email}: {$otp}");
        }

        try {
            // Send email immediately instead of queueing
            Mail::to($user->email)->send(new OtpVerificationMail($user, $otp));
            \Illuminate\Support\Facades\Log::info("Email sent successfully to {$user->email}");
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Email sending failed: " . $e->getMessage());
            throw $e;
        }
    }
}
