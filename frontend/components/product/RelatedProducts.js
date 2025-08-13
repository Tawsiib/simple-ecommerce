import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { apiClient } from '../../lib/api';
import ProductCard from '../ProductCard';
import LoadingSpinner from '../ui/LoadingSpinner';

const RelatedProducts = ({ productId, categoryId }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchRelatedProducts();
  }, [productId, categoryId]);

  const fetchRelatedProducts = async () => {
    try {
      setIsLoading(true);
      // Try to get related products first
      let response = await apiClient.get(`/products/${productId}/related`);
      
      // If no related products, get products from same category
      if (!response.data.success || response.data.data.length === 0) {
        response = await apiClient.get(`/products/category/${categoryId}?limit=8`);
      }

      if (response.data.success) {
        // Filter out the current product
        const filteredProducts = response.data.data.filter(p => p.id !== productId);
        setProducts(filteredProducts.slice(0, 8)); // Limit to 8 products
      }
    } catch (error) {
      console.error('Failed to fetch related products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const slidesPerView = {
    mobile: 1.2,
    tablet: 2.5,
    desktop: 4
  };

  const getSlideWidth = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1024) return 100 / slidesPerView.desktop;
      if (window.innerWidth >= 768) return 100 / slidesPerView.tablet;
      return 100 / slidesPerView.mobile;
    }
    return 25; // Default desktop
  };

  const maxSlide = Math.max(0, products.length - slidesPerView.desktop);

  const handlePrevious = () => {
    setCurrentSlide(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide(prev => Math.min(maxSlide, prev + 1));
  };

  if (isLoading) {
    return (
      <div className="py-16">
        <div className="flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 border-t border-gray-200">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">You May Also Like</h2>
        
        {/* Desktop Navigation */}
        {products.length > slidesPerView.desktop && (
          <div className="hidden lg:flex items-center space-x-2">
            <button
              onClick={handlePrevious}
              disabled={currentSlide === 0}
              className="p-2 rounded-full bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              aria-label="Previous products"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentSlide >= maxSlide}
              className="p-2 rounded-full bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              aria-label="Next products"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Products Slider */}
      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateX(-${currentSlide * getSlideWidth()}%)`
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="w-full md:w-1/2 lg:w-1/4 flex-shrink-0 px-2"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Navigation Dots */}
      <div className="flex justify-center mt-6 space-x-2 lg:hidden">
        {[...Array(Math.ceil(products.length / slidesPerView.mobile))].map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 transition-all duration-200 ${
              currentSlide === index
                ? 'w-8 bg-rose-600'
                : 'w-2 bg-gray-300 hover:bg-gray-400'
            } rounded-full`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default RelatedProducts;
