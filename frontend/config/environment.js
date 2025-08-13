// Environment Configuration
// This file manages environment variables and configuration for the application

const config = {
  // API Configuration
  api: {
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    timeout: 10000,
    retryAttempts: 3,
  },

  // App Configuration
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Shohanis Reflection',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    version: '1.0.0',
  },

  // Feature Flags
  features: {
    analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    pwa: process.env.NEXT_PUBLIC_ENABLE_PWA === 'true',
    search: true,
    wishlist: true,
    reviews: true,
  },

  // Pagination
  pagination: {
    defaultPageSize: 12,
    maxPageSize: 100,
  },

  // Cache Configuration
  cache: {
    products: 5 * 60 * 1000, // 5 minutes
    categories: 30 * 60 * 1000, // 30 minutes
    brands: 30 * 60 * 1000, // 30 minutes
    user: 10 * 60 * 1000, // 10 minutes
  },

  // Image Configuration
  images: {
    domains: ['localhost', 'shohanis-reflection.com'],
    sizes: {
      thumbnail: '150x150',
      small: '300x300',
      medium: '600x600',
      large: '1200x1200',
    },
  },

  // Social Media
  social: {
    facebook: 'https://facebook.com/shohanis-reflection',
    instagram: 'https://instagram.com/shohanis-reflection',
    twitter: 'https://twitter.com/shohanis-reflection',
    youtube: 'https://youtube.com/shohanis-reflection',
  },

  // Contact Information
  contact: {
    email: 'info@shohanis-reflection.com',
    phone: '+880 1234-567890',
    address: 'Dhaka, Bangladesh',
    supportHours: '9:00 AM - 6:00 PM (GMT+6)',
  },

  // Payment Configuration
  payment: {
    currency: 'BDT',
    currencySymbol: '৳',
    supportedMethods: ['cash', 'card', 'mobile_banking'],
  },

  // Shipping Configuration
  shipping: {
    freeShippingThreshold: 5000, // BDT
    standardShippingCost: 100, // BDT
    expressShippingCost: 200, // BDT
    estimatedDelivery: {
      standard: '3-5 business days',
      express: '1-2 business days',
    },
  },
};

export default config;

// Helper function to get environment-specific configuration
export const getConfig = (key) => {
  const keys = key.split('.');
  let value = config;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return undefined;
    }
  }
  
  return value;
};

// Helper function to check if feature is enabled
export const isFeatureEnabled = (featureName) => {
  return config.features[featureName] === true;
};

// Helper function to get API URL
export const getApiUrl = (endpoint = '') => {
  return `${config.api.baseURL}${endpoint}`;
};
