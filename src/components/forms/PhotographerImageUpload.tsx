import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, Check, AlertCircle, Image as ImageIcon, Loader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface UploadedImage {
  id: string;
  originalUrl: string;
  compressedUrl: string;
  originalSize: number;
  compressedSize: number;
  fileName: string;
}

interface PhotographerImageUploadProps {
  bookingId: string;
  onUploadComplete?: (images: UploadedImage[]) => void;
  maxFileSize?: number; // in MB
  maxImages?: number;
  compressionOptions?: {
    maxSizeMB: number;
    maxWidthOrHeight: number;
    useWebWorker: boolean;
  };
}

export default function PhotographerImageUpload({
  bookingId,
  onUploadComplete,
  maxFileSize = 10,
  maxImages = 50,
  compressionOptions = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1920,
    useWebWorker: true
  }
}: PhotographerImageUploadProps) {
  const storage = getStorage();
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadStatus, setUploadStatus] = useState<Record<string, 'pending' | 'compressing' | 'uploading' | 'completed' | 'error'>>({});
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const compressImage = async (file: File): Promise<{ compressedFile: File; originalSize: number; compressedSize: number }> => {
    try {
      const originalSize = file.size;
      const compressedFile = await imageCompression(file, compressionOptions);
      const compressedSize = compressedFile.size;

      console.log(`Original: ${formatFileSize(originalSize)} → Compressed: ${formatFileSize(compressedSize)}`);
      
      return { compressedFile, originalSize, compressedSize };
    } catch (error) {
      console.error('Error compressing image:', error);
      throw new Error('فشل ضغط الصورة');
    }
  };

  const uploadToStorage = async (file: File, path: string, fileId: string): Promise<string> => {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    return url;
  };

  const handleFileSelect = useCallback(async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const fileArray = Array.from(selectedFiles);
    
    // Validate file count
    if (uploadedImages.length + fileArray.length > maxImages) {
      setError(`يمكنك رفع ${maxImages} صورة كحد أقصى`);
      return;
    }

    // Validate file sizes
    const oversizedFiles = fileArray.filter(file => file.size > maxFileSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError(`بعض الصور أكبر من ${maxFileSize}MB`);
      return;
    }

    setFiles(prev => [...prev, ...fileArray]);
    setError(null);

    // Process each file
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const fileId = `${Date.now()}-${i}`;
      
      setUploadStatus(prev => ({ ...prev, [fileId]: 'compressing' }));
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

      try {
        // Compress image
        const { compressedFile, originalSize, compressedSize } = await compressImage(file);
        
        setUploadStatus(prev => ({ ...prev, [fileId]: 'uploading' }));
        setUploadProgress(prev => ({ ...prev, [fileId]: 50 }));

        // Upload compressed version (thumbnail)
        const timestamp = Date.now();
        const compressedPath = `bookings/${bookingId}/thumbnails/${timestamp}-${file.name}`;
        const compressedUrl = await uploadToStorage(compressedFile, compressedPath, fileId);
        
        setUploadProgress(prev => ({ ...prev, [fileId]: 75 }));

        // Upload original version
        const originalPath = `bookings/${bookingId}/original/${timestamp}-${file.name}`;
        const originalUrl = await uploadToStorage(file, originalPath, fileId);
        
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
        setUploadStatus(prev => ({ ...prev, [fileId]: 'completed' }));

        // Add to uploaded images
        const uploadedImage: UploadedImage = {
          id: fileId,
          originalUrl,
          compressedUrl,
          originalSize,
          compressedSize,
          fileName: file.name
        };

        setUploadedImages(prev => [...prev, uploadedImage]);
      } catch (error) {
        console.error('Error processing file:', error);
        setUploadStatus(prev => ({ ...prev, [fileId]: 'error' }));
        setError('فشل معالجة بعض الصور');
      }
    }

    // Notify parent component
    setTimeout(() => {
      onUploadComplete?.(uploadedImages);
    }, 500);
  }, [bookingId, maxImages, maxFileSize, compressionOptions, uploadedImages, onUploadComplete]);

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter((_, i) => `${Date.now()}-${i}` !== fileId));
    setUploadedImages(prev => prev.filter(img => img.id !== fileId));
    setUploadStatus(prev => {
      const newStatus = { ...prev };
      delete newStatus[fileId];
      return newStatus;
    });
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compressing':
        return <Loader2 size={16} className="animate-spin text-blue-400" />;
      case 'uploading':
        return <Loader2 size={16} className="animate-spin text-purple-400" />;
      case 'completed':
        return <Check size={16} className="text-green-400" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-400" />;
      default:
        return null;
    }
  };

  const totalProgress = Object.keys(uploadStatus).length > 0
    ? (Object.values(uploadProgress) as number[]).reduce((a, b) => a + b, 0) / Object.keys(uploadStatus).length
    : 0;

  return (
    <div className="w-full bg-[#050508] text-white font-['Cairo','Tajawal',sans-serif]" dir="rtl">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-white/20 rounded-2xl p-8 hover:border-purple-500/50 transition-colors">
        <input
          type="file"
          id="image-upload"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={Object.values(uploadStatus).some(s => s === 'compressing' || s === 'uploading')}
        />
        
        <label
          htmlFor="image-upload"
          className="flex flex-col items-center justify-center cursor-pointer"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4"
          >
            <Upload size={32} className="text-white" />
          </motion.div>
          
          <h3 className="text-xl font-bold mb-2">رفع الصور</h3>
          <p className="text-gray-400 text-center mb-4">
            اسحب الصور هنا أو انقر للاختيار
          </p>
          
          <div className="flex gap-4 text-sm text-gray-500">
            <span>حد أقصى: {maxFileSize}MB</span>
            <span>عدد: {maxImages} صورة</span>
          </div>
        </label>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-center gap-3"
          >
            <AlertCircle size={20} className="text-red-400" />
            <span className="text-red-400">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overall Progress Bar */}
      {Object.keys(uploadStatus).length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">
              جاري المعالجة... {Object.values(uploadStatus).filter(s => s === 'completed').length} / {Object.keys(uploadStatus).length}
            </span>
            <span className="text-sm text-white font-semibold">{Math.round(totalProgress)}%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${totalProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Uploaded Images List */}
      <div className="mt-6 space-y-3">
        <AnimatePresence>
          {uploadedImages.map((image) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4"
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/10">
                <img
                  src={image.compressedUrl}
                  alt={image.fileName}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1">
                <p className="text-white font-medium mb-1 truncate">{image.fileName}</p>
                <div className="flex gap-4 text-sm text-gray-400">
                  <span>الأصلية: {formatFileSize(image.originalSize)}</span>
                  <span>المضغوطة: {formatFileSize(image.compressedSize)}</span>
                  <span className="text-green-400">
                    {Math.round((1 - image.compressedSize / image.originalSize) * 100)}% تقليل
                  </span>
                </div>
              </div>

              <button
                onClick={() => removeFile(image.id)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={18} className="text-gray-400 hover:text-red-400" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Processing Files */}
      <div className="mt-6 space-y-3">
        {files.map((file, index) => {
          const fileId = `${Date.now()}-${index}`;
          const status = uploadStatus[fileId];
          const progress = uploadProgress[fileId];

          if (!status || status === 'completed') return null;

          return (
            <motion.div
              key={fileId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
                <ImageIcon size={24} className="text-gray-400" />
              </div>
              
              <div className="flex-1">
                <p className="text-white font-medium mb-1 truncate">{file.name}</p>
                <div className="flex items-center gap-2">
                  {getStatusIcon(status)}
                  <span className="text-sm text-gray-400">
                    {status === 'compressing' && 'جاري الضغط...'}
                    {status === 'uploading' && 'جاري الرفع...'}
                    {status === 'error' && 'فشل المعالجة'}
                  </span>
                </div>
              </div>

              {progress !== undefined && (
                <div className="w-24">
                  <div className="text-sm text-white font-semibold mb-1">{progress}%</div>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Summary */}
      {uploadedImages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Check size={20} className="text-green-400" />
              <span className="text-white font-semibold">
                تم رفع {uploadedImages.length} صورة بنجاح
              </span>
            </div>
            <div className="text-sm text-gray-400">
              إجمالي التوفير: {formatFileSize(
                uploadedImages.reduce((acc, img) => acc + (img.originalSize - img.compressedSize), 0)
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
