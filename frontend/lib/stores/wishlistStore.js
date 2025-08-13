import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../api';
import toast from 'react-hot-toast';

const useWishlistStore = create(
  persist(
    (set, get) => ({
      // State
      items: [],
      count: 0,
      isLoading: false,
      error: null,

      // Actions
      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      // Fetch wishlist from API
      fetchWishlist: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await apiClient.get('/wishlist');
          
          if (response.data.success) {
            const { items, count } = response.data.data;
            
            set({
              items,
              count,
              isLoading: false,
              error: null
            });
            
            return { success: true, items, count };
          } else {
            throw new Error(response.data.message || 'Failed to fetch wishlist');
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch wishlist';
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
          throw new Error(errorMessage);
        }
      },

      // Add item to wishlist
      addToWishlist: async (productId, notes = '') => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await apiClient.post('/wishlist', {
            product_id: productId,
            notes
          });
          
          if (response.data.success) {
            const newItem = response.data.data;
            
            // Update wishlist state
            const currentItems = get().items;
            const updatedItems = [...currentItems, newItem];
            
            set({
              items: updatedItems,
              count: updatedItems.length,
              isLoading: false,
              error: null
            });
            
            toast.success('Product added to wishlist successfully!');
            return { success: true, item: newItem };
          } else {
            throw new Error(response.data.message || 'Failed to add item to wishlist');
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to add item to wishlist';
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }
      },

      // Remove item from wishlist
      removeFromWishlist: async (wishlistItemId) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await apiClient.delete(`/wishlist/${wishlistItemId}`);
          
          if (response.data.success) {
            // Update wishlist state
            const currentItems = get().items;
            const updatedItems = currentItems.filter(item => item.id !== wishlistItemId);
            
            set({
              items: updatedItems,
              count: updatedItems.length,
              isLoading: false,
              error: null
            });
            
            toast.success('Item removed from wishlist successfully!');
            return { success: true };
          } else {
            throw new Error(response.data.message || 'Failed to remove item from wishlist');
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to remove item from wishlist';
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }
      },

      // Clear wishlist
      clearWishlist: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await apiClient.delete('/wishlist');
          
          if (response.data.success) {
            set({
              items: [],
              count: 0,
              isLoading: false,
              error: null
            });
            
            toast.success('Wishlist cleared successfully!');
            return { success: true };
          } else {
            throw new Error(response.data.message || 'Failed to clear wishlist');
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to clear wishlist';
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }
      },

      // Get wishlist count
      getWishlistCount: async () => {
        try {
          const response = await apiClient.get('/wishlist/count');
          
          if (response.data.success) {
            const { count } = response.data.data;
            set({ count });
            return count;
          } else {
            return 0;
          }
        } catch (error) {
          console.error('Failed to get wishlist count:', error);
          return 0;
        }
      },

      // Move item from wishlist to cart
      moveToCart: async (wishlistItemId) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await apiClient.post(`/wishlist/${wishlistItemId}/move-to-cart`);
          
          if (response.data.success) {
            // Remove from wishlist state
            const currentItems = get().items;
            const updatedItems = currentItems.filter(item => item.id !== wishlistItemId);
            
            set({
              items: updatedItems,
              count: updatedItems.length,
              isLoading: false,
              error: null
            });
            
            toast.success('Product moved to cart successfully!');
            return { success: true };
          } else {
            throw new Error(response.data.message || 'Failed to move item to cart');
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to move item to cart';
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }
      },

      // Check if product is in wishlist
      isInWishlist: (productId) => {
        const { items } = get();
        return items.some(item => item.product_id === productId);
      },

      // Get wishlist item by product ID
      getWishlistItem: (productId) => {
        const { items } = get();
        return items.find(item => item.product_id === productId);
      },

      // Initialize wishlist from storage and sync with API
      initialize: async () => {
        const { items } = get();
        if (items.length > 0) {
          // Try to sync with API
          try {
            await get().fetchWishlist();
          } catch (error) {
            console.error('Failed to sync wishlist with API:', error);
            // Keep local wishlist if API sync fails
          }
        }
      },
    }),
    {
      name: 'wishlist-storage',
      partialize: (state) => ({ 
        items: state.items, 
        count: state.count 
      }),
    }
  )
);

export default useWishlistStore;
