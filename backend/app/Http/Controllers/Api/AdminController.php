<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Order;
use App\Models\User;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminController extends Controller
{
    /**
     * Get admin dashboard statistics
     */
    public function dashboardStats(): JsonResponse
    {
        try {
            // Get current month and last month dates
            $currentMonth = Carbon::now()->startOfMonth();
            $lastMonth = Carbon::now()->subMonth()->startOfMonth();

            // Total counts
            $totalProducts = Product::count();
            $totalOrders = Order::count();
            $totalUsers = User::count();
            $totalReviews = Review::count();

            // Current month stats
            $currentMonthOrders = Order::where('created_at', '>=', $currentMonth)->count();
            $currentMonthRevenue = Order::where('created_at', '>=', $currentMonth)
                ->where('payment_status', 'paid')
                ->sum('total');
            $currentMonthUsers = User::where('created_at', '>=', $currentMonth)->count();

            // Last month stats for comparison
            $lastMonthOrders = Order::where('created_at', '>=', $lastMonth)
                ->where('created_at', '<', $currentMonth)
                ->count();
            $lastMonthRevenue = Order::where('created_at', '>=', $lastMonth)
                ->where('created_at', '<', $currentMonth)
                ->where('payment_status', 'paid')
                ->sum('total');
            $lastMonthUsers = User::where('created_at', '>=', $lastMonth)
                ->where('created_at', '<', $currentMonth)
                ->count();

            // Calculate percentage changes
            $orderChange = $lastMonthOrders > 0 
                ? round((($currentMonthOrders - $lastMonthOrders) / $lastMonthOrders) * 100, 1)
                : 0;
            $revenueChange = $lastMonthRevenue > 0 
                ? round((($currentMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 1)
                : 0;
            $userChange = $lastMonthUsers > 0 
                ? round((($currentMonthUsers - $lastMonthUsers) / $lastMonthUsers) * 100, 1)
                : 0;

            // Recent activity
            $recentOrders = Order::with(['user', 'items.product'])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($order) {
                    return [
                        'id' => $order->id,
                        'order_number' => $order->order_number,
                        'user_name' => $order->user->name ?? 'Guest',
                        'total' => $order->total,
                        'status' => $order->status,
                        'created_at' => $order->created_at,
                    ];
                });

            // Top selling products
            $topProducts = DB::table('order_items')
                ->join('products', 'order_items.product_id', '=', 'products.id')
                ->select('products.id', 'products.name', 'products.slug', DB::raw('SUM(order_items.quantity) as total_sold'))
                ->groupBy('products.id', 'products.name', 'products.slug')
                ->orderBy('total_sold', 'desc')
                ->limit(5)
                ->get();

            // Order status distribution
            $orderStatusDistribution = Order::select('status', DB::raw('count(*) as count'))
                ->groupBy('status')
                ->get()
                ->pluck('count', 'status')
                ->toArray();

            $stats = [
                'overview' => [
                    'total_products' => $totalProducts,
                    'total_orders' => $totalOrders,
                    'total_users' => $totalUsers,
                    'total_reviews' => $totalReviews,
                ],
                'current_month' => [
                    'orders' => $currentMonthOrders,
                    'revenue' => round($currentMonthRevenue, 2),
                    'users' => $currentMonthUsers,
                ],
                'changes' => [
                    'orders' => [
                        'value' => $orderChange,
                        'type' => $orderChange >= 0 ? 'increase' : 'decrease',
                    ],
                    'revenue' => [
                        'value' => $revenueChange,
                        'type' => $revenueChange >= 0 ? 'increase' : 'decrease',
                    ],
                    'users' => [
                        'value' => $userChange,
                        'type' => $userChange >= 0 ? 'increase' : 'decrease',
                    ],
                ],
                'recent_orders' => $recentOrders,
                'top_products' => $topProducts,
                'order_status_distribution' => $orderStatusDistribution,
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Dashboard statistics retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve dashboard statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
