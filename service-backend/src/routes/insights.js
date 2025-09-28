import express from 'express';
import { body, param, validationResult } from 'express-validator';
import aiService from '../services/aiService.js';
import notificationService from '../services/notificationService.js';

const router = express.Router();

/**
 * GET /api/insights/:reportId
 * AI destekli key insights alma endpoint'i
 */
router.get('/:reportId', [
  param('reportId')
    .notEmpty()
    .withMessage('Report ID gerekli')
    .isLength({ min: 3 })
    .withMessage('Geçersiz report ID formatı')
], async (req, res) => {
  // Validation kontrolü
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Insights validation hatası:', errors.array());
    return res.status(400).json({
      success: false,
      error: true,
      message: 'Geçersiz parametreler',
      details: errors.array()
    });
  }

  const { reportId } = req.params;
  const { category } = req.query;

  console.log('💡 Insights istendi:', { reportId, category, ip: req.ip });

  try {
    // Get insights from AI service
    const aiResponse = await aiService.getInsights(reportId);
    
    console.log('🤖 AI insights yanıtı alındı:', {
      reportId,
      hasData: !!aiResponse,
      insightsCount: aiResponse.insights?.length || 0
    });

    // AI servisinden gelen gerçek insights verilerini işle
    let processedInsights = [];
    let summary = {};
    
    if (aiResponse.insights && Array.isArray(aiResponse.insights)) {
      processedInsights = aiResponse.insights.map((insight, index) => ({
        id: `insight-${index + 1}`,
        text: insight,
        category: 'general',
        importance: 'high',
        source: 'ai_analysis'
      }));
      
      summary = {
        totalInsights: processedInsights.length,
        categories: ['general'],
        generatedAt: new Date().toISOString()
      };
    }

    // Category filtreleme
    if (category && processedInsights.length > 0) {
      processedInsights = processedInsights.filter(insight => 
        insight.category === category
      );
    }

    // Send notification
    await notificationService.notifyAnalysisSuccess(reportId, 'Insights Analysis');

    // Success response - Verilen formata uygun yanıt
    const insightsData = aiResponse.insights || aiResponse;
    res.status(200).json({
      insights: insightsData
    });

  } catch (error) {
    console.error('❌ Insights hatası:', {
      reportId,
      error: error.message,
      stack: error.stack
    });

    // Send notification
    await notificationService.notifyAnalysisError(reportId, 'Insights Analysis', error.message);

    // AI servisi hatası
    if (error.message?.includes('AI servis')) {
      return res.status(503).json({
        success: false,
        error: true,
        message: 'AI servis şu anda kullanılamıyor',
        details: error.message,
        code: 'AI_SERVICE_ERROR'
      });
    }

    // Genel hata
    res.status(500).json({
      success: false,
      error: true,
      message: 'Key insights alınırken hata oluştu',
      details: error.message,
      code: 'INSIGHTS_ERROR'
    });
  }
});

/**
 * GET /api/insights/:reportId/categories
 * Mevcut insight kategorilerini listele
 */
router.get('/:reportId/categories', [
  param('reportId')
    .notEmpty()
    .withMessage('Report ID gerekli')
], async (req, res) => {
  const { reportId } = req.params;
  
  try {
    // Sabit kategoriler - gerçek implementasyonda AI'dan alınabilir
    const categories = [
      { id: 'general', name: 'Genel', count: 2 },
      { id: 'location', name: 'Lokasyon', count: 1 },
      { id: 'demographics', name: 'Demografi', count: 1 },
      { id: 'trends', name: 'Trendler', count: 1 }
    ];

    res.status(200).json({
      success: true,
      message: 'Kategoriler başarıyla alındı',
      data: {
        reportId,
        categories,
        total: categories.length
      }
    });

  } catch (error) {
    console.error('❌ Insight kategorileri hatası:', error);
    res.status(500).json({
      success: false,
      error: true,
      message: 'Kategoriler alınırken hata oluştu',
      details: error.message
    });
  }
});

export default router;
