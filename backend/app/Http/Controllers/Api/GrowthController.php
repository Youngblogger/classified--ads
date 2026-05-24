<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Models\BoostedAd;
use App\Services\BoostAdService;
use App\Services\BoostTierService;
use App\Services\PaymentService;
use App\Services\SavedAdService;
use App\Services\RecentlyViewedService;
use App\Services\ShareService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;

class GrowthController extends Controller
{
    public function getBoostPlans(BoostTierService $tierService)
    {
        $plans = $tierService->getActivePlans();

        return response()->json([
            'data' => $plans,
        ]);
    }

    public function boostAd(Request $request, int $id, BoostAdService $boostAdService, PaymentService $paymentService)
    {
        $user = $request->user();

        $key = 'boost-attempts:' . $user->id;
        if (RateLimiter::tooManyAttempts($key, 5)) {
            return response()->json([
                'success' => false,
                'error' => 'Too many boost attempts. Please try again in ' . RateLimiter::availableIn($key) . ' seconds.',
            ], 429);
        }
        RateLimiter::hit($key, 3600);

        $validated = $request->validate([
            'plan_type' => 'required_without:boost_type|in:silver,gold,platinum',
            'boost_type' => 'required_without:plan_type|in:top,featured,highlight',
            'duration_days' => 'required_if:boost_type,top,featured,highlight|integer|in:1,3,7,14,30',
            'payment_method' => 'sometimes|in:wallet,paystack',
        ]);

        $paymentMethod = $validated['payment_method'] ?? 'paystack';

        if (isset($validated['plan_type'])) {
            $result = $boostAdService->createPlanBoost($id, $user->id, $validated['plan_type'], $paymentMethod);
        } else {
            $result = $boostAdService->createBoost($id, $user->id, $validated['boost_type'], $validated['duration_days'], $paymentMethod);
        }

        if (!$result['success']) {
            $status = match ($result['code'] ?? '') {
                'ad_not_found' => 404,
                'ad_not_active' => 422,
                'insufficient_balance' => 402,
                'wallet_not_found' => 404,
                'invalid_plan' => 400,
                default => 400,
            };

            $response = [
                'success' => false,
                'error' => $result['error'],
            ];

            if (isset($result['available_balance'])) {
                $response['available_balance'] = $result['available_balance'];
            }
            if (isset($result['required_amount'])) {
                $response['required_amount'] = $result['required_amount'];
            }

            return response()->json($response, $status);
        }

        // Wallet boost — instant activation (no payment redirect needed)
        if ($paymentMethod === 'wallet') {
            return response()->json([
                'success' => true,
                'data' => [
                    'boost_id' => $result['boost']->id,
                    'amount' => $result['price'],
                    'paid_from' => 'wallet',
                    'plan' => isset($result['plan']) ? [
                        'id' => $result['plan']->id,
                        'type' => $result['plan']->type,
                        'name' => $result['plan']->name,
                        'price' => $result['plan']->price,
                        'duration_days' => $result['plan']->duration_days,
                    ] : null,
                    'boost_type' => $result['boost_type'] ?? null,
                    'duration_days' => $result['duration_days'] ?? null,
                    'balance_after' => $result['balance_after'] ?? null,
                    'message' => 'Boost activated successfully via wallet',
                ],
            ]);
        }

        // Paystack boost — redirect to payment
        $responseData = [
            'success' => true,
            'data' => [
                'payment_intent' => $result['payment_intent']->reference,
                'authorization_url' => $result['authorization_url'] ?? null,
                'access_code' => $result['access_code'] ?? null,
                'amount' => $result['price'],
                'duration_days' => $result['duration_days'] ?? null,
            ],
        ];

        if (isset($result['plan']) && $result['plan']) {
            $responseData['data']['plan'] = [
                'id' => $result['plan']->id,
                'type' => $result['plan']->type,
                'name' => $result['plan']->name,
                'price' => $result['plan']->price,
                'duration_days' => $result['plan']->duration_days,
            ];
        } else {
            $responseData['data']['boost_type'] = $result['boost_type'] ?? null;
        }

        return response()->json($responseData);
    }

    public function getBoostStatus(Request $request, int $id, BoostAdService $boostAdService)
    {
        $status = $boostAdService->getBoostStatus($id, $request->user()->id);

        if (isset($status['error'])) {
            return response()->json(['error' => $status['error']], 404);
        }

        return response()->json(['data' => $status]);
    }

    public function getBoostPrices(BoostTierService $tierService)
    {
        $plans = $tierService->getActivePlans();

        return response()->json([
            'data' => [
                'plans' => $plans,
                'prices' => collect($plans)->pluck('price', 'type')->toArray(),
            ],
        ]);
    }

