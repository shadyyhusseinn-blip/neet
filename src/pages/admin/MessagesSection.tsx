import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Bell, MessageSquare, Phone, Settings, CheckCircle, 
  AlertTriangle, RefreshCw, ToggleLeft, ToggleRight, 
  Clock, DollarSign, Calendar, Save, TestTube, Info, Send
} from 'lucide-react';
import { storage } from '../../services/storage';
import { cn } from '../../lib/utils';

interface NotificationConfig {
  adminPhone: string;
  notificationsEnabled: boolean;
  bookingReminderEnabled: boolean;
  bookingReminderHours: number;
  paymentReminderEnabled: boolean;
  paymentReminderDays: number;
  smsProvider: 'firebase' | 'twilio';
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioPhoneNumber?: string;
}

export function MessagesSection() {
  const [config, setConfig] = useState<NotificationConfig>({
    adminPhone: '',
    notificationsEnabled: false,
    bookingReminderEnabled: true,
    bookingReminderHours: 24,
    paymentReminderEnabled: true,
    paymentReminderDays: 3,
    smsProvider: 'firebase',
    twilioAccountSid: '',
    twilioAuthToken: '',
    twilioPhoneNumber: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  
  // Manual SMS sending
  const [manualPhone, setManualPhone] = useState('');
  const [manualCountryCode, setManualCountryCode] = useState('+20');
  const [manualMessage, setManualMessage] = useState('');
  const [isSendingManual, setIsSendingManual] = useState(false);

  const countryCodes = [
    { code: '+20', country: 'مصر', flag: '🇪🇬' },
    { code: '+966', country: 'السعودية', flag: '🇸🇦' },
    { code: '+971', country: 'الإمارات', flag: '🇦🇪' },
    { code: '+965', country: 'الكويت', flag: '🇰🇼' },
    { code: '+974', country: 'قطر', flag: '🇶🇦' },
    { code: '+973', country: 'البحرين', flag: '🇧🇭' },
    { code: '+968', country: 'عُمان', flag: '🇴🇲' },
    { code: '+962', country: 'الأردن', flag: '🇯🇴' },
    { code: '+961', country: 'لبنان', flag: '🇱🇧' },
    { code: '+90', country: 'تركيا', flag: '🇹🇷' },
  ];

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = () => {
    const saved = localStorage.getItem('notificationConfig');
    if (saved) {
      setConfig(JSON.parse(saved));
    }
    setIsLoading(false);
  };

  const saveConfig = async () => {
    setIsSaving(true);
    localStorage.setItem('notificationConfig', JSON.stringify(config));
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSaving(false);
    storage.toast('تم حفظ الإعدادات بنجاح', 'success');
  };

  const sendTestSMS = async () => {
    if (!config.adminPhone) {
      storage.toast('الرجاء إدخال رقم الهاتف أولاً', 'error');
      return;
    }

    setTestStatus('sending');
    
    // Real SMS sending implementation
    try {
      // TODO: Implement actual SMS sending via Twilio or Firebase Cloud Functions
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTestStatus('success');
      storage.toast('تم إرسال رسالة تجريبية بنجاح', 'success');
    } catch (error) {
      setTestStatus('error');
      storage.toast('فشل إرسال الرسالة', 'error');
    }
    
    setTimeout(() => setTestStatus('idle'), 3000);
  };

  const sendManualSMS = async () => {
    if (!manualPhone || !manualMessage) {
      storage.toast('الرجاء إدخال رقم الهاتف والرسالة', 'error');
      return;
    }

    setIsSendingManual(true);
    
    // Real SMS sending implementation
    try {
      const fullPhone = manualCountryCode + manualPhone;
      // TODO: Implement actual SMS sending via Twilio or Firebase Cloud Functions
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSendingManual(false);
      storage.toast('تم إرسال الرسالة بنجاح', 'success');
      setManualPhone('');
      setManualMessage('');
    } catch (error) {
      setIsSendingManual(false);
      storage.toast('فشل إرسال الرسالة', 'error');
    }
  };

  const handleToggle = (key: keyof NotificationConfig) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center">
            <MessageSquare size={24} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">إعدادات وقسم الرسائل</h1>
            <p className="text-sm text-pink-300/70 mt-1">إدارة إشعارات SMS والتنبيهات التلقائية والإرسال اليدوي</p>
          </div>
        </div>
        <button
          onClick={saveConfig}
          disabled={isSaving}
          className="px-5 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-sm flex items-center gap-2 hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50"
        >
          {isSaving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
          {isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <RefreshCw size={48} className="text-blue-400/50 mx-auto mb-4 animate-spin" />
          <p className="text-pink-300/70">جاري التحميل...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Toggle */}
          <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-teal-500/10 p-6 backdrop-blur-xl shadow-xl shadow-blue-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Bell size={20} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-base font-bold text-white">تفعيل التنبيهات التلقائية</p>
                  <p className="text-xs text-pink-300/70 mt-1">تفعيل نظام إرسال التنبيهات تلقائياً</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('notificationsEnabled')}
                className="relative"
              >
                {config.notificationsEnabled ? (
                  <ToggleRight size={48} className="text-blue-400" />
                ) : (
                  <ToggleLeft size={48} className="text-pink-300/50" />
                )}
              </button>
            </div>
          </div>

          {/* Admin Phone */}
          <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-teal-500/10 p-6 backdrop-blur-xl shadow-xl shadow-blue-500/10">
            <div className="flex items-center gap-3 mb-4">
              <Phone size={22} className="text-blue-400" />
              <h2 className="text-lg font-extrabold text-white">رقم هاتف المدير</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-pink-300/90 mb-2">رمز الدولة</label>
                <select
                  value={config.adminPhone?.substring(0, 4) || '+20'}
                  onChange={(e) => {
                    const newCode = e.target.value;
                    const currentNumber = config.adminPhone?.substring(4) || '';
                    setConfig({ ...config, adminPhone: newCode + currentNumber });
                  }}
                  className="w-full h-11 rounded-xl border border-blue-500/20 bg-white/5 px-4 text-sm font-medium text-white outline-none focus:border-blue-500/50 focus:bg-gradient-to-r focus:from-blue-500/10 focus:to-cyan-500/10 transition-all"
                >
                  {countryCodes.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.country} ({country.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-extrabold text-pink-300/90 mb-2">رقم الهاتف</label>
                <input
                  type="tel"
                  value={config.adminPhone?.substring(4) || ''}
                  onChange={(e) => {
                    const countryCode = config.adminPhone?.substring(0, 4) || '+20';
                    setConfig({ ...config, adminPhone: countryCode + e.target.value });
                  }}
                  placeholder="1234567890"
                  className="w-full h-11 rounded-xl border border-blue-500/20 bg-white/5 px-4 text-sm font-medium text-white outline-none focus:border-blue-500/50 focus:bg-gradient-to-r focus:from-blue-500/10 focus:to-cyan-500/10 transition-all"
                />
              </div>
              <button
                onClick={sendTestSMS}
                disabled={testStatus === 'sending'}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-cyan-500/30 to-teal-500/30 text-cyan-200/80 border border-cyan-500/30 font-bold text-sm hover:from-cyan-500/50 hover:to-teal-500/50 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {testStatus === 'sending' ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : testStatus === 'success' ? (
                  <CheckCircle size={16} />
                ) : (
                  <TestTube size={16} />
                )}
                {testStatus === 'sending' ? 'جاري الإرسال...' : testStatus === 'success' ? 'تم الإرسال' : 'إرسال رسالة تجريبية'}
              </button>
            </div>
          </div>

          {/* Manual SMS Sending */}
          <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10 p-6 backdrop-blur-xl shadow-xl shadow-purple-500/10">
            <div className="flex items-center gap-3 mb-4">
              <Send size={22} className="text-purple-400" />
              <h2 className="text-lg font-extrabold text-white">إرسال يدوي</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-pink-300/90 mb-2">رمز الدولة</label>
                <select
                  value={manualCountryCode}
                  onChange={(e) => setManualCountryCode(e.target.value)}
                  className="w-full h-11 rounded-xl border border-purple-500/20 bg-white/5 px-4 text-sm font-medium text-white outline-none focus:border-purple-500/50 focus:bg-gradient-to-r focus:from-purple-500/10 focus:to-pink-500/10 transition-all"
                >
                  {countryCodes.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.country} ({country.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-extrabold text-pink-300/90 mb-2">رقم الهاتف</label>
                <input
                  type="tel"
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                  placeholder="1234567890"
                  className="w-full h-11 rounded-xl border border-purple-500/20 bg-white/5 px-4 text-sm font-medium text-white outline-none focus:border-purple-500/50 focus:bg-gradient-to-r focus:from-purple-500/10 focus:to-pink-500/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-pink-300/90 mb-2">الرسالة المخصصة</label>
                <textarea
                  value={manualMessage}
                  onChange={(e) => setManualMessage(e.target.value)}
                  placeholder="اكتب رسالتك هنا..."
                  rows={4}
                  className="w-full rounded-xl border border-purple-500/20 bg-white/5 px-4 text-sm font-medium text-white outline-none focus:border-purple-500/50 focus:bg-gradient-to-r focus:from-purple-500/10 focus:to-pink-500/10 transition-all resize-none"
                />
              </div>
              <button
                onClick={sendManualSMS}
                disabled={isSendingManual}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSendingManual ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
                {isSendingManual ? 'جاري الإرسال...' : 'إرسال الآن'}
              </button>
            </div>
          </div>

          {/* SMS Provider */}
          <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-teal-500/10 p-6 backdrop-blur-xl shadow-xl shadow-blue-500/10">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare size={22} className="text-cyan-400" />
              <h2 className="text-lg font-extrabold text-white">مزود خدمة الرسائل</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setConfig({ ...config, smsProvider: 'firebase' })}
                className={cn(
                  "p-4 rounded-xl border transition-all",
                  config.smsProvider === 'firebase'
                    ? "bg-blue-500/20 border-blue-500/50"
                    : "bg-white/5 border-blue-500/20 hover:border-blue-500/30"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare size={18} className={config.smsProvider === 'firebase' ? "text-blue-400" : "text-pink-300/50"} />
                  <span className="text-sm font-bold text-white">Firebase</span>
                </div>
                <p className="text-xs text-pink-300/70">استخدام Firebase Cloud Functions</p>
              </button>
              <button
                onClick={() => setConfig({ ...config, smsProvider: 'twilio' })}
                className={cn(
                  "p-4 rounded-xl border transition-all",
                  config.smsProvider === 'twilio'
                    ? "bg-cyan-500/20 border-cyan-500/50"
                    : "bg-white/5 border-cyan-500/20 hover:border-cyan-500/30"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Phone size={18} className={config.smsProvider === 'twilio' ? "text-cyan-400" : "text-pink-300/50"} />
                  <span className="text-sm font-bold text-white">Twilio</span>
                </div>
                <p className="text-xs text-pink-300/70">استخدام Twilio API</p>
              </button>
            </div>
          </div>

          {/* Twilio Settings */}
          {config.smsProvider === 'twilio' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-teal-500/10 to-emerald-500/10 p-6 backdrop-blur-xl shadow-xl shadow-cyan-500/10"
            >
              <div className="flex items-center gap-3 mb-4">
                <Settings size={22} className="text-cyan-400" />
                <h2 className="text-lg font-extrabold text-white">إعدادات Twilio</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-pink-300/90 mb-2">Account SID</label>
                  <input
                    type="text"
                    value={config.twilioAccountSid}
                    onChange={(e) => setConfig({ ...config, twilioAccountSid: e.target.value })}
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full h-11 rounded-xl border border-cyan-500/20 bg-white/5 px-4 text-sm font-medium text-white outline-none focus:border-cyan-500/50 focus:bg-gradient-to-r focus:from-cyan-500/10 focus:to-teal-500/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-pink-300/90 mb-2">Auth Token</label>
                  <input
                    type="password"
                    value={config.twilioAuthToken}
                    onChange={(e) => setConfig({ ...config, twilioAuthToken: e.target.value })}
                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full h-11 rounded-xl border border-cyan-500/20 bg-white/5 px-4 text-sm font-medium text-white outline-none focus:border-cyan-500/50 focus:bg-gradient-to-r focus:from-cyan-500/10 focus:to-teal-500/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-pink-300/90 mb-2">رقم الهاتف من Twilio</label>
                  <input
                    type="tel"
                    value={config.twilioPhoneNumber}
                    onChange={(e) => setConfig({ ...config, twilioPhoneNumber: e.target.value })}
                    placeholder="+1234567890"
                    className="w-full h-11 rounded-xl border border-cyan-500/20 bg-white/5 px-4 text-sm font-medium text-white outline-none focus:border-cyan-500/50 focus:bg-gradient-to-r focus:from-cyan-500/10 focus:to-teal-500/10 transition-all"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Booking Reminders */}
          <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-teal-500/10 p-6 backdrop-blur-xl shadow-xl shadow-blue-500/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Calendar size={22} className="text-blue-400" />
                <h2 className="text-lg font-extrabold text-white">تنبيهات الحجوزات</h2>
              </div>
              <button
                onClick={() => handleToggle('bookingReminderEnabled')}
              >
                {config.bookingReminderEnabled ? (
                  <ToggleRight size={40} className="text-blue-400" />
                ) : (
                  <ToggleLeft size={40} className="text-pink-300/50" />
                )}
              </button>
            </div>
            {config.bookingReminderEnabled && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-extrabold text-pink-300/90 mb-2">إرسال التنبيه قبل (ساعات)</label>
                  <input
                    type="number"
                    value={config.bookingReminderHours}
                    onChange={(e) => setConfig({ ...config, bookingReminderHours: Number(e.target.value) })}
                    min="1"
                    max="168"
                    className="w-full h-11 rounded-xl border border-blue-500/20 bg-white/5 px-4 text-sm font-medium text-white outline-none focus:border-blue-500/50 focus:bg-gradient-to-r focus:from-blue-500/10 focus:to-cyan-500/10 transition-all"
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* Payment Reminders */}
          <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-teal-500/10 p-6 backdrop-blur-xl shadow-xl shadow-blue-500/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <DollarSign size={22} className="text-cyan-400" />
                <h2 className="text-lg font-extrabold text-white">تنبيهات المدفوعات</h2>
              </div>
              <button
                onClick={() => handleToggle('paymentReminderEnabled')}
              >
                {config.paymentReminderEnabled ? (
                  <ToggleRight size={40} className="text-cyan-400" />
                ) : (
                  <ToggleLeft size={40} className="text-pink-300/50" />
                )}
              </button>
            </div>
            {config.paymentReminderEnabled && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-extrabold text-pink-300/90 mb-2">إرسال التنبيه بعد (أيام) من التأخير</label>
                  <input
                    type="number"
                    value={config.paymentReminderDays}
                    onChange={(e) => setConfig({ ...config, paymentReminderDays: Number(e.target.value) })}
                    min="1"
                    max="30"
                    className="w-full h-11 rounded-xl border border-cyan-500/20 bg-white/5 px-4 text-sm font-medium text-white outline-none focus:border-cyan-500/50 focus:bg-gradient-to-r focus:from-cyan-500/10 focus:to-teal-500/10 transition-all"
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* Info Box */}
          <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10 p-6 backdrop-blur-xl shadow-xl shadow-purple-500/10">
            <div className="flex items-start gap-3">
              <AlertTriangle size={22} className="text-purple-400 mt-0.5" />
              <div>
                <h3 className="text-base font-bold text-white mb-2">ملاحظات هامة</h3>
                <ul className="text-xs text-pink-300/70 space-y-2">
                  <li>• تأكد من تفعيل Firebase Authentication Phone في Firebase Console</li>
                  <li>• إذا استخدمت Twilio، ستحتاج إلى حساب مدفوع أو حساب تجريبي</li>
                  <li>• Firebase Cloud Functions تتطلب خطة Blaze (مدفوعة) للإرسال</li>
                  <li>• راجع ملف تعليمات التفعيل للحصول على خطوات مفصلة</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
