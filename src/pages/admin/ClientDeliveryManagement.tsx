import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Lock, Unlock, Download, Copy, Trash2, CheckCircle, XCircle, Image as ImageIcon, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import GalleryUpload from '../../components/admin/GalleryUpload';

interface ClientDelivery {
  id: string;
  clientName: string;
  title: string;
  password: string;
  paymentCompleted: boolean;
  photos: Array<{ url: string; title: string }>;
  createdAt: string;
}

export default function ClientDeliveryManagement() {
  const [deliveries, setDeliveries] = useState<ClientDelivery[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState('');
  const [loading, setLoading] = useState(true);
  const [newDelivery, setNewDelivery] = useState({
    clientName: '',
    title: '',
    password: '',
    paymentCompleted: false
  });

  useEffect(() => {
    const loadDeliveries = async () => {
      try {
        // Firebase disabled for now - using empty array
        const data = [];
        setDeliveries(data);
        setLoading(false);
      } catch (error) {
        console.error('Error loading deliveries:', error);
        setLoading(false);
      }
    };

    loadDeliveries();
  }, []);

  const handleCreateDelivery = async () => {
    if (!newDelivery.clientName || !newDelivery.title || !newDelivery.password) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      // Firebase disabled for now - using empty array
      const deliveries = [];
      setDeliveries(deliveries);
    } catch (error) {
      console.error('Error creating delivery:', error);
      toast.error('فشل إنشاء صفحة التسليم');
    }
  };

  const handleTogglePayment = async (deliveryId: string, currentStatus: boolean) => {
    try {
      // Firebase disabled for now
      toast.success(!currentStatus ? 'تم تفعيل التحميل' : 'تم إيقاف التحميل');
      
      // Reload deliveries
      const deliveries = [];
      setDeliveries(deliveries);
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('فشل تحديث حالة الدفع');
    }
  };

  const handleDeleteDelivery = async (deliveryId: string) => {
    if (!confirm('هل أنت متأكد من حذف صفحة التسليم؟')) return;

    try {
      // Firebase disabled for now
      toast.success('تم حذف صفحة التسليم بنجاح');
      
      // Reload deliveries
      const deliveries = [];
      setDeliveries(deliveries);
    } catch (error) {
      console.error('Error deleting delivery:', error);
      toast.error('فشل حذف صفحة التسليم');
    }
  };

  const handleCopyLink = (deliveryId: string) => {
    const link = `${window.location.origin}/delivery/${deliveryId}`;
    navigator.clipboard.writeText(link);
    toast.success('تم نسخ رابط التسليم');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0d0d15]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold mb-1">نظام تسليم الشغل المحمي</h1>
          <p className="text-sm text-gray-400">إدارة صفحات تسليم الشغل للعملاء</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-sm font-semibold transition-all"
          >
            <Plus size={18} />
            صفحة تسليم جديدة
          </button>
          <div className="relative">
            <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="بحث..."
              className="w-64 h-10 pl-10 pr-4 rounded-lg bg-white/5 border border-white/10 text-sm outline-none focus:border-purple-500/50 transition-all"
            />
          </div>
        </div>

        {/* Create Delivery Form */}
        {showCreateForm && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-bold mb-4">إنشاء صفحة تسليم جديدة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">اسم العميل</label>
                <input
                  type="text"
                  value={newDelivery.clientName}
                  onChange={(e) => setNewDelivery({ ...newDelivery, clientName: e.target.value })}
                  className="w-full h-10 rounded-lg bg-white/5 border border-white/10 px-4 text-white outline-none focus:border-purple-500/50 transition-all"
                  placeholder="مثال: أحمد محمد"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">عنوان التسليم</label>
                <input
                  type="text"
                  value={newDelivery.title}
                  onChange={(e) => setNewDelivery({ ...newDelivery, title: e.target.value })}
                  className="w-full h-10 rounded-lg bg-white/5 border border-white/10 px-4 text-white outline-none focus:border-purple-500/50 transition-all"
                  placeholder="مثال: زفاف أحمد و سارة"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">كلمة المرور</label>
                <input
                  type="text"
                  value={newDelivery.password}
                  onChange={(e) => setNewDelivery({ ...newDelivery, password: e.target.value })}
                  className="w-full h-10 rounded-lg bg-white/5 border border-white/10 px-4 text-white outline-none focus:border-purple-500/50 transition-all"
                  placeholder="كلمة مرور للعميل"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="paymentCompleted"
                  checked={newDelivery.paymentCompleted}
                  onChange={(e) => setNewDelivery({ ...newDelivery, paymentCompleted: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="paymentCompleted" className="text-sm text-gray-300">
                  تم دفع الحساب (تفعيل التحميل)
                </label>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleCreateDelivery}
                className="flex-1 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-sm font-semibold transition-all"
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

        {/* Deliveries List */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">جاري التحميل...</div>
        ) : deliveries.length === 0 ? (
          <div className="text-center py-12 text-gray-400">لا توجد صفحات تسليم حالياً</div>
        ) : (
          <div className="space-y-4">
            {deliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-purple-500/30 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold">{delivery.title}</h3>
                      {delivery.paymentCompleted ? (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
                          <CheckCircle size={12} />
                          تم الدفع
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs">
                          <XCircle size={12} />
                          لم يتم الدفع
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mb-2">العميل: {delivery.clientName}</p>
                    <p className="text-gray-500 text-xs mb-3">{delivery.photos?.length || 0} صورة</p>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopyLink(delivery.id)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs hover:bg-white/10 transition-all"
                      >
                        <Copy size={14} />
                        نسخ الرابط
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDeliveryId(delivery.id);
                          setShowUpload(true);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-400 text-xs hover:bg-purple-600/30 transition-all"
                      >
                        <ImageIcon size={14} />
                        رفع صور
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePayment(delivery.id, delivery.paymentCompleted)}
                      className={cn(
                        'p-2 rounded-lg transition-all',
                        delivery.paymentCompleted
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-amber-600 hover:bg-amber-700'
                      )}
                      title={delivery.paymentCompleted ? 'إيقاف التحميل' : 'تفعيل التحميل'}
                    >
                      {delivery.paymentCompleted ? <Unlock size={18} className="text-white" /> : <Lock size={18} className="text-white" />}
                    </button>
                    <button
                      onClick={() => handleDeleteDelivery(delivery.id)}
                      className="p-2 rounded-lg bg-red-600 hover:bg-red-700 transition-all"
                      title="حذف"
                    >
                      <Trash2 size={18} className="text-white" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d0d15] border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">رفع صور التسليم</h2>
              <button
                onClick={() => setShowUpload(false)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
              >
                <X size={20} className="text-white" />
              </button>
            </div>
            <GalleryUpload galleryId={selectedDeliveryId} isClientDelivery={true} onUploadComplete={(urls) => {
              console.log('Uploaded URLs:', urls);
              setShowUpload(false);
            }} />
          </div>
        </div>
      )}
    </div>
  );
}
