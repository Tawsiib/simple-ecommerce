<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'quantity',
        'unit_price',
        'total_price',
        'options',
        'product_name',
        'product_sku',
        'product_image',
        'discount_amount',
        'tax_amount',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
        'options' => 'array',
        'discount_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
    ];

    protected $appends = [
        'formatted_unit_price',
        'formatted_total_price',
        'formatted_discount',
        'formatted_tax',
    ];

    // Relationships
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    // Accessors
    public function getFormattedUnitPriceAttribute(): string
    {
        return '৳' . number_format($this->unit_price, 2);
    }

    public function getFormattedTotalPriceAttribute(): string
    {
        return '৳' . number_format($this->total_price, 2);
    }

    public function getFormattedDiscountAttribute(): string
    {
        return '৳' . number_format($this->discount_amount, 2);
    }

    public function getFormattedTaxAttribute(): string
    {
        return '৳' . number_format($this->tax_amount, 2);
    }

    // Methods
    public function calculateTotal(): void
    {
        $this->total_price = ($this->unit_price * $this->quantity) - $this->discount_amount + $this->tax_amount;
        $this->save();
    }

    public function getProductName(): string
    {
        return $this->product_name ?? $this->product->name ?? 'Product Not Found';
    }

    public function getProductSku(): string
    {
        return $this->product_sku ?? $this->product->sku ?? 'N/A';
    }

    public function getProductImage(): string
    {
        return $this->product_image ?? $this->product->featured_image_url ?? asset('images/default-product.jpg');
    }
}
