"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeSlashIcon, LockClosedIcon, UserIcon, ShieldCheckIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { apiClient } from '../../lib/api';
import LoadingSpinner from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await apiClient.post('/auth/login', formData);
      
      if (response.data.success) {
        // Check if user is admin
        if (response.data.data.user.is_admin) {
          toast.success('Welcome back, Admin!');
          router.push('/admin');
        } else {
          toast.error('Access denied. Admin privileges required.');
          // Clear token if not admin
          localStorage.removeItem('auth_token');
        }
      } else {
        toast.error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render until client-side
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-dark-gradient-secondary dark:via-dark-gradient-ocean dark:to-dark-gradient-primary flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <LoadingSpinner size="2xl" />
          <p className="text-gray-600 dark:text-dark-text-tertiary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-dark-gradient-secondary dark:via-dark-gradient-ocean dark:to-dark-gradient-primary relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating Geometric Shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 dark:from-dark-accent-info/30 dark:to-dark-accent-primary/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-br from-indigo-400/20 to-purple-500/20 dark:from-dark-accent-primary/30 dark:to-dark-accent-secondary/30 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-br from-blue-300/15 to-cyan-400/15 dark:from-dark-accent-info/25 dark:to-dark-accent-success/25 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%233b82f6%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-60 dark:opacity-30"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Enhanced Header with Premium Styling */}
          <div className="text-center">
            {/* Animated Logo Container */}
            <div className="relative mx-auto mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 dark:from-dark-accent-info dark:via-dark-accent-primary dark:to-dark-accent-secondary rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/25 dark:shadow-dark-glow animate-fade-in-up">
                <div className="relative">
                  <LockClosedIcon className="h-10 w-10 text-white" />
                  <div className="absolute -inset-2 bg-gradient-to-br from-blue-400/50 to-purple-400/50 dark:from-dark-accent-info/60 dark:to-dark-accent-secondary/60 rounded-full blur-xl animate-pulse"></div>
                </div>
              </div>
              
              {/* Floating Security Badge */}
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-dark-accent-success to-dark-accent-success rounded-full p-2 shadow-lg dark:shadow-dark-glow-success animate-bounce">
                <ShieldCheckIcon className="h-4 w-4 text-white" />
              </div>
              
              {/* Sparkle Effects */}
              <div className="absolute -top-1 -left-1 text-yellow-400 dark:text-yellow-300 animate-pulse">
                <SparklesIcon className="h-4 w-4" />
              </div>
            </div>
            
            <h2 className="text-4xl font-bold text-gray-900 dark:text-dark-text-primary mb-3 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Admin Portal
            </h2>
            <p className="text-lg text-gray-600 dark:text-dark-text-secondary max-w-sm mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              Secure access to your administrative dashboard
            </p>
            
            {/* Security Features Badge */}
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-dark-surface-selected dark:to-dark-surface-selected px-4 py-2 rounded-full mt-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-dark-accent-info to-dark-accent-primary rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-blue-700 dark:text-dark-accent-info">Enterprise Security</span>
            </div>
          </div>

          {/* Enhanced Login Form */}
          <div className="bg-white/80 dark:bg-dark-bg-card/90 backdrop-blur-xl rounded-3xl border border-white/30 dark:border-dark-border-primary/30 shadow-2xl shadow-blue-500/10 dark:shadow-dark-medium p-8 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-dark-text-secondary">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors duration-300" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-dark-border-primary rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-dark-accent-info transition-all duration-300 bg-white/90 dark:bg-dark-surface-primary/90 backdrop-blur-sm hover:border-gray-300 dark:hover:border-dark-border-secondary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-tertiary font-medium"
                    placeholder="admin@example.com"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-focus-within:from-blue-500/5 group-focus-within:via-blue-500/10 group-focus-within:to-blue-500/5 dark:group-focus-within:from-blue-400/10 dark:group-focus-within:via-blue-400/15 dark:group-focus-within:to-blue-400/10 transition-all duration-500"></div>
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-dark-text-secondary">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors duration-300" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-16 py-4 border-2 border-gray-200 dark:border-dark-border-primary rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-dark-accent-info transition-all duration-300 bg-white/90 dark:bg-dark-surface-primary/90 backdrop-blur-sm hover:border-gray-300 dark:hover:border-dark-border-secondary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-tertiary font-medium"
                    placeholder="Enter your password"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-focus-within:from-blue-500/5 group-focus-within:via-blue-500/10 group-focus-within:to-blue-500/5 dark:group-focus-within:from-blue-400/10 dark:group-focus-within:via-blue-400/15 dark:group-focus-within:to-blue-400/10 transition-all duration-500"></div>
                  
                  {/* Password Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors duration-200"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Enhanced Submit Button */}
                              <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 dark:from-dark-accent-info dark:via-dark-accent-primary dark:to-dark-accent-secondary text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/25 dark:hover:shadow-dark-glow focus:ring-4 focus:ring-blue-500/20 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group relative overflow-hidden"
              >
                {/* Button Background Animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 dark:from-blue-600 dark:via-indigo-600 dark:to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Button Content */}
                <div className="relative flex items-center justify-center space-x-3">
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="text-white" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheckIcon className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                      <span>Sign in to Admin Panel</span>
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Additional Security Info */}
            <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-dark-border-divider/50">
                              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 dark:text-dark-text-tertiary">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>SSL Encrypted</span>
                  </div>
                  <div className="w-px h-4 bg-gray-300 dark:bg-dark-border-secondary"></div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>2FA Ready</span>
                  </div>
                  <div className="w-px h-4 bg-gray-300 dark:bg-dark-border-secondary"></div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <span>Enterprise</span>
                  </div>
                </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center animate-fade-in-up" style={{ animationDelay: '1s' }}>
            <p className="text-sm text-gray-500 dark:text-dark-text-tertiary">
              Protected by enterprise-grade security protocols
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
