import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, Download, X, AlertCircle, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ClientDelivery {
  id: string;
  clientName: string;
  title: string;
  password: string;
  paymentCompleted: boolean;
  photos: Array<{ url: string; title: string }>;
  createdAt: string;
}

export default function ClientDeliveryPage() {
  const { deliveryId } = useParams<{ deliveryId: string }>();
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState<ClientDelivery | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (deliveryId) {
      loadDelivery(deliveryId);
    }
  }, [deliveryId]);

  const loadDelivery = async (id: string) => {
    try {
      // Firebase disabled for now - using null
      const delivery = null;
      if (delivery) {
        setDelivery(delivery);
      } else {
        setError('رابط التسليم غير صالح');
      }
    } catch (err) {
      console.error('Error loading delivery:', err);
      setError('حدث خطأ أثناء تحميل الصفحة');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPassword === delivery?.password) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('كلمة المرور غير صحيحة');
      toast.error('كلمة المرور غير صحيحة');
    }
  };

  const handleDownloadAll = () => {
    if (!delivery?.paymentCompleted) return;

    delivery.photos.forEach((photo, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = photo.url;
        link.download = `${delivery.title}_${index + 1}.jpg`;
        link.click();
      }, index * 500);
    });

    toast.success('جاري تحميل جميع الصور...');
  };

  const handleDownloadSingle = (url: string, title: string) => {
    if (!delivery?.paymentCompleted) {
      toast.error('يجب إتمام الدفع أولاً لتحميل الصور');
      return;
    }

    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}.jpg`;
    link.click();
  };

  // Disable right-click for unpaid deliveries
  useEffect(() => {
    if (isAuthenticated && !delivery?.paymentCompleted) {
      const handleContextMenu = (e: MouseEvent) => e.preventDefault();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey && (e.key === 's' || e.key === 'u')) {
          e.preventDefault();
        }
      };

      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isAuthenticated, delivery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0d0d15] to-[#080910] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0d0d15] to-[#080910] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <AlertCircle size={64} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">خطأ</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0d0d15] to-[#080910] text-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-6">
                <Lock size={40} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-2">صفحة تسليم الشغل</h1>
              <p className="text-gray-400">أدخل كلمة المرور للوصول إلى صورك</p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">كلمة المرور</label>
                <input
                  type="password"
                  value={enteredPassword}
                  onChange={(e) => setEnteredPassword(e.target.value)}
                  className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none focus:border-purple-500/50 transition-all"
                  placeholder="أدخل كلمة المرور"
                />
              </div>
              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}
              <button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold transition-all"
              >
                دخول
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm">
                للعميل: <span className="text-white font-semibold">{delivery?.clientName}</span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0d0d15] to-[#080910] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0d0d15]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">{delivery?.title}</h1>
              <p className="text-sm text-gray-400">للعميل: {delivery?.clientName}</p>
            </div>
            {delivery?.paymentCompleted && (
              <button
                onClick={handleDownloadAll}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-sm font-semibold transition-all"
              >
                <Download size={18} />
                تحميل الكل
              </button>
            )}
          </div>

          {/* Payment Status Banner */}
          {!delivery?.paymentCompleted && (
            <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-3">
              <AlertCircle size={24} className="text-amber-500" />
              <div>
                <p className="font-semibold text-amber-400">لم يتم إتمام الدفع بعد</p>
                <p className="text-sm text-amber-400/70">الصور معروضة بجودة منخفضة وبدون إمكانية التحميل</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Photos Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {delivery?.photos.map((photo, index) => (
            <div
              key={index}
              className="relative group cursor-pointer"
              onClick={() => !delivery.paymentCompleted && toast.error('يجب إتمام الدفع أولاً')}
            >
              <div className="aspect-square rounded-xl overflow-hidden border border-white/10">
                <img
                  src={photo.url}
                  alt={photo.title}
                  className={`w-full h-full object-cover transition-all ${
                    !delivery.paymentCompleted ? 'filter blur-sm' : ''
                  }`}
                />
                
                {/* Watermark Overlay for Unpaid */}
                {!delivery.paymentCompleted && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-center">
                      <Lock size={32} className="text-white/50 mx-auto mb-2" />
                      <p className="text-white/50 text-sm">صورة محمية</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Download Button for Paid */}
              {delivery.paymentCompleted && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadSingle(photo.url, photo.title);
                  }}
                  className="absolute bottom-2 right-2 p-2 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Download size={16} className="text-white" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
