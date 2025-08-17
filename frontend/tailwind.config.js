/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      colors: {
        // Enhanced Dark Theme Color System
        dark: {
          // Primary dark backgrounds
          bg: {
            primary: '#0a0a0a',      // Main background
            secondary: '#111111',     // Secondary background
            tertiary: '#1a1a1a',     // Tertiary background
            elevated: '#222222',      // Elevated surfaces
            card: '#1c1c1c',         // Card backgrounds
            modal: '#1e1e1e',        // Modal backgrounds
            sidebar: '#161616',       // Sidebar backgrounds
            navbar: '#1f1f1f',       // Navigation backgrounds
            footer: '#0f0f0f',       // Footer backgrounds
          },
          // Dark text colors
          text: {
            primary: '#ffffff',       // Primary text
            secondary: '#e5e5e5',     // Secondary text
            tertiary: '#a3a3a3',      // Tertiary text
            muted: '#737373',         // Muted text
            disabled: '#525252',      // Disabled text
            inverse: '#0a0a0a',       // Inverse text (on light backgrounds)
          },
          // Dark border colors
          border: {
            primary: '#333333',       // Primary borders
            secondary: '#404040',     // Secondary borders
            tertiary: '#525252',      // Tertiary borders
            subtle: '#262626',        // Subtle borders
            accent: '#404040',        // Accent borders
            divider: '#2a2a2a',       // Divider lines
          },
          // Dark surface colors
          surface: {
            primary: '#1a1a1a',      // Primary surfaces
            secondary: '#222222',     // Secondary surfaces
            tertiary: '#2a2a2a',     // Tertiary surfaces
            elevated: '#2d2d2d',     // Elevated surfaces
            hover: '#333333',         // Hover states
            active: '#404040',        // Active states
            selected: '#3a3a3a',      // Selected states
          },
          // Dark accent colors
          accent: {
            primary: '#6366f1',       // Primary accent (indigo)
            secondary: '#8b5cf6',     // Secondary accent (violet)
            tertiary: '#ec4899',      // Tertiary accent (pink)
            success: '#10b981',       // Success accent (emerald)
            warning: '#f59e0b',       // Warning accent (amber)
            error: '#ef4444',         // Error accent (red)
            info: '#3b82f6',          // Info accent (blue)
          },
          // Dark gradient colors
          gradient: {
            primary: {
              from: '#1e1b4b',       // Dark indigo
              via: '#3730a3',         // Dark violet
              to: '#581c87',          // Dark purple
            },
            secondary: {
              from: '#0f172a',        // Dark slate
              via: '#1e293b',         // Dark blue
              to: '#1e3a8a',          // Dark blue
            },
            accent: {
              from: '#4a044e',        // Dark pink
              via: '#701a75',         // Dark magenta
              to: '#86198f',          // Dark violet
            },
            sunset: {
              from: '#1e1b4b',        // Dark indigo
              via: '#3730a3',         // Dark violet
              to: '#581c87',          // Dark purple
            },
            ocean: {
              from: '#0f172a',        // Dark slate
              via: '#1e293b',         // Dark blue
              to: '#1e3a8a',          // Dark blue
            },
            forest: {
              from: '#052e16',        // Dark green
              via: '#14532d',         // Dark emerald
              to: '#166534',          // Dark green
            },
            fire: {
              from: '#450a0a',        // Dark red
              via: '#7f1d1d',         // Dark red
              to: '#991b1b',          // Dark red
            },
          },
        },
        // Enhanced light theme colors for consistency
        light: {
          bg: {
            primary: '#ffffff',
            secondary: '#fafafa',
            tertiary: '#f5f5f5',
            elevated: '#ffffff',
            card: '#ffffff',
            modal: '#ffffff',
            sidebar: '#f8fafc',
            navbar: '#ffffff',
            footer: '#f8fafc',
          },
          text: {
            primary: '#171717',
            secondary: '#404040',
            tertiary: '#737373',
            muted: '#a3a3a3',
            disabled: '#d4d4d4',
            inverse: '#ffffff',
          },
          border: {
            primary: '#e5e5e5',
            secondary: '#d4d4d4',
            tertiary: '#a3a3a3',
            subtle: '#f5f5f5',
            accent: '#d4d4d4',
            divider: '#e5e5e5',
          },
          surface: {
            primary: '#ffffff',
            secondary: '#fafafa',
            tertiary: '#f5f5f5',
            elevated: '#ffffff',
            hover: '#f8fafc',
            active: '#f1f5f9',
            selected: '#eff6ff',
          },
        },
        primary: {
          50: '#fef7ee',
          100: '#fdedd6',
          200: '#fad7ac',
          300: '#f6bb77',
          400: '#f1943d',
          500: '#ed7516',
          600: '#de5a0c',
          700: '#b8440c',
          800: '#933612',
          900: '#762e12',
          950: '#4a1f0a',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        accent: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
          950: '#4a044e',
        },
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
        pink: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
          950: '#500724',
        },
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        indigo: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        yellow: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          950: '#422006',
        },
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        green: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        red: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-down': 'fadeInDown 0.6s ease-out',
        'fade-in-left': 'fadeInLeft 0.6s ease-out',
        'fade-in-right': 'fadeInRight 0.6s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'slide-left': 'slideLeft 0.4s ease-out',
        'slide-right': 'slideRight 0.4s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'gradient-x': 'gradientX 3s ease infinite',
        'gradient-y': 'gradientY 3s ease infinite',
        'gradient-xy': 'gradientXY 3s ease infinite',
        'scale-in': 'scaleIn 0.3s ease-out',
        'scale-out': 'scaleOut 0.3s ease-out',
        'rotate-in': 'rotateIn 0.5s ease-out',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        gradientX: {
          '0%, 100%': { transform: 'translateX(0%)' },
          '50%': { transform: 'translateX(100%)' },
        },
        gradientY: {
          '0%, 100%': { transform: 'translateY(0%)' },
          '50%': { transform: 'translateY(100%)' },
        },
        gradientXY: {
          '0%, 100%': { transform: 'translate(0%, 0%)' },
          '50%': { transform: 'translate(100%, 100%)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.9)', opacity: '0' },
        },
        rotateIn: {
          '0%': { transform: 'rotate(-10deg)', opacity: '0' },
          '100%': { transform: 'rotate(0deg)', opacity: '1' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 30px -5px rgba(0, 0, 0, 0.05)',
        'large': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 20px 50px -10px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 20px rgba(237, 117, 22, 0.3)',
        'glow-accent': '0 0 20px rgba(217, 70, 239, 0.3)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'inner-medium': 'inset 0 4px 8px 0 rgba(0, 0, 0, 0.1)',
        // Dark theme specific shadows
        'dark-soft': '0 2px 15px -3px rgba(0, 0, 0, 0.3), 0 10px 20px -2px rgba(0, 0, 0, 0.2)',
        'dark-medium': '0 4px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 30px -5px rgba(0, 0, 0, 0.3)',
        'dark-large': '0 10px 40px -10px rgba(0, 0, 0, 0.5), 0 20px 50px -10px rgba(0, 0, 0, 0.4)',
        'dark-glow': '0 0 20px rgba(99, 102, 241, 0.4)',
        'dark-glow-accent': '0 0 20px rgba(139, 92, 246, 0.4)',
        'dark-glow-success': '0 0 20px rgba(16, 185, 129, 0.4)',
        'dark-glow-warning': '0 0 20px rgba(245, 158, 11, 0.4)',
        'dark-glow-error': '0 0 20px rgba(239, 68, 68, 0.4)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-mesh': 'linear-gradient(45deg, #f093fb 0%, #f5576c 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-forest': 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        'gradient-fire': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        // Dark theme specific gradients
        'dark-gradient-primary': 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 50%, #581c87 100%)',
        'dark-gradient-secondary': 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1e3a8a 100%)',
        'dark-gradient-accent': 'linear-gradient(135deg, #4a044e 0%, #701a75 50%, #86198f 100%)',
        'dark-gradient-sunset': 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 50%, #581c87 100%)',
        'dark-gradient-ocean': 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1e3a8a 100%)',
        'dark-gradient-forest': 'linear-gradient(135deg, #052e16 0%, #14532d 50%, #166534 100%)',
        'dark-gradient-fire': 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 50%, #991b1b 100%)',
        // Dark theme patterns
        'dark-pattern-dots': 'radial-gradient(circle, #333333 1px, transparent 1px)',
        'dark-pattern-grid': 'linear-gradient(#333333 1px, transparent 1px), linear-gradient(90deg, #333333 1px, transparent 1px)',
        'dark-pattern-waves': 'repeating-linear-gradient(45deg, #333333 0, #333333 1px, transparent 0, transparent 50%)',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [],
};
