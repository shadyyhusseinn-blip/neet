import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Trash2, Lock, Unlock, Download, Shield,
  CreditCard, Image as ImageIcon, X, Save, Eye, EyeOff, Camera,
  Copy, Edit, Calendar, Phone, User, Upload, Grid3X3, Check,
  AlertCircle, Archive, ExternalLink, FolderOpen, HardDrive, BarChart3
} from 'lucide-react';
import { Gallery } from '../../types';
import { firestoreData } from '../../services/firestoreData';
import { audioService } from '../../services/audio';
import { cn } from '../../lib/utils';

export function GalleryManagement() {
  const navigate = useNavigate();
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImageManagementOpen, setIsImageManagementOpen] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const [newGallery, setNewGallery] = useState({
    clientName: ''
  });

  useEffect(() => {
    const unsubscribe = firestoreData.subscribeToGalleries((data) => {
      setGalleries(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Calculate stats
  const totalGalleries = galleries.length;
  const activeGalleries = galleries.filter(g => g.isVisible !== false).length;
  const totalPhotos = galleries.reduce((sum, g) => sum + (g.photos?.length || 0), 0);
  const storageUsed = (totalPhotos * 2.5).toFixed(1); // Estimate 2.5MB per photo

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateGallery = async () => {
    if (!newGallery.clientName) {
      showToast('الرجاء إدخال اسم العميل', 'error');
      return;
    }

    console.log('📝 Creating gallery with client name:', newGallery.clientName);

    const gallery: Gallery = {
      id: Date.now().toString(),
      clientName: newGallery.clientName,
      eventDate: new Date().toISOString().split('T')[0],
      sessionType: '',
      totalAmount: 0,
      paidAmount: 0,
      remainingAmount: 0,
      hasPasswordProtection: false,
      guestPassword: '',
      clientPassword: '',
      downloadQuality: 'original',
      enableAntiScreenshot: false,
      hasOutstandingBalance: false,
      isPaid: true,
      photos: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isVisible: true,
      showDate: true,
      allowDownload: true,
      sections: {
        session: 'public',
        hall: 'public',
        family: 'public',
      }
    };

    try {
      console.log('💾 Saving gallery to Firestore:', gallery);
      const success = await firestoreData.saveGallery(gallery);
      console.log('✅ Save result:', success);
      
      if (success) {
        audioService.playSuccess();
        showToast('تم إنشاء المعرض بنجاح!', 'success');
        setIsCreateModalOpen(false);
        setNewGallery({ clientName: '' });
      } else {
        showToast('فشل إنشاء المعرض', 'error');
      }
    } catch (error) {
      console.error('❌ Error creating gallery:', error);
      showToast('حدث خطأ أثناء إنشاء المعرض', 'error');
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المعرض؟')) return;
    const success = await firestoreData.deleteGallery(id);
    if (success) {
      audioService.playSuccess();
    }
  };

  const handleTogglePaid = async (gallery: Gallery) => {
    const updated = { ...gallery, isPaid: !gallery.isPaid, updatedAt: new Date().toISOString() };
    const success = await firestoreData.saveGallery(updated);
    if (success) {
      audioService.playClick();
    }
  };

  const copyGalleryLink = (galleryId: string) => {
    const link = `${window.location.origin}/gallery/${galleryId}`;
    navigator.clipboard.writeText(link);
    showToast('تم نسخ رابط المعرض بنجاح!', 'success');
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || !selectedGallery) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const photoId = `${Date.now()}-${i}`;
      
      setUploadProgress(prev => ({ ...prev, [photoId]: 0 }));

      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 50));
        setUploadProgress(prev => ({ ...prev, [photoId]: progress }));
      }

      // In real implementation, upload to Firebase Storage and get URL
      const newPhoto = {
        id: photoId,
        url: URL.createObjectURL(file),
        caption: file.name
      };

      const updatedGallery = {
        ...selectedGallery,
        photos: [...(selectedGallery.photos || []), newPhoto],
        updatedAt: new Date().toISOString()
      };

      await firestoreData.saveGallery(updatedGallery);
      setSelectedGallery(updatedGallery);
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[photoId];
        return newProgress;
      });
    }

    showToast('تم رفع الصور بنجاح!', 'success');
  };

  const handleDeleteImages = async (photoIds: string[]) => {
    if (!selectedGallery) return;

    const updatedPhotos = selectedGallery.photos?.filter(p => !photoIds.includes(p.id)) || [];
    const updatedGallery = {
      ...selectedGallery,
      photos: updatedPhotos,
      updatedAt: new Date().toISOString()
    };

    await firestoreData.saveGallery(updatedGallery);
    setSelectedGallery(updatedGallery);
    setSelectedImages(new Set());
    showToast('تم حذف الصور بنجاح!', 'success');
  };

  const handleSetCover = async (photoId: string) => {
    if (!selectedGallery) return;

    const photo = selectedGallery.photos?.find(p => p.id === photoId);
    if (!photo) return;

    const updatedPhotos = [photo, ...(selectedGallery.photos?.filter(p => p.id !== photoId) || [])];
    const updatedGallery = {
      ...selectedGallery,
      photos: updatedPhotos,
      updatedAt: new Date().toISOString()
    };

    await firestoreData.saveGallery(updatedGallery);
    setSelectedGallery(updatedGallery);
    showToast('تم تعيين صورة الغلاف!', 'success');
  };

  const toggleImageSelection = (photoId: string) => {
    const newSelection = new Set(selectedImages);
    if (newSelection.has(photoId)) {
      newSelection.delete(photoId);
    } else {
      newSelection.add(photoId);
    }
    setSelectedImages(newSelection);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-6 rounded-2xl backdrop-blur-sm bg-white/5 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <FolderOpen size={20} sm:size={24} className="text-purple-400" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-white">{totalGalleries}</p>
              <p className="text-xs sm:text-sm text-gray-400">إجمالي المعارض</p>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6 rounded-2xl backdrop-blur-sm bg-white/5 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Eye size={20} sm:size={24} className="text-green-400" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-white">{activeGalleries}</p>
              <p className="text-xs sm:text-sm text-gray-400">المعارض النشطة</p>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6 rounded-2xl backdrop-blur-sm bg-white/5 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-pink-500/20 flex items-center justify-center">
              <ImageIcon size={20} sm:size={24} className="text-pink-400" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-white">{totalPhotos}</p>
              <p className="text-xs sm:text-sm text-gray-400">إجمالي الصور</p>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6 rounded-2xl backdrop-blur-sm bg-white/5 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <HardDrive size={20} sm:size={24} className="text-blue-400" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-white">{storageUsed}</p>
              <p className="text-xs sm:text-sm text-gray-400">MB مستخدم</p>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">إدارة معارض العملاء</h2>
          <p className="text-sm text-gray-400">إنشاء وإدارة معارض الصور للعملاء</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/30 active:scale-95 min-h-[48px]"
        >
          <Plus size={20} />
          إضافة معرض جديد
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-400">جاري التحميل...</p>
        </div>
      ) : galleries.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
          <ImageIcon size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">لا توجد معارض حالياً</p>
          <p className="text-sm text-gray-500 mt-2">ابدأ بإنشاء معرض جديد للعميل</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {/* Gallery Cards - Enhanced with all actions */}
          {galleries.map((gallery) => (
            <motion.div
              key={gallery.id}
              whileHover={{ y: -4 }}
              className="relative rounded-2xl backdrop-blur-sm bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all duration-300 shadow-lg hover:shadow-purple-500/20 overflow-hidden"
            >
              {/* Thumbnail */}
              <div className="relative aspect-[4/3] bg-gradient-to-br from-purple-900/50 to-pink-900/50">
                {gallery.photos && gallery.photos.length > 0 ? (
                  <img
                    src={gallery.photos[0].url}
                    alt={gallery.clientName}
                    className="w-full h-full object-cover opacity-70 hover:opacity-90 transition-opacity"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera size={48} className="text-white/30" />
                  </div>
                )}
                
                {/* Status badge */}
                <div className="absolute top-3 right-3">
                  <span className={cn(
                    'px-2 py-1 rounded-full text-xs font-bold',
                    gallery.isVisible !== false ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                  )}>
                    {gallery.isVisible !== false ? 'نشط' : 'مخفي'}
                  </span>
                </div>

                {/* Photo count */}
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 rounded-full bg-black/50 text-xs font-bold text-white backdrop-blur-sm">
                    {gallery.photos?.length || 0} صور
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-bold text-white text-base truncate">{gallery.clientName}</h3>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                    <Calendar size={12} />
                    {gallery.eventDate}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-1">{gallery.sessionType || 'Gallery'}</p>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => navigate(`/gallery/${gallery.id}`)}
                    className="flex-1 min-w-[80px] flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-purple-500/20 text-purple-400 text-xs font-bold hover:bg-purple-500/30 transition-all active:scale-95 min-h-[40px]"
                  >
                    <ExternalLink size={14} />
                    معاينة
                  </button>
                  <button
                    onClick={() => copyGalleryLink(gallery.id)}
                    className="flex-1 min-w-[80px] flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-pink-500/20 text-pink-400 text-xs font-bold hover:bg-pink-500/30 transition-all active:scale-95 min-h-[40px]"
                  >
                    <Copy size={14} />
                    نسخ الرابط
                  </button>
                  <button
                    onClick={() => {
                      setSelectedGallery(gallery);
                      setIsImageManagementOpen(true);
                    }}
                    className="flex-1 min-w-[80px] flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-bold hover:bg-blue-500/30 transition-all active:scale-95 min-h-[40px]"
                  >
                    <Grid3X3 size={14} />
                    الصور
                  </button>
                </div>

                {/* Secondary Actions */}
                <div className="flex gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={() => navigate(`/admin/galleries/${gallery.id}`)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-white/5 text-gray-400 text-xs hover:bg-white/10 transition-all active:scale-95 min-h-[40px]"
                  >
                    <Edit size={14} />
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDeleteGallery(gallery.id)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20 transition-all active:scale-95 min-h-[40px]"
                  >
                    <Trash2 size={14} />
                    حذف
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={cn(
              'fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto px-6 py-4 rounded-xl backdrop-blur-sm border shadow-lg z-50',
              toast.type === 'success' 
                ? 'bg-green-500/20 border-green-500/30 text-green-400' 
                : 'bg-red-500/20 border-red-500/30 text-red-400'
            )}
          >
            <div className="flex items-center gap-3">
              {toast.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
              <span className="font-medium">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Gallery Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsCreateModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0d0d15] rounded-2xl border border-white/10 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">إنشاء معرض جديد</h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Client Name Only */}
                <div>
                  <label className="block text-xs font-bold text-pink-300/90 mb-2">اسم العميل *</label>
                  <input
                    type="text"
                    value={newGallery.clientName}
                    onChange={(e) => setNewGallery({ ...newGallery, clientName: e.target.value })}
                    className="w-full h-11 rounded-xl border border-pink-500/20 bg-white/5 px-4 text-sm font-medium text-white outline-none focus:border-pink-500/50 transition-all"
                    placeholder="اسم العميل"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCreateGallery}
                    className="flex-1 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    إنشاء المعرض
                  </button>
                  <button
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 h-12 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Management Modal */}
      <AnimatePresence>
        {isImageManagementOpen && selectedGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsImageManagementOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-[#0d0d15] rounded-2xl border border-white/10 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">إدارة صور: {selectedGallery.clientName}</h3>
                  <p className="text-sm text-gray-400">{selectedGallery.photos?.length || 0} صور</p>
                </div>
                <button
                  onClick={() => setIsImageManagementOpen(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              {/* Upload Area */}
              <div className="mb-6 p-6 rounded-2xl border-2 border-dashed border-white/20 hover:border-purple-500/50 transition-all cursor-pointer bg-white/5">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files)}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="block cursor-pointer">
                  <div className="flex flex-col items-center gap-3">
                    <Upload size={32} className="text-purple-400" />
                    <p className="text-sm text-gray-400">اسحب الصور هنا أو انقر للاختيار</p>
                    <p className="text-xs text-gray-500">يدعم رفع صور متعددة في نفس الوقت</p>
                  </div>
                </label>
              </div>

              {/* Upload Progress */}
              {Object.keys(uploadProgress).length > 0 && (
                <div className="mb-6 space-y-2">
                  {Object.entries(uploadProgress).map(([id, progress]) => (
                    <div key={id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                      <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">{progress}%</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Bulk Actions */}
              {selectedImages.size > 0 && (
                <div className="mb-6 flex flex-wrap gap-2 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                  <span className="text-sm text-purple-300">{selectedImages.size} صور محددة</span>
                  <button
                    onClick={() => handleDeleteImages(Array.from(selectedImages))}
                    className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/30 transition-all"
                  >
                    حذف المحدد
                  </button>
                  <button
                    onClick={() => setSelectedImages(new Set())}
                    className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 text-xs font-bold hover:bg-white/10 transition-all"
                  >
                    إلغاء التحديد
                  </button>
                </div>
              )}

              {/* Images Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {selectedGallery.photos?.map((photo, index) => (
                  <div
                    key={photo.id}
                    className="relative aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10 group"
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Cover indicator */}
                    {index === 0 && (
                      <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-purple-500/80 text-white text-xs font-bold">
                        غلاف
                      </div>
                    )}

                    {/* Selection overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => toggleImageSelection(photo.id)}
                        className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                          selectedImages.has(photo.id) ? 'bg-purple-500 text-white' : 'bg-white/20 text-white'
                        )}
                      >
                        <Check size={16} />
                      </button>
                      {index !== 0 && (
                        <button
                          onClick={() => handleSetCover(photo.id)}
                          className="w-8 h-8 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-all flex items-center justify-center"
                          title="تعيين كغلاف"
                        >
                          <ImageIcon size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteImages([photo.id])}
                        className="w-8 h-8 rounded-lg bg-red-500/50 text-white hover:bg-red-500/70 transition-all flex items-center justify-center"
                        title="حذف"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
