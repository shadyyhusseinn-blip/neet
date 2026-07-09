import React from 'react';
import { Camera, Image, Star, MessageCircle, Lock, Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { colors } from '../../theme/colors';

interface NavItem {
  icon: any;
  label: string;
  path: string;
  system: 'public' | 'gallery' | 'admin';
}

const navItems: NavItem[] = [
  { icon: Camera, label: 'الرئيسية', path: '/', system: 'public' },
  { icon: Image, label: 'المعرض', path: '/gallery', system: 'gallery' },
  { icon: Star, label: 'الباقات', path: '/packages', system: 'public' },
  { icon: MessageCircle, label: 'تواصل', path: '/contact', system: 'public' },
  { icon: Lock, label: 'أدمن', path: '/login', system: 'admin' },
];

interface UnifiedNavbarProps {
  currentSystem?: 'public' | 'gallery' | 'admin';
}

export default function UnifiedNavbar({ currentSystem = 'public' }: UnifiedNavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const getSystemColor = (system: string) => {
    switch (system) {
      case 'gallery':
        return colors.accent[500];
      case 'admin':
        return colors.neutral[500];
      default:
        return colors.primary[500];
    }
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:flex items-center justify-between px-6 py-4 max-w-7xl mx-auto border-b border-white/10">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ 
              background: currentSystem === 'gallery' ? colors.gradient.secondary : colors.gradient.primary 
            }}
          >
            <Camera size={20} className="text-white" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">شادي حسين</p>
            <p 
              className="text-xs"
              style={{ color: currentSystem === 'gallery' ? colors.accent[400] : colors.primary[400] }}
            >
              استوديو التصوير
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isActive(item.path)
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              style={{
                background: isActive(item.path) 
                  ? currentSystem === 'gallery' 
                    ? `linear-gradient(135deg, ${colors.accent[600]} 0%, ${colors.primary[600]} 100%)`
                    : colors.gradient.primary
                  : 'transparent',
              }}
              aria-label={item.label}
            >
              <item.icon size={18} />
              <span className="text-sm font-semibold">{item.label}</span>
            </button>
          ))}
        </nav>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ 
              background: currentSystem === 'gallery' ? colors.gradient.secondary : colors.gradient.primary 
            }}
          >
            <Camera size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">شادي حسين</p>
            <p className="text-[10px] text-gray-400">استوديو التصوير</p>
          </div>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
          aria-label="القائمة"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-white/10 overflow-hidden"
          >
            <nav className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive(item.path)
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                  style={{
                    background: isActive(item.path)
                      ? currentSystem === 'gallery'
                        ? `linear-gradient(135deg, ${colors.accent[600]} 0%, ${colors.primary[600]} 100%)`
                        : colors.gradient.primary
                      : 'transparent',
                  }}
                  aria-label={item.label}
                >
                  <item.icon size={18} />
                  <span className="text-sm font-semibold">{item.label}</span>
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
