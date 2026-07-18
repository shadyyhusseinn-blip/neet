import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Save, Check, Key, MessageSquare, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { audioService } from '../../services/audio';
import { firebaseService } from '../../services/firebase';
import { AIConfigSchema } from '../../types/firestoreSchema';
import { useAdminDataStore } from '../../stores/adminDataStore';
import { confettiService } from '../../services/confetti';
import { validateForm, aiConfigSchema, ValidationError } from '../../utils/validation';

export default function AIManagement() {
  const navigate = useNavigate();
  const { aiConfig, initializeData, updateAIConfig } = useAdminDataStore();
  const [formData, setFormData] = useState<AIConfigSchema>({
    systemPrompt: '',
    apiKey: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    if (aiConfig) {
      setFormData(aiConfig);
      setLoading(false);
    }
  }, [aiConfig]);

  const handleSave = async () => {
    // Validate form data
    const errors = validateForm(aiConfigSchema, formData);
    if (errors) {
      setValidationErrors(errors);
      if (!audioService.getMuteState()) audioService.playError();
      return;
    }
    
    setValidationErrors([]);
    setIsSaving(true);
    
    // Optimistic update
    updateAIConfig(formData);

    try {
      // Sync with Firebase in background
      await firebaseService.setDocument('settings', 'ai-config', formData);
      if (!audioService.getMuteState()) audioService.playSuccess();
      confettiService.fireCenter();
      setToastMessage('تم حفظ إعدادات المساعد الذكي بنجاح');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error('Error saving AI config:', error);
      if (!audioService.getMuteState()) audioService.playError();
      // Revert optimistic update on error
      initializeData();
      alert('حدث خطأ أثناء حفظ الإعدادات');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#1a1a2e] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#1a1a2e] text-white" dir="rtl">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-emerald-600/90 backdrop-blur-xl border border-emerald-500/30 rounded-xl shadow-lg shadow-emerald-500/20"
          >
            <div className="flex items-center gap-2">
              <Check size={20} className="text-white" />
              <span className="text-white font-medium">{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-3 mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (!audioService.getMuteState()) audioService.playClick();
              navigate('/admin/websiteadministration');
            }}
            className="p-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg text-slate-400 hover:text-white hover:bg-black/50 transition-all hover:scale-110 shadow-lg"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <div>
            <h1 className="text-2xl font-bold text-white">إدارة مساعد الـ AI</h1>
            <p className="text-slate-400 text-sm mt-1">تعديل تعليمات البوت وإعدادات الذكاء الاصطناعي</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-6 shadow-xl transition-all hover:scale-[1.01]">
          {/* System Prompt */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
              <MessageSquare size={16} className="text-slate-400" />
              تعليمات النظام (System Prompt)
            </label>
            <textarea
              value={formData.systemPrompt}
              onChange={(e) => setFormData(prev => ({ ...prev, systemPrompt: e.target.value }))}
              rows={8}
              className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-all hover:scale-[1.01] backdrop-blur-sm resize-none"
              placeholder="أدخل التعليمات الأساسية للبوت هنا... مثال: أنت مساعد ذكي لاستوديو التصوير شادي حسين. تقدم معلومات عن الباقات والأسعار الحالية..."
            />
            <p className="text-xs text-slate-500 mt-2">
              هذه التعليمات تحدد كيفية تصرف البوت والردود التي يقدمها للعملاء
            </p>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
              <Key size={16} className="text-slate-400" />
              Gemini API Key
            </label>
            <input
              type="password"
              value={formData.apiKey}
              onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
              className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-all hover:scale-[1.01] backdrop-blur-sm"
              placeholder="أدخل مفتاح API الخاص بـ Gemini"
            />
            <p className="text-xs text-slate-500 mt-2">
              مفتاح API يستخدم لتشغيل المساعد الذكي. يتم تخزينه بشكل آمن في Firestore.
            </p>
          </div>

          {/* Save Button */}
          <div className="flex gap-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save size={18} />
                  حفظ الإعدادات
                </>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (!audioService.getMuteState()) audioService.playClick();
                navigate('/admin/site-manager');
              }}
              className="px-6 py-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl text-white font-semibold hover:bg-black/50 transition-all hover:scale-105 shadow-lg"
            >
              إلغاء
            </motion.button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl backdrop-blur-sm transition-all hover:scale-[1.01]">
          <p className="text-sm text-emerald-200">
            <strong className="text-emerald-100">ملاحظة:</strong> التغييرات في التعليمات ستؤثر فوراً على ردود المساعد الذكي في الصفحة الرئيسية للعملاء.
          </p>
        </div>
      </div>
    </div>
  );
}
