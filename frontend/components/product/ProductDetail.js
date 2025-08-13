import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HeartIcon,
  ShoppingBagIcon,
  StarIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  MinusIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { apiClient } from '../../lib/api';
import useCartStore from '../../lib/stores/cartStore';
import useWishlistStore from '../../lib/stores/wishlistStore';
import useAuthStore from '../../lib/stores/authStore';
import ProductGallery from './ProductGallery';
import ProductReviews from './ProductReviews';
import RelatedProducts from './RelatedProducts';
import LoadingSpinner from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState('description');

  const { isAuthenticated } = useAuthStore();
  const { addToCart, isInCart } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(`/products/${slug}`);
      if (response.data.success) {
        setProduct(response.data.data);
      } else {
        throw new Error('Product not found');
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast.error('Failed to load product');
      navigate('/products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to cart');
      return;
    }

    if (product.stock <= 0) {
      toast.error('Product is out of stock');
      return;
    }

    try {
      await addToCart(product.id, quantity);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to manage wishlist');
      return;
    }

    try {
      if (isInWishlist(product.id)) {
        const wishlistItem = useWishlistStore.getState().getWishlistItem(product.id);
        if (wishlistItem) {
          await removeFromWishlist(wishlistItem.id);
        }
      } else {
        await addToWishlist(product.id);
      }
    } catch (error) {
      console.error('Failed to update wishlist:', error);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const isProductInCart = isInCart(product.id);
  const isProductInWishlist = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="container-custom py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </button>
          <span className="text-gray-500">/</span>
          <a href="/" className="text-gray-500 hover:text-gray-700">Home</a>
          <span className="text-gray-500">/</span>
          <a href="/products" className="text-gray-500 hover:text-gray-700">Products</a>
          <span className="text-gray-500">/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        {/* Product Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Product Gallery */}
          <div className="order-1">
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          {/* Product Info */}
          <div className="order-2">
            {/* Category & Brand */}
            <div className="flex items-center space-x-4 text-sm mb-4">
              <a href={`/categories/${product.category?.slug}`} className="text-gray-500 hover:text-rose-600">
                {product.category?.name}
              </a>
              <span className="text-gray-300">|</span>
              <a href={`/brands/${product.brand?.slug}`} className="text-gray-500 hover:text-rose-600">
                {product.brand?.name}
              </a>
            </div>

            {/* Title */}
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.average_rating || 0)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {product.average_rating || 0} ({product.review_count || 0} reviews)
                </span>
              </div>
              <span className="text-gray-300">|</span>
              <span className="text-sm text-gray-600">SKU: {product.sku}</span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold text-gray-900">
                  ৳{product.selling_price?.toFixed(2)}
                </span>
                {product.original_price > product.selling_price && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      ৳{product.original_price?.toFixed(2)}
                    </span>
                    <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded">
                      -{Math.round(((product.original_price - product.selling_price) / product.original_price) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">Tax included. Shipping calculated at checkout.</p>
            </div>

            {/* Short Description */}
            <p className="text-gray-700 mb-8 leading-relaxed">
              {product.short_description}
            </p>

            {/* Stock Status */}
            <div className="mb-6">
              {isOutOfStock ? (
                <div className="flex items-center text-red-600">
                  <XMarkIcon className="h-5 w-5 mr-2" />
                  <span className="font-medium">Out of Stock</span>
                </div>
              ) : product.stock < 10 ? (
                <div className="flex items-center text-orange-600">
                  <span className="font-medium">Only {product.stock} left in stock!</span>
                </div>
              ) : (
                <div className="flex items-center text-green-600">
                  <ShieldCheckIcon className="h-5 w-5 mr-2" />
                  <span className="font-medium">In Stock</span>
                </div>
              )}
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-4 mb-8">
              {/* Quantity Selector */}
              {!isOutOfStock && (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700 font-medium">Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2 font-medium min-w-[50px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.stock}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || isProductInCart}
                  className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    isProductInCart
                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                      : isOutOfStock
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-rose-600 text-white hover:bg-rose-700 transform hover:scale-105'
                  }`}
                >
                  {isProductInCart ? (
                    <>
                      <ShoppingBagIcon className="w-5 h-5 mr-2" />
                      In Cart
                    </>
                  ) : (
                    <>
                      <ShoppingBagIcon className="w-5 h-5 mr-2" />
                      Add to Cart
                    </>
                  )}
                </button>

                <button
                  onClick={handleToggleWishlist}
                  className={`px-6 py-3 rounded-lg border-2 font-semibold transition-all duration-200 ${
                    isProductInWishlist
                      ? 'border-rose-500 bg-rose-50 text-rose-600'
                      : 'border-gray-300 text-gray-700 hover:border-rose-500 hover:text-rose-600 hover:bg-rose-50'
                  }`}
                >
                  {isProductInWishlist ? (
                    <HeartSolidIcon className="w-5 h-5" />
                  ) : (
                    <HeartIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="border-t border-gray-200 pt-8 space-y-4">
              <div className="flex items-center">
                <TruckIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-700">Free shipping on orders over ৳1000</span>
              </div>
              <div className="flex items-center">
                <ShieldCheckIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-700">100% Authentic Products</span>
              </div>
              <div className="flex items-center">
                <StarIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-700">Easy 7-day returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="border-t border-gray-200">
          {/* Tab Headers */}
          <div className="flex flex-wrap border-b border-gray-200">
            <button
              onClick={() => setSelectedTab('description')}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                selectedTab === 'description'
                  ? 'text-rose-600 border-b-2 border-rose-600'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setSelectedTab('ingredients')}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                selectedTab === 'ingredients'
                  ? 'text-rose-600 border-b-2 border-rose-600'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Ingredients
            </button>
            <button
              onClick={() => setSelectedTab('howtouse')}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                selectedTab === 'howtouse'
                  ? 'text-rose-600 border-b-2 border-rose-600'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              How to Use
            </button>
            <button
              onClick={() => setSelectedTab('reviews')}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                selectedTab === 'reviews'
                  ? 'text-rose-600 border-b-2 border-rose-600'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Reviews ({product.review_count || 0})
            </button>
          </div>

          {/* Tab Content */}
          <div className="py-8">
            {selectedTab === 'description' && (
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {product.description || 'No description available.'}
                </p>
              </div>
            )}

            {selectedTab === 'ingredients' && (
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {product.ingredients || 'Ingredients information not available.'}
                </p>
              </div>
            )}

            {selectedTab === 'howtouse' && (
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {product.how_to_use || 'Usage instructions not available.'}
                </p>
              </div>
            )}

            {selectedTab === 'reviews' && (
              <ProductReviews productId={product.id} />
            )}
          </div>
        </div>

        {/* Related Products */}
        <RelatedProducts productId={product.id} categoryId={product.category_id} />
      </div>
    </div>
  );
};

export default ProductDetail;
