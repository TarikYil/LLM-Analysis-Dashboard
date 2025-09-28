import express from 'express';
import { body, validationResult } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// In-memory settings storage (production'da database kullanılmalı)
let userSettings = {
  // General settings
  language: 'en',
  theme: 'light',
  autoSave: true,
  
  // Notification settings
  notifications: {
    enabled: true,
    sound: true,
    email: false,
    push: true,
  },
  
  // Performance settings
  performance: {
    autoRefresh: true,
    refreshInterval: 30, // seconds
    cacheSize: 100, // MB
    maxConcurrentRequests: 5,
  },
  
  // AI settings
  ai: {
    model: 'gemini-pro',
    temperature: 0.7,
    maxTokens: 2048,
    timeout: 30, // seconds
  },
  
  // Display settings
  display: {
    chartType: 'line',
    showGrid: true,
    showLegend: true,
    animationSpeed: 'medium',
  }
};

/**
 * GET /api/settings
 * Get user settings
 */
router.get('/', asyncHandler(async (req, res) => {
  try {
    console.log('📋 Settings requested');
    
    res.status(200).json({
      success: true,
      data: userSettings,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Settings get error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get settings',
      message: error.message
    });
  }
}));

/**
 * PUT /api/settings
 * Update user settings
 */
router.put('/', 
  [
    body('language').optional().isIn(['en', 'tr', 'es', 'fr']),
    body('theme').optional().isIn(['light', 'dark', 'auto']),
    body('autoSave').optional().isBoolean(),
    body('notifications.enabled').optional().isBoolean(),
    body('notifications.sound').optional().isBoolean(),
    body('notifications.email').optional().isBoolean(),
    body('notifications.push').optional().isBoolean(),
    body('performance.autoRefresh').optional().isBoolean(),
    body('performance.refreshInterval').optional().isInt({ min: 10, max: 300 }),
    body('performance.cacheSize').optional().isInt({ min: 50, max: 500 }),
    body('performance.maxConcurrentRequests').optional().isInt({ min: 1, max: 20 }),
    body('ai.model').optional().isIn(['gemini-pro', 'gemini-pro-vision', 'gpt-4', 'claude-3']),
    body('ai.temperature').optional().isFloat({ min: 0, max: 1 }),
    body('ai.maxTokens').optional().isInt({ min: 100, max: 4096 }),
    body('ai.timeout').optional().isInt({ min: 10, max: 120 }),
    body('display.chartType').optional().isIn(['line', 'bar', 'pie', 'area']),
    body('display.showGrid').optional().isBoolean(),
    body('display.showLegend').optional().isBoolean(),
    body('display.animationSpeed').optional().isIn(['slow', 'medium', 'fast']),
  ],
  asyncHandler(async (req, res) => {
    try {
      // Validation check
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid settings data',
          details: errors.array()
        });
      }

      const newSettings = req.body;
      console.log('📋 Settings update requested:', newSettings);

      // Deep merge settings
      const mergeSettings = (target, source) => {
        for (const key in source) {
          if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            if (!target[key]) target[key] = {};
            mergeSettings(target[key], source[key]);
          } else {
            target[key] = source[key];
          }
        }
      };

      mergeSettings(userSettings, newSettings);

      console.log('✅ Settings updated successfully');

      res.status(200).json({
        success: true,
        data: userSettings,
        message: 'Settings updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Settings update error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update settings',
        message: error.message
      });
    }
  })
);

/**
 * POST /api/settings/reset
 * Reset settings to default
 */
router.post('/reset', asyncHandler(async (req, res) => {
  try {
    console.log('🔄 Settings reset requested');

    // Reset to default settings
    userSettings = {
      language: 'en',
      theme: 'light',
      autoSave: true,
      notifications: {
        enabled: true,
        sound: true,
        email: false,
        push: true,
      },
      performance: {
        autoRefresh: true,
        refreshInterval: 30,
        cacheSize: 100,
        maxConcurrentRequests: 5,
      },
      ai: {
        model: 'gemini-pro',
        temperature: 0.7,
        maxTokens: 2048,
        timeout: 30,
      },
      display: {
        chartType: 'line',
        showGrid: true,
        showLegend: true,
        animationSpeed: 'medium',
      }
    };

    console.log('✅ Settings reset successfully');

    res.status(200).json({
      success: true,
      data: userSettings,
      message: 'Settings reset to default',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Settings reset error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset settings',
      message: error.message
    });
  }
}));

/**
 * GET /api/settings/export
 * Export settings as JSON
 */
router.get('/export', asyncHandler(async (req, res) => {
  try {
    console.log('📤 Settings export requested');

    const settingsJson = JSON.stringify(userSettings, null, 2);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="settings.json"');
    res.status(200).send(settingsJson);
  } catch (error) {
    console.error('❌ Settings export error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export settings',
      message: error.message
    });
  }
}));

/**
 * POST /api/settings/import
 * Import settings from JSON
 */
router.post('/import', 
  [
    body('settings').isObject().withMessage('Settings must be a valid object'),
  ],
  asyncHandler(async (req, res) => {
    try {
      // Validation check
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid settings data',
          details: errors.array()
        });
      }

      const importedSettings = req.body.settings;
      console.log('📥 Settings import requested');

      // Validate imported settings structure
      const requiredKeys = ['language', 'theme', 'notifications', 'performance', 'ai', 'display'];
      const hasRequiredKeys = requiredKeys.every(key => key in importedSettings);
      
      if (!hasRequiredKeys) {
        return res.status(400).json({
          success: false,
          error: 'Invalid settings structure',
          message: 'Settings must contain all required sections'
        });
      }

      userSettings = importedSettings;

      console.log('✅ Settings imported successfully');

      res.status(200).json({
        success: true,
        data: userSettings,
        message: 'Settings imported successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Settings import error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to import settings',
        message: error.message
      });
    }
  })
);

/**
 * GET /api/settings/status
 * Check settings service status
 */
router.get('/status', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    service: 'settings',
    status: 'running',
    capabilities: [
      'User preferences management',
      'Settings validation',
      'Import/Export functionality',
      'Reset to defaults'
    ],
    timestamp: new Date().toISOString()
  });
}));

export default router;
