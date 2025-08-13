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
  const brands = brandsData?.data || fallbackBrands;

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
    <section className="py-12 sm:py-16 bg-white">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Trusted Brands
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
            We partner with the world's leading beauty and skincare brands to bring you premium products
          </p>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-4 sm:gap-6 lg:gap-8">
          {brands.map((brand) => {
            // Handle both API data and fallback data
            const brandData = {
              ...brand,
              href: brand.href || `/brand/${brand.slug || brand.id}`,
              logo: brand.logo || brand.image || `/images/brands/${brand.slug || 'default'}.png`
            };

            return (
              <Link
                key={brand.id}
                href={brandData.href}
                className="group flex flex-col items-center"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gray-100 rounded-lg flex items-center justify-center p-2 sm:p-3 lg:p-4 group-hover:bg-gray-200 transition-colors duration-300">
                  {/* Placeholder for brand logo */}
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded flex items-center justify-center">
                    <span className="text-gray-500 text-xs sm:text-sm text-center font-medium leading-tight">
                      {brandData.name}
                    </span>
                  </div>
                </div>
                <span className="text-xs sm:text-sm text-gray-600 mt-2 sm:mt-3 text-center group-hover:text-primary-600 transition-colors leading-tight">
                  {brandData.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* View All Brands Button */}
        <div className="text-center mt-8 sm:mt-12">
          <Link
            href="/brands"
            className="btn-outline text-base sm:text-lg px-6 sm:px-8 py-3"
          >
            View All Brands
          </Link>
        </div>
      </div>
    </section>
  );
}
