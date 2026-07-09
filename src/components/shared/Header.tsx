import React from 'react';
import { motion } from 'framer-motion';
import { Menu, X, User } from 'lucide-react';

interface HeaderProps {
  logo?: string;
  showNavigation?: boolean;
  showLoginButton?: boolean;
  navigationItems?: Array<{ id: string; label: string }>;
  onNavigate?: (sectionId: string) => void;
  onLogin?: () => void;
  className?: string;
}

export default function Header({
  logo = '/assets/logos/logo-white.png',
  showNavigation = true,
  showLoginButton = true,
  navigationItems = [
    { id: 'hero', label: 'الرئيسية' },
    { id: 'services', label: 'الخدمات' },
    { id: 'portfolio', label: 'الأعمال' },
    { id: 'about', label: 'عني' },
    { id: 'contact', label: 'تواصل' }
  ],
  onNavigate,
  onLogin,
  className = ''
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleNavigate = (sectionId: string) => {
    if (onNavigate) {
      onNavigate(sectionId);
    }
    setIsMenuOpen(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-[#050508]/80 backdrop-blur-xl border-b border-[#5D3A34]/10 ${className}`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <img
              src={logo}
              alt="شادي حسين"
              className="w-12 h-12 object-contain"
            />
          </motion.div>

          {/* Desktop Navigation */}
          {showNavigation && (
            <nav className="hidden lg:flex items-center gap-8">
              {navigationItems.map((item) => (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNavigate(item.id)}
                  className="text-sm font-semibold text-gray-400 hover:text-white transition-all"
                >
                  {item.label}
                </motion.button>
              ))}
            </nav>
          )}

          {/* Login Button */}
          {showLoginButton && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLogin}
              className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-[#5D3A34] to-[#8B5A2B] text-white px-6 py-3 rounded-full font-semibold shadow-lg shadow-[#5D3A34]/30 hover:shadow-[#D4AF37]/30 transition-all"
            >
              <User size={18} />
              دخول
            </motion.button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-white"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden bg-[#050508]/95 backdrop-blur-xl border-t border-[#5D3A34]/20 p-6"
          >
            <div className="flex flex-col gap-4">
              {showNavigation && navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className="text-right text-gray-300 hover:text-[#D4AF37] transition-colors py-2"
                >
                  {item.label}
                </button>
              ))}
              {showLoginButton && (
                <>
                  <div className="h-px bg-[#5D3A34]/30 my-2" />
                  <button
                    onClick={() => {
                      if (onLogin) onLogin();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#5D3A34] to-[#8B5A2B] text-white px-6 py-3 rounded-full font-semibold"
                  >
                    <User size={18} />
                    دخول
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
}
