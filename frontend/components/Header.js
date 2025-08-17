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
  TagIcon,
  StarIcon,
  GiftIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { 
  ChevronDownIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import BottomNavigation from './BottomNavigation';
import CartDrawer from './cart/CartDrawer';
import { CompactSearchBar } from './SearchBar';
import ThemeToggle from './ui/ThemeToggle';
import useAuthStore from '../lib/stores/authStore';
import useCartStore from '../lib/stores/cartStore';
import useWishlistStore from '../lib/stores/wishlistStore';

const Header = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPromoVisible, setIsPromoVisible] = useState(true);

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
      {/* Magical Sticky Header Container */}
      <div className="fixed top-0 left-0 right-0 z-50">
        {/* Animated Promotional Banner */}
        {isPromoVisible && (
          <div className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white overflow-hidden">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)]"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)]"></div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute top-2 left-10 animate-float">
              <StarIcon className="w-3 h-3 text-yellow-300" />
            </div>
            <div className="absolute top-1 right-20 animate-float" style={{ animationDelay: '1s' }}>
              <SparklesIcon className="w-3 h-3 text-pink-300" />
            </div>
            
            <div className="container-custom relative z-10">
              <div className="flex items-center justify-between py-2.5 sm:py-3">
                <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-6">
                  <div className="flex items-center space-x-2 sm:space-x-3 group cursor-pointer">
                    <div className="relative">
                      <TruckIcon className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute -inset-1 bg-white/20 rounded-full blur-sm group-hover:bg-white/30 transition-all duration-300"></div>
                    </div>
                    <span className="hidden sm:inline text-sm font-medium">Free shipping on orders over ৳1000</span>
                    <span className="sm:hidden text-xs font-medium">Free shipping over ৳1000</span>
                  </div>
                  
                  <div className="hidden lg:flex items-center space-x-4">
                    <div className="w-1 h-4 bg-white/30 rounded-full"></div>
                    <div className="flex items-center space-x-2 group cursor-pointer">
                      <QuestionMarkCircleIcon className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-sm font-medium group-hover:text-yellow-200 transition-colors">Track Order</span>
                    </div>
                    <div className="w-1 h-4 bg-white/30 rounded-full"></div>
                    <div className="flex items-center space-x-2 group cursor-pointer">
                      <GiftIcon className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-sm font-medium group-hover:text-yellow-200 transition-colors">Gift Cards</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
                  {!isAuthenticated ? (
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Link href="/login" className="text-white/90 hover:text-white transition-colors text-xs sm:text-sm font-medium hover:scale-105 transform duration-200">
                        Login
                      </Link>
                      <div className="w-px h-4 bg-white/30"></div>
                      <Link href="/register" className="text-white/90 hover:text-white transition-colors text-xs sm:text-sm font-medium hover:scale-105 transform duration-200">
                        Register
                      </Link>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="text-white/90 text-xs sm:text-sm font-medium">Welcome, {user?.name || 'User'}</span>
                    </div>
                  )}
                  
                  {/* Enhanced Theme Toggle */}
                  <div className="flex items-center space-x-2">
                    <ThemeToggle 
                      variant="simple" 
                      size="sm" 
                      className="text-white hover:text-yellow-200 transition-colors duration-300"
                    />
                    
                    {/* Close Promo Button */}
                    <button 
                      onClick={() => setIsPromoVisible(false)}
                      className="p-1 sm:p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-300 hover:scale-110 group"
                      aria-label="Close promotional banner"
                    >
                      <XMarkIcon className="w-3 h-3 sm:w-4 sm:h-4 text-white group-hover:rotate-90 transition-transform duration-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Header with Glassmorphism */}
        <header className={`relative backdrop-blur-xl transition-all duration-500 ${
          isScrolled 
            ? 'bg-white/80 dark:bg-dark-bg-navbar/90 shadow-2xl border-b border-white/20 dark:border-dark-border-primary/30' 
            : 'bg-white/60 dark:bg-dark-bg-navbar/80 shadow-lg'
        }`}>
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-50/50 via-pink-50/50 to-blue-50/50 dark:from-dark-gradient-primary dark:via-dark-gradient-secondary dark:to-dark-gradient-accent opacity-30 dark:opacity-20"></div>
          
          <div className="container-custom relative z-10 py-2.5 sm:py-3 md:py-4">
            <div className="flex items-center justify-between">
              {/* Enhanced Logo with Hover Effects */}
              <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group flex-shrink-0 min-w-0">
                <div className="relative">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-glow group-hover:shadow-glow-accent transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3">
                    <span className="text-white font-bold text-lg sm:text-xl">SR</span>
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-br from-violet-500/30 via-purple-500/30 to-fuchsia-600/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                </div>
                <div className="block min-w-0 flex-1">
                  {/* Clean, mobile-optimized brand name */}
                  <h1 className="text-base sm:text-lg md:text-2xl font-bold bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-600 bg-clip-text text-transparent group-hover:from-violet-700 group-hover:via-purple-700 group-hover:to-fuchsia-700 transition-all duration-300 leading-tight">
                    <span className="block sm:hidden">SR Beauty</span>
                    <span className="hidden sm:block md:hidden">Shohanis Beauty</span>
                    <span className="hidden md:block">Shohanis Reflection</span>
                  </h1>
                  <p className="hidden sm:block text-xs sm:text-sm text-gray-500 font-medium leading-tight">
                    <span className="sm:hidden md:block">Premium Beauty & Skincare</span>
                  </p>
                </div>
              </Link>

              {/* Enhanced Search Bar */}
              <div className="hidden lg:flex flex-1 max-w-2xl mx-12">
                <div className="relative w-full group">
                  <CompactSearchBar 
                    onSearch={handleSearch}
                    placeholder="Search for products, brands, categories..."
                    className="w-full"
                    variant="enhanced"
                    showQuickCategories={true}
                    showSearchHistory={true}
                    showPopularSearches={true}
                  />
                  {/* Search Bar Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-fuchsia-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10"></div>
                </div>
              </div>

              {/* Right Side Actions with Enhanced Design */}
              <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                {/* Theme Showcase Link */}
                <Link href="/theme-showcase" className="hidden md:flex relative p-3 text-gray-600 dark:text-dark-text-secondary hover:text-purple-600 dark:hover:text-dark-accent-primary transition-all duration-300 group">
                  <div className="relative">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">T</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                  </div>
                </Link>
                
                {/* Wishlist with Hover Effects */}
                <Link href="/wishlist" className="hidden md:flex relative p-3 text-gray-600 dark:text-dark-text-secondary hover:text-purple-600 dark:hover:text-dark-accent-secondary transition-all duration-300 group">
                  <div className="relative">
                    <HeartIcon className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                  </div>
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-glow animate-pulse">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Enhanced User Menu */}
                <div className="hidden md:block relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-3 p-3 text-gray-600 dark:text-dark-text-secondary hover:text-purple-600 dark:hover:text-dark-accent-primary transition-all duration-300 group rounded-2xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:bg-dark-surface-hover"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-glow group-hover:shadow-glow-accent transition-all duration-300 transform group-hover:scale-110">
                        {isAuthenticated && user?.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={user.name} 
                            className="w-10 h-10 rounded-2xl object-cover"
                          />
                        ) : (
                          <UserIcon className="w-6 h-6 text-white" />
                        )}
                      </div>
                      {isAuthenticated && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 border-2 border-white rounded-full shadow-glow animate-pulse"></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/30 to-purple-600/30 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                    </div>
                  </button>

                  {/* Enhanced User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-3 w-72 bg-white/90 dark:bg-dark-bg-modal/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 dark:border-dark-border-primary/30 z-50 animate-fade-in-down">
                      <div className="p-6">
                        {isAuthenticated ? (
                          <div className="space-y-4">
                            <div className="flex items-center space-x-4 pb-4 border-b border-gray-200/50 dark:border-dark-border-divider/50">
                              <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-glow">
                                {user?.avatar ? (
                                  <img 
                                    src={user.avatar} 
                                    alt={user.name} 
                                    className="w-14 h-14 rounded-2xl object-cover"
                                  />
                                ) : (
                                  <UserIcon className="w-8 h-8 text-white" />
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 dark:text-dark-text-primary text-lg">{user?.name || 'User'}</p>
                                <p className="text-sm text-gray-500 dark:text-dark-text-tertiary">{user?.email || 'user@example.com'}</p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Link href="/account" className="flex items-center space-x-3 p-3 rounded-2xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300 text-gray-700 hover:text-purple-600 group">
                                <div className="w-10 h-10 bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                  <UserIcon className="w-5 h-5 text-purple-600" />
                                </div>
                                <span className="font-medium">My Account</span>
                              </Link>
                              <Link href="/orders" className="flex items-center space-x-3 p-3 rounded-2xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300 text-gray-700 hover:text-purple-600 group">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                  <ShoppingBagIcon className="w-5 h-5 text-blue-600" />
                                </div>
                                <span className="font-medium">My Orders</span>
                              </Link>
                              <Link href="/wishlist" className="flex items-center space-x-3 p-3 rounded-2xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300 text-gray-700 hover:text-purple-600 group">
                                <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                  <HeartIcon className="w-5 h-5 text-pink-600" />
                                </div>
                                <span className="font-medium">Wishlist</span>
                              </Link>
                              <Link href="/settings" className="flex items-center space-x-3 p-3 rounded-2xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300 text-gray-700 hover:text-purple-600 group">
                                <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-slate-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                  <Cog6ToothIcon className="w-5 h-5 text-gray-600" />
                                </div>
                                <span className="font-medium">Settings</span>
                              </Link>
                            </div>
                            <div className="pt-4 border-t border-gray-200/50">
                              <button
                                onClick={handleLogout}
                                className="flex items-center space-x-3 w-full p-3 rounded-2xl hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-300 text-red-600 hover:text-red-700 group"
                              >
                                <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                  <ArrowRightOnRectangleIcon className="w-5 h-5 text-red-600" />
                                </div>
                                <span className="font-medium">Sign Out</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <p className="text-gray-600 text-center py-2 font-medium">Welcome! Please sign in to continue.</p>
                            <div className="space-y-3">
                              <Link href="/login" className="block w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white text-center py-3 px-6 rounded-2xl font-semibold hover:from-violet-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-glow hover:shadow-glow-accent">
                                Sign In
                              </Link>
                              <Link href="/register" className="block w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-center py-3 px-6 rounded-2xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-300 transform hover:scale-105">
                                Create Account
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced Cart Button */}
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2.5 sm:p-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-2xl hover:from-violet-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-glow hover:shadow-glow-accent group"
                >
                  <ShoppingBagIcon className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform duration-300" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-glow animate-bounce">
                      {cartItemsCount > 99 ? '99+' : cartItemsCount}
                    </span>
                  )}
                  {/* Button Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500/30 to-purple-600/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10"></div>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Search Bar - Only visible on mobile */}
        <div className="lg:hidden bg-white/80 backdrop-blur-sm border-b border-gray-100/50">
          <div className="container-custom py-3">
            <CompactSearchBar 
              onSearch={handleSearch}
              placeholder="Search products..."
              variant="mobile"
              showQuickCategories={false}
              showSearchHistory={true}
              showPopularSearches={true}
            />
          </div>
        </div>

        {/* Enhanced Category Navigation Bar */}
        <div className={`relative backdrop-blur-lg transition-all duration-500 ${
          isScrolled 
            ? 'bg-white/70 shadow-lg border-b border-white/20' 
            : 'bg-white/50 shadow-md'
        }`}>
          <div className="container-custom">
            <nav className="flex items-center justify-between py-3 sm:py-4 overflow-x-auto scrollbar-hide">
              <div className="flex items-center space-x-6 lg:space-x-8 xl:space-x-12">
                <Link 
                  href="/products" 
                  className="flex items-center space-x-2 sm:space-x-3 text-gray-700 dark:text-dark-text-secondary hover:text-purple-600 dark:hover:text-dark-accent-primary font-medium transition-all duration-300 whitespace-nowrap group"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-glow group-hover:shadow-glow-accent transition-all duration-300 transform group-hover:scale-110">
                    <ShoppingBagIcon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <span className="text-sm sm:text-base group-hover:scale-105 transition-transform duration-300">All Products</span>
                </Link>
                
                <Link 
                  href="/category/skincare" 
                  className="flex items-center space-x-2 sm:space-x-3 text-gray-700 dark:text-dark-text-secondary hover:text-purple-600 dark:hover:text-dark-accent-primary font-medium transition-all duration-300 whitespace-nowrap group"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center shadow-glow group-hover:shadow-glow-accent transition-all duration-300 transform group-hover:scale-110">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full"></div>
                  </div>
                  <span className="text-sm sm:text-base group-hover:scale-105 transition-transform duration-300">Skincare</span>
                </Link>
                
                <Link 
                  href="/category/makeup" 
                  className="flex items-center space-x-2 sm:space-x-3 text-gray-700 hover:text-purple-600 font-medium transition-all duration-300 whitespace-nowrap group"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl flex items-center justify-center shadow-glow group-hover:shadow-glow-accent transition-all duration-300 transform group-hover:scale-110">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full"></div>
                  </div>
                  <span className="text-sm sm:text-base group-hover:scale-105 transition-transform duration-300">Makeup</span>
                </Link>
                
                <Link 
                  href="/category/haircare" 
                  className="flex items-center space-x-2 sm:space-x-3 text-gray-700 hover:text-purple-600 font-medium transition-all duration-300 whitespace-nowrap group"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-glow group-hover:shadow-glow-accent transition-all duration-300 transform group-hover:scale-110">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full"></div>
                  </div>
                  <span className="text-sm sm:text-base group-hover:scale-105 transition-transform duration-300">Hair Care</span>
                </Link>
                
                <Link 
                  href="/category/perfume" 
                  className="flex items-center space-x-2 sm:space-x-3 text-gray-700 hover:text-purple-600 font-medium transition-all duration-300 whitespace-nowrap group"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-glow group-hover:shadow-glow-accent transition-all duration-300 transform group-hover:scale-110">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full"></div>
                  </div>
                  <span className="text-sm sm:text-base group-hover:scale-105 transition-transform duration-300">Perfume</span>
                </Link>
                
                <Link 
                  href="/category/bodycare" 
                  className="flex items-center space-x-2 sm:space-x-3 text-gray-700 hover:text-purple-600 font-medium transition-all duration-300 whitespace-nowrap group"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-green-400 to-teal-500 rounded-xl flex items-center justify-center shadow-glow group-hover:shadow-glow-accent transition-all duration-300 transform group-hover:scale-110">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full"></div>
                  </div>
                  <span className="text-sm sm:text-base group-hover:scale-105 transition-transform duration-300">Body Care</span>
                </Link>
                
                <Link 
                  href="/offers" 
                  className="flex items-center space-x-2 sm:space-x-3 text-gray-700 hover:text-purple-600 font-medium transition-all duration-300 whitespace-nowrap group"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-glow group-hover:shadow-glow-accent transition-all duration-300 transform group-hover:scale-110">
                    <SparklesIcon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <span className="text-sm sm:text-base group-hover:scale-105 transition-transform duration-300">Offers</span>
                </Link>
                
                <Link 
                  href="/new-arrivals" 
                  className="flex items-center space-x-2 sm:space-x-3 text-gray-700 hover:text-purple-600 font-medium transition-all duration-300 whitespace-nowrap group"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center shadow-glow group-hover:shadow-glow-accent transition-all duration-300 transform group-hover:scale-110">
                    <TagIcon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <span className="text-sm sm:text-base group-hover:scale-105 transition-transform duration-300">New Arrivals</span>
                </Link>
              </div>
              
              <Link 
                href="/flash-sale" 
                className="flex items-center space-x-2 sm:space-x-3 text-white font-bold transition-all duration-300 whitespace-nowrap group ml-4 sm:ml-8"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-glow group-hover:shadow-glow-accent transition-all duration-300 transform group-hover:scale-110 animate-pulse">
                  <FireIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <span className="text-sm sm:text-base group-hover:scale-105 transition-transform duration-300">Flash Sale</span>
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

      {/* Spacer for fixed header - Updated height */}
      <div className={`transition-all duration-500 ${isPromoVisible ? 'h-64' : 'h-56'}`} />
      
      {/* Bottom spacer for mobile bottom navigation */}
      <div className="h-20 lg:hidden" />
    </>
  );
};

export default Header;