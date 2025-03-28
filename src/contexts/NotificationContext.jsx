'use client';

import { createContext, useContext, useState, useEffect } from 'react';

// Sample notification data - in a real app, this would come from an API
const sampleNotifications = [
  {
    id: 1,
    type: 'info',
    message: 'Welcome to your dashboard!',
    time: '2 min ago',
    read: false,
  },
  {
    id: 2,
    type: 'success',
    message: 'Your strategy was successfully deployed.',
    time: '1 hour ago',
    read: false,
  },
  {
    id: 3,
    type: 'warning',
    message: 'Your subscription will expire in 3 days.',
    time: '5 hours ago',
    read: true,
  },
  {
    id: 4,
    type: 'error',
    message: 'Failed to connect to broker API.',
    time: '1 day ago',
    read: true,
  },
];

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // In a real app, you would fetch notifications from an API
    setNotifications(sampleNotifications);
    setUnreadCount(sampleNotifications.filter(n => !n.read).length);
  }, []);

  const markAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    setUnreadCount(0);
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      time: 'Just now',
      read: false,
      ...notification,
    };
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}