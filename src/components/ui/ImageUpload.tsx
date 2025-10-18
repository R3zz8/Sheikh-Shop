'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  className?: string;
  disabled?: boolean;
}

interface UploadProgress {
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress: number;
  message?: string;
}

export default function ImageUpload({ 
  value, 
  onChange, 
  onRemove, 
  className,
  disabled = false 
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({ status: 'idle', progress: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File | undefined) => {
    if (disabled || !file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setUploadProgress({
        status: 'error',
        progress: 0,
        message: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'
      });
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setUploadProgress({
        status: 'error',
        progress: 0,
        message: 'File too large. Maximum size is 10MB.'
      });
      return;
    }

    setUploadProgress({ status: 'uploading', progress: 0 });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadProgress({ status: 'success', progress: 100 });
        onChange(result.url);
        
        // Reset progress after success
        setTimeout(() => {
          setUploadProgress({ status: 'idle', progress: 0 });
        }, 2000);
      } else {
        setUploadProgress({
          status: 'error',
          progress: 0,
          message: result.error || 'Upload failed'
        });
      }
    } catch (error: any) {
      setUploadProgress({
        status: 'error',
        progress: 0,
        message: error.message || 'Upload failed'
      });
    }
  }, [onChange, disabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0] as File);
    }
  }, [handleFileSelect, disabled]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0] as File);
    }
  }, [handleFileSelect]);

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const handleRemove = useCallback(() => {
    if (onRemove) {
      onRemove();
    } else {
      onChange('');
    }
    setUploadProgress({ status: 'idle', progress: 0 });
  }, [onChange, onRemove]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      {!value && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            'relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200',
            isDragOver 
              ? 'border-amber-400 bg-amber-50' 
              : 'border-gray-300 hover:border-amber-400 hover:bg-amber-50/50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={disabled}
          />
          
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-amber-600" />
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                {isDragOver ? 'Drop your image here' : 'Upload an image'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Drag and drop or click to browse
              </p>
              <p className="text-xs text-gray-400 mt-2">
                PNG, JPG, WebP, GIF up to 10MB
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Upload Progress */}
      <AnimatePresence>
        {uploadProgress.status !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            {uploadProgress.status === 'uploading' && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">Uploading...</p>
                  <div className="w-full bg-blue-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {uploadProgress.status === 'success' && (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-3 p-3 bg-green-50 rounded-lg"
              >
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-sm font-medium text-green-900">Upload successful!</p>
              </motion.div>
            )}

            {uploadProgress.status === 'error' && (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-3 p-3 bg-red-50 rounded-lg"
              >
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-900">Upload failed</p>
                  {uploadProgress.message && (
                    <p className="text-xs text-red-700 mt-1">{uploadProgress.message}</p>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Preview */}
      {value && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative group"
        >
          <div className="relative overflow-hidden rounded-lg border border-gray-200">
            <img
              src={value}
              alt="Uploaded image"
              className="w-full h-48 object-cover"
            />
            
            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleClick}
                disabled={disabled}
                className="bg-white/90 hover:bg-white"
              >
                <ImageIcon className="w-4 h-4 mr-1" />
                Replace
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                disabled={disabled}
                className="bg-red-600/90 hover:bg-red-600"
              >
                <X className="w-4 h-4 mr-1" />
                Remove
              </Button>
            </div>
          </div>
          
          {/* Image info */}
          <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
            <ImageIcon className="w-3 h-3" />
            <span>Cloudinary hosted image</span>
            <span className="text-green-600">✓</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
