import express from 'express';
import { param, validationResult } from 'express-validator';

import aiService from '../services/aiService.js';
import notificationService from '../services/notificationService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * GET /api/summary/:reportId
 * Get AI-generated summary for a report
 */
router.get('/:reportId', 
  [
    param('reportId')
      .notEmpty()
      .withMessage('Report ID gerekli')
      .isLength({ min: 1, max: 100 })
      .withMessage('Geçersiz Report ID formatı')
  ],
  asyncHandler(async (req, res) => {
    // Validation check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: true,
        message: 'Geçersiz parametreler',
        details: errors.array()
      });
    }

    const { reportId } = req.params;

    console.log('📊 Summary istendi:', { reportId, ip: req.ip });

    try {
      // Get summary from AI service
      const aiResponse = await aiService.getSummary(reportId);
      
      console.log('🤖 AI summary yanıtı alındı:', {
        reportId,
        hasData: !!aiResponse,
        responseKeys: Object.keys(aiResponse || {})
      });

      // AI servisinden gelen karmaşık yanıtı UI'ya uygun formata dönüştür
      let summaryText = '';
      let keyPoints = [];
      
      if (aiResponse.basic_summary) {
        summaryText = aiResponse.basic_summary.ozet || aiResponse.basic_summary.toString();
      }
      
      if (aiResponse.ai_summary) {
        if (typeof aiResponse.ai_summary === 'string') {
          summaryText += '\n\nAI Analizi: ' + aiResponse.ai_summary;
        } else {
          summaryText += '\n\nAI Analizi: ' + JSON.stringify(aiResponse.ai_summary);
        }
      }
      
      if (!summaryText && aiResponse.summary) {
        summaryText = aiResponse.summary;
      }
      
      if (!summaryText) {
        summaryText = 'Özet oluşturulamadı. Lütfen tekrar deneyin.';
      }
      
      // Send notification
      await notificationService.notifyAnalysisSuccess(reportId, 'Summary Analysis');

      // AI Service'den gelen response'u direkt kullan
      res.status(200).json(aiResponse);

    } catch (error) {
      console.error('❌ Summary hatası:', {
        reportId,
        error: error.message,
        status: error.status
      });

      // Send notification
      await notificationService.notifyAnalysisError(reportId, 'Summary Analysis', error.message);

      // Handle different error types
      if (error.status === 404) {
        return res.status(404).json({
          success: false,
          error: true,
          message: 'Rapor bulunamadı',
          details: `Report ID: ${reportId} için özet bulunamadı`
        });
      }

      if (error.status === 503) {
        return res.status(503).json({
          success: false,
          error: true,
          message: 'AI servisi şu anda kullanılamıyor',
          details: 'Özet oluşturma servisi geçici olarak devre dışı'
        });
      }

      // Generic error
      res.status(error.status || 500).json({
        success: false,
        error: true,
        message: 'Özet alınamadı',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Servis hatası',
        reportId
      });
    }
  })
);

/**
 * POST /api/summary/regenerate/:reportId
 * Regenerate summary for a report
 */
router.post('/regenerate/:reportId',
  [
    param('reportId')
      .notEmpty()
      .withMessage('Report ID gerekli')
      .isLength({ min: 1, max: 100 })
      .withMessage('Geçersiz Report ID formatı')
  ],
  asyncHandler(async (req, res) => {
    // Validation check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: true,
        message: 'Geçersiz parametreler',
        details: errors.array()
      });
    }

    const { reportId } = req.params;
    const { options } = req.body; // Additional options for regeneration

    console.log('🔄 Summary yenileme istendi:', { reportId, options });

    try {
      // Call AI service to regenerate summary
      // This might be a different endpoint or same endpoint with force parameter
      const aiResponse = await aiService.getSummary(reportId, { 
        regenerate: true, 
        ...options 
      });

      console.log('🤖 Yeni summary oluşturuldu:', { reportId });

      res.status(200).json({
        success: true,
        message: 'Özet yeniden oluşturuldu',
        data: {
          reportId,
          summary: aiResponse.summary || aiResponse,
          generatedAt: new Date().toISOString(),
          regenerated: true,
          ...aiResponse
        }
      });

    } catch (error) {
      console.error('❌ Summary yenileme hatası:', error.message);

      res.status(error.status || 500).json({
        success: false,
        error: true,
        message: 'Özet yenilenemedi',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Servis hatası',
        reportId
      });
    }
  })
);

/**
 * GET /api/summary/status
 * Check summary service status
 */
router.get('/status', asyncHandler(async (req, res) => {
  const aiHealth = await aiService.checkHealth();
  
  res.json({
    success: true,
    service: 'summary',
    status: 'running',
    aiService: aiHealth,
    capabilities: [
      'AI-generated summaries',
      'Key points extraction',
      'Sentiment analysis',
      'Summary regeneration'
    ],
    timestamp: new Date().toISOString()
  });
}));

export default router;
