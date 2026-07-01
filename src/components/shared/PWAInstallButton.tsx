import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export default function PWAInstallButton() {
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const promptInstall = usePWAInstall();

  useEffect(() => {
    // Only show on mobile devices
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;

    // Show immediately on mobile if not installed and not dismissed
    if (isMobile && !isStandalone && !isInWebAppiOS && !isDismissed) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isDismissed]);

  const handleInstall = async () => {
    const success = await promptInstall();
    if (success) {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:hidden"
        >
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 shadow-2xl shadow-purple-500/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Smartphone size={24} className="text-white" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-white font-bold text-sm mb-1">استخدمه على هاتفك</h3>
                <p className="text-white/80 text-xs">ثبت التطبيق على هاتفك لتجربة أفضل</p>
              </div>

              <button
                onClick={handleInstall}
                className="px-4 py-2 rounded-xl bg-white text-purple-600 font-bold text-sm hover:bg-white/90 transition-all flex items-center gap-2 flex-shrink-0"
              >
                <Download size={16} />
                <span className="hidden sm:inline">تثبيت</span>
              </button>

              <button
                onClick={handleDismiss}
                className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 hover:bg-white/30 transition-all"
              >
                <X size={16} className="text-white" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
