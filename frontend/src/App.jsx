import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DataTable from './components/DataTable';
import UploadArea from './components/UploadArea';
import FiltersPanel from './components/FiltersPanel';
import { apiService } from './services/api';
import { cn } from './utils/cn';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentData, setCurrentData] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    dateFrom: '',
    dateTo: '',
    columns: [],
    page: 1,
    pageSize: 100,
    sortBy: null,
    sortOrder: 'asc'
  });

  // Toggle tema dark/light
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Health check del backend
  const { data: healthStatus, error: healthError } = useQuery(
    'health',
    apiService.healthCheck,
    {
      refetchInterval: 30000, // Controlla ogni 30 secondi
      retry: 3,
      retryDelay: 5000,
    }
  );

  // Query per i dati
  const { data: dataResponse, isLoading: dataLoading, error: dataError, refetch: refetchData } = useQuery(
    ['data', filters],
    () => apiService.getData(filters),
    {
      enabled: !!currentData,
      keepPreviousData: true,
      staleTime: 30000,
    }
  );

  // Query per le statistiche
  const { data: stats, isLoading: statsLoading } = useQuery(
    ['stats'],
    apiService.getDataStats,
    {
      enabled: !!currentData,
      refetchInterval: 60000, // Aggiorna ogni minuto
    }
  );

  // Gestione upload file
  const handleFileUpload = async (file) => {
    try {
      const result = await apiService.uploadFile(file);
      if (result.success) {
        setCurrentData(result);
        setFilters(prev => ({ ...prev, page: 1 })); // Reset alla prima pagina
        toast.success('File caricato con successo!');
      }
    } catch (error) {
      toast.error(`Errore nel caricamento: ${error.message}`);
    }
  };

  // Gestione filtri
  const handleFiltersChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 })); // Reset alla prima pagina
  };

  // Gestione ordinamento
  const handleSort = (column) => {
    setFilters(prev => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Gestione paginazione
  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Gestione dimensione pagina
  const handlePageSizeChange = (newPageSize) => {
    setFilters(prev => ({ ...prev, pageSize: newPageSize, page: 1 }));
  };

  // Gestione export
  const handleExport = async (format) => {
    try {
      await apiService.exportData(filters, format);
      toast.success(`Export completato in formato ${format.toUpperCase()}`);
    } catch (error) {
      toast.error(`Errore nell'export: ${error.message}`);
    }
  };

  // Gestione pulizia dati
  const handleClearData = async () => {
    try {
      await apiService.clearData();
      setCurrentData(null);
      setFilters(prev => ({ ...prev, page: 1 }));
      toast.success('Dati puliti con successo');
    } catch (error) {
      toast.error(`Errore nella pulizia: ${error.message}`);
    }
  };

  return (
    <div className={cn(
      "min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300",
      isDarkMode ? "dark" : ""
    )}>
      {/* Header */}
      <Header 
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        healthStatus={healthStatus}
        healthError={healthError}
      />

      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentData={currentData}
          stats={stats}
          statsLoading={statsLoading}
          onClearData={handleClearData}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Upload Area */}
            {!currentData && (
              <div className="flex-1 flex items-center justify-center p-6">
                <UploadArea onFileUpload={handleFileUpload} />
              </div>
            )}

            {/* Data View */}
            {currentData && (
              <>
                {/* Filters Panel */}
                <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <FiltersPanel 
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    columns={currentData.columns}
                    onExport={handleExport}
                  />
                </div>

                {/* Data Table */}
                <div className="flex-1 overflow-hidden">
                  <DataTable 
                    data={dataResponse?.data || []}
                    columns={currentData.columns}
                    loading={dataLoading}
                    error={dataError}
                    totalRows={dataResponse?.total_rows || 0}
                    currentPage={filters.page}
                    pageSize={filters.pageSize}
                    totalPages={dataResponse?.total_pages || 0}
                    sortBy={filters.sortBy}
                    sortOrder={filters.sortOrder}
                    onSort={handleSort}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                  />
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: isDarkMode ? '#1f2937' : '#ffffff',
            color: isDarkMode ? '#f9fafb' : '#1f2937',
            border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
          },
        }}
      />
    </div>
  );
}

export default App;
