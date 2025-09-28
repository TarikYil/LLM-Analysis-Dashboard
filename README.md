# 🤖 AI Reporting Agent Dashboard

Modern, AI destekli raporlama ve analiz platformu. React frontend ve Node.js API Gateway ile oluşturulmuş, AI servislerine entegre edilebilen kapsamlı bir çözüm.

## 🎯 Proje Özeti

Bu proje, kullanıcıların raporlarını (PDF, CSV, Excel) yükleyerek AI destekli analizler alabilecekleri bir dashboard uygulamasıdır. Backend API Gateway, frontend ve AI servisi arasında güvenli bir köprü görevi görür.

## 🏗️ Mimari

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │  Backend API    │    │   AI Service    │
│   (React)       │◄──►│   Gateway       │◄──►│   (Python)      │
│   Port: 3000    │    │   (Node.js)     │    │   Port: 5000    │
└─────────────────┘    │   Port: 8000    │    └─────────────────┘
                       └─────────────────┘
```

## 📁 Proje Yapısı

```
llm-analysis-dashboard/
├── service-frontend/          # React Frontend
│   ├── src/
│   │   ├── components/       # UI Bileşenleri
│   │   ├── pages/           # Sayfa bileşenleri
│   │   ├── services/        # API servisleri
│   │   ├── store/           # Zustand state management
│   │   └── styles/          # Tema ve stiller
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
│
├── service-backend/          # Node.js API Gateway
│   ├── src/
│   │   ├── routes/          # API endpoint'leri
│   │   │   ├── upload.js    # Dosya yükleme
│   │   │   ├── summary.js   # AI özet servisi
│   │   │   ├── kpi.js       # KPI analiz servisi
│   │   │   ├── trend.js     # Trend analiz servisi
│   │   │   └── query.js     # Doğal dil sorgu servisi
│   │   ├── middleware/      # Express middleware'leri
│   │   ├── services/        # AI servis entegrasyonu
│   │   ├── app.js           # Express uygulaması
│   │   └── server.js        # Sunucu başlatma
│   ├── package.json
│   ├── Dockerfile
│   └── .env
│
├── docker-compose.yml        # Multi-container orchestration
└── README.md                # Bu dosya
```

## 🚀 Hızlı Başlangıç

### Ön Gereksinimler
- Node.js 18+
- Docker & Docker Compose (opsiyonel)
- AI Service (ayrı olarak çalıştırılmalı)

### 1. Repository'yi Klonlayın
```bash
git clone <repository-url>
cd llm-analysis-dashboard
```

### 2. Docker Compose ile Çalıştırın (Önerilen)
```bash
docker-compose up --build
```

### 3. Manuel Kurulum

#### Backend Servisi
```bash
cd service-backend
npm install
cp .env.example .env  # Çevre değişkenlerini düzenleyin
npm run dev
```

#### Frontend Servisi
```bash
cd service-frontend
npm install
npm run dev
```

## 🌐 Erişim URL'leri

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Dokumentasyonu**: http://localhost:8000/
- **Health Check**: http://localhost:8000/health

## 🔧 Yapılandırma

### Backend (.env)
```env
PORT=8000
NODE_ENV=development
AI_SERVICE_URL=http://localhost:5000
AI_SERVICE_API_KEY=your-api-key
MAX_FILE_SIZE=52428800
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Frontend
Vite environment variables kullanır:
```env
VITE_API_URL=http://localhost:8000/api
VITE_USE_MOCK_API=false
```

## 📚 API Endpoints

### Dosya İşlemleri
- `POST /api/upload` - Dosya yükleme
- `GET /api/upload/status` - Upload servis durumu

### AI Analizleri
- `GET /api/summary/:reportId` - Rapor özeti
- `GET /api/kpi/:reportId` - KPI analizi
- `GET /api/trend/:reportId` - Trend analizi
- `POST /api/query` - Doğal dil sorgusu

### Sistem
- `GET /health` - Sistem sağlık durumu
- `GET /api/{service}/status` - Servis durumları

## 🎨 Özellikler

### Frontend
- ✅ Modern React 18 + Material-UI
- ✅ Responsive tasarım
- ✅ Dark/Light tema desteği
- ✅ Drag & drop dosya yükleme
- ✅ Real-time chat interface
- ✅ Interactive charts (Recharts)
- ✅ Zustand state management
- ✅ Error boundary ve loading states

