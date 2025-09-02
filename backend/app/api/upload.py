from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse
import os
import tempfile
from typing import Optional
from app.services.data_service import data_service
from app.models.data_models import UploadResponse, ErrorResponse
from app.core.config import settings

router = APIRouter()

@router.post("/upload", response_model=UploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    file_type: Optional[str] = Form(None)
):
    """
    Endpoint per il caricamento di file CSV/Excel
    """
    try:
        # Validazione file
        if not file.filename:
            raise HTTPException(status_code=400, detail="Nome file mancante")
        
        # Estrazione estensione
        file_extension = os.path.splitext(file.filename)[1].lower()
        
        # Validazione estensione
        if file_extension not in settings.allowed_extensions:
            raise HTTPException(
                status_code=400, 
                detail=f"Estensione non supportata. Supportate: {', '.join(settings.allowed_extensions)}"
            )
        
        # Validazione dimensione file
        if file.size and file.size > settings.max_file_size:
            raise HTTPException(
                status_code=400,
                detail=f"File troppo grande. Dimensione massima: {settings.max_file_size // (1024*1024)}MB"
            )
        
        # Determinazione tipo file
        if not file_type:
            if file_extension == '.csv':
                file_type = 'csv'
            elif file_extension == '.xls':
                file_type = 'xls'
            elif file_extension == '.xlsx':
                file_type = 'xlsx'
        
        # Creazione file temporaneo
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
            # Lettura contenuto file
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        try:
            # Processing file tramite servizio
            result = data_service.upload_file(temp_file_path, file_type)
            
            if result.get("success"):
                return UploadResponse(
                    success=True,
                    message="File caricato con successo",
                    file_id=result.get("file_id"),
                    total_rows=result.get("total_rows"),
                    columns=result.get("columns"),
                    preview_data=result.get("preview_data"),
                    original_columns=result.get("original_columns"),
                    column_mapping=result.get("column_mapping")
                )
            else:
                raise HTTPException(
                    status_code=400,
                    detail=f"Errore nel processing del file: {result.get('error')}"
                )
                
        finally:
            # Pulizia file temporaneo
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Errore interno del server: {str(e)}"
        )

@router.delete("/upload")
async def clear_uploaded_data():
    """
    Pulisce i dati caricati
    """
    try:
        data_service.clear_data()
        return JSONResponse(
            content={"success": True, "message": "Dati puliti con successo"},
            status_code=200
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Errore nella pulizia dei dati: {str(e)}"
        )
