import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Share2, Lock, Eye, EyeOff, Download, Shield, CreditCard, FolderOpen,
  Plus, ArrowLeft, Save, X, Image as ImageIcon, Heart, Star
} from 'lucide-react';
import { Gallery } from '../../types';
import { firestoreData } from '../../services/firestoreData';
import { audioService } from '../../services/audio';
import { cn } from '../../lib/utils';

type EditorSection = 'share' | 'paywall' | 'drive' | 'sections';

export default function GalleryEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<EditorSection>('share');
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (id) {
      firestoreData.getGalleryById(id).then((data) => {
        if (data) {
          setGallery(data);
        }
        setLoading(false);
      });
    }
  }, [id]);

  const handleSave = async () => {
    if (!gallery) return;
    setSaving(true);
    try {
      gallery.updatedAt = new Date().toISOString();
      await firestoreData.saveGallery(gallery);
      audioService.playSuccess();
      alert('✅ تم حفظ التغييرات بنجاح!');
    } catch (error) {
      alert('❌ فشل الحفظ: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const copyGalleryLink = () => {
    const link = `${window.location.origin}/gallery/${gallery?.id}`;
    navigator.clipboard.writeText(link);
    alert('تم نسخ رابط المعرض!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <p className="text-gray-400">جاري التحميل...</p>
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <p className="text-gray-400">المعرض غير موجود</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="bg-[#0d0d15] border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/galleries-admin')}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
            >
              <ArrowLeft size={20} className="text-gray-400" />
            </button>
            <div>
              <h1 className="text-xl font-bold">{gallery.clientName}</h1>
              <p className="text-sm text-gray-400">{new Date(gallery.eventDate).toLocaleDateString('ar-EG')}</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </div>
      </div>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar */}
        <div className="w-64 bg-[#0d0d15] border-l border-white/10 p-4 min-h-[calc(100vh-73px)]">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveSection('share')}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                activeSection === 'share'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              )}
            >
              <Share2 size={20} />
              <span className="font-medium">المشاركة والخصوصية</span>
            </button>
            <button
              onClick={() => setActiveSection('paywall')}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                activeSection === 'paywall'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              )}
            >
              <CreditCard size={20} />
              <span className="font-medium">بوابة الدفع</span>
            </button>
            <button
              onClick={() => setActiveSection('drive')}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                activeSection === 'drive'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              )}
            >
              <FolderOpen size={20} />
              <span className="font-medium">Google Drive</span>
            </button>
            <button
              onClick={() => setActiveSection('sections')}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                activeSection === 'sections'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              )}
            >
              <Plus size={20} />
              <span className="font-medium">أقسام المعرض</span>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeSection === 'share' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold">المشاركة والخصوصية</h2>

              {/* Link Box */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <label className="block text-sm font-bold text-pink-300/90 mb-3">رابط المعرض</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/gallery/${gallery.id}`}
                    className="flex-1 h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-white outline-none"
                  />
                  <button
                    onClick={copyGalleryLink}
                    className="px-6 h-12 rounded-xl bg-purple-500 hover:bg-purple-600 transition-all flex items-center gap-2 font-bold"
                  >
                    <ImageIcon size={18} />
                    نسخ
                  </button>
                </div>
              </div>

              {/* Toggle Switches */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <p className="text-sm font-bold text-white">ظهور المعرض</p>
                    <p className="text-xs text-gray-400">إظهار المعرض للجمهور</p>
                  </div>
                  <button
                    onClick={() => setGallery({ ...gallery, isVisible: !gallery.isVisible })}
                    className={cn(
                      'w-12 h-6 rounded-full transition-all relative',
                      gallery.isVisible ? 'bg-purple-500' : 'bg-gray-600'
                    )}
                  >
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full bg-white transition-all absolute top-0.5',
                        gallery.isVisible ? 'right-0.5' : 'left-0.5'
                      )}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <p className="text-sm font-bold text-white">عرض التاريخ</p>
                    <p className="text-xs text-gray-400">إظهار تاريخ المناسبة</p>
                  </div>
                  <button
                    onClick={() => setGallery({ ...gallery, showDate: !gallery.showDate })}
                    className={cn(
                      'w-12 h-6 rounded-full transition-all relative',
                      gallery.showDate ? 'bg-purple-500' : 'bg-gray-600'
                    )}
                  >
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full bg-white transition-all absolute top-0.5',
                        gallery.showDate ? 'right-0.5' : 'left-0.5'
                      )}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <p className="text-sm font-bold text-white">السماح بالتحميل</p>
                    <p className="text-xs text-gray-400">السماح للعميل بتحميل الصور</p>
                  </div>
                  <button
                    onClick={() => setGallery({ ...gallery, allowDownload: !gallery.allowDownload })}
                    className={cn(
                      'w-12 h-6 rounded-full transition-all relative',
                      gallery.allowDownload ? 'bg-purple-500' : 'bg-gray-600'
                    )}
                  >
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full bg-white transition-all absolute top-0.5',
                        gallery.allowDownload ? 'right-0.5' : 'left-0.5'
                      )}
                    />
                  </button>
                </div>
              </div>

              {/* Passwords */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <Lock size={20} className="text-purple-400" />
                    <div>
                      <p className="text-sm font-bold text-white">حماية بكلمة مرور</p>
                      <p className="text-xs text-gray-400">تفعيل حماية الباسورد</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setGallery({ ...gallery, hasPasswordProtection: !gallery.hasPasswordProtection })}
                    className={cn(
                      'w-12 h-6 rounded-full transition-all relative',
                      gallery.hasPasswordProtection ? 'bg-purple-500' : 'bg-gray-600'
                    )}
                  >
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full bg-white transition-all absolute top-0.5',
                        gallery.hasPasswordProtection ? 'right-0.5' : 'left-0.5'
                      )}
                    />
                  </button>
                </div>

                {gallery.hasPasswordProtection && (
                  <div className="space-y-4">
                    <div className="relative">
                      <label className="block text-xs font-bold text-pink-300/90 mb-2">كلمة مرور الضيف (للمشاهدة فقط)</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={gallery.guestPassword || ''}
                        onChange={(e) => setGallery({ ...gallery, guestPassword: e.target.value })}
                        className="w-full h-11 rounded-xl border border-pink-500/20 bg-white/5 px-4 text-sm font-medium text-white outline-none focus:border-pink-500/50 transition-all pr-12"
                        placeholder="كلمة مرور للضيوف"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                    </div>
                    <div className="relative">
                      <label className="block text-xs font-bold text-pink-300/90 mb-2">كلمة مرور العميل (للتحميل والمفضلة)</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={gallery.clientPassword || ''}
                        onChange={(e) => setGallery({ ...gallery, clientPassword: e.target.value })}
                        className="w-full h-11 rounded-xl border border-pink-500/20 bg-white/5 px-4 text-sm font-medium text-white outline-none focus:border-pink-500/50 transition-all"
                        placeholder="كلمة مرور للعميل"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Section Visibility */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white">ظهور الأقسام</h4>
                <div className="rounded-xl border border-white/10 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-400">القسم</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-400">الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-white/10">
                        <td className="px-4 py-3 text-sm text-white">السيشن</td>
                        <td className="px-4 py-3">
                          <select
                            value={gallery.sections?.session || 'public'}
                            onChange={(e) => setGallery({ 
                              ...gallery, 
                              sections: { ...gallery.sections, session: e.target.value as 'public' | 'hidden' | 'download-only' }
                            })}
                            className="w-full h-8 rounded-lg bg-white/5 border border-white/10 px-3 text-xs text-white outline-none focus:border-purple-500/50"
                          >
                            <option value="public">عام</option>
                            <option value="hidden">مخفي</option>
                            <option value="download-only">تحميل فقط</option>
                          </select>
                        </td>
                      </tr>
                      <tr className="border-t border-white/10">
                        <td className="px-4 py-3 text-sm text-white">القاعة</td>
                        <td className="px-4 py-3">
                          <select
                            value={gallery.sections?.hall || 'public'}
                            onChange={(e) => setGallery({ 
                              ...gallery, 
                              sections: { ...gallery.sections, hall: e.target.value as 'public' | 'hidden' | 'download-only' }
                            })}
                            className="w-full h-8 rounded-lg bg-white/5 border border-white/10 px-3 text-xs text-white outline-none focus:border-purple-500/50"
                          >
                            <option value="public">عام</option>
                            <option value="hidden">مخفي</option>
                            <option value="download-only">تحميل فقط</option>
                          </select>
                        </td>
                      </tr>
                      <tr className="border-t border-white/10">
                        <td className="px-4 py-3 text-sm text-white">الأهل</td>
                        <td className="px-4 py-3">
                          <select
                            value={gallery.sections?.family || 'public'}
                            onChange={(e) => setGallery({ 
                              ...gallery, 
                              sections: { ...gallery.sections, family: e.target.value as 'public' | 'hidden' | 'download-only' }
                            })}
                            className="w-full h-8 rounded-lg bg-white/5 border border-white/10 px-3 text-xs text-white outline-none focus:border-purple-500/50"
                          >
                            <option value="public">عام</option>
                            <option value="hidden">مخفي</option>
                            <option value="download-only">تحميل فقط</option>
                          </select>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'paywall' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold">بوابة الدفع والأسعار</h2>

              {/* Financial Info */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-pink-300/90 mb-2">المبلغ الإجمالي</label>
                  <input
                    type="number"
                    value={gallery.totalAmount}
                    onChange={(e) => {
                      const total = parseFloat(e.target.value) || 0;
                      setGallery({
                        ...gallery,
                        totalAmount: total,
                        remainingAmount: total - gallery.paidAmount
                      });
                    }}
                    className="w-full h-11 rounded-xl border border-pink-500/20 bg-white/5 px-4 text-sm font-medium text-white outline-none focus:border-pink-500/50 transition-all"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-pink-300/90 mb-2">المدفوع</label>
                  <input
                    type="number"
                    value={gallery.paidAmount}
                    onChange={(e) => {
                      const paid = parseFloat(e.target.value) || 0;
                      setGallery({
                        ...gallery,
                        paidAmount: paid,
                        remainingAmount: gallery.totalAmount - paid
                      });
                    }}
                    className="w-full h-11 rounded-xl border border-pink-500/20 bg-white/5 px-4 text-sm font-medium text-white outline-none focus:border-pink-500/50 transition-all"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-pink-300/90 mb-2">المتبقي</label>
                  <input
                    type="number"
                    value={gallery.remainingAmount}
                    readOnly
                    className="w-full h-11 rounded-xl border border-pink-500/20 bg-white/5 px-4 text-sm font-medium text-white outline-none transition-all"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Paywall Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <CreditCard size={20} className="text-green-400" />
                  <div>
                    <p className="text-sm font-bold text-white">قفل المعرض</p>
                    <p className="text-xs text-gray-400">قفل المعرض حتى يتم الدفع الكامل</p>
                  </div>
                </div>
                <button
                  onClick={() => setGallery({ ...gallery, hasOutstandingBalance: !gallery.hasOutstandingBalance })}
                  className={cn(
                    'w-12 h-6 rounded-full transition-all relative',
                    gallery.hasOutstandingBalance ? 'bg-green-500' : 'bg-gray-600'
                  )}
                >
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full bg-white transition-all absolute top-0.5',
                      gallery.hasOutstandingBalance ? 'right-0.5' : 'left-0.5'
                    )}
                  />
                </button>
              </div>

              {gallery.hasOutstandingBalance && (
                <div>
                  <label className="block text-xs font-bold text-pink-300/90 mb-2">رقم فودافون كاش</label>
                  <input
                    type="text"
                    value={gallery.vodafoneCashNumber || ''}
                    onChange={(e) => setGallery({ ...gallery, vodafoneCashNumber: e.target.value })}
                    className="w-full h-11 rounded-xl border border-pink-500/20 bg-white/5 px-4 text-sm font-medium text-white outline-none focus:border-pink-500/50 transition-all"
                    placeholder="01xxxxxxxxx"
                  />
                </div>
              )}

              {/* Download Quality */}
              <div>
                <label className="block text-xs font-bold text-pink-300/90 mb-2">جودة التحميل</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setGallery({ ...gallery, downloadQuality: 'original' })}
                    className={cn(
                      'flex-1 h-11 rounded-xl border transition-all text-sm font-bold',
                      gallery.downloadQuality === 'original'
                        ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                        : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                    )}
                  >
                    <Download size={16} className="inline mr-2" />
                    الأصلية
                  </button>
                  <button
                    onClick={() => setGallery({ ...gallery, downloadQuality: 'web' })}
                    className={cn(
                      'flex-1 h-11 rounded-xl border transition-all text-sm font-bold',
                      gallery.downloadQuality === 'web'
                        ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                        : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                    )}
                  >
                    <Download size={16} className="inline mr-2" />
                    جودة الويب
                  </button>
                </div>
              </div>

              {/* Anti-Screenshot */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <Shield size={20} className="text-pink-400" />
                  <div>
                    <p className="text-sm font-bold text-white">حماية من السكرين شوت</p>
                    <p className="text-xs text-gray-400">يمنع حفظ الصور وأخذ لقطات شاشة</p>
                  </div>
                </div>
                <button
                  onClick={() => setGallery({ ...gallery, enableAntiScreenshot: !gallery.enableAntiScreenshot })}
                  className={cn(
                    'w-12 h-6 rounded-full transition-all relative',
                    gallery.enableAntiScreenshot ? 'bg-pink-500' : 'bg-gray-600'
                  )}
                >
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full bg-white transition-all absolute top-0.5',
                      gallery.enableAntiScreenshot ? 'right-0.5' : 'left-0.5'
                    )}
                  />
                </button>
              </div>
            </motion.div>
          )}

          {activeSection === 'drive' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold">Google Drive Live Sync</h2>

              {/* Drive URL */}
              <div>
                <label className="block text-xs font-bold text-pink-300/90 mb-2">رابط مجلد Google Drive</label>
                <input
                  type="url"
                  value={gallery.googleDriveUrl || ''}
                  onChange={(e) => setGallery({ ...gallery, googleDriveUrl: e.target.value })}
                  className="w-full h-11 rounded-xl border border-pink-500/20 bg-white/5 px-4 text-sm font-medium text-white outline-none focus:border-pink-500/50 transition-all"
                  placeholder="https://drive.google.com/drive/folders/..."
                />
                <p className="text-xs text-gray-500 mt-1">انسخ رابط المجلد من Google Drive هنا</p>
              </div>

              {/* Photo Grid */}
              <div className="grid grid-cols-4 gap-4">
                {gallery.photos && gallery.photos.length > 0 ? (
                  gallery.photos.map((photo, index) => (
                    <div key={index} className="aspect-square rounded-xl bg-white/5 overflow-hidden">
                      <img
                        src={photo.url}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-span-4 text-center py-12 bg-white/5 rounded-xl">
                    <FolderOpen size={48} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400">لا توجد صور بعد</p>
                    <p className="text-sm text-gray-500 mt-2">أضف رابط Google Drive لبدء المزامنة</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeSection === 'sections' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold">أقسام وتصنيفات المعرض</h2>

              {/* Add Section Button */}
              <button className="w-full h-12 rounded-xl border-2 border-dashed border-purple-500/50 text-purple-300 font-bold hover:bg-purple-500/10 transition-all flex items-center justify-center gap-2">
                <Plus size={20} />
                إضافة قسم جديد
              </button>

              {/* Existing Sections */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-white">السيشن</h3>
                    <button className="text-xs text-purple-400 hover:text-purple-300">تعديل</button>
                  </div>
                  <p className="text-sm text-gray-400">صور جلسة التصوير الفنية</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-white">القاعة</h3>
                    <button className="text-xs text-purple-400 hover:text-purple-300">تعديل</button>
                  </div>
                  <p className="text-sm text-gray-400">صور قاعة الزفاف والاحتفال</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-white">كتب الكتاب</h3>
                    <button className="text-xs text-purple-400 hover:text-purple-300">تعديل</button>
                  </div>
                  <p className="text-sm text-gray-400">صور حفل كتب الكتاب</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
