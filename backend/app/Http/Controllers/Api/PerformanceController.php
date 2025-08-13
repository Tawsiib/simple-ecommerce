<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PerformanceService;
use App\Services\CacheService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PerformanceController extends Controller
{
    protected PerformanceService $performanceService;
    protected CacheService $cacheService;

    public function __construct(PerformanceService $performanceService, CacheService $cacheService)
    {
        $this->performanceService = $performanceService;
        $this->cacheService = $cacheService;
    }

    /**
     * Get performance overview
     */
    public function overview(Request $request): JsonResponse
    {
        try {
            $period = $request->get('period', 'today');
            $date = $request->get('date');
            
            $stats = $this->performanceService->getPerformanceStats($period, $date);
            
            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Performance overview retrieved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve performance overview',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get performance statistics
     */
    public function stats(Request $request): JsonResponse
    {
        try {
            $period = $request->get('period', 'today');
            $date = $request->get('date');
            
            $stats = $this->performanceService->getPerformanceStats($period, $date);
            
            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Performance statistics retrieved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve performance statistics',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get cache statistics
     */
    public function cacheStats(): JsonResponse
    {
        try {
            $stats = $this->cacheService->getCacheStats();
            
            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Cache statistics retrieved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve cache statistics',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get memory usage
     */
    public function memoryUsage(): JsonResponse
    {
        try {
            $currentMemory = memory_get_usage(true);
            $peakMemory = memory_get_peak_usage(true);
            $memoryLimit = ini_get('memory_limit');
            
            $data = [
                'current_memory_mb' => round($currentMemory / (1024 * 1024), 2),
                'peak_memory_mb' => round($peakMemory / (1024 * 1024), 2),
                'memory_limit' => $memoryLimit,
                'memory_usage_percent' => $this->calculateMemoryUsagePercent($currentMemory, $memoryLimit),
                'timestamp' => now()->toISOString(),
            ];
            
            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => 'Memory usage retrieved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve memory usage',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Clear cache by type
     */
    public function clearCache(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'type' => 'required|string|in:all,product,category,brand,search,dashboard',
                'id' => 'nullable|integer',
            ]);

            $type = $request->input('type');
            $id = $request->input('id');
            
            $result = $this->cacheService->clearCacheByType($type, $id);
            
            if ($result) {
                return response()->json([
                    'success' => true,
                    'message' => "Cache cleared successfully for type: {$type}",
                    'data' => ['type' => $type, 'id' => $id],
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to clear cache',
                ], 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear cache',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Warm up cache
     */
    public function warmUpCache(): JsonResponse
    {
        try {
            $results = $this->cacheService->warmUpCache();
            
            return response()->json([
                'success' => true,
                'data' => $results,
                'message' => 'Cache warming completed successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to warm up cache',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get real-time metrics
     */
    public function realTime(): JsonResponse
    {
        try {
            $metrics = $this->performanceService->getRealTimeMetrics();
            
            return response()->json([
                'success' => true,
                'data' => $metrics,
                'message' => 'Real-time metrics retrieved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve real-time metrics',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get performance recommendations
     */
    public function recommendations(): JsonResponse
    {
        try {
            $recommendations = $this->performanceService->getPerformanceRecommendations();
            
            return response()->json([
                'success' => true,
                'data' => $recommendations,
                'message' => 'Performance recommendations retrieved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve performance recommendations',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Clear old performance data
     */
    public function clearOldData(Request $request): JsonResponse
    {
        try {
            $days = $request->get('days', 30);
            
            if ($days < 1 || $days > 365) {
                return response()->json([
                    'success' => false,
                    'message' => 'Days must be between 1 and 365',
                ], 400);
            }
            
            $deleted = $this->performanceService->clearOldData($days);
            
            return response()->json([
                'success' => true,
                'data' => ['deleted_records' => $deleted, 'days' => $days],
                'message' => "Cleared {$deleted} old performance records",
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear old performance data',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Calculate memory usage percentage
     */
    protected function calculateMemoryUsagePercent(int $currentMemory, string $memoryLimit): float
    {
        $limitBytes = $this->parseMemoryLimit($memoryLimit);
        
        if ($limitBytes === -1) {
            return 0; // Unlimited
        }
        
        return round(($currentMemory / $limitBytes) * 100, 2);
    }

    /**
     * Parse memory limit string to bytes
     */
    protected function parseMemoryLimit(string $memoryLimit): int
    {
        $unit = strtolower(substr($memoryLimit, -1));
        $value = (int) substr($memoryLimit, 0, -1);
        
        return match ($unit) {
            'k' => $value * 1024,
            'm' => $value * 1024 * 1024,
            'g' => $value * 1024 * 1024 * 1024,
            default => $value,
        };
    }
}
