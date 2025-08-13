<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PurchaseOrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'purchase_order_id',
        'product_id',
        'product_name',
        'product_sku',
        'quantity_ordered',
        'quantity_received',
        'unit_cost',
        'total_cost',
        'notes',
    ];

    protected $casts = [
        'quantity_ordered' => 'integer',
        'quantity_received' => 'integer',
        'unit_cost' => 'decimal:2',
        'total_cost' => 'decimal:2',
    ];

    protected $appends = [
        'quantity_pending',
        'receipt_percentage',
        'is_fully_received',
    ];

    // Relationships
    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    // Accessors
    public function getQuantityPendingAttribute(): int
    {
        return max(0, $this->quantity_ordered - $this->quantity_received);
    }

    public function getReceiptPercentageAttribute(): float
    {
        if ($this->quantity_ordered == 0) return 0;
        return round(($this->quantity_received / $this->quantity_ordered) * 100, 2);
    }

    public function getIsFullyReceivedAttribute(): bool
    {
        return $this->quantity_received >= $this->quantity_ordered;
    }

    // Methods
    public function receiveQuantity(int $quantity): bool
    {
        $availableToReceive = $this->quantity_pending;
        $quantityToReceive = min($quantity, $availableToReceive);
        
        if ($quantityToReceive > 0) {
            $this->quantity_received += $quantityToReceive;
            $this->save();
            
            // Update product stock
            if ($this->product) {
                $this->product->updateStock($quantityToReceive, 'increase');
            }
            
            return true;
        }
        
        return false;
    }

    public function calculateTotalCost(): void
    {
        $this->total_cost = $this->quantity_ordered * $this->unit_cost;
        $this->save();
    }

    public function canReceive(): bool
    {
        return $this->quantity_pending > 0;
    }

    public function getReceiptStatus(): string
    {
        if ($this->is_fully_received) {
            return 'fully_received';
        } elseif ($this->quantity_received > 0) {
            return 'partially_received';
        } else {
            return 'pending';
        }
    }
}
