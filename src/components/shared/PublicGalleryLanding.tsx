import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Lock, Eye } from 'lucide-react';
import { Gallery } from '../../types';
import { firestoreData } from '../../services/firestoreData';

export default function PublicGalleryLanding() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [lockedGallery, setLockedGallery] = useState<Gallery | null>(null);
  const [passwordState, setPasswordState] = useState<'initial' | 'entering'>('initial');
  const [enteredPassword, setEnteredPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const unsubscribe = firestoreData.subscribeToGalleries((data) => {
      setGalleries(data.filter(g => g.isPublished && g.showOnHomepage));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGalleryClick = (gallery: Gallery) => {
    if (gallery.guestPassword) {
      setLockedGallery(gallery);
      setPasswordState('initial');
      setEnteredPassword('');
    } else {
      // Navigate to gallery view
      window.location.href = `/gallery/${gallery.id}`;
    }
  };

  const handlePasswordSubmit = () => {
    if (enteredPassword === lockedGallery?.guestPassword) {
      // Navigate to gallery view
      window.location.href = `/gallery/${lockedGallery.id}`;
    } else {
      alert('كلمة المرور غير صحيحة');
    }
  };

  if (lockedGallery) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Background with cover image */}
        <div className="absolute inset-0">
          <img
            src={lockedGallery.coverImage || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1920'}
            alt="Gallery Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-serif text-white mb-2">
              {lockedGallery.title}
            </h1>
            <p className="text-sm md:text-base text-gray-300 tracking-widest uppercase">
              Private Gallery Access
            </p>
          </motion.div>

          {/* Password Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            {passwordState === 'initial' ? (
              <div
                onClick={() => setPasswordState('entering')}
                className="bg-white rounded-2xl p-8 cursor-pointer hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                    <Lock size={32} className="text-amber-700" />
                  </div>
                  <p className="text-xl font-semibold text-gray-800">Guest Access</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8">
                <button
                  onClick={() => setPasswordState('initial')}
                  className="text-sm text-gray-500 hover:text-gray-800 mb-6 flex items-center gap-2"
                >
                  ← Back to Selection
                </button>
                
                <p className="text-sm text-gray-500 mb-4">ENTER CODE</p>
                
                <div className="relative mb-6">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={enteredPassword}
                    onChange={(e) => setEnteredPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                    className="w-full text-2xl md:text-3xl font-light tracking-wider text-gray-800 border-b-2 border-gray-200 focus:border-amber-500 outline-none pb-2 bg-transparent"
                    placeholder="••••••"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <Eye size={24} />
                  </button>
                </div>
                
                <button
                  onClick={handlePasswordSubmit}
                  className="w-full py-4 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-xl transition-all duration-300"
                >
                  ENTER →
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0d0d15] to-[#080910] text-white">
      {/* Header */}
      <div className="py-12 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          شادي حسين
        </h1>
        <p className="text-gray-400 text-lg">معرض الصور الخاص بعملائنا</p>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-400">جاري التحميل...</p>
          </div>
        ) : galleries.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400">لا توجد معارض حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 justify-items-center">
            {galleries.map((gallery, index) => (
              <motion.div
                key={gallery.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleGalleryClick(gallery)}
                className="cursor-pointer group"
              >
                {/* Circular Card */}
                <div className="relative w-40 h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 rounded-full overflow-hidden border-4 border-white/10 group-hover:border-purple-500/50 transition-all duration-300 shadow-lg group-hover:shadow-purple-500/20">
                  {gallery.coverImage ? (
                    <img
                      src={gallery.coverImage}
                      alt={gallery.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center">
                      <span className="text-4xl text-white/30">
                        {gallery.title.charAt(0)}
                      </span>
                    </div>
                  )}
                  
                  {/* Lock Icon */}
                  {gallery.guestPassword && (
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                      <Lock size={16} className="text-white" />
                    </div>
                  )}
                </div>

                {/* Title */}
                <div className="text-center mt-4">
                  <h3 className="text-white font-semibold text-sm md:text-base truncate max-w-[160px] md:max-w-[192px] lg:max-w-[224px] mx-auto">
                    {gallery.title}
                  </h3>
                  {gallery.showDateOnCover && (
                    <p className="text-gray-400 text-xs mt-1">
                      {gallery.eventDate}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
