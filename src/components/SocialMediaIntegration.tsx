import React from 'react';
import { motion } from 'motion/react';
import { Instagram, Facebook, Twitter, Youtube, Share2 } from 'lucide-react';

const SOCIAL_LINKS = [
  {
    name: 'Instagram',
    icon: Instagram,
    url: 'https://instagram.com/shadystudio',
    color: 'from-pink-500 to-purple-500'
  },
  {
    name: 'Facebook',
    icon: Facebook,
    url: 'https://facebook.com/shadystudio',
    color: 'from-blue-500 to-blue-600'
  },
  {
    name: 'Twitter',
    icon: Twitter,
    url: 'https://twitter.com/shadystudio',
    color: 'from-sky-500 to-blue-500'
  },
  {
    name: 'YouTube',
    icon: Youtube,
    url: 'https://youtube.com/@shadystudio',
    color: 'from-red-500 to-red-600'
  }
];

export function SocialMediaIntegration() {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'شادي حسين - مصور محترف',
          text: 'شاهد أعمال التصوير الاحترافية لشادي حسين',
          url: window.location.href
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#0a0a0f] via-[#0d0d15] to-[#080910] py-12">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            تابعنا على السوشيال ميديا
          </h2>
          <p className="text-gray-400">كن على اطلاع دائم بأحدث أعمالنا وعروضنا</p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {SOCIAL_LINKS.map((social, index) => (
            <motion.a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className={`w-14 h-14 rounded-xl bg-gradient-to-br ${social.color} flex items-center justify-center shadow-lg shadow-${social.color.split('-')[1]}-500/30`}
            >
              <social.icon size={28} className="text-white" />
            </motion.a>
          ))}
        </div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleShare}
          className="mx-auto flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:bg-white/10 hover:text-white transition-all"
        >
          <Share2 size={20} />
          <span>شارك الموقع</span>
        </motion.button>
      </div>
    </div>
  );
}
