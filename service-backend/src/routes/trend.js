import express from 'express';
import { param, query, validationResult } from 'express-validator';

import aiService from '../services/aiService.js';
import notificationService from '../services/notificationService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * GET /api/trend/:reportId
 * Get trend analysis for a report
 */
router.get('/:reportId', 
  [
    param('reportId')
      .notEmpty()
      .withMessage('Report ID gerekli')
      .isLength({ min: 1, max: 100 })
      .withMessage('Geçersiz Report ID formatı'),
    query('period')
      .optional()
      .isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'])
      .withMessage('Period değeri: daily, weekly, monthly, quarterly veya yearly olmalı'),
    query('metrics')
      .optional()
      .isString()
      .withMessage('Metrics string formatında olmalı')
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
    const { period = 'monthly', metrics } = req.query;

    console.log('📊 Trend analizi istendi:', { reportId, period, metrics, ip: req.ip });

    try {
      // Get trends from AI service
      const aiResponse = await aiService.getTrends(reportId);
      
      console.log('🤖 AI trend yanıtı alındı:', {
        reportId,
        hasData: !!aiResponse,
        dataPoints: aiResponse.trends?.length || 0
      });

      // AI servisinden gelen gerçek trend verilerini işle
      let trendData = [];
      let chartData = [];
      let summary = {};
      
      if (aiResponse.trend) {
        // Tarih-değer çiftlerini işle
        const sortedDates = Object.entries(aiResponse.trend)
          .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB));
        
        // Chart için veri hazırla
        chartData = sortedDates.map(([date, count]) => ({
          date: date,
          value: count,
          formattedDate: new Date(date).toLocaleDateString('tr-TR'),
          month: new Date(date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })
        }));
        
        // Aylık gruplama
        const monthlyData = {};
        sortedDates.forEach(([date, count]) => {
          const month = new Date(date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' });
          if (!monthlyData[month]) monthlyData[month] = 0;
          monthlyData[month] += count;
        });
        
        trendData = Object.entries(monthlyData).map(([month, total]) => ({
          period: month,
          value: total,
          formattedValue: total.toLocaleString('tr-TR')
        }));
        
        // Özet istatistikler
        const values = sortedDates.map(([, count]) => count);
        const total = values.reduce((sum, val) => sum + val, 0);
        const max = Math.max(...values);
        const min = Math.min(...values);
        const avg = total / values.length;
        
        // En yoğun tarih
        const peakDate = sortedDates.find(([, count]) => count === max);
        
        summary = {
          totalSubscriptions: total,
          peakDate: peakDate ? {
            date: peakDate[0],
            count: peakDate[1],
            formattedDate: new Date(peakDate[0]).toLocaleDateString('tr-TR')
          } : null,
          averageDaily: Math.round(avg),
          dateRange: {
            start: sortedDates[0]?.[0],
            end: sortedDates[sortedDates.length - 1]?.[0],
            totalDays: sortedDates.length
          }
        };
      }

      // Send notification
      await notificationService.notifyAnalysisSuccess(reportId, 'Trend Analysis');

      // Success response - Verilen formata uygun yanıt
      const responseTrendData = aiResponse.trend || aiResponse;
      res.status(200).json({
        trend: responseTrendData
      });

    } catch (error) {
      console.error('❌ Trend hatası:', {
        reportId,
        error: error.message,
        status: error.status
      });

      // Send notification
      await notificationService.notifyAnalysisError(reportId, 'Trend Analysis', error.message);

      // Handle different error types
      if (error.status === 404) {
        return res.status(404).json({
          success: false,
          error: true,
          message: 'Rapor bulunamadı',
          details: `Report ID: ${reportId} için trend verisi bulunamadı`
        });
      }

      if (error.status === 503) {
        return res.status(503).json({
          success: false,
          error: true,
          message: 'AI servisi şu anda kullanılamıyor',
          details: 'Trend analiz servisi geçici olarak devre dışı'
        });
      }

      // Generic error
      res.status(error.status || 500).json({
        success: false,
        error: true,
        message: 'Trend analizi alınamadı',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Servis hatası',
        reportId
      });
    }
  })
);

/**
 * POST /api/trend/forecast/:reportId
 * Generate forecast based on historical trends
 */
router.post('/forecast/:reportId',
  [
    param('reportId')
      .notEmpty()
      .withMessage('Report ID gerekli'),
    query('periods')
      .optional()
      .isInt({ min: 1, max: 24 })
      .withMessage('Periods 1-24 arasında olmalı')
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

    const { reportId } = req.params;
    const { periods = 6 } = req.query;
    const { metrics, options } = req.body;

    console.log('🔮 Trend tahmini istendi:', { reportId, periods, metrics });

    try {
      // Get current trends first
      const currentTrends = await aiService.getTrends(reportId);
      
      // Generate forecast (this would typically be a separate AI service endpoint)
      // For now, we'll use the current trends to simulate a forecast
      const forecast = {
        reportId,
        forecastPeriods: parseInt(periods),
        generatedAt: new Date().toISOString(),
        basedOnData: currentTrends.trends?.length || 0,
        predictions: [], // This would come from AI service
        confidence: 0.85, // Example confidence score
        methodology: 'AI-based trend analysis',
        assumptions: [
          'Historical patterns continue',
          'No major external disruptions',
          'Current market conditions persist'
        ]
      };

      res.status(200).json({
        success: true,
        message: 'Trend tahmini oluşturuldu',
        data: forecast
      });

    } catch (error) {
      console.error('❌ Forecast hatası:', error.message);

      res.status(error.status || 500).json({
        success: false,
        error: true,
        message: 'Trend tahmini oluşturulamadı',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Servis hatası',
        reportId
      });
    }
  })
);

/**
 * GET /api/trend/status
 * Check trend service status
 */
router.get('/status', asyncHandler(async (req, res) => {
  const aiHealth = await aiService.checkHealth();
  
  res.json({
    success: true,
    service: 'trend',
    status: 'running',
    aiService: aiHealth,
    capabilities: [
      'Historical trend analysis',
      'Pattern recognition',
      'Forecasting and predictions',
      'Seasonal analysis',
      'Multi-period support'
    ],
    supportedPeriods: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
    timestamp: new Date().toISOString()
  });
}));

export default router;
