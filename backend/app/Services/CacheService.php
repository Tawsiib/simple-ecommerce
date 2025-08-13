<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Order;
use App\Models\User;

class CacheService
{
    protected $defaultTtl = 3600; // 1 hour
    protected $cachePrefix = 'app';
    
    protected $ttlSettings = [
        'featured_products' => 1800,    // 30 minutes
        'popular_categories' => 3600,   // 1 hour
        'search_suggestions' => 7200,   // 2 hours
        'dashboard_stats' => 900,       // 15 minutes
        'product_details' => 1800,      // 30 minutes
        'category_products' => 3600,    // 1 hour
        'brand_products' => 3600,       // 1 hour
        'user_preferences' => 86400,    // 24 hours
        'seo_meta' => 7200,            // 2 hours
        'analytics_data' => 1800,      // 30 minutes
    ];

    public function get(string $key, $default = null)
    {
        try {
            $fullKey = "{$this->cachePrefix}:{$key}";
            return Cache::get($fullKey, $default);
        } catch (\Exception $e) {
            Log::error("Cache get error: {$e->getMessage()}", ['key' => $key]);
            return $default;
        }
    }

    public function put(string $key, $value, int $ttl = null): bool
    {
        try {
            $fullKey = "{$this->cachePrefix}:{$key}";
            $ttl = $ttl ?? $this->getTtlForKey($key);
            return Cache::put($fullKey, $value, $ttl);
        } catch (\Exception $e) {
            Log::error("Cache put error: {$e->getMessage()}", ['key' => $key]);
            return false;
        }
    }

    public function remember(string $key, $callback, int $ttl = null)
    {
        try {
            $fullKey = "{$this->cachePrefix}:{$key}";
            $ttl = $ttl ?? $this->getTtlForKey($key);
            return Cache::remember($fullKey, $ttl, $callback);
        } catch (\Exception $e) {
            Log::error("Cache remember error: {$e->getMessage()}", ['key' => $key]);
            return $callback();
        }
    }

    public function forget(string $key): bool
    {
        try {
            $fullKey = "{$this->cachePrefix}:{$key}";
            return Cache::forget($fullKey);
        } catch (\Exception $e) {
            Log::error("Cache forget error: {$e->getMessage()}", ['key' => $key]);
            return false;
        }
    }

    public function flush(): bool
    {
        try {
            return Cache::flush();
        } catch (\Exception $e) {
            Log::error("Cache flush error: {$e->getMessage()}");
            return false;
        }
    }

    public function has(string $key): bool
    {
        try {
            $fullKey = "{$this->cachePrefix}:{$key}";
            return Cache::has($fullKey);
        } catch (\Exception $e) {
            Log::error("Cache has error: {$e->getMessage()}", ['key' => $key]);
            return false;
        }
    }

    public function tags(array $names): \Illuminate\Cache\TaggedCache
    {
        try {
            return Cache::tags($names);
        } catch (\Exception $e) {
            Log::error("Cache tags error: {$e->getMessage()}", ['tags' => $names]);
            throw $e;
        }
    }

    public function getTtlForKey(string $key): int
    {
        foreach ($this->ttlSettings as $pattern => $ttl) {
            if (str_contains($key, $pattern)) {
                return $ttl;
            }
        }
        return $this->defaultTtl;
    }

    public function warmUpCache(): array
    {
        $results = [
            'featured_products' => $this->warmUpFeaturedProducts(),
            'popular_categories' => $this->warmUpPopularCategories(),
            'popular_brands' => $this->warmUpPopularBrands(),
            'search_suggestions' => $this->warmUpSearchSuggestions(),
            'dashboard_stats' => $this->warmUpDashboardStats(),
        ];

        Log::info('Cache warming completed', $results);
        return $results;
    }

    protected function warmUpFeaturedProducts(): bool
    {
        try {
            $products = Product::where('is_active', true)
                ->where('is_featured', true)
                ->with(['category', 'brand'])
                ->take(20)
                ->get();

            $this->put('featured_products', $products);
            return true;
        } catch (\Exception $e) {
            Log::error("Failed to warm up featured products: {$e->getMessage()}");
            return false;
        }
    }

    protected function warmUpPopularCategories(): bool
    {
        try {
            $categories = Category::where('is_active', true)
                ->withCount('products')
                ->orderBy('products_count', 'desc')
                ->take(10)
                ->get();

            $this->put('popular_categories', $categories);
            return true;
        } catch (\Exception $e) {
            Log::error("Failed to warm up popular categories: {$e->getMessage()}");
            return false;
        }
    }

