"use client";

import { useState } from 'react';
import ProductCard from './ProductCard';
import { StarIcon, SparklesIcon, FireIcon, ArrowUpIcon } from '@heroicons/react/24/solid';
import { useFeaturedProducts, useCategories } from '../lib/apiServices';
import { NetworkError, EmptyState } from './ui/ErrorBoundary';
import { LoadingSkeleton } from './ui/LoadingSpinner';
import { ShoppingBagIcon, FunnelIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';

// Fallback data for when API is not available
const fallbackProducts = [
  {
    id: 1,
    name: "Trader Joe's Daily Facial Sunscreen (50 ML)",
    description: "Trader Joe's Daily Facial Sunscreen have you forgoing your daily dose of necessary SPF.",
    selling_price: 2150.00,
    original_price: 2500.00,
    image: "http://127.0.0.1:8000/images/products/sunscreen.svg",
    category: "Sunscreen",
    rating: 4.5,
    review_count: 128,
    is_new: true,
    is_featured: false,
    is_best_seller: false,
    stock_quantity: 45,
    slug: "trader-joes-daily-facial-sunscreen"
  },
  {
    id: 2,
    name: "Neutrogena Clear Face Oil Free Sunscreen SPF 50 (88 ml)",
    description: "Enjoy the sun breakout-free with this Neutrogena Clear Face Oil-Free Sunscreen SPF 50. Featuring a lightweight and oxybenzone-free formula, this non-comedogenic face sunscreen won't clog pores.",
    selling_price: 2350.00,
    original_price: 2800.00,
    image: "http://127.0.0.1:8000/images/products/cleanser.svg",
    category: "Sunscreen",
    rating: 4.8,
    review_count: 256,
    is_new: false,
    is_featured: true,
    is_best_seller: true,
    stock_quantity: 32,
    slug: "neutrogena-clear-face-spf-50"
  },
  {
    id: 3,
    name: "Neutrogena Clear Face Oil Free Sunscreen SPF 30 (88 ml)",
    description: "Enjoy the sun breakout-free with this Neutrogena Clear Face Oil-Free Sunscreen SPF 30. Featuring a lightweight and oxybenzone-free formula, this non-comedogenic face sunscreen won't clog pores.",
    selling_price: 2150.00,
    original_price: 2500.00,
    image: "http://127.0.0.1:8000/images/products/moisturizer.svg",
    category: "Sunscreen",
    rating: 4.6,
    review_count: 189,
    is_new: true,
    is_featured: false,
    is_best_seller: false,
    stock_quantity: 28,
    slug: "neutrogena-clear-face-spf-30"
  },
  {
    id: 4,
    name: "Neutrogena Ultra Sheer Dry Touch Sunscreen SPF 70 (88 ml)",
    description: "Protect your skin with our SPF 70 Ultra Sheer Dry-Touch Sunscreen, defending your skin from harmful UV rays without the signature heaviness and grease of other sunscreens.",
    selling_price: 2150.00,
    original_price: 2500.00,
    image: "http://127.0.0.1:8000/images/products/face-mask.svg",
    category: "Sunscreen",
    rating: 4.7,
    review_count: 203,
    is_new: false,
    is_featured: true,
    is_best_seller: true,
    stock_quantity: 38,
    slug: "neutrogena-ultra-sheer-spf-70"
  }
];

export default function FeaturedProducts() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  // Fetch data from API
  const { data: featuredProductsData, isLoading: productsLoading, error: productsError, refetch: refetchProducts } = useFeaturedProducts();
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError, refetch: refetchCategories } = useCategories();

  // Use fallback data if API is not available or returns no data
  const products = Array.isArray(featuredProductsData?.data) && featuredProductsData.data.length > 0 
    ? featuredProductsData.data 
    : Array.isArray(featuredProductsData) && featuredProductsData.length > 0 
    ? featuredProductsData 
    : fallbackProducts;
    
  const categories = Array.isArray(categoriesData?.data) && categoriesData.data.length > 0 
    ? [{ id: 'all', name: 'All Products' }, ...categoriesData.data] 
    : Array.isArray(categoriesData) && categoriesData.length > 0 
    ? [{ id: 'all', name: 'All Products' }, ...categoriesData]
    : [{ id: 'all', name: 'All Products' }, { id: 'sunscreen', name: 'Sunscreen' }, { id: 'cleanser', name: 'Cleanser' }, { id: 'moisturizer', name: 'Moisturizer' }];

  // Only show error if we have no fallback data
  const hasProducts = products && products.length > 0;
  const hasCategories = categories && categories.length > 0;

  const filteredProducts = Array.isArray(products) ? products.filter(product => {
    if (selectedCategory === 'all') return true;
    // Handle both API data structure and fallback data
    const productCategory = product.category?.name || product.category;
    return productCategory?.toLowerCase() === selectedCategory;
  }) : [];

  const sortedProducts = Array.isArray(filteredProducts) ? [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return (a.selling_price || a.price || 0) - (b.selling_price || b.price || 0);
      case 'price-high':
        return (b.selling_price || b.price || 0) - (a.selling_price || a.price || 0);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'newest':
        return (b.is_new || b.isNew || false) - (a.is_new || a.isNew || false);
      default:
        return 0;
    }
  }) : [];

  // Debug logging
  console.log('FeaturedProducts Debug:', {
    featuredProductsData,
    categoriesData,
    products,
    categories,
    productsLoading,
    categoriesLoading,
    productsError,
    categoriesError
  });

  // Background pattern SVG
  const backgroundPattern = "data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ed7516%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";

  // Loading state
  if (productsLoading || categoriesLoading) {
    return (
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
        <div className="container-custom">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-100 to-accent-100 px-4 py-2 rounded-full mb-6">
              <SparklesIcon className="w-5 h-5 text-primary-600" />
              <span className="text-sm font-semibold text-primary-700">Premium Collection</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Featured Products
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4 sm:px-0 leading-relaxed">
              Discover our most popular and highly-rated beauty and skincare products, carefully curated for your radiant beauty journey
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {Array.from({ length: 8 }).map((_, index) => (
              <LoadingSkeleton key={index} type="card" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state - only show if no fallback data
  if ((productsError || categoriesError) && (!hasProducts || !hasCategories)) {
    return (
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
        <div className="container-custom">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-100 to-accent-100 px-4 py-2 rounded-full mb-6">
              <SparklesIcon className="w-5 h-5 text-primary-600" />
              <span className="text-sm font-semibold text-primary-700">Premium Collection</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Featured Products
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4 sm:px-0 leading-relaxed">
              Discover our most popular and highly-rated beauty and skincare products, carefully curated for your radiant beauty journey
            </p>
          </div>
          <div className="space-y-4">
            {productsError && <NetworkError onRetry={refetchProducts} />}
            {categoriesError && <NetworkError onRetry={refetchCategories} />}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-gray-50 via-white to-purple-50/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23a855f7%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
      
      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full mb-6 animate-fade-in-up">
            <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-purple-700">Premium Collection</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Featured Products
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4 sm:px-0 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            Discover our most popular and highly-rated beauty and skincare products, carefully curated for your radiant beauty journey
          </p>
        </div>

        {/* Enhanced Filters and Sorting */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/30 shadow-soft p-8 mb-12 sm:mb-16 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            {/* Category Filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 w-full lg:w-auto">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-semibold text-gray-700">Category:</span>
              </div>
              <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 whitespace-nowrap ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-glow transform scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105 hover:shadow-soft'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sorting */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 w-full lg:w-auto">
              <div className="flex items-center space-x-2">
                <ArrowsUpDownIcon className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-semibold text-gray-700">Sort by:</span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 text-sm bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 hover:border-gray-300 shadow-soft w-full sm:w-auto"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {sortedProducts.map((product, index) => (
            <div 
              key={product.id} 
              className="animate-fade-in-up"
              style={{ animationDelay: `${0.8 + index * 0.1}s` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Enhanced View All Button */}
        <div className="text-center animate-fade-in-up" style={{ animationDelay: '1.2s' }}>
          <button className="group relative inline-flex items-center space-x-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 px-8 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-glow focus:ring-4 focus:ring-purple-500/20 focus:outline-none">
            <span>View All Products</span>
            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <ArrowUpIcon className="w-3 h-3 text-white" />
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}