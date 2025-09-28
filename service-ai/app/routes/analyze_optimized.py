from fastapi import APIRouter, UploadFile, File, HTTPException, Query, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import pandas as pd
from ..modules import parser, kpi, trend, insights, actions, compare
from ..modules.rag_optimized import save_to_postgres_async
from ..modules.rag_ultra_fast import ultra_fast_save_to_postgres
from ..modules.db import init_database
from io import BytesIO
import tempfile
import os
import asyncio
import time
import google.generativeai as genai
import json

router = APIRouter()

# Global değişkenler
uploaded_data = None
current_token = None
embedding_status = {"status": "processing", "progress": 0, "message": "Embedding işlemi başlatılıyor...", "start_time": None}

# Gemini API konfigürasyonu
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# Chat için Pydantic model
class ChatMessage(BaseModel):
    message: str
    include_data_context: bool = True

async def background_embedding_task(df, filename: str):
    """Background'da çalışan embedding görevi"""
    global current_token, embedding_status
    
    try:
        embedding_status["status"] = "processing"
        embedding_status["progress"] = 0
        embedding_status["message"] = "Embedding işlemi başladı..."
        embedding_status["start_time"] = time.time()
        
        # Database'i initialize et
        init_result = init_database()
        if not init_result:
            embedding_status["status"] = "error"
            embedding_status["message"] = "Database initialization failed"
            return
        
        embedding_status["progress"] = 20
        embedding_status["message"] = "Ultra fast embedding başlıyor..."
        
        # ULTRA HIZLI embedding ve database insert
        token = await ultra_fast_save_to_postgres(df, filename)
        
        if token:
            current_token = token
            embedding_status["status"] = "completed"
            embedding_status["progress"] = 100
            elapsed = time.time() - embedding_status["start_time"]
            embedding_status["message"] = f"Embedding tamamlandı! ({elapsed:.1f}s) Token: {token[:8]}..."
        else:
            embedding_status["status"] = "error"
            embedding_status["message"] = "Embedding kaydetme hatası"
            
    except Exception as e:
        embedding_status["status"] = "error"
        embedding_status["message"] = f"Embedding hatası: {str(e)}"


@router.post("/upload")
async def upload_ultra_fast(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    enable_ai: bool = True
):
    """HIZLI upload - Hemen reportId döndür, embedding arka planda"""
    global uploaded_data, current_token
    
    try:
        # Dosyayı oku ve parse et
        file_bytes = await file.read()
        df = parser.parse_file(file.filename, file_bytes)
        
        if df.empty:
            raise HTTPException(status_code=400, detail="Desteklenmeyen dosya formatı veya boş dosya")
        
        uploaded_data = df
        
        # Hemen reportId oluştur
        import uuid
        report_id = f"report-{uuid.uuid4().hex[:8]}"
        
        response = {
            "message": "Dosya başarıyla yüklendi - Analizler hazır",
            "filename": file.filename,
            "rows": len(df),
            "columns": list(df.columns),
            "reportId": report_id,
            "id": report_id,
            "ai_enabled": enable_ai,
            "mode": "async_background",
            "status": "ready_for_analysis"
        }
        
        if enable_ai:
            # Arka planda embedding başlat
            background_tasks.add_task(background_embedding_task, df, file.filename)
            response["ai_status"] = "embedding_in_progress"
            response["message"] += " - AI embedding arka planda başlatıldı"
        else:
            response["ai_status"] = "disabled"
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ultra fast upload hatası: {str(e)}")

@router.get("/embedding-status")
async def get_embedding_status():
    """Embedding işleminin durumunu kontrol et"""
    global embedding_status
    return {
        "embedding_status": embedding_status,
        "current_token": current_token[:8] + "..." if current_token else None,
        "ai_ready": embedding_status.get("status") == "completed"
    }

