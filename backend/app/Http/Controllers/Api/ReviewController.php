<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Product;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    /**
     * Get reviews for a product
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'product_id' => 'required|integer|exists:products,id',
                'rating' => 'nullable|integer|between:1,5',
                'sort_by' => 'nullable|string|in:created_at,rating,helpful_votes',
                'sort_order' => 'nullable|string|in:asc,desc',
                'per_page' => 'nullable|integer|min:1|max:100'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $query = Review::with(['user:id,name'])
                ->where('product_id', $request->product_id)
                ->approved();

            // Filter by rating
            if ($request->has('rating')) {
                $query->where('rating', $request->rating);
            }

            // Apply sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 20);
            $reviews = $query->paginate($perPage);

            // Get review statistics
            $stats = $this->getProductReviewStats($request->product_id);

            return response()->json([
                'success' => true,
                'data' => [
                    'reviews' => $reviews,
                    'statistics' => $stats
                ],
                'message' => 'Reviews retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve reviews',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific review
     */
    public function show(Request $request, $reviewId): JsonResponse
    {
        try {
            $review = Review::with(['user:id,name', 'product:id,name,slug'])
                ->where('id', $reviewId)
                ->approved()
                ->first();

            if (!$review) {
                return response()->json([
                    'success' => false,
                    'message' => 'Review not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $review,
                'message' => 'Review retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve review',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a new review
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'product_id' => 'required|integer|exists:products,id',
                'rating' => 'required|integer|between:1,5',
                'title' => 'nullable|string|max:200',
                'comment' => 'required|string|max:1000',
                'images' => 'nullable|array|max:5',
                'images.*' => 'string',
                'tags' => 'nullable|array',
                'tags.*' => 'string|max:50'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = $request->user();
            $product = Product::find($request->product_id);

            // Check if user has purchased the product
            $hasPurchased = Order::where('user_id', $user->id)
                ->where('status', 'delivered')
                ->whereHas('orderItems', function ($query) use ($request) {
                    $query->where('product_id', $request->product_id);
                })
                ->exists();

            if (!$hasPurchased) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only review products you have purchased'
                ], 403);
            }

            // Check if user has already reviewed this product
            $existingReview = Review::where('user_id', $user->id)
                ->where('product_id', $request->product_id)
                ->first();

            if ($existingReview) {
                return response()->json([
                    'success' => false,
                    'message' => 'You have already reviewed this product'
                ], 400);
            }

            // Create review
            $review = Review::create([
                'user_id' => $user->id,
                'product_id' => $request->product_id,
                'rating' => $request->rating,
                'title' => $request->title,
                'comment' => $request->comment,
                'images' => $request->images ?? [],
                'tags' => $request->tags ?? [],
                'verified_purchase' => true,
                'reviewer_type' => 'verified_buyer',
                'is_verified' => false,
                'is_approved' => false, // Requires admin approval
                'review_date' => now()
            ]);

            $review->load(['user:id,name', 'product:id,name,slug']);

            return response()->json([
                'success' => true,
                'data' => $review,
                'message' => 'Review submitted successfully and pending approval'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit review',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a review
     */
    public function update(Request $request, $reviewId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'rating' => 'sometimes|required|integer|between:1,5',
                'title' => 'nullable|string|max:200',
                'comment' => 'sometimes|required|string|max:1000',
                'images' => 'nullable|array|max:5',
                'images.*' => 'string',
                'tags' => 'nullable|array',
                'tags.*' => 'string|max:50'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = $request->user();
            
            $review = Review::where('id', $reviewId)
                ->where('user_id', $user->id)
                ->first();

            if (!$review) {
                return response()->json([
                    'success' => false,
                    'message' => 'Review not found'
                ], 404);
            }

            // Check if review can still be edited (within 24 hours)
            if (!$review->canEdit()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Review can only be edited within 24 hours of creation'
                ], 400);
            }

            $review->update($request->all());

            // Reset approval status since review was modified
            $review->update([
                'is_approved' => false,
                'is_verified' => false
            ]);

            $review->load(['user:id,name', 'product:id,name,slug']);

            return response()->json([
                'success' => true,
                'data' => $review,
                'message' => 'Review updated successfully and pending re-approval'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update review',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a review
     */
    public function destroy(Request $request, $reviewId): JsonResponse
    {
        try {
            $user = $request->user();
            
            $review = Review::where('id', $reviewId)
                ->where('user_id', $user->id)
                ->first();

            if (!$review) {
                return response()->json([
                    'success' => false,
                    'message' => 'Review not found'
                ], 404);
            }

            if (!$review->canDelete()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Review cannot be deleted'
                ], 400);
            }

            $review->delete();

            return response()->json([
                'success' => true,
                'message' => 'Review deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete review',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark review as helpful
     */
    public function markHelpful(Request $request, $reviewId): JsonResponse
    {
        try {
            $user = $request->user();
            
            $review = Review::where('id', $reviewId)
                ->approved()
                ->first();

            if (!$review) {
                return response()->json([
                    'success' => false,
                    'message' => 'Review not found'
                ], 404);
            }

            // Prevent user from marking their own review as helpful
            if ($review->user_id === $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You cannot mark your own review as helpful'
                ], 400);
            }

            if ($review->markAsHelpful()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Review marked as helpful',
                    'data' => [
                        'helpful_votes' => $review->helpful_votes,
                        'unhelpful_votes' => $review->unhelpful_votes,
                        'helpful_score' => $review->helpful_score
                    ]
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to mark review as helpful'
                ], 500);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark review as helpful',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark review as unhelpful
     */
    public function markUnhelpful(Request $request, $reviewId): JsonResponse
    {
        try {
            $user = $request->user();
            
            $review = Review::where('id', $reviewId)
                ->approved()
                ->first();

            if (!$review) {
                return response()->json([
                    'success' => false,
                    'message' => 'Review not found'
                ], 404);
            }

            // Prevent user from marking their own review as unhelpful
            if ($review->user_id === $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You cannot mark your own review as unhelpful'
                ], 400);
            }

            if ($review->markAsUnhelpful()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Review marked as unhelpful',
                    'data' => [
                        'helpful_votes' => $review->helpful_votes,
                        'unhelpful_votes' => $review->unhelpful_votes,
                        'helpful_score' => $review->helpful_score
                    ]
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to mark review as unhelpful'
                ], 500);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark review as unhelpful',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user's reviews
     */
    public function userReviews(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            $query = Review::with(['product:id,name,slug,featured_image_url'])
                ->where('user_id', $user->id);

            // Apply filters
            if ($request->has('rating')) {
                $query->where('rating', $request->rating);
            }

            if ($request->has('status')) {
                if ($request->status === 'approved') {
                    $query->approved();
                } elseif ($request->status === 'pending') {
                    $query->where('is_approved', false);
                }
            }

            // Apply sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 15);
            $reviews = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $reviews,
                'message' => 'User reviews retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve user reviews',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get review statistics for a product
     */
    protected function getProductReviewStats(int $productId): array
    {
        $totalReviews = Review::where('product_id', $productId)->approved()->count();
        
        if ($totalReviews === 0) {
            return [
                'total_reviews' => 0,
                'average_rating' => 0,
                'rating_distribution' => [
                    5 => 0, 4 => 0, 3 => 0, 2 => 0, 1 => 0
                ],
                'verified_purchases' => 0,
                'recent_reviews' => 0
            ];
        }

        $averageRating = Review::where('product_id', $productId)
            ->approved()
            ->avg('rating');

        $ratingDistribution = Review::where('product_id', $productId)
            ->approved()
            ->selectRaw('rating, COUNT(*) as count')
            ->groupBy('rating')
            ->pluck('count', 'rating')
            ->toArray();

        // Fill in missing ratings with 0
        for ($i = 1; $i <= 5; $i++) {
            if (!isset($ratingDistribution[$i])) {
                $ratingDistribution[$i] = 0;
            }
        }

        $verifiedPurchases = Review::where('product_id', $productId)
            ->approved()
            ->where('verified_purchase', true)
            ->count();

        $recentReviews = Review::where('product_id', $productId)
            ->approved()
            ->where('created_at', '>=', now()->subDays(30))
            ->count();

        return [
            'total_reviews' => $totalReviews,
            'average_rating' => round($averageRating, 1),
            'rating_distribution' => $ratingDistribution,
            'verified_purchases' => $verifiedPurchases,
            'recent_reviews' => $recentReviews
        ];
    }

    /**
     * Get review guidelines
     */
    public function guidelines(): JsonResponse
    {
        try {
            $guidelines = [
                'general' => [
                    'Be honest and authentic in your review',
                    'Share your personal experience with the product',
                    'Focus on the product, not the seller or shipping',
                    'Use appropriate language and be respectful'
                ],
                'what_to_include' => [
                    'Your overall rating (1-5 stars)',
                    'What you liked about the product',
                    'What you didn\'t like about the product',
                    'How the product performed for you',
                    'Whether you would recommend it to others'
                ],
                'what_to_avoid' => [
                    'Personal attacks or offensive language',
                    'Spam or promotional content',
                    'Reviews for products you haven\'t purchased',
                    'Duplicate reviews for the same product',
                    'Reviews that violate our community guidelines'
                ],
                'photo_guidelines' => [
                    'Upload clear, high-quality images',
                    'Show the product in use or detail',
                    'Avoid images with personal information',
                    'Maximum 5 images per review',
                    'Supported formats: JPEG, PNG, WebP'
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $guidelines,
                'message' => 'Review guidelines retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve review guidelines',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin: Get all reviews with admin-specific data
     */
    public function adminIndex(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'page' => 'nullable|integer|min:1',
                'per_page' => 'nullable|integer|min:1|max:100',
                'search' => 'nullable|string|max:255',
                'status' => 'nullable|string|in:approved,pending,rejected',
                'rating' => 'nullable|integer|between:1,5',
                'sort_by' => 'nullable|string|in:created_at,rating,helpful_votes',
                'sort_order' => 'nullable|string|in:asc,desc',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $query = Review::with(['user:id,name,email', 'product:id,name,slug']);

            // Apply search filter
            if ($request->has('search') && $request->search) {
                $searchTerm = $request->search;
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('title', 'like', "%{$searchTerm}%")
                      ->orWhere('comment', 'like', "%{$searchTerm}%")
                      ->orWhereHas('user', function ($userQuery) use ($searchTerm) {
                          $userQuery->where('name', 'like', "%{$searchTerm}%")
                                   ->orWhere('email', 'like', "%{$searchTerm}%");
                      })
                      ->orWhereHas('product', function ($productQuery) use ($searchTerm) {
                          $productQuery->where('name', 'like', "%{$searchTerm}%");
                      });
                });
            }

            // Apply status filter
            if ($request->has('status') && $request->status) {
                if ($request->status === 'approved') {
                    $query->approved();
                } elseif ($request->status === 'pending') {
                    $query->pending();
                } elseif ($request->status === 'rejected') {
                    $query->rejected();
                }
            }

            // Apply rating filter
            if ($request->has('rating')) {
                $query->where('rating', $request->rating);
            }

            // Apply sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 20);
            $reviews = $query->paginate($perPage);

            // Transform reviews for admin
            $reviews->getCollection()->transform(function ($review) {
                return $this->transformAdminReview($review);
            });

            return response()->json([
                'success' => true,
                'data' => $reviews,
                'message' => 'Reviews retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve reviews',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin: Approve a review
     */
    public function approve(int $id): JsonResponse
    {
        try {
            $review = Review::findOrFail($id);
            $review->update(['is_approved' => true]);

            return response()->json([
                'success' => true,
                'data' => $this->transformAdminReview($review->fresh()),
                'message' => 'Review approved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to approve review',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin: Reject a review
     */
    public function reject(int $id): JsonResponse
    {
        try {
            $review = Review::findOrFail($id);
            $review->update(['is_approved' => false]);

            return response()->json([
                'success' => true,
                'data' => $this->transformAdminReview($review->fresh()),
                'message' => 'Review rejected successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject review',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin: Delete a review
     */
    public function adminDestroy(int $id): JsonResponse
    {
        try {
            $review = Review::findOrFail($id);
            $review->delete();

            return response()->json([
                'success' => true,
                'message' => 'Review deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete review',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Transform review data for admin API response
     */
    protected function transformAdminReview($review): array
    {
        return [
            'id' => $review->id,
            'title' => $review->title,
            'comment' => $review->comment,
            'rating' => $review->rating,
            'is_approved' => $review->is_approved,
            'verified_purchase' => $review->verified_purchase,
            'helpful_votes' => $review->helpful_votes,
            'unhelpful_votes' => $review->unhelpful_votes,
            'user' => $review->user ? [
                'id' => $review->user->id,
                'name' => $review->user->name,
                'email' => $review->user->email,
            ] : null,
            'product' => $review->product ? [
                'id' => $review->product->id,
                'name' => $review->product->name,
                'slug' => $review->product->slug,
            ] : null,
            'created_at' => $review->created_at,
            'updated_at' => $review->updated_at,
        ];
    }
}
