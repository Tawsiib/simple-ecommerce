'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

const ThemeShowcase = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { theme } = useTheme();

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 transition-all duration-500">
        <div className="container-custom py-16">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg mb-8"></div>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-8"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 transition-all duration-500">
      <div className="container-custom py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Theme Showcase
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Experience the beautiful light and dark themes
          </p>
          
          {/* Theme Toggle Row */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className="text-gray-700 dark:text-gray-300 font-medium">Current Theme:</span>
            <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-semibold capitalize">
              {theme}
            </span>
            <ThemeToggle variant="dropdown" size="lg" />
          </div>
        </div>

        {/* Theme Examples Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Cards */}
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Card Component</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Beautiful cards that adapt to your theme preference
            </p>
            <div className="space-y-3">
              <div className="badge badge-primary">Primary Badge</div>
              <div className="badge badge-secondary">Secondary Badge</div>
              <div className="badge badge-accent">Accent Badge</div>
            </div>
          </div>

          {/* Buttons */}
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Button Components</h3>
            <div className="space-y-3">
              <button className="btn-primary w-full">Primary Button</button>
              <button className="btn-secondary w-full">Secondary Button</button>
              <button className="btn-outline w-full">Outline Button</button>
            </div>
          </div>

          {/* Forms */}
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Form Elements</h3>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="Input field" 
                className="input-field"
              />
              <textarea 
                placeholder="Textarea" 
                className="input-field resize-none"
                rows="3"
              />
            </div>
          </div>

          {/* Gradients */}
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Gradient Backgrounds</h3>
            <div className="space-y-3">
              <div className="h-20 bg-gradient-primary rounded-xl"></div>
              <div className="h-20 bg-gradient-accent rounded-xl"></div>
              <div className="h-20 bg-gradient-sunset rounded-xl"></div>
            </div>
          </div>

          {/* Text Gradients */}
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Text Gradients</h3>
            <div className="space-y-3">
              <p className="text-gradient-primary text-2xl font-bold">Primary Gradient</p>
              <p className="text-gradient-accent text-2xl font-bold">Accent Gradient</p>
              <p className="text-gradient-sunset text-2xl font-bold">Sunset Gradient</p>
            </div>
          </div>

          {/* Animations */}
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Animations</h3>
            <div className="space-y-3">
              <div className="h-20 bg-blue-500 rounded-xl animate-float"></div>
              <div className="h-20 bg-purple-500 rounded-xl animate-pulse"></div>
              <div className="h-20 bg-green-500 rounded-xl animate-bounce"></div>
            </div>
          </div>
        </div>

        {/* Color Palette */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 text-center mb-8">
            Color Palette
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {['50', '100', '200', '300', '400', '500', '600', '700'].map((shade) => (
              <div key={shade} className="text-center">
                <div className={`w-16 h-16 bg-blue-${shade} dark:bg-blue-${parseInt(shade) + 400} rounded-lg mx-auto mb-2`}></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Blue {shade}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Theme Info */}
        <div className="mt-16 text-center">
          <div className="card p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Theme Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">✨ Light Theme</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Clean white backgrounds</li>
                  <li>• High contrast text</li>
                  <li>• Subtle shadows</li>
                  <li>• Soft color palette</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">🌙 Dark Theme</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Deep dark backgrounds</li>
                  <li>• Easy on the eyes</li>
                  <li>• Enhanced shadows</li>
                  <li>• Rich color accents</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Both themes automatically adapt to system preferences and can be manually toggled
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeShowcase;
