import { useState, useEffect, useCallback } from 'react';
import { AppNotification } from '../types/app';
import { firestoreData } from '../services/firestoreData';

interface NotificationData {
  id: string;
  message: string;
  type: 'warning' | 'error' | 'info';
  date: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [deliveriesToday, setDeliveriesToday] = useState<any[]>([]);
  const [showDeliveryAlarm, setShowDeliveryAlarm] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    // Subscribe to Firestore bookings for real-time notifications
    const unsub = firestoreData.subscribeToBookings((data) => {
      setBookings(data);
    });
    return () => unsub();
  }, []);

  const generateNotifications = useCallback(() => {
    const newNotifs: NotificationData[] = [];
    const upcomingDeliveries: any[] = [];
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Process bookings from Firestore
    if (Array.isArray(bookings)) {
      bookings.forEach((b: any) => {
        if (b.date === tomorrowStr && b.status !== 'cancelled') {
          newNotifs.push({
            id: `upcoming-${b.id}`,
            message: `موعد تصوير غداً: ${b.clientName}`,
            type: 'warning',
            date: new Date().toISOString(),
          });
        }
        if (b.deliveryDate === todayStr && b.status !== 'delivered' && b.status !== 'cancelled') {
          upcomingDeliveries.push(b);
          newNotifs.push({
            id: `delivery-${b.id}`,
            message: `موعد تسليم اليوم: ${b.clientName}`,
            type: 'warning',
            date: new Date().toISOString(),
          });
        }
      });
    }

    // Check supplies from localStorage (still using localStorage for supplies)
    const storedSupplies = localStorage.getItem('shadySupplies');
    if (storedSupplies) {
      try {
        const supplies = JSON.parse(storedSupplies);
        if (Array.isArray(supplies)) {
          supplies.forEach((s: any) => {
            if (s.quantity <= s.minQuantity) {
              newNotifs.push({
                id: `supply-${s.id}`,
                message: `المستلزمات منخفضة: ${s.name}`,
                type: 'error',
                date: new Date().toISOString(),
              });
            }
          });
        }
      } catch (e) {
        console.error('Error parsing supplies for notifications:', e);
      }
    }

    setNotifications(newNotifs);
    setDeliveriesToday(upcomingDeliveries);
    if (upcomingDeliveries.length > 0) {
      setShowDeliveryAlarm(true);
    }
  }, [bookings]);

  useEffect(() => {
    generateNotifications();
    const interval = setInterval(generateNotifications, 60000);
    return () => clearInterval(interval);
  }, [generateNotifications]);

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    isNotificationsOpen,
    setIsNotificationsOpen,
    deliveriesToday,
    showDeliveryAlarm,
    setShowDeliveryAlarm,
    clearNotification,
    clearAllNotifications,
    refreshNotifications: generateNotifications,
  };
}
