"use client";

import { useState, useEffect } from 'react';

export default function ResponsiveWrapper({ 
  children, 
  className = '', 
  mobileClassName = '',
  tabletClassName = '',
  desktopClassName = '',
  showOnMobile = true,
  showOnTablet = true,
  showOnDesktop = true
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
      setIsTablet(width >= 640 && width < 1024);
      setIsDesktop(width >= 1024);
    };

    // Check on mount
    checkScreenSize();

    // Add event listener
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Determine which classes to apply based on screen size
  const getResponsiveClasses = () => {
    let classes = className;
    
    if (isMobile && mobileClassName) {
      classes += ` ${mobileClassName}`;
    }
    
    if (isTablet && tabletClassName) {
      classes += ` ${tabletClassName}`;
    }
    
    if (isDesktop && desktopClassName) {
      classes += ` ${desktopClassName}`;
    }
    
    return classes;
  };

  // Determine if component should be visible
  const shouldShow = () => {
    if (isMobile) return showOnMobile;
    if (isTablet) return showOnTablet;
    if (isDesktop) return showOnDesktop;
    return true;
  };

  if (!shouldShow()) {
    return null;
  }

  return (
    <div className={getResponsiveClasses()}>
      {children}
    </div>
  );
}

// Hook for responsive behavior
export function useResponsive() {
  const [screenSize, setScreenSize] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    width: 0
  });

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setScreenSize({
        isMobile: width < 640,
        isTablet: width >= 640 && width < 1024,
        isDesktop: width >= 1024,
        width
      });
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return screenSize;
}

// Responsive breakpoint constants
export const BREAKPOINTS = {
  MOBILE: 640,
  TABLET: 1024,
  DESKTOP: 1280,
  XL: 1536
};

// Responsive image component
export function ResponsiveImage({ 
  src, 
  alt, 
  mobileSrc, 
  tabletSrc, 
  desktopSrc,
  className = '',
  ...props 
}) {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const getImageSrc = () => {
    if (isMobile && mobileSrc) return mobileSrc;
    if (isTablet && tabletSrc) return tabletSrc;
    if (isDesktop && desktopSrc) return desktopSrc;
    return src;
  };

  return (
    <img
      src={getImageSrc()}
      alt={alt}
      className={className}
      {...props}
    />
  );
}

// Responsive text component
export function ResponsiveText({ 
  children, 
  mobileSize = 'sm',
  tabletSize = 'base',
  desktopSize = 'lg',
  className = '',
  ...props 
}) {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const getTextSize = () => {
    if (isMobile) return mobileSize;
    if (isTablet) return tabletSize;
    if (isDesktop) return desktopSize;
    return desktopSize;
  };

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl'
  };

  return (
    <span 
      className={`${sizeClasses[getTextSize()]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
