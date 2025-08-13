<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Supplier extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'email',
        'phone',
        'address',
        'contact_person',
        'website',
        'status',
        'notes',
        'payment_terms',
        'credit_limit',
        'lead_time_days',
        'is_preferred',
    ];

    protected $casts = [
        'payment_terms' => 'array',
        'credit_limit' => 'decimal:2',
        'lead_time_days' => 'integer',
        'is_preferred' => 'boolean',
    ];

    protected $appends = [
        'status_badge',
        'total_orders',
        'total_spent',
        'average_order_value',
    ];

    // Relationships
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function purchaseOrders(): HasMany
    {
        return $this->hasMany(PurchaseOrder::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopePreferred($query)
    {
        return $query->where('is_preferred', true);
    }

    // Accessors
    public function getStatusBadgeAttribute(): string
    {
        return match($this->status) {
            'active' => 'bg-green-100 text-green-800',
            'inactive' => 'bg-gray-100 text-gray-800',
            'suspended' => 'bg-red-100 text-red-800',
            default => 'bg-gray-100 text-gray-800',
        };
    }

    public function getTotalOrdersAttribute(): int
    {
        return $this->purchaseOrders()->count();
    }

    public function getTotalSpentAttribute(): float
    {
        return $this->purchaseOrders()->sum('total_amount');
    }

    public function getAverageOrderValueAttribute(): float
    {
        $totalOrders = $this->total_orders;
        return $totalOrders > 0 ? $this->total_spent / $totalOrders : 0;
    }

    // Methods
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function canOrder(): bool
    {
        return $this->isActive() && !$this->isSuspended();
    }

    public function isSuspended(): bool
    {
        return $this->status === 'suspended';
    }

    public function updateStatus(string $status): bool
    {
        $this->status = $status;
        return $this->save();
    }

    public function suspend(): bool
    {
        return $this->updateStatus('suspended');
    }

    public function activate(): bool
    {
        return $this->updateStatus('active');
    }

    public function deactivate(): bool
    {
        return $this->updateStatus('inactive');
    }
}
