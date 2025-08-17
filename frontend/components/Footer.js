import Link from 'next/link';
import { 
  PhoneIcon, 
  EnvelopeIcon,
  MapPinIcon,
  HeartIcon,
  StarIcon,
  ShieldCheckIcon,
  TruckIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

const footerLinks = {
  information: [
    { name: 'Sitemap', href: '/sitemap' },
    { name: 'Shipping & Returns', href: '/shipping-returns' },
    { name: 'Privacy Notice', href: '/privacy' },
    { name: 'Conditions of Use', href: '/terms' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact Us', href: '/contact' },
    { name: 'Recently Viewed Products', href: '/recently-viewed' },
    { name: 'Compare Products', href: '/compare' },
    { name: 'New Arrival', href: '/category/new-arrival' }
  ],
  customerService: [
    { name: 'Search', href: '/search' },
    { name: 'My Account', href: '/account' },
    { name: 'Orders', href: '/orders' },
    { name: 'Addresses', href: '/addresses' },
    { name: 'Shopping Cart', href: '/cart' },
    { name: 'Wishlist', href: '/wishlist' }
  ],
  categories: [
    { name: 'All Products', href: '/products' },
    { name: 'Acne Treatment', href: '/category/acne-treatment' },
    { name: 'Sunscreen', href: '/category/sunscreen' },
    { name: 'Cleanser', href: '/category/cleanser' },
    { name: 'Serum', href: '/category/serum' },
    { name: 'Moisturizer', href: '/category/moisturizer' }
  ]
};

const trustFeatures = [
  {
    icon: ShieldCheckIcon,
    title: '100% Authentic',
    description: 'Genuine products guaranteed'
  },
  {
    icon: TruckIcon,
    title: 'Free Shipping',
    description: 'On orders over ৳1000'
  },
  {
    icon: CreditCardIcon,
    title: 'Secure Payment',
    description: 'Multiple payment options'
  },
  {
    icon: StarIcon,
    title: 'Premium Quality',
    description: 'Curated selection'
  }
];

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-purple-950 dark:to-indigo-950 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      {/* Trust Features Section */}
      <div className="relative z-10 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 backdrop-blur-sm border-y border-white/10">
        <div className="container-custom py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustFeatures.map((feature, index) => (
              <div 
                key={index}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-glow">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-sm mb-1 text-white group-hover:text-purple-300 transition-colors">
                  {feature.title}
                </h4>
                <p className="text-xs text-slate-300 dark:text-slate-300 group-hover:text-slate-200 dark:group-hover:text-slate-200 transition-colors">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="relative z-10 container-custom py-16 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-16">
          {/* Company Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-glow">
                  <span className="text-white font-bold text-xl">SR</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl blur opacity-30 animate-pulse"></div>
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Shohanis Reflection
                </h3>
                <p className="text-xs text-gray-400">Premium Beauty & Skincare</p>
              </div>
            </div>
            
            <p className="text-gray-300 leading-relaxed text-sm">
              Your trusted destination for premium beauty and skincare products. 
              Discover the latest trends and professional-grade solutions for radiant, healthy skin.
            </p>

            {/* Contact Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <PhoneIcon className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <span className="text-sm text-gray-200 group-hover:text-purple-300 transition-colors">+8801919025785</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <EnvelopeIcon className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <span className="text-sm text-gray-200 group-hover:text-purple-300 transition-colors">support@shohanis-reflection.com</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <MapPinIcon className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Location</p>
                  <span className="text-sm text-gray-200 group-hover:text-purple-300 transition-colors">Dhaka, Bangladesh</span>
                </div>
              </div>
            </div>
          </div>

          {/* Information Links */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-6 relative">
              Information
              <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            </h3>
            <ul className="space-y-3">
              {footerLinks.information.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-purple-400 transition-all duration-300 text-sm group flex items-center"
                  >
                    <span className="w-1 h-1 bg-purple-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-6 relative">
              Customer Service
              <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            </h3>
            <ul className="space-y-3">
              {footerLinks.customerService.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-purple-400 transition-all duration-300 text-sm group flex items-center"
                  >
                    <span className="w-1 h-1 bg-purple-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-6 relative">
              Categories
              <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            </h3>
            <ul className="space-y-3">
              {footerLinks.categories.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-purple-400 transition-all duration-300 text-sm group flex items-center"
                  >
                    <span className="w-1 h-1 bg-purple-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-16 pt-12 border-t border-gray-800/50">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-xl font-semibold text-white mb-3">
              Stay Updated with Latest Beauty Trends
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Subscribe to our newsletter for exclusive offers, beauty tips, and new product launches.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 backdrop-blur-sm"
              />
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-glow focus:ring-4 focus:ring-purple-500/20 focus:outline-none">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-800/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-gray-400 text-sm text-center sm:text-left">
              <p>&copy; 2025 Shohanis Reflection. All rights reserved.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-8 text-sm text-gray-400 text-center">
            <div className="flex items-center space-x-2">
                <span>Build with</span>
                <HeartIcon className="w-4 h-4 text-red-500 animate-pulse" />
                <Link 
                  href="https://github.com/tawsiib" 
                  className="text-purple-400 hover:text-purple-300 transition-colors font-medium hover:underline" 
                  target='_blank'
                >
                  Asib
                </Link>
              </div>
              
              <div className="flex items-center space-x-2">
                <span>Powered by</span>
                <div className="flex space-x-2">
                  <span className="px-2 py-1 bg-white/10 rounded-lg text-xs font-medium">Next.js</span>
                  <span className="px-2 py-1 bg-white/10 rounded-lg text-xs font-medium">Laravel</span>
                </div>
              </div>
              
              
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-br from-accent-500/20 to-primary-500/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
    </footer>
  );
}
