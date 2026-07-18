import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { googleDriveService, MigrationResult } from '../../services/googleDrive';
import { CheckCircle, XCircle, Link, Unlink, RefreshCw, Database, ArrowRight, AlertTriangle } from 'lucide-react';

interface GoogleDriveConfig {
  clientId: string;
  clientSecret: string;
  parentFolderId: string;
  updatedAt: string;
}

export default function GoogleDriveSettings() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [showMigrationSection, setShowMigrationSection] = useState(false);
  const [config, setConfig] = useState<GoogleDriveConfig>({
    clientId: '',
    clientSecret: '',
    parentFolderId: '',
    updatedAt: '',
  });

  useEffect(() => {
    loadConfig();
    checkConnectionStatus();

    // Handle OAuth callback
    const code = searchParams.get('code');
    if (code) {
      handleOAuthCallback(code);
    }
  }, [searchParams]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const db = getFirestore();
      const configRef = doc(db, 'system_settings', 'google_drive_config');
      const configSnap = await getDoc(configRef);
      
      if (configSnap.exists()) {
        const data = configSnap.data() as GoogleDriveConfig;
        setConfig(data);
      }
    } catch (error) {
      console.error('Error loading config:', error);
      toast.error('فشل تحميل الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const checkConnectionStatus = async () => {
    try {
      setCheckingConnection(true);
      const authenticated = await googleDriveService.isAuthenticated();
      setIsConnected(authenticated);
    } catch (error) {
      console.error('Error checking connection:', error);
      setIsConnected(false);
    } finally {
      setCheckingConnection(false);
    }
  };

  const handleOAuthCallback = async (code: string) => {
    try {
      toast.loading('جاري ربط حساب Google Drive...');
      await googleDriveService.handleCallback(code);
      toast.dismiss();
      toast.success('تم ربط حساب Google Drive بنجاح ✅');
      setIsConnected(true);
      // Remove code from URL
      navigate('/admin/google-drive-settings', { replace: true });
    } catch (error) {
      console.error('OAuth callback error:', error);
      toast.dismiss();
      toast.error('فشل ربط حساب Google Drive');
      setIsConnected(false);
    }
  };

  const handleSave = async () => {
    if (!config.clientId || !config.clientSecret) {
      toast.error('يرجى إدخال Client ID و Client Secret');
      return;
    }

    try {
      setSaving(true);
      const db = getFirestore();
      const configRef = doc(db, 'system_settings', 'google_drive_config');
      
      await setDoc(configRef, {
        ...config,
        updatedAt: new Date().toISOString(),
      });
      
      toast.success('تم حفظ الإعدادات بنجاح ✅');
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('فشل حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    await checkConnectionStatus();
    if (isConnected) {
      toast.success('الاتصال يعمل بشكل صحيح ✅');
    } else {
      toast.error('فشل الاتصال - يرجى إعادة الربط');
    }
  };

  const handleConnect = async () => {
    try {
      await googleDriveService.authenticate('/admin/google-drive-settings');
    } catch (error) {
      console.error('Error connecting to Google Drive:', error);
      toast.error('فشل الاتصال بـ Google Drive');
    }
  };

  const handleDisconnect = async () => {
    try {
      googleDriveService.logout();
      setIsConnected(false);
      toast.success('تم فصل الاتصال بنجاح');
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast.error('فشل فصل الاتصال');
    }
  };

  const handleMigration = async () => {
    if (!isConnected) {
      toast.error('يجب الاتصال بـ Google Drive أولاً');
      return;
    }

    if (!confirm('هل أنت متأكد من بدء عملية الهجرة؟\n\nهذه العملية ستقوم بـ:\n1. البحث عن مجلدات Gallery القديمة\n2. نقل جميع مجلدات العملاء إلى المجلد الرئيسي الجديد "ShadyHusseinPhotography_Galleries"\n3. حذف المجلدات القديمة الفارغة\n4. تحديث Firestore بالـ Folder IDs الجديدة\n\n⚠️ هذه العملية لمرة فقط ولا يمكن التراجع عنها.')) {
      return;
    }

    try {
      setMigrating(true);
      setMigrationResult(null);
      toast.loading('جاري بدء عملية الهجرة...');

      // Execute migration
      const result = await googleDriveService.executeMigration();
      setMigrationResult(result);

      toast.dismiss();

      if (result.success) {
        toast.success(`✅ ${result.message}`);
        
        // Update Firestore after successful migration
        try {
          await googleDriveService.updateFirestoreAfterMigration();
          toast.success('✅ تم تحديث Firestore بنجاح');
        } catch (error) {
          console.error('Failed to update Firestore:', error);
          toast.error('فشل تحديث Firestore');
        }
      } else {
        toast.error(`❌ ${result.message}`);
      }

      if (result.errors.length > 0) {
        console.error('Migration errors:', result.errors);
      }
    } catch (error) {
      console.error('Migration error:', error);
      toast.dismiss();
      toast.error('فشلت عملية الهجرة');
      setMigrationResult({
        success: false,
        message: 'فشلت عملية الهجرة',
        migratedGalleries: 0,
        deletedOldFolders: 0,
        errors: [String(error)],
      });
    } finally {
      setMigrating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">إعدادات Google Drive</h1>
          <p className="text-gray-400">إدارة بيانات ربط Google Drive API</p>
        </div>
        <button
          onClick={() => navigate('/admin/websiteadministration')}
          className="px-4 py-2 bg-black/40 backdrop-blur-xl border border-white/10 hover:bg-black/50 text-white rounded-lg transition-all hover:scale-105 shadow-lg"
        >
          رجوع
        </button>
      </div>

      {/* Connection Status Card */}
      <div className={`rounded-xl p-6 border-2 backdrop-blur-sm transition-all hover:scale-[1.01] ${
        isConnected
          ? 'bg-green-500/10 border-green-500/30'
          : 'bg-red-500/10 border-red-500/30'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${
              isConnected
                ? 'bg-green-500/20'
                : 'bg-red-500/20'
            }`}>
              {isConnected ? (
                <CheckCircle size={32} className="text-green-400" />
              ) : (
                <XCircle size={32} className="text-red-400" />
              )}
            </div>
            <div>
              <h3 className={`text-xl font-semibold ${
                isConnected ? 'text-green-400' : 'text-red-400'
              }`}>
                {isConnected ? 'متصل بـ Google Drive' : 'غير متصل بـ Google Drive'}
              </h3>
              <p className="text-gray-400 text-sm">
                {isConnected
                  ? 'الاتصال نشط ويعمل بشكل صحيح'
                  : 'يرجى ربط حساب Google Drive لاستخدام الميزات'
                }
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={checkConnectionStatus}
              disabled={checkingConnection}
              className="p-3 bg-black/20 border border-white/10 hover:bg-black/30 rounded-lg transition-all hover:scale-110 disabled:opacity-50 backdrop-blur-sm"
              title="تحديث حالة الاتصال"
            >
              <RefreshCw size={20} className={`text-white ${checkingConnection ? 'animate-spin' : ''}`} />
            </button>
            {isConnected ? (
              <button
                onClick={handleDisconnect}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all hover:scale-105 shadow-lg shadow-red-500/20"
              >
                <Unlink size={20} />
                فصل الاتصال
              </button>
            ) : (
              <button
                onClick={handleConnect}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all hover:scale-105 shadow-lg shadow-green-500/20"
              >
                <Link size={20} />
                ربط الحساب
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 space-y-6 shadow-xl transition-all hover:scale-[1.01]">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Client ID
            </label>
            <input
              type="text"
              value={config.clientId}
              onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
              placeholder="أدخل Google Drive Client ID"
              className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-all hover:scale-[1.01] backdrop-blur-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              يمكنك الحصول عليه من Google Cloud Console
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Client Secret
            </label>
            <input
              type="password"
              value={config.clientSecret}
              onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
              placeholder="أدخل Google Drive Client Secret"
              className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-all hover:scale-[1.01] backdrop-blur-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              سر التطبيق من Google Cloud Console
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Parent Folder ID (اختياري)
            </label>
            <input
              type="text"
              value={config.parentFolderId}
              onChange={(e) => setConfig({ ...config, parentFolderId: e.target.value })}
              placeholder="معرف المجلد الرئيسي في Google Drive"
              className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-all hover:scale-[1.01] backdrop-blur-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              المجلد الذي سيتم إنشاء المعارض بداخله
            </p>
          </div>
        </div>

        {/* Last Updated */}
        {config.updatedAt && (
          <div className="text-sm text-gray-400">
            آخر تحديث: {new Date(config.updatedAt).toLocaleString('ar-EG')}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
          >
            {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </button>
          <button
            onClick={handleTestConnection}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all hover:scale-105 shadow-lg shadow-green-500/20"
          >
            اختبار الاتصال
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-xl transition-all hover:scale-[1.01]">
        <h3 className="text-lg font-semibold text-white mb-4">كيفية الحصول على البيانات:</h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-300 text-sm">
          <li>اذهب إلى <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:underline">Google Cloud Console</a></li>
          <li>أنشئ مشروع جديد أو اختر مشروع موجود</li>
          <li>فعّل Google Drive API</li>
          <li>اذهب إلى APIs & Services → Credentials</li>
          <li>أنشئ OAuth 2.0 Client ID</li>
          <li>أضف رابط موقعك في Authorized redirect URIs (مثال: https://photography-shady-program.web.app)</li>
          <li>انسخ Client ID و Client Secret</li>
          <li>أضفهم في ملف .env كـ VITE_GOOGLE_DRIVE_CLIENT_ID و VITE_GOOGLE_DRIVE_CLIENT_SECRET</li>
        </ol>
        
        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-blue-400 text-sm font-medium mb-2">⚠️ ملاحظة هامة:</p>
          <p className="text-gray-300 text-xs">
            بعد إضافة البيانات في ملف .env، يجب إعادة تشغيل السيرفر لتطبيق التغييرات. ثم احفظ الإعدادات في الأعلى واضغط على "ربط الحساب" لبدء عملية المصادقة.
          </p>
        </div>
      </div>

      {/* Migration Section */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 border-2 border-blue-500/30 shadow-xl transition-all hover:scale-[1.01]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Database size={24} className="text-slate-400" />
            <div>
              <h3 className="text-xl font-semibold text-white">سكربت الهجرة لمرة واحدة</h3>
              <p className="text-gray-400 text-sm">نقل جميع المعارض إلى المجلد الرئيسي الجديد</p>
            </div>
          </div>
          <button
            onClick={() => setShowMigrationSection(!showMigrationSection)}
            className="px-4 py-2 bg-black/40 backdrop-blur-xl border border-white/10 hover:bg-black/50 text-white rounded-lg transition-all hover:scale-105 shadow-lg"
          >
            {showMigrationSection ? 'إخفاء' : 'عرض'}
          </button>
        </div>

        {showMigrationSection && (
          <div className="space-y-6">
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <h4 className="text-blue-400 font-medium mb-2 flex items-center gap-2">
                <ArrowRight size={16} />
                ماذا يفعل هذا السكربت؟
              </h4>
              <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                <li>البحث عن جميع مجلدات "Gallery" القديمة في Google Drive</li>
                <li>نقل جميع مجلدات العملاء إلى المجلد الرئيسي الجديد "ShadyHusseinPhotography_Galleries"</li>
                <li>حذف المجلدات القديمة الفارغة بعد النقل</li>
                <li>تحديث Firestore بالـ Folder IDs الجديدة</li>
              </ul>
            </div>

            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <h4 className="text-red-400 font-medium mb-2 flex items-center gap-2">
                <AlertTriangle size={16} />
                تحذير هام
              </h4>
              <p className="text-gray-300 text-sm">
                هذه العملية لمرة فقط ولا يمكن التراجع عنها. تأكد من أنك متصل بـ Google Drive قبل البدء.
              </p>
            </div>

            {migrationResult && (
              <div className={`p-4 rounded-lg ${
                migrationResult.success
                  ? 'bg-green-500/10 border border-green-500/30'
                  : 'bg-red-500/10 border border-red-500/30'
              }`}>
                <h4 className={`font-medium mb-2 ${
                  migrationResult.success ? 'text-green-400' : 'text-red-400'
                }`}>
                  {migrationResult.success ? '✅ نجحت الهجرة' : '❌ فشلت الهجرة'}
                </h4>
                <p className="text-gray-300 text-sm mb-2">{migrationResult.message}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">المعارض المنقولة:</span>
                    <span className="text-white font-medium mr-2">{migrationResult.migratedGalleries}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">المجلدات المحذوفة:</span>
                    <span className="text-white font-medium mr-2">{migrationResult.deletedOldFolders}</span>
                  </div>
                </div>
                {migrationResult.errors.length > 0 && (
                  <div className="mt-3">
                    <span className="text-gray-400 text-sm">الأخطاء:</span>
                    <ul className="list-disc list-inside text-red-400 text-xs mt-1">
                      {migrationResult.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleMigration}
              disabled={migrating || !isConnected}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-blue-500/20"
            >
              {migrating ? 'جاري الهجرة...' : 'بدء عملية الهجرة'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
