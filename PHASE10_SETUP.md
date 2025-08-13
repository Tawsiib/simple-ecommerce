# Phase 10: Performance & Optimization Setup Guide

## Overview
Phase 10 implements comprehensive performance monitoring, intelligent caching strategies, and optimization features to ensure the e-commerce application runs efficiently and provides excellent user experience.

## Features Implemented

### 1. Backend Performance Services
- **CacheService**: Intelligent caching with automatic invalidation
- **PerformanceService**: Real-time performance monitoring and metrics
- **PerformanceMiddleware**: Automatic performance tracking for all requests

### 2. Admin Performance Dashboard
- Performance overview with key metrics
- Real-time charts for response time and database queries
- Memory usage monitoring
- Cache management and optimization tools
- Performance recommendations and alerts

### 3. Cache Management
- Redis/database/file caching support
- Automatic cache invalidation
- Cache warming for frequently accessed data
- Cache hit rate monitoring

### 4. Performance Monitoring
- Response time tracking
- Database query analysis
- Memory usage monitoring
- Slow query detection
- Performance recommendations

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
composer require predis/predis
```

### 2. Configure Cache Driver
Update `.env` file:
```env
CACHE_DRIVER=redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
REDIS_DB=0
```

### 3. Configure Queue (for background jobs)
Update `.env` file:
```env
QUEUE_CONNECTION=redis
```

### 4. Run Migrations
```bash
php artisan migrate
```

### 5. Register Middleware
Add to `app/Http/Kernel.php` in the `$middleware` array:
```php
\App\Http\Middleware\PerformanceMiddleware::class,
```

### 6. Register Commands
Add to `app/Console/Kernel.php` in the `$commands` array:
```php
\App\Console\Commands\WarmUpCache::class,
\App\Console\Commands\ClearPerformanceData::class,
```

### 7. Schedule Commands (Optional)
Add to `app/Console/Kernel.php` in the `schedule` method:
```php
// Warm up cache every hour
$schedule->command('cache:warm-up')->hourly();

// Clear old performance data weekly
$schedule->command('performance:clear --days=7')->weekly();
```

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install recharts
```

### 2. Environment Configuration
Update `.env.local`:
```env
NEXT_PUBLIC_PERFORMANCE_MONITORING=true
NEXT_PUBLIC_CACHE_ENABLED=true
```

## Usage

### 1. Cache Management

#### Warm Up Cache
```bash
php artisan cache:warm-up
```

#### Clear Specific Cache
```bash
# Clear all cache
php artisan cache:clear

# Clear specific cache types via API
POST /api/admin/performance/clear-cache
{
    "type": "product",
    "id": 123
}
```

#### Cache Warming
The system automatically warms up cache for:
- Featured products
- Popular categories
- Popular brands
- Search suggestions
- Dashboard data

### 2. Performance Monitoring

#### View Performance Dashboard
Navigate to `/admin/performance` in the admin panel.

#### Monitor Key Metrics
- **Response Time**: Average response time per request
- **Database Queries**: Number of queries per request
- **Memory Usage**: Current and peak memory consumption
- **Cache Hit Rate**: Percentage of cache hits vs misses
- **Slow Request Rate**: Percentage of slow requests

#### Performance Recommendations
The system automatically provides recommendations for:
- Slow response times
- High query counts
- Memory usage optimization
- Cache efficiency improvements

### 3. API Endpoints

#### Performance Overview
```
GET /api/admin/performance/overview
```

#### Performance Statistics
```
GET /api/admin/performance/stats?period=today&date=2024-01-20
```

#### Cache Statistics
```
GET /api/admin/performance/cache-stats
```

#### Memory Usage
```
GET /api/admin/performance/memory-usage
```

#### Clear Cache
```
POST /api/admin/performance/clear-cache
{
    "type": "all|product|category|brand|search|dashboard",
    "id": 123
}
```

#### Warm Up Cache
```
POST /api/admin/performance/warm-up-cache
```

## Configuration Options

### 1. Cache Configuration
Update `config/cache.php`:
```php
'default' => env('CACHE_DRIVER', 'redis'),

'stores' => [
    'redis' => [
        'driver' => 'redis',
        'connection' => 'cache',
        'lock_connection' => 'default',
    ],
],
```

