import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, Shield, Database, Bell, Palette, 
  Lock, Cpu, RefreshCcw, Trash2, ShieldCheck, Check,
  Sparkles, Brain, Fingerprint, Eye, Key, Terminal, Zap,
  Moon, Sun, Monitor, Smartphone, Volume2, ChevronLeft, Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from '../../services/storage';
import { audioService } from '../../services/audio';
import { firebaseService } from '../../services/firebase';
import { cn, toArabicDigits } from '../../lib/utils';

export default function Settings() {
  const [activeSection, setActiveSection] = useState<'system' | 'security' | 'storage' | 'aesthetic' | 'integrations'>('system');
  const [zapierWebhookUrl, setZapierWebhookUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadZapierWebhookUrl();
  }, []);

  const loadZapierWebhookUrl = async () => {
    try {
      const settings = await firebaseService.getDocument('app_settings', 'config');
      if (settings && settings.zapierWebhookUrl) {
        setZapierWebhookUrl(settings.zapierWebhookUrl);
      }
    } catch (error) {
      console.error('Error loading Zapier webhook URL:', error);
    }
  };

  const saveZapierWebhookUrl = async () => {
    setSaving(true);
    try {
      // Check if document exists first
      const existingDoc = await firebaseService.getDocument('app_settings', 'config');
      
      if (existingDoc) {
        // Update existing document
        await firebaseService.setDocument('app_settings', 'config', {
          ...existingDoc,
          zapierWebhookUrl: zapierWebhookUrl
        });
      } else {
        // Create new document
        await firebaseService.setDocument('app_settings', 'config', {
          zapierWebhookUrl: zapierWebhookUrl,
          createdAt: new Date().toISOString()
        });
      }
      
      audioService.playSuccess();
      alert('تم حفظ رابط Zapier Webhook بنجاح!');
    } catch (error) {
      console.error('Error saving Zapier webhook URL:', error);
      alert('فشل حفظ الرابط: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (confirm('هل أنت متأكد من حذف جميع البيانات؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      await storage.clearAll();
      audioService.playClick();
      window.location.reload();
    }
  };

  const sections = [
    { id: 'system', label: 'النظام', icon: Cpu, desc: 'إعدادات الأداء والتشغيل' },
    { id: 'security', label: 'الأمان', icon: Shield, desc: 'حماية البيانات والخصوصية' },
    { id: 'storage', label: 'التخزين', icon: Database, desc: 'إدارة البيانات والنسخ الاحتياطي' },
    { id: 'integrations', label: 'التكاملات', icon: Zap, desc: 'ربط مع Zapier وخدمات أخرى' },
    { id: 'aesthetic', label: 'المظهر', icon: Palette, desc: 'تخصيص الواجهة والألوان' }
  ];

  return (
    <div className="view-page" dir="rtl">
      <div className="max-w-7xl mx-auto p-6">
        
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <SettingsIcon size={32} className="text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-text-main">الإعدادات</h1>
                <p className="text-text-muted text-sm">تخصيص مدير المصور حسب احتياجاتك</p>
              </div>
            </div>
            <button 
              onClick={() => audioService.playSuccess()}
              className="px-6 py-3 bg-primary text-white rounded-xl font-medium flex items-center gap-2 hover:bg-primary/90 transition-all"
            >
              <Check size={20} />
              حفظ التغييرات
            </button>
          </div>
        </header>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
           
           {/* Sidebar Navigation */}
           <div className="lg:col-span-1 space-y-2">
              {sections.map(s => (
                <button 
                  key={s.id} 
                  onClick={() => { setActiveSection(s.id as any); audioService.playClick(); }}
                  className={cn(
                    "w-full p-4 rounded-xl text-right flex items-center gap-3 transition-all",
                    activeSection === s.id 
                      ? "bg-primary text-white shadow-lg" 
                      : "bg-surface border border-main text-text-muted hover:bg-white/[0.04]"
                  )}
                >
                  <s.icon size={20} className={activeSection === s.id ? "text-white" : "text-primary"} />
                  <div className="flex-1">
                    <div className={cn("font-medium", activeSection === s.id ? "text-white" : "text-text-main")}>{s.label}</div>
                    <div className="text-xs opacity-60">{s.desc}</div>
                  </div>
                  {activeSection === s.id && <ChevronLeft className="text-white" size={16} />}
                </button>
              ))}
           </div>

           {/* Main Configuration Panel */}
           <div className="lg:col-span-3">
              <div className="bg-surface border border-main rounded-2xl p-6 min-h-[600px]">
                 <AnimatePresence mode="wait">
                    <motion.div 
                       key={activeSection}
                       initial={{ opacity: 0, y: 20 }} 
                       animate={{ opacity: 1, y: 0 }} 
                       exit={{ opacity: 0, y: -20 }}
                       transition={{ duration: 0.3 }}
                    >
                       {activeSection === 'system' && (
                         <div className="space-y-6">
                            <div>
                               <h2 className="text-2xl font-bold text-text-main mb-2">إعدادات النظام</h2>
                               <p className="text-text-muted">تخصيص إعدادات الأداء والتشغيل</p>
                            </div>
                            
                            <div className="space-y-4">
                               <SettingToggle label="الوضع السينمائي" desc="تفعيل المؤثرات البصرية" icon={Sparkles} defaultOn />
                               <SettingToggle label="الذكاء الاصطناعي" desc="تفعيل التوصيات الذكية" icon={Brain} defaultOn />
                               <SettingToggle label="المزامنة التلقائية" desc="مزامنة البيانات عبر السحابة" icon={RefreshCcw} defaultOn />
                               <SettingToggle label="الإشعارات" desc="تنبيهات المواعيد والعمليات" icon={Bell} defaultOn />
                            </div>

                            <div className="pt-6 border-t border-main">
                               <label className="block text-sm font-medium text-text-muted mb-2">لغة الواجهة</label>
                               <select className="w-full p-3 bg-white/[0.04] border border-main rounded-xl text-text-main outline-none focus:border-primary transition-all">
                                  <option>العربية</option>
                                  <option>English</option>
                               </select>
                            </div>
                         </div>
                       )}

                       {activeSection === 'security' && (
                         <div className="space-y-6">
                            <div>
                               <h2 className="text-2xl font-bold text-text-main mb-2">إعدادات الأمان</h2>
                               <p className="text-text-muted">حماية بياناتك وخصوصيتك</p>
                            </div>
                            
                            <div className="space-y-4">
                               <SettingToggle label="المصادقة الثنائية" desc="حماية إضافية لحسابك" icon={Fingerprint} defaultOn />
                               <SettingToggle label="تشفير البيانات" desc="تشفير جميع البيانات الحساسة" icon={Lock} defaultOn />
                               <SettingToggle label="جدار الحماية" desc="منع الوصول غير المصرح" icon={ShieldCheck} defaultOn />
                               <SettingToggle label="وضع التخفي" desc="إخفاء المعلومات الحساسة" icon={Eye} />
                            </div>

                            <div className="p-4 rounded-xl bg-surface border border-main flex items-center justify-between">
                               <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                     <Key size={24} className="text-primary" />
                                  </div>
                                  <div>
                                     <h4 className="font-bold text-text-main">تغيير كلمة المرور</h4>
                                     <p className="text-sm text-text-muted">تحديث كلمة المرور لحماية حسابك</p>
                                  </div>
                               </div>
                               <button className="px-4 py-2 bg-primary/10 text-primary rounded-xl font-medium hover:bg-primary/20 transition-all">
                                  تغيير
                               </button>
                            </div>
                         </div>
                       )}

                       {activeSection === 'storage' && (
                         <div className="space-y-6">
                            <div>
                               <h2 className="text-2xl font-bold text-text-main mb-2">إدارة التخزين</h2>
                               <p className="text-text-muted">إدارة البيانات ومساحة التخزين</p>
                            </div>

                            <div className="p-4 rounded-xl bg-surface border border-main flex justify-between items-center">
                               <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                     <Database size={24} className="text-primary" />
                                  </div>
                                  <div>
                                     <h4 className="font-bold text-text-main">التخزين المحلي</h4>
                                     <div className="flex items-center gap-2 text-emerald-500">
                                        <Zap size={14} />
                                        <p className="text-sm font-medium">الحجم: {toArabicDigits('١٢.٤')} MB</p>
                                     </div>
                                  </div>
                               </div>
                               <button className="px-4 py-2 bg-primary/10 text-primary rounded-xl font-medium hover:bg-primary/20 transition-all">
                                  تحسين
                               </button>
                            </div>

                            <div className="p-6 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-4">
                               <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-xl bg-rose-500 flex items-center justify-center text-white">
                                     <Terminal size={24} />
                                  </div>
                                  <div>
                                     <h4 className="font-bold text-text-main">حذف جميع البيانات</h4>
                                     <p className="text-sm text-rose-500">هذا الإجراء لا يمكن التراجع عنه</p>
                                  </div>
                               </div>
                               <p className="text-text-muted text-sm">
                                  سيتم حذف جميع البيانات بما في ذلك السجلات والتعاقدات والمعلومات المالية.
                               </p>
                               <button onClick={handleReset} className="w-full py-3 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-all flex items-center justify-center gap-2">
                                  <Trash2 size={20} />
                                  حذف جميع البيانات
                               </button>
                            </div>
                         </div>
                       )}

                       {activeSection === 'integrations' && (
                         <div className="space-y-6">
                            <div>
                               <h2 className="text-2xl font-bold text-text-main mb-2">التكاملات</h2>
                               <p className="text-text-muted">ربط التطبيق مع خدمات خارجية مثل Zapier</p>
                            </div>

                            <div className="space-y-4">
                               <div className="p-6 rounded-xl bg-surface border border-main space-y-4">
                                  <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                        <Zap size={24} className="text-orange-500" />
                                     </div>
                                     <div>
                                        <h4 className="font-bold text-text-main">Zapier Webhook</h4>
                                        <p className="text-sm text-text-muted">ربط مع Zapier لإرسال إشعارات WhatsApp تلقائياً</p>
                                     </div>
                                  </div>

                                  <div className="space-y-2">
                                     <label className="block text-sm font-medium text-text-muted">رابط Zapier Webhook للواتساب</label>
                                     <input
                                        type="url"
                                        value={zapierWebhookUrl}
                                        onChange={(e) => setZapierWebhookUrl(e.target.value)}
                                        placeholder="https://hooks.zapier.com/hooks/catch/..."
                                        className="w-full p-3 bg-white/[0.04] border border-main rounded-xl text-text-main outline-none focus:border-primary transition-all"
                                        dir="ltr"
                                     />
                                     <p className="text-xs text-text-muted">
                                        الصق رابط Webhook من Zapier هنا. سيتم استخدامه لإرسال بيانات الحجز تلقائياً.
                                     </p>
                                  </div>

                                  <button
                                     onClick={saveZapierWebhookUrl}
                                     disabled={saving}
                                     className="w-full py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                  >
                                     <Save size={20} />
                                     {saving ? 'جاري الحفظ...' : 'حفظ الرابط'}
                                  </button>
                               </div>
                            </div>
                         </div>
                       )}

                       {activeSection === 'aesthetic' && (
                         <div className="space-y-6">
                            <div>
                               <h2 className="text-2xl font-bold text-text-main mb-2">المظهر</h2>
                               <p className="text-text-muted">تخصيص واجهة التطبيق</p>
                            </div>
                            
                            <div className="space-y-4">
                               <SettingToggle label="الوضع الداكن" desc="استخدام الألوان الداكنة" icon={Moon} defaultOn />
                               <SettingToggle label="الوضع الفاتح" desc="استخدام الألوان الفاتحة" icon={Sun} />
                               <SettingToggle label="تأثيرات الحركة" desc="تفعيل الرسوم المتحركة" icon={Sparkles} defaultOn />
                               <SettingToggle label="الأصوات" desc="تفعيل المؤثرات الصوتية" icon={Volume2} defaultOn />
                            </div>

                            <div className="pt-6 border-t border-main">
                               <label className="block text-sm font-medium text-text-muted mb-4">حجم الواجهة</label>
                               <div className="grid grid-cols-3 gap-3">
                                  <button className="p-4 rounded-xl bg-surface border border-main hover:border-primary transition-all flex flex-col items-center gap-2">
                                     <Smartphone size={24} className="text-primary" />
                                     <span className="text-sm">صغير</span>
                                  </button>
                                  <button className="p-4 rounded-xl bg-primary/10 border-2 border-primary flex flex-col items-center gap-2">
                                     <Monitor size={24} className="text-primary" />
                                     <span className="text-sm font-medium">متوسط</span>
                                  </button>
                                  <button className="p-4 rounded-xl bg-surface border border-main hover:border-primary transition-all flex flex-col items-center gap-2">
                                     <Monitor size={24} className="text-primary" />
                                     <span className="text-sm">كبير</span>
                                  </button>
                               </div>
                            </div>
                         </div>
                       )}
                    </motion.div>
                 </AnimatePresence>
              </div>
           </div>

        </div>

      </div>
    </div>
  );
}

function SettingToggle({ label, desc, icon: Icon, defaultOn }: any) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="p-4 rounded-xl bg-surface border border-main flex items-center justify-between hover:bg-white/[0.04] transition-all">
       <div className="flex items-center gap-4">
          <div className={cn(
             "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
             on ? "bg-primary text-white" : "bg-white/[0.04] text-text-muted"
          )}>
             <Icon size={20} />
          </div>
          <div className="text-right">
             <div className="font-medium text-text-main">{label}</div>
             <div className="text-xs text-text-muted">{desc}</div>
          </div>
       </div>
       <button 
         onClick={() => { setOn(!on); audioService.playClick(); }}
         className={cn(
           "w-14 h-8 rounded-full p-1 transition-all relative",
           on ? "bg-primary" : "bg-white/[0.04]"
         )}
       >
          <motion.div 
            animate={{ x: on ? 24 : 0 }} 
            className={cn("w-6 h-6 rounded-full shadow-md flex items-center justify-center", on ? "bg-white" : "bg-white/40")}
          >
              {on && <Check size={12} className="text-primary" />}
          </motion.div>
       </button>
    </div>
  );
}
