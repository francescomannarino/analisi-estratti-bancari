import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, FileSpreadsheet, X, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '../utils/cn';

const UploadArea = ({ onFileUpload }) => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedFile(file);
      setUploadError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  const handleUpload = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      await onFileUpload(uploadedFile);
      // Il file verrà gestito dal componente padre
    } catch (error) {
      setUploadError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setUploadError(null);
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'csv':
        return <FileText className="h-8 w-8 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
      default:
        return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Area Upload */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer",
          "hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20",
          isDragActive && "border-primary-500 bg-primary-50 dark:bg-primary-900/20",
          isDragReject && "border-error-500 bg-error-50 dark:bg-error-900/20",
          "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <Upload className="h-8 w-8 text-gray-400" />
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {isDragActive ? 'Rilascia il file qui' : 'Carica il tuo estratto bancario'}
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Trascina e rilascia un file CSV o Excel, oppure clicca per selezionare
            </p>
          </div>

          <div className="text-xs text-gray-400 dark:text-gray-500">
            <p>Formati supportati: CSV, XLS, XLSX</p>
            <p>Dimensione massima: 100MB</p>
          </div>
        </div>
      </div>

      {/* File Selezionato */}
      {uploadedFile && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getFileIcon(uploadedFile.name)}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {uploadedFile.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(uploadedFile.size)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={removeFile}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Errori */}
          {uploadError && (
            <div className="mt-3 flex items-center space-x-2 text-error-600 dark:text-error-400">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{uploadError}</span>
            </div>
          )}

          {/* Pulsante Upload */}
          <div className="mt-4">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className={cn(
                "w-full btn-primary",
                isUploading && "opacity-50 cursor-not-allowed"
              )}
            >
              {isUploading ? (
                <>
                  <div className="spinner mr-2" />
                  Caricamento in corso...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Carica File
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Informazioni aggiuntive */}
      <div className="mt-8 text-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-3">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              Supporto Multi-Formato
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              CSV, Excel e altri formati bancari
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-3">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              Parsing Intelligente
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Riconoscimento automatico delle colonne
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-3">
              <Upload className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              Upload Sicuro
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              I tuoi dati rimangono locali
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadArea;
