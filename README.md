# 🤖 AI Reporting Agent Dashboard

Modern, AI destekli raporlama ve analiz platformu. React frontend, Node.js API Gateway ve Python AI servisi ile oluşturulmuş kapsamlı bir çözüm.

## 🎯 Proje Özeti

Bu proje, kullanıcıların raporlarını (PDF, CSV, Excel) yükleyerek AI destekli analizler alabilecekleri bir dashboard uygulamasıdır. Yüklenen veriler üzerinden doğal dil ile chat yapabilir, otomatik özetler ve aksiyon öğeleri alabilirsiniz.

## 🏗️ Sistem Mimarisi

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │  Backend API    │    │   AI Service    │    │   PostgreSQL    │
│   (React)       │◄──►│   Gateway       │◄──►│   (Python)      │◄──►│   + pgvector    │
│   Port: 3000    │    │   (Node.js)     │    │   Port: 5000    │    │   Port: 5432    │
│   Nginx         │    │   Port: 8000    │    │   FastAPI       │    │   Vector DB     │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Proje Yapısı

```
llm-analysis-dashboard/
├── service-frontend/          # React Frontend
│   ├── src/
│   │   ├── components/       # UI Bileşenleri
│   │   │   ├── cards/       # KPI Cards
│   │   │   ├── charts/      # Trend Charts
│   │   │   ├── forms/       # Upload Area
│   │   │   ├── layout/      # Header, Sidebar, Footer
│   │   │   └── widgets/     # ChatBox, ActionBar, Settings
│   │   ├── pages/           # Dashboard, Help
│   │   ├── services/        # API servisleri
│   │   ├── store/           # Zustand state management
│   │   └── styles/          # Tema ve stiller
│   ├── public/              # Static assets, favicon
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
│
├── service-backend/          # Node.js API Gateway
│   ├── src/
│   │   ├── routes/          # API endpoint'leri
│   │   │   ├── upload.js    # Dosya yükleme
│   │   │   ├── chat.js      # AI Chat
│   │   │   ├── summary.js   # AI özet servisi
│   │   │   ├── kpi.js       # KPI analiz servisi
│   │   │   ├── trend.js     # Trend analiz servisi
│   │   │   ├── actions.js   # Action items
│   │   │   ├── insights.js  # AI insights
│   │   │   ├── settings.js  # Settings management
│   │   │   └── query.js     # Doğal dil sorgu servisi
│   │   ├── middleware/      # Express middleware'leri
│   │   ├── services/        # AI servis entegrasyonu
│   │   ├── app.js           # Express uygulaması
│   │   └── server.js        # Sunucu başlatma
│   ├── uploads/             # Yüklenen dosyalar
│   ├── package.json
│   ├── Dockerfile
│   └── env.example
│
├── service-ai/              # Python AI Service
│   ├── app/
│   │   ├── modules/         # AI modülleri
│   │   │   ├── rag_optimized.py    # RAG sistemi
│   │   │   ├── rag_ultra_fast.py   # Ultra hızlı RAG
│   │   │   ├── parser.py           # Dosya parser
│   │   │   ├── kpi.py              # KPI extraction
│   │   │   ├── trend.py            # Trend analysis
│   │   │   ├── insights.py         # AI insights
│   │   │   ├── actions.py          # Action items
│   │   │   └── db.py               # Database operations
│   │   ├── routes/          # FastAPI routes
│   │   └── main.py          # FastAPI app
│   ├── requirements.txt
│   ├── Dockerfile
│   └── init.sql
│
├── docker-compose.yml       # Multi-container orchestration
├── .env                     # Environment variables
├── .gitignore              # Git ignore rules
└── README.md               # Bu dosya
```

## 🚀 Hızlı Başlangıç

### Ön Gereksinimler
- Docker & Docker Compose
- Git
- Google Gemini API Key

### 1. Repository'yi Klonlayın
```bash
git clone <repository-url>
cd llm-analysis-dashboard
```

### 2. Environment Variables Ayarlayın
`.env` dosyasını oluşturun:
```env
# AI Service Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Database Configuration
DATABASE_URL=postgresql://service_user:service_pass123@postgres:5432/service_ai

# Service URLs
AI_SERVICE_URL=http://localhost:5000
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# Development Settings
NODE_ENV=development
DEBUG=true
```

