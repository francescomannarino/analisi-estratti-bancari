from typing import List
import os

class Settings:
    # Configurazione base
    app_name: str = "Analisi Estratti Bancari"
    debug: bool = True
    version: str = "1.0.0"
    
    # Configurazione server
    host: str = "0.0.0.0"
    port: int = 8000
    
    # Configurazione CORS
    allowed_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173", 
        "http://127.0.0.1:3000"
    ]
    
    # Configurazione upload
    max_file_size: int = 100 * 1024 * 1024  # 100MB
    allowed_extensions: List[str] = [".csv", ".xls", ".xlsx"]
    upload_folder: str = "uploads"
    
    # Configurazione database temporaneo
    temp_db_path: str = "temp_data.db"
    
    # Configurazione paginazione
    default_page_size: int = 100
    max_page_size: int = 1000
    
    # Configurazione cache
    cache_ttl: int = 300  # 5 minuti

settings = Settings()

# Creazione cartella upload se non esiste
os.makedirs(settings.upload_folder, exist_ok=True)
