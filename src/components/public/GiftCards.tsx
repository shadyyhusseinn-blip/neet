import React, { useState } from 'react';
import { Gift, CreditCard, Mail, Download } from 'lucide-react';
import { motion } from 'framer-motion';

interface GiftCardAmount {
  value: number;
  label: string;
}

const defaultAmounts: GiftCardAmount[] = [
  { value: 100, label: '100 ج.م' },
  { value: 250, label: '250 ج.م' },
  { value: 500, label: '500 ج.م' },
  { value: 1000, label: '1000 ج.م' },
  { value: 2000, label: '2000 ج.م' },
];

interface GiftCardProps {
  amounts?: GiftCardAmount[];
}

export default function GiftCards({ amounts = defaultAmounts }: GiftCardProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');

  const handlePurchase = () => {
    if (!selectedAmount || !recipientEmail) {
      alert('الرجاء اختيار القيمة وإدخال البريد الإلكتروني');
      return;
    }
    // هنا يتم إضافة منطق الشراء
    console.log('Purchase:', { selectedAmount, recipientEmail, senderName, message });
  };

  return (
    <section className="py-20 lg:py-32 bg-neutral-900/50">
      <div className="max-w-7xl mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Gift className="w-8 h-8 text-purple-500" />
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
              بطاقات الهدايا
            </h2>
          </div>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
            هدية مثالية لأحبائك - دعهم يختارون لحظاتهم الخاصة
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Gift Card Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-white mb-6">اختر القيمة</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {amounts.map((amount) => (
                <motion.button
                  key={amount.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedAmount(amount.value)}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    selectedAmount === amount.value
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-neutral-700 bg-neutral-800/50 hover:border-purple-500/50'
                  }`}
                >
                  <CreditCard className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                  <div className="text-2xl font-bold text-white">{amount.value}</div>
                  <div className="text-sm text-neutral-400">{amount.label}</div>
                </motion.button>
              ))}
            </div>

            {selectedAmount && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-purple-500/20 rounded-lg border border-purple-500/50"
              >
                <p className="text-white">
                  القيمة المختارة: <span className="font-bold">{selectedAmount} ج.م</span>
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Recipient Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-white mb-6">تفاصيل الاستلام</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-neutral-300 mb-2">بريد المستلم *</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="w-full pr-10 pl-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 mb-2">اسمك (اختياري)</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="اسمك"
                  className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-2">رسالة مخصصة (اختياري)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="اكتب رسالة خاصة..."
                  rows={4}
                  className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePurchase}
                disabled={!selectedAmount || !recipientEmail}
                className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                شراء البطاقة
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 grid md:grid-cols-3 gap-8"
        >
          {[
            {
              icon: Gift,
              title: 'صالحة لمدة عام',
              description: 'بطاقات الهدايا صالحة للاستخدام لمدة عام من تاريخ الشراء'
            },
            {
              icon: CreditCard,
              title: 'قيم متعددة',
              description: 'اختر من مجموعة متنوعة من القيم المناسبة لميزانيتك'
            },
            {
              icon: Mail,
              title: 'إرسال فوري',
              description: 'يتم إرسال البطاقة فوراً إلى بريد المستلم الإلكتروني'
            }
          ].map((feature, index) => (
            <div key={index} className="text-center p-6 bg-neutral-800/50 rounded-xl">
              <feature.icon className="w-10 h-10 text-purple-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">{feature.title}</h4>
              <p className="text-neutral-400">{feature.description}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
