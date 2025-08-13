'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { 
  CheckCircleIcon, 
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import usePaymentStore from '../../../lib/stores/paymentStore.js';

const PaymentConfirmationContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState('processing');
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState(null);
  
  const { confirmPayment, isLoading } = usePaymentStore();

  useEffect(() => {
    const paymentIntentId = searchParams.get('payment_intent');
    const redirectStatus = searchParams.get('redirect_status');

    if (!paymentIntentId) {
      setError('Payment intent not found');
      setPaymentStatus('failed');
      return;
    }

    if (redirectStatus === 'succeeded') {
      handlePaymentSuccess(paymentIntentId);
    } else if (redirectStatus === 'failed') {
      setPaymentStatus('failed');
      setError('Payment was cancelled or failed');
    } else {
      // Try to confirm the payment
      handlePaymentConfirmation(paymentIntentId);
    }
  }, [searchParams]);

  const handlePaymentConfirmation = async (paymentIntentId) => {
    try {
      setPaymentStatus('processing');
      const result = await confirmPayment(paymentIntentId);
      
      if (result.success) {
        setPaymentStatus('success');
        setOrderId(result.orderId);
        toast.success('Payment confirmed successfully!');
      } else {
        setPaymentStatus('failed');
        setError(result.error || 'Payment confirmation failed');
        toast.error('Payment confirmation failed');
      }
    } catch (error) {
      setPaymentStatus('failed');
      setError(error.message || 'Payment confirmation failed');
      toast.error('Payment confirmation failed');
    }
  };

  const handlePaymentSuccess = async (paymentIntentId) => {
    try {
      const result = await confirmPayment(paymentIntentId);
      if (result.success) {
        setPaymentStatus('success');
        setOrderId(result.orderId);
        toast.success('Payment successful!');
      } else {
        setPaymentStatus('failed');
        setError(result.error || 'Payment failed');
      }
    } catch (error) {
      setPaymentStatus('failed');
      setError(error.message || 'Payment failed');
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'success':
        return <CheckCircleIcon className="h-16 w-16 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="h-16 w-16 text-red-500" />;
      case 'processing':
        return <ExclamationTriangleIcon className="h-16 w-16 text-yellow-500" />;
      default:
        return <ExclamationTriangleIcon className="h-16 w-16 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (paymentStatus) {
      case 'success':
        return 'Payment Successful!';
      case 'failed':
        return 'Payment Failed';
      case 'processing':
        return 'Confirming Payment...';
      default:
        return 'Payment Status Unknown';
    }
  };

  const getStatusDescription = () => {
    switch (paymentStatus) {
      case 'success':
        return 'Your payment has been processed successfully. Your order is now being prepared.';
      case 'failed':
        return 'We were unable to process your payment. Please try again or contact support.';
      case 'processing':
        return 'Please wait while we confirm your payment...';
      default:
        return 'Something went wrong. Please contact support.';
    }
  };

  if (isLoading || paymentStatus === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing Payment</h2>
          <p className="text-gray-600">Please wait while we confirm your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center text-rose-600 hover:text-rose-700 font-medium"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Home
            </Link>
          </div>

          {/* Payment Status Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            {/* Status Icon */}
            <div className="flex justify-center mb-6">
              {getStatusIcon()}
            </div>

            {/* Status Text */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {getStatusText()}
            </h1>

            {/* Status Description */}
            <p className="text-lg text-gray-600 mb-8">
              {getStatusDescription()}
            </p>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              {paymentStatus === 'success' && orderId ? (
                <Link
                  href={`/orders/${orderId}/confirmation`}
                  className="inline-block w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-rose-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
                >
                  View Order Details
                </Link>
              ) : paymentStatus === 'failed' ? (
                <Link
                  href="/checkout"
                  className="inline-block w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-rose-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
                >
                  Try Again
                </Link>
              ) : null}

              <Link
                href="/"
                className="inline-block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>

            {/* Additional Information */}
            {paymentStatus === 'success' && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">What happens next?</h3>
                <div className="text-left space-y-2 text-sm text-gray-600">
                  <p>✅ Your order has been confirmed</p>
                  <p>📧 You'll receive an email confirmation shortly</p>
                  <p>📦 We'll start processing your order immediately</p>
                  <p>🚚 You'll receive tracking information once shipped</p>
                </div>
              </div>
            )}

            {paymentStatus === 'failed' && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Need help?</h3>
                <div className="text-left space-y-2 text-sm text-gray-600">
                  <p>📞 Contact our support team</p>
                  <p>💬 Live chat available 24/7</p>
                  <p>📧 Email: support@shohanis-reflection.com</p>
                  <p>📱 WhatsApp: +880 1234-567890</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentConfirmation = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    }>
      <PaymentConfirmationContent />
    </Suspense>
  );
};

export default PaymentConfirmation;
