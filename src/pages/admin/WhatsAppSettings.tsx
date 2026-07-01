import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MessageCircle, Save, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { firebaseService } from '../../services/firebase';
import { audioService } from '../../services/audio';
import { cn } from '../../lib/utils';

interface WhatsAppSettings {
  adminAlertsEnabled: boolean;
  customerAlertsEnabled: boolean;
  adminMessageTemplate: string;
  customerMessageTemplate: string;
}

export default function WhatsAppSettings() {
  const [settings, setSettings] = useState<WhatsAppSettings>({
    adminAlertsEnabled: true,
    customerAlertsEnabled: true,
    adminMessageTemplate: `حجز جديد! 📸

العميل: {clientName}
الهاتف: {phone}
التاريخ: {eventDate}
الباقة: {packageName}
نوع المناسبة: {eventType}
الموقع: {location}
ملاحظات: {notes}`,
    customerMessageTemplate: `مرحباً {customerName}! 🎉

معرضك جاهز الآن! 📸

رابط المعرض: {galleryLink}
كلمة المرور: {galleryPassword}

نتمنى لك رؤية ممتعة! ✨`
  });

  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await firebaseService.getDocument('whatsapp_settings', 'config');
      if (savedSettings) {
        setSettings(savedSettings);
      }
    } catch (error) {
      console.error('Error loading WhatsApp settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('idle');

    try {
      await firebaseService.setDocument('whatsapp_settings', 'config', settings);
      audioService.playSuccess();
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving WhatsApp settings:', error);
      setSaveStatus('error');
      audioService.playError();
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    const confirmed = confirm('هل أنت متأكد من إعادة تعيين الإعدادات إلى الافتراضية؟');
    if (!confirmed) return;

    setSettings({
      adminAlertsEnabled: true,
      customerAlertsEnabled: true,
      adminMessageTemplate: `حجز جديد! 📸

العميل: {clientName}
الهاتف: {phone}
التاريخ: {eventDate}
الباقة: {packageName}
نوع المناسبة: {eventType}
الموقع: {location}
ملاحظات: {notes}`,
      customerMessageTemplate: `مرحباً {customerName}! 🎉

معرضك جاهز الآن! 📸

رابط المعرض: {galleryLink}
كلمة المرور: {galleryPassword}

نتمنى لك رؤية ممتعة! ✨`
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <p className="text-gray-400">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <MessageCircle size={32} className="text-green-500" />
            <h1 className="text-3xl font-bold">إعدادات واتساب</h1>
          </div>
          <p className="text-gray-400">تخصيص إشعارات واتساب للإدارة والعملاء</p>
        </div>

        {/* Settings Card */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-8">
          {/* Toggle Switches */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">تفعيل الإشعارات</h2>
            
            {/* Admin Alerts Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <div>
                <p className="text-sm font-bold text-white">إشعارات الإدارة</p>
                <p className="text-xs text-gray-400 mt-1">إرسال إشعار للإدارة عند حجز جديد</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, adminAlertsEnabled: !settings.adminAlertsEnabled })}
                className={cn(
                  'w-14 h-7 rounded-full transition-all relative',
                  settings.adminAlertsEnabled ? 'bg-green-500' : 'bg-gray-600'
                )}
              >
                <div
                  className={cn(
                    'w-5 h-5 rounded-full bg-white transition-all absolute top-1',
                    settings.adminAlertsEnabled ? 'right-1' : 'left-1'
                  )}
                />
              </button>
            </div>

            {/* Customer Alerts Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <div>
                <p className="text-sm font-bold text-white">إشعارات العملاء</p>
                <p className="text-xs text-gray-400 mt-1">إرسال إشعار للعميل عند اكتمال المعرض</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, customerAlertsEnabled: !settings.customerAlertsEnabled })}
                className={cn(
                  'w-14 h-7 rounded-full transition-all relative',
                  settings.customerAlertsEnabled ? 'bg-green-500' : 'bg-gray-600'
                )}
              >
                <div
                  className={cn(
                    'w-5 h-5 rounded-full bg-white transition-all absolute top-1',
                    settings.customerAlertsEnabled ? 'right-1' : 'left-1'
                  )}
                />
              </button>
            </div>
          </div>

          {/* Admin Message Template */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">قالب رسالة الإدارة</h2>
              <span className="text-xs text-gray-400 bg-white/5 px-3 py-1 rounded-full">
                المتغيرات المتاحة: {"{clientName}"}, {"{phone}"}, {"{eventDate}"}, {"{packageName}"}, {"{eventType}"}, {"{location}"}, {"{notes}"}
              </span>
            </div>
            <textarea
              value={settings.adminMessageTemplate}
              onChange={(e) => setSettings({ ...settings, adminMessageTemplate: e.target.value })}
              className="w-full h-48 rounded-xl bg-white/5 border border-white/10 p-4 text-white outline-none focus:border-green-500 transition-all resize-none font-mono text-sm"
              placeholder="اكتب قالب رسالة الإدارة هنا..."
              dir="rtl"
            />
          </div>

          {/* Customer Message Template */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">قالب رسالة العميل</h2>
              <span className="text-xs text-gray-400 bg-white/5 px-3 py-1 rounded-full">
                المتغيرات المتاحة: {"{customerName}"}, {"{galleryLink}"}, {"{galleryPassword}"}
              </span>
            </div>
            <textarea
              value={settings.customerMessageTemplate}
              onChange={(e) => setSettings({ ...settings, customerMessageTemplate: e.target.value })}
              className="w-full h-48 rounded-xl bg-white/5 border border-white/10 p-4 text-white outline-none focus:border-green-500 transition-all resize-none font-mono text-sm"
              placeholder="اكتب قالب رسالة العميل هنا..."
              dir="rtl"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-700 text-white font-semibold hover:bg-gray-600 transition-all"
            >
              <RefreshCw size={18} />
              إعادة تعيين
            </button>

            <div className="flex items-center gap-3">
              {saveStatus === 'success' && (
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle size={18} />
                  <span>تم الحفظ بنجاح</span>
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="flex items-center gap-2 text-red-400">
                  <AlertTriangle size={18} />
                  <span>فشل الحفظ</span>
                </div>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50"
              >
                <Save size={18} />
                {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
              </button>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20">
          <h3 className="text-lg font-bold text-blue-400 mb-3 flex items-center gap-2">
            <MessageCircle size={20} />
            دليل استخدام المتغيرات
          </h3>
          <div className="space-y-2 text-sm text-gray-300">
            <p>• استخدم المتغيرات بين قوسين معقوفين: {"{variable_name}"}</p>
            <p>• سيتم استبدال المتغيرات تلقائياً بالبيانات الفعلية عند إرسال الإشعار</p>
            <p>• يمكنك استخدام أي متغير من القائمة المتاحة في كل قالب</p>
          </div>
        </div>
      </div>
    </div>
  );
}
