from fastapi import APIRouter, HTTPException
import pandas as pd
from app.services.data_service import data_service
from app.models.data_models import ColumnsResponse, ColumnInfo

router = APIRouter()

@router.get("/columns", response_model=ColumnsResponse)
async def get_columns():
    """
    Recupera informazioni dettagliate sulle colonne dei dati caricati
    """
    try:
        if data_service.current_data is None:
            raise HTTPException(
                status_code=400,
                detail="Nessun file caricato"
            )
        
        columns_info = data_service.get_columns_info()
        
        return ColumnsResponse(
            columns=columns_info,
            total_columns=len(columns_info)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Errore interno del server: {str(e)}"
        )

@router.get("/columns/{column_name}")
async def get_column_details(column_name: str):
    """
    Recupera informazioni dettagliate su una colonna specifica
    """
    try:
        if data_service.current_data is None:
            raise HTTPException(
                status_code=400,
                detail="Nessun file caricato"
            )
        
        df = data_service.current_data
        
        if column_name not in df.columns:
            raise HTTPException(
                status_code=404,
                detail=f"Colonna '{column_name}' non trovata"
            )
        
        col_data = df[column_name]
        
        # Informazioni base
        column_info = {
            "name": column_name,
            "type": str(col_data.dtype),
            "total_rows": len(col_data),
            "null_count": int(col_data.isnull().sum()),
            "null_percentage": round((col_data.isnull().sum() / len(df)) * 100, 2),
            "unique_count": int(col_data.nunique()),
            "unique_percentage": round((col_data.nunique() / len(df)) * 100, 2)
        }
        
        # Valori di esempio
        non_null_data = col_data.dropna()
        if len(non_null_data) > 0:
            column_info["sample_values"] = non_null_data.head(10).tolist()
            column_info["last_values"] = non_null_data.tail(5).tolist()
        
        # Statistiche specifiche per tipo
        if col_data.dtype in ['int64', 'float64']:
            column_info.update({
                "min": float(col_data.min()) if not col_data.empty else None,
                "max": float(col_data.max()) if not col_data.empty else None,
                "mean": float(col_data.mean()) if not col_data.empty else None,
                "median": float(col_data.median()) if not col_data.empty else None,
                "std": float(col_data.std()) if not col_data.empty else None
            })
        elif col_data.dtype == 'object':
            # Per colonne di testo
            text_lengths = col_data.dropna().astype(str).str.len()
            if len(text_lengths) > 0:
                column_info.update({
                    "avg_text_length": float(text_lengths.mean()),
                    "min_text_length": int(text_lengths.min()),
                    "max_text_length": int(text_lengths.max())
                })
        elif col_data.dtype == 'datetime64[ns]':
            column_info.update({
                "min_date": col_data.min().isoformat() if not col_data.empty else None,
                "max_date": col_data.max().isoformat() if not col_data.empty else None,
                "date_range_days": (col_data.max() - col_data.min()).days if not col_data.empty else 0
            })
        
        return column_info
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Errore interno del server: {str(e)}"
        )
