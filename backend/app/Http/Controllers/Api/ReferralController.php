<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ReferralService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReferralController extends Controller
{
    public function __construct(
        private ReferralService $referralService
    ) {}

    public function apply(Request $request): JsonResponse
    {
        $request->validate([
            'referral_code' => 'required|string|max:20',
        ]);

        $result = $this->referralService->applyReferralCode(
            $request->referral_code,
            $request->user()->id
        );

        return response()->json($result, $result['success'] ? 200 : 400);
    }

    public function myCode(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Generate referral code if doesn't exist
        if (!$user->referral_code) {
            $user->referral_code = User::generateReferralCode();
            $user->save();
        }
        
        return response()->json([
            'referral_code' => $user->referral_code,
            'referral_link' => config('app.frontend_url', 'https://ilist.com') . '/register?ref=' . $user->referral_code,
            'tier' => $user->getReferralTier(),
            'total_referrals' => $user->referrals()->count(),
            'completed_referrals' => $user->referrals()->where('status', 'completed')->count(),
        ]);
    }

    public function myReferrals(Request $request): JsonResponse
    {
        $referrals = $request->user()
            ->referrals()
            ->with('referredUser:id,name,email,avatar,created_at')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($referrals);
    }

    public function referredByMe(Request $request): JsonResponse
    {
        $referredBy = $request->user()
            ->referredBy()
            ->with('referrer:id,name,email,avatar')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($referredBy);
    }

    public function stats(Request $request): JsonResponse
    {
        $stats = $this->referralService->getStats($request->user()->id);

        return response()->json($stats);
    }

    public function leaderboard(Request $request): JsonResponse
    {
        $limit = $request->input('limit', 10);
        $leaderboard = $this->referralService->getLeaderboard($limit);

        return response()->json($leaderboard);
    }

    public function reward(Request $request): JsonResponse
    {
        $request->validate([
            'action' => 'required|string|in:signup_reward,ad_posted,chat_initiated',
        ]);

        $result = $this->referralService->awardReward(
            $request->user()->id,
            $request->action
        );

        return response()->json($result, $result['success'] ? 200 : 400);
    }

    public function validateCode(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string|max:20',
        ]);

        $isValid = $this->referralService->validateReferralCode($request->code);

        return response()->json([
            'valid' => $isValid,
        ]);
    }
}
