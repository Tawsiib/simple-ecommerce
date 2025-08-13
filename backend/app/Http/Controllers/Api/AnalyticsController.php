<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AnalyticsController extends Controller
{
    protected $analyticsService;

    public function __construct(AnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    /**
     * Get comprehensive analytics data
     */
    public function getAnalyticsData(Request $request): JsonResponse
    {
        $request->validate([
            'period' => 'nullable|string|in:week,month,quarter,year',
        ]);

        $period = $request->get('period', 'month');
        
        try {
            $data = $this->analyticsService->getAnalyticsData($period);
            
            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => 'Analytics data retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve analytics data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get overview statistics
     */
    public function getOverview(Request $request): JsonResponse
    {
        $request->validate([
            'period' => 'nullable|string|in:week,month,quarter,year',
        ]);

        $period = $request->get('period', 'month');
        
        try {
            $data = $this->analyticsService->getOverviewData($period);
            
            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => 'Overview data retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve overview data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get sales analytics
     */
    public function getSalesAnalytics(Request $request): JsonResponse
    {
        $request->validate([
            'period' => 'nullable|string|in:week,month,quarter,year',
        ]);

        $period = $request->get('period', 'month');
        
        try {
            $data = $this->analyticsService->getSalesData($period);
            
            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => 'Sales analytics retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve sales analytics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get product analytics
     */
    public function getProductAnalytics(Request $request): JsonResponse
    {
        $request->validate([
            'period' => 'nullable|string|in:week,month,quarter,year',
        ]);

        $period = $request->get('period', 'month');
        
        try {
            $data = $this->analyticsService->getProductAnalytics($period);
            
            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => 'Product analytics retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve product analytics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get customer analytics
     */
    public function getCustomerAnalytics(Request $request): JsonResponse
    {
        $request->validate([
            'period' => 'nullable|string|in:week,month,quarter,year',
        ]);

        $period = $request->get('period', 'month');
        
        try {
            $data = $this->analyticsService->getCustomerAnalytics($period);
            
            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => 'Customer analytics retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve customer analytics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get traffic analytics
     */
    public function getTrafficAnalytics(Request $request): JsonResponse
    {
        $request->validate([
            'period' => 'nullable|string|in:week,month,quarter,year',
        ]);

        $period = $request->get('period', 'month');
        
        try {
            $data = $this->analyticsService->getTrafficAnalytics($period);
            
            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => 'Traffic analytics retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve traffic analytics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get conversion analytics
     */
    public function getConversionAnalytics(Request $request): JsonResponse
    {
        $request->validate([
            'period' => 'nullable|string|in:week,month,quarter,year',
        ]);

        $period = $request->get('period', 'month');
        
        try {
            $data = $this->analyticsService->getConversionAnalytics($period);
            
            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => 'Conversion analytics retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve conversion analytics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get real-time analytics
     */
    public function getRealTimeAnalytics(): JsonResponse
    {
        try {
            $data = $this->analyticsService->getRealTimeAnalytics();
            
            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => 'Real-time analytics retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve real-time analytics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export analytics data
     */
    public function exportAnalytics(Request $request): JsonResponse
    {
        $request->validate([
            'period' => 'nullable|string|in:week,month,quarter,year',
            'format' => 'nullable|string|in:json,csv,xlsx',
        ]);

        $period = $request->get('period', 'month');
        $format = $request->get('format', 'json');
        
        try {
            $data = $this->analyticsService->exportAnalyticsData($period, $format);
            
            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => 'Analytics data exported successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to export analytics data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get analytics configuration
     */
    public function getAnalyticsConfig(): JsonResponse
    {
        try {
            $data = $this->analyticsService->getAnalyticsConfiguration();
            
            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => 'Analytics configuration retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve analytics configuration: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test endpoint to check if the service is working
     */
    public function test(): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'message' => 'Analytics service is working',
                'timestamp' => now()->toISOString()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Analytics service error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clear analytics cache (requires authentication)
     */
    public function clearAnalyticsCache(): JsonResponse
    {
        try {
            $this->analyticsService->clearAnalyticsCache();
            
            return response()->json([
                'success' => true,
                'message' => 'Analytics cache cleared successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear analytics cache: ' . $e->getMessage()
            ], 500);
        }
    }
}
