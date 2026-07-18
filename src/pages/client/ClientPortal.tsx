import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Download,
  LogOut,
  Heart,
  Share2,
  Image as ImageIcon,
  User,
  Home,
  Search,
  Grid,
  List,
  X,
  Star,
  Clock,
  FolderOpen,
  ChevronRight,
  ChevronLeft,
  Menu,
  Bell,
  Play,
  Pause,
  Maximize2,
  SkipBack,
  SkipForward,
  CheckSquare,
  Square
} from 'lucide-react';
import { getClientData, signOut } from '../../services/clientAuth';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function ClientPortal() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [likedPhotos, setLikedPhotos] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [slideshowMode, setSlideshowMode] = useState(false);
  const [slideshowPlaying, setSlideshowPlaying] = useState(false);
  const [slideshowInterval, setSlideshowInterval] = useState<NodeJS.Timeout | null>(null);
  const [selectedPhotosForDownload, setSelectedPhotosForDownload] = useState<Set<number>>(new Set());
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [stats, setStats] = useState({
    totalViews: 0,
    totalDownloads: 0,
    totalShares: 0,
    totalLikes: 0
  });

  // Folder definitions with icons and names
  const folderDefinitions = {
    hall: { name: 'صور القاعة', icon: '🏛️', color: 'from-purple-500 to-indigo-500' },
    session: { name: 'صور الجلسة', icon: '📸', color: 'from-pink-500 to-rose-500' },
    outdoor: { name: 'صور خارجية', icon: '🌳', color: 'from-green-500 to-emerald-500' },
    reels: { name: 'ريلز', icon: '🎬', color: 'from-orange-500 to-red-500' },
    details: { name: 'تفاصيل', icon: '✨', color: 'from-yellow-500 to-amber-500' },
    video: { name: 'فيديو', icon: '🎥', color: 'from-blue-500 to-cyan-500' }
  };

  useEffect(() => {
    loadClientData();
  }, [clientId]);

  const loadClientData = async () => {
    try {
      if (!clientId) return;
      
      const clientData = await getClientData(clientId);
      setClient(clientData);
      
      setEvents([
        {
          id: 'event1',
          title: 'فرح أحمد ومحمد',
          date: '2024-01-15',
          type: 'wedding',
          folders: ['hall', 'session', 'outdoor', 'reels', 'details'],
          coverImage: '',
          totalPhotos: 150,
          rating: 5
        },
        {
          id: 'event2',
          title: 'خطوبة سارة',
          date: '2024-02-20',
          type: 'engagement',
          folders: ['session', 'outdoor'],
          coverImage: '',
          totalPhotos: 80,
          rating: 4
        }
      ]);
    } catch (error) {
      console.error('Error loading client data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      localStorage.removeItem('clientData');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleLike = (photoId: string) => {
    const newLiked = new Set(likedPhotos);
    if (newLiked.has(photoId)) {
      newLiked.delete(photoId);
    } else {
      newLiked.add(photoId);
    }
    setLikedPhotos(newLiked);
  };

  const handleShare = async (photoId: string) => {
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

  const startSlideshow = () => {
    setSlideshowMode(true);
    setSlideshowPlaying(true);
    if (selectedPhoto === null) setSelectedPhoto(0);
    
    const interval = setInterval(() => {
      setSelectedPhoto(prev => {
        if (prev === null) return 0;
        return (prev + 1) % filteredPhotos.length;
      });
    }, 3000);
    
    setSlideshowInterval(interval);
  };

  const stopSlideshow = () => {
    setSlideshowPlaying(false);
    if (slideshowInterval) {
      clearInterval(slideshowInterval);
      setSlideshowInterval(null);
    }
  };

  const toggleSlideshow = () => {
    if (slideshowPlaying) {
      stopSlideshow();
    } else {
      startSlideshow();
    }
  };

  const nextPhoto = () => {
    setSelectedPhoto(prev => {
      if (prev === null) return 0;
      return (prev + 1) % filteredPhotos.length;
    });
  };

  const prevPhoto = () => {
    setSelectedPhoto(prev => {
      if (prev === null) return 0;
      return (prev - 1 + filteredPhotos.length) % filteredPhotos.length;
    });
  };

  const togglePhotoSelection = (photoIndex: number) => {
    const newSelection = new Set(selectedPhotosForDownload);
    if (newSelection.has(photoIndex)) {
      newSelection.delete(photoIndex);
    } else {
      newSelection.add(photoIndex);
    }
    setSelectedPhotosForDownload(newSelection);
  };

  const selectAllPhotos = () => {
    setSelectedPhotosForDownload(new Set(filteredPhotos.map((_, i) => i)));
  };

  const clearSelection = () => {
    setSelectedPhotosForDownload(new Set());
  };

  const downloadSelectedPhotos = () => {
    // In real implementation, this would download the selected photos
    console.log('Downloading photos:', Array.from(selectedPhotosForDownload));
    toast.success(`جاري تحميل ${selectedPhotosForDownload.size} صورة`);
  };

  const filterByDate = (photos: any[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    if (dateFilter === 'all') return photos;
    
    return photos.filter((_, i) => {
      const photoDate = new Date(); // In real implementation, use actual photo date
      if (dateFilter === 'today') {
        return photoDate >= today;
      } else if (dateFilter === 'week') {
        return photoDate >= weekAgo;
      } else if (dateFilter === 'month') {
        return photoDate >= monthAgo;
      }
      return true;
    });
  };

  useEffect(() => {
    return () => {
      if (slideshowInterval) {
        clearInterval(slideshowInterval);
      }
    };
  }, [slideshowInterval]);

  const filteredPhotos = filterByDate([...Array(12)].filter((_, i) => {
    if (!searchQuery) return true;
    return i.toString().includes(searchQuery);
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 relative overflow-hidden" dir="rtl">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Header */}
      <div className="relative z-10 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
            >
              <Menu size={24} className="text-white" />
            </motion.button>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <ImageIcon size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{client?.name || 'مرحباً'}</h1>
              <p className="text-purple-300 text-sm">معرض الصور الخاص بك</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all relative"
            >
              <Bell size={22} className="text-white" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">3</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all shadow-lg shadow-red-500/30"
            >
              <LogOut size={22} className="text-white" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-y-0 left-0 w-80 bg-slate-900/95 backdrop-blur-xl z-50 p-6 border-r border-white/10"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-white">القائمة</h2>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setSidebarOpen(false)}
                className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
              >
                <X size={24} className="text-white" />
              </motion.button>
            </div>
            <div className="space-y-4">
              {[
                { icon: Home, label: "الرئيسية", action: () => { setSelectedEvent(null); setSidebarOpen(false); } },
                { icon: ImageIcon, label: "المعارض", action: () => setSidebarOpen(false) },
                { icon: Heart, label: "المفضلة", action: () => setSidebarOpen(false) },
                { icon: FolderOpen, label: "المجلدات", action: () => setSidebarOpen(false) },
                { icon: User, label: "حسابي", action: () => setSidebarOpen(false) },
              ].map((item, index) => (
                <motion.button
                  key={index}
                  whileTap={{ scale: 0.98 }}
                  onClick={item.action}
                  className="w-full flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-purple-500/30 transition-all"
                >
                  <item.icon size={24} className="text-purple-400" />
                  <span className="text-white font-medium">{item.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 px-6 py-8 pb-24 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {!selectedEvent ? (
            <motion.div
              key="events"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">أحداثك</h2>
                  <p className="text-purple-300">{events.length} حدث متاح</p>
                </div>
                <div className="relative">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="بحث..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-2xl py-3 pr-12 pl-4 text-white placeholder-slate-400 focus:border-purple-500/50 focus:outline-none transition-colors w-72"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.03, y: -10 }}
                    onClick={() => setSelectedEvent(event.id)}
                    className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 cursor-pointer hover:border-purple-500/50 transition-all shadow-2xl overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="relative">
                      <div className="flex items-start justify-between mb-6">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-500/50 flex items-center justify-center">
                          <Calendar size={40} className="text-purple-300" />
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={16} className={i < event.rating ? "text-yellow-400 fill-current" : "text-slate-600"} />
                          ))}
                        </div>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-white mb-3">{event.title}</h3>
                      <div className="flex items-center gap-2 text-purple-300 mb-4">
                        <Clock size={16} />
                        <span>{event.date}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-300">
                          <ImageIcon size={18} />
                          <span className="font-medium">{event.totalPhotos} صورة</span>
                        </div>
                        <div className="flex items-center gap-2 text-purple-400">
                          <FolderOpen size={18} />
                          <span>{event.folders.length} مجلد</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="event"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.3 }}
            >
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedEvent(null)}
                className="flex items-center gap-2 text-purple-300 hover:text-white mb-8 transition-colors text-lg"
              >
                <ChevronRight size={24} />
                العودة للأحداث
              </motion.button>

              {/* Quick Access Folders */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FolderOpen size={24} className="text-purple-400" />
                  الأقسام السريعة
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {events.find((e) => e.id === selectedEvent)?.folders.map((folder: string) => {
                    const folderDef = folderDefinitions[folder as keyof typeof folderDefinitions];
                    if (!folderDef) return null;
                    
                    return (
                      <motion.button
                        key={folder}
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        onClick={() => setSelectedFolder(folder)}
                        className={`relative p-6 rounded-2xl border transition-all ${
                          selectedFolder === folder
                            ? `bg-gradient-to-br ${folderDef.color} border-white/30 shadow-lg`
                            : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-3">
                          <span className="text-4xl">{folderDef.icon}</span>
                          <span className="text-white font-medium text-center">{folderDef.name}</span>
                        </div>
                        {selectedFolder === folder && (
                          <motion.div
                            layoutId="selectedFolder"
                            className="absolute inset-0 border-2 border-white/50 rounded-2xl"
                            initial={false}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div className="grid lg:grid-cols-4 gap-8">
                {/* Folders Sidebar */}
                <div className="lg:col-span-1">
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 sticky top-6">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <FolderOpen size={24} className="text-purple-400" />
                      المجلدات
                    </h3>
                    <div className="space-y-3">
                      {events.find((e) => e.id === selectedEvent)?.folders.map((folder: string) => {
                        const folderDef = folderDefinitions[folder as keyof typeof folderDefinitions];
                        if (!folderDef) return null;
                        
                        return (
                          <motion.button
                            key={folder}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedFolder(folder)}
                            className={`w-full flex items-center gap-4 p-5 rounded-2xl transition-all ${
                              selectedFolder === folder
                                ? `bg-gradient-to-r ${folderDef.color} border border-white/20 text-white shadow-lg`
                                : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:border-purple-500/30'
                            }`}
                          >
                            <span className="text-3xl">{folderDef.icon}</span>
                            <span className="font-medium text-lg">{folderDef.name}</span>
                            {selectedFolder === folder && <ChevronLeft size={20} className="mr-auto" />}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Photos Grid */}
                <div className="lg:col-span-3">
                  {selectedFolder ? (
                    <div>
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-2">
                            {folderDefinitions[selectedFolder as keyof typeof folderDefinitions]?.name || 'صور'}
                          </h3>
                          <p className="text-purple-300">{filteredPhotos.length} صورة</p>
                        </div>
                        
                        {/* Stats Section */}
                        <div className="flex items-center gap-6 bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">{stats.totalViews}</div>
                            <div className="text-xs text-slate-400">مشاهدات</div>
                          </div>
                          <div className="w-px h-8 bg-white/10" />
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">{stats.totalDownloads}</div>
                            <div className="text-xs text-slate-400">تحميلات</div>
                          </div>
                          <div className="w-px h-8 bg-white/10" />
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">{stats.totalShares}</div>
                            <div className="text-xs text-slate-400">مشاركات</div>
                          </div>
                          <div className="w-px h-8 bg-white/10" />
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">{stats.totalLikes}</div>
                            <div className="text-xs text-slate-400">إعجابات</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 mb-6">
                        <div className="relative">
                          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input
                            type="text"
                            placeholder="بحث..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl py-3 pr-12 pl-4 text-white placeholder-slate-400 focus:border-purple-500/50 focus:outline-none transition-colors w-56"
                          />
                        </div>
                        <select
                          value={dateFilter}
                          onChange={(e) => setDateFilter(e.target.value as any)}
                          className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-purple-500/50 focus:outline-none transition-colors"
                        >
                          <option value="all">كل الأوقات</option>
                          <option value="today">اليوم</option>
                          <option value="week">آخر أسبوع</option>
                          <option value="month">آخر شهر</option>
                        </select>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                          className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
                        >
                          {viewMode === 'grid' ? <List size={22} className="text-white" /> : <Grid size={22} className="text-white" />}
                        </motion.button>
                        {selectedPhotosForDownload.size > 0 && (
                          <>
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={clearSelection}
                              className="p-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all"
                            >
                              <X size={22} />
                            </motion.button>
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={downloadSelectedPhotos}
                              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium shadow-lg shadow-purple-500/30 hover:from-purple-600 hover:to-pink-600 transition-all"
                            >
                              <Download size={20} />
                              تحميل {selectedPhotosForDownload.size}
                            </motion.button>
                          </>
                        )}
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={startSlideshow}
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium shadow-lg shadow-purple-500/30 hover:from-purple-600 hover:to-pink-600 transition-all"
                        >
                          <Play size={20} />
                          عرض شرائح
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={selectAllPhotos}
                          className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
                          title="تحديد الكل"
                        >
                          <CheckSquare size={22} className="text-white" />
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium shadow-lg shadow-purple-500/30 hover:from-purple-600 hover:to-pink-600 transition-all"
                        >
                          <Download size={20} />
                          تحميل الكل
                        </motion.button>
                      </div>
                      
                      {/* Photos Grid */}
                      {viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                          {filteredPhotos.map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.05 }}
                              className="relative aspect-square bg-white/5 border border-white/10 rounded-2xl overflow-hidden group cursor-pointer hover:border-purple-500/50 transition-all"
                              onClick={() => setSelectedPhoto(i)}
                            >
                              <div className="absolute inset-0 flex items-center justify-center">
                                <ImageIcon size={40} className="text-slate-600" />
                              </div>
                              
                              {/* Selection Checkbox */}
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => { e.stopPropagation(); togglePhotoSelection(i); }}
                                className={`absolute top-3 right-3 p-2 rounded-lg transition-all ${
                                  selectedPhotosForDownload.has(i)
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-white/20 text-white hover:bg-white/30'
                                }`}
                              >
                                {selectedPhotosForDownload.has(i) ? <CheckSquare size={18} /> : <Square size={18} />}
                              </motion.button>
                              
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center gap-3 pb-4">
                                <motion.button
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => { e.stopPropagation(); toggleLike(`photo-${i}`); }}
                                  className={`p-3 rounded-xl transition-all ${
                                    likedPhotos.has(`photo-${i}`) 
                                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' 
                                      : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                                  }`}
                                >
                                  <Heart size={20} fill={likedPhotos.has(`photo-${i}`) ? 'currentColor' : 'none'} />
                                </motion.button>
                                <motion.button
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => { e.stopPropagation(); handleShare(`photo-${i}`); }}
                                  className="p-3 bg-white/20 text-white rounded-xl hover:bg-white/30 backdrop-blur-sm transition-all"
                                >
                                  <Share2 size={20} />
                                </motion.button>
                                <motion.button
                                  whileTap={{ scale: 0.9 }}
                                  className="p-3 bg-white/20 text-white rounded-xl hover:bg-white/30 backdrop-blur-sm transition-all"
                                >
                                  <Download size={20} />
                                </motion.button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {filteredPhotos.map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -30 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="flex items-center gap-6 bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-purple-500/50 transition-all group cursor-pointer"
                              onClick={() => setSelectedPhoto(i)}
                            >
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => { e.stopPropagation(); togglePhotoSelection(i); }}
                                className={`p-2 rounded-lg transition-all ${
                                  selectedPhotosForDownload.has(i)
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-white/20 text-white hover:bg-white/30'
                                }`}
                              >
                                {selectedPhotosForDownload.has(i) ? <CheckSquare size={18} /> : <Square size={18} />}
                              </motion.button>
                              <div className="w-28 h-28 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                <ImageIcon size={40} className="text-slate-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-white font-bold text-xl mb-2">صورة {i + 1}</h4>
                                <p className="text-slate-400">تفاصيل الصورة</p>
                              </div>
                              <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <motion.button
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => { e.stopPropagation(); toggleLike(`photo-${i}`); }}
                                  className={`p-3 rounded-xl transition-all ${
                                    likedPhotos.has(`photo-${i}`) 
                                      ? 'bg-red-500 text-white' 
                                      : 'bg-white/10 text-white hover:bg-white/20'
                                  }`}
                                >
                                  <Heart size={20} fill={likedPhotos.has(`photo-${i}`) ? 'currentColor' : 'none'} />
                                </motion.button>
                                <motion.button
                                  whileTap={{ scale: 0.9 }}
                                  className="p-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all"
                                >
                                  <Download size={20} />
                                </motion.button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-96 bg-white/5 border border-white/10 rounded-3xl">
                      <FolderOpen size={64} className="text-slate-600 mb-6" />
                      <p className="text-slate-400 text-xl">اختر مجلداً لعرض الصور</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Photo Modal */}
      <AnimatePresence>
        {selectedPhoto !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/95 backdrop-blur-sm"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-6xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedPhoto(null)}
                className="absolute -top-16 left-0 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
              >
                <X size={28} className="text-white" />
              </motion.button>
              
              <div className="aspect-square bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mb-6">
                <ImageIcon size={96} className="text-slate-600" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">صورة {selectedPhoto + 1}</h3>
                  <p className="text-purple-300">تفاصيل الصورة</p>
                </div>
                <div className="flex items-center gap-4">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleLike(selectedPhoto.toString())}
                    className={`p-4 rounded-xl transition-all ${
                      likedPhotos.has(selectedPhoto.toString()) 
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <Heart size={28} fill={likedPhotos.has(selectedPhoto.toString()) ? 'currentColor' : 'none'} />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleShare(selectedPhoto.toString())}
                    className="p-4 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all"
                  >
                    <Share2 size={28} />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleSlideshow}
                    className={`p-4 rounded-xl transition-all ${
                      slideshowPlaying 
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {slideshowPlaying ? <Pause size={28} /> : <Play size={28} />}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSlideshowMode(false)}
                    className="p-4 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all"
                  >
                    <Maximize2 size={28} />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/30"
                  >
                    <Download size={28} />
                  </motion.button>
                </div>
              </div>
              
              {/* Slideshow Navigation */}
              {slideshowMode && (
                <div className="flex items-center justify-center gap-4 mt-6">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={prevPhoto}
                    className="p-4 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all"
                  >
                    <SkipBack size={32} />
                  </motion.button>
                  <div className="text-white text-lg">
                    {selectedPhoto + 1} / {filteredPhotos.length}
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={nextPhoto}
                    className="p-4 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all"
                  >
                    <SkipForward size={32} />
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
