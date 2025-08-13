<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Category extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'short_description',
        'parent_id',
        'is_active',
        'is_featured',
        'sort_order',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'icon',
        'color',
        'banner_text',
        'display_type',
        'product_count',
        'level',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'sort_order' => 'integer',
        'parent_id' => 'integer',
        'product_count' => 'integer',
        'level' => 'integer',
    ];

    protected $appends = [
        'image_url',
        'banner_url',
        'full_path',
        'children_count',
        'products_count',
        'is_parent',
        'is_child',
    ];

    // Relationships
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    public function allChildren(): HasMany
    {
        return $this->children()->with('allChildren');
    }

    public function allProducts(): HasMany
    {
        return $this->products()->with('allProducts');
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

    public function scopeParents($query)
    {
        return $query->whereNull('parent_id');
    }

    public function scopeChildren($query)
    {
        return $query->whereNotNull('parent_id');
    }

    public function scopeByLevel($query, $level)
    {
        return $query->where('level', $level);
    }

    public function scopeByParent($query, $parentId)
    {
        return $query->where('parent_id', $parentId);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%");
        });
    }

    // Accessors
    public function getImageUrlAttribute(): string
    {
        $media = $this->getFirstMedia('image');
        return $media ? $media->getUrl() : asset('images/default-category.jpg');
    }

    public function getBannerUrlAttribute(): string
    {
        $media = $this->getFirstMedia('banner');
        return $media ? $media->getUrl() : asset('images/default-banner.jpg');
    }

    public function getFullPathAttribute(): string
    {
        $path = [$this->name];
        $parent = $this->parent;

        while ($parent) {
            array_unshift($path, $parent->name);
            $parent = $parent->parent;
        }

        return implode(' > ', $path);
    }

    public function getChildrenCountAttribute(): int
    {
        return $this->children()->count();
    }

    public function getProductsCountAttribute(): int
    {
        return $this->products()->count();
    }

    public function getIsParentAttribute(): bool
    {
        return is_null($this->parent_id);
    }

    public function getIsChildAttribute(): bool
    {
        return !is_null($this->parent_id);
    }

    // Mutators
    public function setSlugAttribute($value)
    {
        $this->attributes['slug'] = $value ?: Str::slug($this->name);
    }

    public function setParentIdAttribute($value)
    {
        $this->attributes['parent_id'] = $value;
        $this->updateLevel();
    }

    // Methods
    public function updateLevel(): void
    {
        if ($this->parent_id) {
            $parent = Category::find($this->parent_id);
            $this->level = $parent ? $parent->level + 1 : 1;
        } else {
            $this->level = 0;
        }
    }

    public function getBreadcrumbs(): array
    {
        $breadcrumbs = [];
        $category = $this;

        while ($category) {
            array_unshift($breadcrumbs, [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'url' => "/categories/{$category->slug}"
            ]);
            $category = $category->parent;
        }

        return $breadcrumbs;
    }

    public function getAllSubcategories(): array
    {
        $subcategories = [];
        
        foreach ($this->children as $child) {
            $subcategories[] = $child;
            $subcategories = array_merge($subcategories, $child->getAllSubcategories());
        }
        
        return $subcategories;
    }

    public function getAllProducts(): array
    {
        $products = $this->products->toArray();
        
        foreach ($this->children as $child) {
            $products = array_merge($products, $child->getAllProducts());
        }
        
        return $products;
    }

    public function getTotalProductsCount(): int
    {
        $count = $this->products()->count();
        
        foreach ($this->children as $child) {
            $count += $child->getTotalProductsCount();
        }
        
        return $count;
    }

    public function isDescendantOf(Category $category): bool
    {
        $parent = $this->parent;
        
        while ($parent) {
            if ($parent->id === $category->id) {
                return true;
            }
            $parent = $parent->parent;
        }
        
        return false;
    }

    public function isAncestorOf(Category $category): bool
    {
        return $category->isDescendantOf($this);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('image')
             ->singleFile()
             ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);

        $this->addMediaCollection('banner')
             ->singleFile()
             ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($category) {
            $category->updateLevel();
        });

        static::updating(function ($category) {
            $category->updateLevel();
        });
    }
}
