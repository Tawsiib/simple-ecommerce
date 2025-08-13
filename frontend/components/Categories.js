"use client";

import Link from 'next/link';
import { 
  SunIcon, 
  SparklesIcon, 
  BeakerIcon, 
  HeartIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import { useCategories } from '../lib/apiServices';
import { NetworkError, EmptyState } from './ui/ErrorBoundary';
import { LoadingSkeleton } from './ui/LoadingSpinner';

// Fallback categories for when API is not available
const fallbackCategories = [
  {
    id: 1,
    name: 'Sunscreen',
    description: 'Protect your skin from harmful UV rays',
    icon: SunIcon,
    href: '/category/sunscreen',
    image: '/images/category-sunscreen.jpg',
    productCount: 24,
    color: 'from-yellow-400 to-orange-500'
  },
  {
    id: 2,
    name: 'Cleanser',
    description: 'Gentle cleansing for all skin types',
    icon: SparklesIcon,
    href: '/category/cleanser',
    image: '/images/category-cleanser.jpg',
    productCount: 18,
    color: 'from-blue-400 to-cyan-500'
  },
  {
    id: 3,
    name: 'Moisturizer',
    description: 'Hydration and nourishment for your skin',
    icon: HeartIcon,
    href: '/category/moisturizer',
    image: '/images/category-moisturizer.jpg',
    productCount: 32,
    color: 'from-pink-400 to-rose-500'
  },
  {
    id: 4,
    name: 'Serum',
    description: 'Targeted treatments for specific concerns',
    icon: BeakerIcon,
    href: '/category/serum',
    image: '/images/category-serum.jpg',
    productCount: 28,
    color: 'from-purple-400 to-indigo-500'
  }
];

export default function Categories() {
  const { data: categories, isLoading, error, refetch } = useCategories();

  // Use fallback data if API is not available or loading
  const displayCategories = Array.isArray(categories?.data) ? categories.data : fallbackCategories;

  if (isLoading) {
    return (
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Trending Categories
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
              Discover our most popular beauty and skincare categories, carefully curated for your daily routine
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <LoadingSkeleton key={index} type="card" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Trending Categories
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
              Discover our most popular beauty and skincare categories, carefully curated for your daily routine
            </p>
          </div>
          <NetworkError onRetry={refetch} />
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
            <span className="text-sm font-semibold text-purple-700">Popular Categories</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Trending Categories
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4 sm:px-0 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            Discover our most popular beauty and skincare categories, carefully curated for your daily routine
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {displayCategories.map((category, index) => {
            // Handle both API data and fallback data
            const categoryData = category.icon ? category : {
              ...category,
              icon: ShoppingBagIcon,
              href: `/category/${category.slug || category.id}`,
              image: category.image || `/images/category-${category.slug || 'default'}.jpg`,
              color: 'from-purple-400 to-pink-500'
            };

            return (
              <div 
                key={category.id} 
                className="animate-fade-in-up"
                style={{ animationDelay: `${0.6 + index * 0.1}s` }}
              >
                <Link
                  href={categoryData.href}
                  className="group block"
                >
                  <div className="card overflow-hidden group-hover:shadow-lg transition-all duration-500 transform group-hover:-translate-y-2 hover:shadow-glow">
                    {/* Category Image */}
                    <div className="relative h-48 sm:h-56 overflow-hidden">
                      <div 
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat group-hover:scale-110 transition-transform duration-700"
                        style={{ backgroundImage: `url(${categoryData.image})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                      
                      {/* Icon */}
                      <div className={`absolute top-4 right-4 w-12 h-12 bg-gradient-to-br ${categoryData.color} rounded-2xl flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-300`}>
                        <categoryData.icon className="w-6 h-6 text-white" />
                      </div>
                      
                      {/* Product Count Badge */}
                      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold text-gray-800">
                        {categoryData.productCount || category.products_count || 0} products
                      </div>
                    </div>

                    {/* Category Info */}
                    <div className="p-6">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors duration-300">
                        {categoryData.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                        {categoryData.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-purple-600 font-semibold group-hover:text-purple-700 transition-colors duration-300 text-sm">
                          Explore Category
                        </span>
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12 sm:mt-16 animate-fade-in-up" style={{ animationDelay: '1.2s' }}>
          <Link
            href="/products"
            className="group relative inline-flex items-center space-x-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 px-8 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-glow focus:ring-4 focus:ring-purple-500/20 focus:outline-none"
          >
            <span>View All Products</span>
            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
