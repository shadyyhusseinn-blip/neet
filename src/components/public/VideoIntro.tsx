import React, { useState } from 'react';
import { Play, X, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

interface VideoIntroProps {
  videoUrl?: string;
  thumbnail?: string;
  title?: string;
  description?: string;
}

export default function VideoIntro({
  videoUrl = '',
  thumbnail = '',
  title = 'اكتشف عالمنا',
  description = 'شاهد الفيديو التعريفي عن استوديو التصوير الخاص بنا'
}: VideoIntroProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handleClose = () => {
    setIsPlaying(false);
  };

  return (
    <section className="py-20 lg:py-32 bg-neutral-900/50">
      <div className="max-w-7xl mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            {title}
          </h2>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
            {description}
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl">
          {!isPlaying ? (
            <>
              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt="Video Thumbnail"
                  className="w-full h-[400px] md:h-[500px] object-cover"
                />
              ) : (
                <div className="w-full h-[400px] md:h-[500px] bg-gradient-to-br from-purple-900/50 to-blue-900/50 flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-20 h-20 text-white/50 mx-auto mb-4" />
                    <p className="text-white/50">فيديو تعريفي</p>
                  </div>
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePlay}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-all"
                >
                  <Play className="w-10 h-10 md:w-12 md:h-12 text-purple-600 ml-1" />
                </motion.button>
              </div>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              
              {videoUrl ? (
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  className="w-full h-[400px] md:h-[500px] object-cover"
                />
              ) : (
                <div className="w-full h-[400px] md:h-[500px] bg-neutral-900 flex items-center justify-center">
                  <p className="text-white/50">فيديو غير متوفر حالياً</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
