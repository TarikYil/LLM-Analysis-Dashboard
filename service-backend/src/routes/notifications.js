import express from 'express';

const router = express.Router();

// Shared notification storage
let notifications = [
  {
    id: 1,
    type: 'info',
    title: 'System Started',
    message: 'AI Reporting Agent system has been successfully started.',
    timestamp: new Date().toISOString(),
    read: false,
    category: 'system'
  }
];

let nextId = 2;

// Export functions to share with notificationService
export const getNotifications = () => notifications;
export const setNotifications = (newNotifications) => { notifications = newNotifications; };
export const getNextId = () => nextId;
export const setNextId = (id) => { nextId = id; };

/**
 * GET /notifications
 * Tüm bildirimleri getir
 */
router.get('/', async (req, res) => {
  try {
    const { unread_only = false, limit = 50 } = req.query;
    
    let filteredNotifications = [...notifications];
    
    if (unread_only === 'true') {
      filteredNotifications = filteredNotifications.filter(n => !n.read);
    }
    
    // En yeni bildirimler önce
    filteredNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Limit uygula
    if (limit) {
      filteredNotifications = filteredNotifications.slice(0, parseInt(limit));
    }
    
    const unreadCount = notifications.filter(n => !n.read).length;
    
    res.status(200).json({
      success: true,
      data: {
        notifications: filteredNotifications,
        unread_count: unreadCount,
        total_count: notifications.length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Bildirimler getirilirken hata:', error);
    res.status(500).json({
      error: 'Bildirimler getirilemedi',
      message: error.message
    });
  }
});

/**
 * POST /notifications
 * Yeni bildirim oluştur
 */
router.post('/', async (req, res) => {
  try {
    const { type, title, message, category = 'general' } = req.body;
    
    // Validation
    if (!type || !title || !message) {
      return res.status(400).json({
        error: 'Geçersiz bildirim verisi',
        message: 'type, title ve message alanları zorunludur'
      });
    }
    
    const validTypes = ['info', 'success', 'warning', 'error'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        error: 'Geçersiz bildirim tipi',
        message: `type alanı şu değerlerden biri olmalıdır: ${validTypes.join(', ')}`
      });
    }
    
    const newNotification = {
      id: nextId++,
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      category
    };
    
    notifications.unshift(newNotification); // En başa ekle
    
    console.log('Yeni bildirim oluşturuldu:', {
      id: newNotification.id,
      type: newNotification.type,
      title: newNotification.title,
      category: newNotification.category
    });
    
    res.status(201).json({
      success: true,
      data: newNotification,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Bildirim oluşturulurken hata:', error);
    res.status(500).json({
      error: 'Bildirim oluşturulamadı',
      message: error.message
    });
  }
});

/**
 * PUT /notifications/:id/read
 * Bildirimi okundu olarak işaretle
 */
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const notificationId = parseInt(id);
    
    const notification = notifications.find(n => n.id === notificationId);
    
    if (!notification) {
      return res.status(404).json({
        error: 'Bildirim bulunamadı',
        message: `ID ${notificationId} ile bildirim bulunamadı`
      });
    }
    
    notification.read = true;
    
    console.log('Bildirim okundu olarak işaretlendi:', {
      id: notificationId,
      title: notification.title
    });
    
    res.status(200).json({
      success: true,
      data: notification,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Bildirim güncellenirken hata:', error);
    res.status(500).json({
      error: 'Bildirim güncellenemedi',
      message: error.message
    });
  }
});

/**
 * PUT /notifications/read-all
 * Tüm bildirimleri okundu olarak işaretle
 */
router.put('/read-all', async (req, res) => {
  try {
    const updatedCount = notifications.filter(n => !n.read).length;
    
    notifications.forEach(notification => {
      notification.read = true;
    });
    
    console.log('Tüm bildirimler okundu olarak işaretlendi:', {
      updated_count: updatedCount
    });
    
    res.status(200).json({
      success: true,
      data: {
        updated_count: updatedCount,
        message: `${updatedCount} bildirim okundu olarak işaretlendi`
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Bildirimler güncellenirken hata:', error);
    res.status(500).json({
      error: 'Bildirimler güncellenemedi',
      message: error.message
    });
  }
});

/**
 * DELETE /notifications/:id
 * Bildirimi sil
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const notificationId = parseInt(id);
    
    const notificationIndex = notifications.findIndex(n => n.id === notificationId);
    
    if (notificationIndex === -1) {
      return res.status(404).json({
        error: 'Bildirim bulunamadı',
        message: `ID ${notificationId} ile bildirim bulunamadı`
      });
    }
    
    const deletedNotification = notifications.splice(notificationIndex, 1)[0];
    
    console.log('Bildirim silindi:', {
      id: notificationId,
      title: deletedNotification.title
    });
    
    res.status(200).json({
      success: true,
      data: {
        deleted_notification: deletedNotification,
        message: 'Bildirim başarıyla silindi'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Bildirim silinirken hata:', error);
    res.status(500).json({
      error: 'Bildirim silinemedi',
      message: error.message
    });
  }
});

export default router;
