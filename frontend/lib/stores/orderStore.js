import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../api';
import toast from 'react-hot-toast';

const useOrderStore = create(
  persist(
    (set, get) => ({
      orders: [],
      currentOrder: null,
      orderStatistics: null,
      isLoading: false,
      error: null,

      // Actions
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Fetch user orders
      fetchOrders: async () => {
        try {
          set({ isLoading: true, error: null });
          const response = await apiClient.get('/orders');
          
          if (response.data.success) {
            set({ orders: response.data.data.data || [] });
          } else {
            throw new Error(response.data.message || 'Failed to fetch orders');
          }
        } catch (error) {
          const message = error.response?.data?.message || error.message || 'Failed to fetch orders';
          set({ error: message });
          toast.error(message);
        } finally {
          set({ isLoading: false });
        }
      },

      // Fetch single order
      fetchOrder: async (orderId) => {
        try {
          set({ isLoading: true, error: null });
          const response = await apiClient.get(`/orders/${orderId}`);
          
          if (response.data.success) {
            set({ currentOrder: response.data.data });
            return response.data.data;
          } else {
            throw new Error(response.data.message || 'Failed to fetch order');
          }
        } catch (error) {
          const message = error.response?.data?.message || error.message || 'Failed to fetch order';
          set({ error: message });
          toast.error(message);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Create new order (checkout)
      createOrder: async (orderData) => {
        try {
          set({ isLoading: true, error: null });
          const response = await apiClient.post('/orders', orderData);
          
          if (response.data.success) {
            const newOrder = response.data.data;
            set((state) => ({
              orders: [newOrder, ...state.orders],
              currentOrder: newOrder
            }));
            toast.success('Order placed successfully!');
            return newOrder;
          } else {
            throw new Error(response.data.message || 'Failed to create order');
          }
        } catch (error) {
          const message = error.response?.data?.message || error.message || 'Failed to create order';
          set({ error: message });
          toast.error(message);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Cancel order
      cancelOrder: async (orderId, reason = '') => {
        try {
          set({ isLoading: true, error: null });
          const response = await apiClient.post(`/orders/${orderId}/cancel`, { reason });
          
          if (response.data.success) {
            const updatedOrder = response.data.data;
            set((state) => ({
              orders: state.orders.map(order => 
                order.id === orderId ? updatedOrder : order
              ),
              currentOrder: state.currentOrder?.id === orderId ? updatedOrder : state.currentOrder
            }));
            toast.success('Order cancelled successfully');
            return updatedOrder;
          } else {
            throw new Error(response.data.message || 'Failed to cancel order');
          }
        } catch (error) {
          const message = error.response?.data?.message || error.message || 'Failed to cancel order';
          set({ error: message });
          toast.error(message);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Fetch order statistics
      fetchOrderStatistics: async () => {
        try {
          // Check if user is authenticated before making API call
          const token = localStorage.getItem('auth_token');
          if (!token) {
            // User not authenticated, just set empty statistics
            set({ orderStatistics: null, isLoading: false, error: null });
            return;
          }

          set({ isLoading: true, error: null });
          const response = await apiClient.get('/orders/statistics');
          
          if (response.data.success) {
            set({ orderStatistics: response.data.data });
          } else {
            throw new Error(response.data.message || 'Failed to fetch statistics');
          }
        } catch (error) {
          const message = error.response?.data?.message || error.message || 'Failed to fetch statistics';
          set({ error: message });
          // Don't show toast for authentication errors
          if (!error.response?.data?.message?.includes('Unauthenticated')) {
            toast.error(message);
          }
        } finally {
          set({ isLoading: false });
        }
      },

      // Get order by ID from local state
      getOrderById: (orderId) => {
        const { orders } = get();
        return orders.find(order => order.id === orderId);
      },

      // Get orders by status
      getOrdersByStatus: (status) => {
        const { orders } = get();
        return orders.filter(order => order.status === status);
      },

      // Get recent orders
      getRecentOrders: (limit = 5) => {
        const { orders } = get();
        return orders.slice(0, limit);
      },

      // Clear current order
      clearCurrentOrder: () => set({ currentOrder: null }),

      // Initialize store
      initialize: async () => {
        try {
          await get().fetchOrderStatistics();
        } catch (error) {
          console.error('Failed to initialize order store:', error);
        }
      }
    }),
    {
      name: 'order-storage',
      partialize: (state) => ({
        orders: state.orders,
        orderStatistics: state.orderStatistics
      }),
    }
  )
);

export default useOrderStore;
