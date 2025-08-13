<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    /**
     * Get order statistics (public endpoint)
     */
    public function getStatistics(Request $request): JsonResponse
    {
        try {
            // This would typically come from actual order data
            // For now, we'll return mock data
            $statistics = [
                'total_orders' => 1250,
                'pending_orders' => 45,
                'completed_orders' => 1180,
                'cancelled_orders' => 25,
                'total_revenue' => 125000.00,
                'average_order_value' => 100.00,
                'monthly_trend' => [
                    'jan' => 120,
                    'feb' => 135,
                    'mar' => 142,
                    'apr' => 158,
                    'may' => 165,
                    'jun' => 180,
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $statistics,
                'message' => 'Order statistics retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve order statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user's orders
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            $orders = Order::with(['items.product', 'shippingAddress', 'billingAddress'])
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $orders->map(function ($order) {
                    return $this->transformOrder($order);
                }),
                'pagination' => [
                    'current_page' => $orders->currentPage(),
                    'last_page' => $orders->lastPage(),
                    'per_page' => $orders->perPage(),
                    'total' => $orders->total(),
                ],
                'message' => 'Orders retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve orders',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new order (checkout)
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'shipping_address_id' => 'required|integer|exists:addresses,id',
                'billing_address_id' => 'nullable|integer|exists:addresses,id',
                'payment_method' => 'required|string|in:stripe,bkash,nagad,rocket,cod',
                'shipping_method' => 'required|string|in:standard,express,overnight',
                'notes' => 'nullable|string|max:500',
                'accept_terms' => 'required|accepted',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = $request->user();

            // Get cart items
            $cartItems = CartItem::with('product')
                ->where('user_id', $user->id)
                ->get();

            if ($cartItems->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cart is empty'
                ], 422);
            }

            // Validate addresses
            $shippingAddress = Address::where('id', $request->shipping_address_id)
                ->where('user_id', $user->id)
                ->first();

            if (!$shippingAddress) {
                return response()->json([
                    'success' => false,
                    'message' => 'Shipping address not found'
                ], 422);
            }

            $billingAddress = null;
            if ($request->billing_address_id) {
                $billingAddress = Address::where('id', $request->billing_address_id)
                    ->where('user_id', $user->id)
                    ->first();

                if (!$billingAddress) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Billing address not found'
                    ], 422);
                }
            } else {
                $billingAddress = $shippingAddress;
            }

            // Validate stock and calculate totals
            $orderItems = [];
            $subtotal = 0;
            $totalItems = 0;

            foreach ($cartItems as $cartItem) {
                $product = $cartItem->product;

                // Check if product is still available
                if (!$product->is_active) {
                    return response()->json([
                        'success' => false,
                        'message' => "Product '{$product->name}' is no longer available"
                    ], 422);
                }

                // Check stock
                if ($cartItem->quantity > $product->stock) {
                    return response()->json([
                        'success' => false,
                        'message' => "Product '{$product->name}' - only {$product->stock} available, requested {$cartItem->quantity}"
                    ], 422);
                }

                $itemTotal = $product->price * $cartItem->quantity;
                $subtotal += $itemTotal;
                $totalItems += $cartItem->quantity;

                $orderItems[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_sku' => $product->sku,
                    'quantity' => $cartItem->quantity,
                    'unit_price' => $product->price,
                    'total_price' => $itemTotal,
                ];
            }

            // Calculate shipping cost
            $shippingCost = $this->calculateShippingCost($request->shipping_method, $subtotal);

            // Calculate tax (5% VAT for Bangladesh)
            $tax = $subtotal * 0.05;

            // Calculate total
            $total = $subtotal + $shippingCost + $tax;

            // Generate order number
            $orderNumber = 'ORD-' . strtoupper(Str::random(8));

            DB::beginTransaction();

            try {
                // Create order
                $order = Order::create([
                    'user_id' => $user->id,
                    'order_number' => $orderNumber,
                    'status' => 'pending',
                    'subtotal' => $subtotal,
                    'tax' => $tax,
                    'shipping_cost' => $shippingCost,
                    'total' => $total,
                    'shipping_address_id' => $shippingAddress->id,
                    'billing_address_id' => $billingAddress->id,
                    'payment_method' => $request->payment_method,
                    'shipping_method' => $request->shipping_method,
                    'notes' => $request->notes,
                    'payment_status' => 'pending',
                ]);

                // Create order items
                foreach ($orderItems as $item) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $item['product_id'],
                        'product_name' => $item['product_name'],
                        'product_sku' => $item['product_sku'],
                        'quantity' => $item['quantity'],
                        'unit_price' => $item['unit_price'],
                        'total_price' => $item['total_price'],
                    ]);

                    // Update product stock
                    $product = Product::find($item['product_id']);
                    $product->decrement('stock', $item['quantity']);
                }

                // Clear cart
                CartItem::where('user_id', $user->id)->delete();

                DB::commit();

                // Load relationships
                $order->load(['items.product', 'shippingAddress', 'billingAddress']);

                return response()->json([
                    'success' => true,
                    'data' => $this->transformOrder($order),
                    'message' => 'Order created successfully'
                ], 201);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific order
     */
    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $user = $request->user();
            
            $order = Order::with(['items.product', 'shippingAddress', 'billingAddress'])
                ->where('id', $id)
                ->where('user_id', $user->id)
                ->first();

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $this->transformOrder($order),
                'message' => 'Order retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancel an order
     */
    public function cancel(Request $request, int $id): JsonResponse
    {
        try {
            $user = $request->user();
            
            $order = Order::where('id', $id)
                ->where('user_id', $user->id)
                ->first();

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            // Check if order can be cancelled
            if (!in_array($order->status, ['pending', 'confirmed'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order cannot be cancelled at this stage'
                ], 422);
            }

            DB::beginTransaction();

            try {
                // Update order status
                $order->update([
                    'status' => 'cancelled',
                    'cancelled_at' => now(),
                ]);

                // Restore product stock
                foreach ($order->items as $item) {
                    $product = Product::find($item->product_id);
                    if ($product) {
                        $product->increment('stock', $item->quantity);
                    }
                }

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Order cancelled successfully'
                ]);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Process payment for an order
     */
    public function processPayment(Request $request, int $id): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'payment_token' => 'nullable|string',
                'payment_details' => 'nullable|array',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = $request->user();
            
            $order = Order::where('id', $id)
                ->where('user_id', $user->id)
                ->first();

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            if ($order->payment_status === 'paid') {
                return response()->json([
                    'success' => false,
                    'message' => 'Order is already paid'
                ], 422);
            }

            // Process payment based on method
            $paymentResult = $this->processPaymentByMethod($order, $request);

            if ($paymentResult['success']) {
                $order->update([
                    'payment_status' => 'paid',
                    'paid_at' => now(),
                    'status' => 'confirmed',
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Payment processed successfully',
                    'data' => [
                        'payment_id' => $paymentResult['payment_id'],
                        'order_status' => 'confirmed',
                    ]
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment failed',
                    'error' => $paymentResult['error']
                ], 422);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to process payment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calculate shipping cost
     */
    protected function calculateShippingCost(string $method, float $subtotal): float
    {
        $shippingRates = [
            'standard' => [
                'base_cost' => 100,
                'free_threshold' => 1000,
                'cost_per_kg' => 50,
            ],
            'express' => [
                'base_cost' => 200,
                'free_threshold' => 2000,
                'cost_per_kg' => 100,
            ],
            'overnight' => [
                'base_cost' => 500,
                'free_threshold' => 5000,
                'cost_per_kg' => 200,
            ],
        ];

        $rate = $shippingRates[$method];
        
        if ($subtotal >= $rate['free_threshold']) {
            return 0; // Free shipping
        }

        return $rate['base_cost'];
    }

    /**
     * Process payment by method
     */
    protected function processPaymentByMethod(Order $order, Request $request): array
    {
        switch ($order->payment_method) {
            case 'stripe':
                return $this->processStripePayment($order, $request);
            
            case 'bkash':
            case 'nagad':
            case 'rocket':
                return $this->processMobilePayment($order, $request);
            
            case 'cod':
                return $this->processCodPayment($order);
            
            default:
                return [
                    'success' => false,
                    'error' => 'Unsupported payment method'
                ];
        }
    }

    /**
     * Process Stripe payment
     */
    protected function processStripePayment(Order $order, Request $request): array
    {
        // This would integrate with Stripe API
        // For now, we'll simulate success
        return [
            'success' => true,
            'payment_id' => 'stripe_' . Str::random(16),
        ];
    }

    /**
     * Process mobile payment
     */
    protected function processMobilePayment(Order $order, Request $request): array
    {
        // This would integrate with mobile payment gateways
        // For now, we'll simulate success
        return [
            'success' => true,
            'payment_id' => $order->payment_method . '_' . Str::random(16),
        ];
    }

    /**
     * Process COD payment
     */
    protected function processCodPayment(Order $order): array
    {
        // COD is always successful
        return [
            'success' => true,
            'payment_id' => 'cod_' . Str::random(16),
        ];
    }

    /**
     * Transform order data for API response
     */
    protected function transformOrder($order): array
    {
        return [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'status' => $order->status,
            'status_label' => ucfirst($order->status),
            'payment_status' => $order->payment_status,
            'payment_method' => $order->payment_method,
            'shipping_method' => $order->shipping_method,
            'subtotal' => $order->subtotal,
            'tax' => $order->tax,
            'shipping_cost' => $order->shipping_cost,
            'total' => $order->total,
            'notes' => $order->notes,
            'shipping_address' => $this->transformAddress($order->shippingAddress),
            'billing_address' => $this->transformAddress($order->billingAddress),
            'items' => $order->items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'product_name' => $item->product_name,
                    'product_sku' => $item->product_sku,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'total_price' => $item->total_price,
                    'product' => $item->product ? [
                        'id' => $item->product->id,
                        'name' => $item->product->name,
                        'slug' => $item->product->slug,
                        'featured_image' => $item->product->media->first() ? [
                            'url' => $item->product->media->first()->getUrl(),
                            'thumbnail' => $item->product->media->first()->getUrl('thumbnail'),
                        ] : null,
                    ] : null,
                ];
            }),
            'created_at' => $order->created_at,
            'updated_at' => $order->updated_at,
            'paid_at' => $order->paid_at,
            'cancelled_at' => $order->cancelled_at,
        ];
    }

    /**
     * Transform address data for API response
     */
    protected function transformAddress($address): ?array
    {
        if (!$address) {
            return null;
        }

        return [
            'id' => $address->id,
            'type' => $address->type,
            'address_line_1' => $address->address_line_1,
            'address_line_2' => $address->address_line_2,
            'city' => $address->city,
            'state' => $address->state,
            'postal_code' => $address->postal_code,
            'country' => $address->country,
            'phone' => $address->phone,
            'full_address' => $this->getFullAddress($address),
        ];
    }

    /**
     * Get formatted full address
     */
    protected function getFullAddress($address): string
    {
        $parts = [
            $address->address_line_1,
            $address->address_line_2,
            $address->city,
            $address->state,
            $address->postal_code,
            $address->country
        ];

        return implode(', ', array_filter($parts));
    }

    /**
     * Admin: Get all orders with admin-specific data
     */
    public function adminIndex(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'page' => 'nullable|integer|min:1',
                'per_page' => 'nullable|integer|min:1|max:100',
                'search' => 'nullable|string|max:255',
                'status' => 'nullable|string|in:pending,processing,shipped,delivered,cancelled',
                'sort_by' => 'nullable|string|in:created_at,order_number,total,status',
                'sort_order' => 'nullable|string|in:asc,desc',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $query = Order::with(['items.product', 'shippingAddress', 'billingAddress', 'user']);

            // Apply search filter
            if ($request->has('search') && $request->search) {
                $searchTerm = $request->search;
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('order_number', 'like', "%{$searchTerm}%")
                      ->orWhereHas('user', function ($userQuery) use ($searchTerm) {
                          $userQuery->where('name', 'like', "%{$searchTerm}%")
                                   ->orWhere('email', 'like', "%{$searchTerm}%");
                      });
                });
            }

            // Apply status filter
            if ($request->has('status') && $request->status) {
                $query->where('status', $request->status);
            }

            // Apply sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 20);
            $orders = $query->paginate($perPage);

            // Transform orders for admin
            $orders->getCollection()->transform(function ($order) {
                return $this->transformAdminOrder($order);
            });

            return response()->json([
                'success' => true,
                'data' => $orders,
                'message' => 'Orders retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve orders',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin: Update order status
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        try {
            $order = Order::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'status' => 'required|string|in:pending,processing,shipped,delivered,cancelled'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $oldStatus = $order->status;
            $order->status = $request->status;

            // Update timestamps based on status
            if ($request->status === 'delivered') {
                $order->delivered_at = now();
            } elseif ($request->status === 'cancelled') {
                $order->cancelled_at = now();
            }

            $order->save();

            return response()->json([
                'success' => true,
                'data' => $this->transformAdminOrder($order->fresh()),
                'message' => 'Order status updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin: Update order shipping information
     */
    public function updateShipping(Request $request, int $id): JsonResponse
    {
        try {
            $order = Order::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'tracking_number' => 'nullable|string|max:100',
                'shipping_carrier' => 'nullable|string|max:100',
                'estimated_delivery' => 'nullable|date|after:today',
                'shipping_notes' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $order->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $this->transformAdminOrder($order->fresh()),
                'message' => 'Shipping information updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update shipping information',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Transform order data for admin API response
     */
    protected function transformAdminOrder($order): array
    {
        return [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'status' => $order->status,
            'status_label' => ucfirst($order->status),
            'payment_status' => $order->payment_status,
            'payment_method' => $order->payment_method,
            'shipping_method' => $order->shipping_method,
            'subtotal' => $order->subtotal,
            'tax' => $order->tax,
            'shipping_cost' => $order->shipping_cost,
            'total' => $order->total,
            'notes' => $order->notes,
            'tracking_number' => $order->tracking_number,
            'shipping_carrier' => $order->shipping_carrier,
            'estimated_delivery' => $order->estimated_delivery,
            'shipping_notes' => $order->shipping_notes,
            'user' => $order->user ? [
                'id' => $order->user->id,
                'name' => $order->user->name,
                'email' => $order->user->email,
                'phone' => $order->user->phone,
            ] : null,
            'shipping_address' => $this->transformAddress($order->shippingAddress),
            'billing_address' => $this->transformAddress($order->billingAddress),
            'items' => $order->items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'product_name' => $item->product_name,
                    'product_sku' => $item->product_sku,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                ];
            }),
            'created_at' => $order->created_at,
            'updated_at' => $order->updated_at,
            'paid_at' => $order->paid_at,
            'cancelled_at' => $order->cancelled_at,
            'delivered_at' => $order->delivered_at,
        ];
    }
}
