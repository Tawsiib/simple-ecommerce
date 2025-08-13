"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { XMarkIcon } from '@heroicons/react/24/outline';
import useReviewStore from '../../lib/stores/reviewStore';
import LoadingSpinner from '../ui/LoadingSpinner';

const ReviewForm = ({ productId, review, onClose }) => {
  const [rating, setRating] = useState(review?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { submitReview, updateReview } = useReviewStore();
  const isEditing = !!review;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm({
    defaultValues: {
      title: review?.title || '',
      comment: review?.comment || ''
    }
  });

  const onSubmit = async (data) => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      const reviewData = {
        ...data,
        rating
      };

      if (isEditing) {
        await updateReview(review.id, reviewData);
      } else {
        await submitReview(productId, reviewData);
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStar = (index) => {
    const filled = index <= (hoveredRating || rating);
    
    return (
      <button
        key={index}
        type="button"
        onClick={() => setRating(index)}
        onMouseEnter={() => setHoveredRating(index)}
        onMouseLeave={() => setHoveredRating(0)}
        className="p-1 transition-transform hover:scale-110"
      >
        {filled ? (
          <StarSolidIcon className="h-8 w-8 text-yellow-400" />
        ) : (
          <StarIcon className="h-8 w-8 text-gray-300" />
        )}
      </button>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {isEditing ? 'Edit Your Review' : 'Write a Review'}
        </h3>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating *
          </label>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((i) => renderStar(i))}
            <span className="ml-3 text-sm text-gray-600">
              {rating > 0 ? `${rating} out of 5` : 'Select a rating'}
            </span>
          </div>
          {rating === 0 && (
            <p className="text-red-500 text-sm mt-1">Rating is required</p>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Review Title (optional)
          </label>
          <input
            type="text"
            {...register('title', {
              maxLength: {
                value: 100,
                message: 'Title must be less than 100 characters'
              }
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            placeholder="Summarize your experience"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Review (optional)
          </label>
          <textarea
            {...register('comment', {
              maxLength: {
                value: 2000,
                message: 'Review must be less than 2000 characters'
              }
            })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            placeholder="Tell us about your experience with this product"
          />
          {errors.comment && (
            <p className="text-red-500 text-sm mt-1">{errors.comment.message}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            {watch('comment')?.length || 0} / 2000 characters
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <LoadingSpinner size="sm" className="mr-2" />
                {isEditing ? 'Updating...' : 'Submitting...'}
              </div>
            ) : (
              isEditing ? 'Update Review' : 'Submit Review'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
