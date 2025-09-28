import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

/**
 * AI Service Client
 * AI servisine yapılan tüm istekleri yöneten servis
 */
class AIService {
  constructor() {
    this.baseURL = process.env.AI_SERVICE_URL || 'http://localhost:5000';
    this.apiKey = process.env.AI_SERVICE_API_KEY;
    this.timeout = 30000; // 30 saniye - Upload hızlı olmalı
    
    // Create axios instance
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add API key to headers if available
    if (this.apiKey) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${this.apiKey}`;
    }

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('AI Service Error:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          timestamp: new Date().toISOString()
        });
        throw error;
      }
    );
  }

  /**
   * Upload file to AI service
   * @param {string} filePath - Path to the uploaded file
   * @param {Object} metadata - File metadata
   * @returns {Promise<Object>} AI service response
   */
  async uploadFile(filePath, metadata = {}) {
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath));
      
      // Add metadata
      Object.keys(metadata).forEach(key => {
        formData.append(key, metadata[key]);
      });

      const response = await this.client.post('/analyze/upload', formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: this.timeout,
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error, 'File upload failed');
    }
  }

  /**
   * Get summary for a report
   * @param {string} reportId - Report ID
   * @returns {Promise<Object>} Summary data
   */
  async getSummary(reportId) {
    try {
      const response = await this.client.get(`/analyze/summary/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to get summary');
    }
  }

  /**
   * Get KPIs for a report
   * @param {string} reportId - Report ID
   * @returns {Promise<Object>} KPI data
   */
  
  async getKPIs(reportId) {
    try {
      const response = await this.client.get('/analyze/kpi');
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to get KPIs');
    }
  }

  /**
   * Get trends for a report
   * @param {string} reportId - Report ID
   * @returns {Promise<Object>} Trend data
   */
  async getTrends(reportId) {
    try {
      const response = await this.client.get('/analyze/trend');
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to get trends');
    }
  }

  /**
   * Query report with natural language
   * @param {string} query - User query
   * @param {string} reportId - Report ID (optional)
   * @returns {Promise<Object>} Query response
   */
  async queryReport(query, reportId = null) {
    try {
      const payload = {
        query,
        report_id: reportId
      };

      const response = await this.client.post('/query', payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Query failed');
    }
  }

  /**
   * Get key insights from AI service
   * @param {string} reportId - Report identifier
   * @returns {Promise<Object>} Insights data
   */
  async getInsights(reportId) {
    try {
      const response = await this.client.get('/analyze/insights');
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Insights analysis failed');
    }
  }

  /**
   * Get action items from AI service
   * @param {string} reportId - Report identifier
   * @returns {Promise<Object>} Actions data
   */
  async getActions(reportId) {
    try {
      const response = await this.client.get('/analyze/actions');
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Actions analysis failed');
    }
  }

  /**
   * Get embedding status from AI service
   * @returns {Promise<Object>} Embedding status data
   */
  async getEmbeddingStatus() {
    try {
      const response = await this.client.get('/analyze/status');
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to get embedding status');
    }
  }

  /**
   * Chat with Gemini AI
   * @param {string} message - User message
   * @param {boolean} includeDataContext - Include data context in chat
   * @returns {Promise<Object>} Chat response
   */
  async chatWithGemini(message, includeDataContext = true) {
    try {
      const payload = {
        message,
        include_data_context: includeDataContext
      };

      const response = await this.client.post('/analyze/chat', payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Chat request failed');
    }
  }

  /**
   * Check AI service health
   * @returns {Promise<Object>} Health status
   */
  async checkHealth() {
    try {
      const response = await this.client.get('/health', {
        timeout: 5000 // Shorter timeout for health check
      });
      return {
        status: 'healthy',
        ...response.data
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Handle AI service errors
   * @param {Error} error - Original error
   * @param {string} defaultMessage - Default error message
   * @returns {Error} Formatted error
   */
  handleError(error, defaultMessage) {
    if (error.response) {
      // AI service responded with error
      const aiError = new Error(error.response.data?.message || defaultMessage);
      aiError.status = error.response.status;
      aiError.details = error.response.data?.details;
      return aiError;
    } else if (error.request) {
      // No response from AI service
      const networkError = new Error('AI servisi yanıt vermiyor');
      networkError.status = 503;
      networkError.details = 'Servis bağlantısı kontrol ediliyor';
      return networkError;
    } else {
      // Other error
      const genericError = new Error(defaultMessage);
      genericError.status = 500;
      genericError.details = error.message;
      return genericError;
    }
  }

  /**
   * Get service configuration info
   * @returns {Object} Service configuration
   */
  getServiceInfo() {
    return {
      baseURL: this.baseURL,
      timeout: this.timeout,
      hasApiKey: !!this.apiKey,
      timestamp: new Date().toISOString()
    };
  }
}

// Create singleton instance
const aiService = new AIService();

export default aiService;
export { AIService };
