'use client';

import { Component } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

// Error display component
export function ErrorDisplay({ 
  error, 
  onRetry, 
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  className = '' 
}) {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-6 text-center ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-red-800">{title}</h3>
          <p className="text-sm text-red-600 max-w-md">{message}</p>
          {error && (
            <details className="mt-4 text-left">
              <summary className="text-sm text-red-600 cursor-pointer hover:text-red-700">
                Error details
              </summary>
              <pre className="mt-2 text-xs text-red-600 bg-red-100 p-3 rounded overflow-auto">
                {error.message || error.toString()}
              </pre>
            </details>
          )}
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        )}
      </div>
    </div>
  );
}

// Error boundary class component
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorDisplay
          error={this.state.error}
          onRetry={this.handleRetry}
          title="Application Error"
          message="Something went wrong with the application. Please try refreshing the page."
        />
      );
    }

    return this.props.children;
  }
}

// Network error component for API failures
export function NetworkError({ 
  onRetry, 
  message = 'Failed to load data. Please check your connection and try again.',
  className = '' 
}) {
  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-yellow-800">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 inline-flex items-center space-x-1 text-sm text-yellow-700 hover:text-yellow-800 font-medium"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span>Retry</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Empty state component for when no data is available
export function EmptyState({ 
  icon: Icon, 
  title, 
  message, 
  action, 
  className = '' 
}) {
  return (
    <div className={`text-center py-12 ${className}`}>
      {Icon && (
        <div className="mx-auto w-12 h-12 text-gray-400 mb-4">
          <Icon className="w-full h-full" />
        </div>
      )}
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">{message}</p>
      
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  );
}

// Loading error component for when data loading fails
export function LoadingError({ 
  error, 
  onRetry, 
  title = 'Failed to load content',
  message = 'We encountered an error while loading the content. Please try again.',
  className = '' 
}) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <ErrorDisplay
        error={error}
        onRetry={onRetry}
        title={title}
        message={message}
      />
    </div>
  );
}
