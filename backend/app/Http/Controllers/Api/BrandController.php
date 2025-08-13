<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class BrandController extends Controller
{
    /**
     * Get all brands
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'featured' => 'nullable|boolean',
                'with_products_count' => 'nullable|boolean',
                'with_image' => 'nullable|boolean',
                'with_stats' => 'nullable|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $cacheKey = 'brands_' . md5(serialize($request->all()));
            
            $brands = Cache::remember($cacheKey, 3600, function () use ($request) {
                $query = Brand::where('is_active', true);

                if ($request->has('featured') && $request->featured) {
                    $query->where('is_featured', true);
                }

                if ($request->has('with_products_count') && $request->with_products_count) {
                    $query->withCount(['products' => function ($q) {
                        $q->where('is_active', true);
                    }]);
                }

                if ($request->has('with_image') && $request->with_image) {
                    $query->with('media');
                }

                if ($request->has('with_stats') && $request->with_stats) {
                    $query->withCount(['products' => function ($q) {
                        $q->where('is_active', true);
                    }])
                    ->withCount(['products as in_stock_count' => function ($q) {
                        $q->where('is_active', true)->where('stock', '>', 0);
                    }]);
                }

                return $query->orderBy('sort_order', 'asc')
                            ->orderBy('name', 'asc')
                            ->get();
            });

            // Transform brands
            $brands->transform(function ($brand) use ($request) {
                $brandData = $this->transformBrand($brand);
                
                if ($request->has('with_stats') && $request->with_stats) {
                    $brandData['stats'] = $this->getBrandStats($brand->id);
                }
                
                return $brandData;
            });

            return response()->json([
                'success' => true,
                'data' => $brands,
                'message' => 'Brands retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve brands',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a single brand by slug
     */
    public function show(string $slug): JsonResponse
    {
        try {
            $cacheKey = "brand_{$slug}";
            
            $brand = Cache::remember($cacheKey, 3600, function () use ($slug) {
                return Brand::with(['media'])
                    ->where('slug', $slug)
                    ->where('is_active', true)
                    ->first();
            });

            if (!$brand) {
                return response()->json([
                    'success' => false,
                    'message' => 'Brand not found'
                ], 404);
            }

            // Get brand statistics
            $stats = $this->getBrandStats($brand->id);

            $brandData = $this->transformBrand($brand);
            $brandData['stats'] = $stats;

            return response()->json([
                'success' => true,
                'data' => $brandData,
                'message' => 'Brand retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve brand',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get products for a specific brand
     */
    public function getProducts(string $slug, Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'page' => 'nullable|integer|min:1',
                'per_page' => 'nullable|integer|min:1|max:100',
                'category_id' => 'nullable|integer|exists:categories,id',
                'min_price' => 'nullable|numeric|min:0',
                'max_price' => 'nullable|numeric|min:0',
                'sort_by' => 'nullable|string|in:name,price,created_at,rating,popularity',
                'sort_order' => 'nullable|string|in:asc,desc',
                'in_stock' => 'nullable|boolean',
                'featured' => 'nullable|boolean',
                'bestseller' => 'nullable|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $brand = Brand::where('slug', $slug)
                ->where('is_active', true)
                ->first();

            if (!$brand) {
                return response()->json([
                    'success' => false,
                    'message' => 'Brand not found'
                ], 404);
            }

            $query = Product::with(['category', 'brand', 'media'])
                ->where('brand_id', $brand->id)
                ->where('is_active', true);

            // Apply filters
            if ($request->has('category_id')) {
                $query->where('category_id', $request->category_id);
            }

            if ($request->has('min_price')) {
                $query->where('price', '>=', $request->min_price);
            }

            if ($request->has('max_price')) {
                $query->where('price', '<=', $request->max_price);
            }

            if ($request->has('in_stock') && $request->in_stock) {
                $query->where('stock', '>', 0);
            }

            if ($request->has('featured') && $request->featured) {
                $query->where('is_featured', true);
            }

            if ($request->has('bestseller') && $request->bestseller) {
                $query->where('is_bestseller', true);
            }

            // Apply sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');

            // Handle special sorting
            if ($sortBy === 'popularity') {
                $query->orderBy('views', $sortOrder);
            } elseif ($sortBy === 'rating') {
                $query->withAvg('reviews', 'rating')
                      ->orderBy('reviews_avg_rating', $sortOrder);
            } else {
                $query->orderBy($sortBy, $sortOrder);
            }

            // Pagination
            $perPage = $request->get('per_page', 20);
            $products = $query->paginate($perPage);

            // Transform products
            $products->getCollection()->transform(function ($product) {
                return $this->transformProduct($product);
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'brand' => $this->transformBrand($brand),
                    'products' => $products,
                    'filters' => $this->getBrandFilters($brand->id)
                ],
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
     * Transform brand data for API response
     */
    protected function transformBrand($brand): array
    {
        $data = [
            'id' => $brand->id,
            'name' => $brand->name,
            'slug' => $brand->slug,
            'description' => $brand->description,
            'short_description' => $brand->short_description,
            'website' => $brand->website,
            'is_active' => $brand->is_active,
            'is_featured' => $brand->is_featured,
            'sort_order' => $brand->sort_order,
            'meta_title' => $brand->meta_title,
            'meta_description' => $brand->meta_description,
            'meta_keywords' => $brand->meta_keywords,
            'created_at' => $brand->created_at,
            'updated_at' => $brand->updated_at,
        ];

        // Add products count if available
        if (isset($brand->products_count)) {
            $data['products_count'] = $brand->products_count;
        }

        if (isset($brand->in_stock_count)) {
            $data['in_stock_count'] = $brand->in_stock_count;
        }

        // Add image if available
        if ($brand->media && $brand->media->count() > 0) {
            $data['image'] = [
                'url' => $brand->media->first()->getUrl(),
                'thumbnail' => $brand->media->first()->getUrl('thumbnail'),
                'alt' => $brand->media->first()->name,
            ];
        }

        return $data;
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
            'sku' => $product->sku,
            'stock' => $product->stock,
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
     * Get brand statistics
     */
    protected function getBrandStats(int $brandId): array
    {
        $totalProducts = Product::where('brand_id', $brandId)
            ->where('is_active', true)
            ->count();

        $inStockProducts = Product::where('brand_id', $brandId)
            ->where('is_active', true)
            ->where('stock', '>', 0)
            ->count();

        $featuredProducts = Product::where('brand_id', $brandId)
            ->where('is_active', true)
            ->where('is_featured', true)
            ->count();

        $bestsellerProducts = Product::where('brand_id', $brandId)
            ->where('is_active', true)
            ->where('is_bestseller', true)
            ->count();

        $averagePrice = Product::where('brand_id', $brandId)
            ->where('is_active', true)
            ->where('stock', '>', 0)
            ->avg('price');

        $averageRating = Product::where('brand_id', $brandId)
            ->where('is_active', true)
            ->withAvg('reviews', 'rating')
            ->get()
            ->avg('reviews_avg_rating');

        return [
            'total_products' => $totalProducts,
            'in_stock_products' => $inStockProducts,
            'featured_products' => $featuredProducts,
            'bestseller_products' => $bestsellerProducts,
            'average_price' => round($averagePrice ?? 0, 2),
            'average_rating' => round($averageRating ?? 0, 1),
            'out_of_stock_percentage' => $totalProducts > 0 
                ? round((($totalProducts - $inStockProducts) / $totalProducts) * 100, 1) 
                : 0,
        ];
    }

    /**
     * Get brand filters
     */
    protected function getBrandFilters(int $brandId): array
    {
        $products = Product::where('brand_id', $brandId)
            ->where('is_active', true)
            ->get();

        $categories = $products->pluck('category')
            ->filter()
            ->unique('id')
            ->values()
            ->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                ];
            });

        $priceRange = [
            'min' => $products->min('price') ?? 0,
            'max' => $products->max('price') ?? 0,
        ];

        $stockStatus = [
            'in_stock' => $products->where('stock', '>', 0)->count(),
            'out_of_stock' => $products->where('stock', '<=', 0)->count(),
        ];

        $productTypes = [
            'featured' => $products->where('is_featured', true)->count(),
            'bestseller' => $products->where('is_bestseller', true)->count(),
        ];

        return [
            'categories' => $categories,
            'price_range' => $priceRange,
            'stock_status' => $stockStatus,
            'product_types' => $productTypes,
        ];
    }

    /**
     * Admin: Get all brands with admin-specific data
     */
    public function adminIndex(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'page' => 'nullable|integer|min:1',
                'per_page' => 'nullable|integer|min:1|max:100',
                'search' => 'nullable|string|max:255',
                'sort_by' => 'nullable|string|in:name,created_at,products_count',
                'sort_order' => 'nullable|string|in:asc,desc',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $query = Brand::withCount(['products' => function ($q) {
                $q->where('is_active', true);
            }]);

            // Apply search filter
            if ($request->has('search') && $request->search) {
                $searchTerm = $request->search;
                $query->where('name', 'like', "%{$searchTerm}%")
                      ->orWhere('description', 'like', "%{$searchTerm}%");
            }

            // Apply sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            
            if ($sortBy === 'products_count') {
                $query->orderBy('products_count', $sortOrder);
            } else {
                $query->orderBy($sortBy, $sortOrder);
            }

            // Pagination
            $perPage = $request->get('per_page', 20);
            $brands = $query->paginate($perPage);

            // Transform brands for admin
            $brands->getCollection()->transform(function ($brand) {
                return $this->transformAdminBrand($brand);
            });

            return response()->json([
                'success' => true,
                'data' => $brands,
                'message' => 'Brands retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve brands',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin: Store a new brand
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'slug' => 'nullable|string|max:255|unique:brands,slug',
                'is_active' => 'boolean',
                'is_featured' => 'boolean',
                'sort_order' => 'nullable|integer|min:0',
                'meta_title' => 'nullable|string|max:255',
                'meta_description' => 'nullable|string|max:500',
                'website_url' => 'nullable|url|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Generate slug if not provided
            if (!$request->slug) {
                $request->merge(['slug' => Str::slug($request->name)]);
            }

            $brand = Brand::create($request->all());

            return response()->json([
                'success' => true,
                'data' => $this->transformAdminBrand($brand),
                'message' => 'Brand created successfully'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create brand',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin: Update a brand
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $brand = Brand::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'slug' => 'nullable|string|max:255|unique:brands,slug,' . $id,
                'is_active' => 'boolean',
                'is_featured' => 'boolean',
                'sort_order' => 'nullable|integer|min:0',
                'meta_title' => 'nullable|string|max:255',
                'meta_description' => 'nullable|string|max:500',
                'website_url' => 'nullable|url|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Generate slug if not provided
            if (!$request->slug) {
                $request->merge(['slug' => Str::slug($request->name)]);
            }

            $brand->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $this->transformAdminBrand($brand->fresh()),
                'message' => 'Brand updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update brand',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin: Delete a brand
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $brand = Brand::findOrFail($id);

            // Check if brand has products
            if ($brand->products()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete brand with existing products'
                ], 422);
            }

            $brand->delete();

            return response()->json([
                'success' => true,
                'message' => 'Brand deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete brand',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Transform brand data for admin API response
     */
    protected function transformAdminBrand($brand): array
    {
        return [
            'id' => $brand->id,
            'name' => $brand->name,
            'slug' => $brand->slug,
            'description' => $brand->description,
            'is_active' => $brand->is_active,
            'is_featured' => $brand->is_featured,
            'sort_order' => $brand->sort_order,
            'meta_title' => $brand->meta_title,
            'meta_description' => $brand->meta_description,
            'website_url' => $brand->website_url,
            'products_count' => $brand->products_count ?? 0,
            'created_at' => $brand->created_at,
            'updated_at' => $brand->updated_at,
        ];
    }
}
