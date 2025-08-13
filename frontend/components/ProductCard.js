"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  HeartIcon, 
  ShoppingBagIcon, 
  StarIcon,
  EyeIcon,
  SparklesIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import useCartStore from '../lib/stores/cartStore';
import useWishlistStore from '../lib/stores/wishlistStore';
import useAuthStore from '../lib/stores/authStore';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  
  const { isAuthenticated } = useAuthStore();
  const { addToCart, isInCart } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();

  const {
    id,
    name,
    slug,
    selling_price,
    original_price,
    discount_percentage,
    rating,
    review_count,
    is_new,
    is_featured,
    is_best_seller,
    stock_quantity,
    images,
    category,
    brand
  } = product;

  const isInUserCart = isInCart(id);
  const isInUserWishlist = isInWishlist(id);
  const isOutOfStock = stock_quantity <= 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to cart');
      return;
    }

    if (isOutOfStock) {
      toast.error('Product is out of stock');
      return;
    }

    setIsLoading(true);
    try {
      await addToCart(id, 1);
    } catch (error) {
      // Error is already handled by the store
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to manage wishlist');
      return;
    }

    setIsWishlistLoading(true);
    try {
      if (isInUserWishlist) {
        // Find the wishlist item to remove
        const wishlistItem = useWishlistStore.getState().getWishlistItem(id);
        if (wishlistItem) {
          await removeFromWishlist(wishlistItem.id);
        }
      } else {
        await addToWishlist(id);
      }
    } catch (error) {
      // Error is already handled by the store
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const formatPrice = (price) => {
    return `৳${parseFloat(price).toFixed(2)}`;
  };

  return (
    <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft hover:shadow-large border border-white/20 overflow-hidden transition-all duration-500 transform hover:-translate-y-2 hover:border-white/40">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <Link href={`/product/${slug}`}>
          <img
            src={images?.[0]?.url || '/placeholder-product.jpg'}
            alt={name}
            className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {is_new && (
            <div className="flex items-center space-x-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg animate-fade-in-up">
              <SparklesIcon className="w-3 h-3" />
              <span>New</span>
            </div>
          )}
          {is_featured && (
            <div className="flex items-center space-x-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <StarIcon className="w-3 h-3" />
              <span>Featured</span>
            </div>
          )}
          {is_best_seller && (
            <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <FireIcon className="w-3 h-3" />
              <span>Best Seller</span>
            </div>
          )}
        </div>

        {/* Discount Badge */}
        {discount_percentage > 0 && (
          <div className="absolute top-4 right-4">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              -{discount_percentage}%
            </div>
          </div>
        )}

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-6">
          <div className="flex space-x-3">
            <Link
              href={`/product/${slug}`}
              className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center text-gray-700 hover:text-primary-600 transition-all duration-300 shadow-lg hover:scale-110 hover:shadow-glow"
              aria-label="View product details"
            >
              <EyeIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Stock Status */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg">
              Out of Stock
            </div>
          </div>
        )}

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Category & Brand */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span className="hover:text-primary-600 transition-colors cursor-pointer font-medium">
            {category?.name}
          </span>
          <span className="hover:text-primary-600 transition-colors cursor-pointer font-medium">
            {brand?.name}
          </span>
        </div>

        {/* Product Name */}
        <Link href={`/product/${slug}`}>
          <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-3 min-h-[2.5rem] leading-tight">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(rating || 0)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-500 font-medium">
            ({review_count || 0})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-bold text-gray-900">
              {formatPrice(selling_price)}
            </span>
            {original_price > selling_price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(original_price)}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isLoading || isOutOfStock || isInUserCart}
            className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
              isInUserCart
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white cursor-not-allowed shadow-lg'
                : isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:from-primary-600 hover:to-accent-600 transform hover:scale-105 hover:shadow-glow'
            }`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isInUserCart ? (
              <>
                <ShoppingBagIcon className="w-4 h-4 mr-2" />
                In Cart
              </>
            ) : (
              <>
                <ShoppingBagIcon className="w-4 h-4 mr-2" />
                Add to Cart
              </>
            )}
          </button>

          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            disabled={isWishlistLoading}
            className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${
              isInUserWishlist
                ? 'border-primary-500 bg-primary-50 text-primary-600 shadow-lg'
                : 'border-gray-300 text-gray-600 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50 hover:shadow-medium'
            }`}
            aria-label={isInUserWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {isWishlistLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isInUserWishlist ? (
              <HeartSolidIcon className="w-5 h-5" />
            ) : (
              <HeartIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Bottom Border Glow Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </div>
  );
};

export default ProductCard;