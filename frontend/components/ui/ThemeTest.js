'use client';

import { useTheme } from '../../contexts/ThemeContext';

const ThemeTest = () => {
  const { theme, toggleTheme, setThemeMode, debugTheme } = useTheme();

  return (
    <div className="p-4 space-y-4">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Theme Test Component
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Current theme: <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{theme}</span>
        </p>
        
        <div className="space-y-2">
          <button
            onClick={toggleTheme}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2"
          >
            Toggle Theme
          </button>
          
          <button
            onClick={() => setThemeMode('light')}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded mr-2"
          >
            Set Light
          </button>
          
          <button
            onClick={() => setThemeMode('dark')}
            className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded mr-2"
          >
            Set Dark
          </button>
          
          <button
            onClick={() => setThemeMode('system')}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded mr-2"
          >
            Set System
          </button>
          
          <button
            onClick={debugTheme}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Debug Theme
          </button>
        </div>
        
        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            This background should change with the theme. If you see this text clearly, the theme is working.
          </p>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 p-4 rounded-lg">
        <p className="text-blue-900 dark:text-blue-100">
          This gradient background should also change with the theme.
        </p>
      </div>
    </div>
  );
};

export default ThemeTest;
