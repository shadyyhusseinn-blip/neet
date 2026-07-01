import React from 'react';
import { motion } from 'motion/react';
import { Phone, Mail, Instagram, Facebook } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const content = {
  phone: '+20 123 456 7890',
  email: 'contact@shadyhussein.com',
  instagram: 'https://instagram.com/shadyhussein',
  facebook: 'https://facebook.com/shadyhussein'
};

export default function ContactPage() {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen bg-[#050508] text-white font-['Cairo','Tajawal',sans-serif] overflow-hidden" dir="rtl">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#050508] to-[#0a0a12]" />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl"
        />
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/')}
        className="absolute top-4 right-4 z-20 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300 text-sm"
      >
        رجوع للرئيسية
      </motion.button>

      <div className="relative z-10 h-full flex items-center justify-center px-4 py-4">
        <div className="text-center max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 md:mb-8 bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent"
          >
            تواصل معنا
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              className="group relative bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl md:rounded-3xl p-6 md:p-8 hover:border-purple-500/50 transition-all duration-500"
            >
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Phone size={28} className="md:size-40 text-white" />
              </div>
              <p className="text-white font-bold text-lg md:text-xl mb-2">الهاتف</p>
              <p className="text-gray-300 text-base md:text-lg">{content.phone}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="group relative bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-2xl md:rounded-3xl p-6 md:p-8 hover:border-blue-500/50 transition-all duration-500"
            >
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Mail size={28} className="md:size-40 text-white" />
              </div>
              <p className="text-white font-bold text-lg md:text-xl mb-2">البريد الإلكتروني</p>
              <p className="text-gray-300 text-base md:text-lg">{content.email}</p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center gap-4 md:gap-6"
          >
            <motion.a
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              href={content.instagram} target="_blank" rel="noopener noreferrer" 
              className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl md:rounded-2xl flex items-center justify-center hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
            >
              <Instagram size={24} className="md:size-28 text-white" />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.95 }}
              href={content.facebook} target="_blank" rel="noopener noreferrer" 
              className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl md:rounded-2xl flex items-center justify-center hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
            >
              <Facebook size={24} className="md:size-28 text-white" />
            </motion.a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
