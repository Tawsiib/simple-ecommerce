<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Brand extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'short_description',
        'is_active',
        'is_featured',
        'sort_order',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'website_url',
        'email',
        'phone',
        'address',
        'country',
        'founded_year',
        'company_size',
        'industry',
        'color',
        'banner_text',
        'display_type',
        'product_count',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'sort_order' => 'integer',
        'founded_year' => 'integer',
        'company_size' => 'integer',
        'product_count' => 'integer',
    ];

    protected $appends = [
        'logo_url',
        'banner_url',
        'products_count',
        'formatted_founded_year',
        'formatted_company_size',
    ];

    // Relationships
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
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

    public function scopeAlphabetical($query)
    {
        return $query->orderBy('name', 'asc');
    }

    public function scopeByCountry($query, $country)
    {
        return $query->where('country', $country);
    }

    public function scopeByIndustry($query, $industry)
    {
        return $query->where('industry', $industry);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%")
              ->orWhere('country', 'like', "%{$search}%")
              ->orWhere('industry', 'like', "%{$search}%");
        });
    }

    // Accessors
    public function getLogoUrlAttribute(): string
    {
        $media = $this->getFirstMedia('logo');
        return $media ? $media->getUrl() : asset('images/default-brand-logo.png');
    }

    public function getBannerUrlAttribute(): string
    {
        $media = $this->getFirstMedia('banner');
        return $media ? $media->getUrl() : asset('images/default-brand-banner.jpg');
    }

    public function getProductsCountAttribute(): int
    {
        return $this->products()->count();
    }

    public function getFormattedFoundedYearAttribute(): string
    {
        return $this->founded_year ? $this->founded_year : 'N/A';
    }

    public function getFormattedCompanySizeAttribute(): string
    {
        if (!$this->company_size) {
            return 'N/A';
        }

        if ($this->company_size < 50) {
            return '1-49 employees';
        } elseif ($this->company_size < 200) {
            return '50-199 employees';
        } elseif ($this->company_size < 1000) {
            return '200-999 employees';
        } else {
            return '1000+ employees';
        }
    }

    // Mutators
    public function setSlugAttribute($value)
    {
        $this->attributes['slug'] = $value ?: Str::slug($this->name);
    }

    // Methods
    public function getActiveProducts()
    {
        return $this->products()->active()->get();
    }

    public function getFeaturedProducts()
    {
        return $this->products()->active()->featured()->get();
    }

    public function getProductsByCategory($categoryId)
    {
        return $this->products()->active()->where('category_id', $categoryId)->get();
    }

    public function getTotalRevenue($period = 'month')
    {
        $startDate = now()->subMonth();
        
        if ($period === 'week') {
            $startDate = now()->subWeek();
        } elseif ($period === 'quarter') {
            $startDate = now()->subQuarter();
        } elseif ($period === 'year') {
            $startDate = now()->subYear();
        }

        return $this->products()
            ->join('order_items', 'products.id', '=', 'order_items.product_id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', 'completed')
            ->where('orders.created_at', '>=', $startDate)
            ->sum('order_items.total_price');
    }

    public function getTopSellingProducts($limit = 10)
    {
        return $this->products()
            ->join('order_items', 'products.id', '=', 'order_items.product_id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', 'completed')
            ->selectRaw('products.*, SUM(order_items.quantity) as total_sold')
            ->groupBy('products.id')
            ->orderByDesc('total_sold')
            ->limit($limit)
            ->get();
    }

    public function getAverageRating()
    {
        return $this->products()
            ->join('reviews', 'products.id', '=', 'reviews.product_id')
            ->avg('reviews.rating') ?? 0;
    }

    public function getTotalReviews()
    {
        return $this->products()
            ->join('reviews', 'products.id', '=', 'reviews.product_id')
            ->count();
    }

    public function isPopular(): bool
    {
        return $this->products()->count() >= 10;
    }

    public function hasWebsite(): bool
    {
        return !empty($this->website_url);
    }

    public function getContactInfo(): array
    {
        return [
            'email' => $this->email,
            'phone' => $this->phone,
            'website' => $this->website_url,
            'address' => $this->address,
            'country' => $this->country,
        ];
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('logo')
             ->singleFile()
             ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);

        $this->addMediaCollection('banner')
             ->singleFile()
             ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);
    }
}
