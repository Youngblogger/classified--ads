<?php

namespace App\Services;

use App\Models\Ad;
use App\Models\BoostedAd;
use App\Models\PaymentIntent;
use App\Models\User;
use App\Events\AdBoosted;
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

    public function createBoost(int $adId, int $userId, string $boostType, int $durationDays): array
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

        $existingBoost = BoostedAd::where('ad_id', $adId)
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

        $existingBoost = BoostedAd::where('ad_id', $paymentIntent->ad_id)
            ->active()
            ->where('boost_type', $paymentIntent->metadata['boost_type'])
            ->first();

        if ($existingBoost) {
            $endTime = $existingBoost->end_time->addDays($paymentIntent->metadata['duration_days']);
            $existingBoost->update(['end_time' => $endTime]);
            $boost = $existingBoost->fresh();
        } else {
            $boost = BoostedAd::create([
                'ad_id' => $paymentIntent->ad_id,
                'user_id' => $paymentIntent->user_id,
                'boost_type' => $paymentIntent->metadata['boost_type'],
                'start_time' => now(),
                'end_time' => now()->addDays($paymentIntent->metadata['duration_days']),
                'status' => 'active',
                'payment_reference' => $paymentReference,
            ]);
        }

        event(new AdBoosted($boost));

        Log::info('Boost activated', [
            'ad_id' => $paymentIntent->ad_id,
            'boost_id' => $boost->id,
            'payment_reference' => $paymentReference,
        ]);

        return [
            'success' => true,
            'boost' => $boost,
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
            'recent_boosts' => $recentBoosts->map(fn($b) => [
                'boost_type' => $b->boost_type,
                'status' => $b->status,
                'created_at' => $b->created_at->toISOString(),
            ]),
            'prices' => $this->getBoostPrices(),
            'available_durations' => $this->getAvailableDurations(),
        ];
    }

    public function expireOldBoosts(): int
    {
        return BoostedAd::where('status', 'active')
            ->where('end_time', '<=', now())
            ->update(['status' => 'expired']);
    }
}
