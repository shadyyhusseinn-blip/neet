import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const faqs = [
  {
    category: 'الحجز والدفع',
    questions: [
      {
        q: 'كيف يمكنني حجز موعد؟',
        a: 'يمكنك حجز موعد من خلال صفحة "احجز الآن" أو التواصل معنا مباشرة عبر الهاتف أو واتساب. نحتاج معلومات أساسية مثل التاريخ والوقت والموقع ونوع الخدمة المطلوبة.'
      },
      {
        q: 'ما هي طرق الدفع المتاحة؟',
        a: 'نقبل الدفع النقدي، التحويل البنكي، والبطاقات البنكية. يمكن تقسيم الدفع على دفعات حسب الاتفاق.'
      },
      {
        q: 'هل يمكنني إلغاء الحجز؟',
        a: 'نعم، يمكن إلغاء الحجز مع إشعار مسبق بـ 48 ساعة. سيتم خصم رسوم إلغاء بسيطة.'
      }
    ]
  },
  {
    category: 'الخدمات',
    questions: [
      {
        q: 'ما هي الخدمات التي تقدمونها؟',
        a: 'نقدم خدمات تصوير الأفراح، التصوير السينمائي، تصوير البورتريه، وتعديل الصور والفيديو. لدينا باقات مختلفة تناسب جميع الميزانيات.'
      },
      {
        q: 'كم يستغرق تسليم الصور؟',
        a: 'عادة يتم تسليم الصور خلال 2-4 أسابيع بعد الحدث. يمكن تقديم التسليم مقابل رسوم إضافية.'
      },
      {
        q: 'هل تقومون بتعديل الصور؟',
        a: 'نعم، نقوم بتعديل احترافي للصور يشمل تصحيح الألوان، الريتوش، وتحسين الجودة.'
      }
    ]
  },
  {
    category: 'الصور والمعارض',
    questions: [
      {
        q: 'كيف يمكنني رؤية معرض الأعمال؟',
        a: 'يمكنك زيارة صفحة "المعارض" على موقعنا لمشاهدة معرض أعمالنا. كما يمكنك متابعتنا على إنستغرام وفيسبوك.'
      },
      {
        q: 'هل يمكنني الحصول على الصور الأصلية؟',
        a: 'نعم، يمكن الحصول على الصور الأصلية بدقة عالية بعد الدفع الكامل.'
      },
      {
        q: 'هل تضعون علامة مائية على الصور؟',
        a: 'نعم، نضع علامة مائية خفيفة على الصور المعروضة. يمكن إزالتها من الصور النهائية بعد الدفع.'
      }
    ]
  }
];

export default function FAQPage() {
  const navigate = useNavigate();
  const [openCategory, setOpenCategory] = useState<number | null>(null);
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0d0d15] to-[#080910] text-white">
      {/* Header */}
      <div className="pt-24 pb-12 text-center">
        <motion.button
          onClick={() => navigate('/')}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronDown size={20} className="rotate-90" />
          <span>العودة للرئيسية</span>
        </motion.button>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
        >
          الأسئلة الشائعة
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 text-lg"
        >
          إجابات على الأسئلة الأكثر شيوعاً
        </motion.p>
      </div>

      {/* FAQ Content */}
      <div className="max-w-4xl mx-auto px-4 pb-20">
        {faqs.map((category, categoryIndex) => (
          <motion.div
            key={category.category}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: categoryIndex * 0.1 }}
            className="mb-8"
          >
            <button
              onClick={() => setOpenCategory(openCategory === categoryIndex ? null : categoryIndex)}
              className="w-full flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-purple-500/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <HelpCircle size={24} className="text-purple-400" />
                <h2 className="text-2xl font-bold text-white">{category.category}</h2>
              </div>
              <ChevronDown
                size={24}
                className={`text-gray-400 transition-transform ${
                  openCategory === categoryIndex ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {openCategory === categoryIndex && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 space-y-4"
                >
                  {category.questions.map((faq, questionIndex) => (
                    <div key={questionIndex} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setOpenQuestion(openQuestion === questionIndex ? null : questionIndex)}
                        className="w-full flex items-center justify-between p-4 text-right hover:bg-white/5 transition-all"
                      >
                        <span className="font-semibold text-white">{faq.q}</span>
                        <ChevronDown
                          size={20}
                          className={`text-gray-400 transition-transform ${
                            openQuestion === questionIndex ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      <AnimatePresence>
                        {openQuestion === questionIndex && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="p-4 text-gray-300 bg-white/5"
                          >
                            {faq.a}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-4">لم تجد إجابة سؤالك؟</h3>
          <p className="text-gray-400 mb-6">تواصل معنا وسنكون سعداء بمساعدتك</p>
          <button
            onClick={() => navigate('/contact')}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            تواصل معنا
          </button>
        </motion.div>
      </div>
    </div>
  );
}
