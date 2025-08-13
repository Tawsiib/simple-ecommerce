<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * Get all categories
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'featured' => 'nullable|boolean',
                'with_products_count' => 'nullable|boolean',
                'with_image' => 'nullable|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $cacheKey = 'categories_' . md5(serialize($request->all()));
            
            $categories = Cache::remember($cacheKey, 3600, function () use ($request) {
                $query = Category::where('is_active', true);

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

                return $query->orderBy('sort_order', 'asc')
                            ->orderBy('name', 'asc')
                            ->get();
            });

            // Transform categories
            $categories->transform(function ($category) {
                return $this->transformCategory($category);
            });

            return response()->json([
                'success' => true,
                'data' => $categories,
                'message' => 'Categories retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve categories',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a single category by slug
     */
    public function show(string $slug): JsonResponse
    {
        try {
            $cacheKey = "category_{$slug}";
            
            $category = Cache::remember($cacheKey, 3600, function () use ($slug) {
                return Category::with(['media', 'parent', 'children'])
                    ->where('slug', $slug)
                    ->where('is_active', true)
                    ->first();
            });

            if (!$category) {
                return response()->json([
                    'success' => false,
                    'message' => 'Category not found'
                ], 404);
            }

            // Get category statistics
            $stats = $this->getCategoryStats($category->id);

            $categoryData = $this->transformCategory($category);
            $categoryData['stats'] = $stats;

            return response()->json([
                'success' => true,
                'data' => $categoryData,
                'message' => 'Category retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get products for a specific category
     */
    public function getProducts(string $slug, Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'page' => 'nullable|integer|min:1',
                'per_page' => 'nullable|integer|min:1|max:100',
                'brand_id' => 'nullable|integer|exists:brands,id',
                'min_price' => 'nullable|numeric|min:0',
                'max_price' => 'nullable|numeric|min:0',
                'sort_by' => 'nullable|string|in:name,price,created_at,rating,popularity',
                'sort_order' => 'nullable|string|in:asc,desc',
                'in_stock' => 'nullable|boolean',
                'featured' => 'nullable|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $category = Category::where('slug', $slug)
                ->where('is_active', true)
                ->first();

            if (!$category) {
                return response()->json([
                    'success' => false,
                    'message' => 'Category not found'
                ], 404);
            }

            $query = Product::with(['category', 'brand', 'media'])
                ->where('category_id', $category->id)
                ->where('is_active', true);

            // Apply filters
            if ($request->has('brand_id')) {
                $query->where('brand_id', $request->brand_id);
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
                    'category' => $this->transformCategory($category),
                    'products' => $products,
                    'filters' => $this->getCategoryFilters($category->id)
                ],
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
     * Transform category data for API response
     */
    protected function transformCategory($category): array
    {
        $data = [
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'description' => $category->description,
            'short_description' => $category->short_description,
            'is_active' => $category->is_active,
            'is_featured' => $category->is_featured,
            'sort_order' => $category->sort_order,
            'meta_title' => $category->meta_title,
            'meta_description' => $category->meta_description,
            'meta_keywords' => $category->meta_keywords,
            'created_at' => $category->created_at,
            'updated_at' => $category->updated_at,
        ];

        // Add parent category if exists
        if ($category->parent) {
            $data['parent'] = [
                'id' => $category->parent->id,
                'name' => $category->parent->name,
                'slug' => $category->parent->slug,
            ];
        }

        // Add children categories if exists
        if ($category->children && $category->children->count() > 0) {
            $data['children'] = $category->children->map(function ($child) {
                return [
                    'id' => $child->id,
                    'name' => $child->name,
                    'slug' => $child->slug,
                    'is_active' => $child->is_active,
                ];
            });
        }

        // Add products count if available
        if (isset($category->products_count)) {
            $data['products_count'] = $category->products_count;
        }

        // Add image if available
        if ($category->media && $category->media->count() > 0) {
            $data['image'] = [
                'url' => $category->media->first()->getUrl(),
                'thumbnail' => $category->media->first()->getUrl('thumbnail'),
                'alt' => $category->media->first()->name,
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
     * Get category statistics
     */
    protected function getCategoryStats(int $categoryId): array
    {
        $totalProducts = Product::where('category_id', $categoryId)
            ->where('is_active', true)
            ->count();

        $inStockProducts = Product::where('category_id', $categoryId)
            ->where('is_active', true)
            ->where('stock', '>', 0)
            ->count();

        $featuredProducts = Product::where('category_id', $categoryId)
            ->where('is_active', true)
            ->where('is_featured', true)
            ->count();

        $averagePrice = Product::where('category_id', $categoryId)
            ->where('is_active', true)
            ->where('stock', '>', 0)
            ->avg('price');

        return [
            'total_products' => $totalProducts,
            'in_stock_products' => $inStockProducts,
            'featured_products' => $featuredProducts,
            'average_price' => round($averagePrice ?? 0, 2),
            'out_of_stock_percentage' => $totalProducts > 0 
                ? round((($totalProducts - $inStockProducts) / $totalProducts) * 100, 1) 
                : 0,
        ];
    }

    /**
     * Get category filters
     */
    protected function getCategoryFilters(int $categoryId): array
    {
        $products = Product::where('category_id', $categoryId)
            ->where('is_active', true)
            ->get();

        $brands = $products->pluck('brand')
            ->filter()
            ->unique('id')
            ->values()
            ->map(function ($brand) {
                return [
                    'id' => $brand->id,
                    'name' => $brand->name,
                    'slug' => $brand->slug,
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

        return [
            'brands' => $brands,
            'price_range' => $priceRange,
            'stock_status' => $stockStatus,
        ];
    }

    /**
     * Admin: Get all categories with admin-specific data
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

            $query = Category::withCount(['products' => function ($q) {
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
            $categories = $query->paginate($perPage);

            // Transform categories for admin
            $categories->getCollection()->transform(function ($category) {
                return $this->transformAdminCategory($category);
            });

            return response()->json([
                'success' => true,
                'data' => $categories,
                'message' => 'Categories retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve categories',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin: Store a new category
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'slug' => 'nullable|string|max:255|unique:categories,slug',
                'parent_id' => 'nullable|integer|exists:categories,id',
                'is_active' => 'boolean',
                'is_featured' => 'boolean',
                'sort_order' => 'nullable|integer|min:0',
                'meta_title' => 'nullable|string|max:255',
                'meta_description' => 'nullable|string|max:500',
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

            $category = Category::create($request->all());

            return response()->json([
                'success' => true,
                'data' => $this->transformAdminCategory($category),
                'message' => 'Category created successfully'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin: Update a category
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $category = Category::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'slug' => 'nullable|string|max:255|unique:categories,slug,' . $id,
                'parent_id' => 'nullable|integer|exists:categories,id',
                'is_active' => 'boolean',
                'is_featured' => 'boolean',
                'sort_order' => 'nullable|integer|min:0',
                'meta_title' => 'nullable|string|max:255',
                'meta_description' => 'nullable|string|max:500',
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

            $category->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $this->transformAdminCategory($category->fresh()),
                'message' => 'Category updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin: Delete a category
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $category = Category::findOrFail($id);

            // Check if category has products
            if ($category->products()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete category with existing products'
                ], 422);
            }

            $category->delete();

            return response()->json([
                'success' => true,
                'message' => 'Category deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Transform category data for admin API response
     */
    protected function transformAdminCategory($category): array
    {
        return [
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'description' => $category->description,
            'parent_id' => $category->parent_id,
            'parent' => $category->parent ? [
                'id' => $category->parent->id,
                'name' => $category->parent->name,
                'slug' => $category->parent->slug,
            ] : null,
            'children' => $category->children->map(function ($child) {
                return [
                    'id' => $child->id,
                    'name' => $child->name,
                    'slug' => $child->slug,
                ];
            }),
            'is_active' => $category->is_active,
            'is_featured' => $category->is_featured,
            'sort_order' => $category->sort_order,
            'meta_title' => $category->meta_title,
            'meta_description' => $category->meta_description,
            'products_count' => $category->products_count ?? 0,
            'created_at' => $category->created_at,
            'updated_at' => $category->updated_at,
        ];
    }
}
