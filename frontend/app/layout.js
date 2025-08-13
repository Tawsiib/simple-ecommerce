import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { Providers } from './providers';
import AuthProvider from '../components/auth/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Shohanis Reflection - Beauty & Skincare',
  description: 'Discover premium beauty and skincare products at Shohanis Reflection. Shop the latest trends in cosmetics, skincare, and beauty essentials.',
  keywords: 'beauty, skincare, cosmetics, makeup, skincare products, beauty products, Shohanis Reflection',
  authors: [{ name: 'Shohanis Reflection' }],
  creator: 'Shohanis Reflection',
  publisher: 'Shohanis Reflection',
  robots: 'index, follow',
  openGraph: {
    title: 'Shohanis Reflection - Beauty & Skincare',
    description: 'Discover premium beauty and skincare products at Shohanis Reflection.',
    url: 'https://shohanis-reflection.com',
    siteName: 'Shohanis Reflection',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Shohanis Reflection - Beauty & Skincare',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shohanis Reflection - Beauty & Skincare',
    description: 'Discover premium beauty and skincare products at Shohanis Reflection.',
    images: ['/og-image.jpg'],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f43f5e',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <Providers>
          <AuthProvider>
            {children}
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
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
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
