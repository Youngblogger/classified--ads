<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserVerification;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class VerificationController extends Controller
{
    public function myVerifications(Request $request)
    {
        $user = $request->user();

        try {
            $phoneVerification = UserVerification::forUser($user->id)->ofType('phone')->latest()->first();
            $emailVerification = UserVerification::forUser($user->id)->ofType('email')->latest()->first();
            $identityVerification = UserVerification::forUser($user->id)->ofType('identity')->latest()->first();

            $phoneStatus = $phoneVerification ? $phoneVerification->status : 'none';
            $emailStatus = $emailVerification ? $emailVerification->status : 'none';
            $identityStatus = $identityVerification ? $identityVerification->status : 'none';

            $isPhoneVerified = $phoneStatus === 'approved';
            $isEmailVerified = $emailStatus === 'approved';
            $isIdentityVerified = $identityStatus === 'approved';

            $completedCount = 0;
            if ($isPhoneVerified) $completedCount++;
            if ($isEmailVerified) $completedCount++;
            if ($isIdentityVerified) $completedCount++;

            $isVerifiedSeller = $user->is_verified_seller ?? false;

            return response()->json([
                'phone' => [
                    'status' => $phoneStatus,
                    'verified_at' => $phoneVerification ? $phoneVerification->verified_at : null,
                    'verification' => $phoneVerification,
                ],
                'email' => [
                    'status' => $emailStatus,
                    'verified_at' => $emailVerification ? $emailVerification->verified_at : null,
                    'verification' => $emailVerification,
                ],
                'identity' => [
                    'status' => $identityStatus,
                    'document_type' => $identityVerification ? $identityVerification->document_type : null,
                    'verification' => $identityVerification,
                ],
                'overall' => [
                    'is_verified_seller' => $isVerifiedSeller,
                    'progress' => $completedCount . '/3 Completed',
                    'completed_steps' => $completedCount,
                    'total_steps' => 3,
                ],
                'badge' => [
                    'active' => $isVerifiedSeller,
                    'type' => 'verified_seller',
                    'label' => 'Verified Seller',
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch verifications: ' . $e->getMessage());
            return response()->json([
                'phone' => ['status' => 'none', 'verified_at' => null, 'verification' => null],
                'email' => ['status' => 'none', 'verified_at' => null, 'verification' => null],
                'identity' => ['status' => 'none', 'document_type' => null, 'verification' => null],
                'overall' => ['is_verified_seller' => false, 'progress' => '0/3 Completed', 'completed_steps' => 0, 'total_steps' => 3],
                'badge' => ['active' => false, 'type' => 'verified_seller', 'label' => 'Verified Seller'],
            ]);
        }
    }

    public function submitPhone(Request $request)
    {
        try {
            $user = $request->user();

            $existing = UserVerification::forUser($user->id)
                ->ofType('phone')
                ->approved()
                ->exists();

            if ($existing) {
                return response()->json([
                    'success' => false,
                    'message' => 'Phone already verified',
                ], 400);
            }

            $verification = UserVerification::create([
                'user_id' => $user->id,
                'type' => 'phone',
                'status' => 'approved',
                'verified_at' => now(),
            ]);

            $this->activateVerifiedSellerBadge($user);

            Log::info('Phone verification auto-approved', [
                'user_id' => $user->id,
                'verification_id' => $verification->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Phone verified successfully',
                'verification' => $verification,
            ]);
        } catch (\Exception $e) {
            Log::error('Phone verification failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit phone verification. Please try again.',
            ], 500);
        }
    }

    public function submitEmail(Request $request)
    {
        return response()->json([
            'success' => false,
            'message' => 'Please use the new email verification flow. Click "Verify Email" to receive a verification link.',
        ], 400);
    }

    public function submitIdentity(Request $request)
    {
        try {
            $validated = $request->validate([
                'document_type' => 'required|in:nin,voters_card,passport,driver_license',
                'document_number' => 'required|string',
                'document' => 'required|file|mimes:jpeg,png,jpg,pdf|max:10240',
            ]);

            $user = $request->user();

            $data = [
                'user_id' => $user->id,
                'type' => 'identity',
                'status' => 'pending',
                'document_type' => $validated['document_type'],
                'document_number' => $validated['document_number'],
            ];

            if ($request->hasFile('document')) {
                $data['document_front'] = Storage::disk('public')->putFile('verifications', $request->file('document'));
            }

            $verification = UserVerification::create($data);

            Log::info('Identity verification submitted', [
                'user_id' => $user->id,
                'verification_id' => $verification->id,
                'document_type' => $validated['document_type'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Identity verification submitted for review',
                'verification' => $verification,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Identity verification failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit identity verification. Please try again.',
            ], 500);
        }
    }

    public function getStatus(Request $request)
    {
        try {
            $user = $request->user();

            $isPhoneVerified = UserVerification::isUserVerified($user->id, 'phone');
            $isEmailVerified = UserVerification::isUserVerified($user->id, 'email');
            $isIdentityVerified = UserVerification::isUserVerified($user->id, 'identity');

            $completedCount = 0;
            if ($isPhoneVerified) $completedCount++;
            if ($isEmailVerified) $completedCount++;
            if ($isIdentityVerified) $completedCount++;

            $badges = [];
            if ($isPhoneVerified) {
                $badges[] = ['type' => 'phone', 'label' => 'Phone Verified'];
            }
            if ($isEmailVerified) {
                $badges[] = ['type' => 'email', 'label' => 'Email Verified'];
            }
            if ($isIdentityVerified) {
                $badges[] = ['type' => 'identity', 'label' => 'Identity Verified'];
            }
            if ($user->is_verified_seller) {
                $badges[] = ['type' => 'verified_seller', 'label' => 'Verified Seller'];
            }

            return response()->json([
                'is_phone_verified' => $isPhoneVerified,
                'is_email_verified' => $isEmailVerified,
                'is_identity_verified' => $isIdentityVerified,
                'is_verified_seller' => (bool) ($user->is_verified_seller ?? false),
                'is_verified_business' => (bool) ($user->is_verified_business ?? false),
                'verification_progress' => $completedCount . '/3',
                'badges' => $badges,
            ]);
        } catch (\Exception $e) {
            Log::error('Verification status failed: ' . $e->getMessage());
            return response()->json([
                'is_phone_verified' => false,
                'is_email_verified' => false,
                'is_identity_verified' => false,
                'is_verified_seller' => false,
                'is_verified_business' => false,
                'verification_progress' => '0/3',
                'badges' => [],
            ]);
        }
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

    private function deactivateVerifiedSellerBadge(User $user): void
    {
        $user->update([
            'is_verified_seller' => false,
            'seller_verified_at' => null,
        ]);

        Log::info('Verified seller badge deactivated', [
            'user_id' => $user->id,
        ]);
    }

    public function uploadDocument(Request $request)
    {
        $validated = $request->validate([
            'file' => 'required|file|max:10240',
        ]);

        $path = Storage::disk('public')->putFile('verifications', $request->file('file'));

        return response()->json([
            'success' => true,
            'url' => Storage::disk('public')->url($path),
        ]);
    }
}
