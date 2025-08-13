'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Bars3Icon, 
  XMarkIcon, 
  ShoppingBagIcon, 
  HeartIcon,
  UserIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { 
  ChevronDownIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import MobileNavigation from './MobileNavigation';
import CartDrawer from './cart/CartDrawer';
import { CompactSearchBar } from './SearchBar';
import useAuthStore from '../lib/stores/authStore';
import useCartStore from '../lib/stores/cartStore';
import useWishlistStore from '../lib/stores/wishlistStore';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
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

  // Handle search expansion on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSearchExpanded(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
    setIsSearchExpanded(false);
  };

  const cartItemsCount = summary?.itemsCount || 0;

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-xl shadow-large border-b border-white/20' 
          : 'bg-white/90 backdrop-blur-md'
      }`}>
        <div className="container-custom">
          {/* Main Header Row */}
          <div className="flex items-center justify-between h-18 lg:h-24">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0 mr-8 lg:mr-12">
              <Link href="/" className="flex items-center space-x-2 lg:space-x-3 group">
                <div className="relative">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-600 rounded-xl flex items-center justify-center shadow-glow group-hover:shadow-glow-accent transition-all duration-300">
                    <span className="text-white font-bold text-lg lg:text-xl">SR</span>
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                </div>
                <span className="hidden sm:block text-lg lg:text-2xl font-bold text-gradient-primary group-hover:text-gradient-accent transition-all duration-300">
                  Shohanis Reflection
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8 xl:space-x-10">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-primary-600 font-medium transition-all duration-300 relative group"
              >
                Home
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500 group-hover:w-full transition-all duration-300"></div>
              </Link>
              <Link 
                href="/products" 
                className="text-gray-700 hover:text-primary-600 font-medium transition-all duration-300 relative group"
              >
                Products
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500 group-hover:w-full transition-all duration-300"></div>
              </Link>
              <Link 
                href="/categories" 
                className="text-gray-700 hover:text-primary-600 font-medium transition-all duration-300 relative group"
              >
                Categories
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500 group-hover:w-full transition-all duration-300"></div>
              </Link>
              <Link 
                href="/brands" 
                className="text-gray-700 hover:text-primary-600 font-medium transition-all duration-300 relative group"
              >
                Brands
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500 group-hover:w-full transition-all duration-300"></div>
              </Link>
              <Link 
                href="/about" 
                className="text-gray-700 hover:text-primary-600 font-medium transition-all duration-300 relative group"
              >
                About
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500 group-hover:w-full transition-all duration-300"></div>
              </Link>
              <Link 
                href="/contact" 
                className="text-gray-700 hover:text-primary-600 font-medium transition-all duration-300 relative group"
              >
                Contact
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500 group-hover:w-full transition-all duration-300"></div>
              </Link>
            </nav>

            {/* Search Bar - Enhanced with responsive behavior */}
            <div className={`flex-1 max-w-xl lg:max-w-2xl mx-6 lg:mx-8 transition-all duration-300 ${
              isSearchExpanded ? 'block' : 'hidden md:block'
            }`}>
              <CompactSearchBar 
                onSearch={handleSearch}
                className="w-full"
                placeholder="Search products..."
              />
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3 lg:space-x-6">
              {/* Mobile Search Toggle */}
              <button
                onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                className="md:hidden p-2 text-gray-700 hover:text-primary-600 transition-colors"
                aria-label="Toggle search"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>

              {/* Wishlist */}
              <Link 
                href="/wishlist"
                className="relative p-2.5 lg:p-3 text-gray-700 hover:text-primary-600 transition-all duration-300 group"
              >
                <div className="w-5 h-5 lg:w-6 lg:h-6 group-hover:scale-110 transition-transform duration-300">
                  <HeartIcon className="h-full w-full" />
                </div>
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-primary-500 to-accent-500 text-white text-xs rounded-full h-4 w-4 lg:h-5 lg:w-5 flex items-center justify-center font-semibold shadow-glow">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 lg:p-3 text-gray-700 hover:text-primary-600 transition-all duration-300 group"
              >
                <div className="w-5 h-5 lg:w-6 lg:h-6 group-hover:scale-110 transition-transform duration-300">
                  <ShoppingBagIcon className="h-full w-full" />
                </div>
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-primary-500 to-accent-500 text-white text-xs rounded-full h-4 w-4 lg:h-5 lg:w-5 flex items-center justify-center font-semibold shadow-glow">
                    {cartItemsCount > 99 ? '99+' : cartItemsCount}
                  </span>
                )}
              </button>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative user-menu" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2.5 lg:p-3 text-gray-700 hover:text-rose-600 transition-colors rounded-lg hover:bg-gray-100"
                  >
                    <div className="w-7 h-7 lg:w-8 lg:h-8 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {user?.initials || user?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="hidden lg:block text-sm font-medium">{user?.name}</span>
                    <ChevronDownIcon className="hidden lg:block h-4 w-4" />
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-fade-in-down">
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <UserIcon className="h-4 w-4 mr-3" />
                        Profile
                      </Link>
                      <Link
                        href="/orders"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <ShoppingBagIcon className="h-4 w-4 mr-3" />
                        Orders
                      </Link>
                      <Link
                        href="/wishlist"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <HeartIcon className="h-4 w-4 mr-3" />
                        Wishlist
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Cog6ToothIcon className="h-4 w-4 mr-3" />
                        Settings
                      </Link>
                      <hr className="my-2" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3 lg:space-x-4">
                  <Link
                    href="/login"
                    className="hidden sm:block text-gray-700 hover:text-rose-600 font-medium transition-colors text-sm lg:text-base px-3 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-4 py-2.5 lg:px-5 lg:py-3 rounded-lg font-medium hover:from-rose-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 text-sm lg:text-base shadow-soft hover:shadow-medium"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2.5 text-gray-700 hover:text-rose-600 transition-colors"
                aria-label="Open mobile menu"
              >
                <Bars3Icon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Mobile Search Bar - Shows below header when expanded */}
          {isSearchExpanded && (
            <div className="md:hidden pb-6 pt-2 animate-fade-in-down">
              <CompactSearchBar 
                onSearch={handleSearch}
                className="w-full"
                placeholder="Search products..."
              />
            </div>
          )}
        </div>
      </header>

      {/* Mobile Navigation */}
      <MobileNavigation 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* Cart Drawer */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />

      {/* Spacer for fixed header */}
      <div className={`transition-all duration-300 ${
        isSearchExpanded ? 'h-40 md:h-18 lg:h-24' : 'h-18 lg:h-24'
      }`} />
    </>
  );
};

export default Header;