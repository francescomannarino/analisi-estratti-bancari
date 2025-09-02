from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from app.api import upload, data, columns, export
from app.core.config import settings

app = FastAPI(
    title="Analisi Estratti Bancari API",
    description="API per l'analisi di estratti conto bancari",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurazione CORS per frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusione dei router API
app.include_router(upload.router, prefix="/api/v1", tags=["upload"])
app.include_router(data.router, prefix="/api/v1", tags=["data"])
app.include_router(columns.router, prefix="/api/v1", tags=["columns"])
app.include_router(export.router, prefix="/api/v1", tags=["export"])

@app.get("/")
async def root():
    return {"message": "Analisi Estratti Bancari API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "analisi-estratti-bancari"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
