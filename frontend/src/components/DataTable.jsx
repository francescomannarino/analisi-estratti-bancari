import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '../utils/cn';

const DataTable = ({
  data,
  columns,
  loading,
  error,
  totalRows,
  currentPage,
  pageSize,
  totalPages,
  sortBy,
  sortOrder,
  onSort,
  onPageChange,
  onPageSizeChange
}) => {
  const [hoveredRow, setHoveredRow] = useState(null);

  // Formatta il valore della cella
  const formatCellValue = (value, columnName) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">-</span>;
    }

    // Formattazione per date
    if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))) {
      const date = new Date(value);
      return (
        <span className="font-mono text-sm">
          {date.toLocaleDateString('it-IT')}
        </span>
      );
    }

    // Formattazione per numeri (importi)
    if (typeof value === 'number') {
      if (columnName.toLowerCase().includes('importo') || columnName.toLowerCase().includes('saldo')) {
        return (
          <span className={cn(
            "font-mono font-medium",
            value >= 0 ? "text-success-600 dark:text-success-400" : "text-error-600 dark:text-error-400"
          )}>
            {value.toLocaleString('it-IT', { 
              style: 'currency', 
              currency: 'EUR',
              minimumFractionDigits: 2 
            })}
          </span>
        );
      }
      return (
        <span className="font-mono text-sm">
          {value.toLocaleString('it-IT')}
        </span>
      );
    }

    // Formattazione per testo
    if (typeof value === 'string') {
      return (
        <span className="text-sm truncate max-w-xs block" title={value}>
          {value}
        </span>
      );
    }

    return <span className="text-sm">{String(value)}</span>;
  };

  // Gestione ordinamento
  const handleSort = (column) => {
    onSort(column);
  };

  // Gestione paginazione
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  // Genera array pagine per navigazione
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  }, [currentPage, totalPages]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-center">
        <div className="space-y-4">
          <AlertCircle className="h-12 w-12 text-error-500 mx-auto" />
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Errore nel caricamento dei dati
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {error.message || 'Si è verificato un errore imprevisto'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header tabella con statistiche */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {loading ? (
              <span>Caricamento...</span>
            ) : (
              <span>
                Mostrando <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> -{' '}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, totalRows)}
                </span>{' '}
                di <span className="font-medium">{totalRows.toLocaleString('it-IT')}</span> risultati
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Righe per pagina:
            </label>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="input text-sm py-1 px-2 w-20"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
              <option value={500}>500</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabella */}
      <div className="flex-1 overflow-auto">
        <div className="table-container">
          <table className="table">
            <thead className="table-header sticky top-0 z-10">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column}
                    className={cn(
                      "table-header-cell cursor-pointer select-none",
                      "hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                    )}
                    onClick={() => handleSort(column)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{column}</span>
                      <div className="ml-2 flex flex-col">
                        {sortBy === column ? (
                          sortOrder === 'asc' ? (
                            <ChevronUp className="h-3 w-3 text-primary-600" />
                          ) : (
                            <ChevronDown className="h-3 w-3 text-primary-600" />
                          )
                        ) : (
                          <div className="flex flex-col">
                            <ChevronUp className="h-3 w-3 text-gray-300 dark:text-gray-600" />
                            <ChevronDown className="h-3 w-3 text-gray-300 dark:text-gray-600" />
                          </div>
                        )}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody className="table-body">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-8">
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
                      <span className="text-gray-500 dark:text-gray-400">
                        Caricamento dati...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-8">
                    <div className="text-gray-500 dark:text-gray-400">
                      Nessun risultato trovato
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={cn(
                      "table-row",
                      hoveredRow === rowIndex && "bg-primary-50 dark:bg-primary-900/20"
                    )}
                    onMouseEnter={() => setHoveredRow(rowIndex)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    {columns.map((column) => (
                      <td key={column} className="table-cell">
                        {formatCellValue(row[column], column)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginazione */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Pagina {currentPage} di {totalPages}
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Pulsante precedente */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={cn(
                  "p-2 rounded-lg border border-gray-300 dark:border-gray-600",
                  "hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "text-gray-500 dark:text-gray-400"
                )}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Numeri pagina */}
              <div className="flex items-center space-x-1">
                {pageNumbers.map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' && handlePageChange(page)}
                    disabled={page === '...'}
                    className={cn(
                      "px-3 py-2 text-sm rounded-lg border transition-colors duration-150",
                      "hover:bg-gray-50 dark:hover:bg-gray-700",
                      page === currentPage
                        ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300"
                        : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300",
                      page === '...' && "cursor-default hover:bg-transparent"
                    )}
                  >
                    {page}
                  </button>
                ))}
              </div>

              {/* Pulsante successivo */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={cn(
                  "p-2 rounded-lg border border-gray-300 dark:border-gray-600",
                  "hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "text-gray-500 dark:text-gray-400"
                )}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
