import React, { useState, useEffect } from 'react';
import { 
  Wifi, WifiOff, RefreshCw, Database, Users, Calendar,
  CheckCircle, Server, Activity, Clock, Globe
} from 'lucide-react';
import { motion } from 'motion/react';
import { collection, getDocs } from 'firebase/firestore';
import { audioService } from '../../services/audio';
import { firebaseService } from '../../services/firebase';
import { firestoreSync } from '../../services/firestoreSync';

export default function FirebaseConfigPage() {
  const [deviceName, setDeviceName] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalUsers: 0,
    lastSync: new Date().toLocaleString('ar-EG')
  });

  useEffect(() => {
    // Load saved device name
    const savedDeviceName = localStorage.getItem('deviceName');
    if (savedDeviceName) {
      setDeviceName(savedDeviceName);
    }

    // Firebase connection check
    if (firebaseService.isReady()) {
      setIsConnected(true);
      fetchStats();
    } else {
      setIsConnected(false);
    }
  }, []);

  const fetchStats = async () => {
    setIsChecking(true);
    try {
      // Firebase stats fetch
      const db = firebaseService.getDB();
      if (!db) return;

      // Get total bookings count
      const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
      const bookingsCount = bookingsSnapshot.size;

      // Get total users count (from staff collection)
      const usersSnapshot = await getDocs(collection(db, 'staff'));
      const usersCount = usersSnapshot.size;

      setStats({
        totalBookings: bookingsCount,
        totalUsers: usersCount,
        lastSync: new Date().toLocaleString('ar-EG')
      });

      audioService.playSuccess();
    } catch (err) {
      console.error('Error fetching stats:', err);
      audioService.playError();
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen page-shell flex items-center justify-center p-4 relative" dir="rtl">
      {/* Decorative Glow Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/15 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[500px] relative z-10"
      >
        <div className="modal-panel p-8 sm:p-10 relative overflow-hidden group">
          {/* Top Gradient Line */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-accent to-primary opacity-80" />

          <div className="flex flex-col items-center mb-8 relative">
            <div className="w-24 h-24 rounded-[32px] bg-white/[0.03] border border-white/10 flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(139,124,248,0.15)] relative overflow-hidden group-hover:border-primary/30 transition-colors duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Server size={44} className="text-primary drop-shadow-[0_0_15px_rgba(139,124,248,0.5)]" />
            </div>
            <h1 className="text-2xl font-display font-bold text-white tracking-tight mb-2">لوحة تحكم السيرفر وقاعدة البيانات</h1>
            <p className="text-text-muted text-center text-sm font-medium">مراقبة حالة الاتصال والإحصائيات الحية</p>
          </div>

          {/* Connection Status Card */}
          <div className={`relative p-6 rounded-2xl overflow-hidden group mb-6 ${isConnected ? 'bg-emerald-500/5 border border-emerald-500/20' : 'bg-rose-500/5 border border-rose-500/20'}`}>
            <div className={`absolute top-0 right-0 w-32 h-32 blur-[40px] rounded-full -mr-10 -mt-10 pointer-events-none ${isConnected ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`} />
            
            <div className="flex items-start gap-4 relative z-10">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isConnected ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                {isConnected ? (
                  <Wifi size={24} className="text-emerald-400" />
                ) : (
                  <WifiOff size={24} className="text-rose-400" />
                )}
              </div>
              <div>
                <h3 className={`text-lg font-bold mb-1 ${isConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isConnected ? 'متصل بنجاح' : 'غير متصل'}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  {isConnected 
                    ? 'الموقع متصل بشكل آمن بقاعدة بيانات Firebase. المزامنة الفورية نشطة وتعمل في الخلفية.'
 :                    'النظام غير متصل بقاعدة البيانات. يرجى التحقق من الاتصال بالإنترنت.'}
                </p>
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-primary/30 transition-colors duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar size={20} className="text-primary" />
                </div>
                <span className="text-xs text-text-muted font-medium">إجمالي الحجوزات</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.totalBookings}</p>
              <p className="text-xs text-text-muted mt-1">حجز مسجل في السيرفر</p>
            </div>

            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-accent/30 transition-colors duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Users size={20} className="text-accent" />
                </div>
                <span className="text-xs text-text-muted font-medium">المستخدمين</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
              <p className="text-xs text-text-muted mt-1">موظف مسجل في النظام</p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-3">
                <Database size={18} className="text-text-muted" />
                <span className="text-sm text-text-muted">قاعدة البيانات</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                <span className={`text-xs font-semibold ${isConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isConnected ? 'نشطة' : 'غير متاحة'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-text-muted" />
                <span className="text-sm text-text-muted">آخر تحديث</span>
              </div>
              <span className="text-xs font-semibold text-text-main">{stats.lastSync}</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-text-muted" />
                <span className="text-sm text-text-muted">الاستضافة</span>
              </div>
              <span className="text-xs font-semibold text-primary">Firebase Hosting</span>
            </div>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchStats}
            disabled={isChecking}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 text-primary font-semibold hover:bg-primary/20 hover:border-primary/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isChecking ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                جاري الفحص...
              </>
            ) : (
              <>
                <RefreshCw size={18} />
                فحص سريع وتحديث
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
