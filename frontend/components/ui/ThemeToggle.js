'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';

const ThemeToggle = ({ variant = 'default', size = 'md', className = '', showLabel = false, showTooltip = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showTooltipText, setShowTooltipText] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { theme, toggleTheme, setThemeMode } = useTheme();

  if (!mounted) {
    return <div className={`animate-pulse bg-gray-200 dark:bg-dark-surface-secondary rounded-full ${size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10'}`} />;
  }

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light': return 'Switch to Dark Mode';
      case 'dark': return 'Switch to Light Mode';
      case 'system': return 'Switch Theme';
      default: return 'Toggle Theme';
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return <MoonIcon className={`${iconSizes[size]} transition-all duration-300`} />;
      case 'dark': return <SunIcon className={`${iconSizes[size]} transition-all duration-300`} />;
      case 'system': return <ComputerDesktopIcon className={`${iconSizes[size]} transition-all duration-300`} />;
      default: return <SunIcon className={`${iconSizes[size]} transition-all duration-300`} />;
    }
  };

  if (variant === 'simple') {
    return (
      <div className="relative group">
        <button
          onClick={toggleTheme}
          onMouseEnter={() => showTooltip && setShowTooltipText(true)}
          onMouseLeave={() => showTooltip && setShowTooltipText(false)}
          className={`relative inline-flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 p-2 transition-all duration-300 hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50 ${sizeClasses[size]} ${className}`}
          aria-label={getThemeLabel()}
        >
          <div className="relative">
            {getThemeIcon()}
            
            {/* Animated background */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400/0 to-blue-400/0 opacity-0 hover:opacity-20 transition-opacity duration-300" />
          </div>
        </button>

        {/* Enhanced Tooltip */}
        {showTooltip && showTooltipText && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/80 text-white text-xs rounded-lg whitespace-nowrap z-50 animate-fade-in-up">
            {getThemeLabel()}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80"></div>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => showTooltip && setShowTooltipText(true)}
          onMouseLeave={() => showTooltip && setShowTooltipText(false)}
          className={`relative inline-flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 p-2 transition-all duration-300 hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50 ${sizeClasses[size]} ${className}`}
          aria-label="Theme options"
        >
          <div className="relative">
            {getThemeIcon()}
          </div>
        </button>

        {/* Enhanced Tooltip */}
        {showTooltip && showTooltipText && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/80 text-white text-xs rounded-lg whitespace-nowrap z-50 animate-fade-in-up">
            Choose Theme
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80"></div>
          </div>
        )}

        {/* Enhanced Dropdown Menu */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl bg-white/95 dark:bg-dark-bg-modal/95 backdrop-blur-xl border border-white/30 dark:border-dark-border-primary/30 shadow-2xl shadow-gray-500/20 dark:shadow-dark-large py-3 animate-fade-in-up">
              {/* Header */}
              <div className="px-4 py-2 border-b border-gray-200/50 dark:border-dark-border-divider/50 mb-2">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-text-primary">Choose Theme</h3>
                <p className="text-xs text-gray-500 dark:text-dark-text-tertiary">Select your preferred appearance</p>
              </div>

              {/* Light Theme Option */}
              <button
                onClick={() => {
                  setThemeMode('light');
                  setIsOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-all duration-200 hover:bg-gray-100/80 dark:hover:bg-dark-surface-hover ${
                  theme === 'light' 
                    ? 'text-blue-600 dark:text-dark-accent-primary bg-blue-50/80 dark:bg-dark-surface-selected' 
                    : 'text-gray-700 dark:text-dark-text-secondary'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center ${theme === 'light' ? 'ring-2 ring-blue-500' : ''}`}>
                  <SunIcon className="w-2.5 h-2.5 text-white" />
                </div>
                <div className="flex-1">
                  <span className="font-medium">Light</span>
                  <p className="text-xs text-gray-500 dark:text-dark-text-tertiary">Clean, bright interface</p>
                </div>
                {theme === 'light' && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                )}
              </button>

              {/* Dark Theme Option */}
              <button
                onClick={() => {
                  setThemeMode('dark');
                  setIsOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-all duration-200 hover:bg-gray-100/80 dark:hover:bg-dark-surface-hover ${
                  theme === 'dark' 
                    ? 'text-blue-600 dark:text-dark-accent-primary bg-blue-50/80 dark:bg-dark-surface-selected' 
                    : 'text-gray-700 dark:text-dark-text-secondary'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center ${theme === 'dark' ? 'ring-2 ring-blue-500' : ''}`}>
                  <MoonIcon className="w-2.5 h-2.5 text-white" />
                </div>
                <div className="flex-1">
                  <span className="font-medium">Dark</span>
                  <p className="text-xs text-gray-500 dark:text-dark-text-tertiary">Easy on the eyes</p>
                </div>
                {theme === 'dark' && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                )}
              </button>

              {/* System Theme Option */}
              <button
                onClick={() => {
                  setThemeMode('system');
                  setIsOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-all duration-200 hover:bg-gray-100/80 dark:hover:bg-dark-surface-hover ${
                  theme === 'system' 
                    ? 'text-blue-600 dark:text-dark-accent-primary bg-blue-50/80 dark:bg-dark-surface-selected' 
                    : 'text-gray-700 dark:text-dark-text-secondary'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center ${theme === 'system' ? 'ring-2 ring-blue-500' : ''}`}>
                  <ComputerDesktopIcon className="w-2.5 h-2.5 text-white" />
                </div>
                <div className="flex-1">
                  <span className="font-medium">System</span>
                  <p className="text-xs text-gray-500 dark:text-dark-text-tertiary">Follows OS preference</p>
                </div>
                {theme === 'system' && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                )}
              </button>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-gray-200/50 dark:border-dark-border-divider/50 mt-2">
                <p className="text-xs text-gray-500 dark:text-dark-text-tertiary text-center">
                  Theme preference is saved automatically
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Default variant - Animated toggle
  return (
    <div className="relative group">
      <button
        onClick={toggleTheme}
        onMouseEnter={() => showTooltip && setShowTooltipText(true)}
        onMouseLeave={() => showTooltip && setShowTooltipText(false)}
        className={`relative inline-flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 p-2 transition-all duration-500 hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50 overflow-hidden ${sizeClasses[size]} ${className}`}
        aria-label={getThemeLabel()}
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-blue-400/0 to-purple-400/0 opacity-0 hover:opacity-20 transition-opacity duration-500" />
        
        {/* Icons with smooth transitions */}
        <div className="relative">
          <SunIcon 
            className={`${iconSizes[size]} text-yellow-300 transition-all duration-500 ${
              theme === 'light' 
                ? 'opacity-100 scale-100 rotate-0' 
                : 'opacity-0 scale-75 -rotate-90 absolute inset-0'
            }`} 
          />
          <MoonIcon 
            className={`${iconSizes[size]} text-blue-300 transition-all duration-500 ${
              theme === 'dark' 
                ? 'opacity-100 scale-100 rotate-0' 
                : 'opacity-0 scale-75 rotate-90 absolute inset-0'
            }`} 
          />
        </div>

        {/* Ripple effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400/20 to-blue-400/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />
      </button>

      {/* Enhanced Tooltip */}
      {showTooltip && showTooltipText && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/80 text-white text-xs rounded-lg whitespace-nowrap z-50 animate-fade-in-up">
          {getThemeLabel()}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80"></div>
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
