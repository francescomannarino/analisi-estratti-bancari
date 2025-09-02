import React, { useState, useEffect } from 'react';
import { Search, Calendar, Filter, Download, X, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../utils/cn';

const FiltersPanel = ({ filters, onFiltersChange, columns, onExport }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  const [selectedColumns, setSelectedColumns] = useState(filters.columns || []);

  // Sincronizza filtri locali quando cambiano quelli esterni
  useEffect(() => {
    setLocalFilters(filters);
    setSelectedColumns(filters.columns || []);
  }, [filters]);

  // Applica filtri con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (JSON.stringify(localFilters) !== JSON.stringify(filters)) {
        onFiltersChange(localFilters);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localFilters, filters, onFiltersChange]);

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleColumnToggle = (column) => {
    setSelectedColumns(prev => {
      if (prev.includes(column)) {
        return prev.filter(c => c !== column);
      } else {
        return [...prev, column];
      }
    });
  };

  const handleColumnChange = () => {
    setLocalFilters(prev => ({ ...prev, columns: selectedColumns }));
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      dateFrom: '',
      dateTo: '',
      columns: [],
      page: 1,
      pageSize: filters.pageSize,
      sortBy: null,
      sortOrder: 'asc'
    };
    setLocalFilters(clearedFilters);
    setSelectedColumns([]);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = filters.search || filters.dateFrom || filters.dateTo || (filters.columns && filters.columns.length > 0);

  return (
    <div className="p-4">
      {/* Header filtri */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Filtri e Ricerca
          </h3>
          {hasActiveFilters && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
              Attivi
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="btn-outline text-xs px-3 py-1"
            >
              <X className="h-3 w-3 mr-1" />
              Pulisci
            </button>
          )}
        </div>
      </div>

      {/* Filtri espandibili */}
      <div className={cn(
        "space-y-4 transition-all duration-200 overflow-hidden",
        isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      )}>
        {/* Ricerca globale */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ricerca Globale
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca in tutti i campi..."
              value={localFilters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        {/* Filtri date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data Inizio
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={localFilters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data Fine
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={localFilters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
        </div>

        {/* Selezione colonne */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Colonne da Visualizzare
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
            {columns.map((column) => (
              <label key={column} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedColumns.includes(column)}
                  onChange={() => handleColumnToggle(column)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                  {column}
                </span>
              </label>
            ))}
          </div>
          <button
            onClick={handleColumnChange}
            className="mt-2 btn-secondary text-xs px-3 py-1"
          >
            Applica Selezione Colonne
          </button>
        </div>

        {/* Controlli export */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                Esporta Dati Filtrati
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Scarica i risultati in formato CSV o Excel
              </p>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => onExport('csv')}
                className="btn-outline text-xs px-3 py-1"
              >
                <Download className="h-3 w-3 mr-1" />
                CSV
              </button>
              <button
                onClick={() => onExport('xlsx')}
                className="btn-outline text-xs px-3 py-1"
              >
                <Download className="h-3 w-3 mr-1" />
                Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filtri attivi compatti */}
      {!isExpanded && hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-2">
          {filters.search && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Ricerca: "{filters.search}"
            </span>
          )}
          {filters.dateFrom && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Da: {filters.dateFrom}
            </span>
          )}
          {filters.dateTo && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              A: {filters.dateTo}
            </span>
          )}
          {filters.columns && filters.columns.length > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              {filters.columns.length} colonne selezionate
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FiltersPanel;
