import axios from 'axios';
// Mock API removed - using real backend only

// API base URL from environment variables (Vite format)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

console.log('🔗 API Base URL:', API_BASE_URL);

// Create axios instance for API calls
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Increased timeout for file uploads and AI processing
  headers: {
    'Content-Type': 'application/json',
  },
});

// Debug: Log all requests
apiClient.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.baseURL + config.url,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptors for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Report API functions - No authentication required

export const reportAPI = {
  // Upload a report file (PDF/CSV/Excel)
  uploadReport: async (file, options = {}) => {
    console.log('📁 uploadReport called with file:', file.name);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Add any additional options
      Object.keys(options).forEach(key => {
        formData.append(key, options[key]);
      });

      const response = await apiClient.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: options.onProgress,
      });
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'File upload failed');
    }
  },

  // Get report summary
  getSummary: async (reportId) => {
    console.log('📊 getSummary called with reportId:', reportId);
    console.log('📊 getSummary - reportId type:', typeof reportId);
    console.log('📊 getSummary - reportId value:', JSON.stringify(reportId));
  
    try {
      // reportId'yi URL'e ekle
      const url = `/summary/${reportId}`;
      console.log('📊 getSummary - API URL:', url);
      
      const response = await apiClient.get(url);
  
      console.log('📥 getSummary - Full API response:', response);
      console.log('📥 getSummary - Response status:', response.status);
      console.log('📥 getSummary - Response headers:', response.headers);
      console.log('📥 getSummary - Response data:', response.data);
      console.log('📥 getSummary - Response data type:', typeof response.data);
      console.log('📥 getSummary - Response data keys:', Object.keys(response.data || {}));
      
      // AI Service'den gelen response'u direkt döndür
      const result = response.data;
      console.log('📥 getSummary - Returning result:', result);
      console.log('📥 getSummary - Result type:', typeof result);
      console.log('📥 getSummary - Result structure analysis:', {
        hasSummary: 'summary' in result,
        hasData: 'data' in result,
        hasResult: 'result' in result,
        hasResponse: 'response' in result,
        summaryType: typeof result.summary,
        summaryValue: result.summary ? result.summary.substring(0, 100) + '...' : result.summary,
        allKeys: Object.keys(result || {}),
        fullStructure: JSON.stringify(result, null, 2)
      });
      return result;
    } catch (error) {
      console.error('❌ getSummary error:', error);
      console.error('❌ getSummary error response:', error.response);
      console.error('❌ getSummary error message:', error.message);
      console.error('❌ getSummary error stack:', error.stack);
      throw new Error(
        error.response?.data?.message || 'Failed to get summary'
      );
    }
  },
  

  // Get report KPIs
  getKPIs: async (reportId) => {
    console.log('📈 getKPIs called with reportId:', reportId);
    
    try {
      const response = await apiClient.get(`/kpi/${reportId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get KPIs');
    }
  },

  // Get report trends  
  getTrends: async (reportId) => {
    console.log('📊 getTrends called with reportId:', reportId);
    
    try {
      const response = await apiClient.get(`/trend/${reportId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get trends');
    }
  },

  // Query report with natural language
  queryReport: async (query, reportId = null) => {
    console.log('🤔 queryReport called with query:', query, 'reportId:', reportId);
    
    try {
      const payload = { 
        query,
        report_id: reportId // Match AI service expected format
      };

      const response = await apiClient.post('/query', payload);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Query failed');
    }
  },

  // Get report insights
  getInsights: async (reportId) => {
    console.log('💡 getInsights called with reportId:', reportId);
    
    try {
      const response = await apiClient.get(`/insights/${reportId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get insights');
    }
  },

  // Get action items
  getActions: async (reportId) => {
    console.log('🎯 getActions called with reportId:', reportId);
    
    try {
      const response = await apiClient.get(`/actions/${reportId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get action items');
    }
  },
  getEmbeddingStatus: async () => {
    console.log('🔍 getEmbeddingStatus called');
    try {
      const response = await apiClient.get('/status');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get embedding status');
    }
  },

  // Chat with Gemini AI
  chatWithGemini: async (message, includeDataContext = true) => {
    console.log('💬 chatWithGemini called with message:', message.substring(0, 50) + '...');
    
    try {
      const payload = {
        message,
        includeDataContext
      };

      const response = await apiClient.post('/chat', payload);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Chat request failed');
    }
  },

  // Get all reports (optional - if backend provides this)
  getReports: async (page = 1, limit = 10) => {
    try {
      const response = await apiClient.get('/reports', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch reports');
    }
  },

  // Get specific report metadata
  getReport: async (reportId) => {
    try {
      const response = await apiClient.get(`/reports/${reportId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch report');
    }
  },

  // Delete a report (optional)
  deleteReport: async (reportId) => {
    try {
      const response = await apiClient.delete(`/reports/${reportId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete report');
    }
  },
};

// Notification API functions
export const notificationAPI = {
  // Get all notifications
  getNotifications: async (options = {}) => {
    try {
      const { unread_only = false, limit = 50 } = options;
      const response = await apiClient.get('/notifications', {
        params: { unread_only, limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
    }
  },

  // Create a new notification
  createNotification: async (notification) => {
    try {
      const response = await apiClient.post('/notifications', notification);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create notification');
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await apiClient.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to mark notification as read');
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const response = await apiClient.put('/notifications/read-all');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to mark all notifications as read');
    }
  },

  // Delete a notification
  deleteNotification: async (notificationId) => {
    try {
      const response = await apiClient.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete notification');
    }
  },
};

// Utility functions
export const apiUtils = {
  // Handle API errors
  handleError: (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 'An error occurred';
      return { error: true, message, status: error.response.status };
    } else if (error.request) {
      // Request made but no response
      return { error: true, message: 'Network error - please try again', status: null };
    } else {
      // Something else happened
      return { error: true, message: error.message || 'An unexpected error occurred', status: null };
    }
  },

  // Format file size for display
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Validate file type
  isValidFileType: (file) => {
    const validTypes = [
      'application/pdf',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    return validTypes.includes(file.type);
  }
};

// Settings API functions
export const settingsAPI = {
  // Get user settings
  getSettings: async () => {
    try {
      const response = await apiClient.get('/settings');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get settings');
    }
  },

  // Update user settings
  updateSettings: async (settings) => {
    try {
      const response = await apiClient.put('/settings', settings);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update settings');
    }
  },

  // Reset settings to default
  resetSettings: async () => {
    try {
      const response = await apiClient.post('/settings/reset');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to reset settings');
    }
  },

  // Export settings
  exportSettings: async () => {
    try {
      const response = await apiClient.get('/settings/export', {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to export settings');
    }
  },

  // Import settings
  importSettings: async (settings) => {
    try {
      const response = await apiClient.post('/settings/import', { settings });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to import settings');
    }
  },

  // Get settings service status
  getStatus: async () => {
    try {
      const response = await apiClient.get('/settings/status');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get settings status');
    }
  }
};

// Notification service for easier access
export const notificationService = notificationAPI;

export default { reportAPI, notificationAPI, settingsAPI, apiUtils };
