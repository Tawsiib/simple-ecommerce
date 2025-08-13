"use client";

import { useState, useRef, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useSearchProducts } from '../lib/apiServices';
import LoadingSpinner from './ui/LoadingSpinner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SearchBar({ 
  className = '', 
  placeholder = 'Search for products...',
  showResults = true,
  onSearch = null,
  variant = 'default' // 'default', 'compact', 'mobile'
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const searchRef = useRef(null);
  const router = useRouter();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Search products using API
  const { data: searchResults, isLoading, error } = useSearchProducts(debouncedQuery, {
    limit: variant === 'mobile' ? 6 : 8
  });

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query);
      } else {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
      setIsOpen(false);
    }
  };

  // Handle result selection
  const handleResultClick = (product) => {
    router.push(`/product/${product.slug || product.id}`);
    setIsOpen(false);
    setQuery('');
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setIsOpen(false);
  };

  const hasResults = searchResults?.data && searchResults.data.length > 0;
  const showSearchResults = showResults && isOpen && (query.trim().length > 0);

  // Variant-specific styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return {
          input: "w-full pl-10 pr-10 py-2.5 text-sm bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 hover:border-gray-300 shadow-soft",
          icon: "w-5 h-5",
          iconSize: "h-3 w-3",
          clearButton: "w-5 h-5"
        };
      case 'mobile':
        return {
          input: "w-full pl-12 pr-12 py-3 text-sm bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 hover:border-gray-300 shadow-soft",
          icon: "w-6 h-6",
          iconSize: "h-4 w-4",
          clearButton: "w-6 h-6"
        };
      default:
        return {
          input: "w-full pl-12 pr-12 py-3 sm:py-4 text-sm sm:text-base bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 hover:border-gray-300 shadow-soft hover:shadow-medium",
          icon: "w-6 h-6",
          iconSize: "h-4 w-4",
          clearButton: "w-6 h-6"
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      {/* Search Input */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative group">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className={styles.input}
          />
          
          {/* Search Icon */}
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <div className={`${styles.icon} bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center`}>
              <MagnifyingGlassIcon className={`${styles.iconSize} text-white`} />
            </div>
          </div>

          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-4 flex items-center group/clear"
            >
              <div className={`${styles.clearButton} bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-all duration-300 group-hover/clear:scale-110`}>
                <XMarkIcon className={`${styles.iconSize} text-gray-500 group-hover/clear:text-gray-700`} />
              </div>
            </button>
          )}

          {/* Focus Ring Effect */}
          <div className="absolute inset-0 rounded-2xl ring-0 group-focus-within:ring-4 group-focus-within:ring-primary-500/20 transition-all duration-300 pointer-events-none"></div>
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showSearchResults && (
        <div className={`absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-xl border border-white/30 rounded-2xl shadow-large z-50 max-h-96 overflow-y-auto ${
          variant === 'mobile' ? 'max-h-80' : ''
        }`}>
          {/* Loading State */}
          {isLoading && (
            <div className="p-6 text-center">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-gray-600 mt-3 font-medium">Searching for amazing products...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <XMarkIcon className="h-6 w-6 text-red-500" />
              </div>
              <p className="text-sm text-red-600 font-medium">Failed to load search results</p>
              <p className="text-xs text-gray-500 mt-1">Please try again later</p>
            </div>
          )}

          {/* Search Results */}
          {!isLoading && !error && hasResults && (
            <div className="py-3">
              {searchResults.data.map((product, index) => (
                <button
                  key={product.id}
                  onClick={() => handleResultClick(product)}
                  className="w-full px-4 py-4 text-left hover:bg-gradient-to-r hover:from-primary-50/50 hover:to-accent-50/50 transition-all duration-300 border-b border-gray-100/50 last:border-b-0 group"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center space-x-3 lg:space-x-4">
                    {/* Product Image */}
                    <div className={`${variant === 'mobile' ? 'w-12 h-12' : 'w-14 h-14'} bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex-shrink-0 overflow-hidden shadow-soft group-hover:shadow-medium transition-all duration-300`}>
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center">
                          <SparklesIcon className={`${variant === 'mobile' ? 'h-5 w-5' : 'h-6 w-6'} text-gray-400`} />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className={`${variant === 'mobile' ? 'text-sm' : 'text-sm lg:text-base'} font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors`}>
                        {product.name}
                      </h4>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {product.category?.name || product.category}
                      </p>
                      <div className="flex items-center space-x-3 mt-2">
                        <span className="text-sm font-bold text-gradient-primary">
                          ৳{product.selling_price || product.price || 0}
                        </span>
                        {product.original_price && product.original_price > (product.selling_price || product.price) && (
                          <span className="text-xs text-gray-400 line-through">
                            ৳{product.original_price}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Rating */}
                    {product.rating && (
                      <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-50 to-orange-50 px-2 py-1 rounded-lg">
                        <span className="text-xs text-yellow-500">★</span>
                        <span className="text-xs text-gray-700 font-medium">{product.rating}</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}

              {/* View All Results */}
              <div className="px-4 py-4 border-t border-gray-100/50">
                <Link
                  href={`/search?q=${encodeURIComponent(query.trim())}`}
                  className="inline-flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700 font-semibold group"
                >
                  <span>View all {searchResults.total || searchResults.data.length} results</span>
                  <div className="w-4 h-4 bg-primary-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-xs">→</span>
                  </div>
                </Link>
              </div>
            </div>
          )}

          {/* No Results */}
          {!isLoading && !error && !hasResults && query.trim().length > 0 && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <SparklesIcon className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 font-medium mb-2">No products found for "{query}"</p>
              <p className="text-xs text-gray-500">Try different keywords or browse our categories</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Compact search bar for mobile/header use
export function CompactSearchBar({ className = '', onSearch = null, placeholder = "Search products..." }) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query);
      } else {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  return (
    <form onSubmit={handleSearch} className={`relative ${className}`}>
      <div className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3 lg:py-4 text-sm lg:text-base bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 hover:border-gray-300 shadow-soft hover:shadow-medium"
        />
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <div className="w-6 h-6 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
            <MagnifyingGlassIcon className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>
    </form>
  );
}

// Mobile-optimized search bar
export function MobileSearchBar({ className = '', onSearch = null, placeholder = "Search products..." }) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query);
      } else {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  return (
    <form onSubmit={handleSearch} className={`relative ${className}`}>
      <div className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3 text-base bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 hover:border-gray-300 shadow-soft"
        />
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <div className="w-6 h-6 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
            <MagnifyingGlassIcon className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>
    </form>
  );
}
