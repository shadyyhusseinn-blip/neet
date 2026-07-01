import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'أحمد محمد',
    role: 'زفاف',
    rating: 5,
    content: 'تجربة رائعة مع شادي. الصور خرافية والتقاط اللحظات كان مذهل. أنصح به بشدة لكل من يريد تصوير احترافي.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
  },
  {
    id: 2,
    name: 'سارة أحمد',
    role: 'خطوبة',
    rating: 5,
    content: 'شادي مصور محترف جداً. التقط أجمل اللحظات في خطوبتي. الصور كانت أفضل من توقعاتي بكثير.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'
  },
  {
    id: 3,
    name: 'محمد علي',
    role: 'زفاف',
    rating: 5,
    content: 'خدمة ممتازة وأسعار معقولة. شادي محترف ويعرف كيف يلتقط اللحظات المهمة. سعيد جداً بالنتيجة.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'
  },
  {
    id: 4,
    name: 'نور الهدي',
    role: 'بورتريه',
    rating: 5,
    content: 'تجربة رائعة في تصوير البورتريه. شادي محترف ويجعلك تشعر بالراحة أمام الكاميرا.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100'
  }
];

export function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-br from-[#0a0a0f] via-[#0d0d15] to-[#080910] py-16">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            آراء العملاء
          </h2>
          <p className="text-gray-400">ماذا يقول عملاؤنا عنا</p>
        </motion.div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12"
            >
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-purple-500/30">
                    <img
                      src={testimonials[currentIndex].image}
                      alt={testimonials[currentIndex].name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="flex-1 text-center md:text-right">
                  <Quote size={32} className="text-purple-400 mb-4 mx-auto md:mx-0" />
                  <p className="text-lg md:text-xl text-gray-300 mb-6 leading-relaxed">
                    {testimonials[currentIndex].content}
                  </p>

                  <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                    {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                      <Star key={i} size={20} className="text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white">{testimonials[currentIndex].name}</h3>
                    <p className="text-gray-400">{testimonials[currentIndex].role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition-all z-10"
          >
            <ChevronRight size={24} className="text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition-all z-10"
          >
            <ChevronLeft size={24} className="text-white" />
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-purple-500 w-8'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
