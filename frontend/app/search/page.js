'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import AdvancedSearch from '../../components/search/AdvancedSearch.js';
import ProductCard from '../../components/ProductCard.js';
import LoadingSpinner from '../../components/ui/LoadingSpinner.js';
import { apiClient } from '../../lib/api';

const SearchResultsContent = () => {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeFilters, setActiveFilters] = useState({});
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const searchTerm = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const brand = searchParams.get('brand') || '';
    const priceMin = searchParams.get('price_min') || '';
    const priceMax = searchParams.get('price_max') || '';
    const rating = searchParams.get('rating') || '';
    const inStock = searchParams.get('in_stock') === 'true';
    const featured = searchParams.get('featured') === 'true';
    const sortBy = searchParams.get('sort_by') || 'relevance';
    const sortOrder = searchParams.get('sort_order') || 'desc';

    setActiveFilters({
      searchTerm,
      category,
      brand,
      priceMin,
      priceMax,
      rating,
      inStock,
      featured,
      sortBy,
      sortOrder
    });

    setCurrentPage(1);
    performSearch({
      searchTerm,
      category,
      brand,
      priceMin,
      priceMax,
      rating,
      inStock,
      featured,
      sortBy,
      sortOrder
    }, 1);
  }, [searchParams]);

  const performSearch = async (filters, page = 1) => {
    setIsLoading(true);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        ...(filters.searchTerm && { q: filters.searchTerm }),
        ...(filters.category && { category_id: filters.category }),
        ...(filters.brand && { brand_id: filters.brand }),
        ...(filters.priceMin && { price_min: filters.priceMin }),
        ...(filters.priceMax && { price_max: filters.priceMax }),
        ...(filters.rating && { rating: filters.rating }),
        ...(filters.inStock && { in_stock: 'true' }),
        ...(filters.featured && { featured: 'true' }),
        ...(filters.sortBy !== 'relevance' && { sort_by: filters.sortBy }),
        ...(filters.sortOrder !== 'desc' && { sort_order: filters.sortOrder })
      });

      const response = await apiClient.get(`/search?${params.toString()}`);
      
      if (response.data.success) {
        setProducts(response.data.data);
        setTotalResults(response.data.meta.total);
        setTotalPages(response.data.meta.last_page);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setProducts([]);
      setTotalResults(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page) => {
    performSearch(activeFilters, page);
  };

  const handleSearch = (searchData) => {
    setActiveFilters({
      searchTerm: searchData.searchTerm,
      category: searchData.filters.category_id,
      brand: searchData.filters.brand_id,
      priceMin: searchData.filters.price_min,
      priceMax: searchData.filters.price_max,
      rating: searchData.filters.rating,
      inStock: searchData.filters.in_stock,
      featured: searchData.filters.featured,
      sortBy: searchData.filters.sort_by,
      sortOrder: searchData.filters.sort_order
    });
  };

  const getFilterSummary = () => {
    const summary = [];
    
    if (activeFilters.searchTerm) {
      summary.push(`"${activeFilters.searchTerm}"`);
    }
    if (activeFilters.category) {
      const categoryName = getCategoryName(activeFilters.category);
      if (categoryName) summary.push(categoryName);
    }
    if (activeFilters.brand) {
      const brandName = getBrandName(activeFilters.brand);
      if (brandName) summary.push(brandName);
    }
    if (activeFilters.priceMin || activeFilters.priceMax) {
      const priceRange = [];
      if (activeFilters.priceMin) priceRange.push(`৳${activeFilters.priceMin}`);
      if (activeFilters.priceMax) priceRange.push(`৳${activeFilters.priceMax}`);
      summary.push(`Price: ${priceRange.join(' - ')}`);
    }
    if (activeFilters.rating) {
      summary.push(`${activeFilters.rating}+ Stars`);
    }
    if (activeFilters.inStock) {
      summary.push('In Stock Only');
    }
    if (activeFilters.featured) {
      summary.push('Featured Products');
    }

    return summary;
  };

  const getCategoryName = (categoryId) => {
    // This would typically come from a categories store or API
    // For now, we'll return the ID
    return categoryId;
  };

  const getBrandName = (brandId) => {
    // This would typically come from a brands store or API
    // For now, we'll return the ID
    return brandId;
  };

  const clearAllFilters = () => {
    // Navigate to search without filters
    const searchUrl = activeFilters.searchTerm ? `/search?q=${activeFilters.searchTerm}` : '/search';
    window.location.href = searchUrl;
  };

  if (isLoading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Search Results
            {activeFilters.searchTerm && (
              <span className="text-gray-600 font-normal"> for "{activeFilters.searchTerm}"</span>
            )}
          </h1>
          
          {totalResults > 0 && (
            <p className="text-gray-600">
              {totalResults} product{totalResults !== 1 ? 's' : ''} found
            </p>
          )}

          {/* Active Filters Summary */}
          {getFilterSummary().length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500">Active filters:</span>
              {getFilterSummary().map((filter, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-rose-100 text-rose-800"
                >
                  {filter}
                </span>
              ))}
              <button
                onClick={clearAllFilters}
                className="text-sm text-rose-600 hover:text-rose-800 underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full flex items-center justify-center px-6 py-4 border-2 border-gray-200 rounded-2xl bg-white/95 backdrop-blur-sm hover:bg-gradient-to-r hover:from-primary-50/50 hover:to-accent-50/50 focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 group"
          >
            <div className="w-6 h-6 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
              <FunnelIcon className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-gray-700 group-hover:text-primary-600 transition-colors">
              {showMobileFilters ? 'Hide Filters' : 'Show Advanced Filters'}
            </span>
          </button>
        </div>

        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Desktop Filters */}
          <div className="hidden lg:block">
            <div className="sticky top-8">
              <AdvancedSearch onSearch={handleSearch} />
            </div>
          </div>

          {/* Mobile Filters */}
          {showMobileFilters && (
            <div className="lg:hidden mb-6">
              <AdvancedSearch onSearch={handleSearch} />
            </div>
          )}

          {/* Search Results */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search criteria or browse our categories.
                </p>
                <div className="mt-6">
                  <button
                    onClick={clearAllFilters}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                  >
                    Browse All Products
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Results Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Enhanced Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                    <div className="text-sm text-gray-700 text-center sm:text-left">
                      Showing page {currentPage} of {totalPages}
                      <span className="block sm:inline sm:ml-2 text-gray-500">
                        ({totalResults} total products)
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-3 text-sm font-medium text-gray-500 bg-white/95 backdrop-blur-sm border-2 border-gray-200 rounded-xl hover:bg-gradient-to-r hover:from-primary-50/50 hover:to-accent-50/50 hover:text-primary-600 hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-500/20"
                      >
                        ← Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-3 text-sm font-medium text-gray-500 bg-white/95 backdrop-blur-sm border-2 border-gray-200 rounded-xl hover:bg-gradient-to-r hover:from-primary-50/50 hover:to-accent-50/50 hover:text-primary-600 hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-500/20"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SearchResults = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
};

export default SearchResults;

