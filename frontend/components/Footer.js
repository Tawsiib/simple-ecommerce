import Link from 'next/link';
import { 
  PhoneIcon, 
  EnvelopeIcon,
  MapPinIcon 
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

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg sm:text-xl">SR</span>
              </div>
              <span className="text-lg sm:text-xl xl:text-2xl font-bold text-gradient">Shohanis Reflection</span>
            </div>
            
            <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6 leading-relaxed">
              Your trusted destination for premium beauty and skincare products. 
              Discover the latest trends and professional-grade solutions for radiant, healthy skin.
            </p>

            {/* Contact Info */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <PhoneIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400 flex-shrink-0" />
                <span className="text-sm sm:text-base text-gray-300">+8801919025785</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <EnvelopeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400 flex-shrink-0" />
                <span className="text-sm sm:text-base text-gray-300">support@shohanis-reflection.com</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <MapPinIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400 flex-shrink-0" />
                <span className="text-sm sm:text-base text-gray-300">Dhaka, Bangladesh</span>
              </div>
            </div>
          </div>

          {/* Information Links */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-white">Information</h3>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.information.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm sm:text-base text-gray-300 hover:text-primary-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-white">Customer Service</h3>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.customerService.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm sm:text-base text-gray-300 hover:text-primary-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-white">Categories</h3>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.categories.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm sm:text-base text-gray-300 hover:text-primary-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-gray-400 text-xs sm:text-sm text-center sm:text-left">
              <p>&copy; 2025 Shohanis Reflection. All rights reserved.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-xs sm:text-sm text-gray-400 text-center">
              <span>Powered by Next.js & Laravel</span>
              <span>Designed with ❤️ in Bangladesh</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
