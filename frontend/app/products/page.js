'use client';

import { useState, useEffect } from 'react';
import { 
  FunnelIcon, 
  ArrowsUpDownIcon,
  SparklesIcon,
  FireIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import ProductCard from '../../components/ProductCard';
import { useFeaturedProducts, useCategories } from '../../lib/apiServices';
import { NetworkError, EmptyState } from '../../components/ui/ErrorBoundary';
import { LoadingSkeleton } from '../../components/ui/LoadingSpinner';

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

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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

  const filteredProducts = Array.isArray(products) ? products.filter(product => {
    if (selectedCategory === 'all') return true;
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

  if (productsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 pt-20 pb-24">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              All Products
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Discover our complete collection of beauty and skincare products
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <LoadingSkeleton key={index} type="card" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 pt-20 pb-24">
      <div className="container-custom">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            All Products
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover our complete collection of beauty and skincare products
          </p>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {/* Mobile Filters */}
        {showMobileFilters && (
          <div className="lg:hidden mb-8 p-4 bg-white rounded-2xl shadow-soft border border-gray-200/50">
            <div className="space-y-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        selectedCategory === category.id
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-glow'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sorting */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
        )}

        {/* Desktop Filters and Products */}
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Desktop Filters */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/30 shadow-soft p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
                
                {/* Category Filter */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Category</h4>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 ${
                          selectedCategory === category.id
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-glow'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sorting */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Sort by</h4>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map((product, index) => (
                <div 
                  key={product.id} 
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {sortedProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <FunnelIcon className="mx-auto h-12 w-12" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or browse all categories.
                </p>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                >
                  View All Products
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
