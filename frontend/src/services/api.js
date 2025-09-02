import axios from 'axios';

// Configurazione base axios
const API_BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 secondi
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor per gestione errori
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Errore dal server
      const message = error.response.data?.detail || error.response.data?.message || 'Errore del server';
      console.error('API Error:', message);
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // Errore di rete
      console.error('Network Error:', error.request);
      return Promise.reject(new Error('Errore di connessione al server'));
    } else {
      // Altri errori
      console.error('Error:', error.message);
      return Promise.reject(error);
    }
  }
);

// Servizi API
export const apiService = {
  // Upload file
  uploadFile: async (file, fileType = null) => {
    const formData = new FormData();
    formData.append('file', file);
    if (fileType) {
      formData.append('file_type', fileType);
    }
    
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Recupero dati con filtri
  getData: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.dateFrom) params.append('date_from', filters.dateFrom);
    if (filters.dateTo) params.append('date_to', filters.dateTo);
    if (filters.columns) params.append('columns', filters.columns.join(','));
    if (filters.page) params.append('page', filters.page);
    if (filters.pageSize) params.append('page_size', filters.pageSize);
    if (filters.sortBy) params.append('sort_by', filters.sortBy);
    if (filters.sortOrder) params.append('sort_order', filters.sortOrder);
    
    const response = await api.get(`/data?${params.toString()}`);
    return response.data;
  },

  // Statistiche dati
  getDataStats: async () => {
    const response = await api.get('/data/stats');
    return response.data;
  },

  // Informazioni colonne
  getColumns: async () => {
    const response = await api.get('/columns');
    return response.data;
  },

  // Dettagli colonna specifica
  getColumnDetails: async (columnName) => {
    const response = await api.get(`/columns/${columnName}`);
    return response.data;
  },

  // Export dati
  exportData: async (filters = {}, format = 'csv') => {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.dateFrom) params.append('date_from', filters.dateFrom);
    if (filters.dateTo) params.append('date_to', filters.dateTo);
    if (filters.columns) params.append('columns', filters.columns.join(','));
    params.append('format', format);
    
    const response = await api.get(`/export?${params.toString()}`, {
      responseType: 'blob',
    });
    
    // Creazione link per download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `export_${new Date().toISOString().split('T')[0]}.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  },

  // Preview export
  getExportPreview: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.dateFrom) params.append('date_from', filters.dateFrom);
    if (filters.dateTo) params.append('date_to', filters.dateTo);
    if (filters.columns) params.append('columns', filters.columns.join(','));
    
    const response = await api.get(`/export/preview?${params.toString()}`);
    return response.data;
  },

  // Pulizia dati
  clearData: async () => {
    const response = await api.delete('/upload');
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await axios.get('http://localhost:8000/health');
    return response.data;
  },
};

export default api;
