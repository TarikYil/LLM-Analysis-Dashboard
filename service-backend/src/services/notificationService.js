import { getNotifications, setNotifications, getNextId, setNextId } from '../routes/notifications.js';

class NotificationService {
  constructor() {
    // HTTP isteği yerine doğrudan memory'ye yaz
  }

  /**
   * Yeni bildirim oluştur
   */
  async createNotification(notification) {
    try {
      const notifications = getNotifications();
      const nextId = getNextId();
      
      const newNotification = {
        id: nextId,
        ...notification,
        timestamp: new Date().toISOString(),
        read: false
      };
      
      notifications.unshift(newNotification); // En başa ekle
      setNotifications(notifications);
      setNextId(nextId + 1);
      
      console.log('🔔 Yeni bildirim oluşturuldu:', {
        id: newNotification.id,
        type: newNotification.type,
        title: newNotification.title,
        category: newNotification.category
      });
      
      return { success: true, data: newNotification };
    } catch (error) {
      console.error('Bildirim oluşturulurken hata:', error.message);
      return null;
    }
  }

  /**
   * File upload success notification
   */
  async notifyFileUploadSuccess(filename, reportId, fileSize) {
    const notification = {
      type: 'success',
      title: 'File Upload Successful',
      message: `${filename} has been successfully uploaded and processed. Report ID: ${reportId}`,
      category: 'data',
      metadata: {
        filename,
        reportId,
        fileSize,
        action: 'file_upload'
      }
    };

    return await this.createNotification(notification);
  }

  /**
   * File upload error notification
   */
  async notifyFileUploadError(filename, error) {
    const notification = {
      type: 'error',
      title: 'File Upload Error',
      message: `Error occurred while uploading ${filename}: ${error}`,
      category: 'data',
      metadata: {
        filename,
        error,
        action: 'file_upload_error'
      }
    };

    return await this.createNotification(notification);
  }

  /**
   * AI analysis success notification
   */
  async notifyAnalysisSuccess(reportId, analysisType) {
    const notification = {
      type: 'success',
      title: 'AI Analysis Completed',
      message: `${analysisType} analysis has been completed successfully. Report ID: ${reportId}`,
      category: 'ai',
      metadata: {
        reportId,
        analysisType,
        action: 'analysis_success'
      }
    };

    return await this.createNotification(notification);
  }

  /**
   * AI analysis error notification
   */
  async notifyAnalysisError(reportId, analysisType, error) {
    const notification = {
      type: 'error',
      title: 'AI Analysis Error',
      message: `Error occurred during ${analysisType} analysis: ${error}`,
      category: 'ai',
      metadata: {
        reportId,
        analysisType,
        error,
        action: 'analysis_error'
      }
    };

    return await this.createNotification(notification);
  }

  /**
   * Chat success notification
   */
  async notifyChatSuccess(messageLength) {
    const notification = {
      type: 'info',
      title: 'AI Chat Completed',
      message: `Chat with AI assistant completed. Message length: ${messageLength} characters`,
      category: 'chat',
      metadata: {
        messageLength,
        action: 'chat_success'
      }
    };

    return await this.createNotification(notification);
  }

  /**
   * Chat error notification
   */
  async notifyChatError(error) {
    const notification = {
      type: 'error',
      title: 'AI Chat Error',
      message: `Error occurred during chat with AI assistant: ${error}`,
      category: 'chat',
      metadata: {
        error,
        action: 'chat_error'
      }
    };

    return await this.createNotification(notification);
  }

  /**
   * System status notification
   */
  async notifySystemStatus(status, message) {
    const notification = {
      type: status === 'healthy' ? 'success' : 'warning',
      title: 'System Status',
      message: message,
      category: 'system',
      metadata: {
        status,
        action: 'system_status'
      }
    };

    return await this.createNotification(notification);
  }

  /**
   * Performance warning notification
   */
  async notifyPerformanceWarning(service, responseTime) {
    const notification = {
      type: 'warning',
      title: 'Performance Warning',
      message: `${service} service is responding slowly. Response time: ${responseTime}ms`,
      category: 'performance',
      metadata: {
        service,
        responseTime,
        action: 'performance_warning'
      }
    };

    return await this.createNotification(notification);
  }

  /**
   * User action notification
   */
  async notifyUserAction(action, details) {
    const notification = {
      type: 'info',
      title: 'User Action',
      message: `${action}: ${details}`,
      category: 'user',
      metadata: {
        action,
        details,
        action: 'user_action'
      }
    };

    return await this.createNotification(notification);
  }
}

export default new NotificationService();