### 2. Performance Thresholds
Update `app/Services/PerformanceService.php`:
```php
protected $thresholds = [
    'slow_query' => 100,        // 100ms
    'memory_warning' => 50 * 1024 * 1024,  // 50MB
    'response_warning' => 1000, // 1 second
];
```

### 3. Cache TTL Settings
Update `app/Services/CacheService.php`:
```php
protected $defaultTtl = 3600; // 1 hour

// Specific TTLs
'featured_products' => 1800,    // 30 minutes
'popular_categories' => 3600,   // 1 hour
'search_suggestions' => 7200,   // 2 hours
'dashboard_stats' => 900,       // 15 minutes
```

## Monitoring and Alerts

### 1. Performance Alerts
The system automatically logs warnings for:
- Response times > 1 second
- Memory usage > 100MB
- Slow queries > 100ms
- High error rates > 5%

### 2. Cache Alerts
- Low cache hit rates
- Cache memory usage
- Cache connection issues

### 3. Log Files
Check these log files for performance issues:
```bash
tail -f storage/logs/laravel.log
tail -f storage/logs/performance.log
```

## Optimization Tips

### 1. Database Optimization
- Use eager loading for relationships
- Implement database indexing
- Monitor slow query logs
- Use database connection pooling

### 2. Cache Optimization
- Set appropriate TTL values
- Use cache tags for invalidation
- Implement cache warming strategies
- Monitor cache hit rates

### 3. Application Optimization
- Use queue jobs for heavy operations
- Implement lazy loading
- Optimize image sizes
- Use CDN for static assets

## Troubleshooting

### 1. Cache Issues
```bash
# Check Redis connection
redis-cli ping

# Clear all cache
php artisan cache:clear

# Check cache configuration
php artisan config:cache
```

### 2. Performance Issues
```bash
# Check performance logs
tail -f storage/logs/laravel.log | grep "Performance"

# Monitor memory usage
php artisan tinker
memory_get_usage(true)
```

### 3. Common Issues

#### High Memory Usage
- Check for memory leaks in code
- Optimize image processing
- Use pagination for large datasets
- Implement garbage collection

#### Slow Response Times
- Enable query logging
- Check database indexes
- Optimize database queries
- Use caching for expensive operations

#### Low Cache Hit Rate
- Review cache TTL settings
- Implement cache warming
- Check cache invalidation logic
- Monitor cache memory usage

## Security Considerations

### 1. Cache Security
- Sanitize cache keys
- Implement cache access controls
- Monitor cache usage patterns
- Use secure cache connections

### 2. Performance Data Security
- Restrict access to performance endpoints
- Sanitize performance logs
- Implement rate limiting
- Monitor for abuse

### 3. Memory Security
- Set memory limits
- Monitor memory usage
- Implement memory cleanup
- Use secure memory allocation

## Testing

### 1. Performance Testing
```bash
# Test cache functionality
php artisan cache:warm-up
php artisan cache:clear

# Test performance monitoring
php artisan tinker
app(\App\Services\PerformanceService::class)->getStats()
```

### 2. Load Testing
Use tools like Apache Bench or Artillery:
```bash
# Test homepage performance
ab -n 100 -c 10 http://localhost:8000/

# Test API endpoints
ab -n 100 -c 10 -H "Authorization: Bearer {token}" http://localhost:8000/api/products
```

## Next Steps

After implementing Phase 10, consider:

1. **CDN Integration**: Implement CDN for static assets
2. **Image Optimization**: Add image compression and WebP support
3. **Database Optimization**: Implement read replicas and connection pooling
4. **Monitoring Tools**: Integrate with external monitoring services
5. **Performance Budgets**: Set and enforce performance budgets
6. **A/B Testing**: Implement performance A/B testing
7. **User Experience Monitoring**: Add Real User Monitoring (RUM)

## Support

For issues or questions:
1. Check the Laravel documentation
2. Review performance logs
3. Monitor system resources
4. Test in development environment
5. Consult performance optimization guides

## Notes

- Performance monitoring adds minimal overhead
- Cache warming improves initial page load times
- Regular cache maintenance prevents memory issues
- Monitor performance metrics during peak usage
- Adjust thresholds based on your application needs
