"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { 
  CreditCardIcon, 
  LockClosedIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import usePaymentStore from '../../lib/stores/paymentStore';
import useCartStore from '../../lib/stores/cartStore';
import useOrderStore from '../../lib/stores/orderStore';

const PaymentForm = ({ orderId, orderTotal, onPaymentSuccess, onPaymentFailure }) => {
  const router = useRouter();
  const { 
    createPaymentIntent, 
    confirmPayment, 
    paymentStatus, 
    error, 
    isLoading,
    resetPayment,
    clearError
  } = usePaymentStore();
  
  const { clearCart } = useCartStore();
  const { updateOrderStatus } = useOrderStore();

  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset payment state when component mounts
  useEffect(() => {
    resetPayment();
    return () => clearError();
  }, []);

  // Handle payment success
  useEffect(() => {
    if (paymentStatus === 'success') {
      handlePaymentSuccess();
    }
  }, [paymentStatus]);

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const validateForm = () => {
    if (!cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
      toast.error('Please enter a valid 16-digit card number');
      return false;
    }
    
    if (!expiryDate.match(/^\d{2}\/\d{2}$/)) {
      toast.error('Please enter a valid expiry date (MM/YY)');
      return false;
    }
    
    if (!cvv.match(/^\d{3,4}$/)) {
      toast.error('Please enter a valid CVV');
      return false;
    }
    
    if (!cardholderName.trim()) {
      toast.error('Please enter the cardholder name');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsProcessing(true);
      clearError();
      
      // In a real app, you'd create a payment method with Stripe first
      // For demo purposes, we'll use a mock payment method ID
      const mockPaymentMethodId = 'pm_mock_' + Date.now();
      
      // Create payment intent
      const { clientSecret, paymentIntentId } = await createPaymentIntent(
        orderId, 
        mockPaymentMethodId
      );
      
      // Confirm payment
      const result = await confirmPayment(paymentIntentId);
      
      if (result.success) {
        toast.success('Payment successful!');
        onPaymentSuccess?.(result.orderId);
      } else {
        toast.error(result.error || 'Payment failed');
        onPaymentFailure?.();
      }
      
    } catch (error) {
      toast.error(error.message || 'Payment failed');
      onPaymentFailure?.();
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      // Update order status
      await updateOrderStatus(orderId, 'processing');
      
      // Clear cart
      clearCart();
      
      // Redirect to order confirmation
      router.push(`/orders/${orderId}/confirmation`);
      
    } catch (error) {
      console.error('Failed to handle payment success:', error);
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="h-6 w-6 text-red-500" />;
      case 'processing':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />;
      default:
        return <LockClosedIcon className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (paymentStatus) {
      case 'success':
        return 'Payment Successful';
      case 'failed':
        return 'Payment Failed';
      case 'processing':
        return 'Processing Payment';
      default:
        return 'Secure Payment';
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            {getStatusIcon()}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {getStatusText()}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Complete your purchase securely
          </p>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Card Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Number
            </label>
            <div className="relative">
              <CreditCardIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="1234 5678 9012 3456"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                maxLength="19"
                required
              />
            </div>
          </div>

          {/* Cardholder Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cardholder Name
            </label>
            <input
              type="text"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              required
            />
          </div>

          {/* Expiry Date and CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date
              </label>
              <input
                type="text"
                value={expiryDate}
                onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                placeholder="MM/YY"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                maxLength="5"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CVV
              </label>
              <input
                type="text"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                placeholder="123"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                maxLength="4"
                required
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Total Amount */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
              <span className="text-2xl font-bold text-rose-600">
                ৳{orderTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isProcessing || isLoading}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-rose-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isProcessing || isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              `Pay ৳${orderTotal.toFixed(2)}`
            )}
          </button>
        </form>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Your payment information is encrypted and secure. We never store your card details.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
