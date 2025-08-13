<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Address extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'first_name',
        'last_name',
        'company',
        'address_line_1',
        'address_line_2',
        'city',
        'state',
        'postal_code',
        'country',
        'phone',
        'email',
        'is_default',
        'is_billing',
        'is_shipping',
        'notes',
        'latitude',
        'longitude',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'is_billing' => 'boolean',
        'is_shipping' => 'boolean',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    protected $appends = [
        'full_name',
        'full_address',
        'formatted_address',
        'address_type_label',
        'is_complete',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    public function scopeBilling($query)
    {
        return $query->where('is_billing', true);
    }

    public function scopeShipping($query)
    {
        return $query->where('is_shipping', true);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeComplete($query)
    {
        return $query->whereNotNull('address_line_1')
                    ->whereNotNull('city')
                    ->whereNotNull('state')
                    ->whereNotNull('postal_code')
                    ->whereNotNull('country');
    }

    // Accessors
    public function getFullNameAttribute(): string
    {
        $name = trim($this->first_name . ' ' . $this->last_name);
        return $name ?: 'N/A';
    }

    public function getFullAddressAttribute(): string
    {
        $parts = array_filter([
            $this->address_line_1,
            $this->address_line_2,
            $this->city,
            $this->state,
            $this->postal_code,
            $this->country
        ]);

        return implode(', ', $parts);
    }

    public function getFormattedAddressAttribute(): string
    {
        $address = [];
        
        if ($this->company) {
            $address[] = $this->company;
        }
        
        $address[] = $this->full_name;
        $address[] = $this->address_line_1;
        
        if ($this->address_line_2) {
            $address[] = $this->address_line_2;
        }
        
        $address[] = $this->city . ', ' . $this->state . ' ' . $this->postal_code;
        $address[] = $this->country;
        
        if ($this->phone) {
            $address[] = 'Phone: ' . $this->phone;
        }
        
        if ($this->email) {
            $address[] = 'Email: ' . $this->email;
        }
        
        return implode("\n", $address);
    }

    public function getAddressTypeLabelAttribute(): string
    {
        return match($this->type) {
            'home' => 'Home',
            'work' => 'Work',
            'billing' => 'Billing',
            'shipping' => 'Shipping',
            'other' => 'Other',
            default => ucfirst($this->type)
        };
    }

    public function getIsCompleteAttribute(): bool
    {
        return !empty($this->address_line_1) &&
               !empty($this->city) &&
               !empty($this->state) &&
               !empty($this->postal_code) &&
               !empty($this->country);
    }

    // Methods
    public function setAsDefault(): bool
    {
        // Remove default from other addresses of the same user and type
        Address::where('user_id', $this->user_id)
               ->where('type', $this->type)
               ->where('id', '!=', $this->id)
               ->update(['is_default' => false]);
        
        $this->is_default = true;
        return $this->save();
    }

    public function setAsBilling(): bool
    {
        // Remove billing from other addresses of the same user
        Address::where('user_id', $this->user_id)
               ->where('id', '!=', $this->id)
               ->update(['is_billing' => false]);
        
        $this->is_billing = true;
        return $this->save();
    }

    public function setAsShipping(): bool
    {
        // Remove shipping from other addresses of the same user
        Address::where('user_id', $this->user_id)
               ->where('id', '!=', $this->id)
               ->update(['is_shipping' => false]);
        
        $this->is_shipping = true;
        return $this->save();
    }

    public function isDefault(): bool
    {
        return $this->is_default;
    }

    public function isBilling(): bool
    {
        return $this->is_billing;
    }

    public function isShipping(): bool
    {
        return $this->is_shipping;
    }

    public function getCoordinates(): array
    {
        if ($this->latitude && $this->longitude) {
            return [
                'lat' => (float) $this->latitude,
                'lng' => (float) $this->longitude
            ];
        }
        return [];
    }

    public function hasCoordinates(): bool
    {
        return !empty($this->getCoordinates());
    }

    public function getDistanceFrom($lat, $lng): ?float
    {
        if (!$this->hasCoordinates()) {
            return null;
        }
        
        $coords = $this->getCoordinates();
        return $this->calculateDistance($coords['lat'], $coords['lng'], $lat, $lng);
    }

    protected function calculateDistance($lat1, $lng1, $lat2, $lng2): float
    {
        $earthRadius = 6371; // Earth's radius in kilometers
        
        $latDelta = deg2rad($lat2 - $lat1);
        $lngDelta = deg2rad($lng2 - $lng1);
        
        $a = sin($latDelta / 2) * sin($latDelta / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($lngDelta / 2) * sin($lngDelta / 2);
        
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        
        return $earthRadius * $c;
    }

    public function validateAddress(): array
    {
        $errors = [];
        
        if (empty($this->first_name)) {
            $errors[] = 'First name is required';
        }
        
        if (empty($this->last_name)) {
            $errors[] = 'Last name is required';
        }
        
        if (empty($this->address_line_1)) {
            $errors[] = 'Address line 1 is required';
        }
        
        if (empty($this->city)) {
            $errors[] = 'City is required';
        }
        
        if (empty($this->state)) {
            $errors[] = 'State/Province is required';
        }
        
        if (empty($this->postal_code)) {
            $errors[] = 'Postal code is required';
        }
        
        if (empty($this->country)) {
            $errors[] = 'Country is required';
        }
        
        if (empty($this->phone) && empty($this->email)) {
            $errors[] = 'Phone or email is required';
        }
        
        return $errors;
    }

    public function isComplete(): bool
    {
        return empty($this->validateAddress());
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($address) {
            if ($address->is_default) {
                // Ensure only one default address per user and type
                Address::where('user_id', $address->user_id)
                       ->where('type', $address->type)
                       ->update(['is_default' => false]);
            }
        });

        static::updating(function ($address) {
            if ($address->is_default) {
                // Ensure only one default address per user and type
                Address::where('user_id', $address->user_id)
                       ->where('type', $address->type)
                       ->where('id', '!=', $address->id)
                       ->update(['is_default' => false]);
            }
        });
    }
}
