import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { performanceMonitor, systemHealthCheck, errorNotification } from './middleware/notificationMiddleware.js';

// Import routes
import uploadRoutes from './routes/upload.js';
import summaryRoutes from './routes/summary.js';
import kpiRoutes from './routes/kpi.js';
import trendRoutes from './routes/trend.js';
import queryRoutes from './routes/query.js';
import insightsRoutes from './routes/insights.js';
import actionsRoutes from './routes/actions.js';
import embeddingRoutes from './routes/embedding.js';
import embeddingStatusRoutes from './routes/embedding-status.js';
import chatRoutes from './routes/chat.js';
import notificationRoutes from './routes/notifications.js';
import settingsRoutes from './routes/settings.js';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust proxy (for deployment behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Allow file uploads
}));

// Rate limiting - Development için daha yüksek limit
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // Development için 1000 istek
  message: {
    error: 'Çok fazla istek gönderildi, lütfen daha sonra tekrar deneyin.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
// Rate limiting'i sadece belirli endpoint'lerde uygula
app.use('/api/upload', limiter);
app.use('/api/query', limiter);
// Status endpoint'ini rate limiting'den muaf tut

// CORS configuration - Development için tüm origin'lere izin ver
const corsOptions = {
  origin: true, // Development için tüm origin'lere izin ver
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id']
};
app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Notification middleware
app.use(performanceMonitor);
app.use(systemHealthCheck);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`📁 Upload dizini oluşturuldu: ${uploadDir}`);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Backend API Gateway çalışıyor',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes with /api prefix
app.use('/api/upload', uploadRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/kpi', kpiRoutes);
app.use('/api/trend', trendRoutes);
app.use('/api/query', queryRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/actions', actionsRoutes);
app.use('/api/embedding', embeddingRoutes);
app.use('/api/embedding-status', embeddingStatusRoutes);
app.use('/api/status', embeddingStatusRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);

// Also add routes without /api prefix for compatibility
app.use('/upload', uploadRoutes);
app.use('/summary', summaryRoutes);
app.use('/kpi', kpiRoutes);
app.use('/trend', trendRoutes);
app.use('/query', queryRoutes);
app.use('/insights', insightsRoutes);
app.use('/actions', actionsRoutes);
app.use('/embedding', embeddingRoutes);
app.use('/embedding-status', embeddingStatusRoutes);
app.use('/status', embeddingStatusRoutes);
app.use('/chat', chatRoutes);
app.use('/notifications', notificationRoutes);
app.use('/settings', settingsRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'AI Reporting Agent Backend API Gateway',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      upload: '/analyze/upload',
      summary: '/analyze/summary/:reportId',
      kpi: '/analyze/kpi/:reportId',
      trend: '/analyze/trend/:reportId',
      query: '/analyze/query',
      chat: '/api/chat',
      settings: '/api/settings'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint bulunamadı',
    message: `${req.method} ${req.originalUrl} endpoint'i mevcut değil`,
    availableEndpoints: [
      'GET /health',
      'POST /analyze/upload',
      'GET /analyze/summary/:reportId',
      'GET /analyze/kpi/:reportId',
      'GET /analyze/trend/:reportId',
      'POST /analyze/query',
      'POST /api/chat',
      'GET /api/settings',
      'PUT /api/settings',
      'POST /api/settings/reset'
    ]
  });
});

// Error handling middleware (must be last)
app.use(errorNotification);
app.use(errorHandler);

export default app;
