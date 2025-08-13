"use client";

import { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  MagnifyingGlassIcon, 
  ClockIcon, 
  UserGroupIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { apiClient } from '../../lib/api';
import LoadingSpinner from '../ui/LoadingSpinner';

const SearchAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.get(`/search/analytics?period=${period}`);
      
      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      setError(error);
      console.error('Failed to fetch search analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDownIcon className="h-4 w-4 text-red-500" />;
      default:
        return <MinusIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load search analytics</p>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <ChartBarIcon className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Search Analytics</h3>
        </div>
        
        {/* Period Selector */}
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Searches"
          value={analytics.performance_metrics.total_searches.toLocaleString()}
          icon={MagnifyingGlassIcon}
          trend="+12.5%"
          trendType="up"
        />
        <MetricCard
          title="Unique Searchers"
          value={analytics.performance_metrics.unique_searchers.toLocaleString()}
          icon={UserGroupIcon}
          trend="+8.2%"
          trendType="up"
        />
        <MetricCard
          title="Avg Response Time"
          value={`${analytics.performance_metrics.average_response_time}s`}
          icon={ClockIcon}
          trend="-15.3%"
          trendType="down"
        />
        <MetricCard
          title="Zero Result Rate"
          value={`${analytics.performance_metrics.zero_result_rate}%`}
          icon={ChartBarIcon}
          trend="-5.1%"
          trendType="down"
        />
      </div>

      {/* Popular Searches */}
      <div className="mb-8">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Popular Search Terms</h4>
        <div className="space-y-3">
          {analytics.popular_searches.map((search, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-900">{search.term}</span>
                {getTrendIcon(search.trend)}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{search.count.toLocaleString()} searches</span>
                <span className={`text-xs font-medium ${getTrendColor(search.trend)}`}>
                  {search.trend === 'up' ? '+' : search.trend === 'down' ? '-' : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conversion Rates */}
      <div className="mb-8">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Search Conversion Rates</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">Search to View</span>
              <span className="text-lg font-bold text-blue-900">{analytics.conversion_rates.search_to_view}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${analytics.conversion_rates.search_to_view}%` }}
              ></div>
            </div>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-900">Search to Cart</span>
              <span className="text-lg font-bold text-green-900">{analytics.conversion_rates.search_to_cart}%</span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${analytics.conversion_rates.search_to_cart}%` }}
              ></div>
            </div>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-900">Search to Purchase</span>
              <span className="text-lg font-bold text-purple-900">{analytics.conversion_rates.search_to_purchase}%</span>
            </div>
            <div className="w-full bg-purple-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full" 
                style={{ width: `${analytics.conversion_rates.search_to_purchase}%` }}
              ></div>
            </div>
          </div>
          
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-red-900">Search Abandonment</span>
              <span className="text-lg font-bold text-red-900">{analytics.conversion_rates.search_abandonment}%</span>
            </div>
            <div className="w-full bg-red-200 rounded-full h-2">
              <div 
                className="bg-red-600 h-2 rounded-full" 
                style={{ width: `${analytics.conversion_rates.search_abandonment}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Trends Chart Placeholder */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-4">Search Volume Trends</h4>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Search trends chart would be displayed here</p>
          <p className="text-sm text-gray-500">Integration with Chart.js or similar library</p>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon: Icon, trend, trendType }) => {
  const getTrendColor = (type) => {
    return type === 'up' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Icon className="h-8 w-8 text-blue-600" />
          {trend && (
            <span className={`text-sm font-medium ${getTrendColor(trendType)}`}>
              {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchAnalytics;
