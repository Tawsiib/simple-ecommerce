"use client";

import { useState, useEffect } from 'react';
import { 
  CubeIcon, 
  ExclamationTriangleIcon, 
  ClockIcon, 
  ChartBarIcon,
  ArrowPathIcon,
  PlusIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { apiClient } from '../../lib/api';
import LoadingSpinner from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';

const InventoryDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [expiringProducts, setExpiringProducts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    setIsLoading(true);
    try {
      const [summaryRes, lowStockRes, expiringRes, alertsRes] = await Promise.all([
        apiClient.get('/admin/inventory/summary'),
        apiClient.get('/admin/inventory/low-stock'),
        apiClient.get('/admin/inventory/alerts'),
        apiClient.get('/admin/inventory/expiring')
      ]);

      if (summaryRes.data.success) setSummary(summaryRes.data.data);
      if (lowStockRes.data.success) setLowStockProducts(lowStockRes.data.data);
      if (expiringRes.data.success) setExpiringProducts(expiringRes.data.data);
      if (alertsRes.data.success) setAlerts(alertsRes.data.data);
    } catch (error) {
      console.error('Failed to fetch inventory data:', error);
      toast.error('Failed to load inventory data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckAlerts = async () => {
    try {
      const response = await apiClient.post('/admin/inventory/check-alerts');
      if (response.data.success) {
        toast.success('Inventory alerts checked successfully');
        fetchInventoryData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to check alerts:', error);
      toast.error('Failed to check inventory alerts');
    }
  };

  const handleGeneratePurchaseOrders = async () => {
    try {
      const response = await apiClient.post('/admin/inventory/generate-purchase-orders');
      if (response.data.success) {
        toast.success('Purchase orders generated successfully');
        fetchInventoryData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to generate purchase orders:', error);
      toast.error('Failed to generate purchase orders');
    }
  };

  const handleAcknowledgeAlert = async (alertId) => {
    try {
      const response = await apiClient.patch(`/admin/inventory/alerts/${alertId}/acknowledge`);
      if (response.data.success) {
        toast.success('Alert acknowledged');
        fetchInventoryData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      toast.error('Failed to acknowledge alert');
    }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      const response = await apiClient.patch(`/admin/inventory/alerts/${alertId}/resolve`);
      if (response.data.success) {
        toast.success('Alert resolved');
        fetchInventoryData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to resolve alert:', error);
      toast.error('Failed to resolve alert');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Monitor and manage your product inventory</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleCheckAlerts}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Check Alerts
          </button>
          <button
            onClick={handleGeneratePurchaseOrders}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Generate POs
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: ChartBarIcon },
            { id: 'alerts', name: 'Alerts', icon: ExclamationTriangleIcon },
            { id: 'low-stock', name: 'Low Stock', icon: CubeIcon },
            { id: 'expiring', name: 'Expiring', icon: ClockIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5 inline mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CubeIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {summary?.total_products?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Low Stock</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {summary?.low_stock_products?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Out of Stock</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {summary?.out_of_stock_products?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active Alerts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {summary?.active_alerts?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Inventory Value */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory Value</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ৳{summary?.total_value?.toLocaleString() || '0'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Low Stock Value</p>
                <p className="text-2xl font-bold text-yellow-600">
                  ৳{summary?.low_stock_value?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Inventory Alerts</h3>
            <span className="text-sm text-gray-500">
              {alerts.length} active alerts
            </span>
          </div>
          
          {alerts.length === 0 ? (
            <div className="text-center py-12">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No active alerts</h3>
              <p className="mt-1 text-sm text-gray-500">
                Your inventory is in good condition.
              </p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {alerts.map((alert) => (
                  <li key={alert.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${alert.severity_badge}`}>
                            {alert.severity}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${alert.status_badge}`}>
                            {alert.status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-900">{alert.message}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          Product: {alert.product?.name} • Created: {new Date(alert.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        {alert.status === 'active' && (
                          <>
                            <button
                              onClick={() => handleAcknowledgeAlert(alert.id)}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                              Acknowledge
                            </button>
                            <button
                              onClick={() => handleResolveAlert(alert.id)}
                              className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-xs font-medium text-white bg-green-600 hover:bg-green-700"
                            >
                              Resolve
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {activeTab === 'low-stock' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Low Stock Products</h3>
            <span className="text-sm text-gray-500">
              {lowStockProducts.length} products
            </span>
          </div>
          
          {lowStockProducts.length === 0 ? (
            <div className="text-center py-12">
              <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No low stock products</h3>
              <p className="mt-1 text-sm text-gray-500">
                All products have sufficient stock.
              </p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {lowStockProducts.map((product) => (
                  <li key={product.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-sm font-medium text-gray-900">{product.name}</h4>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            {product.stock_quantity} in stock
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          SKU: {product.sku} • Category: {product.category?.name} • Supplier: {product.supplier?.name}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Reorder Point: {product.reorder_point} • Reorder Quantity: {product.reorder_quantity}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View
                        </button>
                        <button className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                          Reorder
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {activeTab === 'expiring' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Expiring Products</h3>
            <span className="text-sm text-gray-500">
              {expiringProducts.length} products
            </span>
          </div>
          
          {expiringProducts.length === 0 ? (
            <div className="text-center py-12">
              <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No expiring products</h3>
              <p className="mt-1 text-sm text-gray-500">
                All products have sufficient shelf life.
              </p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {expiringProducts.map((product) => {
                  const daysUntilExpiry = Math.ceil((new Date(product.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
                  const severity = daysUntilExpiry <= 7 ? 'critical' : daysUntilExpiry <= 30 ? 'high' : 'medium';
                  
                  return (
                    <li key={product.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="text-sm font-medium text-gray-900">{product.name}</h4>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              severity === 'critical' ? 'bg-red-100 text-red-800' :
                              severity === 'high' ? 'bg-orange-100 text-orange-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {daysUntilExpiry} days left
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">
                            SKU: {product.sku} • Category: {product.category?.name} • Stock: {product.stock_quantity}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            Expires: {new Date(product.expiry_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50">
                            <EyeIcon className="h-4 w-4 mr-1" />
                            View
                          </button>
                          <button className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-xs font-medium text-white bg-red-600 hover:bg-red-700">
                            Mark Expired
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InventoryDashboard;
