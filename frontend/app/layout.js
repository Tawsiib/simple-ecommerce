import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { Providers } from './providers';
import AuthProvider from '../components/auth/AuthProvider';
import ClientOnly from '../components/ClientOnly';
import { ThemeProvider } from '../contexts/ThemeContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Shohanis Reflection - Beauty & Skin',
  description: 'Discover premium skincare and beauty products for radiant, healthy skin. Shop our curated collection of dermatologist-recommended products.',
  keywords: 'skincare, beauty, cosmetics, anti-aging, moisturizer, sunscreen, cleanser, serum',
  authors: [{ name: 'Shohanis Reflection' }],
  creator: 'Shohanis Reflection',
  publisher: 'Shohanis Reflection',
  robots: 'index, follow',
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://shohanis-reflection.com',
    siteName: 'Shohanis Reflection',
    title: 'Shohanis Reflection - Beauty & Skin',
    description: 'Discover premium skincare and beauty products for radiant, healthy skin.',
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shohanis Reflection - Beauty & Skin',
    description: 'Discover premium skincare and beauty products for radiant, healthy skin.',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f43f5e',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-slate-50 dark:bg-slate-950">
      <body className={`${inter.className} bg-slate-50 dark:bg-slate-950 transition-colors duration-300`}>
        <Providers>
          <ClientOnly fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-950" />}>
            <ThemeProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </ThemeProvider>
          </ClientOnly>
        </Providers>
        <ClientOnly>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </ClientOnly>
      </body>
    </html>
  );
}
