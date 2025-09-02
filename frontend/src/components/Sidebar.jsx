import React from 'react';
import { X, BarChart3, Database, Trash2, Info, TrendingUp, FileText } from 'lucide-react';
import { cn } from '../utils/cn';

const Sidebar = ({ isOpen, onClose, currentData, stats, statsLoading, onClearData }) => {
  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Header sidebar */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Informazioni Dati
            </h2>
            <button
              onClick={onClose}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Contenuto sidebar */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* File caricato */}
            {currentData && (
              <div className="card">
                <div className="flex items-center space-x-3 mb-4">
                  <Database className="h-5 w-5 text-primary-600" />
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    File Caricato
                  </h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Righe totali:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {currentData.total_rows?.toLocaleString('it-IT')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Colonne:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {currentData.columns?.length}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">ID File:</span>
                    <span className="font-mono text-xs text-gray-500 dark:text-gray-400 truncate max-w-24">
                      {currentData.file_id}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Statistiche */}
            {currentData && (
              <div className="card">
                <div className="flex items-center space-x-3 mb-4">
                  <BarChart3 className="h-5 w-5 text-success-600" />
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Statistiche
                  </h3>
                </div>

                {statsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="spinner text-primary-500" />
                  </div>
                ) : stats ? (
                  <div className="space-y-4">
                    {/* Statistiche generali */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                          {stats.total_rows?.toLocaleString('it-IT')}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Righe Totali
                        </div>
                      </div>
                      
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-2xl font-bold text-success-600 dark:text-success-400">
                          {stats.total_columns}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Colonne
                        </div>
                      </div>
                    </div>

                    {/* Uso memoria */}
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-blue-700 dark:text-blue-300">Uso Memoria:</span>
                        <span className="font-medium text-blue-900 dark:text-blue-100">
                          {stats.memory_usage_mb} MB
                        </span>
                      </div>
                    </div>

                    {/* Informazioni colonne */}
                    <div>
                      <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                        Dettagli Colonne
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {stats.columns_info && Object.entries(stats.columns_info).map(([colName, colInfo]) => (
                          <div key={colName} className="text-xs p-2 bg-gray-50 dark:bg-gray-700 rounded">
                            <div className="font-medium text-gray-900 dark:text-white mb-1">
                              {colName}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-gray-500 dark:text-gray-400">
                              <div>
                                <span className="font-medium">Tipo:</span> {colInfo.type}
                              </div>
                              <div>
                                <span className="font-medium">Nulli:</span> {colInfo.null_count}
                              </div>
                              <div>
                                <span className="font-medium">Unici:</span> {colInfo.unique_count}
                              </div>
                              <div>
                                <span className="font-medium">% Unici:</span> {colInfo.unique_percentage}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    <Info className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Nessuna statistica disponibile</p>
                  </div>
                )}
              </div>
            )}

            {/* Azioni rapide */}
            {currentData && (
              <div className="card">
                <div className="flex items-center space-x-3 mb-4">
                  <TrendingUp className="h-5 w-5 text-warning-600" />
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Azioni Rapide
                  </h3>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={onClearData}
                    className="w-full btn-error text-sm"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Pulisci Dati
                  </button>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Rimuove tutti i dati caricati dalla sessione
                  </div>
                </div>
              </div>
            )}

            {/* Informazioni app */}
            <div className="card">
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="h-5 w-5 text-purple-600" />
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Informazioni App
                </h3>
              </div>
              
              <div className="space-y-3 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Versione:</span>
                  <span>1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span>Backend:</span>
                  <span>Python FastAPI</span>
                </div>
                <div className="flex justify-between">
                  <span>Frontend:</span>
                  <span>React + Tailwind</span>
                </div>
                <div className="flex justify-between">
                  <span>Database:</span>
                  <span>SQLite Temp</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
