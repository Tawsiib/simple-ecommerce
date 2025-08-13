import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useSeoStore = create(
  devtools(
    (set, get) => ({
      // State
      metaTags: {},
      structuredData: {},
      sitemapData: null,
      seoStats: null,
      isLoading: false,
      error: null,
      lastUpdated: null,

      // Actions
      setMetaTags: (metaTags) => set({ metaTags }),
      
      setStructuredData: (structuredData) => set({ structuredData }),
      
      setSitemapData: (sitemapData) => set({ sitemapData }),
      
      setSeoStats: (seoStats) => set({ seoStats }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      setLastUpdated: (lastUpdated) => set({ lastUpdated }),

      // Fetch meta tags for a specific page type
      fetchMetaTags: async (type, id = null, query = null) => {
        try {
          set({ isLoading: true, error: null });
          
          const params = new URLSearchParams({ type });
          if (id) params.append('id', id);
          if (query) params.append('query', query);
          
          const response = await fetch(`/api/seo/meta-tags?${params}`);
          if (!response.ok) throw new Error('Failed to fetch meta tags');
          
          const data = await response.json();
          set({ 
            metaTags: data.data,
            lastUpdated: new Date(),
            isLoading: false 
          });
          
          return data.data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Fetch product structured data
      fetchProductStructuredData: async (productId) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch(`/api/seo/product/${productId}/structured-data`);
          if (!response.ok) throw new Error('Failed to fetch product structured data');
          
          const data = await response.json();
          set({ 
            structuredData: { ...get().structuredData, product: data.data },
            lastUpdated: new Date(),
            isLoading: false 
          });
          
          return data.data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Fetch organization structured data
      fetchOrganizationStructuredData: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch('/api/seo/organization/structured-data');
          if (!response.ok) throw new Error('Failed to fetch organization structured data');
          
          const data = await response.json();
          set({ 
            structuredData: { ...get().structuredData, organization: data.data },
            lastUpdated: new Date(),
            isLoading: false 
          });
          
          return data.data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Fetch breadcrumb structured data
      fetchBreadcrumbStructuredData: async (breadcrumbs) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch('/api/seo/breadcrumbs/structured-data', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ breadcrumbs }),
          });
          if (!response.ok) throw new Error('Failed to fetch breadcrumb structured data');
          
          const data = await response.json();
          set({ 
            structuredData: { ...get().structuredData, breadcrumbs: data.data },
            lastUpdated: new Date(),
            isLoading: false 
          });
          
          return data.data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Fetch FAQ structured data
      fetchFaqStructuredData: async (faqs) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch('/api/seo/faq/structured-data', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ faqs }),
          });
          if (!response.ok) throw new Error('Failed to fetch FAQ structured data');
          
          const data = await response.json();
          set({ 
            structuredData: { ...get().structuredData, faq: data.data },
            lastUpdated: new Date(),
            isLoading: false 
          });
          
          return data.data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Generate sitemap
      generateSitemap: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch('/api/seo/sitemap');
          if (!response.ok) throw new Error('Failed to generate sitemap');
          
          const data = await response.json();
          set({ 
            sitemapData: data.data,
            lastUpdated: new Date(),
            isLoading: false 
          });
          
          return data.data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Get SEO statistics
      fetchSeoStats: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch('/api/seo/stats');
          if (!response.ok) throw new Error('Failed to fetch SEO stats');
          
          const data = await response.json();
          set({ 
            seoStats: data.data,
            lastUpdated: new Date(),
            isLoading: false 
          });
          
          return data.data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Clear SEO cache (requires authentication)
      clearSeoCache: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch('/api/seo/cache/clear', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          });
          if (!response.ok) throw new Error('Failed to clear SEO cache');
          
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

      // Reset store
      reset: () => set({
        metaTags: {},
        structuredData: {},
        sitemapData: null,
        seoStats: null,
        isLoading: false,
        error: null,
        lastUpdated: null,
      }),
    }),
    {
      name: 'seo-store',
    }
  )
);

export default useSeoStore;
