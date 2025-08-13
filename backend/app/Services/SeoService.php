<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;

class SeoService
{
    protected $cachePrefix = 'seo';

    public function generateMetaTags(string $type, $model = null, array $custom = []): array
    {
        $baseTags = $this->getBaseMetaTags();
        
        switch ($type) {
            case 'home':
                return $this->getHomeMetaTags($baseTags);
            case 'product':
                return $this->getProductMetaTags($model, $baseTags, $custom);
            case 'category':
                return $this->getCategoryMetaTags($model, $baseTags, $custom);
            case 'brand':
                return $this->getBrandMetaTags($model, $baseTags, $custom);
            case 'search':
                return $this->getSearchMetaTags($baseTags, $custom);
            default:
                return $baseTags;
        }
    }

    protected function getBaseMetaTags(): array
    {
        return [
            'title' => 'Shohanis Reflection - Premium Beauty & Skincare Products',
            'description' => 'Discover premium beauty and skincare products at Shohanis Reflection. Shop the latest trends in cosmetics, skincare, and beauty essentials.',
            'keywords' => 'beauty, skincare, cosmetics, makeup, beauty products, skincare products',
            'og_type' => 'website',
            'og_site_name' => 'Shohanis Reflection',
            'twitter_card' => 'summary_large_image',
            'twitter_site' => '@shohanisreflection',
            'robots' => 'index, follow',
            'language' => 'en',
            'author' => 'Shohanis Reflection',
        ];
    }

    protected function getHomeMetaTags(array $baseTags): array
    {
        return array_merge($baseTags, [
            'title' => 'Shohanis Reflection - Premium Beauty & Skincare Products',
            'description' => 'Your one-stop destination for premium beauty and skincare products. Shop the latest trends in cosmetics, makeup, and beauty essentials.',
            'keywords' => 'beauty products, skincare, cosmetics, makeup, beauty essentials, premium beauty',
        ]);
    }

    protected function getProductMetaTags($product, array $baseTags, array $custom): array
    {
        if (!$product) return $baseTags;

        $description = $this->truncateDescription($product->description ?? '', 160);
        $keywords = $this->generateProductKeywords($product);

        return array_merge($baseTags, [
            'title' => "{$product->name} - Shohanis Reflection",
            'description' => $description,
            'keywords' => $keywords,
            'og_title' => $product->name,
            'og_description' => $description,
            'og_image' => $product->featured_image ?? '/images/default-product.jpg',
            'og_url' => url("/products/{$product->slug}"),
            'canonical_url' => url("/products/{$product->slug}"),
        ]);
    }

    protected function getCategoryMetaTags($category, array $baseTags, array $custom): array
    {
        if (!$category) return $baseTags;

        $description = $this->truncateDescription($category->description ?? '', 160);

        return array_merge($baseTags, [
            'title' => "{$category->name} Products - Shohanis Reflection",
            'description' => $description,
            'keywords' => "{$category->name}, beauty products, skincare, cosmetics",
            'og_title' => "{$category->name} Products",
            'og_description' => $description,
            'og_url' => url("/categories/{$category->slug}"),
            'canonical_url' => url("/categories/{$category->slug}"),
        ]);
    }

    protected function getBrandMetaTags($brand, array $baseTags, array $custom): array
    {
        if (!$brand) return $baseTags;

        $description = $this->truncateDescription($brand->description ?? '', 160);

        return array_merge($baseTags, [
            'title' => "{$brand->name} Products - Shohanis Reflection",
            'description' => $description,
            'keywords' => "{$brand->name}, beauty products, skincare, cosmetics",
            'og_title' => "{$brand->name} Products",
            'og_description' => $description,
            'og_url' => url("/brands/{$brand->slug}"),
            'canonical_url' => url("/brands/{$brand->slug}"),
        ]);
    }

