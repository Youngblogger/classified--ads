<?php

namespace App\Services;

use App\Models\User;
use App\Models\Referral;
use App\Models\ReferralReward;
use App\Models\CreditBalance;
use App\Models\CreditLedger;
use Illuminate\Support\Facades\Log;

/**
 * Referral Service
 * Handles referral code generation, tracking, and reward distribution
 */
class ReferralService
{
    // Credit rewards configuration
    public const REWARD_SIGNUP_REFERRER = 5;
    public const REWARD_AD_POSTED_REFERRER = 10;
    public const REWARD_AD_POSTED_REFERRED = 5;
    public const REWARD_CHAT_REFERRER = 5;
    public const REWARD_CHAT_REFERRED = 2;

    // Daily limit
    public const MAX_REFERRALS_PER_DAY = 20;

    /**
     * Apply referral code during registration
     */
    public function applyReferralCode(string $code, int $userId): ?array
    {
        $referrer = User::where('referral_code', strtoupper($code))->first();

        if (!$referrer) {
            return ['success' => false, 'message' => 'Invalid referral code'];
        }

        // Self-referral check
        if ($referrer->id === $userId) {
            return ['success' => false, 'message' => 'Cannot use your own referral code'];
        }

        // Check daily limit
        $todayReferrals = $referrer->referrals()
            ->whereDate('created_at', today())
            ->count();

        if ($todayReferrals >= self::MAX_REFERRALS_PER_DAY) {
            return ['success' => false, 'message' => 'Daily referral limit reached'];
        }

        // Create referral relationship
        $referral = Referral::create([
            'referrer_id' => $referrer->id,
            'referred_user_id' => $userId,
            'status' => 'pending',
        ]);

        // Update user's referred_by field
        User::where('id', $userId)->update(['referred_by' => $referrer->id]);

        Log::info('Referral applied', [
            'referrer_id' => $referrer->id,
            'referred_user_id' => $userId,
            'referral_id' => $referral->id,
        ]);

        return [
            'success' => true,
            'referral_id' => $referral->id,
            'message' => 'Referral code applied successfully',
        ];
    }

    /**
     * Award referral reward after qualifying action
     */
    public function awardReward(int $userId, string $action): array
    {
        $user = User::find($userId);
        
        if (!$user || !$user->referred_by) {
            return ['success' => false, 'message' => 'No referral found'];
        }

        $referral = Referral::where('referrer_id', $user->referred_by)
            ->where('referred_user_id', $userId)
            ->first();

        if (!$referral) {
            return ['success' => false, 'message' => 'Referral not found'];
        }

        // Check if already rewarded for this action
        $existingReward = ReferralReward::where('referral_id', $referral->id)
            ->where('action', $action)
            ->first();

        if ($existingReward) {
            return ['success' => false, 'message' => 'Already rewarded for this action'];
        }

        // Get reward amounts based on action
        $rewardData = $this->getRewardAmounts($action);
        
        if (!$rewardData) {
            return ['success' => false, 'message' => 'Invalid action'];
        }

        $creditService = new CreditService();

        // Award referrer credits (with tier multiplier)
        $referrer = User::find($user->referred_by);
        $multiplier = $referrer->getReferralMultiplier();
        $referrerCredits = (int) ($rewardData['referrer'] * $multiplier);

        // Award referred user credits
        $referredCredits = $rewardData['referred'];

        // Create reward record
        ReferralReward::create([
            'referral_id' => $referral->id,
            'action' => $action,
            'referrer_credits' => $referrerCredits,
            'referred_credits' => $referredCredits,
        ]);

        // Credit the accounts
        if ($referrerCredits > 0) {
            $creditService->addCredits($referrer->id, $referrerCredits, "referral_{$action}", $referral->id);
        }

        if ($referredCredits > 0) {
            $creditService->addCredits($userId, $referredCredits, "referral_{$action}_bonus", $referral->id);
        }

        // Check if referral should be marked as completed
        $this->checkAndMarkCompleted($referral);

        Log::info('Referral reward awarded', [
            'referral_id' => $referral->id,
            'action' => $action,
            'referrer_credits' => $referrerCredits,
            'referred_credits' => $referredCredits,
        ]);

        return [
            'success' => true,
            'referrer_credits' => $referrerCredits,
            'referred_credits' => $referredCredits,
            'message' => "You earned {$referrerCredits} credits!",
        ];
    }

