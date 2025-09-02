from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List
from datetime import datetime
import pandas as pd
from app.services.data_service import data_service
from app.models.data_models import DataFilter, DataResponse, ErrorResponse

router = APIRouter()

@router.get("/data", response_model=DataResponse)
async def get_data(
    search: Optional[str] = Query(None, description="Ricerca globale su tutti i campi"),
    date_from: Optional[str] = Query(None, description="Data inizio (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="Data fine (YYYY-MM-DD)"),
    columns: Optional[str] = Query(None, description="Colonne specifiche separate da virgola"),
    page: int = Query(1, ge=1, description="Numero pagina"),
    page_size: int = Query(100, ge=1, le=1000, description="Dimensione pagina"),
    sort_by: Optional[str] = Query(None, description="Colonna per ordinamento"),
    sort_order: str = Query("asc", regex="^(asc|desc)$", description="Ordine ordinamento")
):
    """
    Recupera i dati con filtri applicati e paginazione
    """
    try:
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
            page=page,
            page_size=page_size,
            sort_by=sort_by,
            sort_order=sort_order
        )
        
        # Recupero dati
        result = data_service.get_data(data_filter)
        
        if "error" in result:
            raise HTTPException(
                status_code=400,
                detail=result["error"]
            )
        
        return DataResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Errore interno del server: {str(e)}"
        )

@router.get("/data/stats")
async def get_data_stats():
    """
    Recupera statistiche sui dati caricati
    """
    try:
        if data_service.current_data is None:
            raise HTTPException(
                status_code=400,
                detail="Nessun file caricato"
            )
        
        df = data_service.current_data
        
        # Statistiche base
        stats = {
            "total_rows": len(df),
            "total_columns": len(df.columns),
            "memory_usage_mb": round(df.memory_usage(deep=True).sum() / 1024 / 1024, 2),
            "columns_info": {}
        }
        
        # Informazioni per colonna
        for col in df.columns:
            col_data = df[col]
            col_stats = {
                "type": str(col_data.dtype),
                "null_count": int(col_data.isnull().sum()),
                "null_percentage": round((col_data.isnull().sum() / len(df)) * 100, 2),
                "unique_count": int(col_data.nunique()),
                "unique_percentage": round((col_data.nunique() / len(df)) * 100, 2)
            }
            
            # Statistiche specifiche per tipo
            if pd.api.types.is_numeric_dtype(col_data):
                col_stats.update({
                    "min": float(col_data.min()) if not col_data.empty else None,
                    "max": float(col_data.max()) if not col_data.empty else None,
                    "mean": float(col_data.mean()) if not col_data.empty else None,
                    "median": float(col_data.median()) if not col_data.empty else None
                })
            elif pd.api.types.is_datetime64_any_dtype(col_data):
                col_stats.update({
                    "min_date": col_data.min().isoformat() if not col_data.empty else None,
                    "max_date": col_data.max().isoformat() if not col_data.empty else None
                })
            
            stats["columns_info"][col] = col_stats
        
        return stats
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Errore interno del server: {str(e)}"
        )
