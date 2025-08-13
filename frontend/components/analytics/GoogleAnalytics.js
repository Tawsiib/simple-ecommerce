"use client";

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const GoogleAnalytics = ({ 
  measurementId, 
  debugMode = false,
  enableEcommerce = true,
  enableEnhancedEcommerce = true 
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!measurementId || typeof window === 'undefined') return;

    // Load Google Analytics script
    const loadGA = () => {
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      script.async = true;
      document.head.appendChild(script);

      script.onload = () => {
        window.dataLayer = window.dataLayer || [];
        window.gtag = function() {
          window.dataLayer.push(arguments);
        };

        window.gtag('js', new Date());
        window.gtag('config', measurementId, {
          debug_mode: debugMode,
          page_title: document.title,
          page_location: window.location.href,
        });

        // Enable ecommerce if specified
        if (enableEcommerce) {
          window.gtag('config', measurementId, {
            'ecommerce': {
              'enhanced_ecommerce': enableEnhancedEcommerce
            }
          });
        }
      };
    };

    loadGA();
  }, [measurementId, debugMode, enableEcommerce, enableEnhancedEcommerce]);

  // Track page views
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', measurementId, {
        page_path: pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ''),
        page_title: document.title,
      });
    }
  }, [pathname, searchParams, measurementId]);

  // Track custom events
  const trackEvent = (eventName, parameters = {}) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, parameters);
    }
  };

  // Track ecommerce events
  const trackEcommerceEvent = (eventName, ecommerceData = {}) => {
    if (typeof window !== 'undefined' && window.gtag && enableEcommerce) {
      window.gtag('event', eventName, {
        ecommerce: ecommerceData
      });
    }
  };

  // Track product views
  const trackProductView = (product) => {
    if (enableEcommerce) {
      trackEcommerceEvent('view_item', {
        currency: 'BDT',
        value: product.price,
        items: [{
          item_id: product.id,
          item_name: product.name,
          item_category: product.category?.name,
          item_brand: product.brand?.name,
          price: product.price,
          currency: 'BDT'
        }]
      });
    }
  };

  // Track add to cart
  const trackAddToCart = (product, quantity = 1) => {
    if (enableEcommerce) {
      trackEcommerceEvent('add_to_cart', {
        currency: 'BDT',
        value: product.price * quantity,
        items: [{
          item_id: product.id,
          item_name: product.name,
          item_category: product.category?.name,
          item_brand: product.brand?.name,
          price: product.price,
          quantity: quantity,
          currency: 'BDT'
        }]
      });
    }
  };

  // Track purchase
  const trackPurchase = (order) => {
    if (enableEcommerce) {
      trackEcommerceEvent('purchase', {
        transaction_id: order.order_number,
        value: order.total_amount,
        tax: order.tax_amount || 0,
        shipping: order.shipping_cost || 0,
        currency: 'BDT',
        items: order.items?.map(item => ({
          item_id: item.product_id,
          item_name: item.product_name,
          item_category: item.category?.name,
          item_brand: item.brand?.name,
          price: item.unit_price,
          quantity: item.quantity,
          currency: 'BDT'
        })) || []
      });
    }
  };

  // Track search
  const trackSearch = (searchTerm) => {
    trackEvent('search', {
      search_term: searchTerm
    });
  };

  // Track user engagement
  const trackEngagement = (engagementType, value = null) => {
    trackEvent('user_engagement', {
      engagement_type: engagementType,
      value: value
    });
  };

  // Expose tracking functions globally for use in other components
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.trackGAEvent = trackEvent;
      window.trackGAEcommerce = trackEcommerceEvent;
      window.trackGAProductView = trackProductView;
      window.trackGAAddToCart = trackAddToCart;
      window.trackGAPurchase = trackPurchase;
      window.trackGASearch = trackSearch;
      window.trackGAEngagement = trackEngagement;
    }
  }, []);

  return null; // This component doesn't render anything
};

export default GoogleAnalytics;