    public function renewBoost(Request $request, int $id, BoostAdService $boostAdService)
    {
        $user = $request->user();

        $key = 'boost-renewal-attempts:' . $user->id;
        if (RateLimiter::tooManyAttempts($key, 5)) {
            return response()->json([
                'success' => false,
                'error' => 'Too many renewal attempts. Please try again in ' . RateLimiter::availableIn($key) . ' seconds.',
            ], 429);
        }
        RateLimiter::hit($key, 3600);

        $validated = $request->validate([
            'plan_type' => 'required|in:silver,gold,platinum',
            'payment_method' => 'sometimes|in:wallet,paystack',
        ]);

        $paymentMethod = $validated['payment_method'] ?? 'paystack';
        $result = $boostAdService->createPlanRenew($id, $user->id, $validated['plan_type'], $paymentMethod);

        if (!$result['success']) {
            $status = match ($result['code'] ?? '') {
                'ad_not_found' => 404,
                'ad_not_active' => 422,
                'insufficient_balance' => 402,
                'wallet_not_found' => 404,
                'invalid_plan' => 400,
                default => 400,
            };

            $response = [
                'success' => false,
                'error' => $result['error'],
            ];

            if (isset($result['available_balance'])) {
                $response['available_balance'] = $result['available_balance'];
            }
            if (isset($result['required_amount'])) {
                $response['required_amount'] = $result['required_amount'];
            }

            return response()->json($response, $status);
        }

        // Wallet renew — instant activation
        if ($paymentMethod === 'wallet') {
            return response()->json([
                'success' => true,
                'data' => [
                    'boost_id' => $result['boost']->id,
                    'amount' => $result['price'],
                    'paid_from' => 'wallet',
                    'plan' => [
                        'id' => $result['plan']->id,
                        'type' => $result['plan']->type,
                        'name' => $result['plan']->name,
                        'price' => $result['plan']->price,
                        'duration_days' => $result['plan']->duration_days,
                    ],
                    'balance_after' => $result['balance_after'] ?? null,
                    'message' => 'Boost renewed successfully via wallet',
                    'is_renewal' => true,
                ],
            ]);
        }

        // Paystack renew — redirect to payment
        return response()->json([
            'success' => true,
            'data' => [
                'payment_intent' => $result['payment_intent']->reference,
                'authorization_url' => $result['authorization_url'] ?? null,
                'access_code' => $result['access_code'] ?? null,
                'amount' => $result['price'],
                'plan' => [
                    'id' => $result['plan']->id,
                    'type' => $result['plan']->type,
                    'name' => $result['plan']->name,
                    'price' => $result['plan']->price,
                    'duration_days' => $result['plan']->duration_days,
                ],
                'is_renewal' => true,
            ],
        ]);
    }

    public function checkRenewal(Request $request, int $id, BoostAdService $boostService)
    {
        $result = $boostService->canRenewBoost($id, $request->user()->id);

        if (!$result['can_renew']) {
            return response()->json([
                'success' => false,
                'can_renew' => false,
                'reason' => $result['reason'],
            ], 400);
        }

        return response()->json([
            'success' => true,
            'can_renew' => true,
            'data' => $result,
        ]);
    }

