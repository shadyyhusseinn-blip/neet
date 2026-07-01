import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Smartphone, QrCode, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'vodafone' | 'fawry' | null>(null);
  const [processing, setProcessing] = useState(false);

  const bookingData = location.state?.bookingData || {
    packageName: 'باقة الزفاف الأساسية',
    totalPrice: 15000,
    clientName: 'عميل',
  };

  const handlePayment = async (method: string) => {
    setProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setProcessing(false);
    
    // Redirect to success page
    navigate('/booking-success', { state: { bookingData, paymentMethod: method } });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-[#111111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
            >
              شادي حسين
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-sm hover:bg-gray-700 transition-all"
            >
              رجوع
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            إتمام الدفع
          </h1>
          <p className="text-gray-400 text-lg">
            اختر طريقة الدفع المناسبة لك
          </p>
        </div>

        {/* Order Summary */}
        <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-bold text-white mb-4">ملخص الطلب</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">الباقة</span>
              <span className="text-white">{bookingData.packageName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">الاسم</span>
              <span className="text-white">{bookingData.clientName}</span>
            </div>
            <div className="border-t border-gray-700 pt-3 flex justify-between">
              <span className="text-gray-300 font-semibold">المجموع</span>
              <span className="text-purple-400 font-bold text-xl">{bookingData.totalPrice} ج.م</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedMethod('card')}
            className={`p-6 rounded-2xl border-2 transition-all ${
              selectedMethod === 'card' 
                ? 'border-purple-500 bg-purple-500/10' 
                : 'border-gray-800 bg-[#111111] hover:border-gray-700'
            }`}
          >
            <CreditCard size={32} className={selectedMethod === 'card' ? 'text-purple-400' : 'text-gray-500'} />
            <p className="mt-3 font-semibold text-white">بطاقة ائتمان</p>
            <p className="text-xs text-gray-400 mt-1">Visa / Mastercard</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedMethod('vodafone')}
            className={`p-6 rounded-2xl border-2 transition-all ${
              selectedMethod === 'vodafone' 
                ? 'border-purple-500 bg-purple-500/10' 
                : 'border-gray-800 bg-[#111111] hover:border-gray-700'
            }`}
          >
            <Smartphone size={32} className={selectedMethod === 'vodafone' ? 'text-purple-400' : 'text-gray-500'} />
            <p className="mt-3 font-semibold text-white">فودافون كاش</p>
            <p className="text-xs text-gray-400 mt-1">تحويل فوري</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedMethod('fawry')}
            className={`p-6 rounded-2xl border-2 transition-all ${
              selectedMethod === 'fawry' 
                ? 'border-purple-500 bg-purple-500/10' 
                : 'border-gray-800 bg-[#111111] hover:border-gray-700'
            }`}
          >
            <QrCode size={32} className={selectedMethod === 'fawry' ? 'text-purple-400' : 'text-gray-500'} />
            <p className="mt-3 font-semibold text-white">فوري</p>
            <p className="text-xs text-gray-400 mt-1">QR Code</p>
          </motion.button>
        </div>

        {/* Payment Details */}
        {selectedMethod === 'vodafone' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#111111] border border-gray-800 rounded-2xl p-6 mb-8"
          >
            <h3 className="text-lg font-bold text-white mb-4">تفاصيل فودافون كاش</h3>
            <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-400 mb-2">رقم المحفظة</p>
              <p className="text-2xl font-bold text-purple-400">01000000000</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">رقم هاتفك</label>
                <input
                  type="tel"
                  placeholder="01xxxxxxxxx"
                  className="w-full h-12 rounded-lg border border-gray-700 bg-gray-800/50 px-4 text-sm text-white outline-none focus:border-purple-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">صورة الإيصال</label>
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
                  <p className="text-sm text-gray-400">اضغط لرفع صورة الإيصال</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Pay Button */}
        {selectedMethod && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => handlePayment(selectedMethod)}
            disabled={processing}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <AlertCircle size={20} className="animate-spin" />
                جاري معالجة الدفع...
              </>
            ) : (
              <>
                إتمام الدفع
                <ArrowRight size={20} />
              </>
            )}
          </motion.button>
        )}

        {/* Security Note */}
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>جميع المدفوعات آمنة ومشفرة</span>
        </div>
      </div>
    </div>
  );
}
