'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const slides = [
  {
    id: 1,
    title: "Discover Your Natural Beauty",
    subtitle: "Premium skincare products for radiant, healthy skin",
    description: "Shop our curated collection of dermatologist-recommended products",
    image: "/images/hero-1.jpg",
    cta: "Shop Now",
    ctaLink: "/products"
  },
  {
    id: 2,
    title: "New Arrivals",
    subtitle: "Latest beauty trends and innovations",
    description: "Be the first to try our newest products and exclusive collections",
    image: "/images/hero-2.jpg",
    cta: "Explore New",
    ctaLink: "/category/new-arrival"
  },
  {
    id: 3,
    title: "Summer Essentials",
    subtitle: "Protect and nourish your skin",
    description: "SPF protection, lightweight moisturizers, and refreshing cleansers",
    image: "/images/hero-3.jpg",
    cta: "Shop Summer",
    ctaLink: "/category/sunscreen"
  },
  {
    id: 4,
    title: "Professional Results",
    subtitle: "At-home spa experience",
    description: "Transform your skincare routine with professional-grade products",
    image: "/images/hero-4.jpg",
    cta: "Learn More",
    ctaLink: "/about"
  }
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden bg-gradient-to-br from-primary-50 to-accent-50">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute inset-0 bg-black/20 z-10" />
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${slide.image})` }}
          />
          
          {/* Content */}
          <div className="relative z-20 h-full flex items-center">
            <div className="container-custom">
              <div className="max-w-2xl text-white px-4 sm:px-0">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 leading-tight">
                  {slide.title}
                </h1>
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-primary-200">
                  {slide.subtitle}
                </h2>
                <p className="text-base sm:text-lg mb-6 sm:mb-8 text-gray-200 leading-relaxed">
                  {slide.description}
                </p>
                <Link
                  href={slide.ctaLink}
                  className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-lg text-base sm:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  {slide.cta}
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation arrows - hidden on mobile for better UX */}
      <button
        onClick={goToPrevious}
        className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 text-white p-2 sm:p-3 rounded-full backdrop-blur-sm transition-all duration-300 hidden sm:flex"
        aria-label="Previous slide"
      >
        <ChevronLeftIcon className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
      
      <button
        onClick={goToNext}
        className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 text-white p-2 sm:p-3 rounded-full backdrop-blur-sm transition-all duration-300 hidden sm:flex"
        aria-label="Next slide"
      >
        <ChevronRightIcon className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Dots indicator */}
      <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2 sm:space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-white scale-125'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Overlay gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 lg:h-32 bg-gradient-to-t from-black/20 to-transparent z-20" />
    </section>
  );
}
