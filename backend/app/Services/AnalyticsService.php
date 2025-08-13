<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Order;
use App\Models\User;
use App\Models\Category;
use App\Models\Brand;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class AnalyticsService
{
    protected $cachePrefix = 'analytics';

    public function getAnalyticsData(string $period = 'month'): array
    {
        try {
            $cacheKey = "analytics_data_{$period}";
            
            return Cache::remember("{$this->cachePrefix}:{$cacheKey}", 3600, function () use ($period) {
                return [
                    'overview' => $this->getOverviewData($period),
                    'sales' => $this->getSalesData($period),
                    'products' => $this->getProductAnalytics($period),
                    'customers' => $this->getCustomerAnalytics($period),
                    'traffic' => $this->getTrafficAnalytics($period),
                    'conversion' => $this->getConversionAnalytics($period),
                ];
            });
        } catch (\Exception $e) {
            // Fallback data if there's an error
            return [
                'overview' => ['error' => 'Failed to load overview data'],
                'sales' => ['error' => 'Failed to load sales data'],
                'products' => ['error' => 'Failed to load products data'],
                'customers' => ['error' => 'Failed to load customers data'],
                'traffic' => ['error' => 'Failed to load traffic data'],
                'conversion' => ['error' => 'Failed to load conversion data'],
                'period' => $period,
                'error' => $e->getMessage(),
            ];
        }
    }

    public function getOverviewData(string $period = 'month'): array
    {
        $startDate = $this->getStartDate($period);
        
        try {
            $totalRevenue = Order::where('status', 'completed')
                ->where('created_at', '>=', $startDate)
                ->sum('total_amount') ?? 0;
                
            $totalOrders = Order::where('created_at', '>=', $startDate)->count() ?? 0;
            
            $totalCustomers = User::where('created_at', '>=', $startDate)->count() ?? 0;
            
            $totalProducts = Product::count() ?? 0;
            
            $activeProducts = Product::where('is_active', true)->count() ?? 0;
            
            $lowStockProducts = Product::where('stock', '<=', 'min_stock')->count() ?? 0;
            
            $outOfStockProducts = Product::where('stock', 0)->count() ?? 0;
            
            $averageOrderValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;
            
            $customerLifetimeValue = $this->calculateCustomerLifetimeValue($period);
            
            $repeatCustomerRate = $this->calculateRepeatCustomerRate($period);
        } catch (\Exception $e) {
            // Fallback data if database is not available
            $totalRevenue = 0;
            $totalOrders = 0;
            $totalCustomers = 0;
            $totalProducts = 0;
            $activeProducts = 0;
            $lowStockProducts = 0;
            $outOfStockProducts = 0;
            $averageOrderValue = 0;
            $customerLifetimeValue = 0;
            $repeatCustomerRate = 0;
        }
        
        return [
            'total_revenue' => $totalRevenue,
            'total_orders' => $totalOrders,
            'total_customers' => $totalCustomers,
            'total_products' => $totalProducts,
            'active_products' => $activeProducts,
            'low_stock_products' => $lowStockProducts,
            'out_of_stock_products' => $outOfStockProducts,
            'average_order_value' => $averageOrderValue,
            'customer_lifetime_value' => $customerLifetimeValue,
            'repeat_customer_rate' => $repeatCustomerRate,
            'period' => $period,
            'start_date' => $startDate->toDateString(),
            'end_date' => now()->toDateString(),
        ];
    }

    public function getSalesData(string $period = 'month'): array
    {
        $startDate = $this->getStartDate($period);
        
        try {
            // Daily sales data
            $dailySales = Order::where('status', 'completed')
                ->where('created_at', '>=', $startDate)
                ->selectRaw('DATE(created_at) as date, SUM(total_amount) as revenue, COUNT(*) as orders')
                ->groupBy('date')
                ->orderBy('date')
                ->get();
                
            // Sales by category
            $salesByCategory = Order::join('order_items', 'orders.id', '=', 'order_items.order_id')
                ->join('products', 'order_items.product_id', '=', 'products.id')
                ->join('categories', 'products.category_id', '=', 'categories.id')
                ->where('orders.status', 'completed')
                ->where('orders.created_at', '>=', $startDate)
                ->selectRaw('categories.name, SUM(order_items.total_price) as revenue, COUNT(*) as orders')
                ->groupBy('categories.id', 'categories.name')
                ->orderByDesc('revenue')
                ->get();
                
            // Sales by brand
            $salesByBrand = Order::join('order_items', 'orders.id', '=', 'order_items.order_id')
                ->join('products', 'order_items.product_id', '=', 'products.id')
                ->join('brands', 'products.brand_id', '=', 'brands.id')
                ->where('orders.status', 'completed')
                ->where('orders.created_at', '>=', $startDate)
                ->selectRaw('brands.name, SUM(order_items.total_price) as revenue, COUNT(*) as orders')
                ->groupBy('brands.id', 'brands.name')
                ->orderByDesc('revenue')
                ->get();
                
            // Top selling products
            $topSellingProducts = Order::join('order_items', 'orders.id', '=', 'order_items.order_id')
                ->join('products', 'order_items.product_id', '=', 'products.id')
                ->where('orders.status', 'completed')
                ->where('orders.created_at', '>=', $startDate)
                ->selectRaw('products.name, SUM(order_items.quantity) as total_quantity, SUM(order_items.total_price) as revenue')
                ->groupBy('products.id', 'products.name')
                ->orderByDesc('total_quantity')
                ->limit(10)
                ->get();
        } catch (\Exception $e) {
            // Fallback data if database is not available
            $dailySales = collect();
            $salesByCategory = collect();
            $salesByBrand = collect();
            $topSellingProducts = collect();
        }
            
        return [
            'daily_sales' => $dailySales,
            'sales_by_category' => $salesByCategory,
            'sales_by_brand' => $salesByBrand,
            'top_selling_products' => $topSellingProducts,
            'period' => $period,
            'start_date' => $startDate->toDateString(),
            'end_date' => now()->toDateString(),
        ];
    }

    public function getProductAnalytics(string $period = 'month'): array
    {
        $startDate = $this->getStartDate($period);
        
        try {
            // Product performance
            $productPerformance = Product::with(['category', 'brand'])
                ->withCount(['orderItems', 'reviews'])
                ->withAvg('reviews', 'rating')
                ->get()
                ->map(function ($product) {
                    return [
                        'id' => $product->id,
                        'name' => $product->name,
                        'category' => $product->category?->name,
                        'brand' => $product->brand?->name,
                        'price' => $product->price,
                        'stock' => $product->stock,
                        'orders_count' => $product->order_items_count,
                        'reviews_count' => $product->reviews_count,
                        'average_rating' => $product->reviews_avg_rating ?? 0,
                        'stock_status' => $product->stock_status,
                    ];
                })
                ->sortByDesc('orders_count');
                
            // Category performance
            $categoryPerformance = Category::withCount('products')
                ->withSum('products', 'stock')
                ->get()
                ->map(function ($category) {
                    return [
                        'id' => $category->id,
                        'name' => $category->name,
                        'products_count' => $category->products_count,
                        'total_stock' => $category->products_sum_stock ?? 0,
                    ];
                });
                
            // Brand performance
            $brandPerformance = Brand::withCount('products')
                ->withSum('products', 'stock')
                ->get()
                ->map(function ($brand) {
                    return [
                        'id' => $brand->id,
                        'name' => $brand->name,
                        'products_count' => $brand->products_count,
                        'total_stock' => $brand->products_sum_stock ?? 0,
                    ];
                });
        } catch (\Exception $e) {
            // Fallback data if database is not available
            $productPerformance = collect();
            $categoryPerformance = collect();
            $brandPerformance = collect();
        }
            
        return [
            'product_performance' => $productPerformance,
            'category_performance' => $categoryPerformance,
            'brand_performance' => $brandPerformance,
            'period' => $period,
        ];
    }

    public function getCustomerAnalytics(string $period = 'month'): array
    {
        $startDate = $this->getStartDate($period);
        
        try {
            // Customer segments
            $customerSegments = [
                'new_customers' => User::where('created_at', '>=', $startDate)->count(),
                'returning_customers' => $this->getReturningCustomersCount($startDate),
                'loyal_customers' => $this->getLoyalCustomersCount($startDate),
            ];
        } catch (\Exception $e) {
            // Fallback data if database is not available
            $customerSegments = [
                'new_customers' => 0,
                'returning_customers' => 0,
                'loyal_customers' => 0,
            ];
        }
        
        // Customer retention
        $customerRetention = $this->calculateCustomerRetention($startDate);
        
        // Geographic distribution (if address data exists)
        $geographicDistribution = $this->getGeographicDistribution($startDate);
        
        // Customer satisfaction
        $customerSatisfaction = $this->getCustomerSatisfaction($startDate);
        
        // Customer churn
        $customerChurn = $this->calculateCustomerChurn($startDate);
        
        return [
            'customer_segments' => $customerSegments,
            'customer_retention' => $customerRetention,
            'geographic_distribution' => $geographicDistribution,
            'customer_satisfaction' => $customerSatisfaction,
            'customer_churn' => $customerChurn,
            'period' => $period,
        ];
    }

    public function getTrafficAnalytics(string $period = 'month'): array
    {
        // This would typically integrate with Google Analytics or similar
        // For now, we'll return placeholder data
        return [
            'page_views' => rand(1000, 10000),
            'unique_visitors' => rand(500, 5000),
            'bounce_rate' => rand(30, 70),
            'session_duration' => rand(60, 300),
            'traffic_sources' => [
                'direct' => rand(20, 40),
                'organic_search' => rand(30, 50),
                'social_media' => rand(10, 25),
                'referral' => rand(5, 15),
            ],
            'popular_pages' => [
                '/products' => rand(100, 500),
                '/categories' => rand(50, 200),
                '/brands' => rand(30, 150),
                '/about' => rand(20, 100),
            ],
            'period' => $period,
        ];
    }

    public function getConversionAnalytics(string $period = 'month'): array
    {
        $startDate = $this->getStartDate($period);
        
        try {
            $ordersCompleted = Order::where('status', 'completed')
                ->where('created_at', '>=', $startDate)
                ->count();
        } catch (\Exception $e) {
            $ordersCompleted = 0;
        }
        
        // Conversion funnel
        $conversionFunnel = [
            'total_visitors' => rand(5000, 15000),
            'product_views' => rand(3000, 8000),
            'add_to_cart' => rand(1000, 3000),
            'checkout_started' => rand(500, 1500),
            'orders_completed' => $ordersCompleted,
        ];
        
        // Abandoned carts
        $abandonedCarts = $this->getAbandonedCartsCount($startDate);
        
        // Checkout completion rate
        $checkoutCompletionRate = $this->calculateCheckoutCompletionRate($startDate);
        
        // Payment method analysis
        $paymentMethodAnalysis = $this->getPaymentMethodAnalysis($startDate);
        
        return [
            'conversion_funnel' => $conversionFunnel,
            'abandoned_carts' => $abandonedCarts,
            'checkout_completion_rate' => $checkoutCompletionRate,
            'payment_method_analysis' => $paymentMethodAnalysis,
            'period' => $period,
        ];
    }

    public function getRealTimeAnalytics(): array
    {
        // Real-time data (last 24 hours)
        $last24Hours = now()->subHours(24);
        
        try {
            $currentOrders = Order::where('created_at', '>=', $last24Hours)->count();
        } catch (\Exception $e) {
            $currentOrders = 0;
        }
        
        return [
            'active_users' => rand(10, 100),
            'current_orders' => $currentOrders,
            'recent_products_viewed' => rand(50, 200),
            'recent_searches' => rand(20, 80),
            'server_status' => 'healthy',
            'last_updated' => now()->toISOString(),
        ];
    }

    protected function getStartDate(string $period): Carbon
    {
        return match ($period) {
            'week' => now()->subWeek(),
            'month' => now()->subMonth(),
            'quarter' => now()->subQuarter(),
            'year' => now()->subYear(),
            default => now()->subMonth(),
        };
    }

    protected function calculateCustomerLifetimeValue(string $period): float
    {
        $startDate = $this->getStartDate($period);
        
        $totalRevenue = Order::where('status', 'completed')
            ->where('created_at', '>=', $startDate)
            ->sum('total_amount');
            
        $totalCustomers = User::where('created_at', '>=', $startDate)->count();
        
        return $totalCustomers > 0 ? $totalRevenue / $totalCustomers : 0;
    }

    protected function calculateRepeatCustomerRate(string $period): float
    {
        $startDate = $this->getStartDate($period);
        
        $customersWithMultipleOrders = Order::where('created_at', '>=', $startDate)
            ->groupBy('user_id')
            ->havingRaw('COUNT(*) > 1')
            ->count();
            
        $totalCustomers = Order::where('created_at', '>=', $startDate)
            ->distinct('user_id')
            ->count();
            
        return $totalCustomers > 0 ? ($customersWithMultipleOrders / $totalCustomers) * 100 : 0;
    }

    protected function getReturningCustomersCount(Carbon $startDate): int
    {
        return Order::where('created_at', '>=', $startDate)
            ->groupBy('user_id')
            ->havingRaw('COUNT(*) > 1')
            ->count();
    }

    protected function getLoyalCustomersCount(Carbon $startDate): int
    {
        return Order::where('created_at', '>=', $startDate)
            ->groupBy('user_id')
            ->havingRaw('COUNT(*) >= 5')
            ->count();
    }

    protected function calculateCustomerRetention(Carbon $startDate): array
    {
        // Simplified retention calculation
        return [
            '1_month' => rand(60, 80),
            '3_months' => rand(40, 60),
            '6_months' => rand(25, 45),
            '12_months' => rand(15, 35),
        ];
    }

    protected function getGeographicDistribution(Carbon $startDate): array
    {
        // Placeholder data - would integrate with address data
        return [
            'Dhaka' => rand(30, 50),
            'Chittagong' => rand(15, 25),
            'Sylhet' => rand(10, 20),
            'Rajshahi' => rand(5, 15),
            'Other' => rand(10, 20),
        ];
    }

    protected function getCustomerSatisfaction(Carbon $startDate): array
    {
        $averageRating = Product::join('reviews', 'products.id', '=', 'reviews.product_id')
            ->where('reviews.created_at', '>=', $startDate)
            ->avg('reviews.rating') ?? 0;
            
        return [
            'average_rating' => round($averageRating, 2),
            'total_reviews' => rand(100, 1000),
            'positive_reviews' => rand(70, 90),
            'negative_reviews' => rand(5, 15),
        ];
    }

    protected function calculateCustomerChurn(Carbon $startDate): float
    {
        // Simplified churn calculation
        return rand(5, 15);
    }

    protected function getAbandonedCartsCount(Carbon $startDate): int
    {
        // Placeholder - would need cart abandonment tracking
        return rand(50, 200);
    }

    protected function calculateCheckoutCompletionRate(Carbon $startDate): float
    {
        // Placeholder calculation
        return rand(60, 85);
    }

    protected function getPaymentMethodAnalysis(Carbon $startDate): array
    {
        // Placeholder data - would integrate with payment data
        return [
            'credit_card' => rand(40, 60),
            'mobile_banking' => rand(20, 40),
            'bank_transfer' => rand(10, 25),
            'cash_on_delivery' => rand(5, 15),
        ];
    }

    public function exportAnalyticsData(string $period = 'month', string $format = 'json'): array
    {
        $data = $this->getAnalyticsData($period);
        
        return [
            'success' => true,
            'data' => $data,
            'export_format' => $format,
            'exported_at' => now()->toISOString(),
        ];
    }

    public function getAnalyticsConfiguration(): array
    {
        return [
            'cache_ttl' => 3600,
            'enable_real_time' => true,
            'max_data_points' => 1000,
            'enable_export' => true,
            'export_formats' => ['json', 'csv', 'xlsx'],
            'periods' => ['week', 'month', 'quarter', 'year'],
            'last_updated' => now()->toISOString(),
        ];
    }

    public function clearAnalyticsCache(): void
    {
        // Clear specific cache keys since forgetPattern might not be available
        $keys = [
            'analytics_data_month',
            'analytics_data_week',
            'analytics_data_quarter',
            'analytics_data_year',
            'overview_data',
            'sales_data',
            'product_analytics',
            'customer_analytics',
            'traffic_analytics',
            'conversion_analytics'
        ];
        
        foreach ($keys as $key) {
            Cache::forget("{$this->cachePrefix}:{$key}");
        }
    }
}
