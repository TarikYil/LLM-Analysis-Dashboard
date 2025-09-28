import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/api';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Bildirimleri yükle
  const loadNotifications = useCallback(async (options = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await notificationService.getNotifications(options);
      if (response.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unread_count);
      }
    } catch (err) {
      console.error('Bildirimler yüklenirken hata:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Bildirimi okundu olarak işaretle
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Bildirim okundu olarak işaretlenirken hata:', err);
      throw err;
    }
  }, []);

  // Tüm bildirimleri okundu olarak işaretle
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Tüm bildirimler okundu olarak işaretlenirken hata:', err);
      throw err;
    }
  }, []);

  // Bildirimi sil
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      const deletedNotif = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      
      // Eğer silinen bildirim okunmamışsa unread count'u azalt
      if (deletedNotif && !deletedNotif.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Bildirim silinirken hata:', err);
      throw err;
    }
  }, [notifications]);

  // Yeni bildirim oluştur
  const createNotification = useCallback(async (notificationData) => {
    try {
      const response = await notificationService.createNotification(notificationData);
      if (response.success) {
        setNotifications(prev => [response.data, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
      return response;
    } catch (err) {
      console.error('Bildirim oluşturulurken hata:', err);
      throw err;
    }
  }, []);

  // Okunmamış bildirim sayısını yükle
  const loadUnreadCount = useCallback(async () => {
    try {
      const response = await notificationService.getNotifications({ unread_only: true });
      if (response.success) {
        setUnreadCount(response.data.unread_count);
      }
    } catch (err) {
      console.error('Okunmamış bildirim sayısı yüklenirken hata:', err);
    }
  }, []);

  // İlk yükleme
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Periyodik güncelleme (30 saniyede bir)
  useEffect(() => {
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [loadUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    loadUnreadCount,
  };
};