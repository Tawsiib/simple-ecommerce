"use client";

import { useState, useRef, useEffect } from 'react';
import { 
  XMarkIcon, 
  TagIcon,
  FireIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

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
  const searchRef = useRef(null);
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
          input: "w-full pl-4 pr-12 py-3 text-sm bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 hover:border-gray-300 shadow-soft",
          icon: "w-6 h-6",
          iconSize: "h-4 w-4",
          clearButton: "w-6 h-6",
          categoryButton: "px-3 py-2 text-xs"
        };
      case 'enhanced':
        return {
          input: "w-full pl-4 pr-14 py-4 text-base bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 hover:border-gray-300 shadow-soft hover:shadow-medium",
          icon: "w-8 h-8",
          iconSize: "h-5 w-5",
          clearButton: "w-8 h-8",
          categoryButton: "px-4 py-3 text-sm"
        };
      default: // compact
        return {
          input: "w-full pl-4 pr-14 py-4 text-base bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-2xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 hover:border-purple-300 shadow-soft hover:shadow-medium focus:shadow-glow",
          icon: "w-8 h-8",
          iconSize: "h-5 w-5",
          clearButton: "w-8 h-8",
          categoryButton: "px-3 py-2 text-xs"
        };
    }
  };

  const styles = getVariantStyles();
  const showQuickAccess = isOpen && !query.trim() && (showSearchHistory || showPopularSearches || showQuickCategories);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={searchRef}>
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
            className={`${styles.input} [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [&::-webkit-search-results-button]:hidden [&::-webkit-search-results-decoration]:hidden`}
            style={{ 
              backgroundImage: 'none',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'left center',
              backgroundSize: 'auto'
            }}
          />
          
          {/* Category Toggle Button - More Subtle Design */}
          {showQuickCategories && (
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center group/category"
            >
              <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg flex items-center justify-center transition-all duration-300 group-hover/category:scale-110 border border-slate-200 dark:border-slate-600">
                <TagIcon className="h-4 w-4 text-slate-600 dark:text-slate-400 group-hover/category:text-purple-600 dark:group-hover/category:text-purple-400" />
              </div>
            </button>
          )}
          
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
