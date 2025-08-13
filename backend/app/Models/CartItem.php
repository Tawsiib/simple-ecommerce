<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CartItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'product_id',
        'quantity',
        'options',
        'added_at',
        'updated_at',
    ];

    protected $casts = [
        'options' => 'array',
        'added_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = [
        'total_price',
        'formatted_total_price',
        'product_name',
        'product_price',
        'product_image',
        'is_available',
        'stock_status',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    // Accessors
    public function getTotalPriceAttribute(): float
    {
        if (!$this->product) {
            return 0;
        }
        return $this->product->price * $this->quantity;
    }

    public function getFormattedTotalPriceAttribute(): string
    {
        return '৳' . number_format($this->total_price, 2);
    }

    public function getProductNameAttribute(): string
    {
        return $this->product->name ?? 'Product Not Found';
    }

    public function getProductPriceAttribute(): float
    {
        return $this->product->price ?? 0;
    }

    public function getProductImageAttribute(): string
    {
        return $this->product->featured_image_url ?? asset('images/default-product.jpg');
    }

    public function getIsAvailableAttribute(): bool
    {
        if (!$this->product) {
            return false;
        }
        return $this->product->isInStock() && $this->quantity <= $this->product->stock;
    }

    public function getStockStatusAttribute(): string
    {
        if (!$this->product) {
            return 'unavailable';
        }
        
        if ($this->quantity > $this->product->stock) {
            return 'insufficient_stock';
        }
        
        return $this->product->stock_status;
    }

    // Methods
    public function updateQuantity(int $quantity): bool
    {
        if ($quantity <= 0) {
            return $this->delete();
        }

        if (!$this->product || $quantity > $this->product->stock) {
            return false;
        }

        $this->quantity = $quantity;
        $this->updated_at = now();
        return $this->save();
    }

    public function increaseQuantity(int $amount = 1): bool
    {
        $newQuantity = $this->quantity + $amount;
        return $this->updateQuantity($newQuantity);
    }

    public function decreaseQuantity(int $amount = 1): bool
    {
        $newQuantity = $this->quantity - $amount;
        return $this->updateQuantity($newQuantity);
    }

    public function canIncreaseQuantity(int $amount = 1): bool
    {
        if (!$this->product) {
            return false;
        }
        return ($this->quantity + $amount) <= $this->product->stock;
    }

    public function canDecreaseQuantity(int $amount = 1): bool
    {
        return ($this->quantity - $amount) > 0;
    }

    public function getMaxQuantity(): int
    {
        if (!$this->product) {
            return 0;
        }
        return $this->product->stock;
    }

    public function isOutOfStock(): bool
    {
        if (!$this->product) {
            return true;
        }
        return $this->product->stock <= 0;
    }

    public function hasInsufficientStock(): bool
    {
        if (!$this->product) {
            return true;
        }
        return $this->quantity > $this->product->stock;
    }

    public function getStockWarning(): ?string
    {
        if ($this->isOutOfStock()) {
            return 'This product is out of stock';
        }
        
        if ($this->hasInsufficientStock()) {
            return "Only {$this->product->stock} items available";
        }
        
        if ($this->product->isLowStock()) {
            return 'Low stock - only a few items left';
        }
        
        return null;
    }
}
