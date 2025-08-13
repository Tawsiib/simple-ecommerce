<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class InventoryTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'type',
        'quantity',
        'quantity_before',
        'quantity_after',
        'unit_cost',
        'total_cost',
        'reference_type',
        'reference_id',
        'notes',
        'user_id',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'quantity_before' => 'integer',
        'quantity_after' => 'integer',
        'unit_cost' => 'decimal:2',
        'total_cost' => 'decimal:2',
    ];

    protected $appends = [
        'type_label',
        'type_badge',
        'impact',
    ];

    // Relationships
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByProduct($query, int $productId)
    {
        return $query->where('product_id', $productId);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    public function scopeInbound($query)
    {
        return $query->whereIn('type', ['purchase', 'return', 'adjustment']);
    }

    public function scopeOutbound($query)
    {
        return $query->whereIn('type', ['sale', 'damage', 'expiry']);
    }

    // Accessors
    public function getTypeLabelAttribute(): string
    {
        return match($this->type) {
            'purchase' => 'Purchase',
            'sale' => 'Sale',
            'return' => 'Return',
            'adjustment' => 'Adjustment',
            'transfer' => 'Transfer',
            'damage' => 'Damage',
            'expiry' => 'Expiry',
            default => 'Unknown',
        };
    }

    public function getTypeBadgeAttribute(): string
    {
        return match($this->type) {
            'purchase', 'return' => 'bg-green-100 text-green-800',
            'sale' => 'bg-blue-100 text-blue-800',
            'adjustment', 'transfer' => 'bg-yellow-100 text-yellow-800',
            'damage', 'expiry' => 'bg-red-100 text-red-800',
            default => 'bg-gray-100 text-gray-800',
        };
    }

    public function getImpactAttribute(): string
    {
        return $this->quantity > 0 ? 'positive' : 'negative';
    }

    // Methods
    public function isInbound(): bool
    {
        return in_array($this->type, ['purchase', 'return', 'adjustment']);
    }

    public function isOutbound(): bool
    {
        return in_array($this->type, ['sale', 'damage', 'expiry']);
    }

    public function getNetQuantityChange(): int
    {
        return $this->quantity_after - $this->quantity_before;
    }

    public function getReferenceModel()
    {
        if (!$this->reference_type || !$this->reference_id) {
            return null;
        }

        $modelClass = 'App\\Models\\' . $this->reference_type;
        
        if (class_exists($modelClass)) {
            return $modelClass::find($this->reference_id);
        }

        return null;
    }

    public function getReferenceUrl(): ?string
    {
        $model = $this->getReferenceModel();
        
        if (!$model) return null;

        return match($this->reference_type) {
            'Order' => '/admin/orders/' . $model->id,
            'PurchaseOrder' => '/admin/purchase-orders/' . $model->id,
            default => null,
        };
    }

    // Static methods for creating transactions
    public static function createPurchaseTransaction(
        Product $product,
        int $quantity,
        float $unitCost,
        $referenceId = null,
        $notes = null
    ): self {
        return self::create([
            'product_id' => $product->id,
            'type' => 'purchase',
            'quantity' => $quantity,
            'quantity_before' => $product->stock,
            'quantity_after' => $product->stock + $quantity,
            'unit_cost' => $unitCost,
            'total_cost' => $quantity * $unitCost,
            'reference_type' => 'PurchaseOrder',
            'reference_id' => $referenceId,
            'notes' => $notes,
            'user_id' => auth()->id() ?? null,
        ]);
    }

    public static function createSaleTransaction(
        Product $product,
        int $quantity,
        $referenceId = null,
        $notes = null
    ): self {
        return self::create([
            'product_id' => $product->id,
            'type' => 'sale',
            'quantity' => -$quantity,
            'quantity_before' => $product->stock,
            'quantity_after' => $product->stock - $quantity,
            'reference_type' => 'Order',
            'reference_id' => $referenceId,
            'notes' => $notes,
            'user_id' => auth()->id() ?? null,
        ]);
    }

    public static function createAdjustmentTransaction(
        Product $product,
        int $quantity,
        float $unitCost = null,
        $notes = null
    ): self {
        return self::create([
            'product_id' => $product->id,
            'type' => 'adjustment',
            'quantity' => $quantity,
            'quantity_before' => $product->stock,
            'quantity_after' => $product->stock + $quantity,
            'unit_cost' => $unitCost,
            'total_cost' => $unitCost ? $quantity * $unitCost : null,
            'notes' => $notes,
            'user_id' => auth()->id() ?? null,
        ]);
    }
}
