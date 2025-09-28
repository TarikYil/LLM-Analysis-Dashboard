import uuid
import os
import numpy as np
from sentence_transformers import SentenceTransformer
import google.generativeai as genai
import asyncio
import concurrent.futures
from typing import List, Optional
import torch
import psycopg2
import psycopg2.extras
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
import time
import multiprocessing as mp
from functools import partial
import asyncpg
import json

# GPU desteği kontrol et
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"🚀 Ultra Fast Embedding device: {device}")

# Model yükleme (global)
model = None
def get_model(model_name: str = "fastest"):
    global model
    if model is None:
        FAST_MODELS = {
            "fastest": "all-MiniLM-L6-v2",
            "balanced": "all-mpnet-base-v2",
            "multilingual": "paraphrase-multilingual-MiniLM-L12-v2"
        }
        model_path = FAST_MODELS.get(model_name, FAST_MODELS["fastest"])
        print(f"📥 Loading ultra fast model: {model_path}")
        model = SentenceTransformer(model_path, device=device)
        print(f"✅ Ultra fast model loaded on {device}")
    return model

# Gemini ayarı
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Database URL
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://service_user:service_pass123@localhost:5432/service_ai")

class UltraFastEmbeddingProcessor:
    def __init__(self, 
                 model_name: str = "fastest", 
                 batch_size: int = 64,  # Daha büyük batch
                 db_workers: int = 8,   # Paralel DB worker
                 db_batch_size: int = 5000):  # Büyük DB batch
        self.model = get_model(model_name)
        self.batch_size = batch_size
        self.db_workers = db_workers
        self.db_batch_size = db_batch_size
        self.executor = ThreadPoolExecutor(max_workers=db_workers)
    
    def create_texts_from_df(self, df) -> List[str]:
        """DataFrame'den metinleri hızlı oluştur"""
        texts = []
        for _, row in df.iterrows():
            text = f"Tarih:{row.get('SUBSCRIPTION_DATE', 'N/A')}, İlçe:{row.get('SUBSCRIPTION_COUNTY', 'N/A')}, Abone:{row.get('NUMBER_OF_SUBSCRIBER', 0)}"
            if 'SUBSCRIBER_DOMESTIC_FOREIGN' in row:
                text += f", Tip:{row['SUBSCRIBER_DOMESTIC_FOREIGN']}"
            texts.append(text)
        return texts
    
    def ultra_fast_encode(self, texts: List[str]) -> np.ndarray:
        """Ultra hızlı GPU encoding"""
        print(f"🚀 Ultra fast encoding {len(texts)} texts in batches of {self.batch_size}")
        start_time = time.time()
        
        embeddings = self.model.encode(
            texts, 
            batch_size=self.batch_size,
            show_progress_bar=True,
            convert_to_numpy=True,
            normalize_embeddings=True,
            device=device
        )
        
        elapsed = time.time() - start_time
        print(f"⚡ Ultra fast encoding completed in {elapsed:.2f}s ({len(texts)/elapsed:.1f} texts/sec)")
        return embeddings

def db_worker_insert(args):
    """Paralel database worker fonksiyonu"""
    worker_id, data_chunk, token, filename = args
    
    try:
        # Her worker kendi connection'ı kullanır
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        start_time = time.time()
        
        # Çok hızlı bulk insert
        psycopg2.extras.execute_values(
            cur,
            """
            INSERT INTO documents (token, filename, content, embedding)
            VALUES %s
            """,
            data_chunk,
            template=None,
            page_size=2000,  # Büyük page size
            fetch=False  # Return değeri almıyoruz (daha hızlı)
        )
        
        conn.commit()
        conn.close()
        
        elapsed = time.time() - start_time
        speed = len(data_chunk) / elapsed
        print(f"💾 Worker {worker_id}: {len(data_chunk)} kayıt {elapsed:.2f}s'de kaydedildi ({speed:.0f} records/sec)")
        
        return len(data_chunk)
        
    except Exception as e:
        print(f"❌ Worker {worker_id} hatası: {e}")
        if 'conn' in locals():
            conn.close()
        return 0

