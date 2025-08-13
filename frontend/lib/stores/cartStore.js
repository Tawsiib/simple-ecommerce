import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../api';
import toast from 'react-hot-toast';

const useCartStore = create(
  persist(
    (set, get) => ({
      // State
      items: [],
      summary: {
        itemsCount: 0,
        subtotal: 0,
        total: 0,
        formattedSubtotal: '৳0.00',
        formattedTotal: '৳0.00'
      },
      isLoading: false,
      error: null,

      // Actions
      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      // Fetch cart from API
      fetchCart: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await apiClient.get('/cart');
          
          if (response.data.success) {
            const { items, summary } = response.data.data;
            
            set({
              items,
              summary,
              isLoading: false,
              error: null
            });
            
            return { success: true, items, summary };
          } else {
            throw new Error(response.data.message || 'Failed to fetch cart');
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch cart';
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
          throw new Error(errorMessage);
        }
      },

      // Add item to cart
      addToCart: async (productId, quantity = 1, options = {}, notes = '') => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await apiClient.post('/cart', {
            product_id: productId,
            quantity,
            selected_options: options,
            notes
          });
          
          if (response.data.success) {
            const newItem = response.data.data;
            
            // Update cart state
            const currentItems = get().items;
            const existingItemIndex = currentItems.findIndex(item => item.product_id === productId);
            
            let updatedItems;
            if (existingItemIndex !== -1) {
              // Update existing item
              updatedItems = [...currentItems];
              updatedItems[existingItemIndex] = newItem;
            } else {
              // Add new item
              updatedItems = [...currentItems, newItem];
            }
            
            // Recalculate summary
            const newSummary = get().calculateSummary(updatedItems);
            
            set({
              items: updatedItems,
              summary: newSummary,
              isLoading: false,
              error: null
            });
            
            toast.success('Product added to cart successfully!');
            return { success: true, item: newItem };
          } else {
            throw new Error(response.data.message || 'Failed to add item to cart');
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to add item to cart';
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }
      },

      // Update cart item
      updateCartItem: async (cartItemId, quantity, options = {}, notes = '') => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await apiClient.put(`/cart/${cartItemId}`, {
            quantity,
            selected_options: options,
            notes
          });
          
          if (response.data.success) {
            const updatedItem = response.data.data;
            
            // Update cart state
            const currentItems = get().items;
            const updatedItems = currentItems.map(item => 
              item.id === cartItemId ? updatedItem : item
            );
            
            // Recalculate summary
            const newSummary = get().calculateSummary(updatedItems);
            
            set({
              items: updatedItems,
              summary: newSummary,
              isLoading: false,
              error: null
            });
            
            toast.success('Cart updated successfully!');
            return { success: true, item: updatedItem };
          } else {
            throw new Error(response.data.message || 'Failed to update cart item');
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to update cart item';
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }
      },

      // Remove item from cart
      removeFromCart: async (cartItemId) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await apiClient.delete(`/cart/${cartItemId}`);
          
          if (response.data.success) {
            // Update cart state
            const currentItems = get().items;
            const updatedItems = currentItems.filter(item => item.id !== cartItemId);
            
            // Recalculate summary
            const newSummary = get().calculateSummary(updatedItems);
            
            set({
              items: updatedItems,
              summary: newSummary,
              isLoading: false,
              error: null
            });
            
            toast.success('Item removed from cart successfully!');
            return { success: true };
          } else {
            throw new Error(response.data.message || 'Failed to remove item from cart');
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to remove item from cart';
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }
      },

      // Clear cart
      clearCart: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await apiClient.delete('/cart');
          
          if (response.data.success) {
            set({
              items: [],
              summary: {
                itemsCount: 0,
                subtotal: 0,
                total: 0,
                formattedSubtotal: '৳0.00',
                formattedTotal: '৳0.00'
              },
              isLoading: false,
              error: null
            });
            
            toast.success('Cart cleared successfully!');
            return { success: true };
          } else {
            throw new Error(response.data.message || 'Failed to clear cart');
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to clear cart';
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }
      },

      // Get cart count
      getCartCount: async () => {
        try {
          const response = await apiClient.get('/cart/count');
          
          if (response.data.success) {
            const { count } = response.data.data;
            return count;
          } else {
            return 0;
          }
        } catch (error) {
          console.error('Failed to get cart count:', error);
          return 0;
        }
      },

      // Calculate summary from items
      calculateSummary: (items) => {
        const itemsCount = items.reduce((total, item) => total + item.quantity, 0);
        const subtotal = items.reduce((total, item) => total + (item.subtotal || 0), 0);
        const total = subtotal; // No tax/shipping for now
        
        return {
          itemsCount,
          subtotal,
          total,
          formattedSubtotal: `৳${subtotal.toFixed(2)}`,
          formattedTotal: `৳${total.toFixed(2)}`
        };
      },

      // Check if product is in cart
      isInCart: (productId) => {
        const { items } = get();
        return items.some(item => item.product_id === productId);
      },

      // Get cart item by product ID
      getCartItem: (productId) => {
        const { items } = get();
        return items.find(item => item.product_id === productId);
      },

      // Get cart item quantity
      getCartItemQuantity: (productId) => {
        const item = get().getCartItem(productId);
        return item ? item.quantity : 0;
      },

      // Initialize cart from storage and sync with API
      initialize: async () => {
        const { items } = get();
        if (items.length > 0) {
          // Try to sync with API
          try {
            await get().fetchCart();
          } catch (error) {
            console.error('Failed to sync cart with API:', error);
            // Keep local cart if API sync fails
          }
        }
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ 
        items: state.items, 
        summary: state.summary 
      }),
    }
  )
);

export default useCartStore;