### 3. Docker Compose ile Çalıştırın
```bash
docker-compose up --build
```

### 4. Erişim
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **AI Service**: http://localhost:5000

## 🧠 AI Embedding Sistemi

### RAG (Retrieval-Augmented Generation) Yapısı

#### 1. **Veri İşleme Pipeline**
```
Dosya Yükleme → Parser → Chunking → Embedding → Vector DB → RAG Query
```

#### 2. **Embedding Modelleri**
- **Model**: `all-MiniLM-L6-v2` (Sentence Transformers)
- **Boyut**: 384 dimensions
- **GPU**: CUDA desteği
- **Batch Size**: 64 (ultra fast mode)

#### 3. **Vector Database**
- **PostgreSQL + pgvector** extension
- **Cosine similarity** ile semantic search
- **Parallel processing** ile hızlı insert
- **Chunk-based** storage (5000 kayıt/chunk)

#### 4. **RAG Query Process**
```python
# 1. User query embedding
query_embedding = model.encode(user_query)

# 2. Vector similarity search
similar_chunks = vector_search(query_embedding, top_k=5)

# 3. Context building
context = build_context(similar_chunks)

# 4. Gemini API call with context
response = gemini.generate_content(context + user_query)
```

## 🎨 Platform Özellikleri

### 📊 **Dashboard Bileşenleri**

#### **1. File Upload Area**
- Drag & drop dosya yükleme
- PDF, CSV, Excel desteği
- Real-time upload progress
- File validation ve error handling

#### **2. KPI Cards**
- AI-extracted key metrics
- Trend indicators (up/down/flat)
- Interactive cards with tooltips
- Real-time data updates

#### **3. Trend Analysis Chart**
- Interactive line/area charts
- Time-series data visualization
- Export capabilities
- Responsive design

#### **4. AI Chat Assistant**
- Natural language queries
- Context-aware responses
- Data-specific insights
- Conversation history

#### **5. Action Items**
- AI-generated action recommendations
- Priority-based categorization
- Expandable details
- Status tracking

### ⚙️ **Settings & Configuration**

#### **Settings Modal**
- **General**: Theme, language, notifications
- **Performance**: Cache settings, batch sizes
- **Display**: Chart preferences, data formats
- **AI**: Model selection, temperature, timeout
- **Notifications**: Real-time updates, email alerts

#### **Help System**
- Comprehensive system documentation
- Architecture explanations
- Technology stack details
- Component descriptions
- Troubleshooting guides

### 🤖 **AI-Powered Features**

#### **1. Smart Chat**
- **Context-Aware**: Uploaded data üzerinden chat
- **Natural Language**: Türkçe/İngilizce soru-cevap
- **Data Insights**: Veriye özel analizler
- **Real-time**: Anlık yanıtlar

#### **2. Automatic Summaries**
- **Executive Summary**: Yönetici özeti
- **Detailed Summary**: Detaylı analiz
- **Key Points**: Ana bulgular
- **Financial Summary**: Finansal özet

#### **3. Action Items Generation**
- **AI Analysis**: Veri analizi sonucu
- **Priority Ranking**: Öncelik sıralaması
- **Categorization**: Kategori bazlı gruplama
- **Implementation**: Uygulanabilir öneriler

#### **4. KPI Extraction**
- **Automatic Detection**: Otomatik KPI tespiti
- **Trend Analysis**: Trend hesaplama
- **Comparison**: Karşılaştırmalı analiz
- **Visualization**: Grafik gösterimi

## 🛠️ Teknoloji Stack

### **Frontend (React)**
```json
{
  "framework": "React 18",
  "build_tool": "Vite",
  "ui_library": "Material-UI 5",
  "state_management": "Zustand",
  "routing": "React Router 6",
  "charts": "Recharts",
  "http_client": "Axios",
  "deployment": "Nginx (Docker)"
}
```

### **Backend (Node.js)**
```json
{
  "runtime": "Node.js 18",
  "framework": "Express.js",
  "validation": "express-validator",
  "file_upload": "Multer",
  "security": "helmet, cors, rate-limit",
  "compression": "compression",
  "logging": "morgan",
  "error_handling": "asyncHandler"
}
```

