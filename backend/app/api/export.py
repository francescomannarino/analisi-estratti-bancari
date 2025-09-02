from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import FileResponse
from typing import Optional
from datetime import datetime
import os
import pandas as pd
from app.services.data_service import data_service
from app.models.data_models import DataFilter
from app.core.config import settings

router = APIRouter()

@router.get("/export")
async def export_data(
    search: Optional[str] = Query(None, description="Ricerca globale su tutti i campi"),
    date_from: Optional[str] = Query(None, description="Data inizio (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="Data fine (YYYY-MM-DD)"),
    columns: Optional[str] = Query(None, description="Colonne specifiche separate da virgola"),
    format: str = Query("csv", regex="^(csv|xlsx)$", description="Formato export")
):
    """
    Esporta i dati filtrati in formato CSV o Excel
    """
    try:
        if data_service.current_data is None:
            raise HTTPException(
                status_code=400,
                detail="Nessun file caricato"
            )
        
        # Parsing date
        parsed_date_from = None
        parsed_date_to = None
        
        if date_from:
            try:
                parsed_date_from = datetime.fromisoformat(date_from.replace('Z', '+00:00'))
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail="Formato data non valido per date_from. Usa YYYY-MM-DD"
                )
        
        if date_to:
            try:
                parsed_date_to = datetime.fromisoformat(date_to.replace('Z', '+00:00'))
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail="Formato data non valido per date_to. Usa YYYY-MM-DD"
                )
        
        # Parsing colonne
        parsed_columns = None
        if columns:
            parsed_columns = [col.strip() for col in columns.split(',') if col.strip()]
        
        # Creazione filtro
        data_filter = DataFilter(
            search=search,
            date_from=parsed_date_from,
            date_to=parsed_date_to,
            columns=parsed_columns,
            page=1,
            page_size=1000000  # Export completo
        )
        
        # Esportazione
        try:
            export_filepath = data_service.export_data(data_filter, format)
            
            # Generazione nome file per download
            filename = os.path.basename(export_filepath)
            
            # Verifica esistenza file
            if not os.path.exists(export_filepath):
                raise HTTPException(
                    status_code=500,
                    detail="Errore nella generazione del file di export"
                )
            
            # Response con file
            return FileResponse(
                path=export_filepath,
                filename=filename,
                media_type=f"application/{format}" if format == "csv" else "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Errore nell'export: {str(e)}"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Errore interno del server: {str(e)}"
        )

@router.get("/export/preview")
async def export_preview(
    search: Optional[str] = Query(None, description="Ricerca globale su tutti i campi"),
    date_from: Optional[str] = Query(None, description="Data inizio (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="Data fine (YYYY-MM-DD)"),
    columns: Optional[str] = Query(None, description="Colonne specifiche separate da virgola")
):
    """
    Anteprima dei dati che verranno esportati
    """
    try:
        if data_service.current_data is None:
            raise HTTPException(
                status_code=400,
                detail="Nessun file caricato"
            )
        
        # Parsing date
        parsed_date_from = None
        parsed_date_to = None
        
        if date_from:
            try:
                parsed_date_from = datetime.fromisoformat(date_from.replace('Z', '+00:00'))
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail="Formato data non valido per date_from. Usa YYYY-MM-DD"
                )
        
        if date_to:
            try:
                parsed_date_to = datetime.fromisoformat(date_to.replace('Z', '+00:00'))
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail="Formato data non valido per date_to. Usa YYYY-MM-DD"
                )
        
        # Parsing colonne
        parsed_columns = None
        if columns:
            parsed_columns = [col.strip() for col in columns.split(',') if col.strip()]
        
        # Creazione filtro
        data_filter = DataFilter(
            search=search,
            date_from=parsed_date_from,
            date_to=parsed_date_to,
            columns=parsed_columns,
            page=1,
            page_size=1000000  # Export completo
        )
        
        # Applicazione filtri per preview
        filtered_df = data_service._apply_filters(data_service.current_data, data_filter)
        
        preview_info = {
            "total_rows_to_export": len(filtered_df),
            "columns_to_export": filtered_df.columns.tolist(),
            "preview_data": filtered_df.head(5).to_dict('records'),
            "estimated_file_size_mb": round(filtered_df.memory_usage(deep=True).sum() / 1024 / 1024, 2)
        }
        
        return preview_info
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Errore interno del server: {str(e)}"
        )
