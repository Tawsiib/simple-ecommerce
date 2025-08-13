<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WishlistItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class WishlistController extends Controller
{
    /**
     * Get user's wishlist
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            $wishlistItems = WishlistItem::with(['product.category', 'product.brand', 'product.media'])
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();

            $wishlistData = $this->transformWishlist($wishlistItems);
            
            return response()->json([
                'success' => true,
                'data' => $wishlistData,
                'message' => 'Wishlist retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve wishlist',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add item to wishlist
     */
    public function addItem(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'product_id' => 'required|integer|exists:products,id',
                'notes' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = $request->user();
            $product = Product::find($request->product_id);

            // Check if product is active
            if (!$product->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product is not available'
                ], 422);
            }

            // Check if item already exists in wishlist
            $existingItem = WishlistItem::where('user_id', $user->id)
                ->where('product_id', $request->product_id)
                ->first();

            if ($existingItem) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product is already in your wishlist'
                ], 422);
            }

            // Create new wishlist item
            $wishlistItem = WishlistItem::create([
                'user_id' => $user->id,
                'product_id' => $request->product_id,
                'notes' => $request->notes,
            ]);

            // Load relationships
            $wishlistItem->load(['product.category', 'product.brand', 'product.media']);

            return response()->json([
                'success' => true,
                'data' => $this->transformWishlistItem($wishlistItem),
                'message' => 'Product added to wishlist successfully'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add product to wishlist',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove item from wishlist
     */
    public function removeItem(Request $request, int $id): JsonResponse
    {
        try {
            $user = $request->user();
            
            $wishlistItem = WishlistItem::where('id', $id)
                ->where('user_id', $user->id)
                ->first();

            if (!$wishlistItem) {
                return response()->json([
                    'success' => false,
                    'message' => 'Wishlist item not found'
                ], 404);
            }

            $wishlistItem->delete();

            return response()->json([
                'success' => true,
                'message' => 'Product removed from wishlist successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove product from wishlist',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clear user's wishlist
     */
    public function clearWishlist(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            WishlistItem::where('user_id', $user->id)->delete();

            return response()->json([
                'success' => true,
                'message' => 'Wishlist cleared successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear wishlist',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update wishlist item notes
     */
    public function updateNotes(Request $request, int $id): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'notes' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = $request->user();
            
            $wishlistItem = WishlistItem::where('id', $id)
                ->where('user_id', $user->id)
                ->first();

            if (!$wishlistItem) {
                return response()->json([
                    'success' => false,
                    'message' => 'Wishlist item not found'
                ], 404);
            }

            $wishlistItem->update([
                'notes' => $request->notes
            ]);

            // Load relationships
            $wishlistItem->load(['product.category', 'product.brand', 'product.media']);

            return response()->json([
                'success' => true,
                'data' => $this->transformWishlistItem($wishlistItem),
                'message' => 'Wishlist item notes updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update wishlist item notes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Move wishlist item to cart
     */
    public function moveToCart(Request $request, int $id): JsonResponse
    {
        try {
            $user = $request->user();
            
            $wishlistItem = WishlistItem::where('id', $id)
                ->where('user_id', $user->id)
                ->with('product')
                ->first();

            if (!$wishlistItem) {
                return response()->json([
                    'success' => false,
                    'message' => 'Wishlist item not found'
                ], 404);
            }

            $product = $wishlistItem->product;

            // Check if product is available and in stock
            if (!$product->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product is not available'
                ], 422);
            }

            if ($product->stock <= 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product is out of stock'
                ], 422);
            }

            // Check if item already exists in cart
            $existingCartItem = \App\Models\CartItem::where('user_id', $user->id)
                ->where('product_id', $product->id)
                ->first();

            if ($existingCartItem) {
                // Update quantity if item exists
                $newQuantity = $existingCartItem->quantity + 1;
                
                if ($newQuantity > $product->stock) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Cannot add more items than available stock'
                    ], 422);
                }

                $existingCartItem->update(['quantity' => $newQuantity]);
            } else {
                // Create new cart item
                \App\Models\CartItem::create([
                    'user_id' => $user->id,
                    'product_id' => $product->id,
                    'quantity' => 1,
                    'price' => $product->price,
                ]);
            }

            // Remove from wishlist
            $wishlistItem->delete();

            return response()->json([
                'success' => true,
                'message' => 'Product moved to cart successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to move product to cart',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Transform wishlist data for API response
     */
    protected function transformWishlist($wishlistItems): array
    {
        $items = [];
        $totalItems = 0;
        $totalValue = 0;

        foreach ($wishlistItems as $item) {
            $itemData = $this->transformWishlistItem($item);
            $items[] = $itemData;
            
            $totalItems++;
            $totalValue += $itemData['product']['price'] ?? 0;
        }

        return [
            'items' => $items,
            'summary' => [
                'total_items' => $totalItems,
                'total_value' => round($totalValue, 2),
                'formatted_total_value' => '৳' . number_format($totalValue, 2),
            ]
        ];
    }

    /**
     * Transform wishlist item for API response
     */
    protected function transformWishlistItem($wishlistItem): array
    {
        $product = $wishlistItem->product;

        return [
            'id' => $wishlistItem->id,
            'product_id' => $wishlistItem->product_id,
            'notes' => $wishlistItem->notes,
            'added_at' => $wishlistItem->created_at,
            'product' => [
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
            ],
        ];
    }
}
