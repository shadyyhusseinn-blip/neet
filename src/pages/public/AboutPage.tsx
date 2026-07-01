import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Phone, Mail, Instagram, Facebook, MapPin, Award, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePageContent } from '../../hooks/usePageContent';

export default function AboutPage() {
  const navigate = useNavigate();

  // Use React Query to fetch page content
  const { data: pageContent } = usePageContent('about');

  const defaultContent = {
    photographerName: 'شادي حسين',
    photographerTitle: 'مصور محترف متخصص في تصوير الأفراح والمناسبات',
    bio: 'بدأت رحلتي في عالم التصوير منذ أكثر من 10 سنوات، شغوفاً بتوثيق أجمل اللحظات الإنسانية. أقدم خدمات تصوير احترافية تجمع بين الفن والذكريات الخالدة.',
    yearsOfExperience: 10,
    weddingsCount: 500
  };

  const content = pageContent || defaultContent;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0d0d15] to-[#080910] text-white">
      {/* Floating Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-transparent backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.button
            onClick={() => navigate('/')}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
          >
            شادي حسين
          </motion.button>
          <motion.button
            onClick={() => navigate('/')}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-all"
          >
            العودة للرئيسية
          </motion.button>
        </div>
      </nav>

      {/* Header */}
      <div className="pt-24 pb-12 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
        >
          من نحن
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 text-lg"
        >
          تعرف على الفنان خلف العدسة
        </motion.p>
      </div>

      {/* Editorial Layout */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Portrait */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="order-2 lg:order-1"
          >
            <div className="relative">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-white/10">
                <img
                  src="/profile-photo.png"
                  alt="شادي حسين"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800';
                  }}
                />
              </div>
              {/* Decorative Elements */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-amber-700/20 rounded-full blur-3xl" />
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="order-1 lg:order-2 space-y-8"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-serif">
                {content.photographerName}
              </h2>
              <p className="text-amber-600 text-lg mb-6">{content.photographerTitle}</p>
              <p className="text-gray-300 leading-relaxed text-lg">
                {content.bio}
              </p>
            </div>

            {/* Philosophy */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Heart size={24} className="text-amber-700" />
                <h3 className="text-xl font-bold text-white">فلسفتي الفنية</h3>
              </div>
              <p className="text-gray-400 leading-relaxed">
                التصوير ليس مجرد التقاط صور، بل هو فن رؤية الجمال في كل تفاصيل الحياة. أسعى دائماً لخلق صور تعكس المشاعر الحقيقية واللحظات العفوية، بعيداً عن التصنع والتقليد.
              </p>
            </div>

            {/* Experience */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <Award size={32} className="text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{content.yearsOfExperience}+</p>
                <p className="text-gray-400 text-sm">سنوات خبرة</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <Heart size={32} className="text-pink-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{content.weddingsCount}+</p>
                <p className="text-gray-400 text-sm">زفاف ناجح</p>
              </div>
            </div>

            {/* Contact Buttons */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">تواصل معنا</h3>
              <div className="grid grid-cols-2 gap-4">
                <a
                  href="tel:+201000000000"
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all"
                >
                  <Phone size={20} className="text-purple-400" />
                  <span className="text-white">اتصل بنا</span>
                </a>
                <a
                  href="mailto:contact@shadystudio.com"
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all"
                >
                  <Mail size={20} className="text-purple-400" />
                  <span className="text-white">راسلنا</span>
                </a>
                <a
                  href="https://instagram.com/shadystudio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all"
                >
                  <Instagram size={20} className="text-purple-400" />
                  <span className="text-white">إنستغرام</span>
                </a>
                <a
                  href="https://facebook.com/shadystudio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all"
                >
                  <Facebook size={20} className="text-purple-400" />
                  <span className="text-white">فيسبوك</span>
                </a>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <MapPin size={20} className="text-purple-400" />
                <span className="text-gray-300">القاهرة، مصر</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
