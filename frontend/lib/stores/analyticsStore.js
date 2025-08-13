import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useAnalyticsStore = create(
  devtools(
    (set, get) => ({
      // State
      analyticsData: null,
      overview: null,
      sales: null,
      products: null,
      customers: null,
      traffic: null,
      conversion: null,
      realTime: null,
      period: 'month',
      isLoading: false,
      error: null,
      lastUpdated: null,

      // Actions
      setAnalyticsData: (analyticsData) => set({ analyticsData }),
      
      setOverview: (overview) => set({ overview }),
      
      setSales: (sales) => set({ sales }),
      
      setProducts: (products) => set({ products }),
      
      setCustomers: (customers) => set({ customers }),
      
      setTraffic: (traffic) => set({ traffic }),
      
      setConversion: (conversion) => set({ conversion }),
      
      setRealTime: (realTime) => set({ realTime }),
      
      setPeriod: (period) => set({ period }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      setLastUpdated: (lastUpdated) => set({ lastUpdated }),

      // Fetch comprehensive analytics data
      fetchAnalyticsData: async (period = 'month') => {
        try {
          set({ isLoading: true, error: null, period });
          
          const response = await fetch(`/api/analytics?period=${period}`);
          if (!response.ok) throw new Error('Failed to fetch analytics data');
          
          const data = await response.json();
          set({ 
            analyticsData: data.data,
            overview: data.data.overview,
            sales: data.data.sales,
            products: data.data.products,
            customers: data.data.customers,
            traffic: data.data.traffic,
            conversion: data.data.conversion,
            lastUpdated: new Date(),
            isLoading: false 
          });
          
          return data.data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Fetch overview statistics
      fetchOverview: async (period = 'month') => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch(`/api/analytics/overview?period=${period}`);
          if (!response.ok) throw new Error('Failed to fetch overview data');
          
          const data = await response.json();
          set({ 
            overview: data.data,
            lastUpdated: new Date(),
            isLoading: false 
          });
          
          return data.data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Fetch sales analytics
      fetchSalesAnalytics: async (period = 'month') => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch(`/api/analytics/sales?period=${period}`);
          if (!response.ok) throw new Error('Failed to fetch sales analytics');
          
          const data = await response.json();
          set({ 
            sales: data.data,
            lastUpdated: new Date(),
            isLoading: false 
          });
          
          return data.data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Fetch product analytics
      fetchProductAnalytics: async (period = 'month') => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch(`/api/analytics/products?period=${period}`);
          if (!response.ok) throw new Error('Failed to fetch product analytics');
          
          const data = await response.json();
          set({ 
            products: data.data,
            lastUpdated: new Date(),
            isLoading: false 
          });
          
          return data.data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Fetch customer analytics
      fetchCustomerAnalytics: async (period = 'month') => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch(`/api/analytics/customers?period=${period}`);
          if (!response.ok) throw new Error('Failed to fetch customer analytics');
          
          const data = await response.json();
          set({ 
            customers: data.data,
            lastUpdated: new Date(),
            isLoading: false 
          });
          
          return data.data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Fetch traffic analytics
      fetchTrafficAnalytics: async (period = 'month') => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch(`/api/analytics/traffic?period=${period}`);
          if (!response.ok) throw new Error('Failed to fetch traffic analytics');
          
          const data = await response.json();
          set({ 
            traffic: data.data,
            lastUpdated: new Date(),
            isLoading: false 
          });
          
          return data.data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Fetch conversion analytics
      fetchConversionAnalytics: async (period = 'month') => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch(`/api/analytics/conversion?period=${period}`);
          if (!response.ok) throw new Error('Failed to fetch conversion analytics');
          
          const data = await response.json();
          set({ 
            conversion: data.data,
            lastUpdated: new Date(),
            isLoading: false 
          });
          
          return data.data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Fetch real-time analytics
      fetchRealTimeAnalytics: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch('/api/analytics/real-time');
          if (!response.ok) throw new Error('Failed to fetch real-time analytics');
          
          const data = await response.json();
          set({ 
            realTime: data.data,
            lastUpdated: new Date(),
            isLoading: false 
          });
          
          return data.data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Export analytics data
      exportAnalytics: async (period = 'month', format = 'json') => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch(`/api/analytics/export?period=${period}&format=${format}`);
          if (!response.ok) throw new Error('Failed to export analytics data');
          
          const data = await response.json();
          set({ isLoading: false });
          
          return data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Get analytics configuration
      fetchAnalyticsConfig: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch('/api/analytics/config');
          if (!response.ok) throw new Error('Failed to fetch analytics config');
          
          const data = await response.json();
          set({ isLoading: false });
          
          return data.data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Clear analytics cache (requires authentication)
      clearAnalyticsCache: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch('/api/analytics/cache/clear', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          });
          if (!response.ok) throw new Error('Failed to clear analytics cache');
          
          const data = await response.json();
          set({ 
            lastUpdated: new Date(),
            isLoading: false 
          });
          
          return data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Start real-time monitoring
      startRealTimeMonitoring: () => {
        const interval = setInterval(() => {
          get().fetchRealTimeAnalytics();
        }, 30000); // Update every 30 seconds
        
        return () => clearInterval(interval);
      },

      // Reset store
      reset: () => set({
        analyticsData: null,
        overview: null,
        sales: null,
        products: null,
        customers: null,
        traffic: null,
        conversion: null,
        realTime: null,
        period: 'month',
        isLoading: false,
        error: null,
        lastUpdated: null,
      }),
    }),
    {
      name: 'analytics-store',
    }
  )
);

export default useAnalyticsStore;
