/**
 * Simple Gallery Create Page
 * صفحة إنشاء معرض بسيطة
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Upload, Image as ImageIcon, Lock, Copy, Share2, CheckCircle, X, Loader2 } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { firebaseService } from '../../services/firebase';
import { toast } from 'sonner';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export default function SimpleGalleryCreate() {
  const [galleryName, setGalleryName] = useState('');
  const [password, setPassword] = useState('1234');
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [galleryId, setGalleryId] = useState<string | null>(null);
  const [galleryUrl, setGalleryUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
    
    // Create previews
    const urls = selectedFiles.map(file => URL.createObjectURL(file as Blob));
    setPreviewUrls(urls);
  };

  const handleUpload = async () => {
    if (!galleryName.trim()) {
      toast.error('الرجاء إدخال اسم المعرض');
      return;
    }

    if (files.length === 0) {
      toast.error('الرجاء اختيار صور');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      console.log('🚀 Starting upload process to Cloudinary via Express server...');
      
      const db = firebaseService.getDB();

      if (!db) {
        throw new Error('Firebase Firestore is not initialized');
      }

      console.log('✅ Firebase initialized successfully');

      // Generate gallery ID
      const newGalleryId = `gallery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      console.log('📝 Gallery ID:', newGalleryId);
      
      // Upload photos to Cloudinary via Cloud Functions
      const uploadedPhotos: any[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`📤 Uploading photo ${i + 1}/${files.length} to Cloudinary:`, file.name);
        
        try {
          // Convert file to base64
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
              const result = reader.result as string;
              resolve(result);
            };
            reader.onerror = reject;
          });

          // Upload to Express server
          const response = await fetch(`${SERVER_URL}/api/cloudinary/upload`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              base64Image: base64,
              fileName: file.name,
              folder: `galleries/${newGalleryId}`,
              watermark: {
                text: 'شادي حسين ©',
                color: 'white',
                opacity: 50,
              },
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to upload image');
          }

          const data = await response.json();
          console.log('✅ Photo uploaded successfully:', data.secure_url);
          
          uploadedPhotos.push({
            id: `${Date.now()}_${i}`,
            name: file.name,
            url: data.secure_url,
            publicId: data.public_id,
            size: file.size,
            uploadedAt: new Date().toISOString()
          });
          
          setUploadProgress(((i + 1) / files.length) * 100);
        } catch (uploadError) {
          console.error(`❌ Error uploading photo ${i + 1}:`, uploadError);
          throw uploadError;
        }
      }

      console.log('✅ All photos uploaded successfully to Cloudinary');

      // Create gallery document
      const galleryData = {
        id: newGalleryId,
        name: galleryName,
        password: password,
        photos: uploadedPhotos,
        createdAt: new Date().toISOString(),
        photoCount: uploadedPhotos.length
      };

      console.log('💾 Saving gallery to Firestore...');
      await setDoc(doc(db, 'galleries', newGalleryId), galleryData);
      console.log('✅ Gallery saved successfully');

      setGalleryId(newGalleryId);
      setGalleryUrl(`${window.location.origin}/gallery/${newGalleryId}`);
      
      toast.success('تم إنشاء المعرض بنجاح!');
    } catch (error: any) {
      console.error('❌ Error creating gallery:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      toast.error('حدث خطأ أثناء إنشاء المعرض: ' + (error.message || 'خطأ غير معروف'));
    } finally {
      setUploading(false);
    }
  };

  const handleCopyLink = () => {
    if (!galleryUrl) return;
    navigator.clipboard.writeText(galleryUrl);
    setCopied(true);
    toast.success('تم نسخ الرابط');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    if (!galleryUrl) return;
    const message = `تم إعداد معرض الصور الخاص بك: "${galleryName}"\n\nالرابط: ${galleryUrl}\nكلمة المرور: ${password}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleReset = () => {
    setGalleryName('');
    setPassword('1234');
    setFiles([]);
    setPreviewUrls([]);
    setGalleryId(null);
    setGalleryUrl(null);
    setUploadProgress(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">إنشاء معرض جديد</h1>
          <p className="text-gray-400">أنشئ معرض صور بسيط وشاركه مع عملائك</p>
        </motion.div>

        {!galleryId ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Gallery Name */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <label className="block text-white font-semibold mb-2">اسم المعرض</label>
              <input
                type="text"
                value={galleryName}
                onChange={(e) => setGalleryName(e.target.value)}
                placeholder="مثال: زفاف أحمد ومحمد"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Password */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <label className="block text-white font-semibold mb-2">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="كلمة المرور (افتراضي: 1234)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pr-10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Upload Photos */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <label className="block text-white font-semibold mb-2">رفع الصور</label>
              
              <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-purple-500/50 transition-colors cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="mx-auto mb-4 text-purple-400" size={48} />
                  <p className="text-white font-semibold mb-2">اختر الصور</p>
                  <p className="text-gray-400 text-sm">اسحب وأفلت أو انقر للاختيار</p>
                </label>
              </div>

              {/* Preview */}
              {previewUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                      <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => {
                          const newFiles = files.filter((_, i) => i !== index);
                          const newUrls = previewUrls.filter((_, i) => i !== index);
                          setFiles(newFiles);
                          setPreviewUrls(newUrls);
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full"
                      >
                        <X size={16} className="text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={uploading || !galleryName || files.length === 0}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={20} />
                  <span>جاري الرفع... {Math.round(uploadProgress)}%</span>
                </div>
              ) : (
                'إنشاء المعرض'
              )}
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-8 text-center"
          >
            <CheckCircle className="mx-auto mb-4 text-green-400" size={64} />
            <h2 className="text-3xl font-bold text-white mb-2">تم إنشاء المعرض بنجاح!</h2>
            <p className="text-gray-300 mb-6">المعرض: {galleryName}</p>

            {/* Gallery URL */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
              <p className="text-gray-400 text-sm mb-2">رابط المعرض:</p>
              <p className="text-white font-mono break-all">{galleryUrl}</p>
            </div>

            {/* Password */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
              <p className="text-gray-400 text-sm mb-2">كلمة المرور:</p>
              <p className="text-white font-mono text-2xl">{password}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
              >
                {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
                {copied ? 'تم النسخ' : 'نسخ الرابط'}
              </button>
              <button
                onClick={handleShareWhatsApp}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 rounded-xl text-white hover:bg-green-600 transition-colors"
              >
                <Share2 size={20} />
                مشاركة واتساب
              </button>
            </div>

            {/* Create Another */}
            <button
              onClick={handleReset}
              className="mt-6 text-gray-400 hover:text-white transition-colors"
            >
              إنشاء معرض آخر
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
