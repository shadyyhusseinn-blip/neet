import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Images, ShoppingBag, Archive, Star, Plus, Search, Filter, MoreVertical, Edit, Trash2, Calendar, User, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import GalleryUpload from '../../components/admin/GalleryUpload';
import { Gallery } from '../../types';
import { toast } from 'sonner';
import { uploadImage, fileToBase64 } from '../../services/imagekit';
import { doc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

type TabType = 'galleries' | 'store' | 'bookings' | 'reviews';

export default function UnifiedGalleryManagement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('galleries');

  const tabs = [
    { id: 'galleries' as TabType, label: 'المعارض', icon: Images, count: 14 },
    { id: 'store' as TabType, label: 'المتجر', icon: ShoppingBag, count: 8 },
    { id: 'bookings' as TabType, label: 'الحجوزات', icon: Archive, count: 23, beta: true },
    { id: 'reviews' as TabType, label: 'المراجعات', icon: Star, count: 45 },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0d0d15]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">إدارة المعارض</h1>
              <p className="text-sm text-gray-400">إدارة كافة جوانب العمل من مكان واحد</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-all"
            >
              العودة للوحة التحكم
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm whitespace-nowrap',
                  activeTab === tab.id
                    ? 'bg-amber-700 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                )}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs">
                  {tab.count}
                </span>
                {tab.beta && (
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-xs font-bold">
                    BETA
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'galleries' && (
          <GalleriesContent navigate={navigate} />
        )}
        {activeTab === 'store' && (
          <StoreContent navigate={navigate} />
        )}
        {activeTab === 'bookings' && (
          <BookingsContent navigate={navigate} />
        )}
        {activeTab === 'reviews' && (
          <ReviewsContent navigate={navigate} />
        )}
      </div>
    </div>
  );
}

