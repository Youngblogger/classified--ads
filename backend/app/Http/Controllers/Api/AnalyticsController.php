<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Models\AdAnalytic;
use App\Models\Store;
use App\Models\StoreAnalytic;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function overview(Request $request)
    {
        try {
            $period = $request->get('period', '30d');
            $endDate = now()->toDateString();
            $startDate = match($period) {
                '7d' => now()->subDays(7)->toDateString(),
                '90d' => now()->subDays(90)->toDateString(),
                'all' => '2020-01-01',
                default => now()->subDays(30)->toDateString(),
            };

            $adIds = Ad::where('user_id', $request->user()->id)->pluck('id');

            $totalAds = Ad::where('user_id', $request->user()->id)->count();
            $activeAds = Ad::where('user_id', $request->user()->id)->where('status', 'active')->count();

            if ($adIds->isEmpty()) {
                return response()->json([
                    'total_views' => 0, 'total_unique_views' => 0, 'total_favorites' => 0,
                    'total_messages' => 0, 'total_phone_clicks' => 0, 'total_whatsapp_clicks' => 0,
                    'total_shares' => 0, 'total_ads' => $totalAds, 'active_ads' => $activeAds,
                    'ctr' => 0, 'engagement_rate' => 0,
                ]);
            }

            $stats = AdAnalytic::whereIn('ad_id', $adIds)
                ->whereBetween('date', [$startDate, $endDate])
                ->selectRaw('
                    COALESCE(SUM(views), 0) as total_views,
                    COALESCE(SUM(unique_views), 0) as total_unique_views,
                    COALESCE(SUM(favorites), 0) as total_favorites,
                    COALESCE(SUM(messages), 0) as total_messages,
                    COALESCE(SUM(phone_clicks), 0) as total_phone_clicks,
                    COALESCE(SUM(whatsapp_clicks), 0) as total_whatsapp_clicks,
                    COALESCE(SUM(shares), 0) as total_shares
                ')
                ->first();

            $totalClicks = $stats->total_phone_clicks + $stats->total_whatsapp_clicks;

            return response()->json([
                'total_views' => (int) $stats->total_views,
                'total_unique_views' => (int) $stats->total_unique_views,
                'total_favorites' => (int) $stats->total_favorites,
                'total_messages' => (int) $stats->total_messages,
                'total_phone_clicks' => (int) $stats->total_phone_clicks,
                'total_whatsapp_clicks' => (int) $stats->total_whatsapp_clicks,
                'total_shares' => (int) $stats->total_shares,
                'total_ads' => $totalAds,
                'active_ads' => $activeAds,
                'ctr' => $stats->total_views > 0 ? round(($totalClicks / $stats->total_views) * 100, 2) : 0,
                'engagement_rate' => $stats->total_views > 0 ? round((($stats->total_favorites + $stats->total_messages) / $stats->total_views) * 100, 2) : 0,
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Analytics overview failed: ' . $e->getMessage());
            return response()->json([
                'total_views' => 0, 'total_unique_views' => 0, 'total_favorites' => 0,
                'total_messages' => 0, 'total_phone_clicks' => 0, 'total_whatsapp_clicks' => 0,
                'total_shares' => 0, 'total_ads' => 0, 'active_ads' => 0,
                'ctr' => 0, 'engagement_rate' => 0,
            ]);
        }
    }

    public function adPerformance(Request $request)
    {
        $period = $request->get('period', '30d');
        $endDate = now()->toDateString();
        $startDate = match($period) {
            '7d' => now()->subDays(7)->toDateString(),
            '90d' => now()->subDays(90)->toDateString(),
            'all' => '2020-01-01',
            default => now()->subDays(30)->toDateString(),
        };

        $userId = $request->user()->id;

        $ads = AdAnalytic::join('ads', 'ad_analytics.ad_id', '=', 'ads.id')
            ->where('ads.user_id', $userId)
            ->whereBetween('ad_analytics.date', [$startDate, $endDate])
            ->selectRaw('
                ads.id, ads.title, ads.slug, ads.price, ads.status, ads.created_at,
                COALESCE(SUM(ad_analytics.views), 0) as total_views,
                COALESCE(SUM(ad_analytics.unique_views), 0) as total_unique_views,
                COALESCE(SUM(ad_analytics.favorites), 0) as total_favorites,
                COALESCE(SUM(ad_analytics.messages), 0) as total_messages,
                COALESCE(SUM(ad_analytics.phone_clicks), 0) as total_phone_clicks,
                COALESCE(SUM(ad_analytics.whatsapp_clicks), 0) as total_whatsapp_clicks,
                COALESCE(SUM(ad_analytics.shares), 0) as total_shares
            ')
            ->groupBy('ads.id', 'ads.title', 'ads.slug', 'ads.price', 'ads.status', 'ads.created_at')
            ->orderByDesc('total_views')
            ->paginate(10);

        return response()->json($ads);
    }

    public function singleAdPerformance(Request $request, $adId)
    {
        $period = $request->get('period', '30d');
        $endDate = now()->toDateString();
        $startDate = match($period) {
            '7d' => now()->subDays(7)->toDateString(),
            '90d' => now()->subDays(90)->toDateString(),
            'all' => '2020-01-01',
            default => now()->subDays(30)->toDateString(),
        };

        $ad = Ad::where('id', $adId)->where('user_id', $request->user()->id)->firstOrFail();

        $stats = AdAnalytic::where('ad_id', $adId)
            ->whereBetween('date', [$startDate, $endDate])
            ->selectRaw('
                COALESCE(SUM(views), 0) as total_views,
                COALESCE(SUM(unique_views), 0) as total_unique_views,
                COALESCE(SUM(favorites), 0) as total_favorites,
                COALESCE(SUM(messages), 0) as total_messages,
                COALESCE(SUM(phone_clicks), 0) as total_phone_clicks,
                COALESCE(SUM(whatsapp_clicks), 0) as total_whatsapp_clicks,
                COALESCE(SUM(shares), 0) as total_shares
            ')
            ->first();

        $daily = AdAnalytic::where('ad_id', $adId)
            ->whereBetween('date', [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date')
            ->selectRaw('
                date,
                SUM(views) as views,
                SUM(unique_views) as unique_views,
                SUM(favorites) as favorites,
                SUM(messages) as messages,
                SUM(phone_clicks) as phone_clicks,
                SUM(whatsapp_clicks) as whatsapp_clicks,
                SUM(shares) as shares
            ')
            ->get();

        $totalClicks = $stats->total_phone_clicks + $stats->total_whatsapp_clicks;

        return response()->json([
            'ad' => [
                'id' => $ad->id,
                'title' => $ad->title,
                'slug' => $ad->slug,
                'price' => $ad->price,
                'status' => $ad->status,
            ],
            'stats' => [
                'total_views' => (int) $stats->total_views,
                'total_unique_views' => (int) $stats->total_unique_views,
                'total_favorites' => (int) $stats->total_favorites,
                'total_messages' => (int) $stats->total_messages,
                'total_phone_clicks' => (int) $stats->total_phone_clicks,
                'total_whatsapp_clicks' => (int) $stats->total_whatsapp_clicks,
                'total_shares' => (int) $stats->total_shares,
                'ctr' => $stats->total_views > 0 ? round(($totalClicks / $stats->total_views) * 100, 2) : 0,
            ],
            'daily' => $daily,
        ]);
    }

    public function dailyBreakdown(Request $request)
    {
        $period = $request->get('period', '30d');
        $endDate = now()->toDateString();
        $startDate = match($period) {
            '7d' => now()->subDays(7)->toDateString(),
            '90d' => now()->subDays(90)->toDateString(),
            'all' => '2020-01-01',
            default => now()->subDays(30)->toDateString(),
        };

        $adIds = Ad::where('user_id', $request->user()->id)->pluck('id');

        if ($adIds->isEmpty()) {
            return response()->json([]);
        }

        $daily = AdAnalytic::whereIn('ad_id', $adIds)
            ->whereBetween('date', [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date')
            ->selectRaw('
                date,
                SUM(views) as views,
                SUM(unique_views) as unique_views,
                SUM(favorites) as favorites,
                SUM(messages) as messages,
                SUM(phone_clicks) as phone_clicks,
                SUM(whatsapp_clicks) as whatsapp_clicks,
                SUM(shares) as shares
            ')
            ->get();

        return response()->json($daily);
    }

    public function trends(Request $request)
    {
        $period = $request->get('period', '30d');
        $endDate = now()->toDateString();
        $startDate = match($period) {
            '7d' => now()->subDays(7)->toDateString(),
            '90d' => now()->subDays(90)->toDateString(),
            'all' => '2020-01-01',
            default => now()->subDays(30)->toDateString(),
        };
        $previousStart = match($period) {
            '7d' => now()->subDays(14)->toDateString(),
            '90d' => now()->subDays(180)->toDateString(),
            'all' => null,
            default => now()->subDays(60)->toDateString(),
        };
        $previousEnd = now()->subDays($period === '90d' ? 91 : ($period === '7d' ? 8 : 31))->toDateString();

        $adIds = Ad::where('user_id', $request->user()->id)->pluck('id');

        if ($adIds->isEmpty()) {
            return response()->json([
                'current' => [],
                'previous' => [],
                'changes' => [],
            ]);
        }

        $currentStats = AdAnalytic::whereIn('ad_id', $adIds)
            ->whereBetween('date', [$startDate, $endDate])
            ->selectRaw('
                COALESCE(SUM(views), 0) as total_views,
                COALESCE(SUM(unique_views), 0) as total_unique_views,
                COALESCE(SUM(favorites), 0) as total_favorites,
                COALESCE(SUM(messages), 0) as total_messages,
                COALESCE(SUM(phone_clicks), 0) as total_phone_clicks,
                COALESCE(SUM(whatsapp_clicks), 0) as total_whatsapp_clicks,
                COALESCE(SUM(shares), 0) as total_shares
            ')
            ->first();

        $previousStats = null;
        if ($previousStart) {
            $previousStats = AdAnalytic::whereIn('ad_id', $adIds)
                ->whereBetween('date', [$previousStart, $previousEnd])
                ->selectRaw('
                    COALESCE(SUM(views), 0) as total_views,
                    COALESCE(SUM(unique_views), 0) as total_unique_views,
                    COALESCE(SUM(favorites), 0) as total_favorites,
                    COALESCE(SUM(messages), 0) as total_messages,
                    COALESCE(SUM(phone_clicks), 0) as total_phone_clicks,
                    COALESCE(SUM(whatsapp_clicks), 0) as total_whatsapp_clicks,
                    COALESCE(SUM(shares), 0) as total_shares
                ')
                ->first();
        }

        $metrics = ['total_views', 'total_unique_views', 'total_favorites', 'total_messages', 'total_phone_clicks', 'total_whatsapp_clicks', 'total_shares'];
        $changes = [];

        foreach ($metrics as $metric) {
            $current = (int) $currentStats->$metric;
            $previous = $previousStats ? (int) $previousStats->$metric : 0;
            $changes[$metric] = $previous > 0 ? round((($current - $previous) / $previous) * 100, 2) : ($current > 0 ? 100 : 0);
        }

        return response()->json([
            'current' => [
                'total_views' => (int) $currentStats->total_views,
                'total_unique_views' => (int) $currentStats->total_unique_views,
                'total_favorites' => (int) $currentStats->total_favorites,
                'total_messages' => (int) $currentStats->total_messages,
                'total_phone_clicks' => (int) $currentStats->total_phone_clicks,
                'total_whatsapp_clicks' => (int) $currentStats->total_whatsapp_clicks,
                'total_shares' => (int) $currentStats->total_shares,
            ],
            'previous' => $previousStats ? [
                'total_views' => (int) $previousStats->total_views,
                'total_unique_views' => (int) $previousStats->total_unique_views,
                'total_favorites' => (int) $previousStats->total_favorites,
                'total_messages' => (int) $previousStats->total_messages,
                'total_phone_clicks' => (int) $previousStats->total_phone_clicks,
                'total_whatsapp_clicks' => (int) $previousStats->total_whatsapp_clicks,
                'total_shares' => (int) $previousStats->total_shares,
            ] : null,
            'changes' => $changes,
        ]);
    }

    public function topAds(Request $request)
    {
        try {
            $userId = $request->user()->id;

            $topAds = AdAnalytic::getTopPerforming($userId, 5);

            $adIds = $topAds->pluck('id');

            $ads = Ad::with('images')->whereIn('id', $adIds)->get()->keyBy('id');

            $result = $topAds->map(function ($item) use ($ads) {
                $ad = $ads->get($item->id);
                $image = $ad && $ad->images->first() ? $ad->images->first()->display_url : null;

                return [
                    'id' => $item->id,
                    'title' => $item->title,
                    'slug' => $item->slug,
                    'price' => $item->price,
                    'image' => $image,
                    'total_views' => (int) $item->total_views,
                    'total_unique_views' => (int) $item->total_unique_views,
                    'total_favorites' => (int) $item->total_favorites,
                    'total_messages' => (int) $item->total_messages,
                    'total_phone_clicks' => (int) $item->total_phone_clicks,
                    'total_whatsapp_clicks' => (int) $item->total_whatsapp_clicks,
                    'total_shares' => (int) $item->total_shares,
                ];
            });

            return response()->json($result);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Analytics top ads failed: ' . $e->getMessage());
            return response()->json([]);
        }
    }

    public function storePerformance(Request $request)
    {
        try {
            $store = Store::where('user_id', $request->user()->id)->first();

            if (!$store) {
                return response()->json([
                    'success' => false,
                    'message' => 'No store found',
                ], 404);
            }

            $period = $request->get('period', '30d');
            $endDate = now()->toDateString();
            $startDate = match($period) {
                '7d' => now()->subDays(7)->toDateString(),
                '90d' => now()->subDays(90)->toDateString(),
                'all' => '2020-01-01',
                default => now()->subDays(30)->toDateString(),
            };

            $stats = StoreAnalytic::where('store_id', $store->id)
                ->whereBetween('date', [$startDate, $endDate])
                ->selectRaw('
                    COALESCE(SUM(views), 0) as total_views,
                    COALESCE(SUM(unique_visitors), 0) as total_unique_visitors,
                    COALESCE(SUM(contact_clicks), 0) as total_contact_clicks,
                    COALESCE(SUM(whatsapp_clicks), 0) as total_whatsapp_clicks,
                    COALESCE(SUM(phone_clicks), 0) as total_phone_clicks
                ')
                ->first();

            $daily = StoreAnalytic::where('store_id', $store->id)
                ->whereBetween('date', [$startDate, $endDate])
                ->groupBy('date')
                ->orderBy('date')
                ->selectRaw('
                    date,
                    SUM(views) as views,
                    SUM(unique_visitors) as unique_visitors,
                    SUM(contact_clicks) as contact_clicks,
                    SUM(whatsapp_clicks) as whatsapp_clicks,
                    SUM(phone_clicks) as phone_clicks
                ')
                ->get();

            return response()->json([
                'store' => [
                    'id' => $store->id,
                    'name' => $store->name,
                    'slug' => $store->slug,
                    'followers_count' => $store->followers_count,
                    'active_ads_count' => $store->active_ads_count,
                ],
                'stats' => [
                    'total_views' => (int) $stats->total_views,
                    'total_unique_visitors' => (int) $stats->total_unique_visitors,
                    'total_contact_clicks' => (int) $stats->total_contact_clicks,
                    'total_whatsapp_clicks' => (int) $stats->total_whatsapp_clicks,
                    'total_phone_clicks' => (int) $stats->total_phone_clicks,
                ],
                'daily' => $daily,
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Analytics store performance failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'No store found',
            ], 404);
        }
    }

    public function recordView(Request $request, $adId)
    {
        $ad = Ad::find($adId);

        if (!$ad) {
            return response()->json([
                'success' => false,
                'message' => 'Ad not found',
            ], 404);
        }

        AdAnalytic::recordView($adId);

        return response()->json([
            'success' => true,
            'message' => 'View recorded',
        ]);
    }

    public function recordClick(Request $request, $adId)
    {
        $request->validate([
            'type' => 'required|in:phone,whatsapp',
        ]);

        $ad = Ad::find($adId);

        if (!$ad) {
            return response()->json([
                'success' => false,
                'message' => 'Ad not found',
            ], 404);
        }

        if ($request->type === 'phone') {
            AdAnalytic::recordPhoneClick($adId);
        } else {
            AdAnalytic::recordWhatsAppClick($adId);
        }

        return response()->json([
            'success' => true,
            'message' => 'Click recorded',
        ]);
    }

    public function recordShare(Request $request, $adId)
    {
        $ad = Ad::find($adId);

        if (!$ad) {
            return response()->json([
                'success' => false,
                'message' => 'Ad not found',
            ], 404);
        }

        AdAnalytic::recordShare($adId);

        return response()->json([
            'success' => true,
            'message' => 'Share recorded',
        ]);
    }
}
