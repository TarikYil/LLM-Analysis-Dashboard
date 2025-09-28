import express from 'express';
import { param, query, validationResult } from 'express-validator';

import aiService from '../services/aiService.js';
import notificationService from '../services/notificationService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * GET /api/kpi/:reportId
 * Get KPI analysis for a report
 */
router.get('/:reportId', 
  [
    param('reportId')
      .notEmpty()
      .withMessage('Report ID gerekli')
      .isLength({ min: 1, max: 100 })
      .withMessage('Geçersiz Report ID formatı'),
    query('format')
      .optional()
      .isIn(['detailed', 'summary', 'chart'])
      .withMessage('Format değeri: detailed, summary veya chart olmalı')
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
    const { format = 'detailed' } = req.query;

    console.log('📈 KPI analizi istendi:', { reportId, format, ip: req.ip });

    try {
      // Get KPIs from AI service
      const aiResponse = await aiService.getKPIs(reportId);
      
      console.log('🤖 AI KPI yanıtı alındı:', {
        reportId,
        hasData: !!aiResponse,
        kpiCount: aiResponse.kpis?.length || 0
      });

      // Verilen API formatına göre direkt yanıt döndür
      const kpiData = aiResponse.kpi || aiResponse;
      
      // Format data based on request format
      let formattedData = {};
      
      if (format === 'summary') {
        formattedData = {
          kpi: {
            total_subscribers: kpiData.total_subscribers || 0,
            top_counties: Object.entries(kpiData.county_distribution || {})
              .sort(([,a], [,b]) => b - a)
              .slice(0, 3)
              .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {})
          }
        };
      } else if (format === 'chart') {
        formattedData = {
          kpi: kpiData,
          charts: {
            county_distribution: kpiData.county_distribution || {},
            domestic_foreign_distribution: kpiData.domestic_foreign_distribution || {}
          }
        };
      } else {
        // detailed format (default) - Tam API formatını döndür
        formattedData = {
          kpi: {
            total_subscribers: kpiData.total_subscribers || 0,
            county_distribution: kpiData.county_distribution || {},
            domestic_foreign_distribution: kpiData.domestic_foreign_distribution || {}
          }
        };
      }

      // Send notification
      await notificationService.notifyAnalysisSuccess(reportId, 'KPI Analysis');

      // Success response - Verilen formata uygun yanıt
      res.status(200).json(formattedData);

    } catch (error) {
      console.error('❌ KPI hatası:', {
        reportId,
        error: error.message,
        status: error.status
      });

      // Send notification
      await notificationService.notifyAnalysisError(reportId, 'KPI Analysis', error.message);

      // Handle different error types
      if (error.status === 404) {
        return res.status(404).json({
          success: false,
          error: true,
          message: 'Rapor bulunamadı',
          details: `Report ID: ${reportId} için KPI verisi bulunamadı`
        });
      }

      if (error.status === 503) {
        return res.status(503).json({
          success: false,
          error: true,
          message: 'AI servisi şu anda kullanılamıyor',
          details: 'KPI analiz servisi geçici olarak devre dışı'
        });
      }

      // Generic error
      res.status(error.status || 500).json({
        success: false,
        error: true,
        message: 'KPI analizi alınamadı',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Servis hatası',
        reportId
      });
    }
  })
);

/**
 * POST /api/kpi/compare
 * Compare KPIs between multiple reports
 */
router.post('/compare',
  asyncHandler(async (req, res) => {
    const { reportIds, metrics } = req.body;

    if (!reportIds || !Array.isArray(reportIds) || reportIds.length < 2) {
      return res.status(400).json({
        success: false,
        error: true,
        message: 'En az 2 rapor ID gerekli',
        details: 'reportIds array formatında olmalı'
      });
    }

    console.log('🔄 KPI karşılaştırması istendi:', { reportIds, metrics });

    try {
      // Get KPIs for all reports
      const kpiPromises = reportIds.map(id => aiService.getKPIs(id));
      const allKPIs = await Promise.all(kpiPromises);

      // Process comparison data
      const comparison = {
        reportIds,
        comparedAt: new Date().toISOString(),
        reports: allKPIs.map((kpiData, index) => ({
          reportId: reportIds[index],
          kpis: kpiData.kpis || [],
          summary: kpiData.summary
        })),
        commonMetrics: [],
        insights: []
      };

      // Find common metrics across reports
      if (allKPIs.length > 0 && allKPIs[0].kpis) {
        const firstReportMetrics = allKPIs[0].kpis.map(kpi => kpi.name);
        comparison.commonMetrics = firstReportMetrics.filter(metric =>
          allKPIs.every(reportKPIs => 
            reportKPIs.kpis && reportKPIs.kpis.some(kpi => kpi.name === metric)
          )
        );
      }

      res.status(200).json({
        success: true,
        message: 'KPI karşılaştırması tamamlandı',
        data: comparison
      });

    } catch (error) {
      console.error('❌ KPI karşılaştırma hatası:', error.message);

      res.status(error.status || 500).json({
        success: false,
        error: true,
        message: 'KPI karşılaştırması başarısız',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Servis hatası'
      });
    }
  })
);

/**
 * GET /api/kpi/status
 * Check KPI service status
 */
router.get('/status', asyncHandler(async (req, res) => {
  const aiHealth = await aiService.checkHealth();
  
  res.json({
    success: true,
    service: 'kpi',
    status: 'running',
    aiService: aiHealth,
    capabilities: [
      'KPI extraction and analysis',
      'Performance metrics calculation',
      'Trend analysis',
      'Multi-report comparison',
      'Custom formatting (detailed, summary, chart)'
    ],
    supportedFormats: ['detailed', 'summary', 'chart'],
    timestamp: new Date().toISOString()
  });
}));

export default router;
