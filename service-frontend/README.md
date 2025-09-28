# AI Reporting Agent - Frontend

Bu proje, AI-destekli Raporlama Ajanı için geliştirilmiş profesyonel bir React frontend uygulamasıdır.

## 🚀 Özellikler

- **Modern React 18** - Hooks ve functional components
- **Material UI 5** - Modern ve responsive UI bileşenleri
- **Recharts** - Güçlü veri görselleştirme
- **Zustand** - Basit ve etkili state management
- **React Router 6** - Client-side routing
- **Vite** - Hızlı development ve build
- **Docker & Nginx** - Production-ready deployment

## 📁 Proje Yapısı

```
service-frontend/
├── public/
│   └── index.html
├── src/
│   ├── assets/              # Statik dosyalar
│   ├── components/          # UI bileşenleri
│   │   ├── layout/         # Layout bileşenleri (Header, Sidebar, Footer)
│   │   ├── charts/         # Grafik bileşenleri
│   │   ├── cards/          # KPI kartları
│   │   ├── forms/          # Form bileşenleri
│   │   └── widgets/        # Widget bileşenleri
│   ├── pages/              # Sayfa bileşenleri
│   │   ├── Dashboard.jsx   # Ana dashboard
│   │   ├── Login.jsx       # Giriş sayfası
│   │   └── Signup.jsx      # Kayıt sayfası
│   ├── services/           # API servisleri
│   │   └── api.js          # API fonksiyonları
│   ├── store/              # State management
│   │   └── index.js        # Zustand stores
│   ├── styles/             # Tema ve stiller
│   │   ├── theme.js        # Material UI teması
│   │   └── index.css       # Global CSS
│   ├── App.jsx             # Ana uygulama bileşeni
│   └── index.js            # Giriş noktası
├── Dockerfile              # Docker build tanımı
├── nginx.conf              # Nginx konfigürasyonu
├── package.json            # Bağımlılıklar
└── vite.config.js          # Vite konfigürasyonu
```

## 🛠 Geliştirme

### Gereksinimler

- Node.js 18+
- npm veya yarn

### Kurulum

```bash
cd service-frontend
npm install
```

### Geliştirme Sunucusu

```bash
npm run dev
```

Uygulama http://localhost:3000 adresinde çalışacaktır.

### Build

```bash
npm run build
```

## 🐳 Docker ile Çalıştırma

### Docker Build

```bash
docker build -t service-frontend .
```

### Docker Run

```bash
docker run -p 80:80 service-frontend
```

### Docker Compose ile

```yaml
version: '3.8'
services:
  frontend:
    build: ./service-frontend
    ports:
      - "80:80"
    environment:
      - REACT_APP_API_URL=/api
      - REACT_APP_AUTH_URL=/auth
    depends_on:
      - backend
      - auth-service
```

## 🔧 Konfigürasyon

### Ortam Değişkenleri

`.env` dosyasında aşağıdaki değişkenler tanımlanabilir:

```env
REACT_APP_API_URL=/api
REACT_APP_AUTH_URL=/auth
REACT_APP_NAME=AI Reporting Agent
REACT_APP_VERSION=1.0.0
REACT_APP_ENABLE_DEMO_MODE=true
```

### Nginx Konfigürasyonu

`nginx.conf` dosyası aşağıdaki özellikleri içerir:

- **API Proxy**: `/api` → `backend:8001`
- **Auth Proxy**: `/auth` → `auth-service:8003`
- **Static Asset Caching**: Uzun süreli cache
- **Gzip Compression**: Performans optimizasyonu
- **Security Headers**: Güvenlik başlıkları
- **Rate Limiting**: API rate limiting

## 📱 UI Bileşenleri

### Layout Bileşenleri

- **Header**: Uygulama başlığı, kullanıcı menüsü, çıkış
- **Sidebar**: Navigasyon menüsü, son raporlar
- **Footer**: Alt bilgi ve linkler

### Dashboard Bileşenleri

- **KpiCards**: KPI metrikleri kartları
- **TrendChart**: Trend analizi grafikleri
- **UploadArea**: Dosya yükleme alanı
- **ActionBar**: AI aksiyon butonları
- **ChatBox**: AI asistan chat arayüzü

### Form Bileşenleri

- **UploadArea**: Drag & drop dosya yükleme
- **Login/Signup**: Kimlik doğrulama formları

## 🎨 Tema ve Stiller

### Material UI Teması

- **Primary Color**: Corporate Blue (#1976d2)
- **Secondary Color**: Corporate Gray (#424242)
- **Background**: Light Gray (#f8fafc)
- **Typography**: Inter font family

### Responsive Design

- **Desktop**: Full sidebar, geniş layout
- **Tablet**: Collapsible sidebar
- **Mobile**: Hidden sidebar, stack layout

## 🔐 Kimlik Doğrulama

### Auth Flow

1. Kullanıcı login sayfasında giriş yapar
2. Auth service token döner
3. Token localStorage'da saklanır
4. Protected routes token kontrolü yapar
5. API isteklerinde Bearer token kullanılır

### Protected Routes

- Dashboard ve diğer ana sayfalar auth gerektirir
- Login/Signup sayfaları public
- Otomatik redirect login/dashboard arası

## 📊 State Management

### Zustand Stores

- **authStore**: Kullanıcı bilgileri ve auth durumu
- **reportsStore**: Rapor listesi ve aktif rapor
- **dashboardStore**: KPI, trend, chat verileri
- **uiStore**: UI durumu (sidebar, notifications)

## 🔌 API Entegrasyonu

### API Servisleri

- **authAPI**: Login, register, logout, profile
- **reportAPI**: Upload, query, analyze, extract
- **Interceptors**: Token ekleme, error handling

### API Endpoints

```javascript
// Auth endpoints
POST /auth/login
POST /auth/register
POST /auth/logout
GET /auth/profile

// Report endpoints
POST /api/upload
POST /api/query
GET /api/reports
POST /api/reports/:id/summarize
POST /api/reports/:id/analyze-trends
POST /api/reports/:id/extract-kpis
```

## 🚀 Production Deployment

### Docker Production

```bash
# Build
docker build -t service-frontend:latest .

# Run
docker run -d \
  --name frontend \
  -p 80:80 \
  --restart unless-stopped \
  service-frontend:latest
```

### Nginx Optimizasyonları

- Gzip compression
- Static asset caching
- Security headers
- Rate limiting
- Health checks

## 🧪 Test ve Debug

### Development Tools

- React Developer Tools
- Zustand DevTools
- Network tab for API debugging

### Error Handling

- API error interceptors
- User-friendly error messages
- Notification system
- Fallback UI components

## 📈 Performance

### Optimizasyonlar

- Code splitting (vendor, mui, charts chunks)
- Lazy loading components
- Image optimization
- Bundle size optimization
- CDN-ready static assets

### Monitoring

- Performance metrics
- Error tracking
- User analytics (optional)

## 🤝 Katkıda Bulunma

1. Fork the project
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🆘 Destek

Herhangi bir sorun için issue açabilir veya iletişime geçebilirsiniz.
