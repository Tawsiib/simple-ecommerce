"use client";

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartIcon,
  ShoppingBagIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import useWishlistStore from '../../lib/stores/wishlistStore';
import useCartStore from '../../lib/stores/cartStore';
import DashboardLayout from './DashboardLayout';
import LoadingSpinner from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';

const DashboardWishlist = () => {
  const {
    items,
    isLoading,
    fetchWishlist,
    removeFromWishlist,
    moveToCart,
    clearWishlist
  } = useWishlistStore();
  
  const { addToCart } = useCartStore();

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleMoveToCart = async (wishlistItemId, productId) => {
    try {
      await moveToCart(wishlistItemId);
    } catch (error) {
      // If move to cart fails, try adding directly
      try {
        await addToCart(productId, 1);
        await removeFromWishlist(wishlistItemId);
      } catch (addError) {
        console.error('Failed to move item to cart:', addError);
      }
    }
  };

  const handleRemove = async (wishlistItemId) => {
    try {
      await removeFromWishlist(wishlistItemId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear your wishlist?')) {
      try {
        await clearWishlist();
      } catch (error) {
        console.error('Failed to clear wishlist:', error);
      }
    }
  };

  if (isLoading && items.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-600 mt-1">Items you've saved for later</p>
          </div>
          {items.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-red-600 hover:text-red-700 font-medium text-sm"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Wishlist Items */}
        {items.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <HeartIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Your wishlist is empty</h3>
            <p className="mt-2 text-gray-600">Save items you love to buy them later</p>
            <Link
              to="/products"
              className="mt-4 inline-flex items-center px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
            >
              <ShoppingBagIcon className="h-5 w-5 mr-2" />
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex space-x-4">
                  {/* Product Image */}
                  <Link
                    to={`/product/${item.product?.slug}`}
                    className="flex-shrink-0"
                  >
                    <img
                      src={item.product?.images?.[0]?.url || '/placeholder-product.jpg'}
                      alt={item.product?.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </Link>

                  {/* Product Details */}
                  <div className="flex-1">
                    <Link
                      to={`/product/${item.product?.slug}`}
                      className="font-medium text-gray-900 hover:text-rose-600 transition-colors line-clamp-2"
                    >
                      {item.product?.name}
                    </Link>
                    
                    <div className="mt-1 flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-900">
                        ৳{item.product?.selling_price?.toFixed(2)}
                      </span>
                      {item.product?.original_price > item.product?.selling_price && (
                        <span className="text-sm text-gray-500 line-through">
                          ৳{item.product?.original_price?.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Stock Status */}
                    <p className={`text-sm mt-1 ${
                      item.product?.stock_quantity > 0 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {item.product?.stock_quantity > 0 
                        ? `In Stock (${item.product?.stock_quantity} available)` 
                        : 'Out of Stock'
                      }
                    </p>

                    {/* Actions */}
                    <div className="mt-3 flex items-center space-x-3">
                      <button
                        onClick={() => handleMoveToCart(item.id, item.product?.id)}
                        disabled={item.product?.stock_quantity <= 0}
                        className={`flex-1 flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                          item.product?.stock_quantity > 0
                            ? 'bg-rose-600 text-white hover:bg-rose-700'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingBagIcon className="h-4 w-4 mr-1.5" />
                        Move to Cart
                      </button>
                      
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        title="Remove from wishlist"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {item.notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-600">
                    <p className="font-medium text-gray-700">Note:</p>
                    <p>{item.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {items.length > 0 && (
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Wishlist Summary</h3>
              <span className="text-sm text-gray-600">{items.length} items</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Value</span>
                <span className="font-medium text-gray-900">
                  ৳{items.reduce((sum, item) => sum + (item.product?.selling_price || 0), 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Potential Savings</span>
                <span className="font-medium text-green-600">
                  ৳{items.reduce((sum, item) => {
                    const original = item.product?.original_price || 0;
                    const selling = item.product?.selling_price || 0;
                    return sum + (original > selling ? original - selling : 0);
                  }, 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p>* Prices and availability subject to change</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardWishlist;
