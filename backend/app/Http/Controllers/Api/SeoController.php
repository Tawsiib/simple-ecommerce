<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SeoService;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class SeoController extends Controller
{
    protected $seoService;

    public function __construct(SeoService $seoService)
    {
        $this->seoService = $seoService;
    }

    /**
     * Get meta tags for a specific page type
     */
    public function getMetaTags(Request $request)
    {
        $request->validate([
            'type' => 'required|string|in:home,product,category,brand,search',
            'id' => 'nullable|integer',
            'query' => 'nullable|string',
        ]);

        $type = $request->type;
        $model = null;
        $custom = [];

        switch ($type) {
            case 'product':
                if ($request->id) {
                    try {
                        $model = Product::find($request->id);
                        if (!$model) {
                            return response()->json([
                                'success' => false,
                                'message' => 'Product not found'
                            ], 404);
                        }
                    } catch (\Exception $e) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Database error: ' . $e->getMessage()
                        ], 500);
                    }
                }
                break;
            case 'category':
                if ($request->id) {
                    try {
                        $model = Category::find($request->id);
                        if (!$model) {
                            return response()->json([
                                'success' => false,
                                'message' => 'Category not found'
                            ], 404);
                        }
                    } catch (\Exception $e) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Database error: ' . $e->getMessage()
                        ], 500);
                    }
                }
                break;
            case 'brand':
                if ($request->id) {
                    try {
                        $model = Brand::find($request->id);
                        if (!$model) {
                            return response()->json([
                                'success' => false,
                                'message' => 'Brand not found'
                        ], 404);
                        }
                    } catch (\Exception $e) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Database error: ' . $e->getMessage()
                        ], 500);
                    }
                }
                break;
            case 'search':
                $custom['query'] = $request->query;
                break;
        }

        try {
            $metaTags = $this->seoService->generateMetaTags($type, $model, $custom);
            
            return response()->json([
                'success' => true,
                'data' => $metaTags,
                'message' => 'Meta tags generated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate meta tags: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get product structured data
     */
    public function getProductStructuredData($id)
    {
        try {
            $product = Product::find($id);
            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found'
                ], 404);
            }

            $structuredData = $this->seoService->generateProductStructuredData($product);
            
            return response()->json([
                'success' => true,
                'data' => $structuredData,
                'message' => 'Product structured data generated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate product structured data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get organization structured data
     */
    public function getOrganizationStructuredData()
    {
        try {
            $structuredData = $this->seoService->generateOrganizationStructuredData();
            
            return response()->json([
                'success' => true,
                'data' => $structuredData,
                'message' => 'Organization structured data generated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate organization structured data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get breadcrumb structured data
     */
    public function getBreadcrumbStructuredData(Request $request)
    {
        // For GET requests, provide sample breadcrumbs if none provided
        $breadcrumbs = $request->input('breadcrumbs', [
            ['name' => 'Home', 'url' => '/'],
            ['name' => 'Products', 'url' => '/products']
        ]);

        try {
            $structuredData = $this->seoService->generateBreadcrumbStructuredData($breadcrumbs);
            
            return response()->json([
                'success' => true,
                'data' => $structuredData,
                'message' => 'Breadcrumb structured data generated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate breadcrumb structured data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get FAQ structured data
     */
    public function getFaqStructuredData(Request $request)
    {
        // For GET requests, provide sample FAQs if none provided
        $faqs = $request->input('faqs', [
            [
                'question' => 'What products do you offer?',
                'answer' => 'We offer a wide range of beauty and skincare products including cosmetics, makeup, and beauty essentials.'
            ],
            [
                'question' => 'How can I contact customer support?',
                'answer' => 'You can reach our customer support team through our contact form or by calling our support line.'
            ]
        ]);

        try {
            $structuredData = $this->seoService->generateFaqStructuredData($faqs);
            
            return response()->json([
                'success' => true,
                'data' => $structuredData,
                'message' => 'FAQ structured data generated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate FAQ structured data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate sitemap
     */
    public function generateSitemap()
    {
        try {
            $sitemapData = $this->seoService->generateSitemapData();
            
            return response()->json([
                'success' => true,
                'data' => $sitemapData,
                'message' => 'Sitemap generated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate sitemap: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate robots.txt
     */
    public function generateRobotsTxt()
    {
        try {
            $robotsContent = $this->seoService->generateRobotsTxt();
            
            return response($robotsContent, 200, [
                'Content-Type' => 'text/plain',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate robots.txt: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get SEO statistics
     */
    public function getSeoStats()
    {
        try {
            $sitemapData = $this->seoService->generateSitemapData();
            
            $stats = [
                'total_urls' => 0,
                'pages' => count($sitemapData['pages'] ?? []),
                'products' => count($sitemapData['products'] ?? []),
                'categories' => count($sitemapData['categories'] ?? []),
                'brands' => count($sitemapData['brands'] ?? []),
                'last_generated' => now()->toISOString(),
            ];
            
            $stats['total_urls'] = $stats['pages'] + $stats['products'] + $stats['categories'] + $stats['brands'];
            
            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'SEO statistics retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve SEO statistics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clear SEO cache (requires authentication)
     */
    public function clearSeoCache()
    {
        try {
            $this->seoService->clearSeoCache();
            
            return response()->json([
                'success' => true,
                'message' => 'SEO cache cleared successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear SEO cache: ' . $e->getMessage()
            ], 500);
        }
    }
}
