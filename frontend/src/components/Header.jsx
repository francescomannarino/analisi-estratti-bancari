import React from 'react';
import { 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Database, 
  Wifi, 
  WifiOff,
  AlertCircle 
} from 'lucide-react';
import { cn } from '../utils/cn';

const Header = ({ 
  isDarkMode, 
  onToggleTheme, 
  onToggleSidebar, 
  healthStatus, 
  healthError 
}) => {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo e titolo */}
          <div className="flex items-center">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center ml-4 lg:ml-0">
              <div className="flex-shrink-0">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                    <Database className="h-5 w-5 text-white" />
                  </div>
                  <h1 className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
                    Analisi Estratti Bancari
                  </h1>
                </div>
              </div>
            </div>
          </div>

          {/* Indicatori di stato e controlli */}
          <div className="flex items-center space-x-4">
            {/* Status Backend */}
            <div className="hidden sm:flex items-center space-x-2">
              {healthError ? (
                <div className="flex items-center text-error-600 dark:text-error-400">
                  <WifiOff className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">Backend Offline</span>
                </div>
              ) : healthStatus ? (
                <div className="flex items-center text-success-600 dark:text-success-400">
                  <Wifi className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">Backend Online</span>
                </div>
              ) : (
                <div className="flex items-center text-warning-600 dark:text-warning-400">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">Controllo Stato...</span>
                </div>
              )}
            </div>

            {/* Toggle Tema */}
            <button
              onClick={onToggleTheme}
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
                "hover:bg-gray-100 dark:hover:bg-gray-700",
                "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              )}
              aria-label={isDarkMode ? "Passa alla modalità chiara" : "Passa alla modalità scura"}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {/* Menu Mobile */}
            <div className="lg:hidden">
              <button
                onClick={onToggleSidebar}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Indicatore stato mobile */}
      <div className="sm:hidden border-t border-gray-200 dark:border-gray-700 px-4 py-2">
        {healthError ? (
          <div className="flex items-center justify-center text-error-600 dark:text-error-400 text-sm">
            <WifiOff className="h-4 w-4 mr-2" />
            <span>Backend Offline</span>
          </div>
        ) : healthStatus ? (
          <div className="flex items-center justify-center text-success-600 dark:text-success-400 text-sm">
            <Wifi className="h-4 w-4 mr-2" />
            <span>Backend Online</span>
          </div>
        ) : (
          <div className="flex items-center justify-center text-warning-600 dark:text-warning-400 text-sm">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span>Controllo Stato...</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
