<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class MonitoringService
{
    const METRICS_PREFIX = 'metrics:';
    const SLOW_QUERY_THRESHOLD_MS = 200;
    const METRICS_TTL = 86400;

    public function recordRequest(string $method, string $path, int $statusCode, float $durationMs): void
    {
        if (str_contains($path, '/_debug') || str_contains($path, '/telescope')) {
            return;
        }

        $minute = now()->format('Y-m-d-H:i');
        $hour = now()->format('Y-m-d-H');
        $endpoint = $this->normalizePath($path);

        // Per-minute request count
        $this->increment("requests:per_minute:{$minute}");
        $this->increment("requests:per_endpoint:{$endpoint}:{$minute}");

        // Running daily total
        $day = now()->format('Y-m-d');
        $this->increment("requests:daily:{$day}");

        // Status code tracking
        $statusGroup = (int) ($statusCode / 100) . 'xx';
        $this->increment("requests:status:{$statusGroup}:{$hour}");

        // Duration tracking
        if ($durationMs > self::SLOW_QUERY_THRESHOLD_MS) {
            $this->recordSlowRequest($method, $path, $durationMs, $statusCode);
        }

        // Running average
        $avgKey = "requests:avg_duration:{$hour}";
        $avgCount = Cache::get("{$avgKey}:count", 0);
        $avgTotal = Cache::get("{$avgKey}:total", 0.0);
        Cache::put("{$avgKey}:count", $avgCount + 1, 3600);
        Cache::put("{$avgKey}:total", $avgTotal + $durationMs, 3600);

        // Track authenticated vs guest
        if (auth()->check()) {
            $this->increment("requests:auth:{$hour}");
        } else {
            $this->increment("requests:guest:{$hour}");
        }
    }

    public function recordSlowQuery(string $sql, float $durationMs, array $bindings = []): void
    {
        if ($durationMs < self::SLOW_QUERY_THRESHOLD_MS) return;

        $hash = md5($sql);
        $key = self::METRICS_PREFIX . "slow_queries:{$hash}";

        $existing = Cache::get($key, ['count' => 0, 'total_duration' => 0, 'max_duration' => 0]);
        $existing['count']++;
        $existing['total_duration'] += $durationMs;
        $existing['max_duration'] = max($existing['max_duration'], $durationMs);
        $existing['sql'] = $sql;
        $existing['last_seen'] = now()->toIso8601String();
        Cache::put($key, $existing, self::METRICS_TTL);

        if ($durationMs > 1000) {
            Log::warning('Extremely slow query detected', [
                'duration_ms' => round($durationMs, 2),
                'sql' => $sql,
                'bindings' => $bindings,
            ]);
        }
    }

    public function recordSearchLatency(float $durationMs, string $engine = 'database'): void
    {
        $hour = now()->format('Y-m-d-H');
        $this->increment("search:count:{$engine}:{$hour}");

        $totalKey = "search:total_duration:{$engine}:{$hour}";
        $total = (float) Cache::get($totalKey, 0);
        Cache::put($totalKey, $total + $durationMs, 3600);

        if ($durationMs > 1000) {
            Log::warning('Slow search detected', [
                'engine' => $engine,
                'duration_ms' => round($durationMs, 2),
            ]);
        }
    }

    public function recordCacheOperation(string $operation, string $key, bool $hit): void
    {
        $hour = now()->format('Y-m-d-H');
        $type = $hit ? 'hit' : 'miss';
        $this->increment("cache:{$operation}:{$type}:{$hour}");
    }

    public function recordBoostMetric(string $metric, array $data = []): void
    {
        $hour = now()->format('Y-m-d-H');
        $this->increment("boost:{$metric}:{$hour}");

        if (!empty($data)) {
            $key = self::METRICS_PREFIX . "boost_data:{$metric}:" . now()->format('Y-m-d');
            $existing = Cache::get($key, []);
            $existing[] = array_merge($data, ['timestamp' => now()->toIso8601String()]);
            $existing = array_slice($existing, -100);
            Cache::put($key, $existing, self::METRICS_TTL);
        }
    }

    public function getMetricsSummary(): array
    {
        $hour = now()->format('Y-m-d-H');
        $today = now()->format('Y-m-d');

        $requestsKey = self::METRICS_PREFIX . "requests:per_minute:*";
        $avgCount = (int) Cache::get("requests:avg_duration:{$hour}:count", 0);
        $avgTotal = (float) Cache::get("requests:avg_duration:{$hour}:total", 0.0);

        $slowQueries = [];
        $keys = Cache::get(self::METRICS_PREFIX . 'slow_query_keys', []);
        foreach ($keys as $key) {
            $data = Cache::get($key);
            if ($data) $slowQueries[] = $data;
        }

        $searchHits = [];
        foreach (['database', 'meilisearch'] as $engine) {
            $count = (int) Cache::get("search:count:{$engine}:{$hour}", 0);
            $totalDur = (float) Cache::get("search:total_duration:{$engine}:{$hour}", 0);
            $searchHits[$engine] = [
                'count' => $count,
                'avg_duration_ms' => $count > 0 ? round($totalDur / $count, 2) : 0,
            ];
        }

        return [
            'requests' => [
                'avg_duration_ms' => $avgCount > 0 ? round($avgTotal / $avgCount, 2) : 0,
                'total_today' => $this->getDailyTotal('requests:per_minute'),
                'auth_vs_guest' => [
                    'auth' => (int) Cache::get("requests:auth:{$hour}", 0),
                    'guest' => (int) Cache::get("requests:guest:{$hour}", 0),
                ],
            ],
            'cache' => [
                'hit_rate' => $this->getCacheHitRate(),
            ],
            'search' => $searchHits,
            'slow_queries' => [
                'count' => count($slowQueries),
                'worst' => !empty($slowQueries) ? max(array_column($slowQueries, 'max_duration')) : 0,
            ],
            'timestamp' => now()->toIso8601String(),
        ];
    }

    public function logError(\Throwable $e, array $context = []): void
    {
        $hash = md5($e->getMessage() . $e->getFile() . $e->getLine());
        $key = self::METRICS_PREFIX . "errors:{$hash}";

        $existing = Cache::get($key, ['count' => 0, 'first_seen' => now()->toIso8601String()]);
        $existing['count']++;
        $existing['last_seen'] = now()->toIso8601String();
        $existing['message'] = $e->getMessage();
        $existing['file'] = $e->getFile();
        $existing['line'] = $e->getLine();
        $existing['class'] = get_class($e);
        Cache::put($key, $existing, self::METRICS_TTL);

        Log::error($e->getMessage(), array_merge([
            'exception' => get_class($e),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
        ], $context));
    }

    public function getPerformanceReport(): array
    {
        $metrics = $this->getMetricsSummary();
        $slowQueries = $this->getRecentSlowQueries();

        return [
            'summary' => $metrics,
            'slow_queries' => $slowQueries,
            'recommendations' => $this->generateRecommendations($metrics, $slowQueries),
            'health_score' => $this->calculateHealthScore($metrics),
        ];
    }

    private function getRecentSlowQueries(): array
    {
        $queries = [];
        $keys = Cache::get(self::METRICS_PREFIX . 'slow_query_keys', []);
        foreach ($keys as $key) {
            $data = Cache::get($key);
            if ($data && $data['max_duration'] > 500) {
                $queries[] = $data;
            }
        }
        usort($queries, fn($a, $b) => $b['max_duration'] <=> $a['max_duration']);
        return array_slice($queries, 0, 20);
    }

    private function generateRecommendations(array $metrics, array $slowQueries): array
    {
        $recommendations = [];

        if (($metrics['search']['database']['avg_duration_ms'] ?? 0) > 500) {
            $recommendations[] = 'Consider enabling Meilisearch for faster search performance. Current DB search avg: ' . $metrics['search']['database']['avg_duration_ms'] . 'ms';
        }

        if (($metrics['cache']['hit_rate'] ?? 1) < 0.7) {
            $recommendations[] = 'Cache hit rate is low (' . round($metrics['cache']['hit_rate'] * 100) . '%). Review cache TTLs and invalidation strategy.';
        }

        if (!empty($slowQueries)) {
            $recommendations[] = count($slowQueries) . ' slow queries detected. Review indexes and consider query optimization.';
        }

        foreach ($slowQueries as $q) {
            if (str_contains($q['sql'] ?? '', 'LIKE')) {
                $recommendations[] = 'Full-text search detected. Consider adding FULLTEXT indexes or switching to Meilisearch.';
                break;
            }
        }

        return $recommendations;
    }

    private function calculateHealthScore(array $metrics): int
    {
        $score = 100;

        $avgDuration = $metrics['requests']['avg_duration_ms'] ?? 0;
        if ($avgDuration > 500) $score -= 20;
        elseif ($avgDuration > 200) $score -= 10;

        $slowQueryCount = $metrics['slow_queries']['count'] ?? 0;
        $score -= min(30, $slowQueryCount * 5);

        $searchDelay = $metrics['search']['database']['avg_duration_ms'] ?? 0;
        if ($searchDelay > 1000) $score -= 15;
        elseif ($searchDelay > 500) $score -= 5;

        return max(0, $score);
    }

    private function increment(string $key): void
    {
        Cache::increment(self::METRICS_PREFIX . $key, 1, self::METRICS_TTL);
    }

    private function normalizePath(string $path): string
    {
        $path = preg_replace('#/api/[^/]+/\d+#', '/api/{param}/:id', $path);
        $path = preg_replace('#/\d+#', '/:id', $path);
        return $path;
    }

    private function recordSlowRequest(string $method, string $path, float $durationMs, int $statusCode): void
    {
        $hash = md5("{$method}:{$path}");
        $key = self::METRICS_PREFIX . "slow_endpoints:{$hash}";

        $existing = Cache::get($key, ['count' => 0, 'total_duration' => 0]);
        $existing['count']++;
        $existing['total_duration'] += $durationMs;
        $existing['method'] = $method;
        $existing['path'] = $path;
        $existing['last_duration'] = $durationMs;
        $existing['last_status'] = $statusCode;
        $existing['last_seen'] = now()->toIso8601String();
        Cache::put($key, $existing, self::METRICS_TTL);
    }

    private function getDailyTotal(string $pattern): int
    {
        $day = now()->format('Y-m-d');
        $total = 0;

        if ($pattern === 'requests:per_minute') {
            $total = (int) Cache::get(self::METRICS_PREFIX . "requests:daily:{$day}", 0);
        } else {
            $total = (int) Cache::get(self::METRICS_PREFIX . "{$pattern}:{$day}", 0);
        }

        return $total;
    }

    private function getCacheHitRate(): float
    {
        $hour = now()->format('Y-m-d-H');
        $hits = (int) Cache::get(self::METRICS_PREFIX . "cache:get:hit:{$hour}", 0);
        $misses = (int) Cache::get(self::METRICS_PREFIX . "cache:get:miss:{$hour}", 0);
        $total = $hits + $misses;
        return $total > 0 ? round($hits / $total, 4) : 1.0;
    }
}
