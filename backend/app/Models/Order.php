<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_number',
        'status',
        'total_amount',
        'total',
        'subtotal',
        'tax_amount',
        'tax',
        'shipping_amount',
        'shipping_cost',
        'discount_amount',
        'payment_status',
        'shipping_status',
        'notes',
        'shipping_address',
        'shipping_address_id',
        'billing_address',
        'billing_address_id',
        'payment_method',
        'shipping_method',
        'tracking_number',
        'shipping_carrier',
        'shipping_notes',
        'estimated_delivery',
        'delivered_at',
        'paid_at',
        'cancelled_at',
        'cancellation_reason',
        'refund_amount',
        'refund_reason',
        'coupon_code',
        'coupon_discount',
        'gift_wrap',
        'gift_wrap_message',
        'special_instructions',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'total' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'tax' => 'decimal:2',
        'shipping_amount' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'shipping_address' => 'array',
        'billing_address' => 'array',
        'estimated_delivery' => 'datetime',
        'delivered_at' => 'datetime',
        'paid_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'refund_amount' => 'decimal:2',
        'coupon_discount' => 'decimal:2',
        'gift_wrap' => 'boolean',
    ];

    protected $appends = [
        'formatted_total',
        'formatted_subtotal',
        'formatted_tax',
        'formatted_shipping',
        'formatted_discount',
        'status_label',
        'payment_status_label',
        'shipping_status_label',
        'is_cancelled',
        'is_delivered',
        'is_refunded',
        'can_cancel',
        'can_refund',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function shippingAddress(): BelongsTo
    {
        return $this->belongsTo(Address::class, 'shipping_address_id');
    }

    public function billingAddress(): BelongsTo
    {
        return $this->belongsTo(Address::class, 'billing_address_id');
    }

    // Scopes
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByPaymentStatus($query, $paymentStatus)
    {
        return $query->where('payment_status', $paymentStatus);
    }

    public function scopeByShippingStatus($query, $shippingStatus)
    {
        return $query->where('shipping_status', $shippingStatus);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    public function scopeByOrderNumber($query, $orderNumber)
    {
        return $query->where('order_number', $orderNumber);
    }

    // Accessors
    public function getFormattedTotalAttribute(): string
    {
        return '৳' . number_format($this->total_amount, 2);
    }

    public function getFormattedSubtotalAttribute(): string
    {
        return '৳' . number_format($this->subtotal, 2);
    }

    public function getFormattedTaxAttribute(): string
    {
        return '৳' . number_format($this->tax_amount, 2);
    }

    public function getFormattedShippingAttribute(): string
    {
        return '৳' . number_format($this->shipping_amount, 2);
    }

    public function getFormattedDiscountAttribute(): string
    {
        return '৳' . number_format($this->discount_amount, 2);
    }

    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            'pending' => 'Pending',
            'confirmed' => 'Confirmed',
            'processing' => 'Processing',
            'shipped' => 'Shipped',
            'delivered' => 'Delivered',
            'cancelled' => 'Cancelled',
            'refunded' => 'Refunded',
            default => ucfirst($this->status)
        };
    }

    public function getPaymentStatusLabelAttribute(): string
    {
        return match($this->payment_status) {
            'pending' => 'Pending',
            'paid' => 'Paid',
            'failed' => 'Failed',
            'refunded' => 'Refunded',
            'partially_refunded' => 'Partially Refunded',
            default => ucfirst($this->payment_status)
        };
    }

    public function getShippingStatusLabelAttribute(): string
    {
        return match($this->shipping_status) {
            'pending' => 'Pending',
            'processing' => 'Processing',
            'shipped' => 'Shipped',
            'delivered' => 'Delivered',
            'returned' => 'Returned',
            default => ucfirst($this->shipping_status)
        };
    }

    public function getIsCancelledAttribute(): bool
    {
        return $this->status === 'cancelled';
    }

    public function getIsDeliveredAttribute(): bool
    {
        return $this->status === 'delivered';
    }

    public function getIsRefundedAttribute(): bool
    {
        return $this->status === 'refunded';
    }

    public function getCanCancelAttribute(): bool
    {
        return in_array($this->status, ['pending', 'confirmed', 'processing']) && !$this->is_cancelled;
    }

    public function getCanRefundAttribute(): bool
    {
        return in_array($this->status, ['delivered', 'shipped']) && !$this->is_refunded;
    }

    // Mutators
    public function setOrderNumberAttribute($value)
    {
        if (!$value) {
            $value = 'ORD-' . date('Y') . '-' . str_pad(Order::count() + 1, 6, '0', STR_PAD_LEFT);
        }
        $this->attributes['order_number'] = $value;
    }

    // Methods
    public function calculateTotals(): void
    {
        $this->subtotal = $this->orderItems->sum('total_price');
        $this->total_amount = $this->subtotal + $this->tax_amount + $this->shipping_amount - $this->discount_amount;
        $this->save();
    }

    public function addItem(Product $product, int $quantity, float $unitPrice, array $options = []): OrderItem
    {
        $totalPrice = $unitPrice * $quantity;
        
        return $this->orderItems()->create([
            'product_id' => $product->id,
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'total_price' => $totalPrice,
            'options' => $options,
        ]);
    }

    public function updateStatus(string $status, string $notes = null): bool
    {
        $this->status = $status;
        
        if ($notes) {
            $this->notes = $notes;
        }
        
        if ($status === 'delivered') {
            $this->delivered_at = now();
        } elseif ($status === 'cancelled') {
            $this->cancelled_at = now();
        }
        
        return $this->save();
    }

    public function cancel(string $reason = null): bool
    {
        if (!$this->can_cancel) {
            return false;
        }
        
        $this->status = 'cancelled';
        $this->cancelled_at = now();
        $this->cancellation_reason = $reason;
        
        // Restore product stock
        foreach ($this->orderItems as $item) {
            $item->product->updateStock($item->quantity, 'increase');
        }
        
        return $this->save();
    }

    public function refund(float $amount, string $reason = null): bool
    {
        if (!$this->can_refund || $amount > $this->total_amount) {
            return false;
        }
        
        $this->refund_amount = $amount;
        $this->refund_reason = $reason;
        
        if ($amount >= $this->total_amount) {
            $this->status = 'refunded';
        }
        
        return $this->save();
    }

    public function getEstimatedDeliveryDate(): ?string
    {
        if ($this->estimated_delivery) {
            return $this->estimated_delivery->format('M d, Y');
        }
        
        // Default: 5-7 business days
        return now()->addWeekdays(6)->format('M d, Y');
    }

    public function getTrackingUrl(): ?string
    {
        if (!$this->tracking_number) {
            return null;
        }
        
        // This would integrate with shipping carriers
        return "https://tracking.example.com/{$this->tracking_number}";
    }

    public function getCustomerName(): string
    {
        return $this->user->name ?? 'Guest';
    }

    public function getCustomerEmail(): string
    {
        return $this->user->email ?? 'N/A';
    }

    public function getShippingAddressString(): string
    {
        if (!$this->shipping_address) {
            return 'N/A';
        }
        
        $address = $this->shipping_address;
        return implode(', ', array_filter([
            $address['street'] ?? '',
            $address['city'] ?? '',
            $address['state'] ?? '',
            $address['postal_code'] ?? '',
            $address['country'] ?? ''
        ]));
    }

    public function getBillingAddressString(): string
    {
        if (!$this->billing_address) {
            return 'N/A';
        }
        
        $address = $this->billing_address;
        return implode(', ', array_filter([
            $address['street'] ?? '',
            $address['city'] ?? '',
            $address['state'] ?? '',
            $address['postal_code'] ?? '',
            $address['country'] ?? ''
        ]));
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            if (!$order->order_number) {
                $order->order_number = 'ORD-' . date('Y') . '-' . str_pad(Order::count() + 1, 6, '0', STR_PAD_LEFT);
            }
        });
    }
}
