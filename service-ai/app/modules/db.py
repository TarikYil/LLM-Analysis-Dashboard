import os
import psycopg2
from pgvector.psycopg2 import register_vector

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://service_user:service_pass123@localhost:5432/service_ai")

def get_connection():
    """PostgreSQL bağlantısı oluştur ve pgvector extension'ı kaydet"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        # pgvector extension'ı kaydet
        register_vector(conn)
        return conn
    except psycopg2.OperationalError as e:
        print(f"Database bağlantı hatası: {e}")
        print("PostgreSQL çalışır durumda değil veya DATABASE_URL yanlış")
        return None
    except Exception as e:
        print(f"Beklenmeyen hata: {e}")
        return None

def init_database():
    """Veritabanını ve tabloları oluştur"""
    conn = get_connection()
    if conn is None:
        return False
    
    try:
        cur = conn.cursor()
        
        # pgvector extension'ı etkinleştir
        cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")
        
        # documents tablosunu oluştur
        cur.execute("""
            CREATE TABLE IF NOT EXISTS documents (
                id SERIAL PRIMARY KEY,
                token VARCHAR(255) NOT NULL,
                filename VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                embedding vector(384),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        # Index oluştur (hızlı arama için)
        cur.execute("""
            CREATE INDEX IF NOT EXISTS documents_embedding_idx 
            ON documents USING ivfflat (embedding vector_cosine_ops) 
            WITH (lists = 100);
        """)
        
        conn.commit()
        conn.close()
        print("✅ Database tabloları başarıyla oluşturuldu")
        return True
        
    except Exception as e:
        print(f"❌ Database oluşturma hatası: {e}")
        conn.close()
        return False
