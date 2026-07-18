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
  Settings
} from 'lucide-react';
import { getClientData, signOut } from '../../services/clientAuth';
import { motion, AnimatePresence } from 'motion/react';

export default function ClientPortal() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [likedPhotos, setLikedPhotos] = useState<Set<string>>(new Set());

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
          folders: ['hall', 'session', 'outdoor'],
          coverImage: '',
          totalPhotos: 150
        },
        {
          id: 'event2',
          title: 'خطوبة سارة',
          date: '2024-02-20',
          type: 'engagement',
          folders: ['session', 'outdoor'],
          coverImage: '',
          totalPhotos: 80
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden" dir="rtl">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-orange-600/20 to-amber-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-pink-600/20 to-rose-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <div className="relative z-10 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <ImageIcon size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{client?.name || 'مرحباً'}</h1>
              <p className="text-slate-400 text-sm">معرض الصور الخاص بك</p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
          >
            <LogOut size={20} className="text-white" />
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-6 py-8 pb-24 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {!selectedEvent ? (
            <motion.div
              key="events"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6">أحداثك</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    onClick={() => setSelectedEvent(event.id)}
                    className="bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 cursor-pointer hover:border-orange-500/30 transition-all shadow-lg"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center">
                        <Calendar size={32} className="text-orange-400" />
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <ImageIcon size={16} />
                        <span className="text-sm">{event.totalPhotos} صورة</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{event.title}</h3>
                    <p className="text-slate-400 text-sm mb-4">{event.date}</p>
                    <div className="flex flex-wrap gap-2">
                      {event.folders.map((folder: string) => (
                        <span key={folder} className="px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded-full text-xs text-orange-400">
                          {folder === 'hall' ? 'القاعة' : folder === 'session' ? 'الجلسة' : 'خارجي'}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="event"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedEvent(null)}
                className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
              >
                ← العودة للأحداث
              </motion.button>

              <div className="grid md:grid-cols-4 gap-6">
                {/* Folders Sidebar */}
                <div className="md:col-span-1">
                  <div className="bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                    <h3 className="text-lg font-bold text-white mb-4">المجلدات</h3>
                    <div className="space-y-2">
                      {events.find((e) => e.id === selectedEvent)?.folders.map((folder: string) => (
                        <motion.button
                          key={folder}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedFolder(folder)}
                          className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                            selectedFolder === folder
                              ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 text-orange-400'
                              : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          <ImageIcon size={20} />
                          <span className="font-medium">{folder === 'hall' ? 'القاعة' : folder === 'session' ? 'الجلسة' : 'خارجي'}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Photos Grid */}
                <div className="md:col-span-3">
                  {selectedFolder ? (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white">
                          {selectedFolder === 'hall' ? 'صور القاعة' : selectedFolder === 'session' ? 'صور الجلسة' : 'صور خارجية'}
                        </h3>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white font-medium shadow-lg shadow-orange-500/30"
                        >
                          <Download size={18} />
                          تحميل الكل
                        </motion.button>
                      </div>
                      
                      {/* Photos Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(12)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="relative aspect-square bg-slate-900/50 border border-white/10 rounded-xl overflow-hidden group"
                          >
                            <div className="absolute inset-0 flex items-center justify-center">
                              <ImageIcon size={32} className="text-slate-600" />
                            </div>
                            
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => toggleLike(`photo-${i}`)}
                                className={`p-2 rounded-full transition-colors ${
                                  likedPhotos.has(`photo-${i}`) 
                                    ? 'bg-red-500 text-white' 
                                    : 'bg-white/20 text-white hover:bg-white/30'
                                }`}
                              >
                                <Heart size={18} fill={likedPhotos.has(`photo-${i}`) ? 'currentColor' : 'none'} />
                              </motion.button>
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                              >
                                <Share2 size={18} />
                              </motion.button>
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                              >
                                <Download size={18} />
                              </motion.button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 bg-slate-900/30 border border-white/10 rounded-2xl">
                      <ImageIcon size={48} className="text-slate-600 mb-4" />
                      <p className="text-slate-400">اختر مجلداً لعرض الصور</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 px-6 py-4">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {[
            { icon: Home, label: "الرئيسية", action: () => setSelectedEvent(null) },
            { icon: ImageIcon, label: "الصور", action: () => {} },
            { icon: Heart, label: "المفضلة", action: () => {} },
            { icon: User, label: "حسابي", action: () => {} },
          ].map((item, index) => (
            <motion.button
              key={index}
              whileTap={{ scale: 0.9 }}
              onClick={item.action}
              className="flex flex-col items-center gap-1"
            >
              <item.icon size={24} className="text-orange-400" />
              <span className="text-xs text-slate-400">{item.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
