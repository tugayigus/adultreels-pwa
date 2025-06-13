'use client';

import { useState, useCallback } from 'react';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export default function UploadPage() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleFiles = (selectedFiles: File[]) => {
    const videoFiles = selectedFiles.filter(file => file.type.startsWith('video/'));
    
    const newFiles: UploadFile[] = videoFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'pending',
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    
    // Simulate upload for each file
    newFiles.forEach(uploadFile => {
      simulateUpload(uploadFile);
    });
  };
  
  const simulateUpload = (uploadFile: UploadFile) => {
    setFiles(prev => prev.map(f => 
      f.id === uploadFile.id ? { ...f, status: 'uploading' } : f
    ));
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      
      if (progress >= 100) {
        clearInterval(interval);
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, progress: 100, status: 'completed' }
            : f
        ));
      } else {
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, progress: Math.min(progress, 99) }
            : f
        ));
      }
    }, 500);
  };
  
  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Upload Videos</h1>
      
      {/* Upload Area */}
      <div
        className={`bg-gray-800 rounded-xl p-8 border-2 border-dashed transition-colors ${
          isDragging ? 'border-pink-500 bg-gray-700' : 'border-gray-600'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-white text-lg mb-2">
            Drag and drop video files here
          </p>
          <p className="text-gray-400 text-sm mb-4">
            or click to browse
          </p>
          <input
            type="file"
            multiple
            accept="video/*"
            onChange={(e) => handleFiles(Array.from(e.target.files || []))}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white font-medium rounded-lg cursor-pointer hover:from-pink-600 hover:to-red-600 transition-all"
          >
            Select Videos
          </label>
        </div>
      </div>
      
      {/* Upload Queue */}
      {files.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Upload Queue</h2>
          <div className="space-y-3">
            {files.map((file) => (
              <div key={file.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-white font-medium truncate pr-4">
                      {file.file.name}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {formatFileSize(file.file.size)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {file.status === 'completed' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {file.status === 'error' && (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {file.status !== 'pending' && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-400">
                        {file.status === 'uploading' ? 'Uploading...' : 
                         file.status === 'completed' ? 'Completed' :
                         file.status === 'error' ? 'Failed' : ''}
                      </span>
                      <span className="text-white">{Math.round(file.progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          file.status === 'error' ? 'bg-red-500' :
                          file.status === 'completed' ? 'bg-green-500' :
                          'bg-gradient-to-r from-pink-500 to-red-500'
                        }`}
                        style={{ width: `${file.progress}%` }}
                      />
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
}