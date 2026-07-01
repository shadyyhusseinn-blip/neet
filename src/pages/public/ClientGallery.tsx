import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Unlock, Download, X, AlertCircle, CheckCircle, Image as ImageIcon, Heart, Share2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { Gallery, GalleryPhoto } from '../../types';
import { generateSignedUrl } from '../../services/imagekit';

export default function ClientGallery() {
  const { galleryId } = useParams<{ galleryId: string }>();
  const navigate = useNavigate();
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLocked, setIsLocked] = useState(true);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);

  useEffect(() => {
    if (galleryId) {
      loadGallery(galleryId);
    }
  }, [galleryId]);

  const loadGallery = async (id: string) => {
    try {
      setLoading(true);
      const db = getFirestore();
      const galleryRef = doc(db, 'galleries', id);
      const galleryDoc = await getDoc(galleryRef);

      if (!galleryDoc.exists()) {
        setError('المعرض غير موجود');
        setLoading(false);
        return;
      }

      const galleryData = { id: galleryDoc.id, ...galleryDoc.data() } as Gallery;
      setGallery(galleryData);

      // Check if gallery has password protection
      if (galleryData.hasPasswordProtection) {
        setIsLocked(true);
      } else {
        setIsLocked(false);
        loadGalleryPhotos(galleryData);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading gallery:', err);
      setError('حدث خطأ أثناء تحميل المعرض');
      setLoading(false);
    }
  };

  const loadGalleryPhotos = async (galleryData: Gallery) => {
    if (!galleryData.imagekitPaths || galleryData.imagekitPaths.length === 0) {
      setPhotos([]);
      return;
    }

    try {
      setLoadingImages(true);
      const photosWithSignedUrls: GalleryPhoto[] = [];

      // Generate signed URLs for all images (30-minute expiry)
      for (let i = 0; i < galleryData.imagekitPaths.length; i++) {
        const imagePath = galleryData.imagekitPaths[i];
        const signedUrl = await generateSignedUrl(imagePath);
        
        const photo: GalleryPhoto = {
          id: galleryData.photos?.[i]?.id || `photo-${i}`,
          url: signedUrl,
          name: galleryData.photos?.[i]?.name || `photo-${i}`,
          size: galleryData.photos?.[i]?.size || 0,
          uploadedAt: galleryData.photos?.[i]?.uploadedAt || new Date().toISOString(),
          title: galleryData.photos?.[i]?.title || '',
          imagekitFileId: galleryData.imagekitFileIds?.[i],
          imagekitPath: imagePath,
          signedUrl: signedUrl,
          signedUrlExpiry: Date.now() + (30 * 60 * 1000), // 30 minutes from now
        };

        photosWithSignedUrls.push(photo);
      }

      setPhotos(photosWithSignedUrls);
      
      // Increment view count
      const db = getFirestore();
      await updateDoc(doc(db, 'galleries', galleryData.id), {
        viewCount: (galleryData.viewCount || 0) + 1,
      });
    } catch (err) {
      console.error('Error loading photos:', err);
      toast.error('حدث خطأ أثناء تحميل الصور');
    } finally {
      setLoadingImages(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!gallery) return;

    // Verify password (simple hash comparison)
    const inputHash = btoa(password);
    if (inputHash === gallery.passwordHash) {
      setIsLocked(false);
      setPasswordError('');
      loadGalleryPhotos(gallery);
      toast.success('تم فتح المعرض بنجاح');
    } else {
      setPasswordError('كلمة المرور غير صحيحة');
    }
  };

  const handleRefreshSignedUrls = async () => {
    if (!gallery) return;
    
    toast.info('جاري تحديث روابط الصور...');
    await loadGalleryPhotos(gallery);
    toast.success('تم تحديث الروابط بنجاح');
  };

  const toggleFavorite = (photoId: string) => {
    const newFavorites = favorites.includes(parseInt(photoId))
      ? favorites.filter(id => id !== parseInt(photoId))
      : [...favorites, parseInt(photoId)];
    setFavorites(newFavorites);
  };

  const downloadImage = async (photo: GalleryPhoto) => {
    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = photo.name || 'photo.jpg';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('تم تحميل الصورة بنجاح');
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('فشل تحميل الصورة');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold text-white mb-2">خطأ</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  if (isLocked && gallery) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full"
        >
          <div className="text-center mb-8">
            <Lock className="text-purple-400 mx-auto mb-4" size={64} />
            <h1 className="text-3xl font-bold text-white mb-2">{gallery.title}</h1>
            <p className="text-gray-300">يرجى إدخال كلمة المرور للوصول إلى المعرض</p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة المرور"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all"
              />
              {passwordError && (
                <p className="text-red-400 text-sm mt-2">{passwordError}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all"
            >
              فتح المعرض
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              للعميل: {gallery.clientName}
            </p>
            {gallery.eventDate && (
              <p className="text-gray-400 text-sm mt-1">
                التاريخ: {new Date(gallery.eventDate).toLocaleDateString('ar-EG')}
              </p>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-lg border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{gallery?.title}</h1>
              <p className="text-gray-400 text-sm">
                {gallery?.clientName} • {photos.length} صورة
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRefreshSignedUrls}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                title="تحديث الروابط"
              >
                <Unlock size={20} className="text-white" />
              </button>
              {gallery?.allowDownload && (
                <button
                  onClick={() => {
                    photos.forEach(photo => downloadImage(photo));
                  }}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                  title="تحميل الكل"
                >
                  <Download size={20} className="text-white" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loadingImages ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-white">جاري تحميل الصور...</p>
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon size={64} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">لا توجد صور في هذا المعرض</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="relative group cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img
                  src={photo.url}
                  alt={photo.title || `Photo ${index + 1}`}
                  className="w-full aspect-square object-cover rounded-xl transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(photo.id);
                      }}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all"
                    >
                      <Heart
                        size={20}
                        className={favorites.includes(parseInt(photo.id)) ? 'text-red-500 fill-red-500' : 'text-white'}
                      />
                    </button>
                    {gallery?.allowDownload && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadImage(photo);
                        }}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all"
                      >
                        <Download size={20} className="text-white" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPhoto(null);
              }}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all"
            >
              <X size={24} className="text-white" />
            </button>
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.title || 'Selected photo'}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
