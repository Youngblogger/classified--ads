<?php

namespace App\Services;

use App\Models\User;
use App\Models\CreditBalance;
use App\Models\CreditLedger;
use Illuminate\Support\Facades\Log;

/**
 * Credit Service
 * Handles credit balance management, earning, and spending
 */
class CreditService
{
    // Feature costs
    public const COST_BOOST_AD = 10;
    public const COST_FEATURED_LISTING = 25;
    public const COST_TOP_PLACEMENT = 35;

    /**
     * Get or create credit balance for user
     */
    public function getOrCreateBalance(int $userId): CreditBalance
    {
        return CreditBalance::firstOrCreate(
            ['user_id' => $userId],
            ['balance' => 0, 'total_earned' => 0, 'total_spent' => 0]
        );
    }

    /**
     * Get current balance
     */
    public function getBalance(int $userId): int
    {
        $balance = CreditBalance::where('user_id', $userId)->first();
        return $balance ? $balance->balance : 0;
    }

    /**
     * Add credits to user account
     */
    public function addCredits(int $userId, int $amount, string $reason, ?int $referenceId = null): array
    {
        if ($amount <= 0) {
            return ['success' => false, 'message' => 'Invalid amount'];
        }

        $balance = $this->getOrCreateBalance($userId);
        $newBalance = $balance->balance + $amount;

        // Create ledger entry first (immutable record)
        CreditLedger::create([
            'user_id' => $userId,
            'type' => 'earn',
            'amount' => $amount,
            'reason' => $reason,
            'reference_id' => $referenceId,
            'balance_after' => $newBalance,
        ]);

        // Update balance
        $balance->update([
            'balance' => $newBalance,
            'total_earned' => $balance->total_earned + $amount,
        ]);

        Log::info('Credits added', [
            'user_id' => $userId,
            'amount' => $amount,
            'reason' => $reason,
            'new_balance' => $newBalance,
        ]);

        return [
            'success' => true,
            'balance' => $newBalance,
            'amount_added' => $amount,
        ];
    }

    /**
     * Spend credits for a feature
     */
    public function spendCredits(int $userId, int $amount, string $reason, ?int $referenceId = null): array
    {
        if ($amount <= 0) {
            return ['success' => false, 'message' => 'Invalid amount'];
        }

        $balance = $this->getOrCreateBalance($userId);

        if (!$balance->hasEnough($amount)) {
            return [
                'success' => false,
                'message' => 'Insufficient credits',
                'current_balance' => $balance->balance,
                'required' => $amount,
            ];
        }

        $newBalance = $balance->balance - $amount;

        // Create ledger entry (immutable record)
        CreditLedger::create([
            'user_id' => $userId,
            'type' => 'spend',
            'amount' => $amount,
            'reason' => $reason,
            'reference_id' => $referenceId,
            'balance_after' => $newBalance,
        ]);

        // Update balance
        $balance->update([
            'balance' => $newBalance,
            'total_spent' => $balance->total_spent + $amount,
        ]);

        Log::info('Credits spent', [
            'user_id' => $userId,
            'amount' => $amount,
            'reason' => $reason,
            'new_balance' => $newBalance,
        ]);

        return [
            'success' => true,
            'balance' => $newBalance,
            'amount_spent' => $amount,
        ];
    }

    /**
     * Get credit transaction history
     */
    public function getHistory(int $userId, int $perPage = 20): array
    {
        return CreditLedger::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->toArray();
    }

    /**
     * Get available features and their costs
     */
    public function getFeatures(): array
    {
        return [
            [
                'id' => 'boost_ad',
                'name' => 'Boost Ad',
                'description' => 'Get more visibility for your ad',
                'cost' => self::COST_BOOST_AD,
                'icon' => 'trending-up',
            ],
            [
                'id' => 'featured_listing',
                'name' => 'Featured Listing',
                'description' => 'Your ad appears at the top of listings',
                'cost' => self::COST_FEATURED_LISTING,
                'icon' => 'star',
            ],
            [
                'id' => 'top_placement',
                'name' => 'Top Placement',
                'description' => 'Premium placement at the top',
                'cost' => self::COST_TOP_PLACEMENT,
                'icon' => 'arrow-up',
            ],
        ];
    }

    /**
     * Get cost for a specific feature
     */
    public function getFeatureCost(string $featureId): ?int
    {
        return match($featureId) {
            'boost_ad' => self::COST_BOOST_AD,
            'featured_listing' => self::COST_FEATURED_LISTING,
            'top_placement' => self::COST_TOP_PLACEMENT,
            default => null,
        };
    }

    /**
     * Use credits for a feature
     */
    public function useForFeature(int $userId, string $featureId, int $referenceId): array
    {
        $cost = $this->getFeatureCost($featureId);

        if (!$cost) {
            return ['success' => false, 'message' => 'Invalid feature'];
        }

        return $this->spendCredits($userId, $cost, $featureId, $referenceId);
    }

    /**
     * Check if user can afford a feature
     */
    public function canAfford(int $userId, string $featureId): array
    {
        $cost = $this->getFeatureCost($featureId);
        
        if (!$cost) {
            return ['can_afford' => false, 'reason' => 'Invalid feature'];
        }

        $balance = $this->getBalance($userId);

        return [
            'can_afford' => $balance >= $cost,
            'current_balance' => $balance,
            'required' => $cost,
            'shortage' => max(0, $cost - $balance),
        ];
    }
}
