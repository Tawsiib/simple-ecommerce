"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CubeIcon,
  ShoppingBagIcon,
  UsersIcon,
  CurrencyDollarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  EyeIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { apiClient } from '../../../lib/api';
import LoadingSpinner from '../ui/LoadingSpinner';
import { NetworkError } from '../ui/ErrorBoundary';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [statsResponse, ordersResponse] = await Promise.all([
        apiClient.get('/admin/dashboard/stats'),
        apiClient.get('/admin/orders?limit=5')
      ]);

      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }

      if (ordersResponse.data.success) {
        setRecentOrders(ordersResponse.data.data.data || []);
      }
    } catch (error) {
      setError(error);
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, change, changeType, icon: Icon, href }) => {
    const CardContent = (
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Icon className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                <dd className="text-lg font-medium text-gray-900">{value}</dd>
              </dl>
            </div>
          </div>
        </div>
        {change && (
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <div className="flex items-center">
                {changeType === 'increase' ? (
                  <TrendingUpIcon className="h-4 w-4 text-green-400" />
                ) : (
                  <TrendingDownIcon className="h-4 w-4 text-red-400" />
                )}
                <span className={`ml-2 font-medium ${
                  changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {change}
                </span>
                <span className="ml-2 text-gray-500">from last month</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );

    if (href) {
      return <Link href={href}>{CardContent}</Link>;
    }

    return CardContent;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center py-12">
        <NetworkError onRetry={fetchDashboardData} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Overview of your e-commerce store performance
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
                     <Link
             href="/admin/products/new"
             className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
           >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          change={stats?.productsChange || '0%'}
          changeType={stats?.productsChangeType || 'neutral'}
          icon={CubeIcon}
          href="/admin/products"
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          change={stats?.ordersChange || '0%'}
          changeType={stats?.ordersChangeType || 'neutral'}
          icon={ShoppingBagIcon}
          href="/admin/orders"
        />
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          change={stats?.usersChange || '0%'}
          changeType={stats?.usersChangeType || 'neutral'}
          icon={UsersIcon}
          href="/admin/users"
        />
        <StatCard
          title="Total Revenue"
          value={`৳${(stats?.totalRevenue || 0).toLocaleString()}`}
          change={stats?.revenueChange || '0%'}
          changeType={stats?.revenueChangeType || 'neutral'}
          icon={CurrencyDollarIcon}
        />
      </div>

      {/* Recent orders */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Orders</h3>
                         <Link
               href="/admin/orders"
               className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
             >
              View all orders
            </Link>
          </div>
          
          {recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
              <p className="mt-1 text-sm text-gray-500">Orders will appear here once customers start shopping.</p>
            </div>
          ) : (
            <div className="mt-6 flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <li key={order.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center">
                          <ShoppingBagIcon className="h-4 w-4 text-rose-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          Order #{order.order_number}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.user?.name || 'Guest'} • {order.total_items} items
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex-shrink-0 text-sm text-gray-500">
                        ৳{order.total_amount?.toFixed(2)}
                      </div>
                      <div className="flex-shrink-0">
                                                 <Link
                           href={`/admin/orders/${order.id}`}
                           className="text-rose-600 hover:text-rose-900"
                         >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                         <Link
               href="/admin/products/new"
               className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-rose-500"
             >
              <div className="flex-shrink-0">
                <PlusIcon className="h-6 w-6 text-rose-600" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">Add New Product</p>
                <p className="text-sm text-gray-500">Create a new product listing</p>
              </div>
            </Link>

                         <Link
               href="/admin/orders"
               className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-rose-500"
             >
              <div className="flex-shrink-0">
                <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">Manage Orders</p>
                <p className="text-sm text-gray-500">View and update order status</p>
              </div>
            </Link>

                         <Link
               href="/admin/users"
               className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-rose-500"
             >
              <div className="flex-shrink-0">
                <UsersIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">User Management</p>
                <p className="text-sm text-gray-500">Manage customer accounts</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;