@router.get("/summary")
async def get_summary_fast():
    """Hızlandırılmış özet raporu - AI hazırsa AI, değilse temel özet"""
    global uploaded_data, current_token
    
    if uploaded_data is None:
        raise HTTPException(status_code=400, detail="Önce bir dosya yükleyin")
    
    try:
        # Token varsa database'den, yoksa uploaded_data'dan bilgi al
        if current_token and embedding_status.get("status") == "completed":
            # Database'den özet bilgileri al
            import psycopg2
            conn = psycopg2.connect(os.getenv("DATABASE_URL", "postgresql://service_user:service_pass123@localhost:5432/service_ai"))
            cur = conn.cursor()
            cur.execute("SELECT COUNT(*), filename FROM documents WHERE token = %s GROUP BY filename", (current_token,))
            result = cur.fetchone()
            conn.close()
            
            if result:
                total_rows = result[0]
                filename = result[1]
                basic_summary = {
                    "toplam_satir": total_rows,
                    "dosya_adi": filename,
                    "ozet": f"Database'den {total_rows} kayıt yüklendi ({filename})",
                    "token": current_token[:8] + "...",
                    "data_source": "database"
                }
            else:
                basic_summary = {"error": "Token için veri bulunamadı"}
        else:
            # uploaded_data'dan özet oluştur
            if uploaded_data is None:
                raise HTTPException(status_code=400, detail="Veri bulunamadı")
                
            total_rows = len(uploaded_data)
            columns = list(uploaded_data.columns)
            
            basic_summary = {
                "toplam_satir": total_rows,
                "kolonlar": columns,
                "ozet": f"Veri seti {total_rows} satır içeriyor. Mevcut kolonlar: {', '.join(columns)}",
                "data_source": "memory"
            }
            
            # Eğer abone sayısı kolonu varsa ek bilgi ver
            if 'NUMBER_OF_SUBSCRIBER' in uploaded_data.columns:
                total_subscribers = int(uploaded_data['NUMBER_OF_SUBSCRIBER'].sum())
                basic_summary["toplam_abone"] = total_subscribers
                basic_summary["ozet"] += f" Toplam {total_subscribers} abone kaydı bulunuyor."
        
        response = {"basic_summary": basic_summary}
        
        # AI özeti varsa ekle
        if current_token and embedding_status["status"] == "completed":
            try:
                # Async context içinde olduğumuz için direkt await kullanıyoruz
                from ..modules.rag_optimized import generate_summary_pg_async
                ai_summary = await generate_summary_pg_async(current_token)
                response["ai_summary"] = ai_summary
                response["ai_enabled"] = True
            except Exception as ai_error:
                response["ai_summary"] = f"AI summary error: {str(ai_error)}"
                response["ai_enabled"] = False
        elif embedding_status["status"] == "processing":
            response["ai_summary"] = "AI summary is being prepared... Please wait."
            response["ai_enabled"] = False
        else:
            response["ai_summary"] = "AI summary is being prepared... Please wait."
            response["ai_enabled"] = False
            
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Özet oluşturma hatası: {str(e)}")

@router.get("/actions")
async def get_actions_fast():
    """Hızlandırılmış AI destekli action items"""
    global uploaded_data, current_token
    
    # Token varsa AI actions kullan, yoksa uploaded_data gerekli
    if current_token is None and uploaded_data is None:
        raise HTTPException(status_code=400, detail="Önce bir dosya yükleyin veya token ayarlayın")
    
    try:
        # KPI hesapla (uploaded_data varsa)
        if uploaded_data is not None:
            kpi_result = kpi.compute_kpi(uploaded_data)
            basic_actions = actions.action_items(kpi_result)
        else:
            # Token varsa dummy KPI
            kpi_result = {"info": "Token-based analysis"}
            basic_actions = ["Token-based analysis - Upload data for KPI calculation"]
        
        response = {"basic_actions": basic_actions}
        
        # AI destekli actions varsa ekle
        if current_token and embedding_status["status"] == "completed":
            try:
                # Async context içinde olduğumuz için direkt await kullanıyoruz
                from ..modules.rag_optimized import generate_actions_pg_async
                ai_actions = await generate_actions_pg_async(current_token, kpi_result)
                response["ai_actions"] = ai_actions
                response["ai_enabled"] = True
            except Exception as ai_error:
                response["ai_actions"] = [f"AI suggestion error: {str(ai_error)}"]
                response["ai_enabled"] = False
        elif embedding_status["status"] == "processing":
            response["ai_actions"] = ["AI suggestions are being prepared... Please wait."]
            response["ai_enabled"] = False
        else:
            response["ai_actions"] = ["For AI suggestions, first load the file in AI active mode."]
            response["ai_enabled"] = False
            
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Action items hatası: {str(e)}")

