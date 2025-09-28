from fastapi import FastAPI
from .routes import analyze_optimized
from dotenv import load_dotenv

# .env dosyasını yükle
load_dotenv()

# Uygulamayı başlat
app = FastAPI(
    title="AI Service - Hızlandırılmış Versiyon",
    description="İBB Wi-Fi verisi için KPI, Trend, Insights, Action Items ve Compare fonksiyonlarını sağlayan servis - GPU ve Asenkron desteği ile",
    version="2.0.0"
)

# Hızlandırılmış route'lar (önerilen)
app.include_router(analyze_optimized.router, prefix="/analyze", tags=["Analyze-Fast"])



# Basit healthcheck route’u ekleyelim
@app.get("/")
async def root():
    return {"status": "ok", "message": "AI Service çalışıyor"}