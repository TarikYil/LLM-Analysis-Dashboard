import express from 'express';
import { validationResult } from 'express-validator';
import aiService from '../services/aiService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * GET /api/embedding-status
 * Get embedding status from AI service
 */
router.get('/status', asyncHandler(async (req, res) => {
  console.log('🔍 Embedding status istendi:', { ip: req.ip });

  try {
    const aiResponse = await aiService.getEmbeddingStatus();

    console.log('🤖 AI embedding status yanıtı alındı:', {
      hasData: !!aiResponse,
      status: aiResponse?.embedding_status?.status,
      ai_ready: aiResponse?.ai_ready
    });

    // AI servisinden gelen yanıtı doğrudan döndür
    res.status(200).json(aiResponse);

  } catch (error) {
    console.error('❌ Embedding status hatası:', {
      error: error.message,
      status: error.status
    });

    if (error.status === 503) {
      return res.status(503).json({
        success: false,
        error: true,
        message: 'AI servisi şu anda kullanılamıyor',
        details: 'Embedding status servisi geçici olarak devre dışı'
      });
    }

    res.status(error.status || 500).json({
      success: false,
      error: true,
      message: 'Embedding durumu alınamadı',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Servis hatası'
    });
  }
}));

export default router;
