import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  timeout: 15000, // Increased timeout to 15 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Add request deduplication
  requestId: true,
});

// Track navigation state to prevent errors during route changes
let isNavigating = false;
let navigationTimeout = null;
let lastErrorTime = 0;
const ERROR_DEBOUNCE_MS = 3000; // Don't show errors more frequently than every 3 seconds

if (typeof window !== 'undefined') {
  // Listen for route changes in Next.js
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function(...args) {
    isNavigating = true;
    clearTimeout(navigationTimeout);
    navigationTimeout = setTimeout(() => {
      isNavigating = false;
    }, 2000);
    return originalPushState.apply(this, args);
  };
  
  history.replaceState = function(...args) {
    isNavigating = true;
    clearTimeout(navigationTimeout);
    navigationTimeout = setTimeout(() => {
      isNavigating = false;
    }, 2000);
    return originalReplaceState.apply(this, args);
  };
  
  // Also listen for popstate (back/forward navigation)
  window.addEventListener('popstate', () => {
    isNavigating = true;
    clearTimeout(navigationTimeout);
    navigationTimeout = setTimeout(() => {
      isNavigating = false;
    }, 2000);
  });
}

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors and token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth/refresh`,
            { refresh_token: refreshToken }
          );
          
          const { access_token } = response.data;
          localStorage.setItem('auth_token', access_token);
          
          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Don't show error toasts for common navigation/404 errors
    // Only show errors for actual user actions (POST, PUT, DELETE) or critical failures
    const shouldShowError = 
      !originalRequest._retry && 
      !isNavigating && // Don't show errors during navigation
      error.response?.status !== 404 && 
      error.response?.status !== 401 &&
      error.response?.status !== 422 &&
      error.response?.status !== 500 && // Don't show 500 errors (server issues)
      !['GET'].includes(originalRequest.method?.toUpperCase()) && // Don't show errors for GET requests
      !error.message?.includes('Network Error') &&
      !error.message?.includes('timeout') &&
      !error.message?.includes('canceled') && // Don't show errors for canceled requests
      !error.code?.includes('ERR_CANCELED') && // Don't show errors for canceled requests
      !error.message?.includes('Request failed'); // Don't show generic request failed errors

    if (shouldShowError) {
      // Prevent duplicate error messages by checking if we've already shown this error
      const errorKey = `${error.response?.status}-${error.response?.data?.message || error.message}`;
      
      if (!window.shownErrors) {
        window.shownErrors = new Set();
      }
      
      // Check debounce timing
      const now = Date.now();
      if (now - lastErrorTime < ERROR_DEBOUNCE_MS) {
        return Promise.reject(error);
      }
      
      if (!window.shownErrors.has(errorKey)) {
        window.shownErrors.add(errorKey);
        lastErrorTime = now;
        
        // Show error toast only for critical errors
        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else if (error.message) {
          toast.error(error.message);
        }
        
        // Clear shown errors after 10 seconds to allow new errors
        setTimeout(() => {
          window.shownErrors.delete(errorKey);
        }, 10000);
      }
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  // Auth
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    user: '/auth/user',
  },
  
  // Products
  products: {
    list: '/products',
    featured: '/products?featured=true',
    byCategory: (categoryId) => `/products/category/${categoryId}`,
    search: '/products/search',
    show: (id) => `/products/${id}`,
    related: (id) => `/products/${id}/related`,
  },
  
  // Categories
  categories: {
    list: '/categories',
    show: (id) => `/categories/${id}`,
  },
  
  // Brands
  brands: {
    list: '/brands',
    show: (id) => `/brands/${id}`,
  },
  
  // Cart
  cart: {
    list: '/cart',
    add: '/cart/add',
    update: '/cart/update',
    remove: '/cart/remove',
    clear: '/cart/clear',
  },
  
  // Wishlist
  wishlist: {
    list: '/wishlist',
    add: '/wishlist/add',
    remove: '/wishlist/remove',
    clear: '/wishlist/clear',
  },
  
  // Orders
  orders: {
    list: '/orders',
    show: (id) => `/orders/${id}`,
    create: '/orders',
    cancel: (id) => `/orders/${id}/cancel`,
  },
  
  // Reviews
  reviews: {
    list: (productId) => `/products/${productId}/reviews`,
    create: (productId) => `/products/${productId}/reviews`,
    update: (productId, reviewId) => `/products/${productId}/reviews/${reviewId}`,
    delete: (productId, reviewId) => `/products/${productId}/reviews/${reviewId}`,
  },
};

// API methods
export const apiClient = {
  // Generic methods
  get: (url, config) => api.get(url, config),
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  patch: (url, data, config) => api.patch(url, data, config),
  delete: (url, config) => api.delete(url, config),
  
  // Auth methods
  setAuthToken: (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  },
  clearAuthToken: () => {
    delete api.defaults.headers.common['Authorization'];
  },
  login: (credentials) => api.post(endpoints.auth.login, credentials),
  register: (userData) => api.post(endpoints.auth.register, userData),
  logout: () => api.post(endpoints.auth.logout),
  getUser: () => api.get(endpoints.auth.user),
  
  // Product methods
  getProducts: (params) => api.get(endpoints.products.list, { params }),
  getFeaturedProducts: () => api.get(endpoints.products.featured),
  getProductsByCategory: (categoryId, params) => 
    api.get(endpoints.products.byCategory(categoryId), { params }),
  searchProducts: (query, params) => 
    api.get(endpoints.products.search, { params: { q: query, ...params } }),
  getProduct: (id) => api.get(endpoints.products.show(id)),
  getRelatedProducts: (id) => api.get(endpoints.products.related(id)),
  
  // Category methods
  getCategories: () => api.get(endpoints.categories.list),
  getCategory: (id) => api.get(endpoints.categories.show(id)),
  
  // Brand methods
  getBrands: () => api.get(endpoints.brands.list),
  getBrand: (id) => api.get(endpoints.brands.show(id)),
  
  // Cart methods
  getCart: () => api.get(endpoints.cart.list),
  addToCart: (data) => api.post(endpoints.cart.add, data),
  updateCartItem: (data) => api.put(endpoints.cart.update, data),
  removeFromCart: (itemId) => api.delete(endpoints.cart.remove, { data: { item_id: itemId } }),
  clearCart: () => api.delete(endpoints.cart.clear),
  
  // Wishlist methods
  getWishlist: () => api.get(endpoints.wishlist.list),
  addToWishlist: (productId) => api.post(endpoints.wishlist.add, { product_id: productId }),
  removeFromWishlist: (productId) => api.delete(endpoints.wishlist.remove, { data: { product_id: productId } }),
  clearWishlist: () => api.delete(endpoints.wishlist.clear),
  
  // Order methods
  getOrders: () => api.get(endpoints.orders.list),
  getOrder: (id) => api.get(endpoints.orders.show(id)),
  createOrder: (orderData) => api.post(endpoints.orders.create, orderData),
  cancelOrder: (id) => api.post(endpoints.orders.cancel(id)),
  
  // Review methods
  getProductReviews: (productId, params) => 
    api.get(endpoints.reviews.list(productId), { params }),
  createReview: (productId, reviewData) => 
    api.post(endpoints.reviews.create(productId), reviewData),
  updateReview: (productId, reviewId, reviewData) => 
    api.put(endpoints.reviews.update(productId, reviewId), reviewData),
  deleteReview: (productId, reviewId) => 
    api.delete(endpoints.reviews.delete(productId, reviewId)),
};

export default apiClient;