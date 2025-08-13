import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const usePerformanceStore = create(
    persist(
        (set, get) => ({
            // State
            overview: null,
            stats: null,
            cacheStats: null,
            recommendations: [],
            memoryUsage: null,
            isLoading: false,
            error: null,
            lastUpdated: null,

            // Actions
            setOverview: (overview) => set({ overview, lastUpdated: new Date().toISOString() }),
            
            setStats: (stats) => set({ stats, lastUpdated: new Date().toISOString() }),
            
            setCacheStats: (cacheStats) => set({ cacheStats, lastUpdated: new Date().toISOString() }),
            
            setRecommendations: (recommendations) => set({ recommendations, lastUpdated: new Date().toISOString() }),
            
            setMemoryUsage: (memoryUsage) => set({ memoryUsage, lastUpdated: new Date().toISOString() }),
            
            setLoading: (isLoading) => set({ isLoading }),
            
            setError: (error) => set({ error }),
            
            clearError: () => set({ error: null }),

            // Fetch performance overview
            fetchOverview: async () => {
                set({ isLoading: true, error: null });
                
                try {
                    const response = await fetch('/api/admin/performance/overview', {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        },
                    });
                    
                    if (!response.ok) {
                        throw new Error('Failed to fetch performance overview');
                    }
                    
                    const data = await response.json();
                    
                    set({
                        overview: data.data,
                        cacheStats: data.data.cache,
                        recommendations: data.data.recommendations,
                        isLoading: false,
                        lastUpdated: new Date().toISOString(),
                    });
                    
                    return data.data;
                } catch (error) {
                    set({ error: error.message, isLoading: false });
                    throw error;
                }
            },

            // Fetch performance statistics
            fetchStats: async (period = 'today', date = null) => {
                set({ isLoading: true, error: null });
                
                try {
                    const params = new URLSearchParams({ period });
                    if (date) params.append('date', date);
                    
                    const response = await fetch(`/api/admin/performance/stats?${params}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        },
                    });
                    
                    if (!response.ok) {
                        throw new Error('Failed to fetch performance statistics');
                    }
                    
                    const data = await response.json();
                    
                    set({
                        stats: data.data,
                        isLoading: false,
                        lastUpdated: new Date().toISOString(),
                    });
                    
                    return data.data;
                } catch (error) {
                    set({ error: error.message, isLoading: false });
                    throw error;
                }
            },

            // Fetch cache statistics
            fetchCacheStats: async () => {
                set({ isLoading: true, error: null });
                
                try {
                    const response = await fetch('/api/admin/performance/cache-stats', {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        },
                    });
                    
                    if (!response.ok) {
                        throw new Error('Failed to fetch cache statistics');
                    }
                    
                    const data = await response.json();
                    
                    set({
                        cacheStats: data.data,
                        isLoading: false,
                        lastUpdated: new Date().toISOString(),
                    });
                    
                    return data.data;
                } catch (error) {
                    set({ error: error.message, isLoading: false });
                    throw error;
                }
            },

            // Fetch memory usage
            fetchMemoryUsage: async () => {
                set({ isLoading: true, error: null });
                
                try {
                    const response = await fetch('/api/admin/performance/memory-usage', {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        },
                    });
                    
                    if (!response.ok) {
                        throw new Error('Failed to fetch memory usage');
                    }
                    
                    const data = await response.json();
                    
                    set({
                        memoryUsage: data.data,
                        isLoading: false,
                        lastUpdated: new Date().toISOString(),
                    });
                    
                    return data.data;
                } catch (error) {
                    set({ error: error.message, isLoading: false });
                    throw error;
                }
            },

            // Clear specific cache
            clearCache: async (type = 'all', id = null) => {
                set({ isLoading: true, error: null });
                
                try {
                    const response = await fetch('/api/admin/performance/clear-cache', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        },
                        body: JSON.stringify({ type, id }),
                    });
                    
                    if (!response.ok) {
                        throw new Error('Failed to clear cache');
                    }
                    
                    const data = await response.json();
                    
                    // Refresh overview after clearing cache
                    await get().fetchOverview();
                    
                    set({ isLoading: false });
                    
                    return data;
                } catch (error) {
                    set({ error: error.message, isLoading: false });
                    throw error;
                }
            },

            // Warm up cache
            warmUpCache: async () => {
                set({ isLoading: true, error: null });
                
                try {
                    const response = await fetch('/api/admin/performance/warm-up-cache', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        },
                    });
                    
                    if (!response.ok) {
                        throw new Error('Failed to warm up cache');
                    }
                    
                    const data = await response.json();
                    
                    // Refresh overview after warming up cache
                    await get().fetchOverview();
                    
                    set({ isLoading: false });
                    
                    return data;
                } catch (error) {
                    set({ error: error.message, isLoading: false });
                    throw error;
                }
            },

            // Get performance recommendations
            fetchRecommendations: async () => {
                set({ isLoading: true, error: null });
                
                try {
                    const response = await fetch('/api/admin/performance/recommendations', {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        },
                    });
                    
                    if (!response.ok) {
                        throw new Error('Failed to fetch recommendations');
                    }
                    
                    const data = await response.json();
                    
                    set({
                        recommendations: data.data,
                        isLoading: false,
                        lastUpdated: new Date().toISOString(),
                    });
                    
                    return data.data;
                } catch (error) {
                    set({ error: error.message, isLoading: false });
                    throw error;
                }
            },

            // Initialize store
            initialize: async () => {
                // Don't fetch performance data during initialization to prevent auth errors
                // Performance data will be fetched when user actually needs to see it
                console.log('Performance store initialized');
            },

            // Reset store
            reset: () => set({
                overview: null,
                stats: null,
                cacheStats: null,
                recommendations: [],
                memoryUsage: null,
                isLoading: false,
                error: null,
                lastUpdated: null,
            }),

            // Get computed values
            getPerformanceScore: () => {
                const { overview } = get();
                if (!overview?.stats) return 0;
                
                const { avg_response_time, avg_queries, slow_request_rate, error_rate } = overview.stats;
                
                let score = 100;
                
                // Deduct points for slow response time
                if (avg_response_time > 1000) score -= 30;
                else if (avg_response_time > 500) score -= 20;
                else if (avg_response_time > 200) score -= 10;
                
                // Deduct points for high query count
                if (avg_queries > 50) score -= 25;
                else if (avg_queries > 20) score -= 15;
                else if (avg_queries > 10) score -= 5;
                
                // Deduct points for slow requests
                if (slow_request_rate > 20) score -= 25;
                else if (slow_request_rate > 10) score -= 15;
                else if (slow_request_rate > 5) score -= 5;
                
                // Deduct points for errors
                if (error_rate > 10) score -= 20;
                else if (error_rate > 5) score -= 10;
                else if (error_rate > 1) score -= 5;
                
                return Math.max(0, score);
            },

            getPerformanceStatus: () => {
                const score = get().getPerformanceScore();
                
                if (score >= 90) return { status: 'excellent', color: 'text-green-600', bgColor: 'bg-green-100' };
                if (score >= 75) return { status: 'good', color: 'text-blue-600', bgColor: 'bg-blue-100' };
                if (score >= 60) return { status: 'fair', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
                if (score >= 40) return { status: 'poor', color: 'text-orange-600', bgColor: 'bg-orange-100' };
                return { status: 'critical', color: 'text-red-600', bgColor: 'bg-red-100' };
            },

            getCacheEfficiency: () => {
                const { cacheStats } = get();
                if (!cacheStats?.hit_rate) return 0;
                
                return cacheStats.hit_rate;
            },

            getCacheStatus: () => {
                const efficiency = get().getCacheEfficiency();
                
                if (efficiency >= 80) return { status: 'excellent', color: 'text-green-600', bgColor: 'bg-green-100' };
                if (efficiency >= 60) return { status: 'good', color: 'text-blue-600', bgColor: 'bg-blue-100' };
                if (efficiency >= 40) return { status: 'fair', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
                return { status: 'poor', color: 'text-red-600', bgColor: 'bg-red-100' };
            },
        }),
        {
            name: 'performance-store',
            partialize: (state) => ({
                lastUpdated: state.lastUpdated,
            }),
        }
    )
);

export default usePerformanceStore;
