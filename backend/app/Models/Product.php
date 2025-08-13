<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Product extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'short_description',
        'price',
        'compare_price',
        'cost_price',
        'sku',
        'barcode',
        'stock',
        'stock_quantity',
        'min_stock',
        'reorder_point',
        'reorder_quantity',
        'supplier_id',
        'weight',
        'dimensions',
        'expiry_date',
        'shelf_life_days',
        'stock_status',
        'auto_reorder_enabled',
        'inventory_settings',
        'is_active',
        'is_featured',
        'is_bestseller',
        'views',
        'category_id',
        'brand_id',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'tags',
        'specifications',
        'ingredients',
        'usage_instructions',
        'warnings',
        'manufacturing_date',
        'country_of_origin',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'compare_price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'stock' => 'integer',
        'stock_quantity' => 'integer',
        'min_stock' => 'integer',
        'reorder_point' => 'integer',
        'reorder_quantity' => 'integer',
        'weight' => 'decimal:2',
        'dimensions' => 'array',
        'expiry_date' => 'date',
        'shelf_life_days' => 'integer',
        'stock_status' => 'string',
        'auto_reorder_enabled' => 'boolean',
        'inventory_settings' => 'array',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'is_bestseller' => 'boolean',
        'tags' => 'array',
        'specifications' => 'array',
        'ingredients' => 'array',
        'manufacturing_date' => 'date',
    ];

    protected $appends = [
        'featured_image_url',
        'gallery_urls',
        'any_image_url',
        'stock_status',
        'discount_percentage',
        'formatted_price',
        'formatted_compare_price',
    ];

    // Relationships
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function wishlistItems(): HasMany
    {
        return $this->hasMany(WishlistItem::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeBestseller($query)
    {
        return $query->where('is_bestseller', true);
    }

    public function scopeInStock($query)
    {
        return $query->where('stock', '>', 0);
    }

    public function scopeLowStock($query)
    {
        return $query->where('stock', '<=', 'min_stock');
    }

    public function scopeOutOfStock($query)
    {
        return $query->where('stock', 0);
    }

    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    public function scopeByBrand($query, $brandId)
    {
        return $query->where('brand_id', $brandId);
    }

    public function scopeByPriceRange($query, $min, $max)
    {
        return $query->whereBetween('price', [$min, $max]);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%")
              ->orWhere('sku', 'like', "%{$search}%")
              ->orWhere('tags', 'like', "%{$search}%");
        });
    }

    // Accessors
    public function getFeaturedImageUrlAttribute(): string
    {
        $media = $this->getFirstMedia('featured');
        return $media ? $media->getUrl() : asset('images/default-product.svg');
    }

    public function getGalleryUrlsAttribute(): array
    {
        $media = $this->getMedia('gallery');
        if ($media->isEmpty()) {
            return [asset('images/default-product.svg')];
        }
        return $media->map(function ($media) {
            return $media->getUrl();
        })->toArray();
    }

    public function getAnyImageUrlAttribute(): string
    {
        // Try featured image first
        $featured = $this->getFirstMedia('featured');
        if ($featured) {
            return $featured->getUrl();
        }
        
        // Try gallery images
        $gallery = $this->getFirstMedia('gallery');
        if ($gallery) {
            return $gallery->getUrl();
        }
        
        // Fallback to default
        return asset('images/default-product.svg');
    }

    public function getStockStatusAttribute(): string
    {
        if ($this->stock <= 0) {
            return 'out_of_stock';
        } elseif ($this->stock <= $this->min_stock) {
            return 'low_stock';
        } else {
            return 'in_stock';
        }
    }

    public function getDiscountPercentageAttribute(): float
    {
        if ($this->compare_price && $this->compare_price > $this->price) {
            return round((($this->compare_price - $this->price) / $this->compare_price) * 100, 2);
        }
        return 0;
    }

    public function getFormattedPriceAttribute(): string
    {
        return '৳' . number_format($this->price, 2);
    }

    public function getFormattedComparePriceAttribute(): string
    {
        return $this->compare_price ? '৳' . number_format($this->compare_price, 2) : '';
    }

    // Mutators
    public function setSlugAttribute($value)
    {
        $this->attributes['slug'] = $value ?: Str::slug($this->name);
    }

    // Methods
    public function isInStock(): bool
    {
        return $this->stock > 0;
    }

    public function isLowStock(): bool
    {
        return $this->stock <= $this->min_stock;
    }

    public function hasDiscount(): bool
    {
        return $this->compare_price && $this->compare_price > $this->price;
    }

    public function getAverageRating(): float
    {
        return $this->reviews()->avg('rating') ?? 0;
    }

    public function getReviewsCount(): int
    {
        return $this->reviews()->count();
    }

    public function getTotalSold(): int
    {
        return $this->orderItems()->sum('quantity');
    }

    public function updateStock(int $quantity, string $operation = 'decrease'): bool
    {
        if ($operation === 'decrease') {
            if ($this->stock < $quantity) {
                return false;
            }
            $this->stock -= $quantity;
        } else {
            $this->stock += $quantity;
        }
        
        return $this->save();
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('featured')
             ->singleFile();

        $this->addMediaCollection('gallery')
             ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);
    }
}
