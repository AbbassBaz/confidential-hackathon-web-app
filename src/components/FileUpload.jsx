import React, { useState } from 'react';
import languages from '../constants/languages';
import UploadIcon from './icons/UploadIcon';
import AttachmentIcon from './icons/AttachmentIcon';

const { label, drag_drop, error: errorMessages, remove } = languages.file_upload;

const FileUpload = ({ files, setFiles }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
  const MAX_FILES = 5;
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const validateFile = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      setError(errorMessages.file_too_large(file.name));
      return false;
    }
    return true;
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError('');
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };
  
  const handleChange = (e) => {
    e.preventDefault();
    setError('');
    
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };
  
  const handleFiles = (newFiles) => {
    if (files.length + newFiles.length > MAX_FILES) {
      setError(errorMessages.max_files);
      return;
    }
    
    const validFiles = [];
    for (let i = 0; i < newFiles.length; i++) {
      if (validateFile(newFiles[i])) {
        validFiles.push(newFiles[i]);
      }
    }
    
    setFiles([...files, ...validFiles]);
  };
  
  const removeFile = (index) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
  };
  
  // Format file size to readable format
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      
      <div
        className={`relative transition-all duration-300 ease-in-out
          border-2 border-dashed rounded-xl p-8 sm:p-10
          flex flex-col items-center justify-center
          cursor-pointer group
          ${dragActive 
            ? 'border-indigo-500 bg-indigo-50 shadow-lg scale-[1.02]' 
            : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
          }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <div className="transform transition-transform duration-300 group-hover:scale-110">
          <UploadIcon className={`h-12 w-12 sm:h-16 sm:w-16 ${
            dragActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-indigo-400'
          }`} />
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-sm sm:text-base text-gray-600">
            {drag_drop.text}{' '}
            <label htmlFor="file-upload" className="text-indigo-600 hover:text-indigo-500 cursor-pointer font-medium transition-colors duration-200">
              {drag_drop.browse}
            </label>
          </p>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            multiple
            className="hidden"
            onChange={handleChange}
          />
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            {drag_drop.limits}
          </p>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg transition-all duration-300 ease-in-out">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {files.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <ul className="divide-y divide-gray-100">
            {files.map((file, index) => (
              <li 
                key={index} 
                className="relative group hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                  <div className="flex items-center min-w-0 pr-6">
                    <AttachmentIcon className="flex-shrink-0 h-5 w-5 text-indigo-400" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full
                      text-red-600 hover:text-white hover:bg-red-600
                      transition-all duration-200 ease-in-out
                      opacity-0 group-hover:opacity-100"
                  >
                    {remove}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUpload;