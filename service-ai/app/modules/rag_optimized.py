import uuid
import os
import numpy as np
from sentence_transformers import SentenceTransformer
import google.generativeai as genai
from .db import get_connection
from dotenv import load_dotenv

# .env dosyasını yükle
load_dotenv()
import asyncio
import concurrent.futures
from typing import List, Optional
import torch
import psycopg2.extras
from concurrent.futures import ThreadPoolExecutor
import time

# GPU desteği kontrol et
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"🚀 Embedding device: {device}")

# Daha hızlı ve küçük model seçenekleri
FAST_MODELS = {
    "fastest": "all-MiniLM-L6-v2",      # 384 dim, en hızlı
    "balanced": "all-mpnet-base-v2",     # 768 dim, orta hız
    "multilingual": "paraphrase-multilingual-MiniLM-L12-v2"  # 384 dim, Türkçe desteği
}

# Model'i global olarak yükle (tek seferlik)
model = None
def get_model(model_name: str = "fastest"):
    global model
    if model is None:
        model_path = FAST_MODELS.get(model_name, FAST_MODELS["fastest"])
        print(f"📥 Loading model: {model_path}")
        model = SentenceTransformer(model_path, device=device)
        print(f"✅ Model loaded on {device}")
    return model

# Gemini ayarı
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class EmbeddingProcessor:
    def __init__(self, model_name: str = "fastest", batch_size: int = 32, max_workers: int = 4):
        self.model = get_model(model_name)
        self.batch_size = batch_size
        self.max_workers = max_workers
        self.executor = ThreadPoolExecutor(max_workers=max_workers)
    
    def create_texts_from_df(self, df) -> List[str]:
        """DataFrame'den metinleri hızlı oluştur"""
        texts = []
        for _, row in df.iterrows():
            text = f"Tarih:{row.get('SUBSCRIPTION_DATE', 'N/A')}, İlçe:{row.get('SUBSCRIPTION_COUNTY', 'N/A')}, Abone:{row.get('NUMBER_OF_SUBSCRIBER', 0)}"
            if 'SUBSCRIBER_DOMESTIC_FOREIGN' in row:
                text += f", Tip:{row['SUBSCRIBER_DOMESTIC_FOREIGN']}"
            texts.append(text)
        return texts
    
    def batch_encode(self, texts: List[str]) -> np.ndarray:
        """Batch halinde encoding - GPU kullanımını optimize eder"""
        print(f"🔄 Encoding {len(texts)} texts in batches of {self.batch_size}")
        start_time = time.time()
        
        # Batch processing ile encode et
        embeddings = self.model.encode(
            texts, 
            batch_size=self.batch_size,
            show_progress_bar=True,
            convert_to_numpy=True,
            normalize_embeddings=True  # Cosine similarity için optimize
        )
        
        elapsed = time.time() - start_time
        print(f"✅ Encoding completed in {elapsed:.2f}s ({len(texts)/elapsed:.1f} texts/sec)")
        return embeddings
    
    def bulk_insert_to_db(self, token: str, filename: str, texts: List[str], embeddings: np.ndarray) -> bool:
        """Bulk insert ile database'e hızlı kaydetme"""
        try:
            conn = get_connection()
            if conn is None:
                return False
            
            cur = conn.cursor()
            
            # Bulk insert için veri hazırla
            data_to_insert = [
                (token, filename, text, embedding.tolist())
                for text, embedding in zip(texts, embeddings)
            ]
            
            print(f"💾 Bulk inserting {len(data_to_insert)} records...")
            start_time = time.time()
            
            # execute_values ile bulk insert (çok daha hızlı)
            psycopg2.extras.execute_values(
                cur,
                """
                INSERT INTO documents (token, filename, content, embedding)
                VALUES %s
                """,
                data_to_insert,
                template=None,
                page_size=1000  # 1000'er kayıt halinde
            )
            
            conn.commit()
            conn.close()
            
            elapsed = time.time() - start_time
            print(f"✅ {len(data_to_insert)} kayıt {elapsed:.2f}s'de kaydedildi ({len(data_to_insert)/elapsed:.1f} records/sec)")
            return True
            
        except Exception as e:
            print(f"❌ Bulk insert hatası: {e}")
            if 'conn' in locals():
                conn.close()
            return False

# Global processor instance
processor = EmbeddingProcessor()

async def save_to_postgres_async(df, filename: str) -> Optional[str]:
    """Asenkron embedding ve kaydetme"""
    token = str(uuid.uuid4())
    
    print(f"🚀 Starting async embedding process for {len(df)} rows")
    start_time = time.time()
    
    try:
        # 1. Metinleri oluştur (hızlı)
        texts = processor.create_texts_from_df(df)
        if not texts:
            return None
        
        # 2. Embedding'leri asenkron oluştur
        loop = asyncio.get_event_loop()
        embeddings = await loop.run_in_executor(
            processor.executor, 
            processor.batch_encode, 
            texts
        )
        
        # 3. Database'e asenkron kaydet
        success = await loop.run_in_executor(
            processor.executor,
            processor.bulk_insert_to_db,
            token, filename, texts, embeddings
        )
        
        if success:
            total_time = time.time() - start_time
            print(f"🎉 Total process completed in {total_time:.2f}s (token: {token})")
            return token
        else:
            return None
            
    except Exception as e:
        print(f"❌ Async embedding hatası: {e}")
        return None

# Senkron wrapper (geriye uyumluluk için)
def save_to_postgres_fast(df, filename: str) -> Optional[str]:
    """Hızlandırılmış senkron versiyon"""
    return asyncio.run(save_to_postgres_async(df, filename))

# Retrieval - optimize edilmiş
async def retrieve_context_async(token: str, question: str, top_k: int = None) -> str:
    """Asenkron retrieval"""
    try:
        # Soruyu encode et
        loop = asyncio.get_event_loop()
        q_emb = await loop.run_in_executor(
            processor.executor,
            lambda: processor.model.encode([question])[0]
        )
        
        # Database sorgusu
        def db_query():
            conn = get_connection()
            if conn is None:
                return []
            
            cur = conn.cursor()
            
            # Eğer top_k None ise tüm veriyi al, değilse limit uygula
            if top_k is None:
                cur.execute("""
                    SELECT content FROM documents
                    WHERE token = %s
                    ORDER BY created_at
                """, (token,))
            else:
                cur.execute("""
                    SELECT content FROM documents
                    WHERE token = %s
                    ORDER BY embedding <=> %s::vector 
                    LIMIT %s
                """, (token, q_emb.tolist(), top_k))
            
            rows = cur.fetchall()
            conn.close()
            return rows
        
        rows = await loop.run_in_executor(processor.executor, db_query)
        
        if not rows:
            return f"Token '{token}' için veri bulunamadı"
            
        return "\n".join([r[0] for r in rows])
        
    except Exception as e:
        print(f"❌ Async retrieval hatası: {e}")
        return f"Arama hatası: {str(e)}"

# Gemini fonksiyonları - async
async def generate_summary_pg_async(token: str) -> str:
    """Asenkron AI özet - Akıllı veri özetleme ile"""
    
    # Tüm veriyi al ama akıllıca özetle
    def get_data_summary():
        conn = get_connection()
        if conn is None:
            return "Database bağlantısı yok"
        
        cur = conn.cursor()
        
        # Basit istatistikler al (hızlı)
        cur.execute("""
            SELECT 
                COUNT(*) as toplam_kayit,
                MIN(created_at) as min_tarih,
                MAX(created_at) as max_tarih
            FROM documents 
            WHERE token = %s
        """, (token,))
        
        stats = cur.fetchone()
        
        # Sample veri al (ilk 100 kayıt)
        cur.execute("""
            SELECT content
            FROM documents 
            WHERE token = %s
            ORDER BY created_at
            LIMIT 100
        """, (token,))
        
        sample_data = cur.fetchall()
        conn.close()
        
        # Sample veriden bilgi çıkar
        ilce_list = []
        abone_toplam = 0
        
        for row in sample_data:
            content = row[0]
            # Basit string parsing
            if 'İlçe:' in content and 'Abone:' in content:
                try:
                    ilce = content.split('İlçe:')[1].split(',')[0].strip()
                    abone_str = content.split('Abone:')[1].split(',')[0].strip()
                    abone = int(abone_str)
                    ilce_list.append(ilce)
                    abone_toplam += abone
                except:
                    pass
        
        # Özet metni oluştur (kısa ve öz)
        unique_ilceler = list(set(ilce_list))
        
        summary = f"""
GENERAL STATISTICS:
- Total Records: {stats[0]:,}
- Record Date Range: {stats[1]} - {stats[2]}
- Total Sample Subscribers: {abone_toplam:,}
- Identified Districts: {len(unique_ilceler)}

SAMPLE DISTRICTS:
{', '.join(unique_ilceler[:10])}

DATA SOURCE:
Istanbul Metropolitan Municipality Wi-Fi subscriber data - {stats[0]:,} log analysis
"""
        
        return summary
    
    loop = asyncio.get_event_loop()
    data_summary = await loop.run_in_executor(processor.executor, get_data_summary)
    
    prompt = f"""
Istanbul Metropolitan Municipality Wi-Fi subscriber data summary:

{data_summary}

Conduct a brief analysis:
1. General situation
2. Prominent districts  
3. Key findings
"""
    
    def generate_with_retry():
        import time
        
        for attempt in range(3):
            try:
                gemini_model = genai.GenerativeModel("models/gemini-2.5-flash")
                response = gemini_model.generate_content(prompt)
                return response.text.strip()
            except Exception as e:
                if "429" in str(e) and attempt < 2:
                    print(f"API limit, {15} saniye bekleniyor...")
                    time.sleep(15)
                    continue
                elif "504" in str(e) and attempt < 2:
                    print(f"Timeout, tekrar deneniyor...")
                    time.sleep(5)
                    continue
                else:
                    return f"AI analiz hatası: {str(e)}"
        
        return "AI analizi şu anda kullanılamıyor, lütfen daha sonra tekrar deneyin."
    
    return await loop.run_in_executor(processor.executor, generate_with_retry)

