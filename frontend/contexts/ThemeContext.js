'use client';

import { createContext, useContext, useEffect, useState } from 'react';

// Default theme context value
const defaultThemeContext = {
  theme: 'light',
  toggleTheme: () => {},
  setThemeMode: () => {},
  debugTheme: () => {}
};

const ThemeContext = createContext(defaultThemeContext);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  // Always return a valid context, even if it's the default
  return context || defaultThemeContext;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  // Log theme changes for debugging
  useEffect(() => {
    if (mounted) {
      try {
        console.log('Theme state changed:', { 
          theme, 
          hasDarkClass: document.documentElement.classList.contains('dark'),
          hasLightClass: document.documentElement.classList.contains('light'),
          dataTheme: document.documentElement.getAttribute('data-theme'),
          allClasses: document.documentElement.className
        });
      } catch (error) {
        console.warn('Failed to log theme state:', error);
      }
    }
  }, [theme, mounted]);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const initializeTheme = () => {
      try {
        const savedTheme = localStorage.getItem('theme');
        let systemTheme = 'light';
        
        // Check if system theme detection is available
        if (typeof window !== 'undefined' && window.matchMedia) {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          systemTheme = mediaQuery.matches ? 'dark' : 'light';
        }
        
        const initialTheme = savedTheme || systemTheme;
        
        setTheme(initialTheme);
        
        // Apply theme to document
        document.documentElement.setAttribute('data-theme', initialTheme);
        
        // Force remove all theme classes first
        document.documentElement.classList.remove('dark', 'light');
        
        // Add the new theme class
        if (initialTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else if (initialTheme === 'light') {
          document.documentElement.classList.add('light');
        }
        
        // Force a reflow to ensure styles are applied
        document.documentElement.offsetHeight;
        
        console.log('Theme initialized:', { savedTheme, systemTheme, initialTheme });
      } catch (error) {
        console.warn('Failed to initialize theme:', error);
      } finally {
        setMounted(true);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initializeTheme, 0);
    return () => clearTimeout(timer);
  }, []);

  // Watch for system theme changes
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
          try {
                         if (!localStorage.getItem('theme')) {
               const newTheme = e.matches ? 'dark' : 'light';
               setTheme(newTheme);
               document.documentElement.setAttribute('data-theme', newTheme);
               
               // Force remove all theme classes first
               document.documentElement.classList.remove('dark', 'light');
               
               // Add the new theme class
               if (newTheme === 'dark') {
                 document.documentElement.classList.add('dark');
               } else if (newTheme === 'light') {
                 document.documentElement.classList.add('light');
               }
               
               // Force a reflow to ensure styles are applied
               document.documentElement.offsetHeight;
               
               console.log('System theme changed:', { to: newTheme, hasDarkClass: document.documentElement.classList.contains('dark') });
             }
          } catch (error) {
            console.warn('Failed to handle theme change:', error);
          }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      }
    } catch (error) {
      console.warn('Failed to set up theme listener:', error);
    }
  }, []);

  const toggleTheme = () => {
    try {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      
      // Force remove all theme classes first
      document.documentElement.classList.remove('dark', 'light');
      
      // Add the new theme class
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (newTheme === 'light') {
        document.documentElement.classList.add('light');
      }
      
      // Force a reflow to ensure styles are applied
      document.documentElement.offsetHeight;
      
      console.log('Theme toggled:', { from: theme, to: newTheme, hasDarkClass: document.documentElement.classList.contains('dark') });
    } catch (error) {
      console.warn('Failed to toggle theme:', error);
    }
  };

  const setThemeMode = (newTheme) => {
    try {
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      
      // Force remove all theme classes first
      document.documentElement.classList.remove('dark', 'light');
      
      // Add the new theme class
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (newTheme === 'light') {
        document.documentElement.classList.add('light');
      }
      
      // Force a reflow to ensure styles are applied
      document.documentElement.offsetHeight;
      
      console.log('Theme mode set:', { to: newTheme, hasDarkClass: document.documentElement.classList.contains('dark') });
    } catch (error) {
      console.warn('Failed to set theme mode:', error);
    }
  };

  // Debug function to check current theme state
  const debugTheme = () => {
    console.log('Current theme state:', {
      theme,
      localStorage: localStorage.getItem('theme'),
      dataTheme: document.documentElement.getAttribute('data-theme'),
      hasDarkClass: document.documentElement.classList.contains('dark'),
      systemPrefersDark: window.matchMedia('(prefers-color-scheme: dark)').matches
    });
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <ThemeContext.Provider value={defaultThemeContext}>
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setThemeMode, debugTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
