<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WishlistController;
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\SeoController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\PerformanceController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\InventoryController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Public routes (no authentication required)
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::get('/products/search', [ProductController::class, 'search']);
Route::get('/products/category/{categoryId}', [ProductController::class, 'getByCategory']);

// Search analytics and suggestions
Route::get('/search/analytics', [App\Http\Controllers\Api\SearchAnalyticsController::class, 'getAnalytics']);
Route::get('/search/suggestions', [App\Http\Controllers\Api\SearchAnalyticsController::class, 'getSuggestions']);
Route::post('/search/track', [App\Http\Controllers\Api\SearchAnalyticsController::class, 'trackSearch']);
Route::get('/products/brand/{brandId}', [ProductController::class, 'getByBrand']);
Route::get('/products/{productId}/related', [ProductController::class, 'getRelatedProducts']);
Route::get('/products/{productId}/reviews', [ReviewController::class, 'index']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{slug}', [CategoryController::class, 'show']);
Route::get('/categories/{slug}/products', [CategoryController::class, 'getProducts']);

Route::get('/brands', [BrandController::class, 'index']);
Route::get('/brands/{slug}', [BrandController::class, 'show']);
Route::get('/brands/{slug}/products', [BrandController::class, 'getProducts']);

// SEO routes (public)
Route::get('/seo/meta-tags', [SeoController::class, 'getMetaTags']);
Route::get('/seo/product/{id}/structured-data', [SeoController::class, 'getProductStructuredData']);
Route::get('/seo/organization/structured-data', [SeoController::class, 'getOrganizationStructuredData']);
Route::get('/seo/breadcrumbs/structured-data', [SeoController::class, 'getBreadcrumbStructuredData']);
Route::get('/seo/faq/structured-data', [SeoController::class, 'getFaqStructuredData']);
Route::get('/seo/sitemap', [SeoController::class, 'generateSitemap']);
Route::get('/seo/robots.txt', [SeoController::class, 'generateRobotsTxt']);
Route::get('/seo/stats', [SeoController::class, 'getSeoStats']);

// Analytics routes (public)
Route::get('/analytics/test', [AnalyticsController::class, 'test']);
Route::get('/analytics', [AnalyticsController::class, 'getAnalyticsData']);
Route::get('/analytics/overview', [AnalyticsController::class, 'getOverview']);
Route::get('/analytics/sales', [AnalyticsController::class, 'getSalesAnalytics']);
Route::get('/analytics/products', [AnalyticsController::class, 'getProductAnalytics']);
Route::get('/analytics/customers', [AnalyticsController::class, 'getCustomerAnalytics']);
Route::get('/analytics/traffic', [AnalyticsController::class, 'getTrafficAnalytics']);
Route::get('/analytics/conversion', [AnalyticsController::class, 'getConversionAnalytics']);
Route::get('/analytics/real-time', [AnalyticsController::class, 'getRealTimeAnalytics']);
Route::get('/analytics/export', [AnalyticsController::class, 'exportAnalytics']);
Route::get('/analytics/config', [AnalyticsController::class, 'getAnalyticsConfig']);

// Performance routes (public)
Route::get('/performance/overview', [PerformanceController::class, 'overview']);
Route::get('/performance/stats', [PerformanceController::class, 'stats']);
Route::get('/performance/cache-stats', [PerformanceController::class, 'cacheStats']);
Route::get('/performance/memory-usage', [PerformanceController::class, 'memoryUsage']);
Route::get('/performance/real-time', [PerformanceController::class, 'realTime']);
Route::get('/performance/recommendations', [PerformanceController::class, 'recommendations']);

// Authentication routes
Route::post('/auth/register', [UserController::class, 'register']);
Route::post('/auth/login', [UserController::class, 'login']);
Route::post('/auth/logout', [UserController::class, 'logout'])->middleware('auth:sanctum');
Route::post('/auth/refresh', [UserController::class, 'refresh'])->middleware('auth:sanctum');
Route::post('/auth/forgot-password', [UserController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [UserController::class, 'resetPassword']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // User profile and settings
    Route::get('/user/profile', [UserController::class, 'profile']);
    Route::put('/user/profile', [UserController::class, 'updateProfile']);
    Route::put('/user/password', [UserController::class, 'updatePassword']);
    Route::delete('/user/account', [UserController::class, 'deleteAccount']);

    // Reviews
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::put('/reviews/{id}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);
    Route::post('/reviews/{id}/helpful', [ReviewController::class, 'markHelpful']);
    Route::post('/reviews/{id}/unhelpful', [ReviewController::class, 'markUnhelpful']);
    Route::get('/user/reviews', [ReviewController::class, 'userReviews']);

    // Cart
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/add', [CartController::class, 'addItem']);
    Route::put('/cart/{id}', [CartController::class, 'updateItem']);
    Route::delete('/cart/{id}', [CartController::class, 'removeItem']);
    Route::delete('/cart/clear', [CartController::class, 'clearCart']);

    // Wishlist
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist/add', [WishlistController::class, 'addItem']);
    Route::delete('/wishlist/{id}', [WishlistController::class, 'removeItem']);
    Route::delete('/wishlist/clear', [WishlistController::class, 'clearWishlist']);

    // Addresses
    Route::get('/addresses', [AddressController::class, 'index']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::get('/addresses/{id}', [AddressController::class, 'show']);
    Route::put('/addresses/{id}', [AddressController::class, 'update']);
    Route::delete('/addresses/{id}', [AddressController::class, 'destroy']);
    Route::patch('/addresses/{id}/default', [AddressController::class, 'setDefault']);

    // Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::put('/orders/{id}/cancel', [OrderController::class, 'cancel']);
    Route::post('/orders/{id}/payment', [OrderController::class, 'processPayment']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::patch('/notifications/{id}/unread', [NotificationController::class, 'markAsUnread']);
    Route::patch('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
    Route::delete('/notifications/clear-read', [NotificationController::class, 'clearRead']);
    Route::get('/notifications/preferences', [NotificationController::class, 'preferences']);
    Route::put('/notifications/preferences', [NotificationController::class, 'updatePreferences']);

    // SEO cache management
    Route::post('/seo/cache/clear', [SeoController::class, 'clearSeoCache']);
    
    // Analytics cache management
    Route::post('/analytics/cache/clear', [AnalyticsController::class, 'clearAnalyticsCache']);
    
    // Performance management
    Route::post('/performance/clear-cache', [PerformanceController::class, 'clearCache']);
    Route::post('/performance/warm-up-cache', [PerformanceController::class, 'warmUpCache']);
    Route::post('/performance/clear-old-data', [PerformanceController::class, 'clearOldData']);
});

// Inventory management (temporary - for testing)
Route::get('/inventory/summary', [InventoryController::class, 'summary']);
Route::get('/inventory/low-stock', [InventoryController::class, 'lowStock']);
Route::get('/inventory/expiring', [InventoryController::class, 'expiring']);
Route::get('/inventory/alerts', [InventoryController::class, 'alerts']);
Route::get('/inventory/transactions', [InventoryController::class, 'transactions']);
Route::get('/inventory/suppliers', [InventoryController::class, 'suppliers']);
Route::get('/inventory/purchase-orders', [InventoryController::class, 'purchaseOrders']);

// Admin routes (require admin middleware)
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    // Dashboard statistics
    Route::get('/dashboard/stats', [App\Http\Controllers\Api\AdminController::class, 'dashboardStats']);
    
    // Products management
    Route::get('/products', [ProductController::class, 'adminIndex']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
    Route::post('/products/{id}/images', [ProductController::class, 'uploadImages']);
    Route::delete('/products/{id}/images/{imageId}', [ProductController::class, 'deleteImage']);

    // Categories management
    Route::get('/categories', [CategoryController::class, 'adminIndex']);
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

    // Brands management
    Route::get('/brands', [BrandController::class, 'adminIndex']);
    Route::post('/brands', [BrandController::class, 'store']);
    Route::put('/brands/{id}', [BrandController::class, 'update']);
    Route::delete('/brands/{id}', [BrandController::class, 'destroy']);

    // Reviews management
    Route::get('/reviews', [ReviewController::class, 'adminIndex']);
    Route::put('/reviews/{id}/approve', [ReviewController::class, 'approve']);
    Route::put('/reviews/{id}/reject', [ReviewController::class, 'reject']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'adminDestroy']);

    // Orders management
    Route::get('/orders', [OrderController::class, 'adminIndex']);
    Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
    Route::put('/orders/{id}/shipping', [OrderController::class, 'updateShipping']);

    // Users management
    Route::get('/users', [UserController::class, 'adminIndex']);
    Route::put('/users/{id}/role', [UserController::class, 'updateRole']);
    Route::put('/users/{id}/status', [UserController::class, 'updateStatus']);

    // Inventory management
    // Route::get('/inventory/summary', [InventoryController::class, 'summary']);
    // Route::get('/inventory/low-stock', [InventoryController::class, 'lowStock']);
    // Route::get('/inventory/expiring', [InventoryController::class, 'expiring']);
    // Route::get('/inventory/alerts', [InventoryController::class, 'alerts']);
    // Route::patch('/inventory/alerts/{id}/acknowledge', [InventoryController::class, 'acknowledgeAlert']);
    // Route::patch('/inventory/alerts/{id}/resolve', [InventoryController::class, 'resolveAlert']);
    // Route::get('/inventory/transactions', [InventoryController::class, 'transactions']);
    // Route::put('/inventory/products/{id}/stock', [InventoryController::class, 'updateStock']);
    // Route::post('/inventory/check-alerts', [InventoryController::class, 'checkAlerts']);
    // Route::post('/inventory/generate-purchase-orders', [InventoryController::class, 'generatePurchaseOrders']);
    // Route::get('/inventory/suppliers', [InventoryController::class, 'suppliers']);
    // Route::get('/inventory/purchase-orders', [InventoryController::class, 'purchaseOrders']);
});
