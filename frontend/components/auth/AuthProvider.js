"use client";

import { useEffect, useState } from 'react';
import ClientOnly from '../ClientOnly';
import useAuthStore from '../../lib/stores/authStore';
import useCartStore from '../../lib/stores/cartStore';
import useWishlistStore from '../../lib/stores/wishlistStore';
import useOrderStore from '../../lib/stores/orderStore';
import useAddressStore from '../../lib/stores/addressStore';

const AuthProvider = ({ children }) => {
  const [isClient, setIsClient] = useState(false);
  const { initialize: initializeAuth } = useAuthStore();
  const { initialize: initializeCart } = useCartStore();
  const { initialize: initializeWishlist } = useWishlistStore();
  const { initialize: initializeOrder } = useOrderStore();
  const { initialize: initializeAddress } = useAddressStore();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

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
  }, [isClient, initializeAuth, initializeCart, initializeWishlist, initializeOrder, initializeAddress]);

  // Render children immediately, but wrap store-dependent content in ClientOnly
  return (
    <>
      {children}
      {/* Initialize stores only on client side */}
      {isClient && (
        <ClientOnly>
          <div style={{ display: 'none' }} />
        </ClientOnly>
      )}
    </>
  );
};

export default AuthProvider;
