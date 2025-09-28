import express from 'express';
import aiService from '../services/aiService.js';

const router = express.Router();

/**
 * GET /api/embedding-status
 * AI servisinden embedding durumunu al
 */
router.get('/', async (req, res) => {
  try {
    console.log('🔍 Embedding status isteği alındı');
    
    const embeddingStatus = await aiService.getEmbeddingStatus();
    
    console.log('✅ Embedding status başarıyla alındı:', {
      status: embeddingStatus.embedding_status?.status,
      progress: embeddingStatus.embedding_status?.progress,
      ai_ready: embeddingStatus.embedding_status?.status === 'completed' || embeddingStatus.embedding_status?.progress === 100
    });
    
    // AI ready kontrolü - AI servisinden gelen ai_ready veya status/progress kontrolü
    const ai_ready = embeddingStatus.ai_ready === true || 
                     embeddingStatus.embedding_status?.status === 'completed' || 
                     embeddingStatus.embedding_status?.progress === 100;
    
    console.log('🔧 AI Ready hesaplama:', {
      ai_ready_from_service: embeddingStatus.ai_ready,
      status: embeddingStatus.embedding_status?.status,
      progress: embeddingStatus.embedding_status?.progress,
      final_ai_ready: ai_ready
    });
    
    res.json({
      success: true,
      data: {
        ...embeddingStatus,
        ai_ready: ai_ready
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Embedding status hatası:', {
      message: error.message,
      status: error.status,
      details: error.details
    });
    
    res.status(error.status || 500).json({
      success: false,
      error: {
        message: error.message || 'Embedding status alınamadı',
        details: error.details || 'Bilinmeyen hata',
        status: error.status || 500
      },
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
