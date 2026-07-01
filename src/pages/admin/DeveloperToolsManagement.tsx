import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, Activity, Database, Code, LogOut, 
  ArrowRight, ChevronLeft, X, Save, Check, Download,
  RefreshCw, AlertTriangle, Info, Shield, Server
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, addDoc } from 'firebase/firestore';

const SIDEBAR_ITEMS = [
  { id: 'advanced-settings', label: 'الإعدادات المتقدمة', icon: Settings, color: 'from-amber-500 to-orange-500' },
  { id: 'logs', label: 'السجلات', icon: Activity, color: 'from-red-500 to-rose-500' },
  { id: 'backup', label: 'النسخ الاحتياطي', icon: Database, color: 'from-green-500 to-emerald-500' },
  { id: 'dev-tools', label: 'أدوات التطوير', icon: Code, color: 'from-blue-500 to-cyan-500' },
];

export default function DeveloperToolsManagement() {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuthStore();
  const [activeSection, setActiveSection] = useState('advanced-settings');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const db = getFirestore();

  // Firebase Auth protection
  useEffect(() => {
    if (!isLoggedIn || user?.role !== 'admin') {
      navigate('/admin/login');
    }
  }, [isLoggedIn, user, navigate]);

  // State for advanced settings
  const [advancedSettings, setAdvancedSettings] = useState({
    appVersion: '1.0.0',
    maintenanceMode: false,
    debugMode: false,
    maxUploadSize: 10,
    sessionTimeout: 30,
    enableAnalytics: true,
    enableErrorReporting: true,
    apiRateLimit: 100
  });

  // State for logs
  const [logs, setLogs] = useState<any[]>([]);
  const [logFilter, setLogFilter] = useState('all');

  // State for backup
  const [backupStatus, setBackupStatus] = useState('');
  const [lastBackup, setLastBackup] = useState('');

  // State for dev tools
  const [devTools, setDevTools] = useState({
    firebaseConfig: '',
    environmentVariables: '',
    collectionStructure: '',
    apiEndpoints: ''
  });

  // Load settings from Firestore
  useEffect(() => {
    loadAdvancedSettings();
    loadLogs();
    loadDevTools();
  }, []);

  const loadAdvancedSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'advanced'));
      if (settingsDoc.exists()) {
        setAdvancedSettings(settingsDoc.data());
      }
    } catch (error) {
      console.error('Error loading advanced settings:', error);
    }
  };

  const loadLogs = async () => {
    try {
      const q = collection(db, 'logs');
      const querySnapshot = await getDocs(q);
      const logsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLogs(logsData);
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  const loadDevTools = async () => {
    try {
      const toolsDoc = await getDoc(doc(db, 'settings', 'devTools'));
      if (toolsDoc.exists()) {
        setDevTools(toolsDoc.data());
      }
    } catch (error) {
      console.error('Error loading dev tools:', error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'advanced'), advancedSettings, { merge: true });
      await setDoc(doc(db, 'settings', 'devTools'), devTools, { merge: true });
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleBackup = async () => {
    setBackupStatus('جاري إنشاء النسخة الاحتياطية...');
    try {
      // Simulate backup creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const backupData = {
        timestamp: new Date().toISOString(),
        settings: advancedSettings,
        devTools: devTools
      };
      
      await addDoc(collection(db, 'backups'), backupData);
      
      setLastBackup(new Date().toISOString());
      setBackupStatus('تم إنشاء النسخة الاحتياطية بنجاح');
      
      setTimeout(() => setBackupStatus(''), 3000);
    } catch (error) {
      console.error('Error creating backup:', error);
      setBackupStatus('فشل إنشاء النسخة الاحتياطية');
    }
  };

  const addLog = async (type: string, message: string) => {
    try {
      await addDoc(collection(db, 'logs'), {
        type,
        message,
        timestamp: new Date().toISOString(),
        userId: user?.email || 'unknown'
      });
      loadLogs();
    } catch (error) {
      console.error('Error adding log:', error);
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.removeItem('currentUser');
    navigate('/admin/login');
  };

  const filteredLogs = logs.filter(log => {
    if (logFilter === 'all') return true;
    return log.type === logFilter;
  });

  const renderAdvancedSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">الإعدادات المتقدمة</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">إصدار التطبيق</label>
          <input
            type="text"
            value={advancedSettings.appVersion}
            onChange={(e) => setAdvancedSettings({ ...advancedSettings, appVersion: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="flex items-center justify-between text-gray-300 mb-4">
            <span>وضع الصيانة</span>
            <input
              type="checkbox"
              checked={advancedSettings.maintenanceMode}
              onChange={(e) => setAdvancedSettings({ ...advancedSettings, maintenanceMode: e.target.checked })}
              className="w-5 h-5 rounded"
            />
          </label>
          <p className="text-gray-400 text-sm">تعطيل الوصول للعميل عند التفعيل</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="flex items-center justify-between text-gray-300 mb-4">
            <span>وضع التصحيح</span>
            <input
              type="checkbox"
              checked={advancedSettings.debugMode}
              onChange={(e) => setAdvancedSettings({ ...advancedSettings, debugMode: e.target.checked })}
              className="w-5 h-5 rounded"
            />
          </label>
          <p className="text-gray-400 text-sm">تفعيل سجلات التصحيح التفصيلية</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="flex items-center justify-between text-gray-300 mb-4">
            <span>تحليلات البيانات</span>
            <input
              type="checkbox"
              checked={advancedSettings.enableAnalytics}
              onChange={(e) => setAdvancedSettings({ ...advancedSettings, enableAnalytics: e.target.checked })}
              className="w-5 h-5 rounded"
            />
          </label>
          <p className="text-gray-400 text-sm">جمع بيانات الاستخدام</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="flex items-center justify-between text-gray-300 mb-4">
            <span>تقارير الأخطاء</span>
            <input
              type="checkbox"
              checked={advancedSettings.enableErrorReporting}
              onChange={(e) => setAdvancedSettings({ ...advancedSettings, enableErrorReporting: e.target.checked })}
              className="w-5 h-5 rounded"
            />
          </label>
          <p className="text-gray-400 text-sm">إرسال تقارير الأخطاء تلقائياً</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">الحد الأقصى للرفع (MB)</label>
          <input
            type="number"
            value={advancedSettings.maxUploadSize}
            onChange={(e) => setAdvancedSettings({ ...advancedSettings, maxUploadSize: parseInt(e.target.value) })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">انتهاء الجلسة (دقيقة)</label>
          <input
            type="number"
            value={advancedSettings.sessionTimeout}
            onChange={(e) => setAdvancedSettings({ ...advancedSettings, sessionTimeout: parseInt(e.target.value) })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-gray-300 mb-2">حد معدل الطلبات</label>
          <input
            type="number"
            value={advancedSettings.apiRateLimit}
            onChange={(e) => setAdvancedSettings({ ...advancedSettings, apiRateLimit: parseInt(e.target.value) })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
          />
        </div>
      </div>
    </div>
  );

  const renderLogs = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">السجلات</h2>
        <div className="flex gap-3">
          <select
            value={logFilter}
            onChange={(e) => setLogFilter(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
          >
            <option value="all">الكل</option>
            <option value="info">معلومات</option>
            <option value="warning">تحذيرات</option>
            <option value="error">أخطاء</option>
            <option value="success">نجاح</option>
          </select>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => loadLogs()}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white flex items-center gap-2"
          >
            <RefreshCw size={16} />
            تحديث
          </motion.button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Info size={48} className="mx-auto mb-4 opacity-50" />
              <p>لا توجد سجلات</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="border-b border-white/10 p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    log.type === 'error' ? 'bg-red-500/20 text-red-400' :
                    log.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                    log.type === 'success' ? 'bg-green-500/20 text-green-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {log.type === 'error' ? 'خطأ' :
                     log.type === 'warning' ? 'تحذير' :
                     log.type === 'success' ? 'نجاح' : 'معلومات'}
                  </span>
                  <span className="text-gray-400 text-xs">{new Date(log.timestamp).toLocaleString('ar-EG')}</span>
                </div>
                <p className="text-gray-300">{log.message}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => addLog('info', 'سجل معلومات جديد')}
          className="flex-1 py-3 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-400 hover:bg-blue-500/30 transition-all flex items-center justify-center gap-2"
        >
          <Info size={18} />
          إضافة سجل معلومات
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => addLog('warning', 'سجل تحذير جديد')}
          className="flex-1 py-3 bg-yellow-500/20 border border-yellow-500/30 rounded-xl text-yellow-400 hover:bg-yellow-500/30 transition-all flex items-center justify-center gap-2"
        >
          <AlertTriangle size={18} />
          إضافة تحذير
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => addLog('error', 'سجل خطأ جديد')}
          className="flex-1 py-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/30 transition-all flex items-center justify-center gap-2"
        >
          <AlertTriangle size={18} />
          إضافة خطأ
        </motion.button>
      </div>
    </div>
  );

  const renderBackup = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">النسخ الاحتياطي</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Database size={24} className="text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">إنشاء نسخة احتياطية</h3>
              <p className="text-gray-400 text-sm">نسخ احتياطي كامل للبيانات</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBackup}
            disabled={backupStatus.includes('جاري')}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white font-semibold hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {backupStatus.includes('جاري') ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                جاري الإنشاء...
              </>
            ) : (
              <>
                <Download size={18} />
                إنشاء نسخة احتياطية
              </>
            )}
          </motion.button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Server size={24} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">آخر نسخة احتياطية</h3>
              <p className="text-gray-400 text-sm">
                {lastBackup ? new Date(lastBackup).toLocaleString('ar-EG') : 'لا توجد نسخ احتياطية'}
              </p>
            </div>
          </div>
          <div className="text-gray-400 text-sm">
            <p>الحالة: {backupStatus || 'جاهز'}</p>
          </div>
        </div>
      </div>

      {backupStatus && (
        <div className={`p-4 rounded-xl border ${
          backupStatus.includes('نجح') ? 'bg-green-500/20 border-green-500/30 text-green-400' :
          backupStatus.includes('فشل') ? 'bg-red-500/20 border-red-500/30 text-red-400' :
          'bg-blue-500/20 border-blue-500/30 text-blue-400'
        }`}>
          <div className="flex items-center gap-2">
            {backupStatus.includes('نجح') ? <Check size={20} /> :
             backupStatus.includes('فشل') ? <AlertTriangle size={20} /> :
             <RefreshCw size={20} className="animate-spin" />}
            <span>{backupStatus}</span>
          </div>
        </div>
      )}

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">معلومات النظام</h3>
        <div className="space-y-3 text-gray-300">
          <div className="flex justify-between">
            <span>إصدار التطبيق:</span>
            <span className="text-white">{advancedSettings.appVersion}</span>
          </div>
          <div className="flex justify-between">
            <span>وضع الصيانة:</span>
            <span className={advancedSettings.maintenanceMode ? 'text-yellow-400' : 'text-green-400'}>
              {advancedSettings.maintenanceMode ? 'مفعل' : 'معطل'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>وضع التصحيح:</span>
            <span className={advancedSettings.debugMode ? 'text-yellow-400' : 'text-green-400'}>
              {advancedSettings.debugMode ? 'مفعل' : 'معطل'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDevTools = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">أدوات التطوير</h2>
      
      <div className="space-y-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield size={24} className="text-amber-400" />
            <h3 className="text-lg font-bold text-white">إعدادات Firebase</h3>
          </div>
          <textarea
            value={devTools.firebaseConfig}
            onChange={(e) => setDevTools({ ...devTools, firebaseConfig: e.target.value })}
            rows={6}
            placeholder="إعدادات Firebase JSON..."
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white resize-none font-mono text-sm"
          />
          <p className="text-gray-400 text-sm mt-2">⚠️ كن حذراً عند تعديل هذه الإعدادات</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Code size={24} className="text-blue-400" />
            <h3 className="text-lg font-bold text-white">متغيرات البيئة</h3>
          </div>
          <textarea
            value={devTools.environmentVariables}
            onChange={(e) => setDevTools({ ...devTools, environmentVariables: e.target.value })}
            rows={4}
            placeholder="KEY=value"
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white resize-none font-mono text-sm"
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Database size={24} className="text-green-400" />
            <h3 className="text-lg font-bold text-white">هيكل المجموعات</h3>
          </div>
          <textarea
            value={devTools.collectionStructure}
            onChange={(e) => setDevTools({ ...devTools, collectionStructure: e.target.value })}
            rows={6}
            placeholder="وصف هيكل مجموعات Firestore..."
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white resize-none font-mono text-sm"
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Server size={24} className="text-purple-400" />
            <h3 className="text-lg font-bold text-white">نقاط النهاية API</h3>
          </div>
          <textarea
            value={devTools.apiEndpoints}
            onChange={(e) => setDevTools({ ...devTools, apiEndpoints: e.target.value })}
            rows={4}
            placeholder="قائمة نقاط النهاية..."
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white resize-none font-mono text-sm"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen bg-[#050508] text-white font-['Cairo','Tajawal',sans-serif] overflow-hidden" dir="rtl">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#050508]" />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/30 rounded-full blur-3xl"
        />
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3 }}
            className="absolute right-0 top-0 h-full w-72 bg-black/60 backdrop-blur-2xl border-l border-white/10 z-20"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  أدوات المطور
                </h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="space-y-2">
                {SIDEBAR_ITEMS.map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      activeSection === item.id
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <item.icon size={20} />
                    <span className="font-semibold">{item.label}</span>
                  </motion.button>
                ))}
              </nav>

              <div className="absolute bottom-6 left-6 right-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/20 transition-all"
                >
                  <LogOut size={20} />
                  <span>تسجيل الخروج</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 h-full flex">
        {/* Sidebar Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-4 right-4 z-30 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
        >
          {sidebarOpen ? <ChevronLeft size={24} /> : <ArrowRight size={24} />}
        </motion.button>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-6 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  أدوات المطور
                </h1>
                <p className="text-gray-400 mt-2">الإعدادات المتقدمة وأدوات التطوير</p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/admin/selection')}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  <ChevronLeft size={16} />
                  رجوع
                </motion.button>

                {activeSection !== 'logs' && activeSection !== 'backup' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={saveSettings}
                    disabled={saving}
                    className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl text-white font-semibold hover:from-amber-600 hover:to-orange-600 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {saveSuccess ? (
                      <>
                        <Check size={16} />
                        تم الحفظ
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </div>

            {/* Content */}
            <AnimatePresence>
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeSection === 'advanced-settings' && renderAdvancedSettings()}
                {activeSection === 'logs' && renderLogs()}
                {activeSection === 'backup' && renderBackup()}
                {activeSection === 'dev-tools' && renderDevTools()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
