import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Code, Database, Server, Cpu, HardDrive, Activity, 
  Settings, Shield, Users, Zap, RefreshCw, Terminal,
  Globe, Wifi, Clock, AlertTriangle, CheckCircle,
  FileText, Trash2, Download, Upload, Copy, Play, Square, Bell
} from 'lucide-react';
import { UserManagement } from './UserManagement';
import { MessagesSection } from './MessagesSection';
import { firebaseService } from '../../services/firebase';
import { firestoreData } from '../../services/firestoreData';
import { storage } from '../../services/storage';
import { cn } from '../../lib/utils';

export function Developer() {
  const [systemInfo, setSystemInfo] = useState<any>({});
  const [firebaseStatus, setFirebaseStatus] = useState<'connected' | 'disconnected' | 'loading'>('loading');
  const [activeTab, setActiveTab] = useState<'users' | 'notifications' | 'system' | 'firebase' | 'logs' | 'tools'>('users');
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    loadSystemInfo();
    checkFirebaseStatus();
    const interval = setInterval(loadSystemInfo, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadSystemInfo = () => {
    setSystemInfo({
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screen: {
        width: window.screen.width,
        height: window.screen.height,
        colorDepth: window.screen.colorDepth
      },
      memory: (performance as any).memory ? {
        jsHeapSizeLimit: ((performance as any).memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2) + ' MB',
        totalJSHeapSize: ((performance as any).memory.totalJSHeapSize / 1024 / 1024).toFixed(2) + ' MB',
        usedJSHeapSize: ((performance as any).memory.usedJSHeapSize / 1024 / 1024).toFixed(2) + ' MB'
      } : null,
      performance: {
        timing: performance.timing ? {
          domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
          loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart
        } : null
      },
      localStorage: {
        used: new Blob([JSON.stringify(localStorage)]).size / 1024,
        keys: Object.keys(localStorage).length
      }
    });
  };

  const checkFirebaseStatus = () => {
    setFirebaseStatus('loading');
    const db = firebaseService.getDB();
    if (db) {
      setFirebaseStatus('connected');
    } else {
      setFirebaseStatus('disconnected');
    }
  };

  const handleClearLocalStorage = () => {
    if (window.confirm('هل أنت متأكد من مسح جميع البيانات المحلية؟')) {
      localStorage.clear();
      storage.toast('تم مسح البيانات المحلية', 'success');
      loadSystemInfo();
    }
  };

  const handleClearCache = () => {
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
      storage.toast('تم مسح الكاش', 'success');
    }
  };

  const handleForceRefresh = () => {
    window.location.reload();
  };

  const addConsoleLog = (message: string) => {
    setConsoleOutput(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleExportBookings = async () => {
    if (currentUser?.role !== 'admin') {
      alert('هذه الميزة متاحة فقط للمسؤولين (Admin)');
      return;
    }

    setIsExporting(true);
    try {
      const bookings = await firestoreData.getBookings();
      const customers = await firestoreData.getCustomers();

      // Create CSV content
      let csv = 'Booking ID,Customer Name,Phone,Date,Status,Package,Total Amount,Remaining Amount\n';
      bookings.forEach((booking: any) => {
        csv += `${booking.id},${booking.customerName || 'N/A'},${booking.phone || 'N/A'},${booking.date},${booking.status},${booking.packageName || 'N/A'},${booking.totalAmount || 0},${booking.remainingAmount || 0}\n`;
      });

      // Add customers section
      csv += '\n\nCustomer ID,Name,Phone,Email,Total Bookings\n';
      customers.forEach((customer: any) => {
        csv += `${customer.id},${customer.name},${customer.phone || 'N/A'},${customer.email || 'N/A'},${customer.totalBookings || 0}\n`;
      });

      // Download file
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `bookings_customers_export_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);

      storage.toast('تم تصدير الحجوزات والعملاء بنجاح', 'success');
    } catch (error) {
      console.error('Export error:', error);
      storage.toast('فشل تصدير البيانات', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportFinancialReports = async () => {
    if (currentUser?.role !== 'admin') {
      alert('هذه الميزة متاحة فقط للمسؤولين (Admin)');
      return;
    }

    setIsExporting(true);
    try {
      const expenses = await firestoreData.getExpenses();
      const revenues = await firestoreData.getRevenues();

      // Create CSV content
      let csv = 'Financial Report Export\n';
      csv += `Export Date: ${new Date().toLocaleDateString('ar-EG')}\n\n`;

      // Expenses section
      csv += 'EXPENSES\n';
      csv += 'ID,Description,Amount,Date,Category\n';
      expenses.forEach((expense: any) => {
        csv += `${expense.id},${expense.description},${expense.amount},${expense.date},${expense.category || 'N/A'}\n`;
      });

      // Revenues section
      csv += '\nREVENUES\n';
      csv += 'ID,Description,Amount,Date,Source\n';
      revenues.forEach((revenue: any) => {
        csv += `${revenue.id},${revenue.description},${revenue.amount},${revenue.date},${revenue.source || 'N/A'}\n`;
      });

      // Summary
      const totalExpenses = expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
      const totalRevenues = revenues.reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
      csv += `\nSUMMARY\n`;
      csv += `Total Expenses,${totalExpenses}\n`;
      csv += `Total Revenues,${totalRevenues}\n`;
      csv += `Net Profit,${totalRevenues - totalExpenses}\n`;

      // Download file
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `financial_report_export_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);

      storage.toast('تم تصدير التقارير المالية بنجاح', 'success');
    } catch (error) {
      console.error('Export error:', error);
      storage.toast('فشل تصدير التقارير', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const tabs = [
    { id: 'users', label: 'إدارة المستخدمين', icon: Shield },
    { id: 'notifications', label: 'إعدادات وقسم الرسائل', icon: Bell },
    { id: 'system', label: 'معلومات النظام', icon: Cpu },
    { id: 'firebase', label: 'Firebase', icon: Database },
    { id: 'logs', label: 'السجلات', icon: FileText },
    { id: 'tools', label: 'الأدوات', icon: Terminal },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
            <Code size={24} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">المطور</h1>
            <p className="text-sm text-pink-300/70 mt-1">أدوات المطور وإدارة النظام</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={checkFirebaseStatus}
            className="px-4 h-11 rounded-xl bg-white/5 text-pink-200/80 border border-pink-500/20 font-bold text-sm hover:bg-gradient-to-r hover:from-pink-500/30 hover:to-purple-500/30 hover:text-white transition-all flex items-center gap-2"
          >
            <RefreshCw size={16} />
            تحديث الحالة
          </button>
          <button
            onClick={() => setIsConsoleOpen(!isConsoleOpen)}
            className={cn(
              "px-4 h-11 rounded-xl font-bold text-sm transition-all flex items-center gap-2",
              isConsoleOpen 
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" 
                : "bg-white/5 text-pink-200/80 border border-pink-500/20 hover:bg-gradient-to-r hover:from-pink-500/30 hover:to-purple-500/30 hover:text-white"
            )}
          >
            <Terminal size={16} />
            الكونسول
          </button>
        </div>
      </div>

      {/* Console Panel */}
      <AnimatePresence>
        {isConsoleOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10 p-4 backdrop-blur-xl shadow-xl shadow-purple-500/10"
          >
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-2">
                <Terminal size={18} className="text-purple-400" />
                <span className="text-sm font-bold text-white">الكونسول</span>
              </div>
              <button
                onClick={() => setConsoleOutput([])}
                className="text-xs font-bold text-pink-300/90 hover:text-pink-300 transition-colors"
              >
                مسح
              </button>
            </div>
            <div className="bg-black/50 rounded-xl p-4 h-48 overflow-y-auto font-mono text-xs space-y-1">
              {consoleOutput.length === 0 ? (
                <p className="text-pink-300/50">لا توجد رسائل</p>
              ) : (
                consoleOutput.map((log, idx) => (
                  <p key={idx} className="text-green-400">{log}</p>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap",
              activeTab === tab.id
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                : "bg-white/5 text-pink-200/80 border border-pink-500/20 hover:bg-gradient-to-r hover:from-pink-500/30 hover:to-purple-500/30 hover:text-white"
            )}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <UserManagement />
          </motion.div>
        )}

        {activeTab === 'notifications' && (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <MessagesSection />
          </motion.div>
        )}

        {activeTab === 'system' && (
          <motion.div
            key="system"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* System Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10 p-5 backdrop-blur-xl shadow-xl shadow-purple-500/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Cpu size={20} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-white">{systemInfo.screen?.width || '0'}</p>
                    <p className="text-xs text-pink-300/70">عرض الشاشة</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10 p-5 backdrop-blur-xl shadow-xl shadow-purple-500/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
                    <HardDrive size={20} className="text-pink-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-white">{systemInfo.memory?.usedJSHeapSize || 'N/A'}</p>
                    <p className="text-xs text-pink-300/70">الذاكرة المستخدمة</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10 p-5 backdrop-blur-xl shadow-xl shadow-purple-500/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Wifi size={20} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-white">{systemInfo.onLine ? 'متصل' : 'غير متصل'}</p>
                    <p className="text-xs text-pink-300/70">حالة الشبكة</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10 p-5 backdrop-blur-xl shadow-xl shadow-purple-500/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Database size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-white">{systemInfo.localStorage?.keys || '0'}</p>
                    <p className="text-xs text-pink-300/70">مفاتيح LocalStorage</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed System Info */}
            <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10 p-6 backdrop-blur-xl shadow-xl shadow-purple-500/10">
              <div className="flex items-center gap-3 mb-6">
                <Server size={22} className="text-purple-400" />
                <h2 className="text-lg font-extrabold text-white">معلومات النظام التفصيلية</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-white/5 border border-purple-500/20">
                    <p className="text-xs font-extrabold text-pink-300/90 mb-2">المنصة</p>
                    <p className="text-sm text-white">{systemInfo.platform || 'N/A'}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-purple-500/20">
                    <p className="text-xs font-extrabold text-pink-300/90 mb-2">اللغة</p>
                    <p className="text-sm text-white">{systemInfo.language || 'N/A'}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-purple-500/20">
                    <p className="text-xs font-extrabold text-pink-300/90 mb-2">Cookies</p>
                    <p className="text-sm text-white">{systemInfo.cookieEnabled ? 'مفعلة' : 'معطلة'}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-white/5 border border-purple-500/20">
                    <p className="text-xs font-extrabold text-pink-300/90 mb-2">حجم LocalStorage</p>
                    <p className="text-sm text-white">{systemInfo.localStorage?.used?.toFixed(2) || '0'} KB</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-purple-500/20">
                    <p className="text-xs font-extrabold text-pink-300/90 mb-2">الذاكرة الكلية</p>
                    <p className="text-sm text-white">{systemInfo.memory?.jsHeapSizeLimit || 'N/A'}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-purple-500/20">
                    <p className="text-xs font-extrabold text-pink-300/90 mb-2">وقت التحميل</p>
                    <p className="text-sm text-white">{systemInfo.performance?.timing?.domContentLoaded || 'N/A'} ms</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'firebase' && (
          <motion.div
            key="firebase"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10 p-6 backdrop-blur-xl shadow-xl shadow-purple-500/10">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <Database size={22} className="text-purple-400" />
                  <h2 className="text-lg font-extrabold text-white">حالة Firebase</h2>
                </div>
                <div className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm",
                  firebaseStatus === 'connected' ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" :
                  firebaseStatus === 'disconnected' ? "bg-red-500/20 text-red-300 border border-red-500/30" :
                  "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                )}>
                  {firebaseStatus === 'connected' && <CheckCircle size={16} />}
                  {firebaseStatus === 'disconnected' && <AlertTriangle size={16} />}
                  {firebaseStatus === 'loading' && <RefreshCw size={16} className="animate-spin" />}
                  {firebaseStatus === 'connected' ? 'متصل' : firebaseStatus === 'disconnected' ? 'غير متصل' : 'جاري التحقق'}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-purple-500/20">
                  <p className="text-xs font-extrabold text-pink-300/90 mb-2">الحالة</p>
                  <p className="text-sm text-white">{firebaseStatus === 'connected' ? 'نشط' : 'غير نشط'}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-purple-500/20">
                  <p className="text-xs font-extrabold text-pink-300/90 mb-2">قاعدة البيانات</p>
                  <p className="text-sm text-white">Firestore</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-purple-500/20">
                  <p className="text-xs font-extrabold text-pink-300/90 mb-2">المزامنة</p>
                  <p className="text-sm text-white">Real-time</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10 p-6 backdrop-blur-xl shadow-xl shadow-purple-500/10">
              <div className="flex items-center gap-3 mb-6">
                <Globe size={22} className="text-pink-400" />
                <h2 className="text-lg font-extrabold text-white">المجموعات المتاحة</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['bookings', 'packages', 'expenses', 'revenues', 'customers', 'users', 'activity_logs'].map((collection) => (
                  <div key={collection} className="p-3 rounded-xl bg-white/5 border border-purple-500/20 flex items-center gap-2">
                    <Database size={16} className="text-purple-400" />
                    <span className="text-sm font-bold text-white">{collection}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Export Tools Section */}
            <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 p-6 backdrop-blur-xl shadow-xl shadow-amber-500/10">
              <div className="flex items-center gap-3 mb-6">
                <Shield size={22} className="text-amber-400" />
                <h2 className="text-lg font-extrabold text-white">أدوات تصدير البيانات والتقارير (Admin Tools)</h2>
              </div>
              <p className="text-xs text-amber-300/70 mb-4">هذه الأدوات متاحة فقط للمسؤولين (Admin)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => handleExportBookings()}
                  disabled={isExporting}
                  className="p-4 rounded-xl bg-white/5 border border-amber-500/20 hover:bg-amber-500/20 transition-all flex items-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/30 transition-all">
                    {isExporting ? <RefreshCw size={20} className="text-amber-400 animate-spin" /> : <Download size={20} className="text-amber-400" />}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">تصدير الحجوزات والعملاء</p>
                    <p className="text-xs text-amber-300/70">{isExporting ? 'جاري التصدير...' : 'تحميل ملف Excel/CSV'}</p>
                  </div>
                </button>
                <button
                  onClick={() => handleExportFinancialReports()}
                  disabled={isExporting}
                  className="p-4 rounded-xl bg-white/5 border border-amber-500/20 hover:bg-amber-500/20 transition-all flex items-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/30 transition-all">
                    {isExporting ? <RefreshCw size={20} className="text-amber-400 animate-spin" /> : <Download size={20} className="text-amber-400" />}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">تصدير التقارير المالية</p>
                    <p className="text-xs text-amber-300/70">{isExporting ? 'جاري التصدير...' : 'تحميل ملف Excel/CSV'}</p>
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'logs' && (
          <motion.div
            key="logs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10 p-6 backdrop-blur-xl shadow-xl shadow-purple-500/10">
              <div className="flex items-center gap-3 mb-6">
                <FileText size={22} className="text-pink-400" />
                <h2 className="text-lg font-extrabold text-white">سجلات النظام</h2>
              </div>
              <div className="bg-black/50 rounded-xl p-4 h-96 overflow-y-auto font-mono text-xs">
                <p className="text-pink-300/50">سجلات النظام ستظهر هنا...</p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'tools' && (
          <motion.div
            key="tools"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10 p-6 backdrop-blur-xl shadow-xl shadow-purple-500/10">
              <div className="flex items-center gap-3 mb-6">
                <Terminal size={22} className="text-purple-400" />
                <h2 className="text-lg font-extrabold text-white">أدوات المطور</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleForceRefresh}
                  className="p-4 rounded-xl bg-white/5 border border-purple-500/20 flex items-center gap-3 hover:bg-gradient-to-r hover:from-purple-500/30 hover:to-pink-500/30 transition-all group"
                >
                  <RefreshCw size={20} className="text-purple-400 group-hover:rotate-180 transition-transform" />
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">تحديث الصفحة</p>
                    <p className="text-xs text-pink-300/70">إعادة تحميل التطبيق بالكامل</p>
                  </div>
                </button>

                <button
                  onClick={handleClearCache}
                  className="p-4 rounded-xl bg-white/5 border border-purple-500/20 flex items-center gap-3 hover:bg-gradient-to-r hover:from-purple-500/30 hover:to-pink-500/30 transition-all group"
                >
                  <Trash2 size={20} className="text-pink-400" />
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">مسح الكاش (Cache)</p>
                    <p className="text-xs text-pink-300/70">مسح ذاكرة التخزين المؤقت</p>
                  </div>
                </button>

                <button
                  onClick={handleClearLocalStorage}
                  className="p-4 rounded-xl bg-white/5 border border-red-500/20 flex items-center gap-3 hover:bg-gradient-to-r hover:from-red-500/30 hover:to-orange-500/30 transition-all group"
                >
                  <HardDrive size={20} className="text-red-400" />
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">مسح LocalStorage</p>
                    <p className="text-xs text-pink-300/70">حذف جميع البيانات المحلية</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(navigator.userAgent));
                    storage.toast('تم نسخ معلومات المتصفح', 'success');
                  }}
                  className="p-4 rounded-xl bg-white/5 border border-purple-500/20 flex items-center gap-3 hover:bg-gradient-to-r hover:from-purple-500/30 hover:to-pink-500/30 transition-all group"
                >
                  <Copy size={20} className="text-purple-400" />
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">نسخ معلومات المتصفح</p>
                    <p className="text-xs text-pink-300/70">نسخ User Agent للحافظة</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10 p-6 backdrop-blur-xl shadow-xl shadow-purple-500/10">
              <div className="flex items-center gap-3 mb-6">
                <Settings size={22} className="text-pink-400" />
                <h2 className="text-lg font-extrabold text-white">إعدادات سريعة</h2>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-purple-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">وضع المطور</p>
                      <p className="text-xs text-pink-300/70">تفعيل ميزات المطور الإضافية</p>
                    </div>
                    <button className="w-12 h-6 rounded-full bg-purple-500/30 border border-purple-500/50 relative">
                      <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-purple-400" />
                    </button>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-purple-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">السجلات التفصيلية</p>
                      <p className="text-xs text-pink-300/70">عرض سجلات مفصلة في الكونسول</p>
                    </div>
                    <button className="w-12 h-6 rounded-full bg-purple-500/30 border border-purple-500/50 relative">
                      <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-purple-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
