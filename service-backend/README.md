# AI Reporting Agent - Backend API Gateway

Node.js Backend servisi, React UI'nin yaptığı tüm istekleri alıp AI Service'e yönlendiren, güvenliği sağlayan, veri akışını düzenleyen ve gelecekte ek fonksiyonlara olanak tanıyan bir API Gateway'dir.

## 🚀 Özellikler

- **API Gateway**: Frontend ve AI servisi arasında güvenli köprü
- **Dosya Yükleme**: PDF, CSV, Excel dosyalarını destekler
- **AI Entegrasyonu**: Özet, KPI, trend analizi ve doğal dil sorguları
- **Güvenlik**: Rate limiting, CORS, helmet ile korunmuş
- **Error Handling**: Kapsamlı hata yönetimi ve logging
- **Docker Desteği**: Kolay deployment için containerized
- **Sağlık Kontrolü**: Health check endpoint'leri

## 📁 Proje Yapısı

```
service-backend/
├─ src/
│   ├─ routes/
│   │   ├─ upload.js      # Dosya yükleme endpoint'i
│   │   ├─ summary.js     # AI özet servisi
│   │   ├─ kpi.js         # KPI analiz servisi
│   │   ├─ trend.js       # Trend analiz servisi
│   │   └─ query.js       # Doğal dil sorgu servisi
│   ├─ middleware/
│   │   └─ errorHandler.js # Hata yönetimi middleware'i
│   ├─ services/
│   │   └─ aiService.js   # AI servis client'ı
│   ├─ app.js             # Express uygulaması
│   └─ server.js          # Sunucu başlatma
├─ package.json
├─ Dockerfile
├─ .env                   # Çevre değişkenleri
└─ README.md
```

## 🛠️ Kurulum

### Gereksinimler
- Node.js 18+
- npm veya yarn
- AI Service (ayrı bir servis olarak çalışmalı)

### Adım 1: Bağımlılıkları Yükle
```bash
cd service-backend
npm install
```

### Adım 2: Çevre Değişkenlerini Ayarla
`.env` dosyasını düzenleyin:

```env
# Server Configuration
PORT=8000
NODE_ENV=development

# AI Service Configuration
AI_SERVICE_URL=http://localhost:5000
AI_SERVICE_API_KEY=your-ai-service-api-key-here

# File Upload Configuration
MAX_FILE_SIZE=52428800
UPLOAD_DIR=uploads
ALLOWED_FILE_TYPES=pdf,csv,xlsx,xls

# Security Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Adım 3: Servisi Başlat

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

## 🐳 Docker ile Çalıştırma

### Docker Image Oluştur
```bash
docker build -t ai-reporting-backend .
```

### Container Çalıştır
```bash
docker run -p 8000:8000 \
  -e AI_SERVICE_URL=http://ai-service:5000 \
  -e NODE_ENV=production \
  -v $(pwd)/uploads:/app/uploads \
  ai-reporting-backend
```

### Docker Compose ile
```yaml
version: '3.8'
services:
  backend:
    build: ./service-backend
    ports:
      - "8000:8000"
    environment:
      - AI_SERVICE_URL=http://ai-service:5000
      - NODE_ENV=production
    volumes:
      - ./uploads:/app/uploads
    depends_on:
      - ai-service
```

## 📚 API Endpoints

### Health Check
```
GET /health
GET /api/{service}/status
```

### Dosya Yükleme
```
POST /api/upload
Content-Type: multipart/form-data
Body: file (PDF/CSV/Excel)
```

### AI Servisleri
```
GET  /api/summary/:reportId     # Rapor özeti
GET  /api/kpi/:reportId         # KPI analizi
GET  /api/trend/:reportId       # Trend analizi
POST /api/query                 # Doğal dil sorgusu
```

### Örnek Kullanım

#### Dosya Yükleme
```javascript
const formData = new FormData();
formData.append('file', file);

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});
```

#### Doğal Dil Sorgusu
```javascript
const response = await fetch('/api/query', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    query: "Bu rapordaki ana bulgular neler?",
    report_id: "12345"
  })
});
```

## 🔒 Güvenlik

- **Rate Limiting**: IP başına dakikada maksimum istek sayısı
- **CORS**: Sadece izin verilen origin'lerden istekler
- **Helmet**: HTTP security headers
- **File Validation**: Sadece izin verilen dosya türleri
- **Input Validation**: Express-validator ile giriş doğrulama

## 📊 Monitoring

### Health Check Endpoint'leri
```bash
curl http://localhost:8000/health
curl http://localhost:8000/api/upload/status
curl http://localhost:8000/api/query/status
```

### Logging
- Morgan ile HTTP request logging
- Detaylı error logging
- AI service interaction logging

## 🚨 Hata Yönetimi

Tüm hatalar merkezi olarak yönetilir ve şu bilgileri içerir:
- HTTP status codes
- Kullanıcı dostu hata mesajları
- Development mode'da detaylı hata bilgileri
- Request tracking için unique ID'ler

## 🔄 Frontend Entegrasyonu

Frontend'de API base URL'ini backend'e yönlendirin:

```javascript
// service-frontend/src/services/api.js
const API_BASE_URL = 'http://localhost:8000/api';
```

Veya environment variable ile:
```env
VITE_API_URL=http://localhost:8000/api
VITE_USE_MOCK_API=false
```

## 🧪 Test

```bash
# Unit testler (henüz eklenmedi)
npm test

# API endpoint'lerini test et
curl -X GET http://localhost:8000/health
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Test sorgusu"}'
```

## 📝 Geliştirme Notları

1. **AI Service Bağlantısı**: AI servisi hazır olmadığında graceful degradation
2. **File Storage**: Yüklenen dosyalar geçici olarak saklanır
3. **Scalability**: Horizontal scaling için stateless design
4. **Caching**: Gelecekte Redis cache eklenebilir
5. **Authentication**: İhtiyaç halinde JWT auth eklenebilir

## 🤝 Katkıda Bulunma

1. Fork the project
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.
