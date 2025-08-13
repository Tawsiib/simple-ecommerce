<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'product_id',
        'rating',
        'title',
        'comment',
        'is_verified',
        'is_approved',
        'helpful_votes',
        'unhelpful_votes',
        'review_date',
        'verified_purchase',
        'reviewer_type',
        'images',
        'tags',
    ];

    protected $casts = [
        'rating' => 'integer',
        'is_verified' => 'boolean',
        'is_approved' => 'boolean',
        'helpful_votes' => 'integer',
        'unhelpful_votes' => 'integer',
        'review_date' => 'datetime',
        'verified_purchase' => 'boolean',
        'images' => 'array',
        'tags' => 'array',
    ];

    protected $appends = [
        'formatted_rating',
        'rating_stars',
        'helpful_score',
        'is_helpful',
        'reviewer_name',
        'days_ago',
        'formatted_date',
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

    // Scopes
    public function scopeApproved($query)
    {
        return $query->where('is_approved', true);
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    public function scopeByRating($query, $rating)
    {
        return $query->where('rating', $rating);
    }

    public function scopeByProduct($query, $productId)
    {
        return $query->where('product_id', $productId);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeRecent($query, $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    public function scopeHelpful($query)
    {
        return $query->orderBy('helpful_votes', 'desc');
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    // Accessors
    public function getFormattedRatingAttribute(): string
    {
        return $this->rating . '/5';
    }

    public function getRatingStarsAttribute(): string
    {
        $stars = '';
        for ($i = 1; $i <= 5; $i++) {
            if ($i <= $this->rating) {
                $stars .= '★';
            } else {
                $stars .= '☆';
            }
        }
        return $stars;
    }

    public function getHelpfulScoreAttribute(): int
    {
        return $this->helpful_votes - $this->unhelpful_votes;
    }

    public function getIsHelpfulAttribute(): bool
    {
        return $this->helpful_score > 0;
    }

    public function getReviewerNameAttribute(): string
    {
        if ($this->user) {
            return $this->user->name;
        }
        return 'Anonymous';
    }

    public function getDaysAgoAttribute(): int
    {
        return $this->created_at ? $this->created_at->diffInDays(now()) : 0;
    }

    public function getFormattedDateAttribute(): string
    {
        if ($this->days_ago === 0) {
            return 'Today';
        } elseif ($this->days_ago === 1) {
            return 'Yesterday';
        } elseif ($this->days_ago < 7) {
            return $this->days_ago . ' days ago';
        } else {
            return $this->created_at->format('M d, Y');
        }
    }

    // Methods
    public function markAsHelpful(): bool
    {
        $this->helpful_votes++;
        return $this->save();
    }

    public function markAsUnhelpful(): bool
    {
        $this->unhelpful_votes++;
        return $this->save();
    }

    public function approve(): bool
    {
        $this->is_approved = true;
        return $this->save();
    }

    public function reject(): bool
    {
        $this->is_approved = false;
        return $this->save();
    }

    public function verify(): bool
    {
        $this->is_verified = true;
        return $this->save();
    }

    public function isVerifiedPurchase(): bool
    {
        return $this->verified_purchase;
    }

    public function isAnonymous(): bool
    {
        return !$this->user_id;
    }

    public function canEdit(): bool
    {
        // Users can edit their own reviews within 24 hours
        if (!$this->user_id) {
            return false;
        }
        
        return $this->created_at->diffInHours(now()) < 24;
    }

    public function canDelete(): bool
    {
        // Users can delete their own reviews
        if (!$this->user_id) {
            return false;
        }
        
        return true;
    }

    public function getRatingLabel(): string
    {
        return match($this->rating) {
            1 => 'Poor',
            2 => 'Fair',
            3 => 'Good',
            4 => 'Very Good',
            5 => 'Excellent',
            default => 'Unknown'
        };
    }

    public function getSentiment(): string
    {
        if ($this->rating >= 4) {
            return 'positive';
        } elseif ($this->rating >= 3) {
            return 'neutral';
        } else {
            return 'negative';
        }
    }

    public function hasImages(): bool
    {
        return !empty($this->images);
    }

    public function getImageUrls(): array
    {
        if (!$this->hasImages()) {
            return [];
        }

        return array_map(function ($image) {
            return asset('storage/' . $image);
        }, $this->images);
    }

    public function getTagsList(): array
    {
        return $this->tags ?? [];
    }

    public function addTag(string $tag): bool
    {
        $tags = $this->tags ?? [];
        if (!in_array($tag, $tags)) {
            $tags[] = $tag;
            $this->tags = $tags;
            return $this->save();
        }
        return true;
    }

    public function removeTag(string $tag): bool
    {
        $tags = $this->tags ?? [];
        $tags = array_filter($tags, function ($t) use ($tag) {
            return $t !== $tag;
        });
        $this->tags = array_values($tags);
        return $this->save();
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($review) {
            if (!$review->review_date) {
                $review->review_date = now();
            }
        });
    }
}
