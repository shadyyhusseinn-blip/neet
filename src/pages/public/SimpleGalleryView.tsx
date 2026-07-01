/**
 * Simple Gallery View Page
 * صفحة عرض المعرض للعميل
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Download, Eye, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { firebaseService } from '../../services/firebase';
import { useLocation } from 'react-router-dom';

export default function SimpleGalleryView() {
  const location = useLocation();
  const id = location.pathname.split('/gallery/')[1];
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [gallery, setGallery] = useState<any>(null);
  const [error, setError] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    loadGallery();
  }, [location.pathname]);

  const loadGallery = async () => {
    try {
      console.log('🚀 Loading gallery with ID:', id);
      
      if (!id) {
        throw new Error('Gallery ID is missing from URL');
      }
      
      const db = firebaseService.getDB();
      
      if (!db) {
        throw new Error('Firebase Firestore is not initialized');
      }
      
      console.log('✅ Firestore initialized');
      console.log('📝 Fetching gallery document...');
      
      const galleryDoc = await getDoc(doc(db, 'galleries', id));
      
      console.log('📄 Gallery document exists:', galleryDoc.exists());
      
      if (galleryDoc.exists()) {
        const galleryData = galleryDoc.data();
        console.log('📊 Gallery data:', galleryData);
        console.log('🖼️ Photos count:', galleryData.photos?.length);
        
        setGallery(galleryData);
        setLoading(false);
      } else {
        console.error('❌ Gallery not found');
        setError('المعرض غير موجود');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('❌ Error loading gallery:', err);
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        stack: err.stack
      });
      setError('حدث خطأ أثناء تحميل المعرض: ' + (err.message || 'خطأ غير معروف'));
      setLoading(false);
    }
  };

  const handleLogin = () => {
    if (password === gallery.password) {
      setAuthenticated(true);
    } else {
      setError('كلمة المرور غير صحيحة');
    }
  };

  const handleDownload = (base64: string, name: string) => {
    const link = document.createElement('a');
    link.href = base64;
    link.download = name;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-400" size={48} />
      </div>
    );
  }

  if (error && !gallery) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex items-center justify-center">
        <div className="text-center">
          <X className="mx-auto mb-4 text-red-400" size={64} />
          <p className="text-white text-xl">{error}</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md w-full"
        >
          <Lock className="mx-auto mb-4 text-purple-400" size={48} />
          <h1 className="text-2xl font-bold text-white text-center mb-2">{gallery?.name}</h1>
          <p className="text-gray-400 text-center mb-6">أدخل كلمة المرور لعرض المعرض</p>
          
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة المرور"
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 mb-4"
          />
          
          {error && (
            <p className="text-red-400 text-sm mb-4">{error}</p>
          )}
          
          <button
            onClick={handleLogin}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            عرض المعرض
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">{gallery?.name}</h1>
          <p className="text-gray-400">{gallery?.photoCount} صورة</p>
        </motion.div>

        {/* Photos Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {gallery?.photos?.map((photo: any, index: number) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group"
              onClick={() => setSelectedPhoto(photo.url)}
            >
              <img
                src={photo.url}
                alt={photo.name}
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(photo.url, photo.name);
                  }}
                  className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                >
                  <Download size={24} className="text-white" />
                </button>
                <Eye size={24} className="text-white" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Photo Modal */}
        <AnimatePresence>
          {selectedPhoto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedPhoto(null)}
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              >
                <X size={24} className="text-white" />
              </button>
              <img
                src={selectedPhoto}
                alt="Selected photo"
                className="max-w-full max-h-full object-contain"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