function GalleriesContent({ navigate }: { navigate: any }) {
  const [showUpload, setShowUpload] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedGalleryId, setSelectedGalleryId] = useState('');
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [newGallery, setNewGallery] = useState({
    title: '',
    clientName: '',
    eventDate: '',
    hasPasswordProtection: false,
    password: ''
  });

  // Fetch galleries from Firebase
  useEffect(() => {
    const loadGalleries = async () => {
      try {
        const db = getFirestore();
        const galleriesCollection = collection(db, 'galleries');
        const snapshot = await getDocs(galleriesCollection);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Gallery));
        setGalleries(data);
        setLoading(false);
      } catch (error) {
        console.error('Error loading galleries:', error);
        setLoading(false);
      }
    };

    loadGalleries();
  }, []);

  const handleCreateGallery = async () => {
    if (!newGallery.title || !newGallery.clientName) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (newGallery.hasPasswordProtection && !newGallery.password) {
      toast.error('يرجى إدخال كلمة المرور');
      return;
    }

    try {
      const db = getFirestore();
      const galleryId = doc(collection(db, 'galleries')).id;
      
      // Simple hash for password (in production, use proper bcrypt on backend)
      const passwordHash = newGallery.password ? btoa(newGallery.password) : '';
      
      const galleryData: Gallery = {
        id: galleryId,
        title: newGallery.title,
        clientName: newGallery.clientName,
        eventDate: newGallery.eventDate,
        password: newGallery.password, // Store plain text for admin display
        passwordHash: passwordHash, // Store hash for verification
        hasPasswordProtection: newGallery.hasPasswordProtection,
        totalFilesCount: 0,
        totalStorageSize: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPublished: false,
        showOnHomepage: false,
        showDateOnCover: true,
        allowDownload: true,
        photos: [],
        imagekitFileIds: [],
        imagekitPaths: [],
      };

      await setDoc(doc(db, 'galleries', galleryId), galleryData);
      
      toast.success('تم إنشاء المعرض بنجاح');
      setShowCreateForm(false);
      setNewGallery({ title: '', clientName: '', eventDate: '', hasPasswordProtection: false, password: '' });
      
      // Reload galleries
      const galleriesCollection = collection(db, 'galleries');
      const snapshot = await getDocs(galleriesCollection);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Gallery));
      setGalleries(data);
    } catch (error) {
      console.error('Error creating gallery:', error);
      toast.error('فشل إنشاء المعرض');
    }
  };

  const handleDeleteGallery = async (galleryId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المعرض؟')) return;

    try {
      const db = getFirestore();
      await deleteDoc(doc(db, 'galleries', galleryId));
      toast.success('تم حذف المعرض بنجاح');
      
      // Reload galleries
      const galleriesCollection = collection(db, 'galleries');
      const snapshot = await getDocs(galleriesCollection);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Gallery));
      setGalleries(data);
    } catch (error) {
      console.error('Error deleting gallery:', error);
      toast.error('فشل حذف المعرض');
    }
  };

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button 
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-sm font-semibold transition-all"
          >
            <Plus size={18} />
            معرض جديد
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-all">
            <Filter size={18} />
            تصفية
          </button>
        </div>
        <div className="relative">
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="بحث في المعارض..."
            className="w-64 h-10 pl-10 pr-4 rounded-lg bg-white/5 border border-white/10 text-sm outline-none focus:border-amber-700/50 transition-all"
          />
        </div>
      </div>

      {/* Create Gallery Form */}
      {showCreateForm && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">إنشاء معرض جديد</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">اسم المعرض</label>
              <input
                type="text"
                value={newGallery.title}
                onChange={(e) => setNewGallery({ ...newGallery, title: e.target.value })}
                className="w-full h-10 rounded-lg bg-white/5 border border-white/10 px-4 text-white outline-none focus:border-amber-700/50 transition-all"
                placeholder="مثال: زفاف أحمد و سارة"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">اسم العميل</label>
              <input
                type="text"
                value={newGallery.clientName}
                onChange={(e) => setNewGallery({ ...newGallery, clientName: e.target.value })}
                className="w-full h-10 rounded-lg bg-white/5 border border-white/10 px-4 text-white outline-none focus:border-amber-700/50 transition-all"
                placeholder="مثال: أحمد محمد"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">تاريخ المناسبة</label>
              <input
                type="date"
                value={newGallery.eventDate}
                onChange={(e) => setNewGallery({ ...newGallery, eventDate: e.target.value })}
                className="w-full h-10 rounded-lg bg-white/5 border border-white/10 px-4 text-white outline-none focus:border-amber-700/50 transition-all"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newGallery.hasPasswordProtection}
                  onChange={(e) => setNewGallery({ ...newGallery, hasPasswordProtection: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-gray-300">حماية بكلمة مرور</span>
              </label>
              {newGallery.hasPasswordProtection && (
                <input
                  type="text"
                  value={newGallery.password}
                  onChange={(e) => setNewGallery({ ...newGallery, password: e.target.value })}
                  className="flex-1 h-10 rounded-lg bg-white/5 border border-white/10 px-4 text-white outline-none focus:border-amber-700/50 transition-all"
                  placeholder="كلمة المرور"
                />
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleCreateGallery}
              className="flex-1 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-sm font-semibold transition-all"
            >
              إنشاء ورفع الصور
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-all"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Galleries Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">جاري التحميل...</div>
      ) : galleries.length === 0 ? (
        <div className="text-center py-12 text-gray-400">لا توجد معارض حالياً</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {galleries.map((gallery) => (
            <div
              key={gallery.id}
              className="group relative cursor-pointer"
            >
              <div className="aspect-square rounded-full overflow-hidden border-4 border-white/10 group-hover:border-purple-500/50 transition-all duration-300">
                {gallery.coverImage ? (
                  <img
                    src={gallery.coverImage}
                    alt={gallery.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center">
                    <Images size={48} className="text-white/30" />
                  </div>
                )}
                {gallery.hasPasswordProtection && (
                  <div className="absolute top-2 right-2 p-2 bg-black/50 rounded-full">
                    <Lock size={16} className="text-white" />
                  </div>
                )}
              </div>
              <div className="text-center mt-3">
                <p className="text-white font-semibold text-sm">{gallery.title}</p>
                <p className="text-gray-400 text-xs">{gallery.clientName}</p>
                <p className="text-gray-500 text-xs mt-1">{gallery.photos?.length || 0} صورة</p>
              </div>
              <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedGalleryId(gallery.id);
                    setShowUpload(true);
                  }}
                  className="p-2 bg-amber-700 rounded-lg hover:bg-amber-800 transition-all"
                  title="رفع صور"
                >
                  <Plus size={16} className="text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteGallery(gallery.id);
                  }}
                  className="p-2 bg-red-600 rounded-lg hover:bg-red-700 transition-all"
                  title="حذف"
                >
                  <Trash2 size={16} className="text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d0d15] border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">رفع صور المعرض</h2>
              <button
                onClick={() => setShowUpload(false)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
              >
                <MoreVertical size={20} className="text-white rotate-45" />
              </button>
            </div>
            <GalleryUpload galleryId={selectedGalleryId} onUploadComplete={(urls) => {
              console.log('Uploaded URLs:', urls);
              setShowUpload(false);
            }} />
          </div>
        </div>
      )}
    </div>
  );
}

function StoreContent({ navigate }: { navigate: any }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-sm font-semibold transition-all">
          <Plus size={18} />
          منتج جديد
        </button>
        <div className="relative">
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="بحث في المنتجات..."
            className="w-64 h-10 pl-10 pr-4 rounded-lg bg-white/5 border border-white/10 text-sm outline-none focus:border-amber-700/50 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-purple-500/30 transition-all">
            <div className="aspect-video bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-lg mb-4"></div>
            <h3 className="text-lg font-bold mb-2">منتج {i}</h3>
            <p className="text-amber-600 font-bold mb-4">{1000 * i} ج.م</p>
            <div className="flex gap-2">
              <button className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-all">
                تعديل
              </button>
              <button className="flex-1 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30 transition-all">
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BookingsContent({ navigate }: { navigate: any }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-sm font-semibold transition-all">
            <Plus size={18} />
            حجز جديد
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-all">
            <Filter size={18} />
            تصفية
          </button>
        </div>
        <div className="relative">
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="بحث في الحجوزات..."
            className="w-64 h-10 pl-10 pr-4 rounded-lg bg-white/5 border border-white/10 text-sm outline-none focus:border-amber-700/50 transition-all"
          />
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-400">العميل</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-400">التاريخ</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-400">الباقة</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-400">الحالة</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-400">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="border-t border-white/10 hover:bg-white/5 transition-all">
                <td className="px-4 py-3 text-sm">عميل {i}</td>
                <td className="px-4 py-3 text-sm text-gray-400">2024-06-{10 + i}</td>
                <td className="px-4 py-3 text-sm">باقة {i}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
                    مؤكد
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
                    <MoreVertical size={16} className="text-gray-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReviewsContent({ navigate }: { navigate: any }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-all">
            <Filter size={18} />
            تصفية
          </button>
        </div>
        <div className="relative">
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="بحث في المراجعات..."
            className="w-64 h-10 pl-10 pr-4 rounded-lg bg-white/5 border border-white/10 text-sm outline-none focus:border-amber-700/50 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-purple-500/30 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30"></div>
                <div>
                  <p className="font-semibold">عميل {i}</p>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={14} className={star <= 4 ? 'text-amber-400 fill-amber-400' : 'text-gray-600'} />
                    ))}
                  </div>
                </div>
              </div>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
                <MoreVertical size={16} className="text-gray-400" />
              </button>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              تجربة رائعة مع المصور. التصوير احترافي والخدمة ممتازة. أنصح الجميع بالتعامل معه.
            </p>
            <p className="text-gray-500 text-xs mt-4">2024-06-{10 + i}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
