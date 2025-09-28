import express from 'express';
import { param, validationResult } from 'express-validator';

import aiService from '../services/aiService.js';
import notificationService from '../services/notificationService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * GET /api/actions/:reportId
 * Get action items for a report
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

    console.log('🎯 Action items istendi:', { reportId, ip: req.ip });

    try {
      // Get actions from AI service
      const aiResponse = await aiService.getActions(reportId);
      
      console.log('🤖 AI actions yanıtı alındı:', {
        reportId,
        hasData: !!aiResponse,
        actionsCount: aiResponse.actions?.length || 0
      });

      // Verilen API formatına göre direkt yanıt döndür
      const actionsData = aiResponse.actions || aiResponse;
      
      // Send notification
      await notificationService.notifyAnalysisSuccess(reportId, 'AI Actions Analysis');

      // Success response - Verilen formata uygun yanıt
      res.status(200).json({
        actions: actionsData
      });

    } catch (error) {
      console.error('❌ Actions hatası:', {
        reportId,
        error: error.message,
        status: error.status
      });

      // Send notification
      await notificationService.notifyAnalysisError(reportId, 'AI Actions Analysis', error.message);

      // Handle different error types
      if (error.status === 404) {
        return res.status(404).json({
          success: false,
          error: true,
          message: 'Rapor bulunamadı',
          details: `Report ID: ${reportId} için action verisi bulunamadı`
        });
      }

      if (error.status === 503) {
        return res.status(503).json({
          success: false,
          error: true,
          message: 'AI servisi şu anda kullanılamıyor',
          details: 'Action analiz servisi geçici olarak devre dışı'
        });
      }

      // Generic error
      res.status(error.status || 500).json({
        success: false,
        error: true,
        message: 'Action items alınamadı',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Servis hatası',
        reportId
      });
    }
  })
);

/**
 * GET /api/actions/status
 * Check actions service status
 */
router.get('/status', asyncHandler(async (req, res) => {
  const aiHealth = await aiService.checkHealth();
  
  res.json({
    success: true,
    service: 'actions',
    status: 'running',
    aiService: aiHealth,
    capabilities: [
      'AI-generated action items',
      'Recommendation analysis',
      'Priority scoring',
      'Action categorization'
    ],
    timestamp: new Date().toISOString()
  });
}));

export default router;
