<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    /**
     * Get user's cart
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            $cartItems = CartItem::with(['product.category', 'product.brand', 'product.media'])
                ->where('user_id', $user->id)
                ->get();

            $cartData = $this->transformCart($cartItems);
            
            return response()->json([
                'success' => true,
                'data' => $cartData,
                'message' => 'Cart retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve cart',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add item to cart
     */
    public function addItem(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'product_id' => 'required|integer|exists:products,id',
                'quantity' => 'required|integer|min:1|max:10',
                'options' => 'nullable|array',
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

            // Check if product is active and in stock
            if (!$product->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product is not available'
                ], 422);
            }

            if ($product->stock < $request->quantity) {
                return response()->json([
                    'success' => false,
                    'message' => 'Insufficient stock available'
                ], 422);
            }

            // Check if item already exists in cart
            $existingItem = CartItem::where('user_id', $user->id)
                ->where('product_id', $request->product_id)
                ->first();

            if ($existingItem) {
                // Update quantity if item exists
                $newQuantity = $existingItem->quantity + $request->quantity;
                
                if ($newQuantity > $product->stock) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Cannot add more items than available stock'
                    ], 422);
                }

                $existingItem->update([
                    'quantity' => $newQuantity,
                    'options' => $request->options ?? $existingItem->options
                ]);

                $cartItem = $existingItem->fresh();
            } else {
                // Create new cart item
                $cartItem = CartItem::create([
                    'user_id' => $user->id,
                    'product_id' => $request->product_id,
                    'quantity' => $request->quantity,
                    'options' => $request->options ?? [],
                    'price' => $product->price,
                ]);
            }

            // Load relationships
            $cartItem->load(['product.category', 'product.brand', 'product.media']);

            return response()->json([
                'success' => true,
                'data' => $this->transformCartItem($cartItem),
                'message' => 'Item added to cart successfully'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add item to cart',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update cart item
     */
    public function updateItem(Request $request, int $id): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'quantity' => 'required|integer|min:1|max:10',
                'options' => 'nullable|array',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = $request->user();
            
            $cartItem = CartItem::where('id', $id)
                ->where('user_id', $user->id)
                ->with('product')
                ->first();

            if (!$cartItem) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cart item not found'
                ], 404);
            }

            // Check stock availability
            if ($request->quantity > $cartItem->product->stock) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot add more items than available stock'
                ], 422);
            }

            $cartItem->update([
                'quantity' => $request->quantity,
                'options' => $request->options ?? $cartItem->options
            ]);

            // Load relationships
            $cartItem->load(['product.category', 'product.brand', 'product.media']);

            return response()->json([
                'success' => true,
                'data' => $this->transformCartItem($cartItem),
                'message' => 'Cart item updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update cart item',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove item from cart
     */
    public function removeItem(Request $request, int $id): JsonResponse
    {
        try {
            $user = $request->user();
            
            $cartItem = CartItem::where('id', $id)
                ->where('user_id', $user->id)
                ->first();

            if (!$cartItem) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cart item not found'
                ], 404);
            }

            $cartItem->delete();

            return response()->json([
                'success' => true,
                'message' => 'Item removed from cart successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove item from cart',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clear user's cart
     */
    public function clearCart(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            CartItem::where('user_id', $user->id)->delete();

            return response()->json([
                'success' => true,
                'message' => 'Cart cleared successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear cart',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Transform cart data for API response
     */
    protected function transformCart($cartItems): array
    {
        $subtotal = 0;
        $totalItems = 0;
        $items = [];

        foreach ($cartItems as $item) {
            $itemData = $this->transformCartItem($item);
            $items[] = $itemData;
            
            $subtotal += $itemData['total_price'];
            $totalItems += $itemData['quantity'];
        }

        // Calculate tax (5% VAT for Bangladesh)
        $tax = $subtotal * 0.05;
        $total = $subtotal + $tax;

        return [
            'items' => $items,
            'summary' => [
                'subtotal' => round($subtotal, 2),
                'tax' => round($tax, 2),
                'total' => round($total, 2),
                'total_items' => $totalItems,
                'total_unique_items' => count($items),
            ]
        ];
    }

    /**
     * Transform cart item for API response
     */
    protected function transformCartItem($cartItem): array
    {
        $product = $cartItem->product;
        $totalPrice = $cartItem->price * $cartItem->quantity;

        return [
            'id' => $cartItem->id,
            'product_id' => $cartItem->product_id,
            'quantity' => $cartItem->quantity,
            'price' => $cartItem->price,
            'total_price' => $totalPrice,
            'options' => $cartItem->options ?? [],
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
            ],
            'created_at' => $cartItem->created_at,
            'updated_at' => $cartItem->updated_at,
        ];
    }
}