    public function myBoosts(Request $request)
    {
        $user = $request->user();

        $boosts = BoostedAd::with(['ad.images', 'ad.category', 'ad.location'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($boost) {
                $ad = $boost->ad;
                if (!$ad) return null;

                $views = $ad->views ?? 0;
                $clicks = $ad->clicks_count ?? 0;
                $whatsappClicks = $ad->whatsapp_clicks ?? 0;
                $saves = $ad->favorites()->count();
                $ctr = $views > 0 ? round(($clicks + $whatsappClicks) / $views * 100, 2) : 0;

                $remainingSeconds = $boost->status === 'active' && $boost->end_time
                    ? max(0, now()->diffInSeconds($boost->end_time, false))
                    : 0;

                $remainingDays = $boost->status === 'active' && $boost->end_time
                    ? max(0, (int) now()->diffInDays($boost->end_time, false))
                    : 0;

                return [
                    'boost_id' => $boost->id,
                    'boost_type' => $boost->boost_type,
                    'boost_status' => $boost->status,
                    'boost_start_time' => $boost->start_time?->toISOString(),
                    'boost_end_time' => $boost->end_time?->toISOString(),
                    'boost_remaining_seconds' => $remainingSeconds,
                    'boost_remaining_days' => $remainingDays,
                    'payment_reference' => $boost->payment_reference,
                    'created_at' => $boost->created_at?->toISOString(),
                    'ad' => $ad ? [
                        'id' => $ad->id,
                        'title' => $ad->title,
                        'slug' => $ad->slug,
                        'price' => $ad->price,
                        'status' => $ad->status,
                        'state' => $ad->state,
                        'lga' => $ad->lga,
                        'images' => $ad->images->toArray(),
                        'category' => $ad->category ? ['id' => $ad->category->id, 'name' => $ad->category->name] : null,
                    ] : null,
                    'views_count' => $views,
                    'clicks_count' => $clicks,
                    'whatsapp_clicks' => $whatsappClicks,
                    'saves_count' => $saves,
                    'ctr' => $ctr,
                ];
            })
            ->filter()
            ->values();

        $active = $boosts->where('boost_status', 'active')->values();
        $expired = $boosts->where('boost_status', 'expired')->values();

        $topAd = null;
        $worstAd = null;
        if ($active->isNotEmpty()) {
            $topAd = $active->sortByDesc('ctr')->first();
            $worstAd = $active->sortBy('ctr')->first();
        } elseif ($boosts->isNotEmpty()) {
            $topAd = $boosts->sortByDesc('ctr')->first();
            $worstAd = $boosts->sortBy('ctr')->first();
        }

        return response()->json([
            'data' => [
                'boosts' => $boosts,
                'active_boosts' => $active,
                'expired_boosts' => $expired,
                'analytics' => [
                    'total_boosts' => $boosts->count(),
                    'active_count' => $active->count(),
                    'expired_count' => $expired->count(),
                    'top_performing_ad' => $topAd,
                    'worst_performing_ad' => $worstAd,
                    'total_views' => $boosts->sum('views_count'),
                    'total_clicks' => $boosts->sum('clicks_count') + $boosts->sum('whatsapp_clicks'),
                    'total_saves' => $boosts->sum('saves_count'),
                    'average_ctr' => $boosts->sum('views_count') > 0
                        ? round(($boosts->sum('clicks_count') + $boosts->sum('whatsapp_clicks')) / $boosts->sum('views_count') * 100, 2)
                        : 0,
                ],
                'prices' => app(BoostTierService::class)->getActivePlans(),
            ],
        ]);
    }

    public function trackClick(Request $request, int $id)
    {
        $ad = Ad::find($id);
        if (!$ad) {
            return response()->json(['error' => 'Ad not found'], 404);
        }

        $validated = $request->validate([
            'type' => 'required|in:phone,whatsapp',
        ]);

        if ($validated['type'] === 'whatsapp') {
            $ad->increment('whatsapp_clicks');
        } else {
            $ad->increment('clicks_count');
        }

        return response()->json(['success' => true]);
    }

    public function getShareLink(int $id, ShareService $shareService)
    {
        $ad = Ad::where('id', $id)->where('status', 'active')->first();

        if (!$ad) {
            return response()->json(['error' => 'Ad not found'], 404);
        }

        $shareData = $shareService->generateShareLink($ad);

        return response()->json([
            'data' => [
                'url' => $shareData['trackable_url'],
                'direct_url' => $shareData['direct_url'],
                'title' => $shareData['title'],
                'description' => $shareData['description'],
                'platforms' => [
                    'whatsapp' => $shareService->generateWhatsAppLink($ad),
                    'facebook' => $shareService->generateFacebookLink($ad),
                    'twitter' => $shareService->generateTwitterLink($ad),
                ],
            ],
        ]);
    }

    public function saveAd(Request $request, int $id, SavedAdService $savedAdService)
    {
        $result = $savedAdService->saveAd($request->user()->id, $id);

        if (!$result['success']) {
            $status = $result['code'] === 'already_saved' ? 409 : 404;

            return response()->json([
                'success' => false,
                'error' => $result['error'],
                'already_saved' => $result['already_saved'] ?? false,
            ], $status);
        }

        return response()->json([
            'success' => true,
            'message' => 'Ad saved successfully',
        ]);
    }

    public function unsaveAd(Request $request, int $id, SavedAdService $savedAdService)
    {
        $result = $savedAdService->unsaveAd($request->user()->id, $id);

        if (!$result['success']) {
            return response()->json(['error' => $result['error']], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Ad removed from saved',
        ]);
    }

    public function getSavedAds(Request $request, SavedAdService $savedAdService)
    {
        $limit = $request->input('limit', 20);
        $page = $request->input('page', 1);

        $result = $savedAdService->getSavedAds($request->user()->id, $limit, $page);

        return response()->json($result);
    }

    public function checkSavedStatus(Request $request, int $id, SavedAdService $savedAdService)
    {
        $isSaved = $savedAdService->isSaved($request->user()->id, $id);

        return response()->json(['data' => ['is_saved' => $isSaved]]);
    }

    public function getRecentlyViewed(Request $request, RecentlyViewedService $recentlyViewedService)
    {
        $limit = $request->input('limit', 10);

        $ads = $recentlyViewedService->getRecentlyViewed($request->user()->id, $limit);

        return response()->json([
            'data' => $ads,
        ]);
    }

    public function clearRecentlyViewed(Request $request, RecentlyViewedService $recentlyViewedService)
    {
        $recentlyViewedService->clearHistory($request->user()->id);

        return response()->json(['message' => 'Recently viewed cleared']);
    }

    public function postSubmissionBoost(Request $request, int $id, BoostAdService $boostAdService, PaymentService $paymentService)
    {
        $user = $request->user();

        $validated = $request->validate([
            'plan_type' => 'required|in:silver,gold,platinum',
            'payment_method' => 'sometimes|in:wallet,paystack',
        ]);

        $paymentMethod = $validated['payment_method'] ?? 'paystack';

        $ad = \App\Models\Ad::where('id', $id)->where('user_id', $user->id)->first();

        if (!$ad) {
            return response()->json([
                'success' => false,
                'error' => 'Ad not found or unauthorized',
            ], 404);
        }

        $plan = \App\Models\BoostPlan::where('type', $validated['plan_type'])->where('is_active', true)->first();

        if (!$plan) {
            return response()->json([
                'success' => false,
                'error' => 'Invalid or inactive boost plan',
            ], 400);
        }

        $price = (float) $plan->price;
        $durationDays = $plan->duration_days;

        if ($paymentMethod === 'wallet') {
            $wallet = \App\Models\Wallet::where('user_id', $user->id)->first();

            if (!$wallet) {
                return response()->json(['success' => false, 'error' => 'Wallet not found'], 404);
            }

            if ($wallet->available_balance < $price) {
                return response()->json([
                    'success' => false,
                    'error' => 'Insufficient wallet balance. Available: ₦' . number_format($wallet->available_balance, 2) . ', Required: ₦' . number_format($price, 2),
                    'available_balance' => $wallet->available_balance,
                    'required_amount' => $price,
                ], 402);
            }

            $reference = 'WLB' . date('Ymd') . strtoupper(\Illuminate\Support\Str::random(10));

            $boost = \App\Models\BoostedAd::create([
                'ad_id' => $ad->id,
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'boost_type' => $plan->type,
                'priority_score' => $plan->priority_score,
                'start_time' => $ad->status === 'active' ? now() : null,
                'end_time' => $ad->status === 'active' ? now()->addDays($durationDays) : null,
                'status' => $ad->status === 'active' ? 'active' : 'pending_payment',
                'payment_reference' => $reference,
                'paid_from' => 'wallet',
            ]);

            if ($ad->status === 'active') {
                event(new \App\Events\AdBoosted($boost));
            }

            if ($ad->status !== 'active') {
                $ad->update(['status' => 'active']);
                $boost->update([
                    'status' => 'active',
                    'start_time' => now(),
                    'end_time' => now()->addDays($durationDays),
                ]);
                event(new \App\Events\AdBoosted($boost));
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'boost_id' => $boost->id,
                    'amount' => $price,
                    'paid_from' => 'wallet',
                    'plan' => [
                        'id' => $plan->id,
                        'type' => $plan->type,
                        'name' => $plan->name,
                        'price' => $plan->price,
                        'duration_days' => $plan->duration_days,
                    ],
                    'message' => 'Boost activated successfully',
                ],
            ]);
        }

        // Paystack flow
        $result = $paymentService->initializePayment([
            'user_id' => $user->id,
            'ad_id' => $ad->id,
            'amount' => $price,
            'currency' => 'NGN',
            'type' => 'boost',
            'email' => $user->email ?? '',
            'metadata' => [
                'action' => 'post_submission_boost',
                'plan_type' => $plan->type,
                'plan_id' => $plan->id,
                'duration_days' => $durationDays,
                'ad_pending' => $ad->status !== 'active',
            ],
        ]);

        if (!$result['success']) {
            return response()->json($result, 400);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'payment_intent' => $result['payment_intent']->reference,
                'authorization_url' => $result['authorization_url'] ?? null,
                'access_code' => $result['access_code'] ?? null,
                'amount' => $price,
                'plan' => [
                    'id' => $plan->id,
                    'type' => $plan->type,
                    'name' => $plan->name,
                    'price' => $plan->price,
                    'duration_days' => $plan->duration_days,
                ],
            ],
        ]);
    }
}
