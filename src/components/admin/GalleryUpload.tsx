import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { toast } from 'sonner';
import { uploadImage, fileToBase64 } from '../../services/imagekit';
import { updateDoc, doc, getFirestore } from 'firebase/firestore';
import { GalleryPhoto } from '../../types';

interface GalleryUploadProps {
  galleryId: string;
  onUploadComplete?: (photos: GalleryPhoto[]) => void;
  isClientDelivery?: boolean;
}

export default function GalleryUpload({ galleryId, onUploadComplete, isClientDelivery = false }: GalleryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<GalleryPhoto[]>([]);

  const compressImage = async (file: File) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error('Error compressing image:', error);
      return file;
    }
  };

  const uploadToImageKit = async (file: File, index: number) => {
    try {
      // Compress image locally before upload
      const compressedFile = await compressImage(file);
      
      // Convert to base64
      const base64 = await fileToBase64(compressedFile);
      
      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${timestamp}_${index}_${file.name}`;
      const folder = isClientDelivery 
        ? `client-deliveries/${galleryId}`
        : `galleries/${galleryId}`;
      
      // Upload to ImageKit via Firebase Cloud Functions
      const result = await uploadImage(base64, filename, folder);
      
      return result;
    } catch (error) {
      console.error('Error uploading to ImageKit:', error);
      throw error;
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    setProgress(0);
    const uploadedPhotos: GalleryPhoto[] = [];

    try {
      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];
        const result = await uploadToImageKit(file, i);
        
        const photo: GalleryPhoto = {
          id: result.fileId,
          url: result.url,
          name: result.name,
          size: result.size,
          uploadedAt: new Date().toISOString(),
          title: file.name,
          imagekitFileId: result.fileId,
          imagekitPath: result.url.split('/').pop() || '',
        };
        
        uploadedPhotos.push(photo);
        
        setProgress(((i + 1) / acceptedFiles.length) * 100);
      }

      setUploadedImages([...uploadedImages, ...uploadedPhotos]);
      
      // Update gallery in Firestore with new photos
      const db = getFirestore();
      const galleryRef = doc(db, 'galleries', galleryId);
      
      // Get current gallery data
      const currentPhotos = uploadedPhotos.map(p => ({
        id: p.id,
        url: p.url,
        name: p.name,
        size: p.size,
        uploadedAt: p.uploadedAt,
        title: p.title,
        imagekitFileId: p.imagekitFileId,
        imagekitPath: p.imagekitPath,
      }));
      
      const imagekitFileIds = uploadedPhotos.map(p => p.imagekitFileId).filter(Boolean);
      const imagekitPaths = uploadedPhotos.map(p => p.imagekitPath).filter(Boolean);
      
      await updateDoc(galleryRef, {
        photos: currentPhotos,
        imagekitFileIds: imagekitFileIds,
        imagekitPaths: imagekitPaths,
        totalFilesCount: currentPhotos.length,
        totalStorageSize: currentPhotos.reduce((acc, p) => acc + p.size, 0),
        updatedAt: new Date().toISOString(),
      });
      
      toast.success(`تم رفع ${acceptedFiles.length} صورة بنجاح`);
      onUploadComplete?.(uploadedPhotos);
    } catch (error) {
      toast.error('فشل رفع بعض الصور');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  }, [galleryId, onUploadComplete, isClientDelivery, uploadedImages]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    disabled: uploading,
    onDragEnter: undefined,
    onDragOver: undefined,
    onDragLeave: undefined,
  });

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
          isDragActive
            ? 'border-purple-500 bg-purple-500/10'
            : 'border-white/20 bg-white/5 hover:border-purple-500/50 hover:bg-white/10'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          {uploading ? (
            <Loader2 className="text-purple-400 animate-spin" size={48} />
          ) : (
            <Upload className="text-purple-400" size={48} />
          )}
          <div>
            <p className="text-white font-semibold text-lg mb-1">
              {uploading ? 'جاري الرفع...' : 'اسحب الصور هنا أو اضغط للاختيار'}
            </p>
            <p className="text-gray-400 text-sm">
              {uploading
                ? `${Math.round(progress)}% مكتمل`
                : 'JPEG, PNG, WebP (حد أقصى 10MB لكل صورة)'}
            </p>
          </div>
        </div>
      </div>

      {/* Uploaded Images Preview */}
      {uploadedImages.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">الصور المرفوعة ({uploadedImages.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {uploadedImages.map((photo, index) => (
              <div key={index} className="relative group">
                <img
                  src={photo.url}
                  alt={photo.title || `Uploaded ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
