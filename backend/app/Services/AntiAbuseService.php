<?php

namespace App\Services;

use App\Models\Ad;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AntiAbuseService
{
    private const CACHE_PREFIX = 'abuse:';

    // Ad posting limits
    const MAX_ADS_PER_DAY = 10;
    const MAX_ADS_PER_HOUR = 5;
    const MAX_ADS_SAME_CATEGORY_PER_DAY = 3;
    const MIN_TIME_BETWEEN_ADS = 60;

    // Boost fraud limits
    const MAX_BOOSTS_PER_DAY = 5;
    const MAX_BOOST_AMOUNT_PER_DAY = 100000;

    // Message limits
    const MAX_MESSAGES_PER_MINUTE = 20;
    const MAX_CONVERSATIONS_PER_HOUR = 10;

    public function checkAdPostingLimit(int $userId): array
    {
        $today = now()->startOfDay();
        $hourAgo = now()->subHour();
        $minuteAgo = now()->subSeconds(self::MIN_TIME_BETWEEN_ADS);

        $counts = [
            'today' => Ad::where('user_id', $userId)->where('created_at', '>=', $today)->count(),
            'hour' => Ad::where('user_id', $userId)->where('created_at', '>=', $hourAgo)->count(),
            'recent' => Ad::where('user_id', $userId)->where('created_at', '>=', $minuteAgo)->count(),
        ];

        $errors = [];

        if ($counts['today'] >= self::MAX_ADS_PER_DAY) {
            $errors[] = 'You have reached the maximum number of ads per day (' . self::MAX_ADS_PER_DAY . ').';
        }
        if ($counts['hour'] >= self::MAX_ADS_PER_HOUR) {
            $errors[] = 'You are posting too frequently. Maximum ' . self::MAX_ADS_PER_HOUR . ' ads per hour.';
        }
        if ($counts['recent'] > 0) {
            $errors[] = 'Please wait ' . self::MIN_TIME_BETWEEN_ADS . ' seconds between ad posts.';
        }

        return [
            'allowed' => empty($errors),
            'errors' => $errors,
            'counts' => $counts,
            'throttle_until' => $counts['recent'] > 0
                ? now()->addSeconds(self::MIN_TIME_BETWEEN_ADS)->timestamp
                : null,
        ];
    }

    public function checkDuplicateAd(int $userId, string $title, ?string $description, ?int $excludeAdId = null): bool
    {
        $title = trim(strtolower($title));
        $description = trim(strip_tags($description ?? ''));

        $similarTitleThreshold = 85;
        $recentAds = Ad::where('user_id', $userId)
            ->where('created_at', '>=', now()->subDays(30))
            ->when($excludeAdId, fn($q) => $q->where('id', '!=', $excludeAdId))
            ->select('id', 'title', 'description')
            ->get();

        foreach ($recentAds as $existing) {
            $existingTitle = trim(strtolower($existing->title));
            similar_text($title, $existingTitle, $titleSimilarity);

            if ($titleSimilarity >= $similarTitleThreshold) {
                Log::warning('Duplicate ad detected', [
                    'user_id' => $userId,
                    'existing_ad_id' => $existing->id,
                    'new_title' => $title,
                    'similarity' => $titleSimilarity,
                ]);
                return true;
            }

            if (!empty($description) && !empty($existing->description)) {
                $existingDesc = trim(strip_tags($existing->description));
                similar_text($description, $existingDesc, $descSimilarity);
                if ($titleSimilarity >= 70 && $descSimilarity >= 80) {
                    Log::warning('Duplicate ad detected by description', [
                        'user_id' => $userId,
                        'existing_ad_id' => $existing->id,
                        'similarity' => $descSimilarity,
                    ]);
                    return true;
                }
            }
        }

        return false;
    }

    public function checkBoostFraud(int $userId, float $amount, string $planType): array
    {
        $today = now()->startOfDay();
        $hourAgo = now()->subHour();

        $recentBoosts = DB::table('boosted_ads')
            ->where('user_id', $userId)
            ->where('created_at', '>=', $today)
            ->get();

        $boostCountToday = $recentBoosts->count();
        $totalAmountToday = $recentBoosts->sum('amount_paid');

        $user = User::find($userId);
        $accountAge = $user ? now()->diffInDays($user->created_at) : 0;

        $warnings = [];

        if ($boostCountToday >= self::MAX_BOOSTS_PER_DAY) {
            $warnings[] = 'Maximum boost purchases per day reached (' . self::MAX_BOOSTS_PER_DAY . ').';
        }

        if (($totalAmountToday + $amount) > self::MAX_BOOST_AMOUNT_PER_DAY) {
            $warnings[] = 'Daily boost spending limit exceeded.';
        }

        if ($accountAge < 1 && $amount > 10000) {
            $warnings[] = 'New account large boost flagged for review.';
        }

        $ip = request()->ip();
        $ipBoostCount = DB::table('boosted_ads')
            ->join('users', 'boosted_ads.user_id', '=', 'users.id')
            ->where('boosted_ads.created_at', '>=', $hourAgo)
            ->where('boosted_ads.amount_paid', '>=', $amount * 0.8)
            ->count();

        if ($ipBoostCount > 3) {
            $warnings[] = 'Unusual boost activity detected from this network.';
        }

        return [
            'allowed' => empty($warnings),
            'warnings' => $warnings,
        ];
    }

    public function checkRateLimit(string $action, string $key, int $maxAttempts, int $decaySeconds): bool
    {
        $cacheKey = self::CACHE_PREFIX . "{$action}:{$key}";
        $attempts = (int) Cache::get($cacheKey, 0);

        if ($attempts >= $maxAttempts) {
            return false;
        }

        Cache::put($cacheKey, $attempts + 1, $decaySeconds);
        return true;
    }

    public function isSuspiciousActivity(User $user, string $action, array $context = []): bool
    {
        $score = 0;

        if ($user->created_at->diffInHours(now()) < 1) $score += 20;
        if (empty($user->email_verified_at)) $score += 15;
        if (empty($user->phone)) $score += 5;
        if ($user->ads()->count() === 0 && in_array($action, ['boost', 'message'])) $score += 10;

        $recentFailures = Cache::get(self::CACHE_PREFIX . 'failures:' . $user->id, 0);
        $score += $recentFailures * 5;

        if ($score >= 30) {
            Log::warning('Suspicious activity detected', [
                'user_id' => $user->id,
                'action' => $action,
                'score' => $score,
                'context' => $context,
            ]);
            return true;
        }

        return false;
    }

    public function recordFailure(int $userId): void
    {
        $key = self::CACHE_PREFIX . 'failures:' . $userId;
        Cache::increment($key, 1, 3600);
    }

    public function checkBotActivity(): bool
    {
        $request = request();
        $ip = $request->ip();
        $userAgent = $request->userAgent() ?? '';
        $acceptHeader = $request->header('Accept', '');

        if (empty($userAgent) || $userAgent === '') {
            Log::warning('Empty user agent blocked', ['ip' => $ip]);
            return true;
        }

        $botPatterns = [
            '/curl/i', '/wget/i', '/python/i', '/go-http-client/i',
            '/java/i', '/ruby/i', '/scrapy/i', '/httpclient/i',
            '/MJ12bot/i', '/semrush/i', '/AhrefsBot/i', '/DotBot/i',
        ];

        foreach ($botPatterns as $pattern) {
            if (preg_match($pattern, $userAgent)) {
                return false;
            }
        }

        $requestRate = Cache::get(self::CACHE_PREFIX . 'ip_rate:' . $ip, 0);
        if ($requestRate > 120) {
            return true;
        }

        $cacheKey = self::CACHE_PREFIX . 'ip_rate:' . $ip;
        Cache::put($cacheKey, $requestRate + 1, 60);

        return false;
    }

    public function getOrCreateIpWhitelist(): array
    {
        $whitelist = Cache::get(self::CACHE_PREFIX . 'ip_whitelist', []);
        if (empty($whitelist)) {
            $whitelist = config('admin.allowed_ips', ['127.0.0.1', '::1']);
            Cache::put(self::CACHE_PREFIX . 'ip_whitelist', $whitelist, 86400);
        }
        return $whitelist;
    }

    public function isIpAllowed(string $ip): bool
    {
        $whitelist = $this->getOrCreateIpWhitelist();
        return in_array($ip, $whitelist);
    }
}
