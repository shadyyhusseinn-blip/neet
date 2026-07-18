import { motion } from 'motion/react';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function BookNowPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-4">احجز الآن</h1>
          <p className="text-xl text-gray-300">تواصل معنا لحجز موعدك</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-8"
          >
            <h2 className="text-3xl font-bold mb-6">معلومات التواصل</h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Phone size={24} />
                </div>
                <div>
                  <p className="text-gray-400">الهاتف</p>
                  <p className="text-xl font-semibold">+20 123 456 7890</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="text-gray-400">البريد الإلكتروني</p>
                  <p className="text-xl font-semibold">info@shadyphotography.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-gray-400">العنوان</p>
                  <p className="text-xl font-semibold">القاهرة، مصر</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-8"
          >
            <h2 className="text-3xl font-bold mb-6">أرسل رسالة</h2>
            <form className="space-y-6">
              <div>
                <label className="block text-gray-400 mb-2">الاسم</label>
                <input
                  type="text"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500 transition-colors"
                  placeholder="أدخل اسمك"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-2">البريد الإلكتروني</label>
                <input
                  type="email"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500 transition-colors"
                  placeholder="أدخل بريدك الإلكتروني"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-2">رقم الهاتف</label>
                <input
                  type="tel"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500 transition-colors"
                  placeholder="أدخل رقم هاتفك"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-2">نوع الخدمة</label>
                <select className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500 transition-colors">
                  <option value="">اختر الخدمة</option>
                  <option value="wedding">تصوير أفراح</option>
                  <option value="engagement">تصوير خطوبة</option>
                  <option value="portrait">تصوير بورتريه</option>
                  <option value="event">تصوير مناسبات</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 mb-2">الرسالة</label>
                <textarea
                  rows={4}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500 transition-colors"
                  placeholder="اكتب رسالتك"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold py-3 rounded-xl hover:from-pink-600 hover:to-purple-600 transition-colors"
              >
                إرسال
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
