import express from 'express';
import aiService from '../services/aiService.js';
import notificationService from '../services/notificationService.js';

const router = express.Router();

/**
 * POST /chat
 * Gemini AI ile chat endpoint'i
 */
router.post('/', async (req, res) => {
  try {
    const { message, includeDataContext = true } = req.body;

    // Validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Geçersiz mesaj',
        message: 'Mesaj boş olamaz ve string olmalıdır'
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({
        error: 'Mesaj çok uzun',
        message: 'Mesaj 1000 karakterden kısa olmalıdır'
      });
    }

    console.log('Chat request received:', {
      message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
      includeDataContext,
      timestamp: new Date().toISOString()
    });

    // AI servisine chat isteği gönder
    const chatResponse = await aiService.chatWithGemini(message, includeDataContext);

    console.log('Chat response received:', {
      responseLength: chatResponse.response?.length || 0,
      dataContextIncluded: chatResponse.data_context_included,
      aiEmbeddingReady: chatResponse.ai_embedding_ready,
      timestamp: new Date().toISOString()
    });

    // Send notification
    await notificationService.notifyChatSuccess(message.length);

    // Başarılı yanıt
    res.status(200).json({
      success: true,
      data: chatResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat endpoint error:', {
      error: error.message,
      status: error.status,
      details: error.details,
      timestamp: new Date().toISOString()
    });

    // Send notification
    await notificationService.notifyChatError(error.message);

    // Hata yanıtı
    const statusCode = error.status || 500;
    const errorMessage = error.message || 'Chat isteği başarısız oldu';

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: error.details || 'Bilinmeyen hata oluştu',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /chat/status
 * Chat servisinin durumunu kontrol et
 */
router.get('/status', async (req, res) => {
  try {
    // AI servisinin sağlık durumunu kontrol et
    const healthStatus = await aiService.checkHealth();
    
    res.status(200).json({
      success: true,
      data: {
        chat_service: 'active',
        ai_service: healthStatus,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Chat status check error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Chat servis durumu kontrol edilemedi',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