async def generate_actions_pg_async(token: str, kpi: dict) -> List[str]:
    """Asenkron AI önerileri - Optimize edilmiş"""
    
    # KPI'dan basit özet çıkar (retrieval yerine)
    def get_simple_data_summary():
        conn = get_connection()
        if conn is None:
            return "Database bağlantısı yok"
        
        cur = conn.cursor()
        
        # Basit istatistikler
        cur.execute("""
            SELECT COUNT(*) as total
            FROM documents 
            WHERE token = %s
        """, (token,))
        
        total = cur.fetchone()[0]
        
        # İlk 20 kayıt al (hızlı)
        cur.execute("""
            SELECT content
            FROM documents 
            WHERE token = %s
            ORDER BY created_at
            LIMIT 20
        """, (token,))
        
        sample_rows = cur.fetchall()
        conn.close()
        
        # Basit analiz
        ilce_count = {}
        for row in sample_rows:
            content = row[0]
            if 'İlçe:' in content:
                try:
                    ilce = content.split('İlçe:')[1].split(',')[0].strip()
                    ilce_count[ilce] = ilce_count.get(ilce, 0) + 1
                except:
                    pass
        
        top_ilceler = sorted(ilce_count.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return f"Toplam {total:,} kayıt. Öne çıkan ilçeler: {', '.join([f'{ilce}({count})' for ilce, count in top_ilceler])}"
    
    loop = asyncio.get_event_loop()
    data_summary = await loop.run_in_executor(processor.executor, get_simple_data_summary)
    
    prompt = f"""
Istanbul Metropolitan Municipality Wi-Fi subscriber data:
{data_summary}

KPI Information:
{str(kpi)[:200]}...

Write 3 short suggestions:
1. By district
2. Service development
3. Strategy proposal
"""
    
    def generate_with_retry():
        import time
        
        for attempt in range(3):
            try:
                gemini_model = genai.GenerativeModel("models/gemini-2.5-flash")
                response = gemini_model.generate_content(prompt)
                actions_raw = response.text.strip()
                actions = [a.strip("-• ") for a in actions_raw.split("\n") if a.strip() and len(a.strip()) > 10]
                return actions[:5]  # Max 5 öneri
            except Exception as e:
                if "429" in str(e) and attempt < 2:
                    print(f"API limit, {20} saniye bekleniyor...")
                    time.sleep(20)
                    continue
                else:
                    return [f"AI önerisi hatası: {str(e)[:100]}..."]
        
        return ["AI önerileri şu anda kullanılamıyor, lütfen daha sonra tekrar deneyin."]
    
    return await loop.run_in_executor(processor.executor, generate_with_retry)

# Senkron wrapper'lar
def retrieve_context_fast(token: str, question: str, top_k: int = 10) -> str:
    return asyncio.run(retrieve_context_async(token, question, top_k))

def generate_summary_pg_fast(token: str) -> str:
    return asyncio.run(generate_summary_pg_async(token))

def generate_actions_pg_fast(token: str, kpi: dict) -> List[str]:
    return asyncio.run(generate_actions_pg_async(token, kpi))
