'use client';

import { useState } from 'react';
import { 
  UserIcon, 
  ShoppingBagIcon, 
  HeartIcon, 
  MapPinIcon, 
  Cog6ToothIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import useAuthStore from '../../lib/stores/authStore';

export default function AccountPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 pt-20 pb-24">
        <div className="container-custom">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserIcon className="w-12 h-12 text-purple-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Please Sign In</h1>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              Sign in to your account to view your profile, orders, and manage your preferences.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/login"
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-glow"
              >
                Sign In
              </a>
              <a
                href="/register"
                className="px-6 py-3 border-2 border-purple-500 text-purple-600 font-semibold rounded-xl hover:bg-purple-500 hover:text-white transition-all duration-300"
              >
                Create Account
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const accountSections = [
    {
      id: 'profile',
      name: 'Profile',
      icon: UserIcon,
      description: 'Manage your personal information',
      href: '/account/profile'
    },
    {
      id: 'orders',
      name: 'Orders',
      icon: ShoppingBagIcon,
      description: 'View your order history',
      href: '/account/orders'
    },
    {
      id: 'wishlist',
      name: 'Wishlist',
      icon: HeartIcon,
      description: 'Your saved items',
      href: '/wishlist'
    },
    {
      id: 'addresses',
      name: 'Addresses',
      icon: MapPinIcon,
      description: 'Manage shipping addresses',
      href: '/account/addresses'
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: Cog6ToothIcon,
      description: 'Account preferences and security',
      href: '/account/settings'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 pt-20 pb-24">
      <div className="container-custom">
        {/* User Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <UserIcon className="w-12 h-12 text-white" />
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="text-lg text-gray-600">
            Manage your account and preferences
          </p>
        </div>

        {/* Account Sections Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {accountSections.map((section, index) => (
            <div 
              key={section.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <a
                href={section.href}
                className="block p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/30 shadow-soft hover:shadow-glow transition-all duration-300 transform hover:-translate-y-1 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <section.icon className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                      {section.name}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {section.description}
                    </p>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </a>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/30 shadow-soft p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Overview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShoppingBagIcon className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="text-sm text-gray-600">Orders</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-pink-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <HeartIcon className="w-8 h-8 text-pink-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="text-sm text-gray-600">Wishlist Items</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MapPinIcon className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="text-sm text-gray-600">Addresses</div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="mt-8 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/products"
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-glow"
            >
              Start Shopping
            </a>
            
            <button
              onClick={() => {
                // Implement logout functionality
                console.log('Logging out');
              }}
              className="px-6 py-3 border-2 border-red-500 text-red-600 font-semibold rounded-xl hover:bg-red-500 hover:text-white transition-all duration-300"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
