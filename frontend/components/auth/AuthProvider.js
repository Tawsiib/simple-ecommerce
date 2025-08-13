"use client";

import { useEffect } from 'react';
import useAuthStore from '../../lib/stores/authStore';
import useCartStore from '../../lib/stores/cartStore';
import useWishlistStore from '../../lib/stores/wishlistStore';
import useOrderStore from '../../lib/stores/orderStore';
import useAddressStore from '../../lib/stores/addressStore';

const AuthProvider = ({ children }) => {
  const { initialize: initializeAuth } = useAuthStore();
  const { initialize: initializeCart } = useCartStore();
  const { initialize: initializeWishlist } = useWishlistStore();
  const { initialize: initializeOrder } = useOrderStore();
  const { initialize: initializeAddress } = useAddressStore();

  useEffect(() => {
    // Initialize all stores in the background
    const initializeStores = async () => {
      try {
        await Promise.all([
          initializeAuth(),
          initializeCart(),
          initializeWishlist(),
          initializeOrder(),
          initializeAddress()
        ]);
      } catch (error) {
        console.error('Failed to initialize stores:', error);
      }
    };

    initializeStores();
  }, [initializeAuth, initializeCart, initializeWishlist, initializeOrder, initializeAddress]);

  // Always render children immediately
  return children;
};

export default AuthProvider;
