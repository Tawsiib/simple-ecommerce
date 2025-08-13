<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class PerformanceService
{
    protected $cachePrefix = 'performance';
    protected $thresholds = [
        'slow_query' => 100,        // 100ms
        'memory_warning' => 50 * 1024 * 1024,  // 50MB
        'response_warning' => 1000, // 1 second
    ];

    public function trackRequest(string $method, string $uri, float $startTime, float $endTime, int $memoryUsage): array
    {
        $duration = ($endTime - $startTime) * 1000; // Convert to milliseconds
        $memoryMB = $memoryUsage / (1024 * 1024);
        
        $metrics = [
            'method' => $method,
            'uri' => $uri,
            'duration_ms' => round($duration, 2),
            'memory_mb' => round($memoryMB, 2),
            'timestamp' => now()->toISOString(),
            'is_slow' => $duration > $this->thresholds['slow_query'],
            'memory_warning' => $memoryUsage > $this->thresholds['memory_warning'],
        ];

        $this->storeMetrics($metrics);
        $this->checkThresholds($metrics);

        return $metrics;
    }

    public function getPerformanceStats(string $period = 'today', ?string $date = null): array
    {
        $cacheKey = "performance_stats_{$period}_{$date}";
        
        return Cache::remember("{$this->cachePrefix}:{$cacheKey}", 300, function () use ($period, $date) {
            $startDate = $this->getStartDate($period, $date);
            
            return [
                'overview' => $this->getOverviewStats($startDate),
                'response_times' => $this->getResponseTimeStats($startDate),
                'memory_usage' => $this->getMemoryUsageStats($startDate),
                'slow_requests' => $this->getSlowRequestStats($startDate),
                'endpoints' => $this->getEndpointStats($startDate),
                'period' => $period,
                'date' => $date,
                'start_date' => $startDate->toISOString(),
            ];
        });
    }

    public function getOverviewStats(Carbon $startDate): array
    {
        $totalRequests = DB::table('performance_metrics')
            ->where('timestamp', '>=', $startDate)
            ->count();

        $slowRequests = DB::table('performance_metrics')
            ->where('timestamp', '>=', $startDate)
            ->where('is_slow', true)
            ->count();

        $avgResponseTime = DB::table('performance_metrics')
            ->where('timestamp', '>=', $startDate)
            ->avg('duration_ms');

        $avgMemoryUsage = DB::table('performance_metrics')
            ->where('timestamp', '>=', $startDate)
            ->avg('memory_mb');

        $memoryWarnings = DB::table('performance_metrics')
            ->where('timestamp', '>=', $startDate)
            ->where('memory_warning', true)
            ->count();

        return [
            'total_requests' => $totalRequests,
            'slow_requests' => $slowRequests,
            'slow_request_rate' => $totalRequests > 0 ? round(($slowRequests / $totalRequests) * 100, 2) : 0,
            'avg_response_time_ms' => round($avgResponseTime ?? 0, 2),
            'avg_memory_usage_mb' => round($avgMemoryUsage ?? 0, 2),
            'memory_warnings' => $memoryWarnings,
            'memory_warning_rate' => $totalRequests > 0 ? round(($memoryWarnings / $totalRequests) * 100, 2) : 0,
        ];
    }

    public function getResponseTimeStats(Carbon $startDate): array
    {
        $hourlyData = DB::table('performance_metrics')
            ->selectRaw('DATE_FORMAT(timestamp, "%Y-%m-%d %H:00:00") as hour, AVG(duration_ms) as avg_duration, COUNT(*) as request_count')
            ->where('timestamp', '>=', $startDate)
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();

        $percentiles = $this->calculatePercentiles($startDate, 'duration_ms');

        return [
            'hourly_data' => $hourlyData,
            'percentiles' => $percentiles,
            'thresholds' => [
                'warning' => $this->thresholds['response_warning'],
                'slow' => $this->thresholds['slow_query'],
            ],
        ];
    }

    public function getMemoryUsageStats(Carbon $startDate): array
    {
        $hourlyData = DB::table('performance_metrics')
            ->selectRaw('DATE_FORMAT(timestamp, "%Y-%m-%d %H:00:00") as hour, AVG(memory_mb) as avg_memory, MAX(memory_mb) as peak_memory')
            ->where('timestamp', '>=', $startDate)
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();

        $percentiles = $this->calculatePercentiles($startDate, 'memory_mb');

        return [
            'hourly_data' => $hourlyData,
            'percentiles' => $percentiles,
            'thresholds' => [
                'warning' => $this->thresholds['memory_warning'] / (1024 * 1024), // Convert to MB
            ],
        ];
    }

    public function getSlowRequestStats(Carbon $startDate): array
    {
        $slowRequests = DB::table('performance_metrics')
            ->select('uri', 'method', 'duration_ms', 'memory_mb', 'timestamp')
            ->where('timestamp', '>=', $startDate)
            ->where('is_slow', true)
            ->orderBy('duration_ms', 'desc')
            ->limit(50)
            ->get();

        $slowEndpoints = DB::table('performance_metrics')
            ->selectRaw('uri, method, COUNT(*) as slow_count, AVG(duration_ms) as avg_duration, MAX(duration_ms) as max_duration')
            ->where('timestamp', '>=', $startDate)
            ->where('is_slow', true)
            ->groupBy('uri', 'method')
            ->orderBy('slow_count', 'desc')
            ->limit(20)
            ->get();

        return [
            'slow_requests' => $slowRequests,
            'slow_endpoints' => $slowEndpoints,
        ];
    }

    public function getEndpointStats(Carbon $startDate): array
    {
        return DB::table('performance_metrics')
            ->selectRaw('uri, method, COUNT(*) as request_count, AVG(duration_ms) as avg_duration, AVG(memory_mb) as avg_memory')
            ->where('timestamp', '>=', $startDate)
            ->groupBy('uri', 'method')
            ->orderBy('request_count', 'desc')
            ->limit(50)
            ->get()
            ->toArray();
    }

    public function getRealTimeMetrics(): array
    {
        $lastMinute = now()->subMinute();
        
        $recentRequests = DB::table('performance_metrics')
            ->where('timestamp', '>=', $lastMinute)
            ->count();

        $recentSlowRequests = DB::table('performance_metrics')
            ->where('timestamp', '>=', $lastMinute)
            ->where('is_slow', true)
            ->count();

        $currentMemoryUsage = memory_get_usage(true) / (1024 * 1024);
        $peakMemoryUsage = memory_get_peak_usage(true) / (1024 * 1024);

        return [
            'requests_last_minute' => $recentRequests,
            'slow_requests_last_minute' => $recentSlowRequests,
            'current_memory_mb' => round($currentMemoryUsage, 2),
            'peak_memory_mb' => round($peakMemoryUsage, 2),
            'memory_warning' => $currentMemoryUsage > ($this->thresholds['memory_warning'] / (1024 * 1024)),
            'timestamp' => now()->toISOString(),
        ];
    }

    public function getPerformanceRecommendations(): array
    {
        $recommendations = [];
        
        // Check response time trends
        $avgResponseTime = DB::table('performance_metrics')
            ->where('timestamp', '>=', now()->subHour())
            ->avg('duration_ms');

        if ($avgResponseTime > $this->thresholds['slow_query']) {
            $recommendations[] = [
                'type' => 'warning',
                'category' => 'response_time',
                'message' => 'Average response time is above threshold. Consider optimizing database queries or implementing caching.',
                'priority' => 'high',
            ];
        }

        // Check memory usage
        $memoryWarnings = DB::table('performance_metrics')
            ->where('timestamp', '>=', now()->subHour())
            ->where('memory_warning', true)
            ->count();

        if ($memoryWarnings > 10) {
            $recommendations[] = [
                'type' => 'warning',
                'category' => 'memory_usage',
                'message' => 'High memory usage detected. Consider implementing memory optimization strategies.',
                'priority' => 'high',
            ];
        }

        // Check slow request patterns
        $slowEndpoints = DB::table('performance_metrics')
            ->selectRaw('uri, COUNT(*) as slow_count')
            ->where('timestamp', '>=', now()->subDay())
            ->where('is_slow', true)
            ->groupBy('uri')
            ->having('slow_count', '>', 5)
            ->get();

        foreach ($slowEndpoints as $endpoint) {
            $recommendations[] = [
                'type' => 'info',
                'category' => 'endpoint_optimization',
                'message' => "Endpoint '{$endpoint->uri}' has {$endpoint->slow_count} slow requests. Consider optimization.",
                'priority' => 'medium',
            ];
        }

        return $recommendations;
    }

    protected function storeMetrics(array $metrics): void
    {
        try {
            DB::table('performance_metrics')->insert([
                'method' => $metrics['method'],
                'uri' => $metrics['uri'],
                'duration_ms' => $metrics['duration_ms'],
                'memory_mb' => $metrics['memory_mb'],
                'is_slow' => $metrics['is_slow'],
                'memory_warning' => $metrics['memory_warning'],
                'timestamp' => $metrics['timestamp'],
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to store performance metrics: {$e->getMessage()}");
        }
    }

    protected function checkThresholds(array $metrics): void
    {
        if ($metrics['is_slow']) {
            Log::warning("Slow request detected", [
                'uri' => $metrics['uri'],
                'duration_ms' => $metrics['duration_ms'],
                'threshold' => $this->thresholds['slow_query'],
            ]);
        }

        if ($metrics['memory_warning']) {
            Log::warning("High memory usage detected", [
                'uri' => $metrics['uri'],
                'memory_mb' => $metrics['memory_mb'],
                'threshold' => $this->thresholds['memory_warning'] / (1024 * 1024),
            ]);
        }
    }

    protected function calculatePercentiles(Carbon $startDate, string $column): array
    {
        $values = DB::table('performance_metrics')
            ->where('timestamp', '>=', $startDate)
            ->pluck($column)
            ->toArray();

        if (empty($values)) {
            return [
                'p50' => 0,
                'p90' => 0,
                'p95' => 0,
                'p99' => 0,
            ];
        }

        sort($values);
        $count = count($values);

        return [
            'p50' => $this->getPercentile($values, $count, 50),
            'p90' => $this->getPercentile($values, $count, 90),
            'p95' => $this->getPercentile($values, $count, 95),
            'p99' => $this->getPercentile($values, $count, 99),
        ];
    }

    protected function getPercentile(array $values, int $count, int $percentile): float
    {
        $index = ceil(($percentile / 100) * $count) - 1;
        return $values[$index] ?? 0;
    }

    protected function getStartDate(string $period, ?string $date = null): Carbon
    {
        $startDate = $date ? Carbon::parse($date) : now();

        return match ($period) {
            'hour' => $startDate->subHour(),
            'today' => $startDate->startOfDay(),
            'week' => $startDate->subWeek(),
            'month' => $startDate->subMonth(),
            'year' => $startDate->subYear(),
            default => $startDate->subDay(),
        };
    }

    public function clearOldData(int $days = 30): int
    {
        try {
            $cutoffDate = now()->subDays($days);
            
            $deleted = DB::table('performance_metrics')
                ->where('timestamp', '<', $cutoffDate)
                ->delete();

            Log::info("Cleared {$deleted} old performance records older than {$days} days");
            
            return $deleted;
        } catch (\Exception $e) {
            Log::error("Failed to clear old performance data: {$e->getMessage()}");
            return 0;
        }
    }
}
