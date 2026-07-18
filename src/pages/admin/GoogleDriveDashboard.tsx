import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { HardDrive, FolderOpen, Image as ImageIcon, RefreshCw, CheckCircle, XCircle, Clock, Database, BarChart2 } from 'lucide-react';
import { googleDriveService } from '../../services/googleDrive';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';

interface DriveStats {
  totalFolders: number;
  totalFiles: number;
  totalSize: number;
  syncedGalleries: number;
  unsyncedGalleries: number;
  lastSyncAt?: string;
}

interface GallerySyncStatus {
  id: string;
  clientName: string;
  eventType: string;
  isSynced: boolean;
  lastSyncedAt?: string;
  driveFolderId?: string;
  photosCount?: number;
}

export default function GoogleDriveDashboard() {
  const [stats, setStats] = useState<DriveStats>({
    totalFolders: 0,
    totalFiles: 0,
    totalSize: 0,
    syncedGalleries: 0,
    unsyncedGalleries: 0,
    lastSyncAt: undefined,
  });
  const [galleries, setGalleries] = useState<GallerySyncStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load galleries from Firestore
      const db = getFirestore();
      const galleriesRef = collection(db, 'client-galleries');
      const querySnapshot = await getDocs(galleriesRef);
      
      const galleryData: GallerySyncStatus[] = [];
      let syncedCount = 0;
      let unsyncedCount = 0;

      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();
        const syncStatus = await googleDriveService.getSyncStatus(docSnapshot.id);
        
        galleryData.push({
          id: docSnapshot.id,
          clientName: data.clientName || 'غير معروف',
          eventType: data.eventType || 'تصوير',
          isSynced: syncStatus.isSynced,
          lastSyncedAt: syncStatus.lastSyncedAt,
          driveFolderId: syncStatus.driveFolderId,
          photosCount: syncStatus.photosCount,
        });

        if (syncStatus.isSynced) {
          syncedCount++;
        } else {
          unsyncedCount++;
        }
      }

      setGalleries(galleryData);
      setStats({
        totalFolders: syncedCount * 3, // Assuming 3 subfolders per gallery
        totalFiles: galleryData.reduce((acc, g) => acc + (g.photosCount || 0), 0),
        totalSize: galleryData.reduce((acc, g) => acc + (g.photosCount || 0) * 5, 0) * 1024 * 1024, // Estimate 5MB per photo
        syncedGalleries: syncedCount,
        unsyncedGalleries: unsyncedCount,
        lastSyncAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('فشل تحميل بيانات لوحة التحكم');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncGallery = async (galleryId: string) => {
    setSyncing(galleryId);
    try {
      const db = getFirestore();
      const galleryRef = doc(db, 'client-galleries', galleryId);
      const gallerySnap = await getDoc(galleryRef);

      if (!gallerySnap.exists()) {
        toast.error('المعرض غير موجود');
        return;
      }

      const galleryData = gallerySnap.data();
      const result = await googleDriveService.syncGalleryWithDrive(galleryId, galleryData);

      if (result.success) {
        toast.success(result.message);
        await loadDashboardData();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Failed to sync gallery:', error);
      toast.error('فشلت المزامنة');
    } finally {
      setSyncing(null);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0B0F19]">
        <div className="text-center">
          <RefreshCw size={48} className="text-slate-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050508] via-[#0a0a1a] to-[#050508] text-white p-6" dir="rtl">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-slate-600/20 to-pink-600/20 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-r from-indigo-600/15 to-slate-600/15 rounded-full blur-[180px]"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-400 to-pink-400 bg-clip-text text-transparent">
              لوحة تحكم Google Drive
            </h1>
            <p className="text-gray-400 mt-2">إدارة ومزامنة المجلدات والصور</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadDashboardData}
            className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-xl border border-white/10 hover:bg-black/50 rounded-lg transition-all hover:scale-105 shadow-lg"
          >
            <RefreshCw size={20} />
            تحديث
          </motion.button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/40 backdrop-blur-xl border border-slate-500/30 rounded-2xl p-4 md:p-6 shadow-xl transition-all hover:scale-[1.01]"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-500/20 rounded-xl">
                <FolderOpen size={24} className="text-slate-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">المجلدات</p>
                <p className="text-2xl font-bold">{stats.totalFolders}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-black/40 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-4 md:p-6 shadow-xl transition-all hover:scale-[1.01]"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <ImageIcon size={24} className="text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">الصور</p>
                <p className="text-2xl font-bold">{stats.totalFiles}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-black/40 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-4 md:p-6 shadow-xl transition-all hover:scale-[1.01]"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <HardDrive size={24} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">المساحة</p>
                <p className="text-2xl font-bold">{formatBytes(stats.totalSize)}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-black/40 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-4 md:p-6 shadow-xl transition-all hover:scale-[1.01]"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Database size={24} className="text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">المتزامن</p>
                <p className="text-2xl font-bold">{stats.syncedGalleries}/{stats.syncedGalleries + stats.unsyncedGalleries}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sync Status */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-6 mb-8 shadow-xl transition-all hover:scale-[1.01]">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BarChart2 size={24} className="text-slate-400" />
            حالة المزامنة
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle size={20} className="text-emerald-400" />
              <span className="text-gray-300">المعارض المتزامنة: {stats.syncedGalleries}</span>
            </div>
            <div className="flex items-center gap-3">
              <XCircle size={20} className="text-red-400" />
              <span className="text-gray-300">المعارض غير المتزامنة: {stats.unsyncedGalleries}</span>
            </div>
          </div>
        </div>

        {/* Galleries List */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-6 shadow-xl transition-all hover:scale-[1.01]">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FolderOpen size={24} className="text-slate-400" />
            المعارض
          </h2>
          <div className="space-y-4">
            {galleries.map((gallery) => (
              <motion.div
                key={gallery.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-4 bg-black/20 border border-white/10 rounded-xl hover:bg-black/30 transition-all hover:scale-[1.02] backdrop-blur-sm"
              >
                <div className="flex items-center gap-4">
                  {gallery.isSynced ? (
                    <CheckCircle size={20} className="text-emerald-400" />
                  ) : (
                    <XCircle size={20} className="text-red-400" />
                  )}
                  <div>
                    <p className="font-medium">{gallery.clientName}</p>
                    <p className="text-sm text-gray-400">{gallery.eventType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {gallery.photosCount && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <ImageIcon size={16} />
                      <span>{gallery.photosCount}</span>
                    </div>
                  )}
                  {gallery.lastSyncedAt && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock size={16} />
                      <span>{new Date(gallery.lastSyncedAt).toLocaleDateString('ar-EG')}</span>
                    </div>
                  )}
                  {!gallery.isSynced && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSyncGallery(gallery.id)}
                      disabled={syncing === gallery.id}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-600 rounded-lg transition-all hover:scale-105 text-sm shadow-lg shadow-blue-500/20"
                    >
                      {syncing === gallery.id ? 'جاري المزامنة...' : 'مزامنة'}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
