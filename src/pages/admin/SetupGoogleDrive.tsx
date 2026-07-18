import { useState } from 'react';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';

export default function SetupGoogleDrive() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');

  const setupCredentials = async () => {
    try {
      setLoading(true);
      setError(null);
      const db = getFirestore();

      console.log('Attempting to add Google Drive credentials to Firestore...');

      await setDoc(doc(db, 'system_settings', 'google_drive_config'), {
        clientId,
        clientSecret,
        parentFolderId: '',
        updatedAt: new Date().toISOString()
      });

      toast.success('✅ تم إضافة بيانات Google Drive بنجاح!');
      console.log('Google Drive credentials added to Firestore');
    } catch (error: any) {
      console.error('Error adding credentials:', error);
      const errorMessage = error?.message || error?.code || JSON.stringify(error);
      setError(errorMessage);
      toast.error(`❌ فشل إضافة البيانات: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">إعداد Google Drive</h1>
      <p className="text-gray-400 mb-4">
        أدخل بيانات Google Drive واضغط على الزر لإضافتها إلى Firestore
      </p>

      <div className="space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm font-medium mb-2">Client ID</label>
          <input
            type="text"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="أدخل Client ID من Environment Variables أو أدخل يدوياً"
            className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white transition-all hover:scale-[1.01] backdrop-blur-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Client Secret</label>
          <input
            type="password"
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            placeholder="أدخل Client Secret من Environment Variables أو أدخل يدوياً"
            className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white transition-all hover:scale-[1.01] backdrop-blur-sm"
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 backdrop-blur-sm transition-all hover:scale-[1.01]">
            <p className="text-red-400 text-sm">خطأ: {error}</p>
          </div>
        )}

        <button
          onClick={setupCredentials}
          disabled={loading}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all hover:scale-105 disabled:opacity-50 shadow-lg shadow-blue-500/20"
        >
          {loading ? 'جاري الإضافة...' : 'إضافة بيانات Google Drive'}
        </button>
      </div>

      <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg backdrop-blur-sm transition-all hover:scale-[1.01]">
        <h3 className="font-bold mb-2 text-green-400">✅ الطريقة الموصى بها (Environment Variables):</h3>
        <ol className="list-decimal list-inside text-sm text-gray-400 space-y-2">
          <li>أضف المتغيرات التالية إلى ملف <code className="bg-gray-700 px-2 py-1 rounded">.env</code> في جذر المشروع:</li>
          <li className="mr-4"><code className="bg-gray-700 px-2 py-1 rounded">VITE_GOOGLE_DRIVE_CLIENT_ID=your_client_id_here</code></li>
          <li className="mr-4"><code className="bg-gray-700 px-2 py-1 rounded">VITE_GOOGLE_DRIVE_CLIENT_SECRET=your_client_secret_here</code></li>
          <li>أعد تشغيل خادم التطوير بعد إضافة المتغيرات</li>
          <li>النظام سيقرأ المتغيرات تلقائياً من Environment Variables</li>
        </ol>
      </div>

      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg backdrop-blur-sm transition-all hover:scale-[1.01]">
        <h3 className="font-bold mb-2 text-blue-400">⚠️ الطريقة اليدوية (Firestore):</h3>
        <ol className="list-decimal list-inside text-sm text-gray-400 space-y-2">
          <li>استخدم هذه الطريقة فقط إذا كنت لا تستخدم Environment Variables</li>
          <li>اذهب إلى <a href="https://console.firebase.google.com/project/photography-shady-program/firestore" target="_blank" rel="noopener noreferrer" className="text-slate-400 underline">Firebase Console - Firestore</a></li>
          <li>اضغط على "Start collection" أو أنشئ collection جديد</li>
          <li>اسم الـ collection: <code className="bg-gray-700 px-2 py-1 rounded">system_settings</code></li>
          <li>أنشئ document جديد</li>
          <li>اسم الـ document: <code className="bg-gray-700 px-2 py-1 rounded">google_drive_config</code></li>
          <li>أضف الحقول التالية:</li>
          <li className="mr-4"><code className="bg-gray-700 px-2 py-1 rounded">clientId</code>: Client ID الخاص بك</li>
          <li className="mr-4"><code className="bg-gray-700 px-2 py-1 rounded">clientSecret</code>: Client Secret الخاص بك</li>
          <li className="mr-4"><code className="bg-gray-700 px-2 py-1 rounded">parentFolderId</code>: <code className="bg-gray-700 px-2 py-1 rounded">""</code> (فارغ)</li>
          <li className="mr-4"><code className="bg-gray-700 px-2 py-1 rounded">updatedAt</code>: <code className="bg-gray-700 px-2 py-1 rounded">timestamp</code></li>
        </ol>
      </div>

      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg backdrop-blur-sm transition-all hover:scale-[1.01]">
        <h3 className="font-bold mb-2 text-blue-400">🔗 خطوات مهمة قبل الاختبار:</h3>
        <ol className="list-decimal list-inside text-sm text-gray-400 space-y-2">
          <li>اذهب إلى <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 underline">Google Cloud Console</a></li>
          <li>اذهب إلى APIs & Services &gt; Credentials</li>
          <li>اضغط على OAuth 2.0 Client ID الخاص بك</li>
          <li>في قسم Authorized redirect URIs، أضف: <code className="bg-gray-700 px-2 py-1 rounded">https://photography-shady-program.web.app</code></li>
          <li>احفظ التغييرات</li>
          <li>بعد إضافة البيانات، اذهب إلى صفحة إدارة المعارض واختر "ربط Google Drive"</li>
        </ol>
      </div>
    </div>
  );
}
