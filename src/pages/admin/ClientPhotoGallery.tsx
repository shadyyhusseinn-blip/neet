import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Heart, Share2, X, Grid, List, Lock, CreditCard, Image as ImageIcon, Star, MessageSquare, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { firestoreData } from '../../services/firestoreData';
import { Gallery, Review } from '../../types';
import { getFirestore, doc, getDoc, query, where, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';

// Mock data for client photos
const mockPhotos = [
  { id: 1, url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800', title: 'Portrait 1', date: '2024-01-15' },
  { id: 2, url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', title: 'Portrait 2', date: '2024-01-15' },
  { id: 3, url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800', title: 'Portrait 3', date: '2024-01-15' },
  { id: 4, url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800', title: 'Portrait 4', date: '2024-01-15' },
  { id: 5, url: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=800', title: 'Portrait 5', date: '2024-01-15' },
  { id: 6, url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800', title: 'Portrait 6', date: '2024-01-15' },
  { id: 7, url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800', title: 'Portrait 7', date: '2024-01-15' },
  { id: 8, url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800', title: 'Portrait 8', date: '2024-01-15' },
  { id: 9, url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800', title: 'Portrait 9', date: '2024-01-15' },
  { id: 10, url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800', title: 'Portrait 10', date: '2024-01-15' },
  { id: 11, url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800', title: 'Portrait 11', date: '2024-01-15' },
  { id: 12, url: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=800', title: 'Portrait 12', date: '2024-01-15' },
];

interface ClientPhotoGalleryProps {
  bookingId?: string;
  isClientView?: boolean;
}

export function ClientPhotoGallery({ bookingId, isClientView = false }: ClientPhotoGalleryProps) {
  const [photos, setPhotos] = useState(mockPhotos);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPhoto, setSelectedPhoto] = useState<typeof mockPhotos[0] | null>(null);
  const [galleryLink, setGalleryLink] = useState('');
  const [galleryData, setGalleryData] = useState<Gallery | null>(null);
  const [bookingData, setBookingData] = useState<any>(null);
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Load gallery data from Firestore if bookingId is not 'demo'
  useEffect(() => {
    if (bookingId && bookingId !== 'demo') {
      setLoading(true);
      setError(null);
      
      const loadGallery = async () => {
        try {
          // Firebase gallery loading
          const db = getFirestore();
          const galleryRef = doc(db, 'galleries', bookingId);
          const galleryDoc = await getDoc(galleryRef);
          
          // if (galleryDoc.exists()) {
          //   const gallery = galleryDoc.data() as Gallery;
          //   setGalleryData(gallery);
            
          //   // Load photos from Firestore (Cloudinary URLs are stored there)
          //   if (gallery.photos && gallery.photos.length > 0) {
          //     setPhotos(gallery.photos);
          //   } else {
          //     setPhotos(mockPhotos);
          //   }
            
          //   // If gallery is linked to a booking, fetch booking data
          //   if (gallery.bookingId) {
          //     const booking = await firestoreData.getBookingById(gallery.bookingId);
          //     if (booking) {
          //       setBookingData(booking);
          //       setGalleryData(prev => prev ? {
          //         ...prev,
          //         totalAmount: booking.totalPrice || prev.totalAmount,
          //         paidAmount: booking.paidAmount || prev.paidAmount,
          //         remainingAmount: booking.remainingAmount || prev.remainingAmount,
          //         hasOutstandingBalance: booking.remainingAmount > 0,
          //         isPaid: booking.remainingAmount <= 0
          //       } : null);
          //     }
          //   }
          // } else {
          //   setPhotos(mockPhotos);
          // }

          // Use mock data since Firebase is disabled
          setPhotos(mockPhotos);
        } catch (err) {
          console.error('Error loading gallery:', err);
          setPhotos(mockPhotos);
        } finally {
          setLoading(false);
        }
      };
      
      loadGallery();
    }
  }, [bookingId]);

  // Check if gallery is locked (paywall)
  const isGalleryLocked = galleryData?.hasOutstandingBalance && !galleryData?.isPaid;

  // Anti-screenshot: disable right-click and prevent drag
  useEffect(() => {
    if (galleryData?.enableAntiScreenshot && !isGalleryLocked) {
      const handleContextMenu = (e: MouseEvent) => e.preventDefault();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey && (e.key === 's' || e.key === 'p' || e.key === 'u')) {
          e.preventDefault();
        }
      };

      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [galleryData, isGalleryLocked]);

  const toggleFavorite = async (photoId: number) => {
    const newFavorites = favorites.includes(photoId)
      ? favorites.filter(id => id !== photoId)
      : [...favorites, photoId];
    
    setFavorites(newFavorites);
    
    // Save to Firestore
    if (galleryData?.id) {
      try {
        const db = getFirestore();
        const galleryRef = doc(db, 'galleries', galleryData.id);
        await updateDoc(galleryRef, {
          favorites: newFavorites
        });
      } catch (error) {
        console.error('Error saving favorites:', error);
      }
    }
  };

  const downloadAllPhotos = () => {
    photos.forEach((photo, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = photo.url;
        link.download = `photo_${index + 1}.jpg`;
        link.click();
      }, index * 500);
    });
  };

  const handleLightboxOpen = (index: number) => {
    setSelectedPhotoIndex(index);
    setIsLightboxOpen(true);
  };

  const handleLightboxClose = () => {
    setIsLightboxOpen(false);
    setSelectedPhotoIndex(null);
  };

  const handleNextPhoto = () => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex < photos.length - 1) {
      setSelectedPhotoIndex(selectedPhotoIndex + 1);
    }
  };

  const handlePrevPhoto = () => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(selectedPhotoIndex - 1);
    }
  };

  const handleReviewSubmit = async () => {
    if (!galleryData || !reviewComment.trim()) return;

    const review: Review = {
      id: Date.now().toString(),
      clientName: galleryData.clientName,
      rating: reviewRating,
      comment: reviewComment,
      createdAt: new Date().toISOString()
    };

    try {
      // Firebase review submission
      const db = getFirestore();
      const galleryRef = doc(db, 'galleries', galleryData.id);
      await updateDoc(galleryRef, {
        reviews: arrayUnion(review)
      });
      
      setReviewModalOpen(false);
      setReviewComment('');
      setReviewRating(5);
      alert('شكراً لك! تم إرسال تقييمك بنجاح');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('حدث خطأ أثناء إرسال التقييم');
    }
  };

  const downloadSinglePhoto = async (photoUrl: string, title: string) => {
    try {
      const response = await fetch(photoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title || 'photo'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading photo:', error);
      // Fallback to direct link
      const link = document.createElement('a');
      link.href = photoUrl;
      link.download = `${title || 'photo'}.jpg`;
      link.target = '_blank';
      link.click();
    }
  };

  const generateGalleryLink = () => {
    const link = `${window.location.origin}/gallery/${bookingId || 'demo'}`;
    setGalleryLink(link);
    navigator.clipboard.writeText(link);
    alert('تم نسخ رابط المعرض: ' + link);
  };

  if (isClientView) {
    // Paywall Screen - Gallery is locked
    if (isGalleryLocked) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0d0d15] to-[#080910] text-white flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full text-center"
          >
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-6">
                <Lock size={48} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                مرحباً بك في Shady Studio، صورك جاهزة!
              </h1>
              <p className="text-gray-400 mb-6">
                متبقي عليك مبلغ <span className="text-2xl font-bold text-red-400 mx-2">{galleryData?.remainingAmount || 0}</span> جنيهاً
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard size={24} className="text-green-400" />
                <p className="text-lg font-bold">طريقة الدفع</p>
              </div>
              <p className="text-gray-400 mb-4">
                يرجى تحويل المبلغ عبر فودافون كاش على الرقم:
              </p>
              <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-4 mb-4">
                <p className="text-2xl font-bold text-purple-300">
                  {galleryData?.vodafoneCashNumber || 'غير محدد'}
                </p>
              </div>
              <p className="text-sm text-gray-500">
                وإرسال لقطة الشاشة للمسؤول ليتم تفعيل المعرض فوراً
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
              <ImageIcon size={16} />
              <p>مصور شادي حسين</p>
            </div>
          </motion.div>
        </div>
      );
    }

    // Password Protection Screen
    if (galleryData?.hasPasswordProtection && !isPasswordRequired) {
      setIsPasswordRequired(true);
    }

    if (isPasswordRequired && galleryData?.hasPasswordProtection) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0d0d15] to-[#080910] text-white flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full"
          >
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                  <Lock size={32} className="text-purple-400" />
                </div>
                <h1 className="text-2xl font-bold mb-2">معرض محمي</h1>
                <p className="text-gray-400">أدخل كلمة المرور للوصول إلى الصور</p>
              </div>

              <div className="space-y-4">
                <input
                  type="password"
                  value={enteredPassword}
                  onChange={(e) => setEnteredPassword(e.target.value)}
                  className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none focus:border-purple-500/50 transition-all"
                  placeholder="كلمة مرور الضيف أو العميل"
                />
                <button
                  onClick={() => {
                    if (enteredPassword === galleryData.guestPassword || enteredPassword === galleryData.clientPassword) {
                      setIsPasswordRequired(false);
                    } else {
                      alert('كلمة المرور غير صحيحة');
                    }
                  }}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  دخول
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      );
    }

    // Main Gallery View
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0d0d15] to-[#080910] text-white">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  معرض الصور
                </h1>
                <p className="text-sm text-gray-400 mt-1">استمتع بلحظاتك الثمينة</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                  title={viewMode === 'grid' ? 'عرض قائمة' : 'عرض شبكي'}
                >
                  {viewMode === 'grid' ? <List size={20} /> : <Grid size={20} />}
                </button>
                <button
                  onClick={downloadAllPhotos}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  <Download size={18} />
                  <span className="hidden sm:inline">تحميل الكل</span>
                </button>
                <button
                  onClick={() => setReviewModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all"
                >
                  <MessageSquare size={18} />
                  <span className="hidden sm:inline">اترك تقييم</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        {galleryData && photos.length > 0 && (
          <div className="relative h-64 sm:h-96 w-full overflow-hidden">
            <img
              src={photos[0].url}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <h1 className="text-3xl sm:text-5xl font-bold text-white mb-2">
                {galleryData.clientName}
              </h1>
              {galleryData.sessionType && (
                <p className="text-lg sm:text-xl text-pink-300 font-medium">
                  {galleryData.sessionType}
                </p>
              )}
              <p className="text-sm text-gray-300 mt-2">
                {galleryData.eventDate}
              </p>
            </div>
          </div>
        )}

        {/* Gallery */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className={cn(
            'grid gap-4',
            viewMode === 'grid'
              ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
              : 'grid-cols-1'
          )}>
            {photos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10',
                  viewMode === 'list' ? 'flex gap-4 p-4' : 'aspect-square'
                )}
              >
                <img
                  src={photo.url}
                  alt={photo.title}
                  className={cn(
                    'w-full h-full object-cover transition-transform duration-500 group-hover:scale-110',
                    viewMode === 'list' ? 'w-32 h-32 rounded-xl' : '',
                    isGalleryLocked ? 'blur-xl' : ''
                  )}
                  onClick={() => !isGalleryLocked && handleLightboxOpen(index)}
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-sm font-bold text-white mb-2">{photo.title}</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(photo.id);
                        }}
                        className={cn(
                          'p-2 rounded-full transition-all',
                          favorites.includes(photo.id)
                            ? 'bg-pink-500 text-white'
                            : 'bg-white/20 text-white hover:bg-pink-500'
                        )}
                      >
                        <Heart size={16} className={cn(favorites.includes(photo.id) && 'fill-current')} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadSinglePhoto(photo.url, photo.title);
                        }}
                        className="p-2 rounded-full bg-white/20 text-white hover:bg-purple-500 transition-all"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Favorite Badge */}
                {favorites.includes(photo.id) && (
                  <div className="absolute top-3 right-3">
                    <div className="p-2 rounded-full bg-pink-500 text-white">
                      <Heart size={16} className="fill-current" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Favorites Count */}
          {favorites.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-500/30"
            >
              ❤️ {favorites.length} صورة مفضلة
            </motion.div>
          )}
        </main>

        {/* Photo Modal */}
        <AnimatePresence>
          {selectedPhoto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
              onClick={() => setSelectedPhoto(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative max-w-5xl max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.title}
                  className="max-w-full max-h-[90vh] object-contain rounded-2xl"
                />
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all"
                >
                  <X size={24} />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Admin View
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">معرض الصور</h3>
          <p className="text-sm text-gray-400">إدارة صور العميل</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={generateGalleryLink}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            <Share2 size={18} />
            توليد رابط المعرض
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all">
            <Download size={18} />
            رفع صور
          </button>
        </div>
      </div>

      {galleryLink && (
        <div className="p-4 rounded-xl bg-purple-500/20 border border-purple-500/30">
          <p className="text-sm font-bold text-purple-300 mb-2">رابط المعرض:</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={galleryLink}
              readOnly
              className="flex-1 bg-black/30 border border-purple-500/30 rounded-lg px-3 py-2 text-sm text-purple-200"
            />
            <button
              onClick={() => navigator.clipboard.writeText(galleryLink)}
              className="px-4 py-2 rounded-lg bg-purple-500 text-white font-bold text-sm hover:bg-purple-600 transition-all"
            >
              نسخ
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div key={photo.id} className="aspect-square rounded-xl bg-white/5 border border-white/10 overflow-hidden group">
            <img
              src={photo.url}
              alt={photo.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </div>
        ))}
      </div>

      <div className="text-center py-8">
        <p className="text-sm text-gray-400">عرض {photos.length} صورة تجريبية</p>
      </div>

      {/* Reviews Section */}
      {galleryData && galleryData.reviews && galleryData.reviews.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h2 className="text-2xl font-bold text-white mb-6">التقييمات</h2>
          <div className="grid gap-4">
            {galleryData.reviews.map((review) => (
              <div key={review.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-400">{review.clientName}</span>
                </div>
                <p className="text-white">{review.comment}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Review Modal */}
      <AnimatePresence>
        {reviewModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setReviewModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">اترك تقييمك</h3>
                <button
                  onClick={() => setReviewModalOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-white mb-2">التقييم</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setReviewRating(rating)}
                        className="text-2xl"
                      >
                        <Star
                          size={32}
                          className={rating <= reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-white mb-2">تعليقك</label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full h-32 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-purple-500/50 transition-all resize-none"
                    placeholder="اكتب تجربتك معنا..."
                  />
                </div>
                <button
                  onClick={handleReviewSubmit}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  إرسال التقييم
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && selectedPhotoIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
            onClick={handleLightboxClose}
          >
            <button
              onClick={handleLightboxClose}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X size={32} />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevPhoto();
              }}
              disabled={selectedPhotoIndex === 0}
              className="absolute left-4 text-white hover:text-gray-300 z-10 disabled:opacity-30"
            >
              <ChevronLeft size={48} />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNextPhoto();
              }}
              disabled={selectedPhotoIndex === photos.length - 1}
              className="absolute right-4 text-white hover:text-gray-300 z-10 disabled:opacity-30"
            >
              <ChevronRight size={48} />
            </button>

            <img
              src={photos[selectedPhotoIndex].url}
              alt={photos[selectedPhotoIndex].title}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
