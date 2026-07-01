import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck, Clock, Archive, Database, RefreshCw, Trash2,
  Download, FileJson, Upload, AlertTriangle, History,
  FolderOpen, Shield, Activity, Zap, Undo2, HardDrive,
  Cloud, CheckCircle, ChevronRight, Sparkles, Layers,
  Settings as SettingsIcon, Globe, Server, Save, Search,
  Loader2, Calendar, Users, Package as PackageIcon, Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from '../../services/storage';
import { firebaseService } from '../../services/firebase';
import { firestoreData } from '../../services/firestoreData';
import { audioService } from '../../services/audio';
import { cn, toArabicDigits, formatDateWithDay, formatArabicDate } from '../../lib/utils';
import { Backup as BackupType, BackupSettings } from '../../types';
import PageLayout from '../../components/layout/PageLayout';

type TabType = 'local' | 'cloud' | 'settings' | 'history';

export default function UnifiedBackup() {
  const [activeTab, setActiveTab] = useState<TabType>('local');
  const [backups, setBackups] = useState<BackupType[]>([]);
  const [settings, setSettings] = useState<BackupSettings>(storage.getBackupSettings());
  const [backupDir, setBackupDir] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [mergeResult, setMergeResult] = useState<{
    merged: number;
    conflicts: number;
    skipped: number;
  } | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [backupStats, setBackupStats] = useState({
    bookings: 0,
    customers: 0,
    expenses: 0,
    packages: 0,
    revenues: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const init = async () => {
      setBackups(storage.getBackups());
      const dir = await storage.getBackupDirectory();
      setBackupDir(dir);
      setIsConnected(firebaseService.isReady());
    };
    init();

    // Check Firebase connection status
    const checkConnection = () => {
      setIsConnected(firebaseService.isReady());
    };
    const interval = setInterval(checkConnection, 5000);

    const handleConnected = () => setIsConnected(true);
    const handleDisconnected = () => setIsConnected(false);

    window.addEventListener('firebase-connected', handleConnected);
    window.addEventListener('firebase-disconnected', handleDisconnected);

    return () => {
      clearInterval(interval);
      window.removeEventListener('firebase-connected', handleConnected);
      window.removeEventListener('firebase-disconnected', handleDisconnected);
    };
  }, []);

  // Local Backup Functions
  const createBackup = () => {
    const allData = {
      bookings: storage.getBookings(),
      packages: storage.getPackages(),
      expenses: storage.getExpenses(),
      revenues: storage.getRevenues(),
      settings: storage.getBackupSettings(),
    };
    const dataStr = JSON.stringify(allData);
    const size = new Blob([dataStr]).size;
    const newBackup: BackupType = {
      id: 'backup-' + Date.now(),
      timestamp: Date.now(),
      date: new Date().toISOString(),
      source: 'manual',
      size,
      data: allData,
      description: `${allData.bookings.length} حجز نشط`,
    };
    storage.saveBackup(newBackup);
    setBackups(prev => [newBackup, ...prev]);
    audioService.playSuccess();
  };

  const handleExport = () => {
    const allData = {
      bookings: storage.getBookings(),
      packages: storage.getPackages(),
      expenses: storage.getExpenses(),
      revenues: storage.getRevenues(),
      settings: storage.getBackupSettings(),
    };
    const dataStr = JSON.stringify(allData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    audioService.playSuccess();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        await storage.restoreData(data);
        audioService.playSuccess();
      } catch (err) {
        audioService.playError();
        storage.toast('فشل في استيراد البيانات', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleRestore = async (backupId: string) => {
    const backup = backups.find(b => b.id === backupId);
    if (!backup) return;

    if (confirm('هل أنت متأكد من استعادة هذه النسخة؟')) {
      await storage.restoreData(backup.data);
      audioService.playSuccess();
    }
  };

  const handleDelete = (backupId: string) => {
    if (confirm('هل أنت متأكد من حذف هذه النسخة؟')) {
      const updatedBackups = backups.filter(b => b.id !== backupId);
      storage.set('shadyBackups', updatedBackups);
      setBackups(updatedBackups);
      audioService.playSuccess();
      storage.toast('تم حذف النسخة', 'success');
    }
  };

  // Cloud Backup Functions
  const handleCloudBackup = async () => {
    setIsSyncing(true);
    audioService.playClick();

    try {
      const bookings = await new Promise<any[]>((resolve) => {
        const unsub = firestoreData.subscribeToBookings((data) => {
          resolve(data);
          unsub();
        });
      });

      const customers = await new Promise<any[]>((resolve) => {
        const unsub = firestoreData.subscribeToCustomers((data) => {
          resolve(data);
          unsub();
        });
      });

      const expenses = await new Promise<any[]>((resolve) => {
        const unsub = firestoreData.subscribeToExpenses((data) => {
          resolve(data);
          unsub();
        });
      });

      const packages = await new Promise<any[]>((resolve) => {
        const unsub = firestoreData.subscribeToPackages((data) => {
          resolve(data);
          unsub();
        });
      });

      const revenues = await new Promise<any[]>((resolve) => {
        const unsub = firestoreData.subscribeToRevenues((data) => {
          resolve(data);
          unsub();
        });
      });

      const backupData = {
        bookings,
        customers,
        expenses,
        packages,
        revenues,
        timestamp: new Date().toISOString(),
        version: '1.0',
      };

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `backup_${timestamp}.json`;
      const jsonContent = JSON.stringify(backupData, null, 2);

      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setBackupStats({
        bookings: bookings.length,
        customers: customers.length,
        expenses: expenses.length,
        packages: packages.length,
        revenues: revenues.length,
      });

      audioService.playSuccess();
      alert('تم إنشاء النسخة الاحتياطية من السحابة بنجاح');
    } catch (error) {
      console.error('Backup error:', error);
      audioService.playError();
      alert('حدث خطأ أثناء إنشاء النسخة الاحتياطية');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCloudImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/json') {
      setImportFile(file);
    } else {
      alert('يرجى اختيار ملف JSON صالح');
    }
  };

  const handleCloudMerge = async () => {
    if (!importFile) {
      alert('يرجى اختيار ملف النسخة الاحتياطية أولاً');
      return;
    }

    setIsImporting(true);
    setMergeResult(null);
    audioService.playClick();

    try {
      const text = await importFile.text();
      const backupData = JSON.parse(text);

      let merged = 0;
      let conflicts = 0;
      let skipped = 0;

      const currentBookings = await new Promise<any[]>((resolve) => {
        const unsub = firestoreData.subscribeToBookings((data) => {
          resolve(data);
          unsub();
        });
      });

      const currentCustomers = await new Promise<any[]>((resolve) => {
        const unsub = firestoreData.subscribeToCustomers((data) => {
          resolve(data);
          unsub();
        });
      });

      const currentPackages = await new Promise<any[]>((resolve) => {
        const unsub = firestoreData.subscribeToPackages((data) => {
          resolve(data);
          unsub();
        });
      });

      const currentExpenses = await new Promise<any[]>((resolve) => {
        const unsub = firestoreData.subscribeToExpenses((data) => {
          resolve(data);
          unsub();
        });
      });

      const currentRevenues = await new Promise<any[]>((resolve) => {
        const unsub = firestoreData.subscribeToRevenues((data) => {
          resolve(data);
          unsub();
        });
      });

      // Merge logic with conflict resolution
      for (const backupBooking of backupData.bookings) {
        const existingBooking = currentBookings.find(b => b.id === backupBooking.id);

        if (existingBooking) {
          const backupDate = new Date(backupBooking.createdAt || backupBooking.date);
          const existingDate = new Date(existingBooking.createdAt || existingBooking.date);

          if (backupDate > existingDate) {
            await firestoreData.saveBooking(backupBooking);
            merged++;
            conflicts++;
          } else {
            skipped++;
          }
        } else {
          await firestoreData.saveBooking(backupBooking);
          merged++;
        }
      }

      // Merge other collections similarly...
      for (const backupCustomer of backupData.customers) {
        const existingCustomer = currentCustomers.find(c => c.id === backupCustomer.id);
        if (!existingCustomer) {
          await firestoreData.saveCustomer(backupCustomer);
          merged++;
        }
      }

      for (const backupPackage of backupData.packages) {
        const existingPackage = currentPackages.find(p => p.id === backupPackage.id);
        if (!existingPackage) {
          await firestoreData.savePackage(backupPackage);
          merged++;
        }
      }

      for (const backupExpense of backupData.expenses) {
        const existingExpense = currentExpenses.find(e => e.id === backupExpense.id);
        if (!existingExpense) {
          await firestoreData.saveExpense(backupExpense);
          merged++;
        }
      }

      for (const backupRevenue of backupData.revenues) {
        const existingRevenue = currentRevenues.find(r => r.id === backupRevenue.id);
        if (!existingRevenue) {
          await firestoreData.saveRevenue(backupRevenue);
          merged++;
        }
      }

      setMergeResult({ merged, conflicts, skipped });
      audioService.playSuccess();
      alert(`تم استيراد ودمج البيانات بنجاح\nتم دمج: ${merged}\nتم حل تعارضات: ${conflicts}\nتم تخطي: ${skipped}`);
    } catch (error) {
      console.error('Import error:', error);
      audioService.playError();
      alert('حدث خطأ أثناء استيراد البيانات');
    } finally {
      setIsImporting(false);
      setImportFile(null);
    }
  };

  // Settings Functions
  const handleSetDirectory = async () => {
    const success = await storage.setBackupDirectory();
    if (success) {
      const dir = await storage.getBackupDirectory();
      setBackupDir(dir);
      audioService.playSuccess();
    }
  };

  const updateSettings = (newSettings: Partial<BackupSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    storage.saveBackupSettings(updated);
    audioService.playClick();
  };

  // Helper Functions
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredBackups = useMemo(() => {
    if (!searchQuery.trim()) return backups;
    const query = searchQuery.toLowerCase();
    return backups.filter(b =>
      b.description?.toLowerCase().includes(query) ||
      b.date?.toLowerCase().includes(query)
    );
  }, [backups, searchQuery]);

  const tabs = [
    { id: 'local' as TabType, label: 'النسخ المحلي', icon: HardDrive },
    { id: 'cloud' as TabType, label: 'النسخ السحابي', icon: Cloud },
    { id: 'settings' as TabType, label: 'الإعدادات', icon: SettingsIcon },
    { id: 'history' as TabType, label: 'السجل', icon: History },
  ];

  return (
    <PageLayout
      title="إدارة النسخ الاحتياطي"
      subtitle="إدارة النسخ الاحتياطية المحلية والسحابية ودمج البيانات"
      stats={[
        { label: 'النسخ المحلية', value: backups.length, icon: Archive },
        { label: 'الحجوزات', value: backupStats.bookings, icon: Calendar },
        { label: 'العملاء', value: backupStats.customers, icon: Users },
        { label: 'الباقات', value: backupStats.packages, icon: PackageIcon },
      ]}
    >
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { audioService.playClick(); setActiveTab(tab.id); }}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
              activeTab === tab.id
                ? 'bg-primary text-white shadow-lg'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white'
            )}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'local' && (
          <motion.div
            key="local"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Local Backup Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={createBackup}
                className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white transition-all"
              >
                <Save size={20} />
                <span className="font-medium">إنشاء نسخة</span>
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-all"
              >
                <Download size={20} />
                <span className="font-medium">تصدير JSON</span>
              </button>
              <label className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-all cursor-pointer">
                <Upload size={20} />
                <span className="font-medium">استيراد JSON</span>
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
              <button
                onClick={handleSetDirectory}
                className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-all"
              >
                <FolderOpen size={20} />
                <span className="font-medium">تحديد المجلد</span>
              </button>
            </div>

            {/* Backup Directory Status */}
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    backupDir ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                  )}>
                    {backupDir ? <ShieldCheck size={18} /> : <Shield size={18} />}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{backupDir ? 'مجلد محدد' : 'لم يتم تحديد المجلد'}</div>
                    <div className="text-xs text-slate-400">{backupDir ? backupDir.name : 'غير محدد'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Backup History */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">سجل النسخ المحلية</h3>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {filteredBackups.map((b, i) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        i === 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-700/50 text-slate-400"
                      )}>
                        {i === 0 ? <ShieldCheck size={18} /> : <Archive size={18} />}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{formatArabicDate(b.date)}</div>
                        <div className="text-xs text-slate-400">{b.description} • {formatBytes(b.size)}</div>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => handleRestore(b.id)}
                        className="p-2 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-all"
                      >
                        <Undo2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'cloud' && (
          <motion.div
            key="cloud"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Connection Status */}
            <div className={cn(
              "flex items-center justify-between p-4 rounded-xl",
              isConnected ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-rose-500/10 border border-rose-500/20"
            )}>
              <div className="flex items-center gap-3">
                {isConnected ? <CheckCircle size={20} className="text-emerald-500" /> : <AlertTriangle size={20} className="text-rose-500" />}
                <span className={cn("font-medium", isConnected ? "text-emerald-400" : "text-rose-400")}>
                  {isConnected ? 'متصل بـ Firebase' : 'غير متصل بـ Firebase'}
                </span>
              </div>
            </div>

            {/* Cloud Backup Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleCloudBackup}
                disabled={isSyncing || !isConnected}
                className="flex items-center gap-3 p-6 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSyncing ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
                <div className="text-right">
                  <div className="font-medium">تصدير من السحابة</div>
                  <div className="text-xs opacity-70">تحميل نسخة من Firebase</div>
                </div>
              </button>

              <div className="space-y-4">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleCloudImport}
                  className="hidden"
                  id="cloud-import"
                />
                <label
                  htmlFor="cloud-import"
                  className="flex items-center gap-3 p-6 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <Upload size={20} />
                  <div className="text-right">
                    <div className="font-medium">استيراد ودمج</div>
                    <div className="text-xs opacity-70">دمج ملف مع السحابة</div>
                  </div>
                </label>

                {importFile && (
                  <button
                    onClick={handleCloudMerge}
                    disabled={isImporting}
                    className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-primary text-white hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {isImporting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        جاري الدمج...
                      </>
                    ) : (
                      <>
                        <FileJson size={18} />
                        دمج البيانات الآن
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Merge Result */}
            {mergeResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
              >
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={20} className="text-emerald-400" />
                  <span className="font-bold text-emerald-400">نتيجة الدمج</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{toArabicDigits(mergeResult.merged)}</div>
                    <div className="text-slate-400">تم دمج</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{toArabicDigits(mergeResult.conflicts)}</div>
                    <div className="text-slate-400">تم حل تعارضات</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{toArabicDigits(mergeResult.skipped)}</div>
                    <div className="text-slate-400">تم تخطي</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Cloud Stats */}
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">إحصائيات النسخ السحابي</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-white">{toArabicDigits(backupStats.bookings)}</div>
                  <div className="text-xs text-slate-400">حجوزات</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white">{toArabicDigits(backupStats.customers)}</div>
                  <div className="text-xs text-slate-400">عملاء</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white">{toArabicDigits(backupStats.packages)}</div>
                  <div className="text-xs text-slate-400">باقات</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white">{toArabicDigits(backupStats.expenses)}</div>
                  <div className="text-xs text-slate-400">مصروفات</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Auto Backup Settings */}
            <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">النسخ التلقائي</h3>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Activity size={20} className="text-primary" />
                  <span className="text-white">تفعيل النسخ التلقائي</span>
                </div>
                <button
                  onClick={() => updateSettings({ autoBackup: !settings.autoBackup })}
                  className={cn(
                    "w-12 h-6 rounded-full p-1 transition-all",
                    settings.autoBackup ? "bg-primary" : "bg-slate-700"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full bg-white transition-all",
                    settings.autoBackup ? "translate-x-6" : "translate-x-0"
                  )} />
                </button>
              </div>

              <div className="space-y-4">
                <label className="text-sm text-slate-400">دورة المزامنة</label>
                <div className="grid grid-cols-3 gap-3">
                  {['daily', 'weekly', 'monthly'].map(freq => (
                    <button
                      key={freq}
                      onClick={() => updateSettings({ frequency: freq as any })}
                      className={cn(
                        "p-4 rounded-lg border transition-all text-center",
                        settings.frequency === freq
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-slate-800/30 border-slate-700/50 text-slate-400 hover:bg-slate-800/50"
                      )}
                    >
                      <div className="text-lg font-bold mb-1">
                        {freq === 'daily' ? 'يومي' : freq === 'weekly' ? 'أسبوعي' : 'شهري'}
                      </div>
                      <div className="text-xs capitalize">{freq}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Backup Directory */}
            <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">مجلد النسخ الاحتياطي</h3>
              <button
                onClick={handleSetDirectory}
                className="w-full p-4 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <FolderOpen size={20} className="text-slate-400" />
                  <span className="text-white">{backupDir ? backupDir.name : 'تحديد مجلد'}</span>
                </div>
                <ChevronRight size={20} className="text-slate-400" />
              </button>
            </div>

            {/* Max Backups */}
            <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">الحد الأقصى للنسخ</h3>
              <input
                type="number"
                value={settings.maxBackups}
                onChange={(e) => updateSettings({ maxBackups: parseInt(e.target.value) || 10 })}
                className="w-full p-4 rounded-lg bg-slate-800/30 border border-slate-700/50 text-white"
                min={1}
                max={100}
              />
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في السجل..."
                className="w-full h-12 bg-slate-800/30 border border-slate-700/50 rounded-xl pl-12 pr-4 text-sm font-medium text-white placeholder:text-slate-500 outline-none focus:border-primary/50 transition-all"
              />
            </div>

            {/* History List */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {filteredBackups.length === 0 ? (
                <div className="py-16 text-center">
                  <Clock size={48} className="text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500">{searchQuery ? 'لا توجد نتائج' : 'لا توجد سجلات'}</p>
                </div>
              ) : (
                filteredBackups.map((log, idx) => (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    key={log.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                        <Save size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{log.description}</div>
                        <div className="text-xs text-slate-400">
                          {formatDateWithDay(log.date)} • {formatBytes(log.size)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-primary font-bold text-sm">{toArabicDigits((log.size / 1024).toFixed(1))} KB</div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageLayout>
  );
}