    protected function warmUpPopularBrands(): bool
    {
        try {
            $brands = Brand::where('is_active', true)
                ->withCount('products')
                ->orderBy('products_count', 'desc')
                ->take(10)
                ->get();

            $this->put('popular_brands', $brands);
            return true;
        } catch (\Exception $e) {
            Log::error("Failed to warm up popular brands: {$e->getMessage()}");
            return false;
        }
    }

    protected function warmUpSearchSuggestions(): bool
    {
        try {
            $suggestions = [
                'products' => Product::where('is_active', true)
                    ->pluck('name')
                    ->take(100)
                    ->toArray(),
                'categories' => Category::where('is_active', true)
                    ->pluck('name')
                    ->toArray(),
                'brands' => Brand::where('is_active', true)
                    ->pluck('name')
                    ->toArray(),
            ];

            $this->put('search_suggestions', $suggestions);
            return true;
        } catch (\Exception $e) {
            Log::error("Failed to warm up search suggestions: {$e->getMessage()}");
            return false;
        }
    }

    protected function warmUpDashboardStats(): bool
    {
        try {
            $stats = [
                'total_products' => Product::count(),
                'total_orders' => Order::count(),
                'total_customers' => User::count(),
                'active_products' => Product::where('is_active', true)->count(),
                'low_stock_products' => Product::where('stock', '<=', 'min_stock')->count(),
            ];

            $this->put('dashboard_stats', $stats);
            return true;
        } catch (\Exception $e) {
            Log::error("Failed to warm up dashboard stats: {$e->getMessage()}");
            return false;
        }
    }

    public function clearCacheByType(string $type, $id = null): bool
    {
        try {
            switch ($type) {
                case 'product':
                    $this->clearProductCache($id);
                    break;
                case 'category':
                    $this->clearCategoryCache($id);
                    break;
                case 'brand':
                    $this->clearBrandCache($id);
                    break;
                case 'search':
                    $this->clearSearchCache();
                    break;
                case 'dashboard':
                    $this->clearDashboardCache();
                    break;
                case 'all':
                    $this->flush();
                    break;
                default:
                    Log::warning("Unknown cache type: {$type}");
                    return false;
            }
            return true;
        } catch (\Exception $e) {
            Log::error("Failed to clear cache by type: {$e->getMessage()}", ['type' => $type, 'id' => $id]);
            return false;
        }
    }

    protected function clearProductCache($id = null): void
    {
        if ($id) {
            $this->forget("product_details_{$id}");
            $this->forget("product_reviews_{$id}");
        }
        $this->forget('featured_products');
        $this->forget('search_suggestions');
        $this->forget('dashboard_stats');
    }

    protected function clearCategoryCache($id = null): void
    {
        if ($id) {
            $this->forget("category_products_{$id}");
        }
        $this->forget('popular_categories');
        $this->forget('search_suggestions');
        $this->forget('dashboard_stats');
    }

    protected function clearBrandCache($id = null): void
    {
        if ($id) {
            $this->forget("brand_products_{$id}");
        }
        $this->forget('popular_brands');
        $this->forget('search_suggestions');
        $this->forget('dashboard_stats');
    }

    protected function clearSearchCache(): void
    {
        $this->forget('search_suggestions');
        $this->forget('search_results');
    }

    protected function clearDashboardCache(): void
    {
        $this->forget('dashboard_stats');
        $this->forget('analytics_data');
    }

    public function getCacheStats(): array
    {
        try {
            $driver = config('cache.default');
            
            if ($driver === 'redis') {
                try {
                    $redis = app('redis');
                    $info = $redis->info();
                    
                    return [
                        'driver' => $driver,
                        'memory_used' => $info['used_memory_human'] ?? 'Unknown',
                        'memory_peak' => $info['used_memory_peak_human'] ?? 'Unknown',
                        'keyspace_hits' => $info['keyspace_hits'] ?? 0,
                        'keyspace_misses' => $info['keyspace_misses'] ?? 0,
                        'hit_rate' => $this->calculateHitRate($info),
                    ];
                } catch (\Exception $e) {
                    return [
                        'driver' => $driver,
                        'status' => 'Redis connection failed',
                        'error' => $e->getMessage(),
                    ];
                }
            }
            
            return [
                'driver' => $driver,
                'status' => 'Stats not available for this driver',
            ];
        } catch (\Exception $e) {
            Log::error("Failed to get cache stats: {$e->getMessage()}");
            return ['error' => $e->getMessage()];
        }
    }

    protected function calculateHitRate(array $info): float
    {
        $hits = $info['keyspace_hits'] ?? 0;
        $misses = $info['keyspace_misses'] ?? 0;
        $total = $hits + $misses;
        
        return $total > 0 ? round(($hits / $total) * 100, 2) : 0;
    }
}
