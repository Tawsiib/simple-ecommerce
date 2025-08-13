'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon, StarIcon } from '@heroicons/react/24/outline';

const slides = [
  {
    id: 1,
    title: "Discover Your Natural Beauty",
    subtitle: "Premium skincare products for radiant, healthy skin",
    description: "Shop our curated collection of dermatologist-recommended products that transform your skincare routine into a luxurious experience.",
    image: "http://127.0.0.1:8000/images/products/sunscreen.svg",
    cta: "Shop Now",
    ctaLink: "/products",
    badge: "New Collection",
    rating: 4.9,
    reviewCount: "2.5k+ reviews"
  },
  {
    id: 2,
    title: "New Arrivals",
    subtitle: "Latest beauty trends and innovations",
    description: "Be the first to try our newest products and exclusive collections that set the standard for beauty excellence.",
    image: "http://127.0.0.1:8000/images/products/cleanser.svg",
    cta: "Explore New",
    ctaLink: "/category/new-arrival",
    badge: "Trending",
    rating: 4.8,
    reviewCount: "1.8k+ reviews"
  },
  {
    id: 3,
    title: "Summer Essentials",
    subtitle: "Protect and nourish your skin",
    description: "SPF protection, lightweight moisturizers, and refreshing cleansers designed for your summer glow.",
    image: "http://127.0.0.1:8000/images/products/moisturizer.svg",
    cta: "Shop Summer",
    ctaLink: "/category/sunscreen",
    badge: "Best Seller",
    rating: 4.9,
    reviewCount: "3.2k+ reviews"
  },
  {
    id: 4,
    title: "Professional Results",
    subtitle: "At-home spa experience",
    description: "Transform your skincare routine with professional-grade products that deliver salon-quality results.",
    image: "http://127.0.0.1:8000/images/products/face-mask.svg",
    cta: "Learn More",
    ctaLink: "/about",
    badge: "Premium",
    rating: 4.9,
    reviewCount: "2.1k+ reviews"
  }
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

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
    <section className="relative h-[500px] sm:h-[600px] md:h-[700px] lg:h-[800px] overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23a855f7%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-1000 ${
            index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
        >
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
            <div 
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>
          
          {/* Content */}
          <div className="relative z-20 h-full flex items-center">
            <div className="container-custom">
              <div className="max-w-3xl text-white px-4 sm:px-0">
                {/* Badge */}
                <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-4 py-2 mb-6 animate-fade-in-up">
                  <span className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></span>
                  <span className="text-sm font-medium text-white">{slide.badge}</span>
                </div>

                {/* Title */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  {slide.title}
                </h1>
                
                {/* Subtitle */}
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold mb-3 sm:mb-4 text-purple-200 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                  {slide.subtitle}
                </h2>
                
                {/* Description */}
                <p className="text-base sm:text-lg lg:text-xl mb-8 sm:mb-10 text-gray-200 leading-relaxed max-w-2xl animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                  {slide.description}
                </p>

                {/* Rating and CTA */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
                  {/* Rating */}
                  <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(slide.rating || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-white">{slide.rating}</div>
                      <div className="text-xs text-gray-300">{slide.reviewCount}</div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link
                    href={slide.ctaLink}
                    className="group relative inline-flex items-center space-x-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 px-8 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-glow focus:ring-4 focus:ring-purple-500/20 focus:outline-none"
                  >
                    <span>{slide.cta}</span>
                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <PlayIcon className="w-3 h-3 text-white" />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 sm:left-8 top-1/2 transform -translate-y-1/2 z-30 w-12 h-12 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-2xl border border-white/20 transition-all duration-300 hover:scale-110 hover:shadow-medium hidden sm:flex items-center justify-center group"
        aria-label="Previous slide"
      >
        <ChevronLeftIcon className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
      </button>
      
      <button
        onClick={goToNext}
        className="absolute right-4 sm:right-8 top-1/2 transform -translate-y-1/2 z-30 w-12 h-12 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-2xl border border-white/20 transition-all duration-300 hover:scale-110 hover:shadow-medium hidden sm:flex items-center justify-center group"
        aria-label="Next slide"
      >
        <ChevronRightIcon className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
      </button>

      {/* Dots indicator */}
      <div className="absolute bottom-6 sm:bottom-8 lg:bottom-12 left-1/2 transform -translate-x-1/2 z-30 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-white scale-125 shadow-glow'
                : 'bg-white/50 hover:bg-white/75 hover:scale-110'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000 ease-linear"
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
    </section>
  );
}
