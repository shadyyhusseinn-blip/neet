import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Check, Lock, Shield } from 'lucide-react';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

interface Photo {
  id: string;
  url: string;
  isSelected: boolean;
  thumbnailUrl?: string;
}

interface ClientSelectionPanelProps {
  bookingId: string;
  photos: Photo[];
  maxSelection: number;
  currentSelection: number;
  onSelectionChange?: (selectedPhotos: string[]) => void;
  onConfirm?: () => void;
}

export default function ClientSelectionPanel({
  bookingId,
  photos,
  maxSelection,
  currentSelection,
  onSelectionChange,
  onConfirm
}: ClientSelectionPanelProps) {
  const db = getFirestore();
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmSuccess, setConfirmSuccess] = useState(false);

  // Initialize selected photos from props
  useEffect(() => {
    const initialSelected = new Set(photos.filter(p => p.isSelected).map(p => p.id));
    setSelectedPhotos(initialSelected);
  }, [photos]);

  const togglePhotoSelection = (photoId: string) => {
    const newSelection = new Set(selectedPhotos);
    
    if (newSelection.has(photoId)) {
      newSelection.delete(photoId);
    } else if (newSelection.size < maxSelection) {
      newSelection.add(photoId);
    } else {
      // Show warning that max limit reached
      alert(`يمكنك اختيار ${maxSelection} صورة فقط`);
      return;
    }
    
    setSelectedPhotos(newSelection);
    onSelectionChange?.(Array.from(newSelection) as string[]);
  };

  const handleConfirmSelection = async () => {
    if (selectedPhotos.size === 0) {
      alert('الرجاء اختيار صورة واحدة على الأقل');
      return;
    }

    setIsConfirming(true);
    try {
      // Update booking in Firestore
      await updateDoc(doc(db, 'bookings', bookingId), {
        selectedPhotos: Array.from(selectedPhotos),
        status: 'editing',
        selectionConfirmedAt: new Date().toISOString()
      });

      setConfirmSuccess(true);
      onConfirm?.();

      setTimeout(() => setConfirmSuccess(false), 3000);
    } catch (error) {
      console.error('Error confirming selection:', error);
      alert('حدث خطأ أثناء تأكيد الاختيار');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="w-full bg-[#050508] text-white font-['Cairo','Tajawal',sans-serif]" dir="rtl">
      {/* Header with Counter */}
      <div className="sticky top-0 z-50 bg-[#050508]/95 backdrop-blur-xl border-b border-white/10 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Shield size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  اختيار الصور
                </h2>
                <p className="text-gray-400 text-sm">
                  اختر الصور التي تريدها من الجلسة
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2">
                <span className="text-gray-400 text-sm">المختار:</span>
                <span className="text-white font-bold mr-2">
                  {selectedPhotos.size} / {maxSelection}
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirmSelection}
                disabled={isConfirming || selectedPhotos.size === 0}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {confirmSuccess ? (
                  <>
                    <Check size={18} />
                    تم التأكيد
                  </>
                ) : isConfirming ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    جاري التأكيد...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    تأكيد الاختيار النهائي
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Photos Grid */}
      <div className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            <AnimatePresence>
              {photos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative group"
                >
                  {/* Image Container */}
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10">
                    {/* Image */}
                    <img
                      src={photo.thumbnailUrl || photo.url}
                      alt={`Photo ${photo.id}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Watermark Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-black/30 backdrop-blur-sm px-4 py-2 rounded-lg">
                        <p className="text-white/70 text-xs font-semibold tracking-wider">
                          Shady Hussein Photography
                        </p>
                      </div>
                    </div>

                    {/* Lock Icon (Protection) */}
                    <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-full p-1.5">
                      <Lock size={14} className="text-white/70" />
                    </div>

                    {/* Selection Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => togglePhotoSelection(photo.id)}
                      className={`absolute bottom-2 left-2 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        selectedPhotos.has(photo.id)
                          ? 'bg-gradient-to-br from-pink-500 to-red-500 text-white shadow-lg shadow-pink-500/30'
                          : 'bg-black/50 backdrop-blur-sm text-white/70 hover:bg-black/70'
                      }`}
                    >
                      <Heart
                        size={18}
                        className={selectedPhotos.has(photo.id) ? 'fill-current' : ''}
                      />
                    </motion.button>

                    {/* Selection Indicator */}
                    {selectedPhotos.has(photo.id) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 left-2 bg-gradient-to-br from-pink-500 to-red-500 rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        <Check size={12} className="text-white" />
                      </motion.div>
                    )}
                  </div>

                  {/* Photo Number */}
                  <div className="mt-2 text-center">
                    <span className="text-gray-400 text-sm">#{index + 1}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Empty State */}
          {photos.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <Shield size={64} className="text-gray-600 mb-4" />
              <p className="text-gray-400 text-lg">لا توجد صور متاحة حالياً</p>
              <p className="text-gray-500 text-sm mt-2">سيتم إضافة الصور بعد معالجة الجلسة</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#050508]/95 backdrop-blur-xl border-t border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Shield size={16} />
            <span>الصور محمية بعلامة مائية حتى الدفع</span>
          </div>
          <div className="text-gray-400 text-sm">
            <span className="text-white font-semibold">{selectedPhotos.size}</span> من {maxSelection} صورة مختارة
          </div>
        </div>
      </div>
    </div>
  );
}
