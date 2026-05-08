<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Models\BoostedAd;
use App\Services\BoostAdService;
use App\Services\PaymentService;
use App\Services\SavedAdService;
use App\Services\RecentlyViewedService;
use App\Services\ShareService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;

class GrowthController extends Controller
{
    public function boostAd(Request $request, int $id, BoostAdService $boostService, PaymentService $paymentService)
    {
        $user = $request->user();

        // Rate limit: max 5 boost attempts per hour per user
        $key = 'boost-attempts:' . $user->id;
        if (RateLimiter::tooManyAttempts($key, 5)) {
            return response()->json([
                'success' => false,
                'error' => 'Too many boost attempts. Please try again in ' . RateLimiter::availableIn($key) . ' seconds.',
            ], 429);
        }
        RateLimiter::hit($key, 3600);

        $validated = $request->validate([
            'boost_type' => 'required|in:top,featured,highlight',
            'duration_days' => 'required|integer|in:1,3,7,14,30',
        ]);

        $result = $boostService->createBoost(
            $id,
            $request->user()->id,
            $validated['boost_type'],
            $validated['duration_days']
        );

        if (!$result['success']) {
            $status = match ($result['code'] ?? '') {
                'ad_not_found' => 404,
                'ad_not_active' => 422,
                default => 400,
            };

            return response()->json([
                'success' => false,
                'error' => $result['error'],
            ], $status);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'payment_intent' => $result['payment_intent']->reference,
                'authorization_url' => $result['authorization_url'] ?? null,
                'access_code' => $result['access_code'] ?? null,
                'amount' => $result['price'],
                'boost_type' => $result['boost_type'],
                'duration_days' => $result['duration_days'],
            ],
        ]);
    }

    public function getBoostStatus(Request $request, int $id, BoostAdService $boostService)
    {
        $status = $boostService->getBoostStatus($id, $request->user()->id);

        if (isset($status['error'])) {
            return response()->json(['error' => $status['error']], 404);
        }

        return response()->json(['data' => $status]);
    }

    public function getBoostPrices(BoostAdService $boostService)
    {
        return response()->json([
            'data' => [
                'prices' => $boostService->getBoostPrices(),
                'durations' => $boostService->getAvailableDurations(),
                'examples' => [
                    ['type' => 'top', 'days' => 7, 'price' => $boostService->calculatePrice('top', 7)],
                    ['type' => 'featured', 'days' => 7, 'price' => $boostService->calculatePrice('featured', 7)],
                    ['type' => 'highlight', 'days' => 7, 'price' => $boostService->calculatePrice('highlight', 7)],
                ],
            ],
        ]);
    }

    public function renewBoost(Request $request, int $id, BoostAdService $boostService)
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
            'boost_type' => 'required|in:top,featured,highlight',
            'duration_days' => 'required|integer|in:1,3,7,14,30',
        ]);

        $result = $boostService->renewBoost(
            $id,
            $user->id,
            $validated['boost_type'],
            $validated['duration_days']
        );

        if (!$result['success']) {
            $status = match ($result['code'] ?? '') {
                'ad_not_found' => 404,
                'ad_not_active' => 422,
                default => 400,
            };

            return response()->json([
                'success' => false,
                'error' => $result['error'],
            ], $status);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'payment_intent' => $result['payment_intent']->reference,
                'authorization_url' => $result['authorization_url'] ?? null,
                'access_code' => $result['access_code'] ?? null,
                'amount' => $result['price'],
                'boost_type' => $result['boost_type'],
                'duration_days' => $result['duration_days'],
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
                'prices' => app(BoostAdService::class)->getBoostPrices(),
                'durations' => app(BoostAdService::class)->getAvailableDurations(),
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
}
