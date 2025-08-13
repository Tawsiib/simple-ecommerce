<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PurchaseOrder extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'po_number',
        'supplier_id',
        'status',
        'order_date',
        'expected_delivery_date',
        'actual_delivery_date',
        'subtotal',
        'tax_amount',
        'shipping_cost',
        'total_amount',
        'notes',
        'terms_conditions',
        'shipping_address',
        'shipping_method',
        'payment_status',
        'payment_due_date',
    ];

    protected $casts = [
        'order_date' => 'date',
        'expected_delivery_date' => 'date',
        'actual_delivery_date' => 'date',
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'shipping_address' => 'array',
        'payment_due_date' => 'date',
    ];

    protected $appends = [
        'status_badge',
        'payment_status_badge',
        'is_overdue',
        'days_until_delivery',
        'total_items',
    ];

    // Relationships
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    public function scopeOverdue($query)
    {
        return $query->where('expected_delivery_date', '<', now())
                    ->whereNotIn('status', ['received', 'cancelled']);
    }

    // Accessors
    public function getStatusBadgeAttribute(): string
    {
        return match($this->status) {
            'draft' => 'bg-gray-100 text-gray-800',
            'sent' => 'bg-blue-100 text-blue-800',
            'confirmed' => 'bg-yellow-100 text-yellow-800',
            'partially_received' => 'bg-orange-100 text-orange-800',
            'received' => 'bg-green-100 text-green-800',
            'cancelled' => 'bg-red-100 text-red-800',
            default => 'bg-gray-100 text-gray-800',
        };
    }

    public function getPaymentStatusBadgeAttribute(): string
    {
        return match($this->payment_status) {
            'pending' => 'bg-yellow-100 text-yellow-800',
            'partial' => 'bg-orange-100 text-orange-800',
            'paid' => 'bg-green-100 text-green-800',
            default => 'bg-gray-100 text-gray-800',
        };
    }

    public function getIsOverdueAttribute(): bool
    {
        return $this->expected_delivery_date < now() && 
               !in_array($this->status, ['received', 'cancelled']);
    }

    public function getDaysUntilDeliveryAttribute(): int
    {
        return max(0, now()->diffInDays($this->expected_delivery_date, false));
    }

    public function getTotalItemsAttribute(): int
    {
        return $this->items()->sum('quantity_ordered');
    }

    // Methods
    public function canEdit(): bool
    {
        return in_array($this->status, ['draft']);
    }

    public function canCancel(): bool
    {
        return !in_array($this->status, ['received', 'cancelled']);
    }

    public function canReceive(): bool
    {
        return in_array($this->status, ['confirmed', 'partially_received']);
    }

    public function markAsSent(): bool
    {
        $this->status = 'sent';
        return $this->save();
    }

    public function markAsConfirmed(): bool
    {
        $this->status = 'confirmed';
        return $this->save();
    }

    public function markAsReceived(): bool
    {
        $this->status = 'received';
        $this->actual_delivery_date = now();
        return $this->save();
    }

    public function cancel(): bool
    {
        $this->status = 'cancelled';
        return $this->save();
    }

    public function calculateTotals(): void
    {
        $this->subtotal = $this->items()->sum('total_cost');
        $this->total_amount = $this->subtotal + $this->tax_amount + $this->shipping_cost;
        $this->save();
    }

    public function isFullyReceived(): bool
    {
        $ordered = $this->items()->sum('quantity_ordered');
        $received = $this->items()->sum('quantity_received');
        return $received >= $ordered;
    }

    public function getReceiptPercentage(): float
    {
        $ordered = $this->items()->sum('quantity_ordered');
        if ($ordered == 0) return 0;
        
        $received = $this->items()->sum('quantity_received');
        return round(($received / $ordered) * 100, 2);
    }
}
