import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Download, 
  Heart, 
  Grid3X3, 
  LogOut,
  Settings,
  Folder,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '../../design-system/components';
import { Card, CardHeader, CardTitle, CardContent } from '../../design-system/components';
import { getClientData, signOut } from '../../services/clientAuth';
import { motion } from 'motion/react';

export function ClientPortal() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  useEffect(() => {
    loadClientData();
  }, [clientId]);

  const loadClientData = async () => {
    try {
      if (!clientId) return;
      
      const clientData = await getClientData(clientId);
      setClient(clientData);
      
      // Load events for this client
      // This would be implemented with Firestore queries
      // For now, using mock data
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
      navigate('/client/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex items-center justify-center">
        <div className="text-white">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b]">
      {/* Header */}
      <header className="glass-panel border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <ImageIcon size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{client?.name}</h1>
              <p className="text-gray-400 text-sm">بوابة العملاء</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            leftIcon={<LogOut size={16} />}
          >
            تسجيل الخروج
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Events Grid */}
        {!selectedEvent ? (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">أحداثك</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    variant="elevated" 
                    className="cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setSelectedEvent(event.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                          <Calendar size={32} className="text-purple-400" />
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <ImageIcon size={16} />
                          <span className="text-sm">{event.totalPhotos}</span>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{event.title}</h3>
                      <p className="text-gray-400 text-sm mb-4">{event.date}</p>
                      <div className="flex flex-wrap gap-2">
                        {event.folders.map((folder: string) => (
                          <span key={folder} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-300">
                            {folder === 'hall' ? 'القاعة' : folder === 'session' ? 'الجلسة' : 'خارجي'}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          /* Event View */
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedEvent(null)}
              className="mb-6"
            >
              ← العودة للأحداث
            </Button>

            <div className="grid md:grid-cols-4 gap-6">
              {/* Folders */}
              <div className="md:col-span-1">
                <Card variant="glass" className="p-4">
                  <CardHeader>
                    <CardTitle className="text-lg">المجلدات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {events.find((e) => e.id === selectedEvent)?.folders.map((folder: string) => (
                        <button
                          key={folder}
                          onClick={() => setSelectedFolder(folder)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                            selectedFolder === folder
                              ? 'bg-orange-500/20 border border-orange-500/30 text-orange-500'
                              : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                          }`}
                        >
                          <Folder size={18} />
                          <span>{folder === 'hall' ? 'القاعة' : folder === 'session' ? 'الجلسة' : 'خارجي'}</span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Photos Grid */}
              <div className="md:col-span-3">
                {selectedFolder ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white">
                        {selectedFolder === 'hall' ? 'صور القاعة' : selectedFolder === 'session' ? 'صور الجلسة' : 'صور خارجية'}
                      </h3>
                      <Button variant="primary" size="sm" leftIcon={<Download size={16} />}>
                        تحميل الكل
                      </Button>
                    </div>
                    
                    {/* Photos Grid - Placeholder */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {[...Array(12)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="aspect-square bg-white/5 border border-white/10 rounded-lg flex items-center justify-center"
                        >
                          <ImageIcon size={32} className="text-gray-600" />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-400">اختر مجلداً لعرض الصور</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
