import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './api';

// Product Services
export const useProducts = (params = {}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => apiClient.getProducts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => apiClient.getFeaturedProducts(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useProductsByCategory = (categoryId, params = {}) => {
  return useQuery({
    queryKey: ['products', 'category', categoryId, params],
    queryFn: () => apiClient.getProductsByCategory(categoryId, params),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useProduct = (id) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => apiClient.getProduct(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
};

export const useRelatedProducts = (id) => {
  return useQuery({
    queryKey: ['products', id, 'related'],
    queryFn: () => apiClient.getRelatedProducts(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
};

export const useSearchProducts = (query, params = {}) => {
  return useQuery({
    queryKey: ['products', 'search', query, params],
    queryFn: () => apiClient.searchProducts(query, params),
    enabled: !!query && query.trim().length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    gcTime: 5 * 60 * 1000,
  });
};

// Category Services
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.getCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes - categories don't change often
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useCategory = (id) => {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: () => apiClient.getCategory(id),
    enabled: !!id,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
};

// Brand Services
export const useBrands = () => {
  return useQuery({
    queryKey: ['brands'],
    queryFn: () => apiClient.getBrands(),
    staleTime: 30 * 60 * 1000, // 30 minutes - brands don't change often
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useBrand = (id) => {
  return useQuery({
    queryKey: ['brands', id],
    queryFn: () => apiClient.getBrand(id),
    enabled: !!id,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
};

// Cart Services
export const useCart = () => {
  return useQuery({
    queryKey: ['cart'],
    queryFn: () => apiClient.getCart(),
    staleTime: 1 * 60 * 1000, // 1 minute - cart changes frequently
    gcTime: 5 * 60 * 1000,
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => apiClient.addToCart(data),
    onSuccess: () => {
      // Invalidate and refetch cart
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      // Also invalidate products to update stock info
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      console.error('Failed to add to cart:', error);
    },
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => apiClient.updateCartItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error) => {
      console.error('Failed to update cart item:', error);
    },
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (itemId) => apiClient.removeFromCart(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error) => {
      console.error('Failed to remove from cart:', error);
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => apiClient.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error) => {
      console.error('Failed to clear cart:', error);
    },
  });
};

// Wishlist Services
export const useWishlist = () => {
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: () => apiClient.getWishlist(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useAddToWishlist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (productId) => apiClient.addToWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: (error) => {
      console.error('Failed to add to wishlist:', error);
    },
  });
};

export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (productId) => apiClient.removeFromWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: (error) => {
      console.error('Failed to remove from wishlist:', error);
    },
  });
};

export const useClearWishlist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => apiClient.clearWishlist(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: (error) => {
      console.error('Failed to clear wishlist:', error);
    },
  });
};

// Order Services
export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => apiClient.getOrders(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useOrder = (id) => {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => apiClient.getOrder(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderData) => apiClient.createOrder(orderData),
    onSuccess: () => {
      // Invalidate orders and cart
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error) => {
      console.error('Failed to create order:', error);
    },
  });
};

// Review Services
export const useProductReviews = (productId, params = {}) => {
  return useQuery({
    queryKey: ['reviews', productId, params],
    queryFn: () => apiClient.getProductReviews(productId, params),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ productId, reviewData }) => 
      apiClient.createReview(productId, reviewData),
    onSuccess: (data, variables) => {
      // Invalidate reviews for the specific product
      queryClient.invalidateQueries({ 
        queryKey: ['reviews', variables.productId] 
      });
      // Also invalidate the product to update rating
      queryClient.invalidateQueries({ 
        queryKey: ['products', variables.productId] 
      });
    },
    onError: (error) => {
      console.error('Failed to create review:', error);
    },
  });
};

// Utility function to prefetch data
export const prefetchData = async (queryClient) => {
  // Prefetch essential data for better UX
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ['categories'],
      queryFn: () => apiClient.getCategories(),
    }),
    queryClient.prefetchQuery({
      queryKey: ['brands'],
      queryFn: () => apiClient.getBrands(),
    }),
    queryClient.prefetchQuery({
      queryKey: ['products', 'featured'],
      queryFn: () => apiClient.getFeaturedProducts(),
    }),
  ]);
};
