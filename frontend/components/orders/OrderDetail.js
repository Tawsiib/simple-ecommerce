import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ClockIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  CreditCardIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import useOrderStore from '../../lib/stores/orderStore';
import LoadingSpinner from '../ui/LoadingSpinner';

const OrderDetail = () => {
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
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: ClockIcon,
      processing: ClockIcon,
      shipped: TruckIcon,
      delivered: CheckCircleIcon,
      cancelled: XCircleIcon
    };
    return icons[status] || ClockIcon;
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

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pending',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };
    return texts[status] || status;
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

  const StatusIcon = getStatusIcon(currentOrder.status);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <button
                onClick={() => navigate('/orders')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
                <p className="text-gray-600 mt-2">Order #{currentOrder.order_number}</p>
              </div>
            </div>
          </div>

          {/* Order Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <StatusIcon className="h-8 w-8 text-gray-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Order Status</h2>
                  <p className="text-gray-600">Last updated: {formatDate(currentOrder.updated_at)}</p>
                </div>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(currentOrder.status)}`}>
                {getStatusText(currentOrder.status)}
              </span>
            </div>
          </div>

          {/* Order Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Order Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <DocumentTextIcon className="h-6 w-6 text-rose-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Order Information</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Order Number</p>
                  <p className="font-medium text-gray-900">{currentOrder.order_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-medium text-gray-900">{formatDate(currentOrder.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <div className="flex items-center mt-1">
                    <span className="text-2xl mr-2">{getPaymentMethodIcon(currentOrder.payment_method)}</span>
                    <p className="font-medium text-gray-900">{getPaymentMethodName(currentOrder.payment_method)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Status</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                    currentOrder.payment_status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {currentOrder.payment_status.charAt(0).toUpperCase() + currentOrder.payment_status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <TruckIcon className="h-6 w-6 text-rose-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Shipping Information</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Shipping Method</p>
                  <p className="font-medium text-gray-900">
                    {currentOrder.shipping?.shipping_method?.charAt(0).toUpperCase() + 
                     currentOrder.shipping?.shipping_method?.slice(1) || 'Standard'} Delivery
                  </p>
                </div>
                {currentOrder.shipping?.tracking_number && (
                  <div>
                    <p className="text-sm text-gray-600">Tracking Number</p>
                    <p className="font-medium text-gray-900">{currentOrder.shipping.tracking_number}</p>
                  </div>
                )}
                {currentOrder.shipping?.estimated_delivery && (
                  <div>
                    <p className="text-sm text-gray-600">Estimated Delivery</p>
                    <p className="font-medium text-gray-900">{formatDate(currentOrder.shipping.estimated_delivery)}</p>
                  </div>
                )}
                {currentOrder.shipping?.shipped_at && (
                  <div>
                    <p className="text-sm text-gray-600">Shipped On</p>
                    <p className="font-medium text-gray-900">{formatDate(currentOrder.shipping.shipped_at)}</p>
                  </div>
                )}
                {currentOrder.shipping?.delivered_at && (
                  <div>
                    <p className="text-sm text-gray-600">Delivered On</p>
                    <p className="font-medium text-gray-900">{formatDate(currentOrder.shipping.delivered_at)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Items</h3>
            <div className="space-y-4">
              {currentOrder.orderItems?.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={item.product?.images?.[0]?.url || '/placeholder-product.jpg'}
                    alt={item.product?.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.product?.name}</h4>
                    <p className="text-sm text-gray-600">SKU: {item.product_sku}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    {item.selected_options && Object.keys(item.selected_options).length > 0 && (
                      <p className="text-sm text-gray-600 mt-1">
                        Options: {Object.entries(item.selected_options).map(([key, value]) => `${key}: ${value}`).join(', ')}
                      </p>
                    )}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h3>
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
            <div className="flex items-center mb-6">
              <MapPinIcon className="h-6 w-6 text-rose-600 mr-3" />
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

          {/* Order Notes */}
          {currentOrder.notes && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Notes</h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{currentOrder.notes}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/orders"
              className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors text-center"
            >
              Back to Orders
            </Link>
            {currentOrder.status === 'pending' && (
              <button className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors">
                Cancel Order
              </button>
            )}
            {currentOrder.status === 'delivered' && (
              <button className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors">
                Write Review
              </button>
            )}
            <Link
              to="/"
              className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-3 rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 text-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
