import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';

import aiService from '../services/aiService.js';
import notificationService from '../services/notificationService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const uploadDir = path.join(__dirname, '../../', process.env.UPLOAD_DIR || 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with original extension
    const uniqueName = `${uuidv4()}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'pdf,csv,xlsx,xls').split(',');
  const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);
  
  const allowedMimeTypes = {
    pdf: 'application/pdf',
    csv: 'text/csv',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xls: 'application/vnd.ms-excel'
  };

  if (allowedTypes.includes(fileExtension) || 
      Object.values(allowedMimeTypes).includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Desteklenmeyen dosya türü. İzin verilen türler: ${allowedTypes.join(', ')}`), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 52428800, // 50MB default
    files: 1 // Single file upload
  },
  fileFilter: fileFilter
});

/**
 * POST /api/upload
 * Upload a report file and process it with AI service
 */
router.post('/', 
  upload.single('file'),
  asyncHandler(async (req, res) => {
    try {
      // Validate file upload
      if (!req.file) {
        // Send notification
        await notificationService.notifyFileUploadError(
          'Unknown file', 
          'No file selected'
        );

        return res.status(400).json({
          success: false,
          error: true,
          message: 'Dosya yüklenemedi',
          details: 'Lütfen geçerli bir dosya seçin'
        });
      }

      const file = req.file;
      
      // File metadata
      const metadata = {
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        uploadedAt: new Date().toISOString(),
        uploadedBy: req.ip, // In a real app, this would be user ID
      };

      console.log('📁 Dosya yüklendi:', {
        filename: file.filename,
        originalname: file.originalname,
        size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        path: file.path
      });

      // Send file to AI service
      let aiResponse;
      try {
        aiResponse = await aiService.uploadFile(file.path, metadata);
        console.log('🤖 AI servis yanıtı alındı:', aiResponse);
      } catch (aiError) {
        console.error('❌ AI servis hatası:', aiError.message);
        
        // Clean up uploaded file on AI service error
        try {
          fs.unlinkSync(file.path);
        } catch (unlinkError) {
          console.error('❌ Dosya silinirken hata:', unlinkError.message);
        }

        // Send notification
        await notificationService.notifyFileUploadError(
          file.originalname, 
          aiError.message
        );

        // Return error but don't expose AI service details to client
        return res.status(503).json({
          success: false,
          error: true,
          message: 'Dosya işlenirken hata oluştu',
          details: 'AI servisi şu anda kullanılamıyor, lütfen daha sonra tekrar deneyin',
          uploadInfo: {
            filename: file.originalname,
            size: file.size,
            type: file.mimetype
          }
        });
      }

      // Success response
      const reportId = aiResponse.reportId || aiResponse.id;
      
      // Send notification
      await notificationService.notifyFileUploadSuccess(
        file.originalname, 
        reportId, 
        file.size
      );

      res.status(200).json({
        success: true,
        message: 'Dosya başarıyla yüklendi ve işlendi',
        data: {
          reportId,
          filename: file.originalname,
          size: file.size,
          type: file.mimetype,
          uploadedAt: metadata.uploadedAt,
          processingStatus: aiResponse.status || 'processed',
          ...aiResponse // Include AI service response data
        }
      });

      // Clean up local file after successful processing (optional)
      // Uncomment if you don't want to keep files locally
      /*
      setTimeout(() => {
        try {
          fs.unlinkSync(file.path);
          console.log('🗑️ Yerel dosya silindi:', file.filename);
        } catch (error) {
          console.error('❌ Dosya silinirken hata:', error.message);
        }
      }, 5000); // Delete after 5 seconds
      */

    } catch (error) {
      console.error('❌ Upload route hatası:', error);
      
      // Clean up uploaded file on error
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error('❌ Dosya silinirken hata:', unlinkError.message);
        }
      }

      res.status(500).json({
        success: false,
        error: true,
        message: 'Dosya yükleme işlemi başarısız',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Sunucu hatası'
      });
    }
  })
);

/**
 * GET /api/upload/status
 * Check upload service status
 */
router.get('/status', asyncHandler(async (req, res) => {
  const aiHealth = await aiService.checkHealth();
  const serviceInfo = aiService.getServiceInfo();
  
  res.json({
    success: true,
    service: 'upload',
    status: 'running',
    aiService: aiHealth,
    configuration: {
      maxFileSize: `${(parseInt(process.env.MAX_FILE_SIZE) || 52428800) / 1024 / 1024}MB`,
      allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'pdf,csv,xlsx,xls').split(','),
      uploadDir: process.env.UPLOAD_DIR || 'uploads'
    },
    aiServiceInfo: {
      url: serviceInfo.baseURL,
      timeout: `${serviceInfo.timeout / 1000}s`,
      authenticated: serviceInfo.hasApiKey
    },
    timestamp: new Date().toISOString()
  });
}));

export default router;