### **AI Service (Python)**
```json
{
  "framework": "FastAPI",
  "ai_models": "Google Gemini 2.5 Flash",
  "embeddings": "Sentence Transformers",
  "vector_db": "PostgreSQL + pgvector",
  "data_processing": "Pandas, NumPy",
  "ml_libraries": "Scikit-learn",
  "async": "asyncio, ThreadPoolExecutor",
  "gpu": "CUDA support"
}
```

### **Database & Infrastructure**
```json
{
  "database": "PostgreSQL 16",
  "vector_extension": "pgvector",
  "containerization": "Docker, Docker Compose",
  "reverse_proxy": "Nginx",
  "monitoring": "Health checks, Logs",
  "security": "Environment variables, CORS"
}
```

## 🔧 Kurulum Detayları

### **1. Environment Variables**

#### **Root .env**
```env
# AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Database
DATABASE_URL=postgresql://service_user:service_pass123@postgres:5432/service_ai

# Service URLs
AI_SERVICE_URL=http://localhost:5000
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
```

#### **Frontend .env**
```env
VITE_API_URL=http://localhost:8000/api
VITE_USE_MOCK_API=false
```

#### **Backend .env**
```env
NODE_ENV=production
PORT=8000
AI_SERVICE_URL=http://ai-service:5000
MAX_FILE_SIZE=52428800
UPLOAD_DIR=uploads
ALLOWED_FILE_TYPES=pdf,csv,xlsx,xls
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### **2. Docker Compose Services**

#### **Frontend Service**
- **Base**: Node.js 18 Alpine
- **Build**: Multi-stage (Node.js → Nginx)
- **Port**: 3000:80
- **Features**: Gzip, Security headers, SPA routing

#### **Backend Service**
- **Base**: Node.js 18 Alpine
- **Port**: 8000:8000
- **Features**: File upload, API Gateway, Health checks

#### **AI Service**
- **Base**: Python 3.10 Slim
- **Port**: 5000:5000
- **Features**: GPU support, FastAPI, RAG system

#### **PostgreSQL Service**
- **Base**: pgvector/pgvector:pg16
- **Port**: 5432:5432
- **Features**: Vector database, Automatic initialization

### **3. Build Process**

#### **Frontend Build**
```dockerfile
# Build stage
FROM node:18-alpine as build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

#### **Backend Build**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 8000
CMD ["npm", "start"]
```

#### **AI Service Build**
```dockerfile
FROM python:3.10-slim
RUN apt-get update && apt-get install -y curl gcc g++ patchelf
WORKDIR /app
COPY requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5000"]
```

## 📚 API Endpoints

### **File Operations**
- `POST /api/upload` - Dosya yükleme
- `GET /api/upload/status` - Upload durumu

### **AI Analysis**
- `POST /api/chat` - AI chat
- `GET /api/summary/:reportId` - Rapor özeti
- `GET /api/kpi/:reportId` - KPI analizi
- `GET /api/trend/:reportId` - Trend analizi
- `GET /api/actions/:reportId` - Action items
- `GET /api/insights/:reportId` - AI insights

### **Settings**
- `GET /api/settings` - Ayarları getir
- `PUT /api/settings` - Ayarları güncelle
- `POST /api/settings/reset` - Ayarları sıfırla

### **System**
- `GET /health` - Sistem sağlık durumu
- `GET /api/{service}/status` - Servis durumları

## 🔒 Güvenlik

### **Frontend Security**
- **CSP Headers**: Content Security Policy
- **XSS Protection**: Cross-site scripting koruması
- **HTTPS**: SSL/TLS encryption
- **Input Validation**: Client-side validation

### **Backend Security**
- **Rate Limiting**: IP başına istek sınırlaması
- **CORS**: Cross-origin request koruması
- **Helmet**: HTTP security headers
- **File Validation**: Dosya türü ve boyut kontrolü
- **Input Sanitization**: Giriş verisi doğrulama

### **AI Service Security**
- **API Key Management**: Environment variables
- **Input Validation**: Pydantic models
- **Error Handling**: Secure error messages
- **Database Security**: Connection pooling

## 🐳 Docker Deployment

### **Production Deployment**
```bash
# Build and start all services
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### **Development Mode**
```bash
# Start with hot reload
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Rebuild specific service
docker-compose up -d --build ai-service
```

