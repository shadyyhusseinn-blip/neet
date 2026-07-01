import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, Phone, MessageSquare, Check, AlertCircle, Sparkles, Calendar, Image, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { audioService } from '../../services/audio';
import { firebaseService } from '../../services/firebase';

const TEMPLATES = [
  {
    id: 'welcome',
    label: 'نموذج ترحيب وتأكيد حجز',
    icon: Sparkles,
    message: 'أهلاً بك، تم تأكيد موعد جلسة التصوير الخاصة بك بنجاح من استوديو شادي. يسعدنا تشريفك لنا!'
  },
  {
    id: 'delivery',
    label: 'نموذج تسليم ألبوم الصور',
    icon: Image,
    message: 'أهلاً بك، ألبوم الصور الخاص بجلسة التصوير الخاصة بك جاهز الآن بجودة كاملة! يمكنك تصفحه وتحميله عبر الرابط التالي: '
  },
  {
    id: 'reminder',
    label: 'نموذج تذكير بالموعد',
    icon: Clock,
    message: 'تذكير: يسعدنا لقاؤك غداً في جلسة التصوير الخاصة بك حسب الموعد المحدد. يرجى الحضور قبل الموعد بـ 10 دقائق.'
  }
];

export default function SendWhatsApp() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleTemplateSelect = (templateMessage: string) => {
    setMessage(templateMessage);
    audioService.playClick();
  };

  const handleSend = async () => {
    // Validation
    if (!phoneNumber.trim()) {
      setStatus('error');
      setStatusMessage('يرجى إدخال رقم الهاتف');
      return;
    }

    if (!message.trim()) {
      setStatus('error');
      setStatusMessage('يرجى كتابة الرسالة');
      return;
    }

    // Format phone number (remove + and spaces)
    const formattedPhone = phoneNumber.replace(/[\s+]/g, '');

    setSending(true);
    setStatus('idle');
    setStatusMessage('');

    try {
      // Get Zapier webhook URL
      const settings = await firebaseService.getDocument('app_settings', 'config');
      const webhookUrl = settings?.zapierWebhookUrl || 'https://hooks.zapier.com/hooks/catch/28043609/42mmsti/';

      // Prepare payload for manual message
      const payload = {
        timestamp: new Date().toISOString(),
        source: 'shady-hussein-website',
        type: 'manual_whatsapp_message',
        data: {
          recipient_phone: formattedPhone,
          message: message,
          raw: {
            phone: formattedPhone,
            message: message
          }
        }
      };

      // Send to Zapier
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        mode: 'cors' // Explicitly set CORS mode
      });

      if (response.ok) {
        setStatus('success');
        setStatusMessage('تم إرسال الرسالة بنجاح!');
        audioService.playSuccess();
        
        // Clear form
        setPhoneNumber('');
        setMessage('');
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Suppress CORS errors
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        setStatus('error');
        setStatusMessage('فشل إرسال الرسالة بسبب قيود CORS. يرجى استخدام خادم وسيط.');
      } else {
        setStatus('error');
        setStatusMessage('فشل إرسال الرسالة. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="view-page" dir="rtl">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Header */}
        <header className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-green-500/10 flex items-center justify-center">
              <MessageSquare size={28} md:size={32} className="text-green-500" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-text-main">إرسال واتساب يدوياً</h1>
              <p className="text-text-muted text-xs md:text-sm">إرسال رسائل واتساب مخصصة للعملاء</p>
            </div>
          </div>
        </header>

        {/* Status Message */}
        {status !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mb-4 md:mb-6 p-4 rounded-xl flex items-center gap-3",
              status === 'success' ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-rose-500/10 border border-rose-500/20"
            )}
          >
            {status === 'success' ? (
              <Check size={20} className="text-emerald-500" />
            ) : (
              <AlertCircle size={20} className="text-rose-500" />
            )}
            <span className={cn(
              "font-medium text-sm md:text-base",
              status === 'success' ? "text-emerald-500" : "text-rose-500"
            )}>
              {statusMessage}
            </span>
          </motion.div>
        )}

        {/* Form */}
        <div className="bg-surface border border-main rounded-2xl p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Phone Number */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-muted flex items-center gap-2">
              <Phone size={16} />
              رقم الهاتف
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="201xxxxxxxxx"
              className="w-full p-3 md:p-4 bg-white/[0.04] border border-main rounded-xl text-text-main outline-none focus:border-green-500 transition-all text-base md:text-lg"
              dir="ltr"
            />
            <p className="text-xs text-text-muted">
              أدخل رقم الهاتف بصيغة 201xxxxxxxxx (بدون + أو مسافات)
            </p>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-muted flex items-center gap-2">
              <MessageSquare size={16} />
              الرسالة
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتب رسالتك هنا..."
              rows={6}
              className="w-full p-3 md:p-4 bg-white/[0.04] border border-main rounded-xl text-text-main outline-none focus:border-green-500 transition-all resize-none text-base"
            />
          </div>

          {/* Quick Templates */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-text-muted flex items-center gap-2">
              <Sparkles size={16} />
              نماذج رسائل جاهزة
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template.message)}
                  className="p-3 md:p-4 bg-white/[0.02] border border-main rounded-xl hover:bg-white/[0.04] hover:border-green-500/50 transition-all text-right group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <template.icon size={16} className="text-green-500 group-hover:scale-110 transition-transform" />
                    <span className="text-xs md:text-sm font-medium text-text-main">{template.label}</span>
                  </div>
                  <p className="text-xs text-text-muted line-clamp-2">{template.message}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={sending}
            className="w-full py-3 md:py-4 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-base md:text-lg"
          >
            {sending ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                جاري الإرسال...
              </>
            ) : (
              <>
                <Send size={20} />
                إرسال عبر الواتساب
              </>
            )}
          </button>
        </div>

        {/* Info */}
        <div className="mt-4 md:mt-6 p-3 md:p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
          <p className="text-xs md:text-sm text-blue-500">
            💡 الرسالة ستُرسل عبر Zapier إلى WhatsApp Business API. تأكد من أن Zapier Zap مفعل ومُعد بشكل صحيح.
          </p>
        </div>
      </div>
    </div>
  );
}
