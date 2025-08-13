import { create } from 'zustand';
import { apiClient } from '../api';
import toast from 'react-hot-toast';

const useReviewStore = create((set, get) => ({
  reviews: [],
  myReviews: [],
  currentProductReviews: [],
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0
  },

  // Actions
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Fetch reviews for a product
  fetchProductReviews: async (productId, page = 1) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.get(`/products/${productId}/reviews?page=${page}`);
      
      if (response.data.success) {
        set({
          currentProductReviews: response.data.data.data || [],
          pagination: {
            currentPage: response.data.data.current_page || 1,
            totalPages: response.data.data.last_page || 1,
            total: response.data.data.total || 0
          }
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch reviews');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch reviews';
      set({ error: message });
      console.error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch user's reviews
  fetchMyReviews: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.get('/me/reviews');
      
      if (response.data.success) {
        set({ myReviews: response.data.data.data || [] });
      } else {
        throw new Error(response.data.message || 'Failed to fetch reviews');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch reviews';
      set({ error: message });
      toast.error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  // Submit a review
  submitReview: async (productId, reviewData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.post(`/products/${productId}/reviews`, reviewData);
      
      if (response.data.success) {
        const newReview = response.data.data;
        set((state) => ({
          currentProductReviews: [newReview, ...state.currentProductReviews],
          myReviews: [newReview, ...state.myReviews]
        }));
        toast.success('Review submitted successfully');
        return newReview;
      } else {
        throw new Error(response.data.message || 'Failed to submit review');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to submit review';
      set({ error: message });
      toast.error(message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Update a review
  updateReview: async (reviewId, reviewData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.put(`/reviews/${reviewId}`, reviewData);
      
      if (response.data.success) {
        const updatedReview = response.data.data;
        set((state) => ({
          currentProductReviews: state.currentProductReviews.map(review =>
            review.id === reviewId ? updatedReview : review
          ),
          myReviews: state.myReviews.map(review =>
            review.id === reviewId ? updatedReview : review
          )
        }));
        toast.success('Review updated successfully');
        return updatedReview;
      } else {
        throw new Error(response.data.message || 'Failed to update review');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update review';
      set({ error: message });
      toast.error(message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Delete a review
  deleteReview: async (reviewId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.delete(`/reviews/${reviewId}`);
      
      if (response.data.success) {
        set((state) => ({
          currentProductReviews: state.currentProductReviews.filter(review => review.id !== reviewId),
          myReviews: state.myReviews.filter(review => review.id !== reviewId)
        }));
        toast.success('Review deleted successfully');
      } else {
        throw new Error(response.data.message || 'Failed to delete review');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete review';
      set({ error: message });
      toast.error(message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Check if user has reviewed a product
  hasReviewedProduct: (productId) => {
    const { myReviews } = get();
    return myReviews.some(review => review.product_id === productId);
  },

  // Get user's review for a product
  getUserReviewForProduct: (productId) => {
    const { myReviews } = get();
    return myReviews.find(review => review.product_id === productId);
  },

  // Clear current product reviews
  clearCurrentProductReviews: () => set({ currentProductReviews: [] })
}));

export default useReviewStore;
