'use client';

import { useState } from 'react';
import { Bell, X, Check, AlertCircle, Info } from 'lucide-react';
import { useNotifications } from '../../../contexts/NotificationContext';

export default function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <X className="h-5 w-5 text-red-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button 
        onClick={togglePanel}
        className="relative p-2 text-zinc-400 hover:text-white transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-md shadow-lg z-50 overflow-hidden">
          <div className="p-3 border-b border-zinc-800 flex justify-between items-center">
            <h3 className="text-white font-medium">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              <div>
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-3 border-b border-zinc-800 hover:bg-zinc-800/50 ${!notification.read ? 'bg-zinc-800/20' : ''}`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${!notification.read ? 'text-white' : 'text-zinc-400'}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">{notification.time}</p>
                      </div>
                      {!notification.read && (
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          className="ml-2 text-zinc-500 hover:text-zinc-300"
                          aria-label="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-zinc-500">
                <p>No notifications</p>
              </div>
            )}
          </div>
          
          <div className="p-2 border-t border-zinc-800 text-center">
            <button className="text-xs text-blue-400 hover:text-blue-300">
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}