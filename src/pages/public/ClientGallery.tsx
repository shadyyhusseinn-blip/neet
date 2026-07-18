import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Image as ImageIcon, 
  Download, 
  Heart, 
  Share2, 
  Search, 
  Filter, 
  Grid, 
  List, 
  X,
  ZoomIn,
  Calendar,
  User
} from 'lucide-react';

export default function ClientGallery() {
  const [likedPhotos, setLikedPhotos] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = ['all', 'wedding', 'portrait', 'nature', 'events'];
  const categoryLabels = {
    all: 'الكل',
    wedding: 'أفراح',
    portrait: 'بورتريه',
    nature: 'طبيعة',
    events: 'فعاليات'
  };

  const toggleLike = (photoId: number) => {
    const newLiked = new Set(likedPhotos);
    if (newLiked.has(photoId)) {
      newLiked.delete(photoId);
    } else {
      newLiked.add(photoId);
    }
    setLikedPhotos(newLiked);
  };

  const handleShare = async (photoId: number) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'صورة من معرضي',
          text: 'شاهد هذه الصورة الرائعة',
          url: window.location.href
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const filteredPhotos = photos.filter(photo => {
    const matchesSearch = photo.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || photo.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden" dir="rtl">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            معرض الصور
          </h1>
          <p className="text-xl text-slate-400">استعرض صورك المفضلة</p>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="بحث في الصور..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pr-12 pl-4 text-white placeholder-slate-400 focus:border-purple-500/50 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900/50 border border-white/10 rounded-xl p-1">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setFilterCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    filterCategory === category
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </button>
              ))}
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-3 bg-slate-900/50 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
            >
              {viewMode === 'grid' ? <List size={20} className="text-white" /> : <Grid size={20} className="text-white" />}
            </motion.button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { icon: ImageIcon, label: 'إجمالي الصور', value: photos.length },
            { icon: Heart, label: 'المفضلة', value: likedPhotos.size },
            { icon: Download, label: 'التحميلات', value: 0 },
            { icon: Share2, label: 'المشاركات', value: 0 },
          ].map((stat, index) => (
            <div key={index} className="bg-slate-900/50 border border-white/10 rounded-xl p-4 text-center">
              <stat.icon size={24} className="text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-slate-400">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Photos Grid */}
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredPhotos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative group rounded-2xl overflow-hidden aspect-square bg-slate-900/50 border border-white/10 cursor-pointer"
                  onClick={() => setSelectedPhoto(photo.id)}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon size={48} className="text-slate-600" />
                  </div>
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => { e.stopPropagation(); toggleLike(photo.id); }}
                      className={`w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors ${
                        likedPhotos.has(photo.id) ? 'bg-red-500/50' : ''
                      }`}
                    >
                      <Heart size={20} fill={likedPhotos.has(photo.id) ? 'currentColor' : 'none'} />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => { e.stopPropagation(); handleShare(photo.id); }}
                      className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                      <Share2 size={20} />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                      <Download size={20} />
                    </motion.button>
                  </div>

                  {/* Photo Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white font-medium">{photo.title}</p>
                    <p className="text-slate-300 text-sm">{categoryLabels[photo.category as keyof typeof categoryLabels]}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {filteredPhotos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 bg-slate-900/50 border border-white/10 rounded-xl p-4 hover:border-purple-500/30 transition-all group cursor-pointer"
                  onClick={() => setSelectedPhoto(photo.id)}
                >
                  <div className="w-24 h-24 bg-slate-800/50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ImageIcon size={32} className="text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium mb-1">{photo.title}</h3>
                    <p className="text-slate-400 text-sm mb-2">{categoryLabels[photo.category as keyof typeof categoryLabels]}</p>
                    <div className="flex items-center gap-4 text-slate-500 text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {photo.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <User size={14} />
                        {photographer}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => { e.stopPropagation(); toggleLike(photo.id); }}
                      className={`p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors ${
                        likedPhotos.has(photo.id) ? 'bg-red-500/20 text-red-400' : ''
                      }`}
                    >
                      <Heart size={20} fill={likedPhotos.has(photo.id) ? 'currentColor' : 'none'} />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                    >
                      <Download size={20} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {filteredPhotos.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <ImageIcon size={64} className="text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">لا توجد صور مطابقة لبحثك</p>
          </motion.div>
        )}
      </div>

      {/* Photo Modal */}
      <AnimatePresence>
        {selectedPhoto !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-5xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedPhoto(null)}
                className="absolute -top-12 left-0 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
              >
                <X size={24} className="text-white" />
              </motion.button>
              
              <div className="aspect-square bg-slate-900/50 border border-white/10 rounded-2xl flex items-center justify-center mb-4">
                <ImageIcon size={96} className="text-slate-600" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{photos.find(p => p.id === selectedPhoto)?.title}</h3>
                  <p className="text-slate-400">{categoryLabels[photos.find(p => p.id === selectedPhoto)?.category as keyof typeof categoryLabels]}</p>
                </div>
                <div className="flex items-center gap-3">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleLike(selectedPhoto)}
                    className={`p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors ${
                      likedPhotos.has(selectedPhoto) ? 'bg-red-500/20 text-red-400' : ''
                    }`}
                  >
                    <Heart size={24} fill={likedPhotos.has(selectedPhoto) ? 'currentColor' : 'none'} />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleShare(selectedPhoto)}
                    className="p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                  >
                    <Share2 size={24} />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-colors"
                  >
                    <Download size={24} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const photographer = 'المصور المحترف';

const photos = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  title: `صورة ${i + 1}`,
  category: ['wedding', 'portrait', 'nature', 'events'][i % 4] as 'wedding' | 'portrait' | 'nature' | 'events',
  date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('ar-EG')
}));
