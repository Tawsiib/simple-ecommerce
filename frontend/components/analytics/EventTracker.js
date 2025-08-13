"use client";

import { useEffect, useCallback } from 'react';

const EventTracker = ({ 
  enableTracking = true,
  trackPageViews = true,
  trackUserInteractions = true,
  trackEcommerceEvents = true
}) => {
  
  // Track page view
  const trackPageView = useCallback((url, title) => {
    if (!enableTracking || !trackPageViews) return;
    
    // Google Analytics tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID, {
        page_path: url,
        page_title: title
      });
    }
    
    // Custom analytics tracking
    if (typeof window !== 'undefined' && window.trackGAEvent) {
      window.trackGAEvent('page_view', {
        page_url: url,
        page_title: title,
        timestamp: new Date().toISOString()
      });
    }
  }, [enableTracking, trackPageViews]);

  // Track user interaction
  const trackInteraction = useCallback((eventType, eventData = {}) => {
    if (!enableTracking || !trackUserInteractions) return;
    
    const event = {
      event_type: eventType,
      timestamp: new Date().toISOString(),
      ...eventData
    };
    
    // Google Analytics tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventType, eventData);
    }
    
    // Custom analytics tracking
    if (typeof window !== 'undefined' && window.trackGAEvent) {
      window.trackGAEvent(eventType, eventData);
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Event tracked:', event);
    }
  }, [enableTracking, trackUserInteractions]);

  // Track ecommerce events
  const trackEcommerceEvent = useCallback((eventType, ecommerceData = {}) => {
    if (!enableTracking || !trackEcommerceEvents) return;
    
    // Google Analytics ecommerce tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventType, {
        ecommerce: ecommerceData
      });
    }
    
    // Custom ecommerce tracking
    if (typeof window !== 'undefined' && window.trackGAEcommerce) {
      window.trackGAEcommerce(eventType, ecommerceData);
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Ecommerce event tracked:', { eventType, ecommerceData });
    }
  }, [enableTracking, trackEcommerceEvents]);

  // Track form submissions
  const trackFormSubmission = useCallback((formName, formData = {}) => {
    trackInteraction('form_submit', {
      form_name: formName,
      form_data: formData
    });
  }, [trackInteraction]);

  // Track button clicks
  const trackButtonClick = useCallback((buttonName, buttonData = {}) => {
    trackInteraction('button_click', {
      button_name: buttonName,
      button_data: buttonData
    });
  }, [trackInteraction]);

  // Track search queries
  const trackSearch = useCallback((searchTerm, searchResults = 0) => {
    trackInteraction('search', {
      search_term: searchTerm,
      search_results: searchResults
    });
  }, [trackInteraction]);

  // Track product interactions
  const trackProductInteraction = useCallback((interactionType, product, additionalData = {}) => {
    const eventData = {
      product_id: product.id,
      product_name: product.name,
      product_category: product.category?.name,
      product_brand: product.brand?.name,
      product_price: product.price,
      ...additionalData
    };
    
    trackInteraction(interactionType, eventData);
  }, [trackInteraction]);

  // Track cart interactions
  const trackCartInteraction = useCallback((interactionType, cartData = {}) => {
    trackInteraction(interactionType, {
      cart_items_count: cartData.items_count || 0,
      cart_total: cartData.total || 0,
      ...cartData
    });
  }, [trackInteraction]);

  // Track checkout steps
  const trackCheckoutStep = useCallback((stepNumber, stepName, stepData = {}) => {
    trackInteraction('checkout_step', {
      step_number: stepNumber,
      step_name: stepName,
      ...stepData
    });
  }, [trackInteraction]);

  // Track user engagement
  const trackEngagement = useCallback((engagementType, engagementData = {}) => {
    trackInteraction('user_engagement', {
      engagement_type: engagementType,
      ...engagementData
    });
  }, [trackInteraction]);

  // Expose tracking functions globally
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.trackEvent = trackInteraction;
      window.trackEcommerceEvent = trackEcommerceEvent;
      window.trackFormSubmission = trackFormSubmission;
      window.trackButtonClick = trackButtonClick;
      window.trackSearch = trackSearch;
      window.trackProductInteraction = trackProductInteraction;
      window.trackCartInteraction = trackCartInteraction;
      window.trackCheckoutStep = trackCheckoutStep;
      window.trackEngagement = trackEngagement;
    }
  }, [
    trackInteraction,
    trackEcommerceEvent,
    trackFormSubmission,
    trackButtonClick,
    trackSearch,
    trackProductInteraction,
    trackCartInteraction,
    trackCheckoutStep,
    trackEngagement
  ]);

  // Track initial page view
  useEffect(() => {
    if (typeof window !== 'undefined') {
      trackPageView(window.location.pathname, document.title);
    }
  }, [trackPageView]);

  return null; // This component doesn't render anything
};

export default EventTracker;
