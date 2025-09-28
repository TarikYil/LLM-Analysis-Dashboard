FROM python:3.10-slim

# Sistem bağımlılıkları
RUN apt-get update && apt-get install -y curl gcc g++ patchelf && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Requirements
COPY requirements.txt ./

RUN pip install --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt 


# libtorch_cpu.so için execstack yerine patchelf kullan
RUN patchelf --clear-execstack /usr/local/lib/python3.10/site-packages/torch/lib/libtorch_cpu.so || true

COPY . .

EXPOSE 5000
ENV PYTHONPATH=/app

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/ || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5000", "--workers", "1"]
