import { motion } from 'motion/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-4">الأسئلة الشائعة</h1>
          <p className="text-xl text-gray-300">إجابات على أسئلتك المتكررة</p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full p-6 text-right flex items-center justify-between hover:bg-white/20 transition-colors"
              >
                <span className="text-lg font-semibold">{faq.question}</span>
                {openIndex === index ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
              </button>
              {openIndex === index && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-6 pt-0 text-gray-300"
                >
                  {faq.answer}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

const faqs = [
  {
    question: 'كم تكلفة تصوير الأفراح؟',
    answer: 'تختلف الأسعار حسب الباقة المختارة والخدمات المطلوبة. يمكننا تقديم عرض سعر مخصص بناءً على احتياجاتك.'
  },
  {
    question: 'كم مدة التغطية في يوم الزفاف؟',
    answer: 'نوفر خيارات مختلفة من 8 ساعات إلى تغطية كاملة لليوم. يمكننا تخصيص المدة حسب جدولك.'
  },
  {
    question: 'متى أحصل على الصور والفيديو؟',
    answer: 'عادة نحتاج من 4 إلى 6 أسابيع لمعالجة الصور والفيديو وتسليمها بجودة عالية.'
  },
  {
    question: 'هل توفرون تصوير خارجي؟',
    answer: 'نعم، نوفر تصوير خارجي في جميع المواقع الطبيعية والمناظر الخلابة.'
  },
  {
    question: 'هل يمكنني حجز موعد مسبق؟',
    answer: 'نعم، ننصح بالحجز المسبق بمدة لا تقل عن 3 أشهر لضمان التوفر.'
  }
];