    protected function getSearchMetaTags(array $baseTags, array $custom): array
    {
        $query = $custom['query'] ?? '';
        
        return array_merge($baseTags, [
            'title' => "Search Results for '{$query}' - Shohanis Reflection",
            'description' => "Find the best beauty and skincare products for '{$query}' at Shohanis Reflection.",
            'keywords' => "{$query}, beauty products, skincare, cosmetics, search results",
            'robots' => 'noindex, follow', // Don't index search results
        ]);
    }

    public function generateProductStructuredData(Product $product): array
    {
        try {
            $data = [
                '@context' => 'https://schema.org',
                '@type' => 'Product',
                'name' => $product->name,
                'description' => $product->description,
                'sku' => $product->sku ?? $product->id,
                'brand' => [
                    '@type' => 'Brand',
                    'name' => $product->brand?->name ?? 'Shohanis Reflection'
                ],
                'category' => $product->category?->name ?? 'Beauty & Skincare',
                'offers' => [
                    '@type' => 'Offer',
                    'price' => $product->price,
                    'priceCurrency' => 'BDT',
                    'availability' => $product->stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                    'url' => url("/products/{$product->slug}")
                ]
            ];

            if ($product->featured_image) {
                $data['image'] = $product->featured_image;
            }

        if ($product->reviews_count > 0) {
            $data['aggregateRating'] = [
                '@type' => 'AggregateRating',
                'ratingValue' => $product->average_rating ?? 5.0,
                'reviewCount' => $product->reviews_count
            ];
        }

        return $data;
        } catch (\Exception $e) {
            // Return fallback data if there's an error
            return [
                '@context' => 'https://schema.org',
                '@type' => 'Product',
                'name' => $product->name ?? 'Product',
                'description' => 'Product details temporarily unavailable',
                'error' => 'Failed to load complete product data: ' . $e->getMessage()
            ];
        }
    }

