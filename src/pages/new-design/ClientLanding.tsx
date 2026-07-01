import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Play, 
  Heart, 
  Star, 
  Calendar, 
  ChevronRight,
  ArrowRight,
  Sparkles,
  Award,
  Users,
  Menu,
  X,
  Phone,
  Mail,
  Instagram,
  Facebook
} from 'lucide-react';
import { GlassButton, GlassCard } from '../../design-system';

export default function ClientLanding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const slides = [
    {
      title: 'التقط لحظات لا تُنسى',
      subtitle: 'نحول ذكرياتك إلى فن خالد',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1920',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'احترافية في كل لقطة',
      subtitle: 'فريق من المصورين المحترفين لخدمتك',
      image: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=1920',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'معارض تفاعلية',
      subtitle: 'استمتع بذكرياتك بطريقة جديدة ومبتكرة',
      image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920',
      color: 'from-amber-500 to-orange-500'
    }
  ];

  const features = [
    {
      icon: Camera,
      title: 'تصوير احترافي',
      description: 'أحدث معدات التصوير والتقنيات'
    },
    {
      icon: Award,
      title: 'جودة عالية',
      description: 'صور بدقة 4K وتعديل احترافي'
    },
    {
      icon: Users,
      title: 'فريق متخصص',
      description: 'مصورون محترفون ذوو خبرة واسعة'
    },
    {
      icon: Sparkles,
      title: 'معارض تفاعلية',
      description: 'تجربة فريدة لعرض ذكرياتك'
    }
  ];

  const testimonials = [
    {
      name: 'أحمد محمد',
      role: 'حفل زفاف',
      content: 'كانت تجربة رائعة! الصور احترافية جداً والفريق ودود.',
      rating: 5
    },
    {
      name: 'سارة أحمد',
      role: 'حفلة تخرج',
      content: 'التقطوا كل لحظة جميلة بطريقة إبداعية. أنصح بهم بشدة!',
      rating: 5
    },
    {
      name: 'خالد عبدالله',
      role: 'حفل عيد ميلاد',
      content: 'خدمة ممتازة وجودة عالية. سأعود بالتأكيد.',
      rating: 5
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-['Cairo','Tajawal',sans-serif]" dir="rtl">
      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        {/* Background Slider */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="relative z-10 flex items-center justify-between px-8 py-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Camera size={24} />
            </div>
            <span className="text-2xl font-bold">ستوديو التصوير</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#portfolio" className="text-gray-300 hover:text-white transition-colors">المعرض</a>
            <a href="#services" className="text-gray-300 hover:text-white transition-colors">الخدمات</a>
            <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">آراء العملاء</a>
            <a href="#contact" className="text-gray-300 hover:text-white transition-colors">تواصل معنا</a>
          </div>

          <div className="flex items-center gap-4">
            <GlassButton size="sm">احجز الآن</GlassButton>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </motion.nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="relative z-10 md:hidden bg-black/90 backdrop-blur-xl border-b border-white/10"
            >
              <div className="flex flex-col items-center gap-6 py-8">
                <a href="#portfolio" className="text-gray-300 hover:text-white transition-colors">المعرض</a>
                <a href="#services" className="text-gray-300 hover:text-white transition-colors">الخدمات</a>
                <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">آراء العملاء</a>
                <a href="#contact" className="text-gray-300 hover:text-white transition-colors">تواصل معنا</a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center justify-center px-8">
          <div className="text-center max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                {slides[currentSlide].title}
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8">
                {slides[currentSlide].subtitle}
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <GlassButton size="lg" icon={<ArrowRight size={20} />}>
                  ابدأ رحلتك
                </GlassButton>
                <GlassButton variant="glass" size="lg" icon={<Play size={20} />}>
                  شاهد العرض
                </GlassButton>
              </div>
            </motion.div>

            {/* Slide Indicators */}
            <div className="flex items-center justify-center gap-3 mt-12">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentSlide ? 'bg-white w-8' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="services" className="py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">خدماتنا المميزة</h2>
            <p className="text-xl text-gray-400">نقدم لك أفضل تجربة تصوير احترافية</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="p-6 text-center h-full">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${slides[index % slides.length].color} flex items-center justify-center mx-auto mb-4`}>
                    <feature.icon size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-8 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">ماذا يقول عملاؤنا</h2>
            <p className="text-xl text-gray-400">آراء حقيقية من عملاء سعداء</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="p-6 h-full">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-6">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-lg font-bold">{testimonial.name[0]}</span>
                    </div>
                    <div>
                      <h4 className="font-bold">{testimonial.name}</h4>
                      <p className="text-sm text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <GlassCard className="p-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">جاهز لالتقاط لحظاتك؟</h2>
              <p className="text-xl text-gray-400 mb-8">
                احجز موعدك الآن ودعنا نحول ذكرياتك إلى فن خالد
              </p>
              <GlassButton size="lg" icon={<Calendar size={20} />}>
                احجز موعدك
              </GlassButton>
            </motion.div>
          </GlassCard>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-8 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">تواصل معنا</h2>
            <p className="text-xl text-gray-400">نحن هنا لمساعدتك</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4">
                <Phone size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">الهاتف</h3>
              <p className="text-gray-400">+20 123 456 7890</p>
            </GlassCard>

            <GlassCard className="p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                <Mail size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">البريد الإلكتروني</h3>
              <p className="text-gray-400">info@studio.com</p>
            </GlassCard>

            <GlassCard className="p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                <Instagram size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Instagram</h3>
              <p className="text-gray-400">@studio_photography</p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Camera size={20} />
              </div>
              <span className="text-xl font-bold">ستوديو التصوير</span>
            </div>
            
            <div className="flex items-center gap-4">
              <a href="#" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                <Facebook size={20} />
              </a>
            </div>
            
            <p className="text-gray-400">© 2024 ستوديو التصوير. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
