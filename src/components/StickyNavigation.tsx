import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Camera, Home, Image, Sparkles, FileText, HelpCircle, Phone, Search, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { icon: Home, label: 'الرئيسية', path: '/' },
  { icon: Image, label: 'المعارض', path: '/portfolio' },
  { icon: Sparkles, label: 'الباقات', path: '/packages' },
  { icon: FileText, label: 'المدونة', path: '/blog' },
  { icon: HelpCircle, label: 'الأسئلة', path: '/faq' },
  { icon: Phone, label: 'تواصل', path: '/contact' }
];

const ADMIN_ITEMS = [
  { icon: Image, label: 'إدارة المعارض', path: '/admin/client-gallery' }
];

export function StickyNavigation() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#050508]/90 backdrop-blur-lg border-b border-white/10 shadow-lg'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.button
              onClick={() => navigate('/')}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2"
            >
              <Camera size={32} className="text-purple-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                شادي حسين
              </span>
            </motion.button>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              {NAV_ITEMS.map((item) => (
                <motion.button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <Search size={20} className="text-gray-400" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                {isDarkMode ? <Moon size={20} className="text-gray-400" /> : <Sun size={20} className="text-gray-400" />}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/admin/client-gallery')}
                className="hidden md:block px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white font-semibold hover:from-orange-600 hover:to-amber-600 transition-all"
              >
                إضافة معرض
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="hidden md:block px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                دخول الإدارة
              </motion.button>

              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                {isMobileMenuOpen ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-white/10 bg-[#050508]/95 backdrop-blur-lg"
            >
              <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="relative">
                  <Search size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ابحث في الموقع..."
                    className="w-full pr-10 pl-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/30"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-50 bg-[#050508] md:hidden"
          >
            <div className="flex flex-col h-full p-6">
              <div className="flex items-center justify-between mb-8">
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  القائمة
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg bg-white/5 border border-white/10"
                >
                  <X size={24} className="text-white" />
                </button>
              </div>

              <nav className="flex-1 space-y-4">
                {NAV_ITEMS.map((item) => (
                  <motion.button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    whileHover={{ scale: 1.02, x: -5 }}
                    className="w-full flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl text-right hover:bg-white/10 transition-colors"
                  >
                    <item.icon size={24} className="text-purple-400" />
                    <span className="text-lg text-white">{item.label}</span>
                  </motion.button>
                ))}
              </nav>

              <div className="mt-8 space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    navigate('/admin/client-gallery');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white font-semibold"
                >
                  إضافة معرض
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    navigate('/login');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-semibold"
                >
                  دخول الإدارة
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
