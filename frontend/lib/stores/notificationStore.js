import { create } from 'zustand';

const useNotificationStore = create((set, get) => ({
    // State
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,

    // Actions
    setNotifications: (notifications) => set({ notifications }),
    
    setUnreadCount: (count) => set({ unreadCount: count }),
    
    setLoading: (loading) => set({ loading }),
    
    setError: (error) => set({ error }),

    // Fetch notifications
    fetchNotifications: async (params = {}) => {
        try {
            set({ loading: true, error: null });
            
            const queryString = new URLSearchParams(params).toString();
            const response = await fetch(`/api/notifications?${queryString}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            
            const data = await response.json();
            
            if (data.success) {
                set({ notifications: data.data.data });
                return data.data;
            } else {
                throw new Error(data.message || 'Failed to fetch notifications');
            }
        } catch (error) {
            set({ error: error.message });
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    // Fetch unread count
    fetchUnreadCount: async () => {
        try {
            const response = await fetch('/api/notifications/unread-count', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            
            const data = await response.json();
            
            if (data.success) {
                set({ unreadCount: data.data.count });
                return data.data.count;
            } else {
                throw new Error(data.message || 'Failed to fetch unread count');
            }
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    // Mark notification as read
    markAsRead: async (id) => {
        try {
            const response = await fetch(`/api/notifications/${id}/read`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            
            if (response.ok) {
                const { notifications, unreadCount } = get();
                
                // Update notification
                const updatedNotifications = notifications.map(notif => 
                    notif.id === id 
                        ? { ...notif, is_read: true, read_at: new Date().toISOString() }
                        : notif
                );
                
                set({ 
                    notifications: updatedNotifications,
                    unreadCount: Math.max(0, unreadCount - 1)
                });
                
                return true;
            } else {
                throw new Error('Failed to mark notification as read');
            }
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    // Mark all notifications as read
    markAllAsRead: async () => {
        try {
            const response = await fetch('/api/notifications/mark-all-read', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            
            if (response.ok) {
                const { notifications } = get();
                
                // Update all notifications
                const updatedNotifications = notifications.map(notif => ({
                    ...notif,
                    is_read: true,
                    read_at: new Date().toISOString()
                }));
                
                set({ 
                    notifications: updatedNotifications,
                    unreadCount: 0
                });
                
                return true;
            } else {
                throw new Error('Failed to mark all notifications as read');
            }
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    // Delete notification
    deleteNotification: async (id) => {
        try {
            const response = await fetch(`/api/notifications/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            
            if (response.ok) {
                const { notifications, unreadCount } = get();
                
                // Find the notification to check if it was unread
                const deletedNotif = notifications.find(n => n.id === id);
                const wasUnread = deletedNotif && !deletedNotif.is_read;
                
                // Remove notification
                const updatedNotifications = notifications.filter(notif => notif.id !== id);
                
                set({ 
                    notifications: updatedNotifications,
                    unreadCount: wasUnread ? Math.max(0, unreadCount - 1) : unreadCount
                });
                
                return true;
            } else {
                throw new Error('Failed to delete notification');
            }
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    // Clear read notifications
    clearRead: async () => {
        try {
            const response = await fetch('/api/notifications/clear-read', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            
            const data = await response.json();
            
            if (data.success) {
                const { notifications } = get();
                
                // Keep only unread notifications
                const unreadNotifications = notifications.filter(notif => !notif.is_read);
                
                set({ notifications: unreadNotifications });
                
                return data.data.deleted_count;
            } else {
                throw new Error(data.message || 'Failed to clear read notifications');
            }
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    // Add notification (for real-time updates)
    addNotification: (notification) => {
        const { notifications, unreadCount } = get();
        
        set({
            notifications: [notification, ...notifications],
            unreadCount: notification.is_read ? unreadCount : unreadCount + 1
        });
    },

    // Update notification (for real-time updates)
    updateNotification: (id, updates) => {
        const { notifications, unreadCount } = get();
        
        const updatedNotifications = notifications.map(notif => 
            notif.id === id ? { ...notif, ...updates } : notif
        );
        
        // Recalculate unread count
        const newUnreadCount = updatedNotifications.filter(notif => !notif.is_read).length;
        
        set({ 
            notifications: updatedNotifications,
            unreadCount: newUnreadCount
        });
    },

    // Remove notification (for real-time updates)
    removeNotification: (id) => {
        const { notifications, unreadCount } = get();
        
        const deletedNotif = notifications.find(n => n.id === id);
        const wasUnread = deletedNotif && !deletedNotif.is_read;
        
        const updatedNotifications = notifications.filter(notif => notif.id !== id);
        
        set({ 
            notifications: updatedNotifications,
            unreadCount: wasUnread ? Math.max(0, unreadCount - 1) : unreadCount
        });
    },

    // Clear all notifications
    clearAll: () => set({ notifications: [], unreadCount: 0, error: null }),

    // Get notification by ID
    getNotification: (id) => {
        const { notifications } = get();
        return notifications.find(notif => notif.id === id);
    },

    // Get notifications by type
    getNotificationsByType: (type) => {
        const { notifications } = get();
        return notifications.filter(notif => notif.type === type);
    },

    // Get unread notifications
    getUnreadNotifications: () => {
        const { notifications } = get();
        return notifications.filter(notif => !notif.is_read);
    },

    // Get read notifications
    getReadNotifications: () => {
        const { notifications } = get();
        return notifications.filter(notif => notif.is_read);
    },

    // Get notifications by priority
    getNotificationsByPriority: (priority) => {
        const { notifications } = get();
        return notifications.filter(notif => notif.priority === priority);
    },

    // Check if there are any unread notifications
    hasUnreadNotifications: () => {
        const { unreadCount } = get();
        return unreadCount > 0;
    },

    // Get notification statistics
    getNotificationStats: () => {
        const { notifications } = get();
        
        const stats = {
            total: notifications.length,
            unread: notifications.filter(n => !n.is_read).length,
            read: notifications.filter(n => n.is_read).length,
            byType: {},
            byPriority: {}
        };
        
        // Count by type
        notifications.forEach(notif => {
            stats.byType[notif.type] = (stats.byType[notif.type] || 0) + 1;
        });
        
        // Count by priority
        notifications.forEach(notif => {
            stats.byPriority[notif.priority] = (stats.byPriority[notif.priority] || 0) + 1;
        });
        
        return stats;
    }
}));

export default useNotificationStore;
