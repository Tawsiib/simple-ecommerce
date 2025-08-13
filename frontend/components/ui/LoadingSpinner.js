'use client';

export default function LoadingSpinner({ 
  size = 'md', 
  variant = 'primary', 
  className = '' 
}) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
    '2xl': 'w-16 h-16',
  };

  const variantClasses = {
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    accent: 'text-accent-600',
    white: 'text-white',
    gray: 'text-gray-600',
  };

  return (
    <div className={`inline-block ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      <svg
        className="animate-spin"
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}

// Loading skeleton component for content placeholders
export function LoadingSkeleton({ 
  type = 'text', 
  lines = 3, 
  className = '' 
}) {
  if (type === 'text') {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`h-4 bg-gray-200 rounded animate-pulse ${
              index === lines - 1 ? 'w-3/4' : 'w-full'
            }`}
          />
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="bg-gray-200 h-48 rounded-lg"></div>
          <div className="space-y-2">
            <div className="bg-gray-200 h-4 rounded w-3/4"></div>
            <div className="bg-gray-200 h-4 rounded w-1/2"></div>
            <div className="bg-gray-200 h-4 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'avatar') {
    return (
      <div className={`bg-gray-200 rounded-full animate-pulse ${className}`} />
    );
  }

  return null;
}

// Loading overlay for full-page loading states
export function LoadingOverlay({ 
  message = 'Loading...', 
  show = false,
  className = '' 
}) {
  if (!show) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white rounded-lg p-6 flex flex-col items-center space-y-4">
        <LoadingSpinner size="xl" />
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
}

// Inline loading component for buttons and small areas
export function InlineLoading({ 
  text = 'Loading...', 
  size = 'sm',
  className = '' 
}) {
  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <LoadingSpinner size={size} />
      <span className="text-sm text-gray-600">{text}</span>
    </div>
  );
}
