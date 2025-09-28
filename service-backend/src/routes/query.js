import express from 'express';
import { body, validationResult } from 'express-validator';

import aiService from '../services/aiService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * POST /api/query
 * Natural language query interface for reports
 */
router.post('/', 
  [
    body('query')
      .notEmpty()
      .withMessage('Query gerekli')
      .isLength({ min: 3, max: 1000 })
      .withMessage('Query 3-1000 karakter arasında olmalı'),
    body('report_id')
      .optional()
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

    const { query, report_id } = req.body;
    const { context, language = 'tr' } = req.body; // Additional optional parameters

    console.log('🤔 Doğal dil sorgusu:', { 
      query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
      report_id, 
      language,
      ip: req.ip 
    });

    try {
      // Send query to AI service
      const aiResponse = await aiService.queryReport(query, report_id);
      
      console.log('🤖 AI query yanıtı alındı:', {
        hasAnswer: !!aiResponse.answer,
        hasData: !!aiResponse.data,
        responseType: aiResponse.type || 'text'
      });

      // Process and format the response
      const formattedResponse = {
        query: query,
        reportId: report_id,
        language: language,
        answeredAt: new Date().toISOString(),
        answer: aiResponse.answer || aiResponse.response || aiResponse,
        confidence: aiResponse.confidence || 0.9,
        responseType: aiResponse.type || 'text',
        data: aiResponse.data || null,
        visualizations: aiResponse.visualizations || [],
        relatedQuestions: aiResponse.relatedQuestions || [],
        sources: aiResponse.sources || [],
        processingTime: aiResponse.processingTime || null
      };

      // Add context if available
      if (context) {
        formattedResponse.context = context;
      }

      // Success response
      res.status(200).json({
        success: true,
        message: 'Sorgu başarıyla işlendi',
        data: formattedResponse
      });

    } catch (error) {
      console.error('❌ Query hatası:', {
        query: query.substring(0, 50) + '...',
        report_id,
        error: error.message,
        status: error.status
      });

      // Handle different error types
      if (error.status === 404) {
        return res.status(404).json({
          success: false,
          error: true,
          message: 'Rapor bulunamadı',
          details: report_id ? `Report ID: ${report_id} bulunamadı` : 'Geçerli bir rapor belirtilmedi'
        });
      }

      if (error.status === 400) {
        return res.status(400).json({
          success: false,
          error: true,
          message: 'Sorgu anlaşılamadı',
          details: 'Lütfen sorunuzu daha açık bir şekilde ifade edin'
        });
      }

      if (error.status === 503) {
        return res.status(503).json({
          success: false,
          error: true,
          message: 'AI servisi şu anda kullanılamıyor',
          details: 'Sorgu işleme servisi geçici olarak devre dışı'
        });
      }

      // Generic error
      res.status(error.status || 500).json({
        success: false,
        error: true,
        message: 'Sorgu işlenemedi',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Servis hatası',
        query: query.substring(0, 50) + '...'
      });
    }
  })
);

/**
 * POST /api/query/batch
 * Process multiple queries at once
 */
router.post('/batch',
  [
    body('queries')
      .isArray({ min: 1, max: 10 })
      .withMessage('1-10 arası sorgu gönderilebilir'),
    body('queries.*.query')
      .notEmpty()
      .withMessage('Her sorgu için query gerekli')
      .isLength({ min: 3, max: 1000 })
      .withMessage('Her query 3-1000 karakter arasında olmalı')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: true,
        message: 'Geçersiz parametreler',
        details: errors.array()
      });
    }

    const { queries, report_id } = req.body;

    console.log('📦 Toplu sorgu istendi:', { 
      queryCount: queries.length,
      report_id 
    });

    try {
      // Process all queries
      const queryPromises = queries.map(async (queryItem, index) => {
        try {
          const result = await aiService.queryReport(
            queryItem.query, 
            queryItem.report_id || report_id
          );
          return {
            index,
            query: queryItem.query,
            success: true,
            answer: result.answer || result.response || result,
            confidence: result.confidence,
            processingTime: result.processingTime
          };
        } catch (error) {
          return {
            index,
            query: queryItem.query,
            success: false,
            error: error.message
          };
        }
      });

      const results = await Promise.all(queryPromises);

      const response = {
        totalQueries: queries.length,
        successfulQueries: results.filter(r => r.success).length,
        failedQueries: results.filter(r => !r.success).length,
        processedAt: new Date().toISOString(),
        results
      };

      res.status(200).json({
        success: true,
        message: 'Toplu sorgu işlendi',
        data: response
      });

    } catch (error) {
      console.error('❌ Batch query hatası:', error.message);

      res.status(500).json({
        success: false,
        error: true,
        message: 'Toplu sorgu işlenemedi',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Servis hatası'
      });
    }
  })
);

/**
 * GET /api/query/suggestions
 * Get query suggestions for better user experience
 */
router.get('/suggestions', asyncHandler(async (req, res) => {
  const { report_id, category } = req.query;

  // Predefined suggestions based on category
  const suggestions = {
    general: [
      "Bu rapordaki ana bulgular neler?",
      "En önemli KPI'lar hangileri?",
      "Genel performans nasıl?",
      "Öne çıkan trendler neler?"
    ],
    financial: [
      "Gelir trendleri nasıl?",
      "Maliyet analizi nedir?",
      "Karlılık oranları nedir?",
      "Bütçe performansı nasıl?"
    ],
    marketing: [
      "Müşteri segmentasyonu nasıl?",
      "Kampanya performansları nedir?",
      "Dönüşüm oranları nasıl?",
      "Müşteri memnuniyeti nedir?"
    ],
    operational: [
      "Operasyonel verimlilik nasıl?",
      "Süreç performansları nedir?",
      "Kalite metrikleri neler?",
      "Zaman analizi nedir?"
    ]
  };

  const selectedSuggestions = category ? 
    suggestions[category] || suggestions.general : 
    suggestions.general;

  res.json({
    success: true,
    message: 'Sorgu önerileri',
    data: {
      category: category || 'general',
      reportId: report_id,
      suggestions: selectedSuggestions,
      availableCategories: Object.keys(suggestions)
    }
  });
}));

/**
 * GET /api/query/status
 * Check query service status
 */
router.get('/status', asyncHandler(async (req, res) => {
  const aiHealth = await aiService.checkHealth();
  
  res.json({
    success: true,
    service: 'query',
    status: 'running',
    aiService: aiHealth,
    capabilities: [
      'Natural language processing',
      'Context-aware responses',
      'Multi-language support',
      'Batch query processing',
      'Query suggestions'
    ],
    supportedLanguages: ['tr', 'en'],
    limits: {
      maxQueryLength: 1000,
      maxBatchSize: 10,
      rateLimitPerMinute: 60
    },
    timestamp: new Date().toISOString()
  });
}));

export default router;
