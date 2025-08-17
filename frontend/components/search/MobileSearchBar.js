"use client";

import { useState, useRef, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  XMarkIcon, 
  SparklesIcon,
  FireIcon,
  ClockIcon,
  TagIcon,
  ChevronDownIcon,
  AdjustmentsHorizontalIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

const MobileSearchBar = ({ 
  className = '', 
  onSearch = null, 
  placeholder = "Search products...",
  showQuickCategories = true,
  showSearchHistory = true,
  showPopularSearches = true,
  showFilters = true
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    priceRange: '',
    rating: '',
    inStock: false,
    featured: false
  });
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
      setShowFiltersPanel(false);
    }
  };

  // Handle category selection
  const handleCategoryClick = (category) => {
    router.push(`/category/${category.id}`);
    setIsOpen(false);
    setShowFiltersPanel(false);
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

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setIsOpen(false);
    setShowFiltersPanel(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowFiltersPanel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showQuickAccess = isOpen && !query.trim() && (showSearchHistory || showPopularSearches || showQuickCategories);

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      {/* Enhanced Mobile Search Input */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative group">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setShowFiltersPanel(false);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="w-full pl-14 pr-20 py-4 text-base bg-white/95 backdrop-blur-sm border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 hover:border-gray-300 shadow-soft"
          />
          
          {/* Enhanced Search Icon */}
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-glow group-hover:shadow-glow-accent transition-all duration-300 transform group-hover:scale-110">
              <MagnifyingGlassIcon className="h-5 w-5 text-white" />
            </div>
          </div>

          {/* Filters Toggle Button */}
          {showFilters && (
            <button
              type="button"
              onClick={() => {
                setShowFiltersPanel(!showFiltersPanel);
                setIsOpen(false);
              }}
              className="absolute inset-y-0 right-0 pr-16 flex items-center group/filter"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center transition-all duration-300 group-hover/filter:scale-110 shadow-glow">
                <FunnelIcon className="h-5 w-5 text-white" />
              </div>
            </button>
          )}

          {/* Enhanced Clear Button */}
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-4 flex items-center group/clear"
            >
              <div className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-all duration-300 group-hover/clear:scale-110">
                <XMarkIcon className="h-5 w-5 text-gray-500 group-hover/clear:text-gray-700" />
              </div>
            </button>
          )}

          {/* Enhanced Focus Ring Effect */}
          <div className="absolute inset-0 rounded-2xl ring-0 group-focus-within:ring-4 group-focus-within:ring-primary-500/20 transition-all duration-300 pointer-events-none"></div>
        </div>
      </form>

      {/* Quick Access Dropdown */}
      {showQuickAccess && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-xl border border-white/30 rounded-2xl shadow-large z-50 max-h-80 overflow-y-auto">
          <div className="p-4">
            {/* Quick Categories */}
            {showQuickCategories && categories.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center">
                  <TagIcon className="h-4 w-4 mr-2" />
                  Quick Categories
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category)}
                      className="px-4 py-4 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-2xl font-medium hover:scale-105 transition-all duration-300 shadow-glow hover:shadow-glow-accent flex items-center justify-center space-x-3"
                    >
                      <span className="text-2xl">{category.icon}</span>
                      <span className="text-sm">{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search History */}
            {showSearchHistory && searchHistory.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  Recent Searches
                </h4>
                <div className="space-y-2">
                  {searchHistory.map((term, index) => (
                    <button
                      key={index}
                      onClick={() => handleHistoryClick(term)}
                      className="w-full text-left px-4 py-3 text-base text-gray-700 hover:bg-gradient-to-r hover:from-primary-50/50 hover:to-accent-50/50 rounded-xl flex items-center transition-all duration-300 group"
                    >
                      <MagnifyingGlassIcon className="h-5 w-5 mr-3 text-gray-400 group-hover:text-primary-500 transition-colors" />
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches */}
            {showPopularSearches && popularSearches.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center">
                  <FireIcon className="h-4 w-4 mr-2" />
                  Popular Searches
                </h4>
                <div className="flex flex-wrap gap-3">
                  {popularSearches.map((term, index) => (
                    <button
                      key={index}
                      onClick={() => handlePopularClick(term)}
                      className="px-4 py-3 text-sm bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-primary-100 hover:to-accent-100 hover:text-primary-700 transition-all duration-300 font-medium hover:scale-105 transform"
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

      {/* Mobile Filters Panel */}
      {showFiltersPanel && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-xl border border-white/30 rounded-2xl shadow-large z-50">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">Quick Filters</h3>
            
            {/* Category Filter */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Price Range</label>
              <select
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
              >
                <option value="">Any Price</option>
                <option value="0-500">Under ৳500</option>
                <option value="500-1000">৳500 - ৳1000</option>
                <option value="1000-2000">৳1000 - ৳2000</option>
                <option value="2000+">Over ৳2000</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Minimum Rating</label>
              <select
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
              >
                <option value="">Any Rating</option>
                <option value="4">4+ Stars ⭐⭐⭐⭐</option>
                <option value="3">3+ Stars ⭐⭐⭐</option>
                <option value="2">2+ Stars ⭐⭐</option>
              </select>
            </div>

            {/* Checkbox Filters */}
            <div className="mb-8 space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                  className="h-5 w-5 text-primary-600 focus:ring-4 focus:ring-primary-500/20 border-2 border-gray-300 rounded-lg"
                />
                <span className="text-sm font-medium text-gray-700">In Stock Only</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={filters.featured}
                  onChange={(e) => handleFilterChange('featured', e.target.checked)}
                  className="h-5 w-5 text-accent-600 focus:ring-4 focus:ring-accent-500/20 border-2 border-gray-300 rounded-lg"
                />
                <span className="text-sm font-medium text-gray-700">Featured Products</span>
              </label>
            </div>

            {/* Apply Filters Button */}
            <button
              onClick={() => {
                setShowFiltersPanel(false);
                // Apply filters logic here
              }}
              className="w-full px-6 py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-2xl hover:from-primary-600 hover:to-accent-600 focus:outline-none focus:ring-4 focus:ring-primary-500/20 transition-all duration-300 transform hover:scale-105 shadow-glow hover:shadow-glow-accent font-semibold text-base"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileSearchBar;
