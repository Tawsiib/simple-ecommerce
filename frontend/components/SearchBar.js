"use client";

import { useState, useRef, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSearchProducts } from '../lib/apiServices';
import { LoadingSpinner } from './ui/LoadingSpinner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SearchBar({ 
  className = '', 
  placeholder = 'Search for products...',
  showResults = true,
  onSearch = null 
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
    limit: 8
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

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      {/* Search Input */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          />
          
          {/* Search Icon */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>

          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
            </button>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showSearchResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Loading State */}
          {isLoading && (
            <div className="p-4 text-center">
              <LoadingSpinner size="sm" />
              <p className="text-sm text-gray-500 mt-2">Searching...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-4 text-center">
              <p className="text-sm text-red-500">Failed to load search results</p>
            </div>
          )}

          {/* Search Results */}
          {!isLoading && !error && hasResults && (
            <div className="py-2">
              {searchResults.data.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleResultClick(product)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    {/* Product Image */}
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 rounded-lg flex items-center justify-center">
                          <span className="text-xs text-gray-500">No Image</span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">
                        {product.category?.name || product.category}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm font-semibold text-primary-600">
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
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-yellow-500">★</span>
                        <span className="text-xs text-gray-600">{product.rating}</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}

              {/* View All Results */}
              <div className="px-4 py-3 border-t border-gray-200">
                <Link
                  href={`/search?q=${encodeURIComponent(query.trim())}`}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  View all {searchResults.total || searchResults.data.length} results →
                </Link>
              </div>
            </div>
          )}

          {/* No Results */}
          {!isLoading && !error && !hasResults && query.trim().length > 0 && (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-500">No products found for "{query}"</p>
              <p className="text-xs text-gray-400 mt-1">Try different keywords or browse categories</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Compact search bar for mobile/header use
export function CompactSearchBar({ className = '', onSearch = null }) {
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
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
        className="w-full pl-8 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
      <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
    </form>
  );
}
