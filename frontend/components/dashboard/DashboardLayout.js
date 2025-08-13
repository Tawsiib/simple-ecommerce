"use client";

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  UserIcon,
  ShoppingBagIcon,
  HeartIcon,
  MapPinIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import useAuthStore from '../../lib/stores/authStore';

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();

  const navigation = [
    {
      name: 'Profile',
      href: '/dashboard/profile',
      icon: UserIcon,
      description: 'Manage your personal information'
    },
    {
      name: 'Orders',
      href: '/dashboard/orders',
      icon: ShoppingBagIcon,
      description: 'View and track your orders'
    },
    {
      name: 'Wishlist',
      href: '/dashboard/wishlist',
      icon: HeartIcon,
      description: 'Your saved items'
    },
    {
      name: 'Addresses',
      href: '/dashboard/addresses',
      icon: MapPinIcon,
      description: 'Manage shipping and billing addresses'
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Cog6ToothIcon,
      description: 'Account settings and preferences'
    }
  ];

  const isActive = (href) => location.pathname === href;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-20 left-4 z-40">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-white rounded-lg shadow-md text-gray-600 hover:text-gray-900"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      <div className="container-custom py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className={`lg:w-1/4 ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* User Info */}
              <div className="p-6 bg-gradient-to-r from-rose-500 to-pink-500 text-white">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold">
                      {user?.initials || user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{user?.name}</h3>
                    <p className="text-white/80 text-sm">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="p-4">
                <ul className="space-y-2">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                            active
                              ? 'bg-rose-50 text-rose-600 font-medium'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Icon className={`h-5 w-5 ${active ? 'text-rose-600' : 'text-gray-400'}`} />
                          <div className="flex-1">
                            <p className="text-sm">{item.name}</p>
                            <p className={`text-xs ${active ? 'text-rose-500' : 'text-gray-500'}`}>
                              {item.description}
                            </p>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                  
                  {/* Logout */}
                  <li className="pt-4 mt-4 border-t border-gray-200">
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5" />
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>

            {/* Help Box */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-2">Need Help?</h4>
              <p className="text-sm text-gray-600 mb-4">
                Our customer support team is here to assist you.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center text-sm font-medium text-rose-600 hover:text-rose-700"
              >
                Contact Support
                <ArrowRightOnRectangleIcon className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