# Diğer endpoint'ler (KPI, trend, insights, compare) aynı kalıyor
@router.get("/kpi")
async def get_kpi():
    """KPI hesaplama endpoint'i"""
    global uploaded_data
    
    if uploaded_data is None:
        raise HTTPException(status_code=400, detail="Önce bir dosya yüklemelisiniz")
    
    try:
        kpi_result = kpi.compute_kpi(uploaded_data)
        return {"kpi": kpi_result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"KPI hesaplama hatası: {str(e)}")

@router.get("/trend")
async def get_trend():
    """Trend analizi endpoint'i"""
    global uploaded_data
    
    if uploaded_data is None:
        raise HTTPException(status_code=400, detail="Önce bir dosya yüklemelisiniz")
    
    try:
        trend_result = trend.compute_trend(uploaded_data)
        return {"trend": trend_result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Trend analizi hatası: {str(e)}")

@router.get("/insights")
async def get_insights():
    """Key insights endpoint'i"""
    global uploaded_data
    
    if uploaded_data is None:
        raise HTTPException(status_code=400, detail="Önce bir dosya yüklemelisiniz")
    
    try:
        insights_result = insights.key_insights(uploaded_data)
        return {"insights": insights_result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Insights analizi hatası: {str(e)}")


@router.get("/status")
async def get_status():
    """Yüklenen veri durumunu kontrol et"""
    global uploaded_data, current_token, embedding_status
    
    if uploaded_data is None:
        return {"status": "no_data", "message": "Henüz veri yüklenmedi"}
    
    return {
        "status": "data_loaded", 
        "message": "Veri yüklü ve hazır",
        "rows": len(uploaded_data),
        "columns": list(uploaded_data.columns),
        "ai_token": current_token[:8] + "..." if current_token else None,
        "embedding_status": embedding_status
    }

@router.post("/chat")
async def chat_with_gemini(chat_message: ChatMessage):
    """Gemini API ile chat endpoint'i"""
    global uploaded_data, current_token, embedding_status
    
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API anahtarı bulunamadı")
    
    try:
        # Gemini modelini başlat
        model = genai.GenerativeModel('models/gemini-2.5-flash')
        
        # Context oluştur
        context_parts = []
        
        # Veri context'i ekle (eğer isteniyorsa)
        if chat_message.include_data_context and uploaded_data is not None:
            context_parts.append(f"Uploaded data information:")
            context_parts.append(f"- Total rows: {len(uploaded_data)}")
            context_parts.append(f"- Columns: {', '.join(uploaded_data.columns)}")
            
            # Eğer abone sayısı kolonu varsa ek bilgi
            if 'NUMBER_OF_SUBSCRIBER' in uploaded_data.columns:
                total_subscribers = int(uploaded_data['NUMBER_OF_SUBSCRIBER'].sum())
                context_parts.append(f"- Total number of subscribers: {total_subscribers}")
            
            # AI embedding durumu
            if current_token and embedding_status.get("status") == "completed":
                context_parts.append(f"- AI embedding completed (Token: {current_token[:8]}...)")
            elif embedding_status.get("status") == "processing":
                context_parts.append("- The AI embedding process is ongoing....")
        
        # Prompt oluştur
        if context_parts:
            full_prompt = f"""
I am working as a data analysis assistant. The following data information is available:

{chr(10).join(context_parts)}

User question: {chat_message.message}

Please answer this question in the context of data analysis. If the question is not related to the data, please provide a general answer.
"""
        else:
            full_prompt = f"""
I am working as a data analysis assistant. 

User question: {chat_message.message}

Please answer this question in the context of data analysis. If the question is not related to the data, please provide a general answer.
"""
        
        # Gemini'ye istek gönder
        response = model.generate_content(full_prompt)
        
        return {
            "response": response.text,
            "data_context_included": chat_message.include_data_context and uploaded_data is not None,
            "ai_embedding_ready": current_token and embedding_status.get("status") == "completed",
            "timestamp": time.time()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat hatası: {str(e)}")
