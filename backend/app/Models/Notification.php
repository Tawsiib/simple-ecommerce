<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'data',
        'priority',
        'is_read',
        'read_at',
    ];

    protected $casts = [
        'data' => 'array',
        'is_read' => 'boolean',
        'read_at' => 'datetime',
        'priority' => 'integer',
    ];

    /**
     * Get the user that owns the notification.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope a query to only include unread notifications.
     */
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    /**
     * Scope a query to only include read notifications.
     */
    public function scopeRead($query)
    {
        return $query->where('is_read', true);
    }

    /**
     * Scope a query to only include notifications by priority.
     */
    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    /**
     * Scope a query to only include notifications by type.
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Mark the notification as read.
     */
    public function markAsRead(): bool
    {
        return $this->update([
            'is_read' => true,
            'read_at' => now(),
        ]);
    }

    /**
     * Mark the notification as unread.
     */
    public function markAsUnread(): bool
    {
        return $this->update([
            'is_read' => false,
            'read_at' => null,
        ]);
    }

    /**
     * Get the priority label.
     */
    public function getPriorityLabelAttribute(): string
    {
        return match ($this->priority) {
            1 => 'Low',
            2 => 'Normal',
            3 => 'High',
            4 => 'Urgent',
            default => 'Normal',
        };
    }

    /**
     * Get the priority color class.
     */
    public function getPriorityColorAttribute(): string
    {
        return match ($this->priority) {
            1 => 'text-gray-500',
            2 => 'text-blue-500',
            3 => 'text-orange-500',
            4 => 'text-red-500',
            default => 'text-blue-500',
        };
    }

    /**
     * Get the type label.
     */
    public function getTypeLabelAttribute(): string
    {
        return match ($this->type) {
            'order' => 'Order Update',
            'payment' => 'Payment',
            'promotion' => 'Promotion',
            'system' => 'System',
            'product' => 'Product',
            default => ucfirst($this->type),
        };
    }

    /**
     * Get the type icon.
     */
    public function getTypeIconAttribute(): string
    {
        return match ($this->type) {
            'order' => '📦',
            'payment' => '💳',
            'promotion' => '🎉',
            'system' => '⚙️',
            'product' => '🛍️',
            default => '📢',
        };
    }
}
