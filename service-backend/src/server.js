import dotenv from 'dotenv';
import app from './app.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 8000;

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend API Gateway sunucusu ${PORT} portunda çalışıyor`);
  console.log(`📊 Çevre: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 AI Servis URL: ${process.env.AI_SERVICE_URL || 'http://localhost:5000'}`);
  console.log(`📁 Upload Dizini: ${process.env.UPLOAD_DIR || 'uploads'}`);
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`🌐 Frontend URL'leri: ${process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173'}`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM sinyali alındı, sunucu kapatılıyor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT sinyali alındı, sunucu kapatılıyor...');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Yakalanmamış hata:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ İşlenmeyen promise reddi:', reason);
  process.exit(1);
});
