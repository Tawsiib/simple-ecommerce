import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      // Login
      login: async (credentials) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await apiClient.post('/auth/login', credentials);
          
          if (response.data.success) {
            const { user, token } = response.data.data;
            
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });

            // Set token in API client
            apiClient.setAuthToken(token);
            
            return { success: true, user };
          } else {
            throw new Error(response.data.message || 'Login failed');
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Login failed';
          set({ 
            isLoading: false, 
            error: errorMessage,
            user: null,
            token: null,
            isAuthenticated: false
          });
          throw new Error(errorMessage);
        }
      },

      // Register
      register: async (userData) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await apiClient.post('/auth/register', userData);
          
          if (response.data.success) {
            const { user, token } = response.data.data;
            
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });

            // Set token in API client
            apiClient.setAuthToken(token);
            
            return { success: true, user };
          } else {
            throw new Error(response.data.message || 'Registration failed');
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
          set({ 
            isLoading: false, 
            error: errorMessage,
            user: null,
            token: null,
            isAuthenticated: false
          });
          throw new Error(errorMessage);
        }
      },

      // Logout
      logout: async () => {
        try {
          if (get().token) {
            await apiClient.post('/auth/logout');
          }
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear state regardless of API call success
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
          
          // Clear token from API client
          apiClient.clearAuthToken();
        }
      },

      // Get user profile
      getProfile: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await apiClient.get('/auth/profile');
          
          if (response.data.success) {
            const { user } = response.data.data;
            
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
            
            return { success: true, user };
          } else {
            throw new Error(response.data.message || 'Failed to get profile');
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to get profile';
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
          
          // If unauthorized, clear auth state
          if (error.response?.status === 401) {
            get().logout();
          }
          
          throw new Error(errorMessage);
        }
      },

      // Update profile
      updateProfile: async (profileData) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await apiClient.put('/auth/profile', profileData);
          
          if (response.data.success) {
            const { user } = response.data.data;
            
            set({
              user,
              isLoading: false,
              error: null
            });
            
            return { success: true, user };
          } else {
            throw new Error(response.data.message || 'Profile update failed');
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Profile update failed';
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
          throw new Error(errorMessage);
        }
      },

      // Change password
      changePassword: async (passwordData) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await apiClient.put('/auth/password', passwordData);
          
          if (response.data.success) {
            set({ isLoading: false, error: null });
            return { success: true };
          } else {
            throw new Error(response.data.message || 'Password change failed');
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Password change failed';
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
          throw new Error(errorMessage);
        }
      },

      // Initialize auth state from storage
      initialize: () => {
        const { token } = get();
        if (token) {
          apiClient.setAuthToken(token);
          // Optionally verify token by getting profile
          get().getProfile().catch(() => {
            // If profile fetch fails, clear auth state
            get().logout();
          });
        }
      },

      // Check if user has specific role
      hasRole: (role) => {
        const { user } = get();
        return user?.roles?.some(userRole => userRole.name === role) || false;
      },

      // Check if user is admin
      isAdmin: () => get().hasRole('admin'),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

export default useAuthStore;
