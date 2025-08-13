'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  XMarkIcon, 
  MagnifyingGlassIcon,
  UserIcon,
  HeartIcon,
  ShoppingCartIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import useCartStore from '../lib/stores/cartStore';
import useWishlistStore from '../lib/stores/wishlistStore';

const navigation = [
  { name: 'All Products', href: '/products', icon: '🛍️' },
  { name: 'Acne Treatment', href: '/category/acne-treatment', icon: '✨' },
  { name: 'Sunscreen', href: '/category/sunscreen', icon: '☀️' },
  { name: 'Cleanser', href: '/category/cleanser', icon: '🧼' },
  { name: 'Serum', href: '/category/serum', icon: '🧪' },
  { name: 'Moisturizer', href: '/category/moisturizer', icon: '💧' },
  { name: 'New Arrival', href: '/category/new-arrival', icon: '🆕' },
];

const userMenu = [
  { name: 'My Account', href: '/account', icon: UserIcon },
  { name: 'Orders', href: '/orders', icon: '📦' },
  { name: 'Wishlist', href: '/wishlist', icon: HeartIcon },
  { name: 'Shopping Cart', href: '/cart', icon: ShoppingCartIcon },
  { name: 'Addresses', href: '/addresses', icon: '📍' },
  { name: 'Settings', href: '/settings', icon: '⚙️' },
];

export default function MobileNavigation({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { summary } = useCartStore();
  const { count: wishlistCount } = useWishlistStore();

  const cartItemCount = summary?.itemsCount || 0;

  // Close navigation when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.mobile-nav')) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden'; // Prevent body scroll
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      onClose();
    }
  };

  // Handle navigation item click
  const handleNavClick = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" />
      
      {/* Navigation Drawer */}
      <div className="mobile-nav fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">SR</span>
              </div>
              <span className="text-lg font-bold text-gradient">Shohanis Reflection</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Close navigation"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </form>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Categories
              </h3>
              <div className="space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={handleNavClick}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-gray-700 group-hover:text-primary-600 font-medium">
                        {item.name}
                      </span>
                    </div>
                    <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

            {/* User Menu */}
            <div className="p-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Account
              </h3>
              <div className="space-y-1">
                {userMenu.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={handleNavClick}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      {typeof item.icon === 'string' ? (
                        <span className="text-lg">{item.icon}</span>
                      ) : (
                        <item.icon className="w-5 h-5 text-gray-600" />
                      )}
                      <span className="text-gray-700 group-hover:text-primary-600 font-medium">
                        {item.name}
                      </span>
                    </div>
                    <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  onClick={handleNavClick}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={handleNavClick}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Register
                </Link>
              </div>
              <div className="flex items-center space-x-3">
                <Link href="/wishlist" onClick={handleNavClick} className="relative">
                  <HeartIcon className="w-5 h-5 text-gray-600" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <Link href="/cart" onClick={handleNavClick} className="relative">
                  <ShoppingCartIcon className="w-5 h-5 text-gray-600" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}