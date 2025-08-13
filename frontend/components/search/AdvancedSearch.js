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
  StarIcon
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
      {/* Search Bar */}
      <div className="relative">
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search for products, brands, categories..."
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-16 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-rose-600 text-white px-3 py-1.5 rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* Search Suggestions */}
        {showSuggestions && searchTerm && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          >
            {/* Search History */}
            {searchHistory.length > 0 && (
              <div className="p-3 border-b border-gray-100">
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Recent Searches
                </h4>
                <div className="space-y-1">
                  {searchHistory.map((term, index) => (
                    <button
                      key={index}
                      onClick={() => handleHistoryClick(term)}
                      className="w-full text-left px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center"
                    >
                      <MagnifyingGlassIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches */}
            {popularSearches.length > 0 && (
              <div className="p-3 border-b border-gray-100">
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Popular Searches
                </h4>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term, index) => (
                    <button
                      key={index}
                      onClick={() => handlePopularClick(term)}
                      className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
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

      {/* Filter Toggle Button */}
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-colors"
        >
          <FunnelIcon className="h-5 w-5" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="bg-rose-600 text-white text-xs px-2 py-1 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {isOpen && (
        <div className="mt-4 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category_id}
                onChange={(e) => handleFilterChange('category_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand
              </label>
              <select
                value={filters.brand_id}
                onChange={(e) => handleFilterChange('brand_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.price_min}
                  onChange={(e) => handleFilterChange('price_min', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                />
                <span className="text-gray-500 self-center">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.price_max}
                  onChange={(e) => handleFilterChange('price_max', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Rating
              </label>
              <select
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              >
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
                <option value="1">1+ Stars</option>
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sort_by}
                onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              >
                <option value="relevance">Relevance</option>
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="rating">Rating</option>
                <option value="created_at">Newest</option>
                <option value="popularity">Popularity</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort Order
              </label>
              <select
                value={filters.sort_order}
                onChange={(e) => handleFilterChange('sort_order', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>

          {/* Checkbox Filters */}
          <div className="mt-6 flex flex-wrap gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.in_stock}
                onChange={(e) => handleFilterChange('in_stock', e.target.checked)}
                className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">In Stock Only</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.featured}
                onChange={(e) => handleFilterChange('featured', e.target.checked)}
                className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Featured Products</span>
            </label>
          </div>

          {/* Apply Filters Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={performSearch}
              className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-colors"
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