### Backend
- ✅ Express.js API Gateway
- ✅ Multer ile dosya yükleme
- ✅ Rate limiting ve güvenlik
- ✅ CORS yapılandırması
- ✅ Comprehensive error handling
- ✅ AI service integration
- ✅ Health check endpoints
- ✅ Request validation

## 🔒 Güvenlik

- **Rate Limiting**: IP başına istek sınırlaması
- **CORS**: Cross-origin request koruması  
- **Helmet**: HTTP security headers
- **File Validation**: Dosya türü ve boyut kontrolü
- **Input Sanitization**: Giriş verisi doğrulama

## 🐳 Docker Deployment

### Tek Komutla Tüm Servisleri Çalıştır
```bash
docker-compose up -d
```

### Servisleri Ayrı Ayrı Çalıştır
```bash
# Backend
docker build -t ai-backend ./service-backend
docker run -p 8000:8000 ai-backend

# Frontend  
docker build -t ai-frontend ./service-frontend
docker run -p 3000:80 ai-frontend
```

## 📊 Monitoring

### Health Checks
```bash
# Backend health
curl http://localhost:8000/health

# Service status
curl http://localhost:8000/api/upload/status
curl http://localhost:8000/api/query/status
```

### Logs
```bash
# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Development logs
npm run dev  # Her iki serviste de detaylı loglar
```

## 🧪 Test Etme

### API Testleri
```bash
# Upload test
curl -X POST http://localhost:8000/api/upload \
  -F "file=@sample.pdf"

# Query test
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Bu rapordaki ana bulgular neler?"}'
```

### Frontend Test
1. http://localhost:3000 adresine gidin
2. Bir dosya yükleyin
3. Chat kutusunda sorular sorun
4. KPI kartlarını ve grafikleri inceleyin

## 🔄 AI Service Entegrasyonu

Backend, AI servisine aşağıdaki endpoint'ler üzerinden bağlanır:

```
POST /upload          # Dosya işleme
GET  /summary/:id      # Özet oluşturma  
GET  /kpi/:id         # KPI analizi
GET  /trend/:id       # Trend analizi
POST /query           # Doğal dil işleme
```

AI servisiniz bu endpoint'leri implement etmelidir.

## 🛠️ Geliştirme

### Yeni Özellik Ekleme
1. Backend'de yeni route oluşturun
2. Frontend'de API service'i güncelleyin
3. UI bileşenlerini ekleyin
4. State management'ı güncelleyin

### Debug
- Backend: `npm run dev` (nodemon ile auto-restart)
- Frontend: `npm run dev` (Vite hot reload)
- Browser DevTools: React Developer Tools

## 📈 Performans

- **Frontend**: Vite build optimization
- **Backend**: Compression middleware
- **Caching**: Static asset caching
- **File Upload**: Streaming upload support
- **Error Handling**: Graceful degradation

## 🤝 Katkıda Bulunma

1. Fork the project
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -m 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## 📝 TODO

- [ ] Unit testler ekle
- [ ] E2E testler (Cypress)
- [ ] Redis cache entegrasyonu
- [ ] JWT authentication
- [ ] WebSocket real-time updates
- [ ] Multi-language support
- [ ] Advanced analytics

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🆘 Destek

Sorunlar için:
1. GitHub Issues kullanın
2. Logları kontrol edin (`docker-compose logs`)
3. Health check endpoint'lerini test edin
4. API dokümantasyonunu inceleyin

---

**🎉 AI Service Tamamlandı!** 

AI Service artık tam olarak implement edilmiştir ve aşağıdaki özellikleri sunar:
- 📄 Dosya yükleme ve işleme (PDF, DOCX, XLSX, CSV, TXT)
- 🧠 RAG tabanlı doğal dil sorguları
- 📊 Otomatik KPI çıkarma ve analizi
- 📈 Trend analizi (istatistiksel + AI destekli)
- 📝 Çoklu özet türleri (yönetici, detaylı, ana noktalar, finansal)
- 🔍 Semantik arama (pgvector ile)
- 🤖 OpenAI/Gemini API entegrasyonu

**Kurulum için:**
1. `.env` dosyasında AI API key'lerinizi ayarlayın
2. `docker-compose up --build` ile tüm servisleri başlatın
3. PostgreSQL + pgvector otomatik olarak kurulur
#   L L M - A n a l y s i s - D a s h b o a r d  
 