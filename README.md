# AI Reporting Agent Dashboard

Modern, AI-powered reporting and analysis platform. A comprehensive solution built with React frontend, Node.js API Gateway, and Python AI service.
This screen is a dashboard that provides AI-powered summary reports, KPI extraction, trend analysis, and recommended actions based on uploaded CSV data, such as trends over time. It is a control panel that allows you to ask questions by chatting with embeddings over the relevant data set, receive notifications for all actions performed, and view project details and technologies used on the help page.
<img width="1905" height="910" alt="Ekran görüntüsü 2025-09-28 020724" src="https://github.com/user-attachments/assets/df278990-cff1-4cf3-920e-1a7496838c03" />

## Embedding Structure
The system uses GPU-accelerated embedding and parallel processing. The all-MiniLM-L6-v2 (384 dimensions) model runs on the GPU with CUDA; it produces ~2000+ texts/second with a batch size of 64. Data is divided into chunks of 5000 and written to PostgreSQL with 8 parallel workers. Cosine similarity searches are performed using pgvector; ivfflat indexes accelerate queries. With async background processing, the user receives an instant response, while the embedding is completed in the background. RAG pipeline: user query → embedding → vector search → context building → Gemini API → response. Total speed is ~1085 records/second; drops to GPU.

## Project Overview

This project is a dashboard application where users can upload reports (PDF, CSV, Excel) and receive AI-powered analysis. You can chat with your uploaded data using natural language, get automatic summaries, and receive action items.

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │  Backend API    │    │   AI Service    │    │   PostgreSQL    │
│   (React)       │◄──►│   Gateway       │◄──►│   (Python)      │◄──►│   + pgvector    │
│   Port: 3000    │    │   (Node.js)     │    │   Port: 5000    │    │   Port: 5432    │
│   Nginx         │    │   Port: 8000    │    │   FastAPI       │    │   Vector DB     │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Project Structure

```
llm-analysis-dashboard/
├── service-frontend/          # React Frontend
│   ├── src/
│   │   ├── components/       # UI Components
│   │   │   ├── cards/       # KPI Cards
│   │   │   ├── charts/      # Trend Charts
│   │   │   ├── forms/       # Upload Area
│   │   │   ├── layout/      # Header, Sidebar, Footer
│   │   │   └── widgets/     # ChatBox, ActionBar, Settings
│   │   ├── pages/           # Dashboard, Help
│   │   ├── services/        # API services
│   │   ├── store/           # Zustand state management
│   │   └── styles/          # Theme and styles
│   ├── public/              # Static assets, favicon
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
│
├── service-backend/          # Node.js API Gateway
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   │   ├── upload.js    # File upload
│   │   │   ├── chat.js      # AI Chat
│   │   │   ├── summary.js   # AI summary service
│   │   │   ├── kpi.js       # KPI analysis service
│   │   │   ├── trend.js     # Trend analysis service
│   │   │   ├── actions.js   # Action items
│   │   │   ├── insights.js  # AI insights
│   │   │   ├── settings.js  # Settings management
│   │   │   └── query.js     # Natural language query service
│   │   ├── middleware/      # Express middleware
│   │   ├── services/        # AI service integration
│   │   ├── app.js           # Express application
│   │   └── server.js        # Server startup
│   ├── uploads/             # Uploaded files
│   ├── package.json
│   ├── Dockerfile
│   └── env.example
│
├── service-ai/              # Python AI Service
│   ├── app/
│   │   ├── modules/         # AI modules
│   │   │   ├── rag_optimized.py    # RAG system
│   │   │   ├── rag_ultra_fast.py   # Ultra fast RAG
│   │   │   ├── parser.py           # File parser
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
└── README.md               # This file
```

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Git
- Google Gemini API Key

### 1. Clone Repository
```bash
git clone <repository-url>
cd llm-analysis-dashboard
```

### 2. Setup Environment Variables
Create `.env` file:
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

### 3. Run with Docker Compose
```bash
docker-compose up --build
```

### 4. Access
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **AI Service**: http://localhost:5000

