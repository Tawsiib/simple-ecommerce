<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class InventoryAlert extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'type',
        'severity',
        'status',
        'message',
        'metadata',
        'acknowledged_at',
        'acknowledged_by',
        'resolved_at',
        'resolved_by',
    ];

    protected $casts = [
        'metadata' => 'array',
        'acknowledged_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];

    protected $appends = [
        'severity_badge',
        'status_badge',
        'type_label',
        'is_active',
        'is_acknowledged',
        'is_resolved',
    ];

    // Relationships
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function acknowledgedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'acknowledged_by');
    }

    public function resolvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeBySeverity($query, string $severity)
    {
        return $query->where('severity', $severity);
    }

    public function scopeCritical($query)
    {
        return $query->where('severity', 'critical');
    }

    public function scopeHigh($query)
    {
        return $query->where('severity', 'high');
    }

    // Accessors
    public function getSeverityBadgeAttribute(): string
    {
        return match($this->severity) {
            'low' => 'bg-gray-100 text-gray-800',
            'medium' => 'bg-yellow-100 text-yellow-800',
            'high' => 'bg-orange-100 text-orange-800',
            'critical' => 'bg-red-100 text-red-800',
            default => 'bg-gray-100 text-gray-800',
        };
    }

    public function getStatusBadgeAttribute(): string
    {
        return match($this->status) {
            'active' => 'bg-red-100 text-red-800',
            'acknowledged' => 'bg-yellow-100 text-yellow-800',
            'resolved' => 'bg-green-100 text-green-800',
            default => 'bg-gray-100 text-gray-800',
        };
    }

    public function getTypeLabelAttribute(): string
    {
        return match($this->type) {
            'low_stock' => 'Low Stock',
            'out_of_stock' => 'Out of Stock',
            'overstock' => 'Overstock',
            'expiry_warning' => 'Expiry Warning',
            'reorder_point' => 'Reorder Point',
            default => 'Unknown',
        };
    }

    public function getIsActiveAttribute(): bool
    {
        return $this->status === 'active';
    }

    public function getIsAcknowledgedAttribute(): bool
    {
        return $this->status === 'acknowledged';
    }

    public function getIsResolvedAttribute(): bool
    {
        return $this->status === 'resolved';
    }

    // Methods
    public function acknowledge(int $userId): bool
    {
        $this->status = 'acknowledged';
        $this->acknowledged_at = now();
        $this->acknowledged_by = $userId;
        return $this->save();
    }

    public function resolve(int $userId): bool
    {
        $this->status = 'resolved';
        $this->resolved_at = now();
        $this->resolved_by = $userId;
        return $this->save();
    }

    public function reactivate(): bool
    {
        $this->status = 'active';
        $this->acknowledged_at = null;
        $this->acknowledged_by = null;
        $this->resolved_at = null;
        $this->resolved_by = null;
        return $this->save();
    }

    public function isCritical(): bool
    {
        return $this->severity === 'critical';
    }

    public function isHigh(): bool
    {
        return in_array($this->severity, ['high', 'critical']);
    }

    public function getDaysSinceCreated(): int
    {
        return $this->created_at->diffInDays(now());
    }

    public function getDaysSinceAcknowledged(): ?int
    {
        if (!$this->acknowledged_at) return null;
        return $this->acknowledged_at->diffInDays(now());
    }

    // Static methods for creating alerts
    public static function createLowStockAlert(Product $product, int $currentStock, int $threshold): self
    {
        $severity = $currentStock <= 0 ? 'critical' : ($currentStock <= $threshold * 0.5 ? 'high' : 'medium');
        
        return self::create([
            'product_id' => $product->id,
            'type' => 'low_stock',
            'severity' => $severity,
            'status' => 'active',
            'message' => "Product '{$product->name}' is running low on stock. Current: {$currentStock}, Threshold: {$threshold}",
            'metadata' => [
                'current_stock' => $currentStock,
                'threshold' => $threshold,
                'reorder_point' => $product->reorder_point,
                'reorder_quantity' => $product->reorder_quantity,
            ],
        ]);
    }

    public static function createOutOfStockAlert(Product $product): self
    {
        return self::create([
            'product_id' => $product->id,
            'type' => 'out_of_stock',
            'severity' => 'critical',
            'status' => 'active',
            'message' => "Product '{$product->name}' is out of stock",
            'metadata' => [
                'current_stock' => 0,
                'reorder_point' => $product->reorder_point,
                'reorder_quantity' => $product->reorder_quantity,
            ],
        ]);
    }

    public static function createExpiryWarningAlert(Product $product, int $daysUntilExpiry): self
    {
        $severity = $daysUntilExpiry <= 7 ? 'critical' : ($daysUntilExpiry <= 30 ? 'high' : 'medium');
        
        return self::create([
            'product_id' => $product->id,
            'type' => 'expiry_warning',
            'severity' => $severity,
            'status' => 'active',
            'message' => "Product '{$product->name}' expires in {$daysUntilExpiry} days",
            'metadata' => [
                'days_until_expiry' => $daysUntilExpiry,
                'expiry_date' => $product->expiry_date?->toDateString(),
            ],
        ]);
    }
}