## 📊 Monitoring & Logs

### **Health Checks**
```bash
# Frontend
curl http://localhost:3000

# Backend
curl http://localhost:8000/health

# AI Service
curl http://localhost:5000/

# Database
docker-compose exec postgres pg_isready
```

### **Log Monitoring**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f ai-service

# Last 100 lines
docker-compose logs --tail=100 ai-service
```

### **Performance Monitoring**
```bash
# Container stats
docker stats

# Resource usage
docker-compose top

# Disk usage
docker system df
```

## 🧪 Testing

### **API Testing**
```bash
# Upload test
curl -X POST http://localhost:8000/api/upload \
  -F "file=@sample.pdf"

# Chat test
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Bu rapordaki ana bulgular neler?", "include_data_context": true}'

# Settings test
curl -X GET http://localhost:8000/api/settings
```

### **Frontend Testing**
1. http://localhost:3000 adresine gidin
2. Bir dosya yükleyin (PDF, CSV, Excel)
3. Chat kutusunda sorular sorun
4. KPI kartlarını ve grafikleri inceleyin
5. Settings menüsünden ayarları değiştirin
6. Help sayfasından dokümantasyonu okuyun

## 🔄 AI Service Integration

### **RAG System Flow**
```
1. File Upload → Parser → Text Extraction
2. Text Chunking → Embedding Generation
3. Vector Storage → PostgreSQL + pgvector
4. Query Processing → Similarity Search
5. Context Building → Gemini API Call
6. Response Generation → User Interface
```

### **Supported File Types**
- **PDF**: Text extraction, table parsing
- **CSV**: Direct data processing
- **Excel**: Multi-sheet support
- **TXT**: Plain text processing

### **AI Models Used**
- **Embedding**: `all-MiniLM-L6-v2` (384 dimensions)
- **LLM**: Google Gemini 2.5 Flash
- **Processing**: GPU-accelerated (CUDA)

## 🛠️ Development

### **Local Development**
```bash
# Frontend
cd service-frontend
npm install
npm run dev

# Backend
cd service-backend
npm install
npm run dev

# AI Service
cd service-ai
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### **Adding New Features**
1. **Backend**: Yeni route oluşturun
2. **Frontend**: API service'i güncelleyin
3. **AI Service**: Yeni modül ekleyin
4. **UI**: Bileşenleri güncelleyin
5. **State**: Zustand store'u güncelleyin

### **Debugging**
```bash
# Backend logs
docker-compose logs -f backend

# AI service logs
docker-compose logs -f ai-service

# Database logs
docker-compose logs -f postgres

# Frontend logs
docker-compose logs -f frontend
```

## 📈 Performance Optimization

### **Frontend**
- **Vite**: Fast build and HMR
- **Code Splitting**: Lazy loading
- **Tree Shaking**: Unused code elimination
- **Gzip**: Compression middleware

### **Backend**
- **Compression**: Response compression
- **Caching**: Static asset caching
- **Rate Limiting**: Request throttling
- **Connection Pooling**: Database optimization

### **AI Service**
- **GPU Acceleration**: CUDA support
- **Batch Processing**: Parallel processing
- **Vector Indexing**: Fast similarity search
- **Memory Management**: Efficient data handling

## 🤝 Contributing

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
- [ ] Export functionality
- [ ] User management
- [ ] API versioning

## 📄 License

Bu proje MIT lisansı altında lisanslanmıştır.

## 🆘 Support

Sorunlar için:
1. GitHub Issues kullanın
2. Logları kontrol edin (`docker-compose logs`)
3. Health check endpoint'lerini test edin
4. API dokümantasyonunu inceleyin
5. Help sayfasından troubleshooting rehberini okuyun

---

**🎉 AI-Powered Dashboard Ready!**

Bu platform, modern web teknolojileri ve AI gücünü birleştirerek kapsamlı bir analiz deneyimi sunar. Yüklediğiniz veriler üzerinden doğal dil ile chat yapabilir, otomatik özetler alabilir ve AI destekli aksiyon öğeleri oluşturabilirsiniz.

**Kurulum için:**
1. `.env` dosyasında Gemini API key'inizi ayarlayın
2. `docker-compose up --build` ile tüm servisleri başlatın
3. http://localhost:3000 adresinden platforma erişin