<?php

namespace App\Services;

use App\Models\DailyAnalytic;
use App\Models\PaymentIntent;
use App\Models\BoostedAd;
use App\Models\Ad;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AnalyticsService
{
    protected const METRIC_TYPES = [
        'ad_views',
        'ad_clicks',
        'ad_shares',
        'ad_saves',
        'boost_conversions',
        'boost_expires',
        'payments_successful',
        'payments_failed',
        'revenue',
        'ads_created',
        'ads_approved',
        'ads_rejected',
    ];

    public function increment(string $metricType, int $value = 1, ?string $date = null): void
    {
        if (!in_array($metricType, self::METRIC_TYPES)) {
            Log::warning('Invalid metric type attempted', ['metric' => $metricType]);
            return;
        }

        $targetDate = $date ?? now()->toDateString();

        DB::table('daily_analytics')->updateOrInsert(
            ['date' => $targetDate, 'metric_type' => $metricType],
            ['value' => DB::raw('COALESCE(value, 0) + ' . (int) $value)]
        );
    }

    public function recordRevenue(float $amount, ?string $date = null): void
    {
        $targetDate = $date ?? now()->toDateString();

        DB::table('daily_analytics')->updateOrInsert(
            ['date' => $targetDate, 'metric_type' => 'revenue'],
            ['value' => DB::raw('COALESCE(value, 0) + ' . (int) ($amount * 100))]
        );
    }

    public function getSummary(?string $startDate = null, ?string $endDate = null): array
    {
        $start = $startDate ? now()->parse($startDate) : now()->subDays(30);
        $end = $endDate ? now()->parse($endDate) : now();

        $metrics = DailyAnalytic::whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->get()
            ->groupBy('metric_type')
            ->map(function ($items) {
                return $items->sum('value');
            })
            ->toArray();

        $revenue = ($metrics['revenue'] ?? 0) / 100;

        $totalPayments = PaymentIntent::whereBetween('created_at', [$start, $end])->count();
        $paidPayments = PaymentIntent::whereBetween('created_at', [$start, $end])->where('status', 'paid')->count();
        $failedPayments = PaymentIntent::whereBetween('created_at', [$start, $end])->where('status', 'failed')->count();

        $totalAds = Ad::whereBetween('created_at', [$start, $end])->count();
        $activeAds = Ad::where('status', 'active')->count();

        $totalBoosts = BoostedAd::whereBetween('created_at', [$start, $end])->count();
        $activeBoosts = BoostedAd::active()->count();

        $conversionRate = $totalBoosts > 0 ? round(($paidPayments / $totalPayments) * 100, 1) : 0;

        return [
            'period' => [
                'start' => $start->toDateString(),
                'end' => $end->toDateString(),
            ],
            'revenue' => [
                'total' => $revenue,
                'currency' => 'NGN',
            ],
            'payments' => [
                'total' => $totalPayments,
                'paid' => $paidPayments,
                'failed' => $failedPayments,
                'pending' => $totalPayments - $paidPayments - $failedPayments,
            ],
            'ads' => [
                'new_in_period' => $totalAds,
                'currently_active' => $activeAds,
            ],
            'boosts' => [
                'total_in_period' => $totalBoosts,
                'currently_active' => $activeBoosts,
                'conversion_rate' => $conversionRate,
            ],
            'engagement' => [
                'views' => $metrics['ad_views'] ?? 0,
                'shares' => $metrics['ad_shares'] ?? 0,
                'saves' => $metrics['ad_saves'] ?? 0,
                'boost_conversions' => $metrics['boost_conversions'] ?? 0,
            ],
        ];
    }

    public function getTrends(string $metricType, int $days = 30): array
    {
        if (!in_array($metricType, self::METRIC_TYPES)) {
            return ['error' => 'Invalid metric type'];
        }

        $startDate = now()->subDays($days)->toDateString();

        $trends = DailyAnalytic::where('metric_type', $metricType)
            ->where('date', '>=', $startDate)
            ->orderBy('date')
            ->get();

        $fullRange = [];
        $current = now()->subDays($days);
        $end = now();

        while ($current <= $end) {
            $dateStr = $current->toDateString();
            $matching = $trends->firstWhere('date', $dateStr);
            $fullRange[] = [
                'date' => $dateStr,
                'value' => $matching ? $matching->value : 0,
            ];
            $current->addDay();
        }

        $values = array_column($fullRange, 'value');
        $total = array_sum($values);
        $avg = count($values) > 0 ? round($total / count($values), 2) : 0;
        $max = !empty($values) ? max($values) : 0;

        return [
            'metric' => $metricType,
            'period_days' => $days,
            'total' => $total,
            'average' => $avg,
            'peak' => $max,
            'data' => $fullRange,
        ];
    }

    public function getRevenueBreakdown(int $days = 30): array
    {
        $startDate = now()->subDays($days)->toDateString();

        $boostRevenue = PaymentIntent::where('type', 'boost')
            ->where('status', 'paid')
            ->where('created_at', '>=', $startDate)
            ->sum('amount');

        $dailyRevenue = DailyAnalytic::where('metric_type', 'revenue')
            ->where('date', '>=', $startDate)
            ->orderBy('date')
            ->get()
            ->map(fn($d) => [
                'date' => $d->date,
                'amount' => $d->value / 100,
            ]);

        $boostCount = BoostedAd::where('created_at', '>=', $startDate)->count();

        return [
            'period_days' => $days,
            'total_revenue' => $boostRevenue,
            'currency' => 'NGN',
            'total_boosts_sold' => $boostCount,
            'average_boost_price' => $boostCount > 0 ? round($boostRevenue / $boostCount, 2) : 0,
            'daily_breakdown' => $dailyRevenue,
        ];
    }
}
