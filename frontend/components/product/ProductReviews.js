import { useState, useEffect } from 'react';
import { StarIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import useReviewStore from '../../lib/stores/reviewStore';
import useAuthStore from '../../lib/stores/authStore';
import ReviewForm from './ReviewForm';
import LoadingSpinner from '../ui/LoadingSpinner';

const ProductReviews = ({ productId }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  
  const { isAuthenticated, user } = useAuthStore();
  const {
    currentProductReviews,
    pagination,
    isLoading,
    fetchProductReviews,
    deleteReview,
    hasReviewedProduct
  } = useReviewStore();

  useEffect(() => {
    fetchProductReviews(productId);
  }, [productId, fetchProductReviews]);

  const handlePageChange = (page) => {
    fetchProductReviews(productId, page);
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteReview(reviewId);
        fetchProductReviews(productId, pagination.currentPage);
      } catch (error) {
        console.error('Failed to delete review:', error);
      }
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleFormClose = () => {
    setShowReviewForm(false);
    setEditingReview(null);
    fetchProductReviews(productId, pagination.currentPage);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      i < rating ? (
        <StarSolidIcon key={i} className="h-5 w-5 text-yellow-400" />
      ) : (
        <StarIcon key={i} className="h-5 w-5 text-gray-300" />
      )
    ));
  };

  const userHasReviewed = hasReviewedProduct(productId);

  if (isLoading && currentProductReviews.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Review Summary */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Customer Reviews</h3>
          {isAuthenticated && !userHasReviewed && !showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
            >
              Write a Review
            </button>
          )}
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <div className="mb-8">
            <ReviewForm
              productId={productId}
              review={editingReview}
              onClose={handleFormClose}
            />
          </div>
        )}
      </div>

      {/* Reviews List */}
      {currentProductReviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">No reviews yet. Be the first to review this product!</p>
          {isAuthenticated && !showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
            >
              Write a Review
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {currentProductReviews.map((review) => (
              <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center mb-2">
                      <div className="flex items-center mr-4">
                        {renderStars(review.rating)}
                      </div>
                      {review.title && (
                        <h4 className="font-semibold text-gray-900">{review.title}</h4>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">{review.user?.name}</span>
                      <span className="mx-2">•</span>
                      <span>{formatDate(review.created_at)}</span>
                      {review.is_verified_purchase && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="text-green-600">Verified Purchase</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions for own review */}
                  {user?.id === review.user_id && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditReview(review)}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                        title="Edit review"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        title="Delete review"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {review.comment && (
                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex space-x-2" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      pagination.currentPage === i + 1
                        ? 'bg-rose-600 text-white'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductReviews;
