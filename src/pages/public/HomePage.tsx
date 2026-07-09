/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Camera, 
  Calendar, 
  DollarSign, 
  Users, 
  Image as ImageIcon, 
  Settings, 
  Shield, 
  Lock,
  ChevronRight,
  Globe,
  LayoutDashboard,
  Award,
  Star,
  ArrowRight,
  Play
} from 'lucide-react';
import { Language } from '../../lib/translations';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('elite-lens-lang') as Language) || 'ar');
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const [stats, setStats] = useState({ projects: 0, clients: 0, years: 0, awards: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        projects: Math.min(prev.projects + 5, 500),
        clients: Math.min(prev.clients + 3, 300),
        years: Math.min(prev.years + 1, 10),
        awards: Math.min(prev.awards + 1, 25)
      }));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const sections = [
    {
      title: lang === 'ar' ? 'الصفحة الافتتاحية' : 'Landing Page',
      description: lang === 'ar' ? 'صفحة العرض الرئيسية للتصوير والخدمات' : 'Main photography showcase page',
      icon: Camera,
      link: '/landing',
      color: 'from-[#D4AF37] to-[#bfa032]'
    },
    {
      title: lang === 'ar' ? 'لوحة التحكم' : 'Admin Dashboard',
      description: lang === 'ar' ? 'إدارة الحجوزات والمالية والعملاء' : 'Manage bookings, finance, and clients',
      icon: LayoutDashboard,
      link: '/admin/login',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: lang === 'ar' ? 'نظام PIXELS' : 'PIXELS System',
      description: lang === 'ar' ? 'إدارة المعارف والصور والعميل' : 'Manage galleries, photos, and clients',
      icon: ImageIcon,
      link: '/pixels',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: lang === 'ar' ? 'المعارض العامة' : 'Public Galleries',
      description: lang === 'ar' ? 'المعارف المتاحة للعملاء' : 'Galleries accessible to clients',
      icon: Globe,
      link: '/g',
      color: 'from-cyan-500 to-cyan-600'
    }
  ];

  const features = [
    {
      icon: Camera,
      title: lang === 'ar' ? 'تصوير احترافي' : 'Professional Photography',
      description: lang === 'ar' ? 'أحدث المعدات والتقنيات للحصول على أفضل النتائج' : 'Latest equipment and techniques for best results'
    },
    {
      icon: Award,
      title: lang === 'ar' ? 'جودة عالية' : 'High Quality',
      description: lang === 'ar' ? 'ضمان الجودة في كل صورة نلتقطها' : 'Quality guaranteed in every photo we take'
    },
    {
      icon: Users,
      title: lang === 'ar' ? 'فريق متخصص' : 'Expert Team',
      description: lang === 'ar' ? 'فريق من المصورين المحترفين ذوي الخبرة' : 'Team of experienced professional photographers'
    }
  ];

  return (
    <div className="bg-[#0A0A0A] text-[#F5F5F5] font-sans min-h-screen" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Language Switcher */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
          className="px-4 py-2 bg-neutral-950/80 backdrop-blur-sm border border-neutral-800 text-neutral-400 hover:text-white text-sm font-mono uppercase tracking-wider transition-all rounded-lg"
        >
          {lang === 'ar' ? 'English' : 'العربية'}
        </button>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0A] via-[#151515] to-[#0A0A0A]" />
        <motion.div 
          style={{ y: y1 }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37]/20 rounded-full blur-3xl"
        />
        <motion.div 
          style={{ y: y2 }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
        />
        
        {/* Content */}
        <motion.div 
          style={{ opacity }}
          className="relative z-10 text-center px-8 max-w-7xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="flex items-center justify-center gap-3 mb-8">
              <Star className="w-6 h-6 text-[#D4AF37] fill-[#D4AF37]" />
              <Star className="w-6 h-6 text-[#D4AF37] fill-[#D4AF37]" />
              <Star className="w-6 h-6 text-[#D4AF37] fill-[#D4AF37]" />
              <Star className="w-6 h-6 text-[#D4AF37] fill-[#D4AF37]" />
              <Star className="w-6 h-6 text-[#D4AF37] fill-[#D4AF37]" />
            </div>
            
            <h1 className="text-7xl md:text-9xl lg:text-[10rem] font-serif italic font-light text-white mb-8 tracking-wide">
              {lang === 'ar' ? 'شادي حسين' : 'Shady Hussein'}
            </h1>
            
            <p className="text-3xl md:text-4xl lg:text-5xl text-[#D4AF37] font-light mb-10">
              {lang === 'ar' ? 'استوديو تصوير فاخر' : 'Luxury Photography Studio'}
            </p>
            
            <p className="text-xl md:text-2xl lg:text-3xl text-neutral-400 max-w-3xl mx-auto mb-16 leading-relaxed">
              {lang === 'ar' 
                ? 'نحول لحظاتك الثمينة إلى ذكريات خالدة بلمسة فنية استثنائية'
                : 'Transform your precious moments into timeless memories with exceptional artistic touch'}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                to="/portfolio"
                className="group px-10 py-5 bg-[#D4AF37] hover:bg-[#bfa032] text-neutral-950 font-semibold rounded-lg transition-all flex items-center gap-3 text-lg"
              >
                {lang === 'ar' ? 'اكتشف خدماتنا' : 'Discover Our Services'}
                <ArrowRight className={`w-6 h-6 ${lang === 'ar' ? 'rotate-180' : ''}`} />
              </Link>
              <Link
                to="/unified-login"
                className="px-10 py-5 border border-neutral-700 hover:border-[#D4AF37] text-white rounded-lg transition-all text-lg"
              >
                {lang === 'ar' ? 'دخول الإدارة' : 'Admin Login'}
              </Link>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-neutral-700 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-[#D4AF37] rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-24 lg:py-32 bg-neutral-900/50 border-y border-neutral-800">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { value: stats.projects, label: lang === 'ar' ? 'مشروع' : 'Projects', icon: Camera },
              { value: stats.clients, label: lang === 'ar' ? 'عميل' : 'Clients', icon: Users },
              { value: stats.years, label: lang === 'ar' ? 'سنة خبرة' : 'Years', icon: Award },
              { value: stats.awards, label: lang === 'ar' ? 'جائزة' : 'Awards', icon: Star }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <stat.icon className="w-10 h-10 text-[#D4AF37] mx-auto mb-4" />
                <div className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-3">{stat.value}+</div>
                <div className="text-neutral-400 text-base uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 lg:py-40 px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif italic text-white mb-6">
              {lang === 'ar' ? 'لماذا نحن؟' : 'Why Choose Us?'}
            </h2>
            <p className="text-neutral-400 max-w-3xl mx-auto text-xl lg:text-2xl">
              {lang === 'ar' ? 'نقدم تجربة تصوير فريدة تجمع بين الإبداع والاحترافية' : 'We offer a unique photography experience combining creativity and professionalism'}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-10 hover:border-[#D4AF37]/50 transition-all group"
              >
                <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center mb-8 group-hover:bg-[#D4AF37]/20 transition-all">
                  <feature.icon className="w-10 h-10 text-[#D4AF37]" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-neutral-400 leading-relaxed text-lg">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Navigation Section */}
      <section className="py-32 lg:py-40 px-8 bg-gradient-to-b from-[#0A0A0A] to-[#151515]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif italic text-white mb-6">
              {lang === 'ar' ? 'استكشف عالمنا' : 'Explore Our World'}
            </h2>
            <p className="text-neutral-400 max-w-3xl mx-auto text-xl lg:text-2xl">
              {lang === 'ar' ? 'اختر القسم الذي تريد الوصول إليه' : 'Choose the section you want to access'}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={section.link}
                  className="group relative bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden hover:border-[#D4AF37]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#D4AF37]/10 hover:-translate-y-1 block"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${section.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  <div className="relative p-10">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center mb-8`}>
                      <section.icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-semibold text-white mb-4 group-hover:text-[#D4AF37] transition-colors">
                      {section.title}
                    </h3>
                    
                    <p className="text-base text-neutral-400 mb-8 leading-relaxed">
                      {section.description}
                    </p>
                    
                    <div className="flex items-center text-[#D4AF37] text-base font-medium">
                      <span>{lang === 'ar' ? 'الدخول' : 'Access'}</span>
                      <ChevronRight className={`w-5 h-5 ml-2 ${lang === 'ar' ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 bg-[#0A0A0A] px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10 mb-10">
            <div className="text-center md:text-left">
              <div className="text-4xl font-serif italic text-white mb-3">{lang === 'ar' ? 'شادي حسين' : 'Shady Hussein'}</div>
              <div className="text-[#D4AF37] text-base font-mono uppercase tracking-wider">
                {lang === 'ar' ? 'استوديو تصوير فاخر' : 'Luxury Photography Studio'}
              </div>
            </div>
            <div className="flex items-center gap-2 text-neutral-500 text-base">
              <span>{lang === 'ar' ? '© 2024' : '© 2024'}</span>
              <span className="text-neutral-800">•</span>
              <span>{lang === 'ar' ? 'جميع الحقوق محفوظة' : 'All Rights Reserved'}</span>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-neutral-800">
            <div className="flex items-center gap-2 text-neutral-600 text-sm font-mono uppercase tracking-wider">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              {lang === 'ar' ? 'قاعدة البيانات متصلة' : 'Database Connected'}
            </div>
            <div className="flex items-center gap-2 text-neutral-600 text-sm font-mono uppercase tracking-wider">
              <span className="w-2 h-2 bg-[#D4AF37] rounded-full" />
              {lang === 'ar' ? 'نظام الحجز نشط' : 'Booking System Active'}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
