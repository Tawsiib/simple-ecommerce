import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  CreditCardIcon,
  BanknotesIcon,
  TruckIcon,
  MapPinIcon,
  UserIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';
import useCartStore from '../../lib/stores/cartStore';
import useOrderStore from '../../lib/stores/orderStore';
import useAuthStore from '../../lib/stores/authStore';
import LoadingSpinner from '../ui/LoadingSpinner';
import PaymentForm from '../payment/PaymentForm';

const Checkout = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash_on_delivery');
  const [selectedShippingMethod, setSelectedShippingMethod] = useState('standard');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  const { summary, items, clearCart } = useCartStore();
  const { createOrder } = useOrderStore();
  const { user } = useAuthStore();

  const handlePaymentSuccess = (orderId) => {
    setShowPaymentForm(false);
    router.push(`/orders/${orderId}/confirmation`);
  };

  const handlePaymentFailure = () => {
    setShowPaymentForm(false);
    toast.error('Payment failed. Please try again.');
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      shipping_address: {
        full_name: user?.name || '',
        phone: user?.phone || '',
        address: '',
        city: '',
        postal_code: '',
        country: 'Bangladesh'
      },
      billing_address: {
        full_name: user?.name || '',
        phone: user?.phone || '',
        address: '',
        city: '',
        postal_code: '',
        country: 'Bangladesh'
      },
      notes: ''
    }
  });

  const watchedShippingAddress = watch('shipping_address');

  // Auto-fill billing address when shipping address changes
  useEffect(() => {
    if (useSameAddress) {
      setValue('billing_address', watchedShippingAddress);
    }
  }, [watchedShippingAddress, useSameAddress, setValue]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!items || items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);

  const paymentMethods = [
    {
      id: 'cash_on_delivery',
      name: 'Cash on Delivery',
      description: 'Pay when you receive your order',
      icon: BanknotesIcon,
      available: true
    },
    {
      id: 'bkash',
      name: 'bKash',
      description: 'Pay using bKash mobile banking',
      icon: CreditCardIcon,
      available: true
    },
    {
      id: 'nagad',
      name: 'Nagad',
      description: 'Pay using Nagad mobile banking',
      icon: CreditCardIcon,
      available: true
    },
    {
      id: 'rocket',
      name: 'Rocket',
      description: 'Pay using Rocket mobile banking',
      icon: CreditCardIcon,
      available: true
    },
    {
      id: 'upay',
      name: 'Upay',
      description: 'Pay using Upay mobile banking',
      icon: CreditCardIcon,
      available: true
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Pay using credit or debit card',
      icon: CreditCardIcon,
      available: true
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      description: 'Pay via bank transfer',
      icon: BanknotesIcon,
      available: false
    }
  ];

  const shippingMethods = [
    {
      id: 'standard',
      name: 'Standard Delivery',
      description: '3-5 business days',
      cost: 60,
      icon: TruckIcon
    },
    {
      id: 'express',
      name: 'Express Delivery',
      description: '1-2 business days',
      cost: 120,
      icon: TruckIcon
    },
    {
      id: 'overnight',
      name: 'Overnight Delivery',
      description: 'Next business day',
      cost: 200,
      icon: TruckIcon
    },
    {
      id: 'pickup',
      name: 'Store Pickup',
      description: 'Free pickup from our store',
      cost: 0,
      icon: MapPinIcon
    }
  ];

  const calculateTax = () => {
    return summary.subtotal * 0.05; // 5% tax
  };

  const calculateTotal = () => {
    const tax = calculateTax();
    const shippingCost = shippingMethods.find(m => m.id === selectedShippingMethod)?.cost || 0;
    return summary.subtotal + tax + shippingCost;
  };

  const onSubmit = async (data) => {
    if (!isValid) return;

    setIsLoading(true);
    try {
      const orderData = {
        ...data,
        payment_method: selectedPaymentMethod,
        shipping_method: selectedShippingMethod
      };

      const order = await createOrder(orderData);
      
      if (selectedPaymentMethod === 'card') {
        setCurrentOrder(order);
        setShowPaymentForm(true);
      } else {
        // Clear cart after successful order
        clearCart();
        
        // Redirect to order confirmation
        router.push(`/orders/${order.id}/confirmation`);
      }
    } catch (error) {
      console.error('Checkout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-600 mt-2">Complete your purchase</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-8">
              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <MapPinIcon className="h-6 w-6 text-rose-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Shipping Address</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        {...register('shipping_address.full_name', { required: 'Full name is required' })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    </div>
                    {errors.shipping_address?.full_name && (
                      <p className="text-red-500 text-sm mt-1">{errors.shipping_address.full_name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <PhoneIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="tel"
                        {...register('shipping_address.phone', { required: 'Phone number is required' })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    {errors.shipping_address?.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.shipping_address.phone.message}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      {...register('shipping_address.address', { required: 'Address is required' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="Enter your full address"
                    />
                    {errors.shipping_address?.address && (
                      <p className="text-red-500 text-sm mt-1">{errors.shipping_address.address.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      {...register('shipping_address.city', { required: 'City is required' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="Enter your city"
                    />
                    {errors.shipping_address?.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.shipping_address.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      {...register('shipping_address.postal_code', { required: 'Postal code is required' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="Enter postal code"
                    />
                    {errors.shipping_address?.postal_code && (
                      <p className="text-red-500 text-sm mt-1">{errors.shipping_address.postal_code.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <BuildingOfficeIcon className="h-6 w-6 text-rose-600 mr-3" />
                    <h2 className="text-xl font-semibold text-gray-900">Billing Address</h2>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={useSameAddress}
                      onChange={(e) => setUseSameAddress(e.target.checked)}
                      className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">Same as shipping address</span>
                  </label>
                </div>

                {!useSameAddress && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        {...register('billing_address.full_name', { required: !useSameAddress && 'Full name is required' })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        placeholder="Enter billing name"
                        disabled={useSameAddress}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        {...register('billing_address.phone', { required: !useSameAddress && 'Phone number is required' })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        placeholder="Enter billing phone"
                        disabled={useSameAddress}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        {...register('billing_address.address', { required: !useSameAddress && 'Address is required' })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        placeholder="Enter billing address"
                        disabled={useSameAddress}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        {...register('billing_address.city', { required: !useSameAddress && 'City is required' })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        placeholder="Enter billing city"
                        disabled={useSameAddress}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        {...register('billing_address.postal_code', { required: !useSameAddress && 'Postal code is required' })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        placeholder="Enter billing postal code"
                        disabled={useSameAddress}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <CreditCardIcon className="h-6 w-6 text-rose-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Payment Method</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedPaymentMethod === method.id
                          ? 'border-rose-500 bg-rose-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${!method.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => method.available && setSelectedPaymentMethod(method.id)}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value={method.id}
                        checked={selectedPaymentMethod === method.id}
                        onChange={() => method.available && setSelectedPaymentMethod(method.id)}
                        className="sr-only"
                        disabled={!method.available}
                      />
                      <div className="flex items-start">
                        <method.icon className="h-6 w-6 text-rose-600 mr-3 mt-1" />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{method.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                          {!method.available && (
                            <p className="text-sm text-orange-600 mt-1">Coming soon</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Method */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <TruckIcon className="h-6 w-6 text-rose-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Shipping Method</h2>
                </div>

                <div className="space-y-3">
                  {shippingMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedShippingMethod === method.id
                          ? 'border-rose-500 bg-rose-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedShippingMethod(method.id)}
                    >
                      <input
                        type="radio"
                        name="shipping_method"
                        value={method.id}
                        checked={selectedShippingMethod === method.id}
                        onChange={() => setSelectedShippingMethod(method.id)}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <method.icon className="h-6 w-6 text-rose-600 mr-3" />
                          <div>
                            <h3 className="font-medium text-gray-900">{method.name}</h3>
                            <p className="text-sm text-gray-600">{method.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-semibold text-gray-900">
                            {method.cost === 0 ? 'Free' : `৳${method.cost.toFixed(2)}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Notes */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <IdentificationIcon className="h-6 w-6 text-rose-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Order Notes (Optional)</h2>
                </div>
                <textarea
                  {...register('notes')}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="Add any special instructions or notes for your order..."
                />
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>

                {/* Cart Items */}
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <img
                        src={item.product.images?.[0]?.url || '/placeholder-product.jpg'}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 line-clamp-2">{item.product.name}</h3>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">৳{(item.product.selling_price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Totals */}
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">৳{summary.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (5%)</span>
                    <span className="text-gray-900">৳{calculateTax().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">
                      {shippingMethods.find(m => m.id === selectedShippingMethod)?.cost === 0 
                        ? 'Free' 
                        : `৳${shippingMethods.find(m => m.id === selectedShippingMethod)?.cost.toFixed(2)}`
                      }
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-rose-600">৳{calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Place Order Button */}
                {selectedPaymentMethod === 'card' ? (
                  <div className="mt-6">
                    <PaymentForm
                      orderId={currentOrder?.id}
                      orderTotal={calculateTotal()}
                      onPaymentSuccess={handlePaymentSuccess}
                      onPaymentFailure={handlePaymentFailure}
                    />
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={!isValid || isLoading}
                    className="w-full mt-6 bg-gradient-to-r from-rose-500 to-pink-500 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-rose-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <LoadingSpinner size="sm" className="mr-2" />
                        Processing...
                      </div>
                    ) : (
                      `Place Order - ৳${calculateTotal().toFixed(2)}`
                    )}
                  </button>
                )}

                {/* Security Notice */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    🔒 Your payment information is secure and encrypted
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