    /**
     * Get reward amounts based on action
     */
    protected function getRewardAmounts(string $action): ?array
    {
        return match($action) {
            'signup_verified' => [
                'referrer' => self::REWARD_SIGNUP_REFERRER,
                'referred' => 0,
            ],
            'first_ad_posted' => [
                'referrer' => self::REWARD_AD_POSTED_REFERRER,
                'referred' => self::REWARD_AD_POSTED_REFERRED,
            ],
            'first_chat' => [
                'referrer' => self::REWARD_CHAT_REFERRER,
                'referred' => self::REWARD_CHAT_REFERRED,
            ],
            default => null,
        };
    }

    /**
     * Check if referral should be marked as completed
     */
    protected function checkAndMarkCompleted(Referral $referral): void
    {
        // Get all reward actions for this referral
        $rewards = ReferralReward::where('referral_id', $referral->id)->pluck('action')->toArray();

        // Check if all required actions are complete
        $requiredActions = ['signup_verified', 'first_ad_posted'];
        $completedActions = array_intersect($requiredActions, $rewards);

        if (count($completedActions) >= 1) { // At least one major action completed
            $referral->markAsCompleted();
        }
    }

    /**
     * Get user's referral statistics
     */
    public function getStats(int $userId): array
    {
        $user = User::find($userId);
        
        $totalReferrals = $user->referrals()->count();
        $completedReferrals = $user->referrals()->where('status', 'completed')->count();
        $pendingReferrals = $user->referrals()->where('status', 'pending')->count();

        $totalEarned = ReferralReward::whereHas('referral', function ($query) use ($userId) {
            $query->where('referrer_id', $userId);
        })->sum('referrer_credits');

        $tier = $user->getReferralTier();
        $multiplier = $user->getReferralMultiplier();

        return [
            'referral_code' => $user->referral_code,
            'total_referrals' => $totalReferrals,
            'completed_referrals' => $completedReferrals,
            'pending_referrals' => $pendingReferrals,
            'total_credits_earned' => $totalEarned,
            'tier' => $tier,
            'multiplier' => $multiplier,
            'tier_progress' => $this->getTierProgress($completedReferrals),
        ];
    }

    /**
     * Get tier progress percentage
     */
    protected function getTierProgress(int $completedReferrals): array
    {
        if ($completedReferrals >= 25) {
            return ['current' => 100, 'next' => 'Max tier reached', 'required' => 0];
        } elseif ($completedReferrals >= 10) {
            $progress = (($completedReferrals - 10) / 15) * 100;
            return ['current' => (int) $progress, 'next' => 'Gold (25)', 'required' => 25 - $completedReferrals];
        } else {
            $progress = ($completedReferrals / 10) * 100;
            return ['current' => (int) $progress, 'next' => 'Silver (10)', 'required' => 10 - $completedReferrals];
        }
    }

    /**
     * Get user's referrals list
     */
    public function getReferralsList(int $userId): array
    {
        return User::find($userId)->referrals()
            ->with('referredUser:id,name,email,created_at,verified')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($referral) {
                return [
                    'id' => $referral->id,
                    'user' => [
                        'name' => $referral->referredUser?->name,
                        'email' => $referral->referredUser?->email,
                        'joined' => $referral->referredUser?->created_at,
                        'verified' => $referral->referredUser?->verified ?? false,
                    ],
                    'status' => $referral->status,
                    'credits_earned' => $referral->rewards()->sum('referrer_credits'),
                    'created_at' => $referral->created_at,
                    'completed_at' => $referral->completed_at,
                ];
            })
            ->toArray();
    }

    /**
     * Get top referrers leaderboard
     */
    public function getLeaderboard(int $limit = 10): array
    {
        return User::select('users.id', 'users.name', 'users.email')
            ->join('referrals', 'users.id', '=', 'referrals.referrer_id')
            ->where('referrals.status', 'completed')
            ->groupBy('users.id', 'users.name', 'users.email')
            ->selectRaw('COUNT(referrals.id) as total_referrals')
            ->orderByDesc('total_referrals')
            ->limit($limit)
            ->get()
            ->map(function ($user, $index) {
                $tier = User::find($user->id)->getReferralTier();
                return [
                    'rank' => $index + 1,
                    'user_id' => $user->id,
                    'name' => $user->name,
                    'total_referrals' => $user->total_referrals,
                    'tier' => $tier,
                ];
            })
            ->toArray();
    }

    /**
     * Ensure user has a referral code
     */
    public function ensureReferralCode(int $userId): string
    {
        $user = User::find($userId);
        
        if (!$user->referral_code) {
            $user->update(['referral_code' => User::generateReferralCode()]);
        }
        
        return $user->referral_code;
    }

    /**
     * Validate referral code exists
     */
    public function validateReferralCode(string $code): bool
    {
        return User::where('referral_code', strtoupper($code))->exists();
    }
}
