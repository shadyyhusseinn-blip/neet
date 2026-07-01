import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Camera, Settings, Eye, EyeOff, ArrowUp, ArrowDown, Save, Palette, Layout, Search as SearchIcon } from 'lucide-react';
import { Gallery } from '../../types';
import { firestoreData } from '../../services/firestoreData';
import { audioService } from '../../services/audio';
import { cn } from '../../lib/utils';

interface PageSettings {
  title: string;
  subtitle: string;
  enableSearch: boolean;
  showPaidStatus: boolean;
  gridColumns: number;
  backgroundColor: string;
}

export default function PublicGalleriesAdmin() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'galleries' | 'settings'>('galleries');
  
  const [pageSettings, setPageSettings] = useState<PageSettings>({
    title: 'SHADY HUSSEIN PHOTOGRAPHY',
    subtitle: 'معرض الصور الخاص بعملائنا',
    enableSearch: true,
    showPaidStatus: true,
    gridColumns: 5,
    backgroundColor: '#0a0a0f'
  });

  useEffect(() => {
    const unsubscribe = firestoreData.subscribeToGalleries((updatedGalleries) => {
      setGalleries(updatedGalleries.filter(g => g.photos && g.photos.length > 0));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleToggleVisibility = async (galleryId: string) => {
    const gallery = galleries.find(g => g.id === galleryId);
    if (gallery) {
      const updated = { ...gallery, isVisible: !gallery.isVisible };
      await firestoreData.saveGallery(updated);
      audioService.playSuccess();
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newGalleries = [...galleries];
    [newGalleries[index], newGalleries[index - 1]] = [newGalleries[index - 1], newGalleries[index]];
    setGalleries(newGalleries);
    // Save order to Firestore
    await saveGalleryOrder(newGalleries);
  };

  const handleMoveDown = async (index: number) => {
    if (index === galleries.length - 1) return;
    const newGalleries = [...galleries];
    [newGalleries[index], newGalleries[index + 1]] = [newGalleries[index + 1], newGalleries[index]];
    setGalleries(newGalleries);
    await saveGalleryOrder(newGalleries);
  };

  const saveGalleryOrder = async (orderedGalleries: Gallery[]) => {
    for (let i = 0; i < orderedGalleries.length; i++) {
      const gallery = orderedGalleries[i];
      gallery.order = i;
      await firestoreData.saveGallery(gallery);
    }
    audioService.playSuccess();
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      localStorage.setItem('publicGalleriesSettings', JSON.stringify(pageSettings));
      audioService.playSuccess();
      alert('✅ تم حفظ الإعدادات بنجاح!');
    } catch (error) {
      alert('❌ فشل الحفظ: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('publicGalleriesSettings');
    if (saved) {
      try {
        setPageSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
            <Camera size={24} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">إدارة صفحة المعارض العامة</h1>
            <p className="text-sm text-gray-400">تحكم كامل في واجهة المعارض الخارجية</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
        <button
          onClick={() => setActiveTab('galleries')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all',
            activeTab === 'galleries'
              ? 'bg-purple-500/20 text-purple-300'
              : 'text-gray-400 hover:bg-white/5'
          )}
        >
          <Layout size={18} />
          <span className="font-medium">المعارض</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all',
            activeTab === 'settings'
              ? 'bg-purple-500/20 text-purple-300'
              : 'text-gray-400 hover:bg-white/5'
          )}
        >
          <Settings size={18} />
          <span className="font-medium">إعدادات الصفحة</span>
        </button>
      </div>

      {/* Galleries Tab */}
      {activeTab === 'galleries' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-400">جاري التحميل...</p>
            </div>
          ) : galleries.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-xl">
              <Camera size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">لا توجد معارض حالياً</p>
            </div>
          ) : (
            <div className="space-y-3">
              {galleries.map((gallery, index) => (
                <div
                  key={gallery.id}
                  className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:border-purple-500/30 transition-all"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-purple-900/50 to-pink-900/50">
                    {gallery.photos && gallery.photos.length > 0 ? (
                      <img
                        src={gallery.photos[0].url}
                        alt={gallery.clientName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Camera size={24} className="text-white/30" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{gallery.clientName}</h3>
                    <p className="text-sm text-gray-400">
                      {gallery.photos?.length || 0} صور • {gallery.isPaid ? 'مدفوع' : 'غير مدفوع'}
                    </p>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      title="تحريك للأعلى"
                    >
                      <ArrowUp size={18} className="text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === galleries.length - 1}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      title="تحريك للأسفل"
                    >
                      <ArrowDown size={18} className="text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleToggleVisibility(gallery.id)}
                      className={cn(
                        'p-2 rounded-lg transition-all',
                        gallery.isVisible !== false
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      )}
                      title={gallery.isVisible !== false ? 'إخفاء' : 'إظهار'}
                    >
                      {gallery.isVisible !== false ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Title & Subtitle */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-pink-300/90 mb-2">عنوان الصفحة</label>
              <input
                type="text"
                value={pageSettings.title}
                onChange={(e) => setPageSettings({ ...pageSettings, title: e.target.value })}
                className="w-full h-11 rounded-xl border border-pink-500/20 bg-white/5 px-4 text-sm font-medium text-white outline-none focus:border-pink-500/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-pink-300/90 mb-2">وصف الصفحة</label>
              <input
                type="text"
                value={pageSettings.subtitle}
                onChange={(e) => setPageSettings({ ...pageSettings, subtitle: e.target.value })}
                className="w-full h-11 rounded-xl border border-pink-500/20 bg-white/5 px-4 text-sm font-medium text-white outline-none focus:border-pink-500/50 transition-all"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <SearchIcon size={20} className="text-pink-400" />
                <div>
                  <p className="text-sm font-bold text-white">تفعيل البحث</p>
                  <p className="text-xs text-gray-400">إظهار شريط البحث للمعارض</p>
                </div>
              </div>
              <button
                onClick={() => setPageSettings({ ...pageSettings, enableSearch: !pageSettings.enableSearch })}
                className={cn(
                  'w-12 h-6 rounded-full transition-all relative',
                  pageSettings.enableSearch ? 'bg-pink-500' : 'bg-gray-600'
                )}
              >
                <div
                  className={cn(
                    'w-5 h-5 rounded-full bg-white transition-all absolute top-0.5',
                    pageSettings.enableSearch ? 'right-0.5' : 'left-0.5'
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <Eye size={20} className="text-pink-400" />
                <div>
                  <p className="text-sm font-bold text-white">حالة الدفع</p>
                  <p className="text-xs text-gray-400">إظهار مؤشر حالة الدفع</p>
                </div>
              </div>
              <button
                onClick={() => setPageSettings({ ...pageSettings, showPaidStatus: !pageSettings.showPaidStatus })}
                className={cn(
                  'w-12 h-6 rounded-full transition-all relative',
                  pageSettings.showPaidStatus ? 'bg-pink-500' : 'bg-gray-600'
                )}
              >
                <div
                  className={cn(
                    'w-5 h-5 rounded-full bg-white transition-all absolute top-0.5',
                    pageSettings.showPaidStatus ? 'right-0.5' : 'left-0.5'
                  )}
                />
              </button>
            </div>
          </div>

          {/* Grid Columns */}
          <div>
            <label className="block text-xs font-bold text-pink-300/90 mb-2">عدد الأعمدة في الشبكة</label>
            <select
              value={pageSettings.gridColumns}
              onChange={(e) => setPageSettings({ ...pageSettings, gridColumns: parseInt(e.target.value) })}
              className="w-full h-11 rounded-xl border border-pink-500/20 bg-white/5 px-4 text-sm font-medium text-white outline-none focus:border-pink-500/50 transition-all"
            >
              <option value={2}>2 أعمدة</option>
              <option value={3}>3 أعمدة</option>
              <option value={4}>4 أعمدة</option>
              <option value={5}>5 أعمدة</option>
            </select>
          </div>

          {/* Background Color */}
          <div>
            <label className="block text-xs font-bold text-pink-300/90 mb-2">لون الخلفية</label>
            <div className="flex gap-2">
              {['#0a0a0f', '#1a1a2e', '#16213e', '#0f0f23'].map((color) => (
                <button
                  key={color}
                  onClick={() => setPageSettings({ ...pageSettings, backgroundColor: color })}
                  className={cn(
                    'w-12 h-12 rounded-xl border-2 transition-all',
                    pageSettings.backgroundColor === color ? 'border-pink-500' : 'border-white/10'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save size={20} />
            {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </button>
        </motion.div>
      )}
    </div>
  );
}
