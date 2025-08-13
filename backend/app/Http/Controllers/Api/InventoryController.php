<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\InventoryService;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\PurchaseOrder;
use App\Models\InventoryAlert;
use App\Models\InventoryTransaction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class InventoryController extends Controller
{
    protected $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    /**
     * Get inventory summary
     */
    public function summary(): JsonResponse
    {
        try {
            $summary = $this->inventoryService->getInventorySummary();
            
            return response()->json([
                'success' => true,
                'data' => $summary
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get inventory summary',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get low stock products
     */
    public function lowStock(Request $request): JsonResponse
    {
        try {
            $limit = $request->get('limit', 50);
            $products = $this->inventoryService->getLowStockProducts($limit);
            
            return response()->json([
                'success' => true,
                'data' => $products
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get low stock products',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get expiring products
     */
    public function expiring(Request $request): JsonResponse
    {
        try {
            $days = $request->get('days', 30);
            $products = $this->inventoryService->getExpiringProducts($days);
            
            return response()->json([
                'success' => true,
                'data' => $products
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get expiring products',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get inventory alerts
     */
    public function alerts(Request $request): JsonResponse
    {
        try {
            $query = InventoryAlert::with(['product.category', 'product.supplier'])
                                  ->orderBy('created_at', 'desc');
            
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            
            if ($request->has('type')) {
                $query->where('type', $request->type);
            }
            
            if ($request->has('severity')) {
                $query->where('severity', $request->severity);
            }
            
            $alerts = $query->paginate($request->get('per_page', 20));
            
            return response()->json([
                'success' => true,
                'data' => $alerts
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get inventory alerts',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Acknowledge an alert
     */
    public function acknowledgeAlert(Request $request, int $alertId): JsonResponse
    {
        try {
            $alert = InventoryAlert::findOrFail($alertId);
            $userId = auth()->id();
            
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }
            
            $alert->acknowledge($userId);
            
            return response()->json([
                'success' => true,
                'message' => 'Alert acknowledged successfully',
                'data' => $alert->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to acknowledge alert',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Resolve an alert
     */
    public function resolveAlert(Request $request, int $alertId): JsonResponse
    {
        try {
            $alert = InventoryAlert::findOrFail($alertId);
            $userId = auth()->id();
            
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }
            
            $alert->resolve($userId);
            
            return response()->json([
                'success' => true,
                'message' => 'Alert resolved successfully',
                'data' => $alert->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to resolve alert',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get inventory transactions
     */
    public function transactions(Request $request): JsonResponse
    {
        try {
            $filters = $request->only(['product_id', 'type', 'date_from', 'date_to']);
            $perPage = $request->get('per_page', 20);
            
            $transactions = $this->inventoryService->getInventoryTransactions($filters, $perPage);
            
            return response()->json([
                'success' => true,
                'data' => $transactions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get inventory transactions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update product stock
     */
    public function updateStock(Request $request, int $productId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'quantity' => 'required|integer|min:1',
                'operation' => 'required|in:increase,decrease',
                'notes' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $product = Product::findOrFail($productId);
            
            $success = $this->inventoryService->updateProductStock(
                $product,
                $request->quantity,
                $request->operation,
                $request->notes
            );
            
            if ($success) {
                return response()->json([
                    'success' => true,
                    'message' => 'Stock updated successfully',
                    'data' => $product->fresh()
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to update stock'
                ], 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update stock',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check inventory alerts
     */
    public function checkAlerts(): JsonResponse
    {
        try {
            $alerts = $this->inventoryService->checkInventoryAlerts();
            
            return response()->json([
                'success' => true,
                'message' => 'Inventory alerts checked successfully',
                'data' => $alerts
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check inventory alerts',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate purchase orders
     */
    public function generatePurchaseOrders(): JsonResponse
    {
        try {
            $orders = $this->inventoryService->generatePurchaseOrders();
            
            return response()->json([
                'success' => true,
                'message' => 'Purchase orders generated successfully',
                'data' => $orders
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate purchase orders',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get suppliers
     */
    public function suppliers(Request $request): JsonResponse
    {
        try {
            $query = Supplier::withCount(['products', 'purchaseOrders'])
                            ->orderBy('name');
            
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            
            if ($request->has('preferred')) {
                $query->where('is_preferred', $request->boolean('preferred'));
            }
            
            $suppliers = $query->paginate($request->get('per_page', 20));
            
            return response()->json([
                'success' => true,
                'data' => $suppliers
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get suppliers',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get purchase orders
     */
    public function purchaseOrders(Request $request): JsonResponse
    {
        try {
            $query = PurchaseOrder::with(['supplier', 'items.product'])
                                 ->orderBy('created_at', 'desc');
            
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            
            if ($request->has('supplier_id')) {
                $query->where('supplier_id', $request->supplier_id);
            }
            
            if ($request->has('overdue')) {
                if ($request->boolean('overdue')) {
                    $query->overdue();
                }
            }
            
            $orders = $query->paginate($request->get('per_page', 20));
            
            return response()->json([
                'success' => true,
                'data' => $orders
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get purchase orders',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
