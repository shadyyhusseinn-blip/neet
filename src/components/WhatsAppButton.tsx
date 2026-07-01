import React from 'react';
import { MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
}

export function WhatsAppButton({ 
  phoneNumber = '201000000000', 
  message = 'مرحباً، أريد الاستفسار عن خدمات التصوير' 
}: WhatsAppButtonProps) {
  const handleClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      className="fixed bottom-24 right-4 z-50 w-14 h-14 bg-green-500 rounded-full shadow-lg shadow-green-500/30 flex items-center justify-center hover:bg-green-600 transition-colors"
      aria-label="تواصل عبر واتساب"
    >
      <MessageCircle size={28} className="text-white" />
    </motion.button>
  );
}
