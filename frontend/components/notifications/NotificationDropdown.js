import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  XMarkIcon, 
  CheckIcon, 
  TrashIcon,
  BellIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  GiftIcon
} from '@heroicons/react/24/outline';
import useNotificationStore from '../../lib/stores/notificationStore';
import LoadingSpinner from '../ui/LoadingSpinner';

const NotificationDropdown = ({ onClose }) => {
  const router = useRouter();
  const { 
    notifications, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    isLoading 
  } = useNotificationStore();

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fetch notifications when dropdown opens
    fetchNotifications();
    
    // Add animation delay
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, [fetchNotifications]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (!event.target.closest('.notification-dropdown')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleNotificationClick = (notification) => {
    // Mark as read if unread
    if (!notification.read_at) {
      markAsRead(notification.id);
    }

    // Navigate to action URL if available
    if (notification.action_url) {
      router.push(notification.action_url);
      onClose();
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order_update':
        return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
      case 'payment':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'promotion':
        return <GiftIcon className="h-5 w-5 text-purple-500" />;
      case 'system':
        return <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
      case 'product':
        return <BellIcon className="h-5 w-5 text-orange-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'order_update':
        return 'border-l-blue-500 bg-blue-50';
      case 'payment':
        return 'border-l-green-500 bg-green-50';
      case 'promotion':
        return 'border-l-purple-500 bg-purple-50';
      case 'system':
        return 'border-l-gray-500 bg-gray-50';
      case 'product':
        return 'border-l-orange-500 bg-orange-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <div className={`notification-dropdown absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 transition-all duration-200 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
        <div className="flex items-center space-x-2">
          {notifications.length > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-rose-600 hover:text-rose-700 font-medium"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center">
            <LoadingSpinner size="sm" />
            <p className="text-gray-500 mt-2">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No notifications yet</p>
            <p className="text-sm text-gray-400 mt-1">We'll notify you when something happens</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${
                  getNotificationColor(notification.type)
                } ${!notification.read_at ? 'bg-white' : 'bg-gray-50'}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start space-x-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <p className={`text-sm font-medium ${
                        !notification.read_at ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </p>
                      <span className="text-xs text-gray-400">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${
                      !notification.read_at ? 'text-gray-800' : 'text-gray-600'
                    }`}>
                      {notification.message}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1">
                    {!notification.read_at && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                        title="Mark as read"
                      >
                        <CheckIcon className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete notification"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Unread indicator */}
                {!notification.read_at && (
                  <div className="mt-2">
                    <span className="inline-block w-2 h-2 bg-rose-500 rounded-full"></span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => {
              router.push('/notifications');
              onClose();
            }}
            className="w-full text-center text-sm text-rose-600 hover:text-rose-700 font-medium"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
