"use client";

import { useState, useEffect } from 'react';
import { 
    LineChart, Line, AreaChart, Area, BarChart, Bar, 
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { 
    Clock, Database, Memory, Zap, TrendingUp, TrendingDown,
    AlertTriangle, CheckCircle, XCircle, RefreshCw
} from 'lucide-react';

const PerformanceDashboard = () => {
    const [performanceData, setPerformanceData] = useState(null);
    const [cacheStats, setCacheStats] = useState(null);
    const [memoryUsage, setMemoryUsage] = useState(null);
    const [realTimeMetrics, setRealTimeMetrics] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('today');
    const [autoRefresh, setAutoRefresh] = useState(true);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    useEffect(() => {
        fetchPerformanceData();
        fetchCacheStats();
        fetchMemoryUsage();
        fetchRecommendations();

        if (autoRefresh) {
            const interval = setInterval(() => {
                fetchRealTimeMetrics();
            }, 30000); // Refresh every 30 seconds

            return () => clearInterval(interval);
        }
    }, [period, autoRefresh]);

    const fetchPerformanceData = async () => {
        try {
            const response = await fetch(`/api/performance/stats?period=${period}`);
            const data = await response.json();
            if (data.success) {
                setPerformanceData(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch performance data:', error);
        }
    };

    const fetchCacheStats = async () => {
        try {
            const response = await fetch('/api/performance/cache-stats');
            const data = await response.json();
            if (data.success) {
                setCacheStats(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch cache stats:', error);
        }
    };

    const fetchMemoryUsage = async () => {
        try {
            const response = await fetch('/api/performance/memory-usage');
            const data = await response.json();
            if (data.success) {
                setMemoryUsage(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch memory usage:', error);
        }
    };

    const fetchRealTimeMetrics = async () => {
        try {
            const response = await fetch('/api/performance/real-time');
            const data = await response.json();
            if (data.success) {
                setRealTimeMetrics(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch real-time metrics:', error);
        }
    };

    const fetchRecommendations = async () => {
        try {
            const response = await fetch('/api/performance/recommendations');
            const data = await response.json();
            if (data.success) {
                setRecommendations(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch recommendations:', error);
        }
    };

    const handleCacheAction = async (action, type = 'all', id = null) => {
        try {
            const response = await fetch(`/api/performance/${action}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ type, id }),
            });

            const data = await response.json();
            if (data.success) {
                // Refresh data after action
                fetchCacheStats();
                fetchPerformanceData();
            }
        } catch (error) {
            console.error(`Failed to ${action} cache:`, error);
        }
    };

    const getStatusColor = (value, threshold, type = 'warning') => {
        if (type === 'warning') {
            return value > threshold ? 'text-red-600' : 'text-green-600';
        }
        return value < threshold ? 'text-green-600' : 'text-red-600';
    };

    const getStatusIcon = (value, threshold, type = 'warning') => {
        if (type === 'warning') {
            return value > threshold ? <AlertTriangle className="w-5 h-5 text-red-600" /> : <CheckCircle className="w-5 h-5 text-green-600" />;
        }
        return value < threshold ? <CheckCircle className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-600" />;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Performance Dashboard</h1>
                    <p className="text-gray-600">Monitor application performance and optimize caching</p>
                </div>
                <div className="flex items-center space-x-4">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                        <option value="hour">Last Hour</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                    </select>
                    <button
                        onClick={() => {
                            fetchPerformanceData();
                            fetchCacheStats();
                            fetchMemoryUsage();
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Real-time Metrics */}
            {realTimeMetrics && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Requests (1min)</p>
                                <p className="text-2xl font-bold text-gray-900">{realTimeMetrics.requests_last_minute}</p>
                            </div>
                            <Clock className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Slow Requests</p>
                                <p className="text-2xl font-bold text-gray-900">{realTimeMetrics.slow_requests_last_minute}</p>
                            </div>
                            <AlertTriangle className="w-8 h-8 text-orange-600" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Current Memory</p>
                                <p className="text-2xl font-bold text-gray-900">{realTimeMetrics.current_memory_mb} MB</p>
                            </div>
                            <Memory className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Peak Memory</p>
                                <p className="text-2xl font-bold text-gray-900">{realTimeMetrics.peak_memory_mb} MB</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-purple-600" />
                        </div>
                    </div>
                </div>
            )}

            {/* Performance Overview */}
            {performanceData?.overview && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Overview</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">Total Requests</p>
                            <p className="text-2xl font-bold text-gray-900">{performanceData.overview.total_requests}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">Slow Requests</p>
                            <p className="text-2xl font-bold text-gray-900">{performanceData.overview.slow_requests}</p>
                            <p className={`text-sm ${getStatusColor(performanceData.overview.slow_request_rate, 5)}`}>
                                {performanceData.overview.slow_request_rate}%
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                            <p className="text-2xl font-bold text-gray-900">{performanceData.overview.avg_response_time_ms}ms</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">Avg Memory Usage</p>
                            <p className="text-2xl font-bold text-gray-900">{performanceData.overview.avg_memory_usage_mb} MB</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Response Time Chart */}
            {performanceData?.response_times?.hourly_data && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Response Time Trends</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={performanceData.response_times.hourly_data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="hour" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line 
                                type="monotone" 
                                dataKey="avg_duration" 
                                stroke="#8884d8" 
                                strokeWidth={2}
                                name="Avg Response Time (ms)"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Memory Usage Chart */}
            {performanceData?.memory_usage?.hourly_data && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Memory Usage Trends</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={performanceData.memory_usage.hourly_data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="hour" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Area 
                                type="monotone" 
                                dataKey="avg_memory" 
                                stackId="1"
                                stroke="#82ca9d" 
                                fill="#82ca9d" 
                                name="Avg Memory (MB)"
                            />
                            <Area 
                                type="monotone" 
                                dataKey="peak_memory" 
                                stackId="2"
                                stroke="#ffc658" 
                                fill="#ffc658" 
                                name="Peak Memory (MB)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Cache Statistics */}
            {cacheStats && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">Cache Statistics</h2>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handleCacheAction('warm-up-cache')}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Warm Up Cache
                            </button>
                            <button
                                onClick={() => handleCacheAction('clear-cache', 'all')}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Clear All Cache
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">Driver</p>
                            <p className="text-lg font-semibold text-gray-900">{cacheStats.driver}</p>
                        </div>
                        {cacheStats.memory_used && (
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-600">Memory Used</p>
                                <p className="text-lg font-semibold text-gray-900">{cacheStats.memory_used}</p>
                            </div>
                        )}
                        {cacheStats.hit_rate !== undefined && (
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-600">Hit Rate</p>
                                <p className={`text-lg font-semibold ${getStatusColor(cacheStats.hit_rate, 80, 'success')}`}>
                                    {cacheStats.hit_rate}%
                                </p>
                            </div>
                        )}
                        {cacheStats.keyspace_hits && (
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-600">Total Hits</p>
                                <p className="text-lg font-semibold text-gray-900">{cacheStats.keyspace_hits.toLocaleString()}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Memory Usage Details */}
            {memoryUsage && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Memory Usage</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">Current Memory</p>
                            <p className="text-lg font-semibold text-gray-900">{memoryUsage.current_memory_mb} MB</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">Peak Memory</p>
                            <p className="text-lg font-semibold text-gray-900">{memoryUsage.peak_memory_mb} MB</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">Memory Limit</p>
                            <p className="text-lg font-semibold text-gray-900">{memoryUsage.memory_limit}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">Usage %</p>
                            <p className={`text-lg font-semibold ${getStatusColor(memoryUsage.memory_usage_percent, 80)}`}>
                                {memoryUsage.memory_usage_percent}%
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Performance Recommendations */}
            {recommendations.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Recommendations</h2>
                    <div className="space-y-4">
                        {recommendations.map((rec, index) => (
                            <div key={index} className={`p-4 rounded-lg border-l-4 ${
                                rec.type === 'warning' ? 'border-orange-500 bg-orange-50' :
                                rec.type === 'info' ? 'border-blue-500 bg-blue-50' :
                                'border-gray-500 bg-gray-50'
                            }`}>
                                <div className="flex items-start space-x-3">
                                    {rec.type === 'warning' ? (
                                        <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                                    ) : (
                                        <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                                    )}
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{rec.message}</p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Priority: {rec.priority} | Category: {rec.category}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Slow Requests Table */}
            {performanceData?.slow_requests?.slow_endpoints && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Slow Endpoints</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endpoint</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slow Count</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Duration</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Duration</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {performanceData.slow_requests.slow_endpoints.map((endpoint, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{endpoint.uri}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{endpoint.method}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{endpoint.slow_count}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{endpoint.avg_duration}ms</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{endpoint.max_duration}ms</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PerformanceDashboard;