## AI Embedding System

### RAG (Retrieval-Augmented Generation) Structure

#### 1. **Data Processing Pipeline**
```
File Upload → Parser → Chunking → Embedding → Vector DB → RAG Query
```

#### 2. **Embedding Models**
- **Model**: `all-MiniLM-L6-v2` (Sentence Transformers)
- **Dimensions**: 384 dimensions
- **GPU**: CUDA support
- **Batch Size**: 64 (ultra fast mode)

#### 3. **Vector Database**
- **PostgreSQL + pgvector** extension
- **Cosine similarity** for semantic search
- **Parallel processing** for fast insert
- **Chunk-based** storage (5000 records/chunk)

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

## Platform Features

### **Dashboard Components**

#### **1. File Upload Area**
- Drag & drop file upload
- PDF, CSV, Excel support
- Real-time upload progress
- File validation and error handling

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

### **AI-Powered Features**

#### **1. Smart Chat**
- **Context-Aware**: Chat based on uploaded data
- **Natural Language**: English/Turkish Q&A
- **Data Insights**: Data-specific analysis
- **Real-time**: Instant responses

#### **2. Automatic Summaries**
- **Executive Summary**: Management summary
- **Detailed Summary**: Detailed analysis
- **Key Points**: Main findings
- **Financial Summary**: Financial summary

#### **3. Action Items Generation**
- **AI Analysis**: Based on data analysis
- **Priority Ranking**: Priority ordering
- **Categorization**: Category-based grouping
- **Implementation**: Actionable recommendations

#### **4. KPI Extraction**
- **Automatic Detection**: Automatic KPI detection
- **Trend Analysis**: Trend calculation
- **Comparison**: Comparative analysis
- **Visualization**: Chart display

## Technology Stack

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

## Installation Details

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

## API Endpoints

### **File Operations**
- `POST /api/upload` - File upload
- `GET /api/upload/status` - Upload status

### **AI Analysis**
- `POST /api/chat` - AI chat
- `GET /api/summary/:reportId` - Report summary
- `GET /api/kpi/:reportId` - KPI analysis
- `GET /api/trend/:reportId` - Trend analysis
- `GET /api/actions/:reportId` - Action items
- `GET /api/insights/:reportId` - AI insights

### **Settings**
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings
- `POST /api/settings/reset` - Reset settings

### **System**
- `GET /health` - System health status
- `GET /api/{service}/status` - Service status

## Security

### **Frontend Security**
- **CSP Headers**: Content Security Policy
- **XSS Protection**: Cross-site scripting protection
- **HTTPS**: SSL/TLS encryption
- **Input Validation**: Client-side validation

### **Backend Security**
- **Rate Limiting**: Request limits per IP
- **CORS**: Cross-origin request protection
- **Helmet**: HTTP security headers
- **File Validation**: File type and size control
- **Input Sanitization**: Input data validation

### **AI Service Security**
- **API Key Management**: Environment variables
- **Input Validation**: Pydantic models
- **Error Handling**: Secure error messages
- **Database Security**: Connection pooling

## Docker Deployment

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

## Monitoring & Logs

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

### **Frontend Testing**
1. Go to http://localhost:3000
2. Upload a file (PDF, CSV, Excel)
3. Ask questions in the chat box
4. Review KPI cards and charts
5. Change settings from the settings menu
6. Read documentation from the help page

## AI Service Integration

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

## Development

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
1. **Backend**: Create new route
2. **Frontend**: Update API service
3. **AI Service**: Add new module
4. **UI**: Update components
5. **State**: Update Zustand store

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

## Performance Optimization

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

## Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -m 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Open a Pull Request


## License

This project is licensed under the MIT License.

---

**AI-Powered Dashboard Ready!**

This platform combines modern web technologies with AI power to provide a comprehensive analysis experience. You can chat with your uploaded data using natural language, get automatic summaries, and generate AI-powered action items.

**Installation:**
1. Set your Gemini API key in `.env` file
2. Start all services with `docker-compose up --build`
3. Access the platform at http://localhost:3000
