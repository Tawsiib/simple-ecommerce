"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  HeartIcon, 
  ShoppingBagIcon, 
  StarIcon,
  EyeIcon
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
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 transform hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Link href={`/product/${slug}`}>
          <img
            src={images?.[0]?.url || '/placeholder-product.jpg'}
            alt={name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {is_new && (
            <span className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full">
              New
            </span>
          )}
          {is_featured && (
            <span className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full">
              Featured
            </span>
          )}
          {is_best_seller && (
            <span className="bg-yellow-500 text-white text-xs font-medium px-2 py-1 rounded-full">
              Best Seller
            </span>
          )}
        </div>

        {/* Discount Badge */}
        {discount_percentage > 0 && (
          <div className="absolute top-3 right-3">
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              -{discount_percentage}%
            </span>
          </div>
        )}

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex space-x-2">
            <Link
              href={`/product/${slug}`}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-700 hover:text-rose-600 transition-colors shadow-lg"
              aria-label="View product details"
            >
              <EyeIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Stock Status */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category & Brand */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span className="hover:text-rose-600 transition-colors cursor-pointer">
            {category?.name}
          </span>
          <span className="hover:text-rose-600 transition-colors cursor-pointer">
            {brand?.name}
          </span>
        </div>

        {/* Product Name */}
        <Link href={`/product/${slug}`}>
          <h3 className="font-medium text-gray-900 group-hover:text-rose-600 transition-colors line-clamp-2 mb-2 min-h-[2.5rem]">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center mb-3">
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
          <span className="ml-2 text-sm text-gray-500">
            ({review_count || 0})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">
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
        <div className="flex space-x-2">
          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isLoading || isOutOfStock || isInUserCart}
            className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
              isInUserCart
                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                : isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-rose-600 text-white hover:bg-rose-700 transform hover:scale-105'
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
            className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
              isInUserWishlist
                ? 'border-rose-500 bg-rose-50 text-rose-600'
                : 'border-gray-300 text-gray-600 hover:border-rose-500 hover:text-rose-600 hover:bg-rose-50'
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
    </div>
  );
};

export default ProductCard;