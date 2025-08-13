import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../api';
import toast from 'react-hot-toast';

const useAddressStore = create(
  persist(
    (set, get) => ({
      addresses: [],
      isLoading: false,
      error: null,

      // Actions
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Fetch addresses
      fetchAddresses: async () => {
        try {
          // Check if user is authenticated before making API call
          const token = localStorage.getItem('auth_token');
          if (!token) {
            // User not authenticated, just set empty addresses
            set({ addresses: [], isLoading: false, error: null });
            return;
          }

          set({ isLoading: true, error: null });
          const response = await apiClient.get('/addresses');
          
          if (response.data.success) {
            set({ addresses: response.data.data || [] });
          } else {
            throw new Error(response.data.message || 'Failed to fetch addresses');
          }
        } catch (error) {
          const message = error.response?.data?.message || error.message || 'Failed to fetch addresses';
          set({ error: message });
          // Don't show toast for authentication errors
          if (!error.response?.data?.message?.includes('Unauthenticated')) {
            toast.error(message);
          }
        } finally {
          set({ isLoading: false });
        }
      },

      // Add address
      addAddress: async (addressData) => {
        try {
          set({ isLoading: true, error: null });
          const response = await apiClient.post('/addresses', addressData);
          
          if (response.data.success) {
            const newAddress = response.data.data;
            set((state) => ({
              addresses: [...state.addresses, newAddress]
            }));
            toast.success('Address added successfully');
            return newAddress;
          } else {
            throw new Error(response.data.message || 'Failed to add address');
          }
        } catch (error) {
          const message = error.response?.data?.message || error.message || 'Failed to add address';
          set({ error: message });
          toast.error(message);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Update address
      updateAddress: async (addressId, addressData) => {
        try {
          set({ isLoading: true, error: null });
          const response = await apiClient.put(`/addresses/${addressId}`, addressData);
          
          if (response.data.success) {
            const updatedAddress = response.data.data;
            set((state) => ({
              addresses: state.addresses.map(addr => 
                addr.id === addressId ? updatedAddress : addr
              )
            }));
            toast.success('Address updated successfully');
            return updatedAddress;
          } else {
            throw new Error(response.data.message || 'Failed to update address');
          }
        } catch (error) {
          const message = error.response?.data?.message || error.message || 'Failed to update address';
          set({ error: message });
          toast.error(message);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Delete address
      deleteAddress: async (addressId) => {
        try {
          set({ isLoading: true, error: null });
          const response = await apiClient.delete(`/addresses/${addressId}`);
          
          if (response.data.success) {
            set((state) => ({
              addresses: state.addresses.filter(addr => addr.id !== addressId)
            }));
            toast.success('Address deleted successfully');
          } else {
            throw new Error(response.data.message || 'Failed to delete address');
          }
        } catch (error) {
          const message = error.response?.data?.message || error.message || 'Failed to delete address';
          set({ error: message });
          toast.error(message);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Set default address
      setDefaultAddress: async (addressId) => {
        try {
          set({ isLoading: true, error: null });
          const response = await apiClient.post(`/addresses/${addressId}/set-default`);
          
          if (response.data.success) {
            const updatedAddress = response.data.data;
            set((state) => ({
              addresses: state.addresses.map(addr => ({
                ...addr,
                is_default: addr.id === addressId ? true : 
                           (addr.type === updatedAddress.type ? false : addr.is_default)
              }))
            }));
            toast.success('Default address updated');
            return updatedAddress;
          } else {
            throw new Error(response.data.message || 'Failed to set default address');
          }
        } catch (error) {
          const message = error.response?.data?.message || error.message || 'Failed to set default address';
          set({ error: message });
          toast.error(message);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Get default address
      getDefaultAddress: (type = 'shipping') => {
        const { addresses } = get();
        return addresses.find(addr => addr.type === type && addr.is_default);
      },

      // Get addresses by type
      getAddressesByType: (type = 'shipping') => {
        const { addresses } = get();
        return addresses.filter(addr => addr.type === type);
      },

      // Initialize store
      initialize: async () => {
        try {
          await get().fetchAddresses();
        } catch (error) {
          console.error('Failed to initialize address store:', error);
        }
      }
    }),
    {
      name: 'address-storage',
      partialize: (state) => ({
        addresses: state.addresses
      }),
    }
  )
);

export default useAddressStore;
