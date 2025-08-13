"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function ResponsiveImage({
  src,
  alt,
  mobileSrc,
  tabletSrc,
  desktopSrc,
  className = '',
  fill = false,
  sizes = '',
  priority = false,
  quality = 75,
  placeholder = 'blur',
  blurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==',
  ...props
}) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const updateImageSrc = () => {
      const width = window.innerWidth;
      let newSrc = src;

      if (width < 640 && mobileSrc) {
        newSrc = mobileSrc;
      } else if (width >= 640 && width < 1024 && tabletSrc) {
        newSrc = tabletSrc;
      } else if (width >= 1024 && desktopSrc) {
        newSrc = desktopSrc;
      }

      if (newSrc !== currentSrc) {
        setCurrentSrc(newSrc);
        setIsLoading(true);
        setError(false);
      }
    };

    updateImageSrc();
    window.addEventListener('resize', updateImageSrc);

    return () => window.removeEventListener('resize', updateImageSrc);
  }, [src, mobileSrc, tabletSrc, desktopSrc, currentSrc]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setError(true);
    setIsLoading(false);
  };

  // Default responsive sizes if not provided
  const defaultSizes = sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

  if (error) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500 text-sm">Image not available</span>
      </div>
    );
  }

  if (fill) {
    return (
      <div className={`relative ${className}`}>
        <Image
          src={currentSrc}
          alt={alt}
          fill
          sizes={defaultSizes}
          priority={priority}
          quality={quality}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          onLoad={handleLoad}
          onError={handleError}
          className={`object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          {...props}
        />
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Image
        src={currentSrc}
        alt={alt}
        sizes={defaultSizes}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        {...props}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
}

// Hook for responsive image behavior
export function useResponsiveImage(src, mobileSrc, tabletSrc, desktopSrc) {
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    const updateImageSrc = () => {
      const width = window.innerWidth;
      let newSrc = src;

      if (width < 640 && mobileSrc) {
        newSrc = mobileSrc;
      } else if (width >= 640 && width < 1024 && tabletSrc) {
        newSrc = tabletSrc;
      } else if (width >= 1024 && desktopSrc) {
        newSrc = desktopSrc;
      }

      setCurrentSrc(newSrc);
    };

    updateImageSrc();
    window.addEventListener('resize', updateImageSrc);

    return () => window.removeEventListener('resize', updateImageSrc);
  }, [src, mobileSrc, tabletSrc, desktopSrc]);

  return currentSrc;
}

// Responsive image with lazy loading
export function LazyResponsiveImage({
  src,
  alt,
  mobileSrc,
  tabletSrc,
  desktopSrc,
  className = '',
  threshold = 0.1,
  ...props
}) {
  const [isInView, setIsInView] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    const element = document.querySelector(`[data-lazy-image="${alt}"]`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [alt, threshold]);

  useEffect(() => {
    if (isInView) {
      const width = window.innerWidth;
      let newSrc = src;

      if (width < 640 && mobileSrc) {
        newSrc = mobileSrc;
      } else if (width >= 640 && width < 1024 && tabletSrc) {
        newSrc = tabletSrc;
      } else if (width >= 1024 && desktopSrc) {
        newSrc = desktopSrc;
      }

      setCurrentSrc(newSrc);
    }
  }, [isInView, src, mobileSrc, tabletSrc, desktopSrc]);

  if (!isInView) {
    return (
      <div 
        data-lazy-image={alt}
        className={`bg-gray-200 animate-pulse ${className}`}
        {...props}
      />
    );
  }

  if (!currentSrc) {
    return (
      <div className={`bg-gray-200 ${className}`}>
        <span className="text-gray-500 text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <Image
      src={currentSrc}
      alt={alt}
      className={className}
      {...props}
    />
  );
}
