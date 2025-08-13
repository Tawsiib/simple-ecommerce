import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircleIcon,
  TruckIcon,
  MapPinIcon,
  CreditCardIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import useOrderStore from '../../lib/stores/orderStore';
import LoadingSpinner from '../ui/LoadingSpinner';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  const { currentOrder, fetchOrder } = useOrderStore();

  useEffect(() => {
    const loadOrder = async () => {
      try {
        await fetchOrder(orderId);
      } catch (error) {
        console.error('Failed to load order:', error);
        navigate('/orders');
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      loadOrder();
    }
  }, [orderId, fetchOrder, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h1>
          <Link
            to="/orders"
            className="bg-rose-600 text-white px-6 py-3 rounded-lg hover:bg-rose-700 transition-colors"
          >
            View All Orders
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-100',
      processing: 'text-blue-600 bg-blue-100',
      shipped: 'text-purple-600 bg-purple-100',
      delivered: 'text-green-600 bg-green-100',
      cancelled: 'text-red-600 bg-red-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      cash_on_delivery: '💵',
      bkash: '📱',
      nagad: '📱',
      rocket: '📱',
      upay: '📱',
      card: '💳',
      bank_transfer: '🏦'
    };
    return icons[method] || '💳';
  };

  const getPaymentMethodName = (method) => {
    const names = {
      cash_on_delivery: 'Cash on Delivery',
      bkash: 'bKash',
      nagad: 'Nagad',
      rocket: 'Rocket',
      upay: 'Upay',
      card: 'Credit/Debit Card',
      bank_transfer: 'Bank Transfer'
    };
    return names[method] || method;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <CheckCircleIcon className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
            <p className="text-gray-600">
              Thank you for your purchase. Your order has been successfully placed.
            </p>
          </div>

          {/* Order Details Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentOrder.status)}`}>
                {currentOrder.status.charAt(0).toUpperCase() + currentOrder.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center mb-3">
                  <DocumentTextIcon className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Order Number</span>
                </div>
                <p className="font-medium text-gray-900">{currentOrder.order_number}</p>
              </div>

              <div>
                <div className="flex items-center mb-3">
                  <CalendarIcon className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Order Date</span>
                </div>
                <p className="font-medium text-gray-900">{formatDate(currentOrder.created_at)}</p>
              </div>

              <div>
                <div className="flex items-center mb-3">
                  <CreditCardIcon className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Payment Method</span>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-2">{getPaymentMethodIcon(currentOrder.payment_method)}</span>
                  <p className="font-medium text-gray-900">{getPaymentMethodName(currentOrder.payment_method)}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center mb-3">
                  <TruckIcon className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Shipping Method</span>
                </div>
                <p className="font-medium text-gray-900">
                  {currentOrder.shipping?.shipping_method?.charAt(0).toUpperCase() + 
                   currentOrder.shipping?.shipping_method?.slice(1) || 'Standard'} Delivery
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-4">
              {currentOrder.orderItems?.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={item.product?.images?.[0]?.url || '/placeholder-product.jpg'}
                    alt={item.product?.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.product?.name}</h4>
                    <p className="text-sm text-gray-600">SKU: {item.product_sku}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">৳{item.subtotal.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">৳{item.unit_price.toFixed(2)} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">৳{currentOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (5%)</span>
                <span className="font-medium text-gray-900">৳{currentOrder.tax_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-gray-900">
                  {currentOrder.shipping_amount === 0 ? 'Free' : `৳${currentOrder.shipping_amount.toFixed(2)}`}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-rose-600">৳{currentOrder.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center mb-4">
              <MapPinIcon className="w-5 h-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Shipping Address</h3>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium text-gray-900">{currentOrder.shipping_address.full_name}</p>
              <p className="text-gray-600">{currentOrder.shipping_address.address}</p>
              <p className="text-gray-600">
                {currentOrder.shipping_address.city}, {currentOrder.shipping_address.postal_code}
              </p>
              <p className="text-gray-600">{currentOrder.shipping_address.country}</p>
              <p className="text-gray-600 mt-2">📞 {currentOrder.shipping_address.phone}</p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">What's Next?</h3>
            <div className="space-y-3 text-blue-800">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>You'll receive an email confirmation with your order details</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>We'll notify you when your order is processed and shipped</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Track your order status in your account dashboard</p>
              </div>
              {currentOrder.payment_method === 'cash_on_delivery' && (
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Prepare cash payment when your order arrives</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/orders"
              className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors text-center"
            >
              View All Orders
            </Link>
            <Link
              to="/"
              className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-3 rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 text-center"
            >
              Continue Shopping
            </Link>
          </div>

          {/* Support Info */}
          <div className="text-center mt-8 text-gray-600">
            <p className="mb-2">Need help? Contact our customer support</p>
            <p className="text-sm">
              📧 support@shohanis-reflection.com | 📞 +880 1234-567890
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
