<?php

namespace App\Services;

use App\Models\Ad;
use App\Models\BoostPlan;
use App\Models\BoostedAd;
use App\Models\PaymentIntent;
use App\Models\User;
use App\Models\Wallet;
use App\Events\AdBoosted;
use App\Events\BoostExpired;
use App\Events\BoostRenewed;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class BoostAdService
{
    protected const BOOST_PRICES = [
        'top' => 5.00,
        'featured' => 10.00,
        'highlight' => 3.00,
    ];

    protected const BOOST_DURATIONS = [
        1, 3, 7, 14, 30,
    ];

    public function getBoostPrices(): array
    {
        return self::BOOST_PRICES;
    }

    public function getAvailableDurations(): array
    {
        return self::BOOST_DURATIONS;
    }

    public function calculatePrice(string $boostType, int $days): float
    {
        $basePrice = self::BOOST_PRICES[$boostType] ?? self::BOOST_PRICES['top'];

        $multiplier = match (true) {
            $days >= 30 => 0.7,
            $days >= 14 => 0.8,
            $days >= 7 => 0.85,
            $days >= 3 => 0.9,
            default => 1.0,
        };

        return round($basePrice * $days * $multiplier, 2);
    }

    public function createBoost(int $adId, int $userId, string $boostType, int $durationDays, string $paymentMethod = 'paystack'): array
    {
        $ad = Ad::where('id', $adId)->where('user_id', $userId)->first();

        if (!$ad) {
            return [
                'success' => false,
                'error' => 'Ad not found or unauthorized',
                'code' => 'ad_not_found',
            ];
        }

        if (!in_array($ad->status, ['active'])) {
            return [
                'success' => false,
                'error' => 'Only active ads can be boosted',
                'code' => 'ad_not_active',
            ];
        }

        if (!in_array($boostType, ['top', 'featured', 'highlight'])) {
            return [
                'success' => false,
                'error' => 'Invalid boost type',
                'code' => 'invalid_boost_type',
            ];
        }

        if (!in_array($durationDays, self::BOOST_DURATIONS)) {
            return [
                'success' => false,
                'error' => 'Invalid duration. Available: ' . implode(', ', self::BOOST_DURATIONS),
                'code' => 'invalid_duration',
            ];
        }

        $price = $this->calculatePrice($boostType, $durationDays);

        if ($paymentMethod === 'wallet') {
            return $this->processWalletBoost($ad, $userId, $boostType, $durationDays, $price);
        }

        return $this->processPaystackBoost($ad, $userId, $boostType, $durationDays, $price);
    }

    protected function processWalletBoost(Ad $ad, int $userId, string $boostType, int $durationDays, float $price): array
    {
        $wallet = Wallet::where('user_id', $userId)->first();

        if (!$wallet) {
            return [
                'success' => false,
                'error' => 'Wallet not found',
                'code' => 'wallet_not_found',
            ];
        }

        if ($wallet->available_balance < $price) {
            return [
                'success' => false,
                'error' => 'Insufficient wallet balance. Available: ₦' . number_format($wallet->available_balance, 2) . ', Required: ₦' . number_format($price, 2),
                'code' => 'insufficient_balance',
                'available_balance' => $wallet->available_balance,
                'required_amount' => $price,
            ];
        }

        $reference = 'WLB' . date('Ymd') . strtoupper(Str::random(10));

        return DB::transaction(function () use ($ad, $userId, $boostType, $durationDays, $price, $wallet, $reference) {
            $existingBoost = BoostedAd::where('ad_id', $ad->id)
                ->active()
                ->where('boost_type', $boostType)
                ->lockForUpdate()
                ->first();

            if ($existingBoost) {
                return [
                    'success' => false,
                    'error' => 'This boost type is already active for this ad',
                    'code' => 'duplicate_boost',
                ];
            }

            $transaction = $wallet->atomicDebit($price, 'Boost payment for ad #' . $ad->id . ' (' . $boostType . ', ' . $durationDays . ' days)', $reference, [
                'ad_id' => $ad->id,
                'boost_type' => $boostType,
                'duration_days' => $durationDays,
                'source' => 'wallet_boost',
            ]);

            if ($transaction === null) {
                return [
                    'success' => false,
                    'error' => 'Insufficient wallet balance',
                    'code' => 'insufficient_balance',
                ];
            }

            $boost = BoostedAd::create([
                'ad_id' => $ad->id,
                'user_id' => $userId,
                'boost_type' => $boostType,
                'start_time' => now(),
                'end_time' => now()->addDays($durationDays),
                'status' => 'active',
                'payment_reference' => $reference,
                'paid_from' => 'wallet',
            ]);

            $transaction->update([
                'description' => 'Boost payment for ad #' . $ad->id . ' (' . $boostType . ', ' . $durationDays . ' days) - Ref: ' . $reference,
            ]);

            event(new AdBoosted($boost));

            Log::info('Wallet boost activated', [
                'ad_id' => $ad->id,
                'boost_id' => $boost->id,
                'user_id' => $userId,
                'boost_type' => $boostType,
                'duration_days' => $durationDays,
                'price' => $price,
                'reference' => $reference,
                'balance_after' => $wallet->fresh()->balance,
            ]);

            return [
                'success' => true,
                'boost' => $boost,
                'price' => $price,
                'boost_type' => $boostType,
                'duration_days' => $durationDays,
                'reference' => $reference,
                'paid_from' => 'wallet',
                'balance_after' => $wallet->fresh()->balance,
            ];
        });
    }

    protected function processPaystackBoost(Ad $ad, int $userId, string $boostType, int $durationDays, float $price): array
    {
        $existingBoost = BoostedAd::where('ad_id', $ad->id)
            ->active()
            ->where('boost_type', $boostType)
            ->first();

        if ($existingBoost) {
            return [
                'success' => false,
                'error' => 'This boost type is already active for this ad',
                'code' => 'duplicate_boost',
                'existing_boost' => [
                    'id' => $existingBoost->id,
                    'end_time' => $existingBoost->end_time->toISOString(),
                ],
            ];
        }

        $user = User::find($userId);

        return DB::transaction(function () use ($ad, $userId, $boostType, $durationDays, $price, $user) {
            $paymentService = app(PaymentService::class);

            $result = $paymentService->initializePayment([
                'user_id' => $userId,
                'ad_id' => $ad->id,
                'amount' => $price,
                'currency' => 'NGN',
                'type' => 'boost',
                'email' => $user?->email ?? '',
                'metadata' => [
                    'action' => 'new_boost',
                    'boost_type' => $boostType,
                    'duration_days' => $durationDays,
                ],
            ]);

            if (!$result['success']) {
                return $result;
            }

            Log::info('Boost payment initiated', [
                'ad_id' => $ad->id,
                'user_id' => $userId,
                'boost_type' => $boostType,
                'duration_days' => $durationDays,
                'price' => $price,
                'reference' => $result['payment_intent']->reference,
            ]);

            return [
                'success' => true,
                'payment_intent' => $result['payment_intent'],
                'authorization_url' => $result['authorization_url'] ?? null,
                'access_code' => $result['access_code'] ?? null,
                'price' => $price,
                'boost_type' => $boostType,
                'duration_days' => $durationDays,
                'paid_from' => 'paystack',
            ];
        });
    }

    public function createPlanBoost(int $adId, int $userId, string $planType, string $paymentMethod = 'paystack'): array
    {
        $ad = Ad::where('id', $adId)->where('user_id', $userId)->first();

        if (!$ad) {
            return [
                'success' => false,
                'error' => 'Ad not found or unauthorized',
                'code' => 'ad_not_found',
            ];
        }

        if (!in_array($ad->status, ['active'])) {
            return [
                'success' => false,
                'error' => 'Only active ads can be boosted',
                'code' => 'ad_not_active',
            ];
        }

        $plan = BoostPlan::where('type', $planType)->where('is_active', true)->first();

        if (!$plan) {
            return [
                'success' => false,
                'error' => 'Invalid or inactive boost plan',
                'code' => 'invalid_plan',
            ];
        }

        $price = (float) $plan->price;
        $durationDays = $plan->duration_days;

        if ($paymentMethod === 'wallet') {
            return $this->processWalletPlanBoost($ad, $userId, $plan, $price, $durationDays);
        }

        return $this->processPaystackPlanBoost($ad, $userId, $plan, $price, $durationDays);
    }

    public function createPlanRenew(int $adId, int $userId, string $planType, string $paymentMethod = 'paystack'): array
    {
        $ad = Ad::where('id', $adId)->where('user_id', $userId)->first();

        if (!$ad) {
            return [
                'success' => false,
                'error' => 'Ad not found or unauthorized',
                'code' => 'ad_not_found',
            ];
        }

        $canRenew = $this->canRenewBoost($adId, $userId, $planType);

        if (!$canRenew['can_renew']) {
            return [
                'success' => false,
                'error' => $canRenew['reason'],
                'code' => $canRenew['code'],
            ];
        }

        $plan = BoostPlan::where('type', $planType)->where('is_active', true)->first();

        if (!$plan) {
            return [
                'success' => false,
                'error' => 'Invalid or inactive boost plan',
                'code' => 'invalid_plan',
            ];
        }

        $price = (float) $plan->price;
        $durationDays = $plan->duration_days;

        if ($paymentMethod === 'wallet') {
            return $this->processWalletPlanBoost($ad, $userId, $plan, $price, $durationDays);
        }

        return $this->processPaystackPlanBoost($ad, $userId, $plan, $price, $durationDays);
    }

    protected function processWalletPlanBoost(Ad $ad, int $userId, BoostPlan $plan, float $price, int $durationDays): array
    {
        $wallet = Wallet::where('user_id', $userId)->first();

        if (!$wallet) {
            return [
                'success' => false,
                'error' => 'Wallet not found',
                'code' => 'wallet_not_found',
            ];
        }

        if ($wallet->available_balance < $price) {
            return [
                'success' => false,
                'error' => 'Insufficient wallet balance. Available: ₦' . number_format($wallet->available_balance, 2) . ', Required: ₦' . number_format($price, 2),
                'code' => 'insufficient_balance',
                'available_balance' => $wallet->available_balance,
                'required_amount' => $price,
            ];
        }

        $reference = 'WLB' . date('Ymd') . strtoupper(Str::random(10));

        return DB::transaction(function () use ($ad, $userId, $plan, $price, $durationDays, $wallet, $reference) {
            $existingBoost = BoostedAd::where('ad_id', $ad->id)
                ->active()
                ->where(function ($q) use ($plan) {
                    $q->where('plan_id', $plan->id)
                      ->orWhere('boost_type', $plan->type);
                })
                ->lockForUpdate()
                ->first();

            if ($existingBoost) {
                return [
                    'success' => false,
                    'error' => 'This boost plan is already active for this ad',
                    'code' => 'duplicate_boost',
                ];
            }

            $transaction = $wallet->atomicDebit($price, 'Boost payment for ad #' . $ad->id . ' (' . $plan->name . ')', $reference, [
                'ad_id' => $ad->id,
                'plan_id' => $plan->id,
                'plan_type' => $plan->type,
                'source' => 'wallet_boost',
            ]);

            if ($transaction === null) {
                return [
                    'success' => false,
                    'error' => 'Insufficient wallet balance',
                    'code' => 'insufficient_balance',
                ];
            }

            $boost = BoostedAd::create([
                'ad_id' => $ad->id,
                'user_id' => $userId,
                'plan_id' => $plan->id,
                'boost_type' => $plan->type,
                'priority_score' => $plan->priority_score,
                'start_time' => now(),
                'end_time' => now()->addDays($durationDays),
                'status' => 'active',
                'payment_reference' => $reference,
                'paid_from' => 'wallet',
            ]);

            $transaction->update([
                'description' => 'Boost payment for ad #' . $ad->id . ' (' . $plan->name . ') - Ref: ' . $reference,
            ]);

            event(new AdBoosted($boost));

            Log::info('Wallet plan boost activated', [
                'ad_id' => $ad->id,
                'boost_id' => $boost->id,
                'plan_id' => $plan->id,
                'plan_name' => $plan->name,
                'user_id' => $userId,
                'price' => $price,
                'reference' => $reference,
                'balance_after' => $wallet->fresh()->balance,
            ]);

            return [
                'success' => true,
                'boost' => $boost,
                'price' => $price,
                'plan' => $plan,
                'reference' => $reference,
                'paid_from' => 'wallet',
                'balance_after' => $wallet->fresh()->balance,
            ];
        });
    }

    protected function processPaystackPlanBoost(Ad $ad, int $userId, BoostPlan $plan, float $price, int $durationDays): array
    {
        $existingBoost = BoostedAd::where('ad_id', $ad->id)
            ->active()
            ->where(function ($q) use ($plan) {
                $q->where('plan_id', $plan->id)
                  ->orWhere('boost_type', $plan->type);
            })
            ->first();

        if ($existingBoost) {
            return [
                'success' => false,
                'error' => 'This boost plan is already active for this ad',
                'code' => 'duplicate_boost',
            ];
        }

        $user = User::find($userId);

        return DB::transaction(function () use ($ad, $userId, $plan, $price, $durationDays, $user) {
            $paymentService = app(PaymentService::class);

            $result = $paymentService->initializePayment([
                'user_id' => $userId,
                'ad_id' => $ad->id,
                'amount' => $price,
                'currency' => 'NGN',
                'type' => 'boost',
                'email' => $user?->email ?? '',
                'metadata' => [
                    'action' => 'new_boost',
                    'plan_type' => $plan->type,
                    'plan_id' => $plan->id,
                    'duration_days' => $durationDays,
                ],
            ]);

            if (!$result['success']) {
                return $result;
            }

            Log::info('Boost plan payment initiated', [
                'ad_id' => $ad->id,
                'user_id' => $userId,
                'plan_id' => $plan->id,
                'plan_name' => $plan->name,
                'price' => $price,
                'reference' => $result['payment_intent']->reference,
            ]);

            return [
                'success' => true,
                'payment_intent' => $result['payment_intent'],
                'authorization_url' => $result['authorization_url'] ?? null,
                'access_code' => $result['access_code'] ?? null,
                'price' => $price,
                'plan' => $plan,
                'duration_days' => $durationDays,
                'paid_from' => 'paystack',
            ];
        });
    }

    public function renewBoost(int $adId, int $userId, string $boostType, int $durationDays): array
    {
        $canRenew = $this->canRenewBoost($adId, $userId, $boostType);

        if (!$canRenew['can_renew']) {
            return [
                'success' => false,
                'error' => $canRenew['reason'],
                'code' => $canRenew['code'],
            ];
        }

        $price = $this->calculatePrice($boostType, $durationDays);

        $user = User::find($userId);
        $ad = Ad::where('id', $adId)->where('user_id', $userId)->first();

        return DB::transaction(function () use ($ad, $userId, $boostType, $durationDays, $price, $user) {
            $paymentService = app(PaymentService::class);

            $result = $paymentService->initializePayment([
                'user_id' => $userId,
                'ad_id' => $ad->id,
                'amount' => $price,
                'currency' => 'NGN',
                'type' => 'boost',
                'email' => $user?->email ?? '',
                'metadata' => [
                    'action' => 'renew_boost',
                    'boost_type' => $boostType,
                    'duration_days' => $durationDays,
                ],
            ]);

            if (!$result['success']) {
                return $result;
            }

            Log::info('Boost renewal payment initiated', [
                'ad_id' => $ad->id,
                'user_id' => $userId,
                'boost_type' => $boostType,
                'duration_days' => $durationDays,
                'price' => $price,
                'reference' => $result['payment_intent']->reference,
            ]);

            return [
                'success' => true,
                'payment_intent' => $result['payment_intent'],
                'authorization_url' => $result['authorization_url'] ?? null,
                'access_code' => $result['access_code'] ?? null,
                'price' => $price,
                'boost_type' => $boostType,
                'duration_days' => $durationDays,
            ];
        });
    }

    public function canRenewBoost(int $adId, int $userId, ?string $boostType = null): array
    {
        $ad = Ad::where('id', $adId)->where('user_id', $userId)->first();

        if (!$ad) {
            return ['can_renew' => false, 'reason' => 'Ad not found or unauthorized', 'code' => 'ad_not_found'];
        }

        if ($ad->status !== 'active') {
            return ['can_renew' => false, 'reason' => 'Cannot renew boost for sold, closed, or expired ads', 'code' => 'ad_not_active'];
        }

        $query = BoostedAd::where('ad_id', $adId)->where('user_id', $userId);

        if ($boostType) {
            $query->where('boost_type', $boostType);
        }

        $hasActiveBoost = (clone $query)->active()->exists();
        $hasExpiredBoost = (clone $query)->where('status', 'expired')->exists();

        if ($hasActiveBoost) {
            $activeBoost = $query->active()->latest('end_time')->first();

            return [
                'can_renew' => true,
                'reason' => null,
                'code' => null,
                'boost_status' => 'active',
                'current_end_time' => $activeBoost->end_time->toISOString(),
                'days_remaining' => now()->diffInDays($activeBoost->end_time, false),
                'will_extend_to' => $activeBoost->end_time->addDays(7)->toISOString(),
            ];
        }

        if ($hasExpiredBoost) {
            return [
                'can_renew' => true,
                'reason' => null,
                'code' => null,
                'boost_status' => 'expired',
                'will_start_from' => now()->toISOString(),
            ];
        }

        return ['can_renew' => false, 'reason' => 'No previous boost found for this ad', 'code' => 'no_previous_boost'];
    }

    public function activateBoost(string $paymentReference): array
    {
        $paymentIntent = PaymentIntent::where('reference', $paymentReference)
            ->where('type', 'boost')
            ->where('status', 'paid')
            ->first();

        if (!$paymentIntent) {
            return [
                'success' => false,
                'error' => 'Payment not found or not completed',
            ];
        }

        if ($paymentIntent->ad_id === null) {
            return [
                'success' => false,
                'error' => 'No ad associated with this payment',
            ];
        }

        $ad = \App\Models\Ad::where('id', $paymentIntent->ad_id)
            ->where('user_id', $paymentIntent->user_id)
            ->first();

        if (!$ad) {
            Log::warning('Boost activation attempted for ad not owned by payment user', [
                'payment_reference' => $paymentReference,
                'ad_id' => $paymentIntent->ad_id,
                'payment_user_id' => $paymentIntent->user_id,
            ]);
            return [
                'success' => false,
                'error' => 'Ad not found or unauthorized',
            ];
        }

        $metadata = $paymentIntent->metadata ?? [];
        $boostType = $metadata['boost_type'] ?? $metadata['plan_type'] ?? 'top';
        $durationDays = $metadata['duration_days'] ?? 7;
        $action = $metadata['action'] ?? 'new_boost';
        $planId = $metadata['plan_id'] ?? null;

        // Activate pending ad for post-submission boosts
        if (($metadata['ad_pending'] ?? false) && $ad->status !== 'active') {
            $ad->update(['status' => 'active']);
            Log::info('Ad activated from pending status after boost payment', [
                'ad_id' => $ad->id,
                'payment_reference' => $paymentReference,
            ]);
        }

        $existingBoost = BoostedAd::where('ad_id', $paymentIntent->ad_id)
            ->active()
            ->where('boost_type', $boostType)
            ->first();

        $wasExpired = false;

        if ($existingBoost) {
            $endTime = $existingBoost->end_time->addDays($durationDays);
            $existingBoost->update([
                'end_time' => $endTime,
                'payment_reference' => $paymentIntent->reference,
            ]);
            $boost = $existingBoost->fresh();
        } else {
            $recentExpired = BoostedAd::where('ad_id', $paymentIntent->ad_id)
                ->where('boost_type', $boostType)
                ->where('status', 'expired')
                ->latest('end_time')
                ->first();

            if ($recentExpired && $action === 'renew_boost') {
                $recentExpired->update([
                    'status' => 'active',
                    'start_time' => now(),
                    'end_time' => now()->addDays($durationDays),
                    'payment_reference' => $paymentIntent->reference,
                ]);
                $boost = $recentExpired->fresh();
                $wasExpired = true;
            } else {
                $boostData = [
                    'ad_id' => $paymentIntent->ad_id,
                    'user_id' => $paymentIntent->user_id,
                    'boost_type' => $boostType,
                    'start_time' => now(),
                    'end_time' => now()->addDays($durationDays),
                    'status' => 'active',
                    'payment_reference' => $paymentIntent->reference,
                    'paid_from' => 'paystack',
                ];

                if ($planId) {
                    $boostData['plan_id'] = $planId;
                    $plan = BoostPlan::find($planId);
                    if ($plan) {
                        $boostData['priority_score'] = $plan->priority_score;
                    }
                }

                $boost = BoostedAd::create($boostData);
            }
        }

        if ($wasExpired) {
            event(new BoostRenewed($boost, true));
        } else {
            event(new AdBoosted($boost));
        }

        Log::info('Boost activated via Paystack', [
            'ad_id' => $paymentIntent->ad_id,
            'boost_id' => $boost->id,
            'action' => $action,
            'was_renewed' => $wasExpired,
            'payment_reference' => $paymentReference,
            'paid_from' => 'paystack',
        ]);

        return [
            'success' => true,
            'boost' => $boost,
            'was_renewed' => $wasExpired,
        ];
    }

    public function isActiveBoost(int $adId): bool
    {
        return BoostedAd::where('ad_id', $adId)
            ->active()
            ->exists();
    }

    public function getActiveBoost(int $adId): ?BoostedAd
    {
        return BoostedAd::where('ad_id', $adId)
            ->active()
            ->latest('start_time')
            ->first();
    }

    public function getLatestExpiredBoost(int $adId, ?string $boostType = null): ?BoostedAd
    {
        $query = BoostedAd::where('ad_id', $adId)
            ->where('status', 'expired');

        if ($boostType) {
            $query->where('boost_type', $boostType);
        }

        return $query->latest('end_time')->first();
    }

    public function getBoostPriority(int $adId): int
    {
        $boost = $this->getActiveBoost($adId);

        if (!$boost) {
            return 0;
        }

        return match ($boost->boost_type) {
            'top' => 3000,
            'featured' => 2000,
            'highlight' => 1000,
            default => 0,
        };
    }

    public function getBoostStatus(int $adId, int $userId): array
    {
        $ad = Ad::where('id', $adId)->where('user_id', $userId)->first();

        if (!$ad) {
            return ['error' => 'Ad not found or unauthorized'];
        }

        $activeBoost = $this->getActiveBoost($adId);
        $expiredBoost = $this->getLatestExpiredBoost($adId);

        $canRenew = $this->canRenewBoost($adId, $userId);

        $recentBoosts = BoostedAd::where('ad_id', $adId)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return [
            'has_active_boost' => $activeBoost !== null,
            'active_boost' => $activeBoost ? [
                'id' => $activeBoost->id,
                'boost_type' => $activeBoost->boost_type,
                'start_time' => $activeBoost->start_time->toISOString(),
                'end_time' => $activeBoost->end_time->toISOString(),
                'time_remaining' => $activeBoost->end_time->diffForHumans(),
                'days_remaining' => now()->diffInDays($activeBoost->end_time, false),
            ] : null,
            'expired_boost' => $expiredBoost ? [
                'id' => $expiredBoost->id,
                'boost_type' => $expiredBoost->boost_type,
                'expired_at' => $expiredBoost->end_time->toISOString(),
            ] : null,
            'can_renew' => $canRenew['can_renew'],
            'renewal_info' => $canRenew['can_renew'] ? [
                'boost_status' => $canRenew['boost_status'],
                'current_end_time' => $canRenew['current_end_time'] ?? null,
                'days_remaining' => $canRenew['days_remaining'] ?? null,
                'will_extend_to' => $canRenew['will_extend_to'] ?? null,
                'will_start_from' => $canRenew['will_start_from'] ?? null,
            ] : null,
            'recent_boosts' => $recentBoosts->map(fn($b) => [
                'boost_type' => $b->boost_type,
                'status' => $b->status,
                'start_time' => $b->start_time->toISOString(),
                'end_time' => $b->end_time->toISOString(),
                'created_at' => $b->created_at->toISOString(),
            ]),
            'prices' => $this->getBoostPrices(),
            'available_durations' => $this->getAvailableDurations(),
        ];
    }

    public function expireBoosts(): int
    {
        $expiredCount = 0;

        BoostedAd::where('status', 'active')
            ->where('end_time', '<=', now())
            ->chunk(100, function ($boosts) use (&$expiredCount) {
                foreach ($boosts as $boost) {
                    $boost->update(['status' => 'expired']);
                    event(new BoostExpired($boost));
                    $expiredCount++;
                }
            });

        if ($expiredCount > 0) {
            Log::info('Boosts expired', ['count' => $expiredCount]);
        }

        return $expiredCount;
    }

    public function expireOldBoosts(): int
    {
        return BoostedAd::where('status', 'active')
            ->where('end_time', '<=', now())
            ->update(['status' => 'expired']);
    }
}
