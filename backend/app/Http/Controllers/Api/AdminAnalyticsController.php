<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminAnalyticsController extends Controller
{
    protected AnalyticsService $analytics;

    public function __construct(AnalyticsService $analytics)
    {
        $this->analytics = $analytics;
    }

    public function summary(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        return response()->json([
            'data' => $this->analytics->getSummary($startDate, $endDate),
        ]);
    }

    public function trends(Request $request)
    {
        $validated = $request->validate([
            'metric' => 'required|in:ad_views,ad_clicks,ad_shares,ad_saves,boost_conversions,payments_successful,payments_failed,revenue',
            'days' => 'integer|min:1|max:365',
        ]);

        return response()->json([
            'data' => $this->analytics->getTrends(
                $validated['metric'],
                $validated['days'] ?? 30
            ),
        ]);
    }

    public function revenueBreakdown(Request $request)
    {
        $days = $request->input('days', 30);

        return response()->json([
            'data' => $this->analytics->getRevenueBreakdown($days),
        ]);
    }
}
