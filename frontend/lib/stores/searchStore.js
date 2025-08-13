import { create } from 'zustand';
import { apiClient } from '../api';

const useSearchStore = create((set, get) => ({
  // State
  searchResults: [],
  searchHistory: [],
  popularSearches: [],
  trendingProducts: [],
  searchAnalytics: null,
  isLoading: false,
  error: null,
  filters: {
    category_id: '',
    brand_id: '',
    price_min: '',
    price_max: '',
    rating: '',
    in_stock: false,
    featured: false,
    sort_by: 'relevance',
    sort_order: 'desc'
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    perPage: 15
  },

  // Actions
  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters }
    }));
  },

  clearFilters: () => {
    set({
      filters: {
        category_id: '',
        brand_id: '',
        price_min: '',
        price_max: '',
        rating: '',
        in_stock: false,
        featured: false,
        sort_by: 'relevance',
        sort_order: 'desc'
      }
    });
  },

  setPagination: (pagination) => {
    set((state) => ({
      pagination: { ...state.pagination, ...pagination }
    }));
  },

  // Search functionality
  search: async (searchTerm, filters = {}, page = 1) => {
    set({ isLoading: true, error: null });

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        ...(searchTerm && { q: searchTerm }),
        ...(filters.category_id && { category_id: filters.category_id }),
        ...(filters.brand_id && { brand_id: filters.brand_id }),
        ...(filters.price_min && { price_min: filters.price_min }),
        ...(filters.price_max && { price_max: filters.price_max }),
        ...(filters.rating && { rating: filters.rating }),
        ...(filters.in_stock && { in_stock: 'true' }),
        ...(filters.featured && { featured: 'true' }),
        ...(filters.sort_by !== 'relevance' && { sort_by: filters.sort_by }),
        ...(filters.sort_order !== 'desc' && { sort_order: filters.sort_order })
      });

      const response = await apiClient.get(`/search?${params.toString()}`);
      
      if (response.data.success) {
        const { data, meta } = response.data;
        
        set({
          searchResults: data,
          pagination: {
            currentPage: meta.current_page,
            totalPages: meta.last_page,
            totalResults: meta.total,
            perPage: meta.per_page
          },
          filters: { ...get().filters, ...filters },
          isLoading: false
        });

        // Save search to history
        if (searchTerm) {
          get().addToSearchHistory(searchTerm);
        }

        return { success: true, data, meta };
      }
    } catch (error) {
      console.error('Search failed:', error);
      set({
        error: error.response?.data?.message || 'Search failed',
        searchResults: [],
        isLoading: false
      });
      return { success: false, error: error.response?.data?.message || 'Search failed' };
    }
  },

  // Search suggestions
  getSuggestions: async (query) => {
    if (query.length < 2) return [];

    try {
      const response = await apiClient.get(`/search/suggestions?q=${encodeURIComponent(query)}`);
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('Failed to get suggestions:', error);
    }
    return [];
  },

  // Popular searches
  fetchPopularSearches: async () => {
    try {
      const response = await apiClient.get('/search/popular');
      if (response.data.success) {
        set({ popularSearches: response.data.data });
      }
    } catch (error) {
      console.error('Failed to fetch popular searches:', error);
    }
  },

  // Trending products
  fetchTrendingProducts: async () => {
    try {
      const response = await apiClient.get('/search/trending');
      if (response.data.success) {
        set({ trendingProducts: response.data.data });
      }
    } catch (error) {
      console.error('Failed to fetch trending products:', error);
    }
  },

  // Search analytics
  fetchSearchAnalytics: async () => {
    try {
      const response = await apiClient.get('/search/analytics');
      if (response.data.success) {
        set({ searchAnalytics: response.data.data });
      }
    } catch (error) {
      console.error('Failed to fetch search analytics:', error);
    }
  },

  // Search history management
  addToSearchHistory: (searchTerm) => {
    const history = get().searchHistory;
    const newHistory = [searchTerm, ...history.filter(item => item !== searchTerm)].slice(0, 10);
    
    set({ searchHistory: newHistory });
    
    // Save to localStorage
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  },

  loadSearchHistory: () => {
    try {
      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      set({ searchHistory: history });
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  },

  clearSearchHistory: () => {
    set({ searchHistory: [] });
    localStorage.removeItem('searchHistory');
  },

  // Clear search results
  clearSearchResults: () => {
    set({
      searchResults: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalResults: 0,
        perPage: 15
      }
    });
  },

  // Reset store
  reset: () => {
    set({
      searchResults: [],
      searchHistory: [],
      popularSearches: [],
      trendingProducts: [],
      searchAnalytics: null,
      isLoading: false,
      error: null,
      filters: {
        category_id: '',
        brand_id: '',
        price_min: '',
        price_max: '',
        rating: '',
        in_stock: false,
        featured: false,
        sort_by: 'relevance',
        sort_order: 'desc'
      },
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalResults: 0,
        perPage: 15
      }
    });
  }
}));

export default useSearchStore;

