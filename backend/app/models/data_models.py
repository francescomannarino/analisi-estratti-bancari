from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from enum import Enum

class FileType(str, Enum):
    CSV = "csv"
    XLS = "xls"
    XLSX = "xlsx"

class UploadResponse(BaseModel):
    success: bool
    message: str
    file_id: Optional[str] = None
    total_rows: Optional[int] = None
    columns: Optional[List[str]] = None
    preview_data: Optional[List[Dict[str, Any]]] = None
    original_columns: Optional[List[str]] = None
    column_mapping: Optional[Dict[str, str]] = None

class DataFilter(BaseModel):
    search: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    columns: Optional[List[str]] = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=100, ge=1, le=1000)
    sort_by: Optional[str] = None
    sort_order: str = Field(default="asc", pattern="^(asc|desc)$")

class DataResponse(BaseModel):
    data: List[Dict[str, Any]]
    total_rows: int
    total_pages: int
    current_page: int
    page_size: int
    columns: List[str]
    filters_applied: DataFilter

class ColumnInfo(BaseModel):
    name: str
    type: str
    sample_values: List[Any]
    null_count: int
    unique_count: int

class ColumnsResponse(BaseModel):
    columns: List[ColumnInfo]
    total_columns: int

class ExportRequest(BaseModel):
    filters: DataFilter
    format: str = Field(default="csv", pattern="^(csv|xlsx)$")

class ErrorResponse(BaseModel):
    error: str
    message: str
    details: Optional[Dict[str, Any]] = None

class SuccessResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None