    public function generateOrganizationStructuredData(): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'Organization',
            'name' => 'Shohanis Reflection',
            'url' => url('/'),
            'logo' => url('/images/logo.png'),
            'description' => 'Premium beauty and skincare products retailer',
            'address' => [
                '@type' => 'PostalAddress',
                'addressCountry' => 'BD',
                'addressLocality' => 'Dhaka'
            ],
            'contactPoint' => [
                '@type' => 'ContactPoint',
                'telephone' => '+880-XXX-XXX-XXX',
                'contactType' => 'customer service'
            ],
            'sameAs' => [
                'https://facebook.com/shohanisreflection',
                'https://instagram.com/shohanisreflection'
            ]
        ];
    }

    public function generateBreadcrumbStructuredData(array $breadcrumbs): array
    {
        $items = [];
        foreach ($breadcrumbs as $index => $breadcrumb) {
            $items[] = [
                '@type' => 'ListItem',
                'position' => $index + 1,
                'name' => $breadcrumb['name'],
                'item' => $breadcrumb['url'] ?? url('/')
            ];
        }

        return [
            '@context' => 'https://schema.org',
            '@type' => 'BreadcrumbList',
            'itemListElement' => $items
        ];
    }

    public function generateFaqStructuredData(array $faqs): array
    {
        $mainEntity = [];
        foreach ($faqs as $faq) {
            $mainEntity[] = [
                '@type' => 'Question',
                'name' => $faq['question'],
                'acceptedAnswer' => [
                    '@type' => 'Answer',
                    'text' => $faq['answer']
                ]
            ];
        }

        return [
            '@context' => 'https://schema.org',
            '@type' => 'FAQPage',
            'mainEntity' => $mainEntity
        ];
    }

    public function generateSitemapData(): array
    {
        try {
            $cacheKey = "{$this->cachePrefix}:sitemap_data";
            
            return Cache::remember($cacheKey, 3600, function () {
                return [
                    'pages' => $this->getStaticPages(),
                    'products' => $this->getProductPages(),
                    'categories' => $this->getCategoryPages(),
                    'brands' => $this->getBrandPages(),
                ];
            });
        } catch (\Exception $e) {
            // Fallback data if there's an error
            return [
                'pages' => $this->getStaticPages(),
                'products' => [],
                'categories' => [],
                'brands' => [],
                'error' => 'Failed to load dynamic sitemap data: ' . $e->getMessage()
            ];
        }
    }

    protected function getStaticPages(): array
    {
        return [
            ['url' => '/', 'priority' => '1.0', 'changefreq' => 'daily'],
            ['url' => '/about', 'priority' => '0.8', 'changefreq' => 'monthly'],
            ['url' => '/contact', 'priority' => '0.8', 'changefreq' => 'monthly'],
            ['url' => '/products', 'priority' => '0.9', 'changefreq' => 'daily'],
            ['url' => '/categories', 'priority' => '0.8', 'changefreq' => 'weekly'],
            ['url' => '/brands', 'priority' => '0.8', 'changefreq' => 'weekly'],
        ];
    }

    protected function getProductPages(): array
    {
        try {
            return Product::select('slug', 'updated_at')
                ->where('is_active', true)
                ->get()
                ->map(function ($product) {
                    return [
                        'url' => "/products/{$product->slug}",
                        'priority' => '0.7',
                        'changefreq' => 'weekly',
                        'lastmod' => $product->updated_at?->toISOString()
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            return [];
        }
    }

    protected function getCategoryPages(): array
    {
        try {
            return Category::select('slug', 'updated_at')
                ->where('is_active', true)
                ->get()
                ->map(function ($category) {
                    return [
                        'url' => "/categories/{$category->slug}",
                        'priority' => '0.6',
                        'changefreq' => 'weekly',
                        'lastmod' => $category->updated_at?->toISOString()
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            return [];
        }
    }

        protected function getBrandPages(): array
    {
        try {
            return Brand::select('slug', 'updated_at')
                ->where('is_active', true)
                ->get()
                ->map(function ($brand) {
                    return [
                        'url' => "/brands/{$brand->slug}",
                        'priority' => '0.6',
                        'changefreq' => 'weekly',
                        'lastmod' => $brand->updated_at?->toISOString()
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            return [];
        }
    }

    public function generateRobotsTxt(): string
    {
        $content = "User-agent: *\n";
        $content .= "Allow: /\n\n";
        $content .= "Disallow: /admin/\n";
        $content .= "Disallow: /api/\n";
        $content .= "Disallow: /storage/\n";
        $content .= "Disallow: /vendor/\n\n";
        $content .= "Sitemap: " . url('/sitemap.xml') . "\n";
        $content .= "Host: " . url('/') . "\n";
        
        return $content;
    }

    protected function truncateDescription(string $description, int $length): string
    {
        if (strlen($description) <= $length) {
            return $description;
        }
        
        return substr($description, 0, $length - 3) . '...';
    }

    protected function generateProductKeywords(Product $product): string
    {
        $keywords = [$product->name];
        
        if ($product->category) {
            $keywords[] = $product->category->name;
        }
        
        if ($product->brand) {
            $keywords[] = $product->brand->name;
        }
        
        $keywords[] = 'beauty products';
        $keywords[] = 'skincare';
        $keywords[] = 'cosmetics';
        
        return implode(', ', array_unique($keywords));
    }

    public function cacheSeoData(string $key, $data, int $ttl = 3600): void
    {
        Cache::put("{$this->cachePrefix}:{$key}", $data, $ttl);
    }

    public function getCachedSeoData(string $key)
    {
        return Cache::get("{$this->cachePrefix}:{$key}");
    }

    public function clearSeoCache(): void
    {
        // Clear specific cache keys since forgetPattern might not be available
        $keys = [
            'meta_tags',
            'sitemap_data',
            'structured_data'
        ];
        
        foreach ($keys as $key) {
            Cache::forget("{$this->cachePrefix}:{$key}");
        }
    }
}
