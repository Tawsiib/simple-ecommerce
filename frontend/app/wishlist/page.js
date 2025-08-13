'use client';

import { useState } from 'react';
import { HeartIcon, TrashIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import ProductCard from '../../components/ProductCard';

// Mock wishlist data - replace with actual API call
const mockWishlistItems = [
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
    description: "Enjoy the sun breakout-free with this Neutrogena Clear Face Oil-Free Sunscreen SPF 50.",
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
  }
];

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState(mockWishlistItems);

  const removeFromWishlist = (productId) => {
    setWishlistItems(items => items.filter(item => item.id !== productId));
  };

  const addToCart = (product) => {
    // Implement add to cart functionality
    console.log('Adding to cart:', product);
  };

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 pt-20 pb-24">
        <div className="container-custom">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <HeartIcon className="w-12 h-12 text-pink-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Wishlist is Empty</h1>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              Start building your wishlist by browsing our products and adding items you love.
            </p>
            <a
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-glow"
            >
              Browse Products
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 pt-20 pb-24">
      <div className="container-custom">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">My Wishlist</h1>
          <p className="text-lg text-gray-600">
            {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} in your wishlist
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center space-x-2">
            <HeartIcon className="w-6 h-6 text-pink-500" />
            <span className="text-lg font-semibold text-gray-900">Wishlist Items</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={clearWishlist}
              className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              <TrashIcon className="w-5 h-5" />
              <span>Clear All</span>
            </button>
          </div>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((product, index) => (
            <div 
              key={product.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative group">
                <ProductCard product={product} />
                
                {/* Wishlist Actions Overlay */}
                <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => addToCart(product)}
                    className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center shadow-glow hover:shadow-glow-accent transition-all duration-200 transform hover:scale-110"
                    title="Add to Cart"
                  >
                    <ShoppingCartIcon className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center shadow-glow hover:bg-red-600 transition-all duration-200 transform hover:scale-110"
                    title="Remove from Wishlist"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="mt-12 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                // Implement add all to cart functionality
                console.log('Adding all to cart');
              }}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-glow"
            >
              <ShoppingCartIcon className="w-5 h-5" />
              <span>Add All to Cart</span>
            </button>
            
            <a
              href="/products"
              className="px-6 py-3 border-2 border-purple-500 text-purple-600 font-semibold rounded-xl hover:bg-purple-500 hover:text-white transition-all duration-300"
            >
              Continue Shopping
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
