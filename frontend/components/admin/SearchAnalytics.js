"use client";

import { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  TrendingUpIcon, 
  UsersIcon, 
  ChartBarIcon,
  EyeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { apiClient } from '../../lib/api';
import LoadingSpinner from '../ui/LoadingSpinner';

const SearchAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchSearchAnalytics();
  }, [timeRange]);

  const fetchSearchAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/search/analytics?range=${timeRange}`);
      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch search analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeRangeLabel = (range) => {
    switch (range) {
      case '1d': return 'Last 24 Hours';
      case '7d': return 'Last 7 Days';
      case '30d': return 'Last 30 Days';
      case '90d': return 'Last 90 Days';
      default: return 'Last 7 Days';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No analytics data</h3>
        <p className="mt-1 text-sm text-gray-500">
          Search analytics will appear here once users start searching.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Search Analytics</h1>
          <p className="mt-1 text-sm text-gray-600">
            Monitor search performance and user behavior
          </p>
        </div>
        
        {/* Time Range Selector */}
        <div className="mt-4 sm:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MagnifyingGlassIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Searches</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.total_searches?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Unique Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.unique_users?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUpIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.conversion_rate ? `${analytics.conversion_rate}%` : '0%'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg. Search Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.avg_search_time ? `${analytics.avg_search_time}s` : '0s'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Search Terms */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Popular Search Terms</h3>
            <p className="text-sm text-gray-500">{getTimeRangeLabel(timeRange)}</p>
          </div>
          <div className="p-6">
            {analytics.popular_terms && analytics.popular_terms.length > 0 ? (
              <div className="space-y-4">
                {analytics.popular_terms.slice(0, 10).map((term, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-900">
                        {index + 1}.
                      </span>
                      <span className="text-sm text-gray-700">{term.term}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">{term.count} searches</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(term.count / Math.max(...analytics.popular_terms.map(t => t.count))) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MagnifyingGlassIcon className="mx-auto h-8 w-8 mb-2" />
                <p>No search data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Search Performance */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Search Performance</h3>
            <p className="text-sm text-gray-500">{getTimeRangeLabel(timeRange)}</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-700">Zero Results Searches</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {analytics.zero_result_searches || '0'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <TrendingUpIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-700">Successful Searches</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {analytics.successful_searches || '0'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ClockIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-700">Abandoned Searches</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {analytics.abandoned_searches || '0'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Insights */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Search Insights</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Top Categories</h4>
              {analytics.top_categories && analytics.top_categories.length > 0 ? (
                <div className="space-y-2">
                  {analytics.top_categories.slice(0, 5).map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{category.name}</span>
                      <span className="text-sm font-medium text-gray-900">{category.searches}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No category data available</p>
              )}
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Top Brands</h4>
              {analytics.top_brands && analytics.top_brands.length > 0 ? (
                <div className="space-y-2">
                  {analytics.top_brands.slice(0, 5).map((brand, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{brand.name}</span>
                      <span className="text-sm font-medium text-gray-900">{brand.searches}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No brand data available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-3">Recommendations</h3>
        <div className="space-y-2 text-sm text-blue-800">
          {analytics.recommendations && analytics.recommendations.length > 0 ? (
            analytics.recommendations.map((rec, index) => (
              <p key={index}>• {rec}</p>
            ))
          ) : (
            <p>• Monitor search patterns to identify popular products</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchAnalytics;

