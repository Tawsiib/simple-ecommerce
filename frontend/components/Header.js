'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ShoppingBagIcon, 
  HeartIcon,
  UserIcon,
  MagnifyingGlassIcon,
  TruckIcon,
  QuestionMarkCircleIcon,
  SunIcon,
  SparklesIcon,
  FireIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { 
  ChevronDownIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import BottomNavigation from './BottomNavigation';
import CartDrawer from './cart/CartDrawer';
import { CompactSearchBar } from './SearchBar';
import useAuthStore from '../lib/stores/authStore';
import useCartStore from '../lib/stores/cartStore';
import useWishlistStore from '../lib/stores/wishlistStore';

const Header = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { user, isAuthenticated, logout } = useAuthStore();
  const { summary } = useCartStore();
  const { count: wishlistCount } = useWishlistStore();
  const userMenuRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const cartItemsCount = summary?.itemsCount || 0;

  return (
    <>
      {/* Sticky Header Container - All headers move together */}
      <div className="fixed top-0 left-0 right-0 z-40">
        {/* Promotional Banner */}
        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white text-sm py-2 px-4">
          <div className="container-custom flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <TruckIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Free shipping on orders over ৳1000</span>
                <span className="sm:hidden">Free shipping over ৳1000</span>
              </div>
              <div className="hidden sm:flex items-center space-x-2">
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <QuestionMarkCircleIcon className="w-4 h-4" />
                  <span>Track Order</span>
                </div>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <SunIcon className="w-4 h-4" />
                  <span>Help</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {!isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <Link href="/login" className="text-white/90 hover:text-white transition-colors text-sm">
                    Login
                  </Link>
                  <span className="text-white/50">|</span>
                  <Link href="/register" className="text-white/90 hover:text-white transition-colors text-sm">
                    Register
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-white/90 text-sm">Welcome, {user?.name || 'User'}</span>
                </div>
              )}
              <button className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                <SunIcon className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <header className={`bg-white/95 backdrop-blur-md border-b border-gray-200/50 transition-all duration-300 ${
          isScrolled ? 'shadow-lg' : 'shadow-sm'
        }`}>
          <div className="container-custom py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-glow group-hover:shadow-glow-accent transition-all duration-300">
                    <span className="text-white font-bold text-xl">SR</span>
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 bg-clip-text text-transparent">
                    Shohanis Reflection
                  </h1>
                  <p className="text-xs text-gray-500">Premium Beauty & Skincare</p>
                </div>
              </Link>

              {/* Search Bar - Hidden on mobile, shown on tablet and up */}
              <div className="hidden md:flex flex-1 max-w-2xl mx-8">
                <CompactSearchBar 
                  onSearch={handleSearch}
                  placeholder="Search for products, brands, categories..."
                />
              </div>

              {/* Right Side Actions */}
              <div className="flex items-center space-x-4">
                {/* Wishlist - Hidden on mobile since it's in bottom nav */}
                <Link href="/wishlist" className="hidden md:flex relative p-2 text-gray-600 hover:text-purple-600 transition-colors group">
                  <HeartIcon className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-glow">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  )}
                </Link>

                {/* User Menu - Hidden on mobile since it's in bottom nav */}
                <div className="hidden md:block relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 text-gray-600 hover:text-purple-600 transition-colors group"
                  >
                    <div className="relative">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-glow group-hover:shadow-glow-accent transition-all duration-300">
                        {isAuthenticated && user?.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={user.name} 
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <UserIcon className="w-5 h-5 text-white" />
                        )}
                      </div>
                      {isAuthenticated && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-glow border border-gray-200/50 backdrop-blur-sm z-50">
                      <div className="p-4">
                        {isAuthenticated ? (
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-glow">
                                {user?.avatar ? (
                                  <img 
                                    src={user.avatar} 
                                    alt={user.name} 
                                    className="w-12 h-12 rounded-xl object-cover"
                                  />
                                ) : (
                                  <UserIcon className="w-6 h-6 text-white" />
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{user?.name || 'User'}</p>
                                <p className="text-sm text-gray-500">{user?.email || 'user@example.com'}</p>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Link href="/account" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-purple-600">
                                <UserIcon className="w-5 h-5" />
                                <span>My Account</span>
                              </Link>
                              <Link href="/orders" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-purple-600">
                                <ShoppingBagIcon className="w-5 h-5" />
                                <span>My Orders</span>
                              </Link>
                              <Link href="/wishlist" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-purple-600">
                                <HeartIcon className="w-5 h-5" />
                                <span>Wishlist</span>
                              </Link>
                              <Link href="/settings" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-purple-600">
                                <Cog6ToothIcon className="w-5 h-5" />
                                <span>Settings</span>
                              </Link>
                            </div>
                            <div className="pt-3 border-t border-gray-200">
                              <button
                                onClick={handleLogout}
                                className="flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-red-50 transition-colors text-red-600 hover:text-red-700"
                              >
                                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                <span>Sign Out</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-gray-600 text-center py-2">Welcome! Please sign in to continue.</p>
                            <div className="space-y-2">
                              <Link href="/login" className="block w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-2 px-4 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105">
                                Sign In
                              </Link>
                              <Link href="/register" className="block w-full bg-gray-100 text-gray-700 text-center py-2 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300">
                                Create Account
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Cart - Always visible but with mobile-optimized design */}
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-glow hover:shadow-glow-accent"
                >
                  <ShoppingBagIcon className="w-6 h-6" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-white text-purple-600 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-glow">
                      {cartItemsCount > 99 ? '99+' : cartItemsCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Category Navigation Bar */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="container-custom">
            <nav className="flex items-center justify-between py-3 overflow-x-auto">
              <div className="flex items-center space-x-8 lg:space-x-12">
                <Link 
                  href="/products" 
                  className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 font-medium transition-all duration-300 whitespace-nowrap group"
                >
                  <ShoppingBagIcon className="h-4 w-4" />
                  <span>All Products</span>
                </Link>
                <Link 
                  href="/category/skincare" 
                  className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 font-medium transition-all duration-300 whitespace-nowrap group"
                >
                  <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
                  <span>Skincare</span>
                </Link>
                <Link 
                  href="/category/makeup" 
                  className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 font-medium transition-all duration-300 whitespace-nowrap group"
                >
                  <div className="w-4 h-4 bg-gradient-to-r from-pink-400 to-red-500 rounded-full"></div>
                  <span>Makeup</span>
                </Link>
                <Link 
                  href="/category/haircare" 
                  className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 font-medium transition-all duration-300 whitespace-nowrap group"
                >
                  <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></div>
                  <span>Hair Care</span>
                </Link>
                <Link 
                  href="/category/perfume" 
                  className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 font-medium transition-all duration-300 whitespace-nowrap group"
                >
                  <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full"></div>
                  <span>Perfume</span>
                </Link>
                <Link 
                  href="/category/bodycare" 
                  className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 font-medium transition-all duration-300 whitespace-nowrap group"
                >
                  <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-teal-500 rounded-full"></div>
                  <span>Body Care</span>
                </Link>
                <Link 
                  href="/offers" 
                  className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 font-medium transition-all duration-300 whitespace-nowrap group"
                >
                  <SparklesIcon className="h-4 w-4" />
                  <span>Offers</span>
                </Link>
                <Link 
                  href="/new-arrivals" 
                  className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 font-medium transition-all duration-300 whitespace-nowrap group"
                >
                  <TagIcon className="h-4 w-4" />
                  <span>New Arrivals</span>
                </Link>
              </div>
              <Link 
                href="/flash-sale" 
                className="flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium transition-all duration-300 whitespace-nowrap group"
              >
                <FireIcon className="h-4 w-4" />
                <span>Flash Sale</span>
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom Navigation for Mobile */}
      <BottomNavigation />

      {/* Cart Drawer */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />

      {/* Spacer for fixed header - Updated height to account for all three sections */}
      <div className={`transition-all duration-300 h-44`} />
      
      {/* Bottom spacer for mobile bottom navigation */}
      <div className="h-20 lg:hidden" />
    </>
  );
};

export default Header;