class UltraFastDatabaseInserter:
    def __init__(self, workers: int = 8, chunk_size: int = 5000):
        self.workers = workers
        self.chunk_size = chunk_size
    
    def parallel_bulk_insert(self, token: str, filename: str, texts: List[str], embeddings: np.ndarray) -> bool:
        """Paralel bulk insert ile ultra hızlı kaydetme"""
        try:
            print(f"🔥 Ultra fast parallel insert: {len(texts)} kayıt, {self.workers} worker")
            start_time = time.time()
            
            # Veriyi chunk'lara böl
            data_chunks = []
            for i in range(0, len(texts), self.chunk_size):
                chunk_texts = texts[i:i+self.chunk_size]
                chunk_embeddings = embeddings[i:i+self.chunk_size]
                
                chunk_data = [
                    (token, filename, text, embedding.tolist())
                    for text, embedding in zip(chunk_texts, chunk_embeddings)
                ]
                data_chunks.append(chunk_data)
            
            print(f"📊 {len(data_chunks)} chunk oluşturuldu, chunk başına ~{self.chunk_size} kayıt")
            
            # Paralel işleme için worker argümanları hazırla
            worker_args = [
                (i, chunk, token, filename) 
                for i, chunk in enumerate(data_chunks)
            ]
            
            # ProcessPoolExecutor ile paralel insert
            with ProcessPoolExecutor(max_workers=self.workers) as executor:
                results = list(executor.map(db_worker_insert, worker_args))
            
            total_inserted = sum(results)
            elapsed = time.time() - start_time
            speed = total_inserted / elapsed
            
            print(f"🎉 Ultra fast insert tamamlandı!")
            print(f"📈 {total_inserted} kayıt {elapsed:.2f}s'de kaydedildi")
            print(f"⚡ Ortalama hız: {speed:.0f} records/sec")
            
            return total_inserted == len(texts)
            
        except Exception as e:
            print(f"❌ Ultra fast insert hatası: {e}")
            return False

# Global processor instances
ultra_processor = UltraFastEmbeddingProcessor()
ultra_inserter = UltraFastDatabaseInserter()

async def ultra_fast_save_to_postgres(df, filename: str) -> Optional[str]:
    """Ultra hızlı asenkron embedding ve kaydetme"""
    token = str(uuid.uuid4())
    
    print(f"🚀 Ultra Fast: {len(df)} satır işleniyor")
    total_start = time.time()
    
    try:
        # 1. Metinleri oluştur (hızlı)
        texts = ultra_processor.create_texts_from_df(df)
        if not texts:
            return None
        
        # 2. GPU ile ultra hızlı embedding
        loop = asyncio.get_event_loop()
        embeddings = await loop.run_in_executor(
            ultra_processor.executor, 
            ultra_processor.ultra_fast_encode, 
            texts
        )
        
        # 3. Paralel ultra hızlı database insert
        success = await loop.run_in_executor(
            ultra_processor.executor,
            ultra_inserter.parallel_bulk_insert,
            token, filename, texts, embeddings
        )
        
        if success:
            total_time = time.time() - total_start
            total_speed = len(texts) / total_time
            print(f"🎯 ULTRA FAST TOPLAM: {len(texts)} kayıt {total_time:.2f}s'de tamamlandı")
            print(f"🏆 Genel hız: {total_speed:.0f} kayıt/saniye")
            print(f"🎫 Token: {token}")
            return token
        else:
            return None
            
    except Exception as e:
        print(f"❌ Ultra fast process hatası: {e}")
        return None

# AsyncPG ile daha hızlı retrieval (opsiyonel)
async def ultra_fast_retrieve_context(token: str, question: str, top_k: int = 10) -> str:
    """Ultra hızlı asenkron retrieval"""
    try:
        # Soruyu encode et
        loop = asyncio.get_event_loop()
        q_emb = await loop.run_in_executor(
            ultra_processor.executor,
            lambda: ultra_processor.model.encode([question])[0]
        )
        
        # AsyncPG ile hızlı query
        conn = await asyncpg.connect(DATABASE_URL)
        
        rows = await conn.fetch("""
            SELECT content FROM documents
            WHERE token = $1
            ORDER BY embedding <=> $2::vector 
            LIMIT $3
        """, token, q_emb.tolist(), top_k)
        
        await conn.close()
        
        if not rows:
            return f"Token '{token}' için veri bulunamadı"
            
        return "\n".join([row['content'] for row in rows])
        
    except Exception as e:
        print(f"❌ Ultra fast retrieval hatası: {e}")
        return f"Arama hatası: {str(e)}"

# Senkron wrapper'lar
def ultra_fast_save_sync(df, filename: str) -> Optional[str]:
    return asyncio.run(ultra_fast_save_to_postgres(df, filename))

def ultra_fast_retrieve_sync(token: str, question: str, top_k: int = 10) -> str:
    return asyncio.run(ultra_fast_retrieve_context(token, question, top_k))
