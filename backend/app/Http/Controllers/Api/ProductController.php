<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    /**
     * Get all products with pagination and filters
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'page' => 'nullable|integer|min:1',
                'per_page' => 'nullable|integer|min:1|max:100',
                'category_id' => 'nullable|integer|exists:categories,id',
                'brand_id' => 'nullable|integer|exists:brands,id',
                'min_price' => 'nullable|numeric|min:0',
                'max_price' => 'nullable|numeric|min:0',
                'sort_by' => 'nullable|string|in:name,price,created_at,rating',
                'sort_order' => 'nullable|string|in:asc,desc',
                'featured' => 'nullable|boolean',
                'bestseller' => 'nullable|boolean',
                'in_stock' => 'nullable|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $query = Product::with(['category', 'brand', 'media'])
                ->where('is_active', true);

            // Apply filters
            if ($request->has('category_id')) {
                $query->where('category_id', $request->category_id);
            }

            if ($request->has('brand_id')) {
                $query->where('brand_id', $request->brand_id);
            }

            if ($request->has('min_price')) {
                $query->where('price', '>=', $request->min_price);
            }

            if ($request->has('max_price')) {
                $query->where('price', '<=', $request->max_price);
            }

            if ($request->has('featured') && $request->featured) {
                $query->where('is_featured', true);
            }

            if ($request->has('bestseller') && $request->bestseller) {
                $query->where('is_bestseller', true);
            }

            if ($request->has('in_stock') && $request->in_stock) {
                $query->where('stock', '>', 0);
            }

            // Apply sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 20);
            $products = $query->paginate($perPage);

            // Transform products
            $products->getCollection()->transform(function ($product) {
                return $this->transformProduct($product);
            });

            return response()->json([
                'success' => true,
                'data' => $products,
                'message' => 'Products retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve products',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a single product by slug
     */
    public function show(string $slug): JsonResponse
    {
        try {
            $cacheKey = "product_{$slug}";
            
            $product = Cache::remember($cacheKey, 3600, function () use ($slug) {
                return Product::with([
                    'category', 
                    'brand', 
                    'media', 
                    'reviews' => function ($query) {
                        $query->approved()->with('user:id,name')->latest()->take(5);
                    }
                ])->where('slug', $slug)->first();
            });

            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found'
                ], 404);
            }

            // Increment view count
            $product->increment('views');

            // Get review statistics
            $reviewStats = $this->getProductReviewStats($product->id);

            $productData = $this->transformProduct($product);
            $productData['review_stats'] = $reviewStats;

            return response()->json([
                'success' => true,
                'data' => $productData,
                'message' => 'Product retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Advanced search products with comprehensive filtering and relevance scoring
     */
    public function search(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'q' => 'required|string|min:2',
                'page' => 'nullable|integer|min:1',
                'per_page' => 'nullable|integer|min:1|max:100',
                'category_id' => 'nullable|integer|exists:categories,id',
                'brand_id' => 'nullable|integer|exists:brands,id',
                'price_min' => 'nullable|numeric|min:0',
                'price_max' => 'nullable|numeric|min:0',
                'rating' => 'nullable|numeric|min:1|max:5',
                'in_stock' => 'nullable|boolean',
                'featured' => 'nullable|boolean',
                'sort_by' => 'nullable|string|in:relevance,price,name,created_at,views,rating',
                'sort_order' => 'nullable|string|in:asc,desc',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $query = $request->get('q');
            $perPage = $request->get('per_page', 20);

            // Start with base query
            $products = Product::with(['category', 'brand', 'media', 'reviews'])
                ->where('is_active', true);

            // Apply search query with relevance scoring
            $products->where(function ($q) use ($query) {
                $q->where('name', 'LIKE', "%{$query}%")
                  ->orWhere('description', 'LIKE', "%{$query}%")
                  ->orWhere('short_description', 'LIKE', "%{$query}%")
                  ->orWhere('sku', 'LIKE', "%{$query}%");
            });

            // Apply filters
            if ($request->has('category_id') && $request->category_id) {
                $products->where('category_id', $request->category_id);
            }

            if ($request->has('brand_id') && $request->brand_id) {
                $products->where('brand_id', $request->brand_id);
            }

            if ($request->has('price_min') && $request->price_min) {
                $products->where('price', '>=', $request->price_min);
            }

            if ($request->has('price_max') && $request->price_max) {
                $products->where('price', '<=', $request->price_max);
            }

            if ($request->has('in_stock') && $request->in_stock) {
                $products->where('stock_quantity', '>', 0);
            }

            if ($request->has('featured') && $request->featured) {
                $products->where('is_featured', true);
            }

            // Apply sorting
            $sortBy = $request->get('sort_by', 'relevance');
            $sortOrder = $request->get('sort_order', 'desc');

            if ($sortBy === 'relevance') {
                // Custom relevance scoring based on search term matches
                $products->selectRaw('
                    *,
                    CASE 
                        WHEN name LIKE ? THEN 100
                        WHEN name LIKE ? THEN 80
                        WHEN description LIKE ? THEN 60
                        WHEN short_description LIKE ? THEN 50
                        WHEN sku LIKE ? THEN 40
                        ELSE 10
                    END as relevance_score
                ', [
                    $query, // Exact match
                    "%{$query}%", // Contains
                    "%{$query}%", // Description contains
                    "%{$query}%", // Short description contains
                    "%{$query}%"  // SKU contains
                ])->orderBy('relevance_score', 'desc');
            } else {
                $products->orderBy($sortBy, $sortOrder);
            }

            // Apply rating filter if specified
            if ($request->has('rating') && $request->rating) {
                $products->whereHas('reviews', function ($q) use ($request) {
                    $q->havingRaw('AVG(rating) >= ?', [$request->rating]);
                });
            }

            $results = $products->paginate($perPage);

            // Transform products and add relevance information
            $results->getCollection()->transform(function ($product) use ($query) {
                $transformed = $this->transformProduct($product);
                
                // Add search relevance highlights
                if (isset($product->relevance_score)) {
                    $transformed['relevance_score'] = $product->relevance_score;
                }
                
                // Highlight search terms in name and description
                $transformed['highlighted_name'] = $this->highlightSearchTerms($product->name, $query);
                $transformed['highlighted_description'] = $this->highlightSearchTerms($product->description, $query);
                
                return $transformed;
            });

            // Add search analytics
            $searchAnalytics = [
                'total_results' => $results->total(),
                'query' => $query,
                'filters_applied' => $request->only(['category_id', 'brand_id', 'price_min', 'price_max', 'rating', 'in_stock', 'featured']),
                'execution_time' => microtime(true) - LARAVEL_START,
            ];

            return response()->json([
                'success' => true,
                'data' => $results,
                'analytics' => $searchAnalytics,
                'message' => 'Search completed successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Search failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Highlight search terms in text
     */
    private function highlightSearchTerms(string $text, string $query): string
    {
        if (empty($query) || empty($text)) {
            return $text;
        }

        $query = preg_quote($query, '/');
        return preg_replace("/($query)/i", '<mark class="bg-yellow-200 px-1 rounded">$1</mark>', $text);
    }

    /**
     * Get products by category
     */
    public function getByCategory(int $categoryId, Request $request): JsonResponse
    {
        try {
            $perPage = $request->get('per_page', 20);
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');

            $products = Product::with(['category', 'brand', 'media'])
                ->where('category_id', $categoryId)
                ->where('is_active', true)
                ->orderBy($sortBy, $sortOrder)
                ->paginate($perPage);

            // Transform products
            $products->getCollection()->transform(function ($product) {
                return $this->transformProduct($product);
            });

            return response()->json([
                'success' => true,
                'data' => $products,
                'message' => 'Category products retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve category products',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get products by brand
     */
    public function getByBrand(int $brandId, Request $request): JsonResponse
    {
        try {
            $perPage = $request->get('per_page', 20);
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');

            $products = Product::with(['category', 'brand', 'media'])
                ->where('brand_id', $brandId)
                ->where('is_active', true)
                ->orderBy($sortBy, $sortOrder)
                ->paginate($perPage);

            // Transform products
            $products->getCollection()->transform(function ($product) {
                return $this->transformProduct($product);
            });

            return response()->json([
                'success' => true,
                'data' => $products,
                'message' => 'Brand products retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve brand products',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get related products
     */
    public function getRelatedProducts(int $productId): JsonResponse
    {
        try {
            $product = Product::find($productId);
            
            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found'
                ], 404);
            }

            $relatedProducts = Product::with(['category', 'brand', 'media'])
                ->where('id', '!=', $productId)
                ->where('is_active', true)
                ->where(function ($query) use ($product) {
                    $query->where('category_id', $product->category_id)
                          ->orWhere('brand_id', $product->brand_id);
                })
                ->orderBy('rating', 'desc')
                ->orderBy('views', 'desc')
                ->limit(8)
                ->get();

            // Transform products
            $relatedProducts->transform(function ($product) {
                return $this->transformProduct($product);
            });

            return response()->json([
                'success' => true,
                'data' => $relatedProducts,
                'message' => 'Related products retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve related products',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Transform product data for API response
     */
    protected function transformProduct($product): array
    {
        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'description' => $product->description,
            'short_description' => $product->short_description,
            'price' => $product->price,
            'compare_price' => $product->compare_price,
            'cost_price' => $product->cost_price,
            'sku' => $product->sku,
            'barcode' => $product->barcode,
            'stock' => $product->stock,
            'min_stock' => $product->min_stock,
            'weight' => $product->weight,
            'dimensions' => $product->dimensions,
            'is_active' => $product->is_active,
            'is_featured' => $product->is_featured,
            'is_bestseller' => $product->is_bestseller,
            'views' => $product->views ?? 0,
            'category' => $product->category ? [
                'id' => $product->category->id,
                'name' => $product->category->name,
                'slug' => $product->category->slug,
            ] : null,
            'brand' => $product->brand ? [
                'id' => $product->brand->id,
                'name' => $product->brand->name,
                'slug' => $product->brand->slug,
            ] : null,
            'images' => $product->media->map(function ($media) {
                return [
                    'id' => $media->id,
                    'url' => $media->getUrl(),
                    'thumbnail' => $media->getUrl('thumbnail'),
                    'alt' => $media->name,
                ];
            }),
            'featured_image' => $product->media->first() ? [
                'url' => $product->media->first()->getUrl(),
                'thumbnail' => $product->media->first()->getUrl('thumbnail'),
            ] : null,
            'average_rating' => $product->reviews->avg('rating') ?? 0,
            'review_count' => $product->reviews->count(),
            'created_at' => $product->created_at,
            'updated_at' => $product->updated_at,
        ];
    }

    /**
     * Get product review statistics
     */
    protected function getProductReviewStats(int $productId): array
    {
        $reviews = \App\Models\Review::where('product_id', $productId)
            ->where('is_approved', true)
            ->get();

        $totalReviews = $reviews->count();
        $averageRating = $reviews->avg('rating') ?? 0;
        
        $ratingDistribution = [];
        for ($i = 1; $i <= 5; $i++) {
            $count = $reviews->where('rating', $i)->count();
            $percentage = $totalReviews > 0 ? round(($count / $totalReviews) * 100, 1) : 0;
            $ratingDistribution[$i] = [
                'count' => $count,
                'percentage' => $percentage
            ];
        }

        return [
            'total_reviews' => $totalReviews,
            'average_rating' => round($averageRating, 1),
            'rating_distribution' => $ratingDistribution,
        ];
    }

    /**
     * Admin: Get all products with admin-specific data
     */
    public function adminIndex(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'page' => 'nullable|integer|min:1',
                'per_page' => 'nullable|integer|min:1|max:100',
                'search' => 'nullable|string|max:255',
                'category' => 'nullable|string',
                'sort_by' => 'nullable|string|in:name,price,created_at,stock,views',
                'sort_order' => 'nullable|string|in:asc,desc',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $query = Product::with(['category', 'brand', 'media']);

            // Apply search filter
            if ($request->has('search') && $request->search) {
                $searchTerm = $request->search;
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('name', 'like', "%{$searchTerm}%")
                      ->orWhere('sku', 'like', "%{$searchTerm}%")
                      ->orWhere('description', 'like', "%{$searchTerm}%");
                });
            }

            // Apply category filter
            if ($request->has('category') && $request->category) {
                $query->whereHas('category', function ($q) use ($request) {
                    $q->where('slug', $request->category);
                });
            }

            // Apply sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 20);
            $products = $query->paginate($perPage);

            // Transform products for admin
            $products->getCollection()->transform(function ($product) {
                return $this->transformAdminProduct($product);
            });

            return response()->json([
                'success' => true,
                'data' => $products,
                'message' => 'Products retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve products',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin: Store a new product
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'description' => 'required|string',
                'short_description' => 'nullable|string|max:500',
                'price' => 'required|numeric|min:0',
                'compare_price' => 'nullable|numeric|min:0',
                'cost_price' => 'nullable|numeric|min:0',
                'sku' => 'required|string|max:100|unique:products,sku',
                'barcode' => 'nullable|string|max:100|unique:products,barcode',
                'stock' => 'required|integer|min:0',
                'min_stock' => 'nullable|integer|min:0',
                'weight' => 'nullable|numeric|min:0',
                'dimensions' => 'nullable|string|max:100',
                'category_id' => 'required|exists:categories,id',
                'brand_id' => 'nullable|exists:brands,id',
                'is_active' => 'boolean',
                'is_featured' => 'boolean',
                'is_bestseller' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $product = Product::create($request->all());

            return response()->json([
                'success' => true,
                'data' => $this->transformAdminProduct($product),
                'message' => 'Product created successfully'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin: Update a product
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $product = Product::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'description' => 'sometimes|required|string',
                'short_description' => 'nullable|string|max:500',
                'price' => 'sometimes|required|numeric|min:0',
                'compare_price' => 'nullable|numeric|min:0',
                'cost_price' => 'nullable|numeric|min:0',
                'sku' => 'sometimes|required|string|max:100|unique:products,sku,' . $id,
                'barcode' => 'nullable|string|max:100|unique:products,barcode,' . $id,
                'stock' => 'sometimes|required|integer|min:0',
                'min_stock' => 'nullable|integer|min:0',
                'weight' => 'nullable|numeric|min:0',
                'dimensions' => 'nullable|string|max:100',
                'category_id' => 'sometimes|required|exists:categories,id',
                'brand_id' => 'nullable|exists:brands,id',
                'is_active' => 'boolean',
                'is_featured' => 'boolean',
                'is_bestseller' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $product->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $this->transformAdminProduct($product->fresh()),
                'message' => 'Product updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin: Delete a product
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $product = Product::findOrFail($id);
            $product->delete();

            return response()->json([
                'success' => true,
                'message' => 'Product deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin: Upload product images
     */
    public function uploadImages(Request $request, int $id): JsonResponse
    {
        try {
            $product = Product::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'images.*' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $product->addMedia($image)->toMediaCollection('products');
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Images uploaded successfully',
                'data' => $this->transformAdminProduct($product->fresh())
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload images',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin: Delete a product image
     */
    public function deleteImage(Request $request, int $id, int $imageId): JsonResponse
    {
        try {
            $product = Product::findOrFail($id);
            $media = $product->media()->findOrFail($imageId);
            $media->delete();

            return response()->json([
                'success' => true,
                'message' => 'Image deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete image',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Transform product data for admin API response
     */
    protected function transformAdminProduct($product): array
    {
        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'description' => $product->description,
            'short_description' => $product->short_description,
            'price' => $product->price,
            'compare_price' => $product->compare_price,
            'cost_price' => $product->cost_price,
            'sku' => $product->sku,
            'barcode' => $product->barcode,
            'stock' => $product->stock,
            'min_stock' => $product->min_stock,
            'weight' => $product->weight,
            'dimensions' => $product->dimensions,
            'is_active' => $product->is_active,
            'is_featured' => $product->is_featured,
            'is_bestseller' => $product->is_bestseller,
            'views' => $product->views ?? 0,
            'category' => $product->category ? [
                'id' => $product->category->id,
                'name' => $product->category->name,
                'slug' => $product->category->slug,
            ] : null,
            'brand' => $product->brand ? [
                'id' => $product->brand->id,
                'name' => $product->brand->name,
                'slug' => $product->brand->slug,
            ] : null,
            'images' => $product->media->map(function ($media) {
                return [
                    'id' => $media->id,
                    'url' => $media->getUrl(),
                    'thumbnail' => $media->getUrl('thumbnail'),
                    'alt' => $media->name,
                ];
            }),
            'featured_image' => $product->media->first() ? [
                'url' => $product->media->first()->getUrl(),
                'thumbnail' => $product->media->first()->getUrl('thumbnail'),
            ] : null,
            'average_rating' => $product->reviews->avg('rating') ?? 0,
            'review_count' => $product->reviews->count(),
            'created_at' => $product->created_at,
            'updated_at' => $product->updated_at,
        ];
    }
}
