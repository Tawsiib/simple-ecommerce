"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  CurrencyDollarIcon,
  TagIcon,
  StarIcon,
  ClockIcon,
  FireIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { apiClient } from '../../lib/api';
import LoadingSpinner from '../ui/LoadingSpinner';

const AdvancedSearch = ({ onSearch }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category_id: '',
    brand_id: '',
    price_min: '',
    price_max: '',
    rating: '',
    in_stock: false,
    featured: false,
    sort_by: 'relevance',
    sort_order: 'desc'
  });
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    // Load initial data from URL params
    const urlSearchTerm = searchParams.get('q') || '';
    const urlCategory = searchParams.get('category') || '';
    const urlBrand = searchParams.get('brand') || '';
    const urlPriceMin = searchParams.get('price_min') || '';
    const urlPriceMax = searchParams.get('price_max') || '';
    const urlRating = searchParams.get('rating') || '';
    const urlSortBy = searchParams.get('sort_by') || 'relevance';
    const urlSortOrder = searchParams.get('sort_order') || 'desc';

    setSearchTerm(urlSearchTerm);
    setFilters({
      category_id: urlCategory,
      brand_id: urlBrand,
      price_min: urlPriceMin,
      price_max: urlPriceMax,
      rating: urlRating,
      in_stock: searchParams.get('in_stock') === 'true',
      featured: searchParams.get('featured') === 'true',
      sort_by: urlSortBy,
      sort_order: urlSortOrder
    });

    // Load categories and brands
    fetchCategories();
    fetchBrands();
    loadSearchHistory();
    loadPopularSearches();
  }, [searchParams]);

  useEffect(() => {
    // Handle click outside suggestions
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await apiClient.get('/brands');
      if (response.data.success) {
        setBrands(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch brands:', error);
    }
  };

  const loadSearchHistory = () => {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    setSearchHistory(history.slice(0, 5)); // Keep only last 5 searches
  };

  const loadPopularSearches = async () => {
    try {
      const response = await apiClient.get('/search/popular');
      if (response.data.success) {
        setPopularSearches(response.data.data);
      }
    } catch (error) {
      // Fallback to default popular searches
      setPopularSearches([
        'skincare', 'makeup', 'hair care', 'fragrance', 'beauty tools'
      ]);
    }
  };

  const saveSearchHistory = (term) => {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    const newHistory = [term, ...history.filter(item => item !== term)].slice(0, 10);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    setSearchHistory(newHistory.slice(0, 5));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    saveSearchHistory(searchTerm);
    performSearch();
  };

  const performSearch = () => {
    const params = new URLSearchParams();
    
    if (searchTerm.trim()) params.set('q', searchTerm.trim());
    if (filters.category_id) params.set('category', filters.category_id);
    if (filters.brand_id) params.set('brand', filters.brand_id);
    if (filters.price_min) params.set('price_min', filters.price_min);
    if (filters.price_max) params.set('price_max', filters.price_max);
    if (filters.rating) params.set('rating', filters.rating);
    if (filters.in_stock) params.set('in_stock', 'true');
    if (filters.featured) params.set('featured', 'true');
    if (filters.sort_by !== 'relevance') params.set('sort_by', filters.sort_by);
    if (filters.sort_order !== 'desc') params.set('sort_order', filters.sort_order);

    // Navigate to search results
    const searchUrl = `/search?${params.toString()}`;
    router.push(searchUrl);

    // Close mobile filters
    setIsOpen(false);

    // Call onSearch callback if provided
    if (onSearch) {
      onSearch({
        searchTerm: searchTerm.trim(),
        filters,
        params: params.toString()
      });
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category_id: '',
      brand_id: '',
      price_min: '',
      price_max: '',
      rating: '',
      in_stock: false,
      featured: false,
      sort_by: 'relevance',
      sort_order: 'desc'
    });
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchSuggestions([]);
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    performSearch();
  };

  const handleHistoryClick = (term) => {
    setSearchTerm(term);
    performSearch();
  };

  const handlePopularClick = (term) => {
    setSearchTerm(term);
    performSearch();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category_id) count++;
    if (filters.brand_id) count++;
    if (filters.price_min || filters.price_max) count++;
    if (filters.rating) count++;
    if (filters.in_stock) count++;
    if (filters.featured) count++;
    if (filters.sort_by !== 'relevance') count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="w-full">
      {/* Enhanced Search Bar */}
      <div className="relative">
        <form onSubmit={handleSearch} className="relative">
          <div className="relative group">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search for products, brands, categories..."
              className="w-full pl-12 pr-24 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-soft hover:shadow-medium"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-20 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-300"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-primary-500 to-accent-500 text-white px-6 py-2.5 rounded-xl hover:from-primary-600 hover:to-accent-600 focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 shadow-glow hover:shadow-glow-accent"
            >
              Search
            </button>
          </div>
        </form>

        {/* Enhanced Search Suggestions */}
        {showSuggestions && searchTerm && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-large z-50 max-h-96 overflow-y-auto"
          >
            {/* Search History */}
            {searchHistory.length > 0 && (
              <div className="p-4 border-b border-gray-100/50">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center">
                  <ClockIcon className="h-3 w-3 mr-2" />
                  Recent Searches
                </h4>
                <div className="space-y-1">
                  {searchHistory.map((term, index) => (
                    <button
                      key={index}
                      onClick={() => handleHistoryClick(term)}
                      className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-primary-50/50 hover:to-accent-50/50 rounded-xl flex items-center transition-all duration-300 group"
                    >
                      <MagnifyingGlassIcon className="h-4 w-4 mr-3 text-gray-400 group-hover:text-primary-500 transition-colors" />
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches */}
            {popularSearches.length > 0 && (
              <div className="p-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center">
                  <FireIcon className="h-3 w-3 mr-2" />
                  Popular Searches
                </h4>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term, index) => (
                    <button
                      key={index}
                      onClick={() => handlePopularClick(term)}
                      className="px-4 py-2 text-sm bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full hover:from-primary-100 hover:to-accent-100 hover:text-primary-700 transition-all duration-300 font-medium hover:scale-105 transform"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Filter Toggle Button */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-3 px-6 py-3 border-2 border-gray-200 rounded-2xl hover:bg-gradient-to-r hover:from-primary-50/50 hover:to-accent-50/50 focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 group hover:scale-105 transform"
        >
          <div className="w-5 h-5 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <FunnelIcon className="h-3 w-3 text-white" />
          </div>
          <span className="font-medium text-gray-700 group-hover:text-primary-600 transition-colors">Advanced Filters</span>
          {activeFiltersCount > 0 && (
            <span className="bg-gradient-to-r from-primary-500 to-accent-500 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-glow">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-600 hover:text-primary-600 underline font-medium hover:scale-105 transform transition-all duration-300"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {isOpen && (
        <div className="mt-6 p-6 bg-white/95 backdrop-blur-sm border-2 border-gray-200/50 rounded-2xl shadow-medium">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <TagIcon className="h-4 w-4 mr-2 text-primary-500" />
                Category
              </label>
              <select
                value={filters.category_id}
                onChange={(e) => handleFilterChange('category_id', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-gray-300"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <SparklesIcon className="h-4 w-4 mr-2 text-accent-500" />
                Brand
              </label>
              <select
                value={filters.brand_id}
                onChange={(e) => handleFilterChange('brand_id', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-gray-300"
              >
                <option value="">All Brands</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <CurrencyDollarIcon className="h-4 w-4 mr-2 text-green-500" />
                Price Range
              </label>
              <div className="flex space-x-3">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.price_min}
                  onChange={(e) => handleFilterChange('price_min', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                />
                <span className="text-gray-500 self-center font-medium">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.price_max}
                  onChange={(e) => handleFilterChange('price_max', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <StarIcon className="h-4 w-4 mr-2 text-yellow-500" />
                Minimum Rating
              </label>
              <select
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-gray-300"
              >
                <option value="">Any Rating</option>
                <option value="4">4+ Stars ⭐⭐⭐⭐</option>
                <option value="3">3+ Stars ⭐⭐⭐</option>
                <option value="2">2+ Stars ⭐⭐</option>
                <option value="1">1+ Stars ⭐</option>
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2 text-purple-500" />
                Sort By
              </label>
              <select
                value={filters.sort_by}
                onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-gray-300"
              >
                <option value="relevance">Relevance</option>
                <option value="name">Name (A-Z)</option>
                <option value="price">Price (Low-High)</option>
                <option value="rating">Rating (High-Low)</option>
                <option value="created_at">Newest First</option>
                <option value="popularity">Most Popular</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2 text-indigo-500" />
                Sort Order
              </label>
              <select
                value={filters.sort_order}
                onChange={(e) => handleFilterChange('sort_order', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-gray-300"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>

          {/* Enhanced Checkbox Filters */}
          <div className="mt-8 flex flex-wrap gap-6">
            <label className="flex items-center space-x-3 group cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={filters.in_stock}
                  onChange={(e) => handleFilterChange('in_stock', e.target.checked)}
                  className="h-5 w-5 text-primary-600 focus:ring-4 focus:ring-primary-500/20 border-2 border-gray-300 rounded-lg transition-all duration-300"
                />
                <div className="absolute inset-0 rounded-lg ring-0 group-hover:ring-2 group-hover:ring-primary-500/20 transition-all duration-300"></div>
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-primary-600 transition-colors">In Stock Only</span>
            </label>

            <label className="flex items-center space-x-3 group cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={filters.featured}
                  onChange={(e) => handleFilterChange('featured', e.target.checked)}
                  className="h-5 w-5 text-accent-600 focus:ring-4 focus:ring-accent-500/20 border-2 border-gray-300 rounded-lg transition-all duration-300"
                />
                <div className="absolute inset-0 rounded-lg ring-0 group-hover:ring-2 group-hover:ring-accent-500/20 transition-all duration-300"></div>
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-accent-600 transition-colors">Featured Products</span>
            </label>
          </div>

          {/* Enhanced Apply Filters Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={performSearch}
              className="px-8 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-2xl hover:from-primary-600 hover:to-accent-600 focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 shadow-glow hover:shadow-glow-accent font-semibold"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;

