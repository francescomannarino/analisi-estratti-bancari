import React from 'react';
import { BarChart3, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { cn } from '../utils/cn';

const StatsPanel = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <div className="spinner text-primary-500" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="card">
      <div className="flex items-center space-x-3 mb-4">
        <BarChart3 className="h-5 w-5 text-primary-600" />
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          Panoramica Dati
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Righe totali */}
        <div className="text-center p-4 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg">
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {stats.total_rows?.toLocaleString('it-IT')}
          </div>
          <div className="text-xs text-primary-700 dark:text-primary-300 font-medium">
            Righe Totali
          </div>
        </div>

        {/* Colonne */}
        <div className="text-center p-4 bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 rounded-lg">
          <div className="text-2xl font-bold text-success-600 dark:text-success-400">
            {stats.total_columns}
          </div>
          <div className="text-xs text-success-700 dark:text-success-300 font-medium">
            Colonne
          </div>
        </div>

        {/* Uso memoria */}
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.memory_usage_mb}
          </div>
          <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">
            MB Memoria
          </div>
        </div>
      </div>

      {/* Statistiche colonne */}
      {stats.columns_info && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Analisi Colonne
          </h4>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {Object.entries(stats.columns_info).map(([colName, colInfo]) => (
              <div key={colName} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {colName}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {colInfo.type}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="font-medium text-gray-700 dark:text-gray-300">
                      {colInfo.null_count}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">
                      Nulli
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-medium text-gray-700 dark:text-gray-300">
                      {colInfo.unique_count}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">
                      Unici
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-medium text-gray-700 dark:text-gray-300">
                      {colInfo.unique_percentage}%
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">
                      % Unici
                    </div>
                  </div>
                </div>

                {/* Statistiche specifiche per tipo */}
                {colInfo.min !== undefined && colInfo.max !== undefined && (
                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Range: {colInfo.min}</span>
                      <span>{colInfo.max}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsPanel;
