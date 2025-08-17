"use client";

import { useState, useRef, useEffect } from 'react';
import { 
  XMarkIcon, 
  TagIcon,
  FireIcon,
  ClockIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useSearchProducts } from '../lib/apiServices';
import LoadingSpinner from './ui/LoadingSpinner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SearchBar({ 
  className = '', 
  placeholder = 'Search for products...',
  showResults = true,
  onSearch = null,
  variant = 'default', // 'default', 'compact', 'mobile', 'enhanced'
  showQuickCategories = true,
  showSearchHistory = true,
  showPopularSearches = true
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const [showCategories, setShowCategories] = useState(false);
  const [categories, setCategories] = useState([]);
  const searchRef = useRef(null);
  const router = useRouter();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Load search history and popular searches
  useEffect(() => {
    loadSearchHistory();
    loadPopularSearches();
    if (showQuickCategories) {
      loadCategories();
    }
  }, [showQuickCategories]);

  // Search products using API
  const { data: searchResults, isLoading, error } = useSearchProducts(debouncedQuery, {
    limit: variant === 'mobile' ? 6 : 8
  });

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowCategories(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load search history from localStorage
  const loadSearchHistory = () => {
    try {
      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      setSearchHistory(history.slice(0, 5));
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  };

  // Load popular searches
  const loadPopularSearches = async () => {
    try {
      // This would typically come from an API
      setPopularSearches([
        'skincare', 'makeup', 'hair care', 'fragrance', 'beauty tools',
        'anti-aging', 'sunscreen', 'moisturizer', 'cleanser', 'serum'
      ]);
    } catch (error) {
      console.error('Failed to load popular searches:', error);
    }
  };

  // Load categories
  const loadCategories = async () => {
    try {
      // This would typically come from an API
      setCategories([
        { id: 'skincare', name: 'Skincare', icon: '🧴', color: 'from-blue-400 to-purple-500' },
        { id: 'makeup', name: 'Makeup', icon: '💄', color: 'from-pink-400 to-rose-500' },
        { id: 'haircare', name: 'Hair Care', icon: '💇‍♀️', color: 'from-yellow-400 to-orange-500' },
        { id: 'fragrance', name: 'Fragrance', icon: '🌸', color: 'from-purple-400 to-indigo-500' },
        { id: 'bodycare', name: 'Body Care', icon: '🛁', color: 'from-green-400 to-teal-500' },
        { id: 'tools', name: 'Beauty Tools', icon: '✨', color: 'from-amber-400 to-yellow-500' }
      ]);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  // Save search to history
  const saveSearchHistory = (searchTerm) => {
    try {
      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      const newHistory = [searchTerm, ...history.filter(item => item !== searchTerm)].slice(0, 10);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      setSearchHistory(newHistory.slice(0, 5));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  };

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      saveSearchHistory(query.trim());
      if (onSearch) {
        onSearch(query);
      } else {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
      setIsOpen(false);
      setShowCategories(false);
    }
  };

  // Handle result selection
  const handleResultClick = (product) => {
    router.push(`/product/${product.slug || product.id}`);
    setIsOpen(false);
    setQuery('');
  };

  // Handle category selection
  const handleCategoryClick = (category) => {
    router.push(`/category/${category.id}`);
    setIsOpen(false);
    setShowCategories(false);
  };

  // Handle search history click
  const handleHistoryClick = (term) => {
    setQuery(term);
    saveSearchHistory(term);
    if (onSearch) {
      onSearch(term);
    } else {
      router.push(`/search?q=${encodeURIComponent(term)}`);
    }
    setIsOpen(false);
  };

  // Handle popular search click
  const handlePopularClick = (term) => {
    setQuery(term);
    saveSearchHistory(term);
    if (onSearch) {
      onSearch(term);
    } else {
      router.push(`/search?q=${encodeURIComponent(term)}`);
    }
    setIsOpen(false);
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setIsOpen(false);
    setShowCategories(false);
  };

  const hasResults = searchResults?.data && searchResults.data.length > 0;
  const searchData = searchResults?.data || [];
  const showSearchResults = showResults && isOpen && (query.trim().length > 0);
  const showQuickAccess = isOpen && !query.trim() && (showSearchHistory || showPopularSearches || showQuickCategories);

  // Get variant-specific styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return {
          input: "w-full pl-12 pr-12 py-3 text-sm bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-2xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 hover:border-purple-300 shadow-soft hover:shadow-medium focus:shadow-glow",
          icon: "w-6 h-6",
          iconSize: "h-4 w-4",
          clearButton: "w-6 h-6",
          categoryButton: "px-3 py-2 text-xs"
        };
      case 'mobile':
        return {
          input: "w-full pl-4 pr-12 py-3 text-sm bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 hover:border-gray-300 shadow-soft",
          icon: "w-6 h-6",
          iconSize: "h-4 w-4",
          clearButton: "w-6 h-6",
          categoryButton: "px-3 py-2 text-xs"
        };
      case 'enhanced':
        return {
          input: "w-full pl-4 pr-12 py-4 text-base bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 hover:border-gray-300 shadow-soft hover:shadow-medium",
          icon: "w-8 h-8",
          iconSize: "h-5 w-5",
          clearButton: "w-8 h-8",
          categoryButton: "px-4 py-3 text-sm"
        };
      default:
        return {
          input: "w-full pl-12 pr-12 py-3 sm:py-4 text-sm sm:text-base bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 hover:border-gray-300 shadow-soft hover:shadow-medium",
          icon: "w-6 h-6",
          iconSize: "h-4 w-4",
          clearButton: "w-6 h-6",
          categoryButton: "px-4 py-3 text-sm"
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      {/* Enhanced Search Input */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative group">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowCategories(false);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className={styles.input}
          />
          
          {/* Enhanced Clear Button */}
          {query && variant !== 'mobile' && (
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

          {/* Enhanced Focus Ring Effect */}
          <div className="absolute inset-0 rounded-2xl ring-0 group-focus-within:ring-4 group-focus-within:ring-primary-500/20 transition-all duration-300 pointer-events-none"></div>
        </div>
      </form>

      {/* Enhanced Search Results and Quick Access Dropdown */}
      {(showSearchResults || showQuickAccess) && (
        <div className={`absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-xl border border-white/30 rounded-2xl shadow-large z-50 max-h-96 overflow-y-auto ${
          variant === 'mobile' ? 'max-h-80' : ''
        }`}>
          
          {/* Quick Access Section */}
          {showQuickAccess && (
            <div className="p-4">
              {/* Quick Categories */}
              {showQuickCategories && categories.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center">
                    <TagIcon className="h-3 w-3 mr-2" />
                    Quick Categories
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryClick(category)}
                        className={`${styles.categoryButton} bg-gradient-to-r ${category.color} text-white rounded-xl font-medium hover:scale-105 transition-all duration-300 shadow-glow hover:shadow-glow-accent flex items-center justify-center space-x-2`}
                      >
                        <span className="text-lg">{category.icon}</span>
                        <span className="hidden sm:inline">{category.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search History */}
              {showSearchHistory && searchHistory.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center">
                    <ClockIcon className="h-3 w-3 mr-2" />
                    Recent Searches
                  </h4>
                  <div className="space-y-1">
                    {searchHistory.map((term, index) => (
                      <button
                        key={index}
                        onClick={() => handleHistoryClick(term)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-primary-50/50 hover:to-accent-50/50 rounded-lg flex items-center transition-all duration-300 group"
                      >
                        {/* <MagnifyingGlassIcon className="h-4 w-4 mr-3 text-gray-400 group-hover:text-primary-500 transition-colors" /> */}
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches */}
              {showPopularSearches && popularSearches.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center">
                    <FireIcon className="h-3 w-3 mr-2" />
                    Popular Searches
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((term, index) => (
                      <button
                        key={index}
                        onClick={() => handlePopularClick(term)}
                        className="px-3 py-2 text-xs bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full hover:from-primary-100 hover:to-accent-100 hover:text-primary-700 transition-all duration-300 font-medium"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Search Results Section */}
          {showSearchResults && (
            <>
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
                  {searchData.map((product, index) => (
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
                              {/* <SparklesIcon className={`${variant === 'mobile' ? 'h-5 w-5' : 'h-6 w-6'} text-gray-400`} /> */}
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
                      <span>View all {searchResults?.total || searchData.length} results</span>
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
                    {/* <SparklesIcon className="h-8 w-8 text-gray-400" /> */}
                  </div>
                  <p className="text-sm text-gray-600 font-medium mb-2">No products found for "{query}"</p>
                  <p className="text-xs text-gray-500">Try different keywords or browse our categories</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Enhanced compact search bar for mobile/header use
export function CompactSearchBar({ 
  className = '', 
  onSearch = null, 
  placeholder = "Search products...",
  variant = 'compact', // 'compact', 'mobile', 'enhanced'
  showQuickCategories = true,
  showSearchHistory = true,
  showPopularSearches = true
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const [categories, setCategories] = useState([]);
  const router = useRouter();

  // Load data on mount
  useEffect(() => {
    loadSearchHistory();
    loadPopularSearches();
    if (showQuickCategories) {
      loadCategories();
    }
  }, [showQuickCategories]);

  // Load search history from localStorage
  const loadSearchHistory = () => {
    try {
      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      setSearchHistory(history.slice(0, 5));
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  };

  // Load popular searches
  const loadPopularSearches = async () => {
    try {
      setPopularSearches([
        'skincare', 'makeup', 'hair care', 'fragrance', 'beauty tools'
      ]);
    } catch (error) {
      console.error('Failed to load popular searches:', error);
    }
  };

  // Load categories
  const loadCategories = async () => {
    try {
      setCategories([
        { id: 'skincare', name: 'Skincare', icon: '🧴', color: 'from-blue-400 to-purple-500' },
        { id: 'makeup', name: 'Makeup', icon: '💄', color: 'from-pink-400 to-rose-500' },
        { id: 'haircare', name: 'Hair Care', icon: '💇‍♀️', color: 'from-yellow-400 to-orange-500' },
        { id: 'fragrance', name: 'Fragrance', icon: '🌸', color: 'from-purple-400 to-indigo-500' }
      ]);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  // Save search to history
  const saveSearchHistory = (searchTerm) => {
    try {
      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      const newHistory = [searchTerm, ...history.filter(item => item !== searchTerm)].slice(0, 10);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      setSearchHistory(newHistory.slice(0, 5));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      saveSearchHistory(query.trim());
      if (onSearch) {
        onSearch(query);
      } else {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
      setIsOpen(false);
    }
  };

  // Handle category selection
  const handleCategoryClick = (category) => {
    router.push(`/category/${category.id}`);
    setIsOpen(false);
  };

  // Handle search history click
  const handleHistoryClick = (term) => {
    setQuery(term);
    saveSearchHistory(term);
    if (onSearch) {
      onSearch(term);
    } else {
      router.push(`/search?q=${encodeURIComponent(term)}`);
    }
    setIsOpen(false);
  };

  // Handle popular search click
  const handlePopularClick = (term) => {
    setQuery(term);
    saveSearchHistory(term);
    if (onSearch) {
      onSearch(term);
    } else {
      router.push(`/search?q=${encodeURIComponent(term)}`);
    }
    setIsOpen(false);
  };

  // Get variant-specific styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'mobile':
        return {
          input: "w-full pl-12 pr-12 py-3 text-sm bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 hover:border-gray-300 shadow-soft",
          icon: "w-6 h-6",
          iconSize: "h-4 w-4",
          clearButton: "w-6 h-6",
          categoryButton: "px-3 py-2 text-xs"
        };
      case 'enhanced':
        return {
          input: "w-full pl-14 pr-14 py-4 text-base bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 hover:border-gray-300 shadow-soft hover:shadow-medium",
          icon: "w-8 h-8",
          iconSize: "h-5 w-5",
          clearButton: "w-8 h-8",
          categoryButton: "px-4 py-3 text-sm"
        };
      default: // compact
        return {
          input: "w-full pl-14 pr-14 py-4 text-base bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-2xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 hover:border-purple-300 shadow-soft hover:shadow-medium focus:shadow-glow",
          icon: "w-8 h-8",
          iconSize: "h-5 w-5",
          clearButton: "w-8 h-8",
          categoryButton: "px-3 py-2 text-xs"
        };
    }
  };

  const styles = getVariantStyles();
  const showQuickAccess = isOpen && !query.trim() && (showSearchHistory || showPopularSearches || showQuickCategories);

  return (
    <div className={`relative ${className}`}>
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
          
          {/* Search Button - Always visible for better UX */}
          <button
            type="submit"
            className="absolute inset-y-0 right-0 pr-4 flex items-center group/search"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg flex items-center justify-center transition-all duration-300 group-hover/search:scale-110 shadow-glow">
              <MagnifyingGlassIcon className="w-4 h-4 text-white" />
            </div>
          </button>
          
          {/* Enhanced Focus Ring Effect */}
          <div className="absolute inset-0 rounded-2xl ring-0 group-focus-within:ring-4 group-focus-within:ring-violet-500/20 transition-all duration-300 pointer-events-none"></div>
        </div>
      </form>

      {/* Quick Access Dropdown */}
      {showQuickAccess && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-xl border border-white/30 rounded-2xl shadow-large z-50 max-h-80 overflow-y-auto">
          <div className="p-4">
            {/* Quick Categories */}
            {showQuickCategories && categories.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center">
                  <TagIcon className="h-3 w-3 mr-2" />
                  Quick Categories
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category)}
                      className={`${styles.categoryButton} bg-gradient-to-r ${category.color} text-white rounded-xl font-medium hover:scale-105 transition-all duration-300 shadow-glow hover:shadow-glow-accent flex items-center justify-center space-x-2`}
                    >
                      <span className="text-lg">{category.icon}</span>
                      <span className="hidden sm:inline">{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search History */}
            {showSearchHistory && searchHistory.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center">
                  <ClockIcon className="h-3 w-3 mr-2" />
                  Recent Searches
                </h4>
                <div className="space-y-1">
                  {searchHistory.map((term, index) => (
                    <button
                      key={index}
                      onClick={() => handleHistoryClick(term)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-primary-50/50 hover:to-accent-50/50 rounded-lg flex items-center transition-all duration-300 group"
                    >
                      {/* <MagnifyingGlassIcon className="h-4 w-4 mr-3 text-gray-400 group-hover:text-primary-500 transition-colors" /> */}
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches */}
            {showPopularSearches && popularSearches.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center">
                  <FireIcon className="h-3 w-3 mr-2" />
                  Popular Searches
                </h4>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term, index) => (
                    <button
                      key={index}
                      onClick={() => handlePopularClick(term)}
                      className="px-3 py-2 text-xs bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full hover:from-primary-100 hover:to-accent-100 hover:text-primary-700 transition-all duration-300 font-medium"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
