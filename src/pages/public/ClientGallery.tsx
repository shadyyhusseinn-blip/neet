import { motion } from 'motion/react';
import { Image as ImageIcon, Download, Heart, Share2 } from 'lucide-react';

export default function ClientGallery() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-4">معرض الصور</h1>
          <p className="text-xl text-gray-300">استعرض صورك المفضلة</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="relative group rounded-2xl overflow-hidden aspect-square bg-gradient-to-br from-pink-500 to-purple-500"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon size={48} className="text-white/50" />
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors">
                  <Download size={20} />
                </button>
                <button className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors">
                  <Heart size={20} />
                </button>
                <button className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors">
                  <Share2 size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

const photos = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  title: `صورة ${i + 1}`
}));
