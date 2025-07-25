
import type { Notification } from './types';

const NOTIFICATIONS_KEY = 'shedula_notifications';
let notifications: Notification[] = [];
const listeners: (() => void)[] = [];

const loadNotifications = () => {
  if (typeof window === 'undefined') return;
  const stored = localStorage.getItem(NOTIFICATIONS_KEY);
  notifications = stored ? JSON.parse(stored) : [];
};

const saveNotifications = () => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  notifyListeners();
};

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

// Initialize notifications on load
if (typeof window !== 'undefined') {
  loadNotifications();
}

export const getNotifications = (): Notification[] => {
  return [...notifications].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const addNotification = (newNotification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
  const notification: Notification = {
    ...newNotification,
    id: `N${Date.now()}`,
    timestamp: new Date().toISOString(),
    read: false,
  };
  notifications = [notification, ...notifications];
  saveNotifications();
};

export const markAllAsRead = () => {
  notifications = notifications.map(n => ({ ...n, read: true }));
  saveNotifications();
};

export const subscribe = (listener: () => void) => {
  listeners.push(listener);
  // Return an unsubscribe function
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
};
