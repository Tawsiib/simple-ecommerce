'use client';

import { createContext, useContext, useEffect, useState } from 'react';

// Default theme context value
const defaultThemeContext = {
  theme: 'light',
  toggleTheme: () => {},
  setThemeMode: () => {}
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

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      const initialTheme = savedTheme || systemTheme;
      
      setTheme(initialTheme);
      setMounted(true);
      
      // Apply theme to document
      document.documentElement.setAttribute('data-theme', initialTheme);
      document.documentElement.classList.toggle('dark', initialTheme === 'dark');
    } catch (error) {
      console.warn('Failed to initialize theme:', error);
      setMounted(true);
    }
  }, []);

  // Watch for system theme changes
  useEffect(() => {
    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        try {
          if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            setTheme(newTheme);
            document.documentElement.setAttribute('data-theme', newTheme);
            document.documentElement.classList.toggle('dark', newTheme === 'dark');
          }
        } catch (error) {
          console.warn('Failed to handle theme change:', error);
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
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
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    } catch (error) {
      console.warn('Failed to toggle theme:', error);
    }
  };

  const setThemeMode = (newTheme) => {
    try {
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    } catch (error) {
      console.warn('Failed to set theme mode:', error);
    }
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <ThemeContext.Provider value={defaultThemeContext}>
        <div style={{ visibility: 'hidden' }}>{children}</div>
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
