<?php

namespace App\Services;

use App\Models\Ad;
use App\Models\BoostPlan;
use App\Models\BoostedAd;
use App\Models\PaymentIntent;
use App\Models\User;
use App\Events\AdBoosted;
use App\Events\BoostExpired;
use App\Events\BoostRenewed;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class BoostTierService
{
    public function getActivePlans(): array
    {
        return Cache::remember('boost_plans_active', 3600, function () {
            return BoostPlan::active()->ordered()->get()->toArray();
        });
    }

    public function clearPlansCache(): void
    {
        Cache::forget('boost_plans_active');
    }

    public function findPlan(string $type): ?BoostPlan
    {
        return BoostPlan::where('type', $type)->where('is_active', true)->first();
    }

    public function findPlanById(int $id): ?BoostPlan
    {
        return BoostPlan::where('id', $id)->where('is_active', true)->first();
    }

    public function createBoost(int $adId, int $userId, string $planType): array
    {
        $plan = $this->findPlan($planType);
        if (!$plan) {
            return [
                'success' => false,
                'error' => 'Invalid or inactive boost plan',
                'code' => 'invalid_plan',
            ];
        }

        return $this->createBoostWithPlan($adId, $userId, $plan);
    }

    public function createBoostById(int $adId, int $userId, int $planId): array
    {
        $plan = $this->findPlanById($planId);
        if (!$plan) {
            return [
                'success' => false,
                'error' => 'Invalid or inactive boost plan',
                'code' => 'invalid_plan',
            ];
        }

        return $this->createBoostWithPlan($adId, $userId, $plan);
    }

    protected function createBoostWithPlan(int $adId, int $userId, BoostPlan $plan): array
    {
        $ad = Ad::where('id', $adId)->where('user_id', $userId)->first();

        if (!$ad) {
            return [
                'success' => false,
                'error' => 'Ad not found or unauthorized',
                'code' => 'ad_not_found',
            ];
        }

        if ($ad->status !== 'active') {
            return [
                'success' => false,
                'error' => 'Only active ads can be boosted',
                'code' => 'ad_not_active',
            ];
        }

        $existingBoost = BoostedAd::where('ad_id', $adId)
            ->active()
            ->where('plan_id', $plan->id)
            ->first();

        if ($existingBoost) {
            return [
                'success' => false,
                'error' => 'This boost plan is already active for this ad',
                'code' => 'duplicate_boost',
                'existing_boost' => [
                    'id' => $existingBoost->id,
                    'end_time' => $existingBoost->end_time->toISOString(),
                ],
            ];
        }

        $price = $plan->price;
        $user = User::find($userId);

        return DB::transaction(function () use ($ad, $userId, $plan, $price, $user) {
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
                    'plan_name' => $plan->name,
                    'duration_days' => $plan->duration_days,
                ],
            ]);

            if (!$result['success']) {
                return $result;
            }

            Log::info('Boost payment initiated', [
                'ad_id' => $ad->id,
                'user_id' => $userId,
                'plan' => $plan->type,
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
                'duration_days' => $plan->duration_days,
            ];
        });
    }

    public function renewBoost(int $adId, int $userId): array
    {
        $existing = BoostedAd::where('ad_id', $adId)
            ->where('user_id', $userId)
            ->whereIn('status', ['active', 'expired'])
            ->latest('end_time')
            ->first();

        if (!$existing) {
            return [
                'success' => false,
                'error' => 'No previous boost found for renewal',
                'code' => 'no_boost',
            ];
        }

        $plan = $existing->plan;
        if (!$plan || !$plan->is_active) {
            return [
                'success' => false,
                'error' => 'Original boost plan is no longer available',
                'code' => 'plan_unavailable',
            ];
        }

        $ad = Ad::where('id', $adId)->where('user_id', $userId)->first();
        if (!$ad || $ad->status !== 'active') {
            return [
                'success' => false,
                'error' => 'Ad not found or not active',
                'code' => 'ad_not_active',
            ];
        }

        $price = $plan->price;
        $user = User::find($userId);

        return DB::transaction(function () use ($ad, $userId, $plan, $price, $user, $existing) {
            $paymentService = app(PaymentService::class);

            $result = $paymentService->initializePayment([
                'user_id' => $userId,
                'ad_id' => $ad->id,
                'amount' => $price,
                'currency' => 'NGN',
                'type' => 'boost',
                'email' => $user?->email ?? '',
                'metadata' => [
                    'action' => $existing->status === 'active' ? 'extend_boost' : 'renew_boost',
                    'plan_type' => $plan->type,
                    'plan_id' => $plan->id,
                    'plan_name' => $plan->name,
                    'duration_days' => $plan->duration_days,
                    'previous_boost_id' => $existing->id,
                ],
            ]);

            if (!$result['success']) {
                return $result;
            }

            return [
                'success' => true,
                'payment_intent' => $result['payment_intent'],
                'authorization_url' => $result['authorization_url'] ?? null,
                'access_code' => $result['access_code'] ?? null,
                'price' => $price,
                'plan' => $plan,
                'duration_days' => $plan->duration_days,
                'is_renewal' => true,
            ];
        });
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

        $ad = Ad::where('id', $paymentIntent->ad_id)
            ->where('user_id', $paymentIntent->user_id)
            ->first();

        if (!$ad) {
            return [
                'success' => false,
                'error' => 'Ad not found or unauthorized',
            ];
        }

        $metadata = $paymentIntent->metadata ?? [];
        $planId = $metadata['plan_id'] ?? null;
        $durationDays = $metadata['duration_days'] ?? 7;
        $action = $metadata['action'] ?? 'new_boost';

        $plan = $planId ? BoostPlan::find($planId) : null;
        $priorityScore = $plan ? $plan->priority_score : 0;
        $boostType = $plan ? $plan->type : ($metadata['plan_type'] ?? 'silver');

        $existingBoost = BoostedAd::where('ad_id', $paymentIntent->ad_id)
            ->active()
            ->where('plan_id', $planId)
            ->first();

        $wasExpired = false;

        if ($existingBoost && in_array($action, ['extend_boost', 'renew_boost'])) {
            $endTime = $existingBoost->end_time->addDays($durationDays);
            $existingBoost->update([
                'end_time' => $endTime,
                'payment_reference' => $paymentIntent->reference,
                'payment_intent_id' => $paymentIntent->id,
            ]);
            $boost = $existingBoost->fresh();
        } else {
            $recentExpired = BoostedAd::where('ad_id', $paymentIntent->ad_id)
                ->where('plan_id', $planId)
                ->where('status', 'expired')
                ->latest('end_time')
                ->first();

            if ($recentExpired && $action === 'renew_boost') {
                $recentExpired->update([
                    'status' => 'active',
                    'start_time' => now(),
                    'end_time' => now()->addDays($durationDays),
                    'priority_score' => $priorityScore,
                    'payment_reference' => $paymentIntent->reference,
                    'payment_intent_id' => $paymentIntent->id,
                ]);
                $boost = $recentExpired->fresh();
                $wasExpired = true;
            } else {
                $boost = BoostedAd::create([
                    'ad_id' => $paymentIntent->ad_id,
                    'plan_id' => $planId,
                    'user_id' => $paymentIntent->user_id,
                    'boost_type' => $boostType,
                    'priority_score' => $priorityScore,
                    'start_time' => now(),
                    'end_time' => now()->addDays($durationDays),
                    'status' => 'active',
                    'payment_reference' => $paymentIntent->reference,
                    'payment_intent_id' => $paymentIntent->id,
                ]);
            }
        }

        if ($wasExpired) {
            event(new BoostRenewed($boost, true));
        } else {
            event(new AdBoosted($boost));
        }

        Log::info('Boost activated via tier service', [
            'ad_id' => $paymentIntent->ad_id,
            'boost_id' => $boost->id,
            'plan_id' => $planId,
            'action' => $action,
            'payment_reference' => $paymentReference,
        ]);

        $this->clearPlansCache();

        return [
            'success' => true,
            'boost' => $boost,
            'was_renewed' => $wasExpired,
        ];
    }

    public function getBoostStatus(int $adId, int $userId): array
    {
        $ad = Ad::where('id', $adId)->where('user_id', $userId)->first();

        if (!$ad) {
            return ['error' => 'Ad not found or unauthorized'];
        }

        $activeBoost = BoostedAd::with('plan')
            ->where('ad_id', $adId)
            ->active()
            ->latest('start_time')
            ->first();

        $expiredBoost = BoostedAd::with('plan')
            ->where('ad_id', $adId)
            ->where('status', 'expired')
            ->latest('end_time')
            ->first();

        $canRenew = $activeBoost || $expiredBoost;

        $recentBoosts = BoostedAd::with('plan')
            ->where('ad_id', $adId)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return [
            'has_active_boost' => $activeBoost !== null,
            'active_boost' => $activeBoost ? [
                'id' => $activeBoost->id,
                'plan_id' => $activeBoost->plan_id,
                'boost_type' => $activeBoost->boost_type,
                'plan_name' => $activeBoost->plan?->name ?? $activeBoost->boost_type,
                'badge_label' => $activeBoost->badge_label,
                'start_time' => $activeBoost->start_time->toISOString(),
                'end_time' => $activeBoost->end_time->toISOString(),
                'time_remaining' => $activeBoost->end_time->diffForHumans(),
                'days_remaining' => max(0, (int) now()->diffInDays($activeBoost->end_time, false)),
            ] : null,
            'expired_boost' => $expiredBoost ? [
                'id' => $expiredBoost->id,
                'plan_id' => $expiredBoost->plan_id,
                'boost_type' => $expiredBoost->boost_type,
                'plan_name' => $expiredBoost->plan?->name ?? $expiredBoost->boost_type,
                'expired_at' => $expiredBoost->end_time->toISOString(),
            ] : null,
            'can_renew' => $canRenew,
            'renewal_info' => $canRenew && $activeBoost ? [
                'boost_status' => $activeBoost ? 'active' : 'expired',
                'current_end_time' => $activeBoost?->end_time?->toISOString(),
                'days_remaining' => $activeBoost ? max(0, (int) now()->diffInDays($activeBoost->end_time, false)) : null,
                'will_extend_to' => $activeBoost ? $activeBoost->end_time->addDays($activeBoost->plan?->duration_days ?? 7)->toISOString() : null,
            ] : null,
            'recent_boosts' => $recentBoosts->map(fn($b) => [
                'boost_type' => $b->boost_type,
                'plan_name' => $b->plan?->name ?? $b->boost_type,
                'status' => $b->status,
                'start_time' => $b->start_time->toISOString(),
                'end_time' => $b->end_time->toISOString(),
                'created_at' => $b->created_at->toISOString(),
            ]),
        ];
    }

    public function getBoostedAdsForListing(): array
    {
        return Cache::remember('boosted_ads_listing', 300, function () {
            $activeBoosts = BoostedAd::with(['ad.images', 'ad.category', 'ad.location', 'plan'])
                ->active()
                ->byPriority()
                ->get();

            $boostedAdIds = [];
            $boostData = [];

            foreach ($activeBoosts as $boost) {
                if ($boost->ad && $boost->ad->status === 'active') {
                    $boostedAdIds[] = $boost->ad_id;
                    $boostData[$boost->ad_id] = [
                        'is_boosted' => true,
                        'boost_type' => $boost->boost_type,
                        'plan_id' => $boost->plan_id,
                        'plan_name' => $boost->plan?->name ?? $boost->boost_type,
                        'badge_label' => $boost->badge_label,
                        'priority_score' => $boost->priority_score,
                        'boost_end_time' => $boost->end_time?->toISOString(),
                    ];
                }
            }

            return [
                'boosted_ad_ids' => $boostedAdIds,
                'boost_data' => $boostData,
            ];
        });
    }

    public function clearBoostedAdsCache(): void
    {
        Cache::forget('boosted_ads_listing');
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
            Log::info('Boosts expired via tier service', ['count' => $expiredCount]);
            $this->clearBoostedAdsCache();
        }

        return $expiredCount;
    }

    public function getPrioritySortCallback(): callable
    {
        $boostData = $this->getBoostedAdsForListing();
        $boostDataMap = $boostData['boost_data'];

        return function ($ad) use ($boostDataMap) {
            if (!isset($boostDataMap[$ad->id])) {
                return 0;
            }
            $score = $boostDataMap[$ad->id]['priority_score'] ?? 0;
            $createdAt = $ad->created_at ? strtotime($ad->created_at) : 0;
            return $score * 100000 + $createdAt;
        };
    }

    public function trackImpression(int $boostId): void
    {
        BoostedAd::where('id', $boostId)->increment('impressions');
    }

    public function trackClick(int $boostId): void
    {
        BoostedAd::where('id', $boostId)->increment('clicks');
    }
}
