"use client";

import { useState } from 'react';
import ProductCard from './ProductCard';
import { StarIcon } from '@heroicons/react/24/solid';
import { useFeaturedProducts, useCategories } from '../lib/apiServices';
import { NetworkError, EmptyState } from './ui/ErrorBoundary';
import { LoadingSkeleton } from './ui/LoadingSpinner';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';

// Fallback data for when API is not available
const fallbackProducts = [
  {
    id: 1,
    name: "Trader Joe's Daily Facial Sunscreen (50 ML)",
    description: "Trader Joe's Daily Facial Sunscreen have you forgoing your daily dose of necessary SPF.",
    price: 2150.00,
    originalPrice: 2500.00,
    image: "/images/products/sunscreen-1.jpg",
    category: "Sunscreen",
    rating: 4.5,
    reviewCount: 128,
    isNew: true,
    isBestSeller: false,
    stock: 45
  },
  {
    id: 2,
    name: "Neutrogena Clear Face Oil Free Sunscreen SPF 50 (88 ml)",
    description: "Enjoy the sun breakout-free with this Neutrogena Clear Face Oil-Free Sunscreen SPF 50. Featuring a lightweight and oxybenzone-free formula, this non-comedogenic face sunscreen won't clog pores.",
    price: 2350.00,
    originalPrice: 2800.00,
    image: "/images/products/sunscreen-2.jpg",
    category: "Sunscreen",
    rating: 4.8,
    reviewCount: 256,
    isNew: false,
    isBestSeller: true,
    stock: 32
  },
  {
    id: 3,
    name: "Neutrogena Clear Face Oil Free Sunscreen SPF 30 (88 ml)",
    description: "Enjoy the sun breakout-free with this Neutrogena Clear Face Oil-Free Sunscreen SPF 30. Featuring a lightweight and oxybenzone-free formula, this non-comedogenic face sunscreen won't clog pores.",
    price: 2150.00,
    originalPrice: 2500.00,
    image: "/images/products/sunscreen-3.jpg",
    category: "Sunscreen",
    rating: 4.6,
    reviewCount: 189,
    isNew: true,
    isBestSeller: false,
    stock: 28
  },
  {
    id: 4,
    name: "Neutrogena Ultra Sheer Dry Touch Sunscreen SPF 70 (88 ml)",
    description: "Protect your skin with our SPF 70 Ultra Sheer Dry-Touch Sunscreen, defending your skin from harmful UV rays without the signature heaviness and grease of other sunscreens.",
    price: 2150.00,
    originalPrice: 2500.00,
    image: "/images/products/sunscreen-4.jpg",
    category: "Sunscreen",
    rating: 4.7,
    reviewCount: 203,
    isNew: false,
    isBestSeller: true,
    stock: 38
  }
];

export default function FeaturedProducts() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  // Fetch data from API
  const { data: featuredProductsData, isLoading: productsLoading, error: productsError, refetch: refetchProducts } = useFeaturedProducts();
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError, refetch: refetchCategories } = useCategories();

  // Use fallback data if API is not available
  const products = Array.isArray(featuredProductsData?.data) ? featuredProductsData.data : fallbackProducts;
  const categories = Array.isArray(categoriesData?.data) ? [{ id: 'all', name: 'All Products' }, ...categoriesData.data] : [];

  const filteredProducts = Array.isArray(products) ? products.filter(product => {
    if (selectedCategory === 'all') return true;
    // Handle both API data structure and fallback data
    const productCategory = product.category?.name || product.category;
    return productCategory?.toLowerCase() === selectedCategory;
  }) : [];

  const sortedProducts = Array.isArray(filteredProducts) ? [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return (a.price || a.selling_price || 0) - (b.price || b.selling_price || 0);
      case 'price-high':
        return (b.price || b.selling_price || 0) - (a.price || a.selling_price || 0);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'newest':
        return (b.is_new || b.isNew || false) - (a.is_new || a.isNew || false);
      default:
        return 0;
    }
  }) : [];

  // Loading state
  if (productsLoading || categoriesLoading) {
    return (
      <section className="py-12 sm:py-16">
        <div className="container-custom">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Featured Products
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
              Discover our most popular and highly-rated beauty and skincare products
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <LoadingSkeleton key={index} type="card" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (productsError || categoriesError) {
    return (
      <section className="py-12 sm:py-16">
        <div className="container-custom">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Featured Products
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
              Discover our most popular and highly-rated beauty and skincare products
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
    <section className="py-12 sm:py-16">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Featured Products
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
            Discover our most popular and highly-rated beauty and skincare products
          </p>
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          {/* Category Filter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Category:</span>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 py-2 text-sm rounded-full transition-colors whitespace-nowrap ${
                    selectedCategory === category.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Sorting */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full sm:w-auto"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-8 sm:mt-12">
          <button className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3">
            View All Products
          </button>
        </div>
      </div>
    </section>
  );
}