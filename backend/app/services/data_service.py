import pandas as pd
import sqlite3
import os
import uuid
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
import json
from app.core.config import settings
from app.models.data_models import DataFilter, ColumnInfo

class DataService:
    def __init__(self):
        self.db_path = settings.temp_db_path
        self.current_data: Optional[pd.DataFrame] = None
        self.current_file_id: Optional[str] = None
        self._original_columns: Optional[List[str]] = None
        self._init_db()
    
    def _init_db(self):
        """Inizializza il database SQLite temporaneo"""
        conn = sqlite3.connect(self.db_path)
        conn.close()
    
    def upload_file(self, file_path: str, file_type: str) -> Dict[str, Any]:
        """Carica e processa un file CSV/Excel"""
        try:
            # Lettura file in base al tipo
            if file_type.lower() == 'csv':
                df = pd.read_csv(file_path, encoding='utf-8')
            elif file_type.lower() in ['xls', 'xlsx']:
                df = pd.read_excel(file_path)
            else:
                raise ValueError(f"Tipo file non supportato: {file_type}")
            
            # Salva i nomi delle colonne originali prima della pulizia
            self._original_columns = df.columns.tolist()
            
            # Pulizia dati base
            df = self._clean_dataframe(df)
            
            # Generazione ID univoco per la sessione
            file_id = str(uuid.uuid4())
            
            # Salvataggio in SQLite per query efficienti
            self._save_to_sqlite(df, file_id)
            
            # Aggiornamento stato corrente
            self.current_data = df
            self.current_file_id = file_id
            
            # Generazione preview (prime 10 righe)
            preview_data = df.head(10).to_dict('records')
            
            return {
                "success": True,
                "file_id": file_id,
                "total_rows": len(df),
                "columns": df.columns.tolist(),
                "preview_data": preview_data,
                "original_columns": self._original_columns,
                "column_mapping": self.get_column_mapping()
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def _clean_dataframe(self, df: pd.DataFrame) -> pd.DataFrame:
        """Pulisce e normalizza il dataframe"""
        # Rimozione righe completamente vuote
        df = df.dropna(how='all')
        
        # Pulizia nomi colonne - rimuove caratteri problematici per SQLite
        def clean_column_name(col_name):
            # Rimuove caratteri non validi per SQLite
            import re
            # Sostituisce spazi, punti, due punti e altri caratteri problematici con underscore
            cleaned = re.sub(r'[^a-zA-Z0-9_]', '_', str(col_name).strip())
            # Rimuove underscore multipli consecutivi
            cleaned = re.sub(r'_+', '_', cleaned)
            # Rimuove underscore iniziali e finali
            cleaned = cleaned.strip('_')
            # Assicura che il nome non inizi con un numero
            if cleaned and cleaned[0].isdigit():
                cleaned = 'col_' + cleaned
            # Se il nome è vuoto, usa un nome di default
            if not cleaned:
                cleaned = 'column'
            return cleaned.lower()
        
        # Applica la pulizia ai nomi delle colonne
        df.columns = [clean_column_name(col) for col in df.columns]
        
        # Conversione date se presenti
        date_columns = []
        for col in df.columns:
            if any(keyword in col.lower() for keyword in ['data', 'date', 'giorno']):
                date_columns.append(col)
        
        for col in date_columns:
            try:
                df[col] = pd.to_datetime(df[col], errors='coerce')
            except:
                pass
        
        # Conversione importi se presenti
        amount_columns = []
        for col in df.columns:
            if any(keyword in col.lower() for keyword in ['importo', 'amount', 'euro', '€']):
                amount_columns.append(col)
        
        for col in amount_columns:
            try:
                df[col] = pd.to_numeric(df[col], errors='coerce')
            except:
                pass
        
        return df
    
    def _save_to_sqlite(self, df: pd.DataFrame, file_id: str):
        """Salva il dataframe in SQLite per query efficienti"""
        conn = sqlite3.connect(self.db_path)
        
        # Creazione tabella con nome univoco
        table_name = f"data_{file_id.replace('-', '_')}"
        
        # Salvataggio dataframe
        df.to_sql(table_name, conn, if_exists='replace', index=False)
        
        # Creazione indici per performance
        for col in df.columns:
            if df[col].dtype in ['object', 'datetime64[ns]']:
                try:
                    # Usa il nome della colonna pulito per l'indice
                    safe_col_name = col.replace('-', '_').replace(' ', '_')
                    index_name = f"idx_{table_name}_{safe_col_name}"
                    conn.execute(f"CREATE INDEX IF NOT EXISTS {index_name} ON {table_name}({col})")
                except Exception as e:
                    # Se la creazione dell'indice fallisce, continua senza crearlo
                    print(f"Impossibile creare indice per colonna {col}: {e}")
                    continue
        
        conn.close()
    
    def get_data(self, filters: DataFilter) -> Dict[str, Any]:
        """Recupera dati con filtri applicati"""
        if self.current_data is None:
            return {"error": "Nessun file caricato"}
        
        try:
            # Applicazione filtri
            filtered_df = self._apply_filters(self.current_data, filters)
            
            # Ordinamento
            if filters.sort_by and filters.sort_by in filtered_df.columns:
                filtered_df = filtered_df.sort_values(
                    by=filters.sort_by, 
                    ascending=filters.sort_order == 'asc'
                )
            
            # Paginazione
            total_rows = len(filtered_df)
            total_pages = (total_rows + filters.page_size - 1) // filters.page_size
            
            start_idx = (filters.page - 1) * filters.page_size
            end_idx = start_idx + filters.page_size
            
            page_data = filtered_df.iloc[start_idx:end_idx]
            
            return {
                "data": page_data.to_dict('records'),
                "total_rows": total_rows,
                "total_pages": total_pages,
                "current_page": filters.page,
                "page_size": filters.page_size,
                "columns": self.current_data.columns.tolist(),
                "filters_applied": filters
            }
            
        except Exception as e:
            return {"error": str(e)}
    
    def _apply_filters(self, df: pd.DataFrame, filters: DataFilter) -> pd.DataFrame:
        """Applica i filtri al dataframe"""
        filtered_df = df.copy()
        
        # Filtro ricerca globale
        if filters.search:
            search_mask = pd.DataFrame([filtered_df[col].astype(str).str.contains(
                filters.search, case=False, na=False
            ) for col in filtered_df.columns]).any()
            filtered_df = filtered_df[search_mask]
        
        # Filtro date
        if filters.date_from:
            date_columns = [col for col in filtered_df.columns if pd.api.types.is_datetime64_any_dtype(filtered_df[col])]
            if date_columns:
                date_mask = filtered_df[date_columns[0]] >= filters.date_from
                filtered_df = filtered_df[date_mask]
        
        if filters.date_to:
            date_columns = [col for col in filtered_df.columns if pd.api.types.is_datetime64_any_dtype(filtered_df[col])]
            if date_columns:
                date_mask = filtered_df[date_columns[0]] <= filters.date_to
                filtered_df = filtered_df[date_mask]
        
        return filtered_df
    
    def get_columns_info(self) -> List[ColumnInfo]:
        """Recupera informazioni dettagliate sulle colonne"""
        if self.current_data is None:
            return []
        
        columns_info = []
        for col in self.current_data.columns:
            col_data = self.current_data[col]
            
            # Tipo di dato
            dtype = str(col_data.dtype)
            
            # Valori di esempio (primi 5 non nulli)
            sample_values = col_data.dropna().head(5).tolist()
            
            # Conteggio valori null
            null_count = col_data.isnull().sum()
            
            # Conteggio valori unici
            unique_count = col_data.nunique()
            
            columns_info.append(ColumnInfo(
                name=col,
                type=dtype,
                sample_values=sample_values,
                null_count=int(null_count),
                unique_count=int(unique_count)
            ))
        
        return columns_info
    
    def get_column_mapping(self) -> Dict[str, str]:
        """Restituisce la mappatura tra nomi colonne originali e puliti"""
        if not hasattr(self, '_original_columns') or self._original_columns is None:
            return {}
        
        mapping = {}
        for i, original_name in enumerate(self._original_columns):
            if i < len(self.current_data.columns):
                mapping[original_name] = self.current_data.columns[i]
        
        return mapping
    
    def export_data(self, filters: DataFilter, format: str = "csv") -> str:
        """Esporta i dati filtrati"""
        if self.current_data is None:
            raise ValueError("Nessun file caricato")
        
        # Applicazione filtri
        filtered_df = self._apply_filters(self.current_data, filters)
        
        # Generazione nome file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"export_{timestamp}.{format}"
        filepath = os.path.join(settings.upload_folder, filename)
        
        # Esportazione
        if format.lower() == "csv":
            filtered_df.to_csv(filepath, index=False, encoding='utf-8')
        elif format.lower() == "xlsx":
            filtered_df.to_excel(filepath, index=False)
        
        return filepath
    
    def clear_data(self):
        """Pulisce i dati correnti"""
        self.current_data = None
        self.current_file_id = None
        self._original_columns = None
        
        # Rimozione database temporaneo
        if os.path.exists(self.db_path):
            os.remove(self.db_path)
            self._init_db()

# Istanza globale del servizio
data_service = DataService()
