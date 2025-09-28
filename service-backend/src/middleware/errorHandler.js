/**
 * Global Error Handler Middleware
 * API Gateway için merkezi hata yönetimi
 */

export const errorHandler = (err, req, res, next) => {
  // Log the error
  console.error('❌ Hata:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Default error response
  let error = {
    success: false,
    error: true,
    message: 'Sunucu hatası oluştu',
    timestamp: new Date().toISOString()
  };

  let statusCode = 500;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    error.message = 'Geçersiz veri formatı';
    error.details = err.message;
  } else if (err.name === 'MulterError') {
    statusCode = 400;
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        error.message = 'Dosya boyutu çok büyük';
        error.details = `Maksimum dosya boyutu: ${(process.env.MAX_FILE_SIZE || 52428800) / 1024 / 1024}MB`;
        break;
      case 'LIMIT_FILE_COUNT':
        error.message = 'Çok fazla dosya';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        error.message = 'Beklenmeyen dosya alanı';
        break;
      default:
        error.message = 'Dosya yükleme hatası';
        error.details = err.message;
    }
  } else if (err.code === 'ECONNREFUSED') {
    statusCode = 503;
    error.message = 'AI servisi şu anda kullanılamıyor';
    error.details = 'Lütfen daha sonra tekrar deneyin';
  } else if (err.code === 'ENOTFOUND') {
    statusCode = 503;
    error.message = 'AI servisi bulunamadı';
    error.details = 'Servis yapılandırması kontrol ediliyor';
  } else if (err.response) {
    // Axios error from AI service
    statusCode = err.response.status || 500;
    error.message = err.response.data?.message || 'AI servisi hatası';
    error.details = err.response.data?.details || err.message;
  } else if (err.request) {
    // Network error
    statusCode = 503;
    error.message = 'AI servisi ile bağlantı kurulamadı';
    error.details = 'Ağ bağlantısını kontrol edin';
  } else if (err.status) {
    statusCode = err.status;
    error.message = err.message || 'İstek hatası';
  }

  // Add request ID for debugging
  if (req.headers['x-request-id']) {
    error.requestId = req.headers['x-request-id'];
  }

  // Don't expose sensitive information in production
  if (process.env.NODE_ENV === 'production') {
    delete error.stack;
    if (statusCode >= 500) {
      error.message = 'Sunucu hatası oluştu';
      delete error.details;
    }
  } else {
    // Include stack trace in development
    error.stack = err.stack;
  }

  res.status(statusCode).json(error);
};

/**
 * Async error wrapper
 * Express route'larında async/await kullanımı için
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Not found handler
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Endpoint bulunamadı - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

export default { errorHandler, asyncHandler, notFound };
