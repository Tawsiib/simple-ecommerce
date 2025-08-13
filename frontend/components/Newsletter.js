'use client';

import { useState } from 'react';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { apiClient } from '../lib/api';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await apiClient.post('/newsletter/subscribe', { email });
      
      if (response.data.success) {
        toast.success('Thank you for subscribing to our newsletter!');
        setEmail('');
      } else {
        throw new Error(response.data.message || 'Failed to subscribe');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-br from-primary-600 to-accent-600">
      <div className="container-custom">
        <div className="max-w-2xl mx-auto text-center px-4 sm:px-0">
          {/* Icon */}
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <EnvelopeIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>

          {/* Content */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
            Stay Updated
          </h2>
          <p className="text-base sm:text-lg text-primary-100 mb-6 sm:mb-8 leading-relaxed">
            Subscribe to our newsletter for weekly offers, new product launches, and beauty tips delivered straight to your inbox.
          </p>

          {/* Newsletter Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto">
            <div className="flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600 text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                disabled={isSubmitting}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm sm:text-base"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Subscribing...
                </span>
              ) : (
                'Subscribe'
              )}
            </button>
          </form>

          {/* Additional Info */}
          <p className="text-xs sm:text-sm text-primary-200 mt-3 sm:mt-4 leading-relaxed">
            By subscribing, you agree to our{' '}
            <a href="/privacy" className="underline hover:text-white transition-colors">
              Privacy Policy
            </a>{' '}
            and{' '}
            <a href="/terms" className="underline hover:text-white transition-colors">
              Terms of Service
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}