'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon,
  ShoppingBagIcon,
  HeartIcon,
  UserIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeIconSolid,
  ShoppingBagIcon as ShoppingBagIconSolid,
  HeartIcon as HeartIconSolid,
  UserIcon as UserIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid
} from '@heroicons/react/24/solid';
import useCartStore from '../lib/stores/cartStore';
import useWishlistStore from '../lib/stores/wishlistStore';
import useAuthStore from '../lib/stores/authStore';

const navigation = [
  {
    name: 'Home',
    href: '/',
    icon: HomeIcon,
    activeIcon: HomeIconSolid,
    description: 'Main page'
  },
  {
    name: 'Search',
    href: '/search',
    icon: MagnifyingGlassIcon,
    activeIcon: MagnifyingGlassIconSolid,
    description: 'Find products'
  },
  {
    name: 'Products',
    href: '/products',
    icon: ShoppingBagIcon,
    activeIcon: ShoppingBagIconSolid,
    description: 'All products'
  },
  {
    name: 'Wishlist',
    href: '/wishlist',
    icon: HeartIcon,
    activeIcon: HeartIconSolid,
    description: 'Saved items'
  },
  {
    name: 'Account',
    href: '/account',
    icon: UserIcon,
    activeIcon: UserIconSolid,
    description: 'Profile & orders'
  }
];

export default function BottomNavigation() {
  const pathname = usePathname();
  const { summary } = useCartStore();
  const { count: wishlistCount } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();

  const cartItemCount = summary?.itemsCount || 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* Background with backdrop blur */}
      <div className="bg-white/95 backdrop-blur-xl border-t border-gray-200/60 shadow-2xl">
        <nav className="flex items-center justify-around py-3 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href));
            
            const Icon = isActive ? item.activeIcon : item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all duration-300 group relative ${
                  isActive 
                    ? 'text-purple-600 bg-gradient-to-br from-purple-50 to-pink-50 shadow-glow' 
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50/30'
                }`}
                title={item.description}
              >
                <div className="relative">
                  <Icon className={`w-6 h-6 transition-all duration-300 ${
                    isActive ? 'scale-110' : 'group-hover:scale-105'
                  }`} />
                  
                  {/* Badge for cart and wishlist */}
                  {item.name === 'Products' && cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-glow animate-pulse">
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </span>
                  )}
                  
                  {item.name === 'Wishlist' && wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-glow animate-pulse">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  )}
                </div>
                
                <span className={`text-xs font-semibold mt-1.5 transition-all duration-300 ${
                  isActive ? 'text-purple-600' : 'text-gray-600 group-hover:text-purple-600'
                }`}>
                  {item.name}
                </span>

                {/* Active indicator dot */}
                {isActive && (
                  <div className="absolute -bottom-1 w-1.5 h-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                )}
              </Link>
            );
          })}
          

        </nav>
      </div>
      
      {/* Safe area for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-white/95 backdrop-blur-xl" />
    </div>
  );
}
