<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Supplier;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\InventoryAlert;
use App\Models\InventoryTransaction;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class InventoryService
{
    /**
     * Check and create inventory alerts for all products
     */
    public function checkInventoryAlerts(): array
    {
        $alerts = [];
        
        try {
            // Check low stock and out of stock
            $lowStockProducts = Product::where('stock_quantity', '<=', DB::raw('reorder_point'))
                                     ->where('stock_quantity', '>', 0)
                                     ->get();
            
            $outOfStockProducts = Product::where('stock_quantity', 0)->get();
            
            // Check expiry warnings
            $expiringProducts = Product::whereNotNull('expiry_date')
                                     ->where('expiry_date', '<=', now()->addDays(30))
                                     ->where('stock_quantity', '>', 0)
                                     ->get();
            
            foreach ($lowStockProducts as $product) {
                $alert = $this->createLowStockAlert($product);
                if ($alert) $alerts[] = $alert;
            }
            
            foreach ($outOfStockProducts as $product) {
                $alert = $this->createOutOfStockAlert($product);
                if ($alert) $alerts[] = $alert;
            }
            
            foreach ($expiringProducts as $product) {
                $daysUntilExpiry = now()->diffInDays($product->expiry_date, false);
                if ($daysUntilExpiry <= 30) {
                    $alert = $this->createExpiryWarningAlert($product, $daysUntilExpiry);
                    if ($alert) $alerts[] = $alert;
                }
            }
            
            Log::info('Inventory alerts checked', ['alerts_created' => count($alerts)]);
            
        } catch (\Exception $e) {
            Log::error('Error checking inventory alerts', ['error' => $e->getMessage()]);
        }
        
        return $alerts;
    }
    
    /**
     * Create low stock alert for a product
     */
    private function createLowStockAlert(Product $product): ?InventoryAlert
    {
        // Check if alert already exists
        $existingAlert = InventoryAlert::where('product_id', $product->id)
                                     ->where('type', 'low_stock')
                                     ->where('status', 'active')
                                     ->first();
        
        if ($existingAlert) {
            return null;
        }
        
        return InventoryAlert::createLowStockAlert($product, $product->stock_quantity, $product->reorder_point);
    }
    
    /**
     * Create out of stock alert for a product
     */
    private function createOutOfStockAlert(Product $product): ?InventoryAlert
    {
        // Check if alert already exists
        $existingAlert = InventoryAlert::where('product_id', $product->id)
                                     ->where('type', 'out_of_stock')
                                     ->where('status', 'active')
                                     ->first();
        
        if ($existingAlert) {
            return null;
        }
        
        return InventoryAlert::createOutOfStockAlert($product);
    }
    
    /**
     * Create expiry warning alert for a product
     */
    private function createExpiryWarningAlert(Product $product, int $daysUntilExpiry): ?InventoryAlert
    {
        // Check if alert already exists
        $existingAlert = InventoryAlert::where('product_id', $product->id)
                                     ->where('type', 'expiry_warning')
                                     ->where('status', 'active')
                                     ->first();
        
        if ($existingAlert) {
            return null;
        }
        
        return InventoryAlert::createExpiryWarningAlert($product, $daysUntilExpiry);
    }
    
    /**
     * Generate purchase orders for low stock products
     */
    public function generatePurchaseOrders(): array
    {
        $orders = [];
        
        try {
            $lowStockProducts = Product::where('auto_reorder_enabled', true)
                                     ->where('stock_quantity', '<=', DB::raw('reorder_point'))
                                     ->whereNotNull('supplier_id')
                                     ->with('supplier')
                                     ->get();
            
            // Group products by supplier
            $productsBySupplier = $lowStockProducts->groupBy('supplier_id');
            
            foreach ($productsBySupplier as $supplierId => $products) {
                $supplier = Supplier::find($supplierId);
                
                if (!$supplier || !$supplier->canOrder()) {
                    continue;
                }
                
                $order = $this->createPurchaseOrder($supplier, $products);
                if ($order) {
                    $orders[] = $order;
                }
            }
            
            Log::info('Purchase orders generated', ['orders_created' => count($orders)]);
            
        } catch (\Exception $e) {
            Log::error('Error generating purchase orders', ['error' => $e->getMessage()]);
        }
        
        return $orders;
    }
    
    /**
     * Create a purchase order for a supplier
     */
    private function createPurchaseOrder(Supplier $supplier, Collection $products): ?PurchaseOrder
    {
        try {
            DB::beginTransaction();
            
            $poNumber = 'PO-' . date('Ymd') . '-' . str_pad(PurchaseOrder::count() + 1, 4, '0', STR_PAD_LEFT);
            
            $order = PurchaseOrder::create([
                'po_number' => $poNumber,
                'supplier_id' => $supplier->id,
                'status' => 'draft',
                'order_date' => now(),
                'expected_delivery_date' => now()->addDays($supplier->lead_time_days),
                'user_id' => auth()->id() ?? null,
            ]);
            
            $subtotal = 0;
            
            foreach ($products as $product) {
                $quantity = $product->reorder_quantity;
                $unitCost = $product->cost_price ?? 0;
                $totalCost = $quantity * $unitCost;
                
                PurchaseOrderItem::create([
                    'purchase_order_id' => $order->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_sku' => $product->sku,
                    'quantity_ordered' => $quantity,
                    'unit_cost' => $unitCost,
                    'total_cost' => $totalCost,
                ]);
                
                $subtotal += $totalCost;
            }
            
            $order->subtotal = $subtotal;
            $order->total_amount = $subtotal;
            $order->save();
            
            DB::commit();
            
            return $order;
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating purchase order', [
                'supplier_id' => $supplier->id,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }
    
    /**
     * Receive inventory from purchase order
     */
    public function receiveInventory(int $purchaseOrderId, array $receivedItems): bool
    {
        try {
            DB::beginTransaction();
            
            $purchaseOrder = PurchaseOrder::with('items.product')->findOrFail($purchaseOrderId);
            
            if (!$purchaseOrder->canReceive()) {
                throw new \Exception('Purchase order cannot be received');
            }
            
            $fullyReceived = true;
            
            foreach ($receivedItems as $itemId => $receivedQuantity) {
                $item = $purchaseOrder->items()->find($itemId);
                
                if (!$item || $receivedQuantity <= 0) {
                    continue;
                }
                
                $quantityToReceive = min($receivedQuantity, $item->quantity_pending);
                
                if ($quantityToReceive > 0) {
                    $item->receiveQuantity($quantityToReceive);
                    
                    // Create inventory transaction
                    InventoryTransaction::createPurchaseTransaction(
                        $item->product,
                        $quantityToReceive,
                        $item->unit_cost,
                        $purchaseOrder->id,
                        "Received from PO: {$purchaseOrder->po_number}"
                    );
                }
                
                if ($item->quantity_pending > 0) {
                    $fullyReceived = false;
                }
            }
            
            // Update purchase order status
            if ($fullyReceived) {
                $purchaseOrder->markAsReceived();
            } else {
                $purchaseOrder->status = 'partially_received';
                $purchaseOrder->save();
            }
            
            DB::commit();
            
            // Resolve related alerts
            $this->resolveInventoryAlerts($purchaseOrder);
            
            return true;
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error receiving inventory', [
                'purchase_order_id' => $purchaseOrderId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
    
    /**
     * Resolve inventory alerts for products in purchase order
     */
    private function resolveInventoryAlerts(PurchaseOrder $purchaseOrder): void
    {
        foreach ($purchaseOrder->items as $item) {
            $product = $item->product;
            
            if ($product->stock_quantity > $product->reorder_point) {
                // Resolve low stock alerts
                InventoryAlert::where('product_id', $product->id)
                             ->whereIn('type', ['low_stock', 'out_of_stock'])
                             ->where('status', 'active')
                             ->update(['status' => 'resolved']);
            }
        }
    }
    
    /**
     * Get inventory summary
     */
    public function getInventorySummary(): array
    {
        $totalProducts = Product::count();
        $inStockProducts = Product::where('stock_quantity', '>', 0)->count();
        $lowStockProducts = Product::where('stock_quantity', '<=', DB::raw('reorder_point'))
                                  ->where('stock_quantity', '>', 0)
                                  ->count();
        $outOfStockProducts = Product::where('stock_quantity', 0)->count();
        
        $totalValue = Product::sum(DB::raw('stock_quantity * cost_price'));
        $lowStockValue = Product::where('stock_quantity', '<=', DB::raw('reorder_point'))
                               ->sum(DB::raw('stock_quantity * cost_price'));
        
        $activeAlerts = InventoryAlert::active()->count();
        $criticalAlerts = InventoryAlert::active()->critical()->count();
        
        return [
            'total_products' => $totalProducts,
            'in_stock_products' => $inStockProducts,
            'low_stock_products' => $lowStockProducts,
            'out_of_stock_products' => $outOfStockProducts,
            'total_value' => $totalValue,
            'low_stock_value' => $lowStockValue,
            'active_alerts' => $activeAlerts,
            'critical_alerts' => $criticalAlerts,
        ];
    }
    
    /**
     * Get low stock products
     */
    public function getLowStockProducts(int $limit = 50): Collection
    {
        return Product::where(function($query) {
                        $query->where('stock_quantity', '<=', DB::raw('COALESCE(reorder_point, 10)'))
                              ->orWhere('stock_quantity', '<=', 10);
                     })
                     ->with(['supplier', 'category'])
                     ->orderBy('stock_quantity')
                     ->limit($limit)
                     ->get();
    }
    
    /**
     * Get expiring products
     */
    public function getExpiringProducts(int $days = 30): Collection
    {
        return Product::whereNotNull('expiry_date')
                     ->where('expiry_date', '<=', now()->addDays($days))
                     ->where('stock_quantity', '>', 0)
                     ->with(['supplier', 'category'])
                     ->orderBy('expiry_date')
                     ->get();
    }
    
    /**
     * Get inventory transactions
     */
    public function getInventoryTransactions(array $filters = [], int $perPage = 20)
    {
        $query = InventoryTransaction::with(['product', 'user'])
                                   ->orderBy('created_at', 'desc');
        
        if (isset($filters['product_id'])) {
            $query->where('product_id', $filters['product_id']);
        }
        
        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }
        
        if (isset($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }
        
        if (isset($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }
        
        return $query->paginate($perPage);
    }
    
    /**
     * Update product stock
     */
    public function updateProductStock(Product $product, int $quantity, string $operation = 'decrease', ?string $notes = null): bool
    {
        try {
            DB::beginTransaction();
            
            $oldStock = $product->stock_quantity;
            
            if ($operation === 'decrease') {
                if ($oldStock < $quantity) {
                    throw new \Exception('Insufficient stock');
                }
                $newStock = $oldStock - $quantity;
            } else {
                $newStock = $oldStock + $quantity;
            }
            
            $product->stock_quantity = $newStock;
            $product->stock_status = $this->calculateStockStatus($newStock, $product->reorder_point);
            $product->last_stock_update = now();
            $product->save();
            
            // Create inventory transaction
            $transactionType = $operation === 'decrease' ? 'sale' : 'purchase';
            InventoryTransaction::create([
                'product_id' => $product->id,
                'type' => $transactionType,
                'quantity' => $operation === 'decrease' ? -$quantity : $quantity,
                'quantity_before' => $oldStock,
                'quantity_after' => $newStock,
                'notes' => $notes,
                'user_id' => auth()->id() ?? null,
            ]);
            
            DB::commit();
            
            // Check for new alerts
            $this->checkProductAlerts($product);
            
            return true;
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating product stock', [
                'product_id' => $product->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
    
    /**
     * Calculate stock status
     */
    private function calculateStockStatus(int $stock, int $reorderPoint): string
    {
        if ($stock <= 0) return 'out_of_stock';
        if ($stock <= $reorderPoint) return 'low_stock';
        return 'in_stock';
    }
    
    /**
     * Check for new alerts for a specific product
     */
    private function checkProductAlerts(Product $product): void
    {
        if ($product->stock_quantity <= $product->reorder_point) {
            if ($product->stock_quantity <= 0) {
                $this->createOutOfStockAlert($product);
            } else {
                $this->createLowStockAlert($product);
            }
        }
        
        // Check expiry
        if ($product->expiry_date && $product->stock_quantity > 0) {
            $daysUntilExpiry = now()->diffInDays($product->expiry_date, false);
            if ($daysUntilExpiry <= 30) {
                $this->createExpiryWarningAlert($product, $daysUntilExpiry);
            }
        }
    }
}
