import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../api';

const usePaymentStore = create(
  persist(
    (set, get) => ({
      // State
      paymentMethods: [],
      currentPayment: null,
      paymentStatus: 'idle', // idle, processing, success, failed
      error: null,
      isLoading: false,

      // Actions
      setPaymentMethods: (methods) => set({ paymentMethods: methods }),
      
      setCurrentPayment: (payment) => set({ currentPayment: payment }),
      
      setPaymentStatus: (status) => set({ paymentStatus: status }),
      
      setError: (error) => set({ error }),
      
      setLoading: (loading) => set({ isLoading: loading }),

      // Create payment intent
      createPaymentIntent: async (orderId, paymentMethodId) => {
        try {
          set({ isLoading: true, error: null, paymentStatus: 'processing' });
          
          const response = await apiClient.post('/payments/create-intent', {
            order_id: orderId,
            payment_method_id: paymentMethodId
          });

          const { client_secret, payment_intent_id, status } = response.data;
          
          set({
            currentPayment: {
              clientSecret: client_secret,
              paymentIntentId: payment_intent_id,
              status
            },
            paymentStatus: 'processing'
          });

          return { clientSecret: client_secret, paymentIntentId: payment_intent_id };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Payment setup failed';
          set({ error: errorMessage, paymentStatus: 'failed' });
          throw new Error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },

      // Confirm payment
      confirmPayment: async (paymentIntentId) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await apiClient.post('/payments/confirm', {
            payment_intent_id: paymentIntentId
          });

          const { status, order_id } = response.data;
          
          if (status === 'succeeded') {
            set({ paymentStatus: 'success' });
            return { success: true, orderId: order_id };
          } else {
            set({ paymentStatus: 'failed', error: 'Payment failed' });
            return { success: false, error: 'Payment failed' };
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Payment confirmation failed';
          set({ error: errorMessage, paymentStatus: 'failed' });
          throw new Error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },

      // Get payment methods
      fetchPaymentMethods: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await apiClient.get('/payments/methods');
          set({ paymentMethods: response.data.payment_methods });
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch payment methods';
          set({ error: errorMessage });
        } finally {
          set({ isLoading: false });
        }
      },

      // Reset payment state
      resetPayment: () => set({
        currentPayment: null,
        paymentStatus: 'idle',
        error: null
      }),

      // Clear error
      clearError: () => set({ error: null })
    }),
    {
      name: 'payment-store',
      partialize: (state) => ({
        paymentMethods: state.paymentMethods
      })
    }
  )
);

export default usePaymentStore;
