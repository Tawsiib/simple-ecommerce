<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class WishlistItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'product_id',
        'added_at',
        'notes',
    ];

    protected $casts = [
        'added_at' => 'datetime',
    ];

    protected $appends = [
        'product_name',
        'product_price',
        'product_image',
        'product_available',
        'days_since_added',
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

    public function getProductAvailableAttribute(): bool
    {
        return $this->product && $this->product->isInStock();
    }

    public function getDaysSinceAddedAttribute(): int
    {
        return $this->added_at ? $this->added_at->diffInDays(now()) : 0;
    }

    // Methods
    public function moveToCart(): bool
    {
        if (!$this->product || !$this->product->isInStock()) {
            return false;
        }

        // Check if item already exists in cart
        $existingCartItem = CartItem::where('user_id', $this->user_id)
            ->where('product_id', $this->product_id)
            ->first();

        if ($existingCartItem) {
            $existingCartItem->increaseQuantity(1);
        } else {
            CartItem::create([
                'user_id' => $this->user_id,
                'product_id' => $this->product_id,
                'quantity' => 1,
                'added_at' => now(),
            ]);
        }

        return $this->delete();
    }

    public function isProductAvailable(): bool
    {
        return $this->product && $this->product->isInStock();
    }

    public function getProductStatus(): string
    {
        if (!$this->product) {
            return 'unavailable';
        }

        if (!$this->product->isInStock()) {
            return 'out_of_stock';
        }

        if ($this->product->isLowStock()) {
            return 'low_stock';
        }

        return 'available';
    }

    public function getProductStatusMessage(): string
    {
        return match($this->getProductStatus()) {
            'unavailable' => 'Product no longer available',
            'out_of_stock' => 'Product is out of stock',
            'low_stock' => 'Low stock - only a few items left',
            'available' => 'Product is available',
            default => 'Unknown status'
        };
    }
}
