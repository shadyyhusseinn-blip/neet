import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Camera, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Gallery } from '../../types';
import { firestoreData } from '../../services/firestoreData';
import { cn } from '../../lib/utils';

export default function PublicGalleries() {
  const navigate = useNavigate();
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubscribe = firestoreData.subscribeToGalleries((updatedGalleries) => {
      setGalleries(updatedGalleries.filter(g => g.photos && g.photos.length > 0));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredGalleries = galleries.filter(gallery =>
    gallery.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (gallery.sessionType && gallery.sessionType.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0d0d15] to-[#080910] text-white">
      {/* Header Banner */}
      <div className="relative h-48 bg-gradient-to-r from-purple-900/50 to-pink-900/50 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0f]/50 to-[#0a0a0f]" />
        <div className="relative z-10 text-center px-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Camera size={32} className="text-purple-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            SHADY HUSSEIN PHOTOGRAPHY
          </h1>
          <p className="text-gray-400 text-sm">معرض الصور الخاص بعملائنا</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto px-4 -mt-6 relative z-20">
        <div className="relative">
          <Search size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search galleries..."
            className="w-full h-12 rounded-full bg-white/5 border border-white/10 pl-4 pr-12 text-white outline-none focus:border-purple-500/50 transition-all"
          />
        </div>
      </div>

      {/* Galleries Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">جاري التحميل...</p>
          </div>
        ) : filteredGalleries.length === 0 ? (
          <div className="text-center py-12">
            <Camera size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">
              {searchQuery ? 'لم يتم العثور على معارض مطابقة' : 'لا توجد معارض حالياً'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredGalleries.map((gallery) => (
              <motion.div
                key={gallery.id}
                whileHover={{ scale: 1.05 }}
                className="relative aspect-square rounded-full bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all group cursor-pointer overflow-hidden"
                onClick={() => navigate(`/gallery/${gallery.id}`)}
              >
                {/* Thumbnail */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-pink-900/50">
                  {gallery.photos && gallery.photos.length > 0 ? (
                    <img
                      src={gallery.photos[0].url}
                      alt={gallery.clientName}
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera size={48} className="text-white/30" />
                    </div>
                  )}
                </div>

                {/* Status indicator */}
                <div className="absolute top-2 right-2">
                  <div className={cn(
                    'w-3 h-3 rounded-full',
                    gallery.isPaid ? 'bg-green-400' : 'bg-red-400'
                  )} />
                </div>

                {/* Client name */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-sm font-bold text-white text-center truncate">{gallery.clientName}</p>
                  <p className="text-xs text-gray-300 text-center truncate">{gallery.sessionType || 'Gallery'}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
