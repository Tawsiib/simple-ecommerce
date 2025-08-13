"use client";

import Link from 'next/link';
import { useBrands } from '../lib/apiServices';
import { NetworkError, EmptyState } from './ui/ErrorBoundary';
import { LoadingSkeleton } from './ui/LoadingSpinner';

// Fallback brands for when API is not available
const fallbackBrands = [
  {
    id: 1,
    name: 'Differin',
    logo: '/images/brands/differin.png',
    href: '/brand/differin'
  },
  {
    id: 2,
    name: "Trader Joe's",
    logo: '/images/brands/trader-joes.png',
    href: '/brand/trader-joes'
  },
  {
    id: 3,
    name: 'Neutrogena',
    logo: '/images/brands/neutrogena.png',
    href: '/brand/neutrogena'
  },
  {
    id: 4,
    name: 'Cerave',
    logo: '/images/brands/cerave.png',
    href: '/brand/cerave'
  },
  {
    id: 5,
    name: 'E.L.F. Skin',
    logo: '/images/brands/elf-skin.png',
    href: '/brand/elf-skin'
  },
  {
    id: 6,
    name: 'La Roche-Posay',
    logo: '/images/brands/la-roche-posay.png',
    href: '/brand/la-roche-posay'
  }
];

export default function Brands() {
  const { data: brandsData, isLoading, error, refetch } = useBrands();

  // Use fallback data if API is not available
  const brands = Array.isArray(brandsData?.data) ? brandsData.data : fallbackBrands;

  if (isLoading) {
    return (
      <section className="py-12 sm:py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Trusted Brands
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
              We partner with the world's leading beauty and skincare brands to bring you premium products
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-4 sm:gap-6 lg:gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex flex-col items-center">
                <LoadingSkeleton type="avatar" className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-lg" />
                <LoadingSkeleton type="text" lines={1} className="mt-2 sm:mt-3 w-16" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 sm:py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Trusted Brands
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
              We partner with the world's leading beauty and skincare brands to bring you premium products
            </p>
          </div>
          <NetworkError onRetry={refetch} />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-white via-gray-50 to-purple-50/20 relative overflow-hidden">
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
            <span className="text-sm font-semibold text-purple-700">Trusted Partners</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Trusted Brands
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4 sm:px-0 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            We partner with the world's leading beauty and skincare brands to bring you premium products
          </p>
        </div>

        {/* Enhanced Brands Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {brands.map((brand, index) => {
            // Handle both API data and fallback data
            const brandData = {
              ...brand,
              href: brand.href || `/brand/${brand.slug || brand.id}`,
              logo: brand.logo || brand.image || `/images/brands/${brand.slug || 'default'}.png`
            };

            return (
              <div 
                key={brand.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${0.6 + index * 0.1}s` }}
              >
                <Link
                  href={brandData.href}
                  className="group flex flex-col items-center"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-white rounded-2xl flex items-center justify-center p-4 sm:p-5 lg:p-6 group-hover:bg-gradient-to-br group-hover:from-purple-50 group-hover:to-pink-50 transition-all duration-500 hover:shadow-glow hover:scale-105 border border-gray-100 group-hover:border-purple-200">
                    {/* Enhanced brand logo placeholder */}
                    <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center group-hover:from-purple-200 group-hover:to-pink-200 transition-all duration-300">
                      <span className="text-gray-600 group-hover:text-purple-700 text-xs sm:text-sm text-center font-semibold leading-tight transition-colors duration-300">
                        {brandData.name}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm sm:text-base text-gray-600 mt-3 sm:mt-4 text-center group-hover:text-purple-600 transition-colors duration-300 leading-tight font-medium">
                    {brandData.name}
                  </span>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Enhanced View All Brands Button */}
        <div className="text-center animate-fade-in-up" style={{ animationDelay: '1.2s' }}>
          <Link
            href="/brands"
            className="group relative inline-flex items-center space-x-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 px-8 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-glow focus:ring-4 focus:ring-purple-500/20 focus:outline-none"
          >
            <span>View All Brands</span>
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
