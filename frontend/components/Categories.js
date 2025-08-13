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
  const displayCategories = categories?.data || fallbackCategories;

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
    <section className="py-12 sm:py-16 bg-gray-50">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Trending Categories
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
            Discover our most popular beauty and skincare categories, carefully curated for your daily routine
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {displayCategories.map((category) => {
            // Handle both API data and fallback data
            const categoryData = category.icon ? category : {
              ...category,
              icon: ShoppingBagIcon,
              href: `/category/${category.slug || category.id}`,
              image: category.image || `/images/category-${category.slug || 'default'}.jpg`,
              color: 'from-primary-400 to-primary-600'
            };

            return (
              <Link
                key={category.id}
                href={categoryData.href}
                className="group block"
              >
                <div className="card overflow-hidden group-hover:shadow-lg transition-all duration-300 transform group-hover:-translate-y-1">
                  {/* Category Image */}
                  <div className="relative h-40 sm:h-48 overflow-hidden">
                    <div 
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat group-hover:scale-110 transition-transform duration-500"
                      style={{ backgroundImage: `url(${categoryData.image})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    
                    {/* Icon */}
                    <div className={`absolute top-3 sm:top-4 right-3 sm:right-4 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${categoryData.color} rounded-full flex items-center justify-center shadow-lg`}>
                      <categoryData.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                  </div>

                  {/* Category Info */}
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {categoryData.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                      {categoryData.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-gray-500">
                        {categoryData.productCount || category.products_count || 0} products
                      </span>
                      <span className="text-primary-600 font-medium group-hover:text-primary-700 transition-colors text-sm sm:text-base">
                        View Products →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-8 sm:mt-12">
          <Link
            href="/products"
            className="btn-outline text-base sm:text-lg px-6 sm:px-8 py-3"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}
