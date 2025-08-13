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
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-purple-600 to-pink-600 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-white/10 to-pink-300/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-br from-pink-300/10 to-white/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
      
      <div className="container-custom relative z-10">
        <div className="max-w-3xl mx-auto text-center px-4 sm:px-0">
          {/* Enhanced Icon */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 animate-fade-in-up">
            <EnvelopeIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>

          {/* Enhanced Content */}
          <div className="mb-8 sm:mb-10">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-white">Stay Updated</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              Get Beauty Tips & Offers
            </h2>
            <p className="text-lg sm:text-xl text-purple-100 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              Subscribe to our newsletter for weekly offers, new product launches, and beauty tips delivered straight to your inbox.
            </p>
          </div>

          {/* Enhanced Newsletter Form */}
          <form onSubmit={handleSubmit} className="animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-6">
              <div className="flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-6 py-4 rounded-2xl border-0 focus:ring-4 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-purple-600 text-gray-900 placeholder-gray-500 text-base shadow-soft backdrop-blur-sm"
                  disabled={isSubmitting}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-4 bg-white text-purple-600 font-bold rounded-2xl hover:bg-gray-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-base shadow-glow hover:shadow-glow-accent transform hover:scale-105"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                    Subscribing...
                  </span>
                ) : (
                  'Subscribe'
                )}
              </button>
            </div>
          </form>

          {/* Enhanced Additional Info */}
          <div className="animate-fade-in-up" style={{ animationDelay: '1s' }}>
            <p className="text-sm text-purple-200 leading-relaxed">
              By subscribing, you agree to our{' '}
              <a href="/privacy" className="underline hover:text-white transition-colors font-medium">
                Privacy Policy
              </a>{' '}
              and{' '}
              <a href="/terms" className="underline hover:text-white transition-colors font-medium">
                Terms of Service
              </a>
            </p>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-6 mt-6 text-xs text-purple-200">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>No spam, unsubscribe anytime</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Exclusive offers & tips</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                <span>Beauty industry insights</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}