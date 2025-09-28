-- PostgreSQL initialization script for service-ai
-- This script runs when the container starts for the first time

-- Create pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create documents table for embeddings
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    embedding vector(384),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for fast similarity search
CREATE INDEX IF NOT EXISTS documents_embedding_idx 
ON documents USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- Create index for token-based queries
CREATE INDEX IF NOT EXISTS documents_token_idx ON documents(token);

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_user;

-- Insert sample data (optional)
-- INSERT INTO documents (token, filename, content, embedding) 
-- VALUES ('test-token', 'test.csv', 'Test content', '[0.1, 0.2, 0.3]'::vector);

-- Show tables
\dt

-- Show extensions
\dx
