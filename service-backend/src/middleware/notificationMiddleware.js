import notificationService from '../services/notificationService.js';

// Cooldown tracking
let lastMemoryWarning = 0;
let lastPerformanceWarning = new Map();
let lastErrorNotification = new Map();

/**
 * Performans izleme middleware'i
 * Yanıt süresini ölçer ve yavaş istekler için bildirim gönderir
 */
export const performanceMonitor = (req, res, next) => {
  const startTime = Date.now();
  
  // Response'u intercept et
  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - startTime;
    
    // Yavaş istekler için bildirim gönder (2 saniyeden uzun)
    if (responseTime > 2000) {
      const service = req.route?.path || req.path;
      const now = Date.now();
      const lastWarning = lastPerformanceWarning.get(service) || 0;
      
      // 5 dakikada bir uyar (300000ms)
      if (now - lastWarning > 300000) {
        notificationService.notifyPerformanceWarning(service, responseTime);
        lastPerformanceWarning.set(service, now);
      }
    }
    
    // Orijinal send metodunu çağır
    originalSend.call(this, data);
  };
  
  next();
};

/**
 * Sistem durumu kontrolü middleware'i
 */
export const systemHealthCheck = async (req, res, next) => {
  try {
    // Sistem kaynaklarını kontrol et
    const memoryUsage = process.memoryUsage();
    const now = Date.now();
    
    // Memory kullanımı %80'den fazlaysa uyar
    const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    if (memoryUsagePercent > 80) {
      // 10 dakikada bir uyar (600000ms)
      if (now - lastMemoryWarning > 600000) {
        await notificationService.notifySystemStatus(
          'warning',
          `High memory usage: %${memoryUsagePercent.toFixed(2)}`
        );
        lastMemoryWarning = now;
      }
    }
    
    next();
  } catch (error) {
    console.error('Sistem sağlık kontrolü hatası:', error);
    next();
  }
};

/**
 * Hata yakalama middleware'i
 */
export const errorNotification = (error, req, res, next) => {
  // Kritik hatalar için bildirim gönder
  if (error.status >= 500) {
    const now = Date.now();
    const errorKey = `${req.path}:${error.message}`;
    const lastError = lastErrorNotification.get(errorKey) || 0;
    
    // Aynı hata için 5 dakikada bir uyar
    if (now - lastError > 300000) {
      notificationService.notifySystemStatus(
        'error',
        `Server error: ${error.message} - ${req.path}`
      );
      lastErrorNotification.set(errorKey, now);
    }
  }
  
  next(error);
};
