import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  Upload, 
  Users, 
  Calendar, 
  Wallet,
  Settings, 
  LogOut,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
  isAdmin?: boolean;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  path: string;
  section?: string;
}

const adminNavItems: NavItem[] = [
  { id: 'main-dashboard', label: 'الرئيسية', icon: LayoutDashboard, path: '/admin/dashboard', section: 'admin' },
  { id: 'bookings', label: 'المواعيد', icon: Calendar, path: '/admin/bookings', section: 'admin' },
  { id: 'finance', label: 'الحسابات', icon: Wallet, path: '/admin/finance', section: 'admin' },
  { id: 'clients', label: 'العملاء', icon: Users, path: '/admin/clients', section: 'admin' },
];

const pixelsNavItems: NavItem[] = [
  { id: 'pixels-dashboard', label: 'لوحة PIXELS', icon: LayoutDashboard, path: '/pixels/dashboard', section: 'pixels' },
  { id: 'galleries', label: 'المعارض', icon: ImageIcon, path: '/pixels/galleries', section: 'pixels' },
  { id: 'upload', label: 'رفع الصور', icon: Upload, path: '/pixels/galleries/upload', section: 'pixels' },
  { id: 'delivery', label: 'التسليمات', icon: Users, path: '/pixels/delivery', section: 'pixels' },
];

export default function Sidebar({ isOpen = true, onToggle, className = '', isAdmin = false }: SidebarProps) {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = React.useState('main-dashboard');
  
  const navItems = isAdmin ? adminNavItems : pixelsNavItems;

  const handleNavigate = (item: NavItem) => {
    setActiveItem(item.id);
    navigate(item.path);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/unified-login');
  };

  return (
    <motion.aside
      initial={{ width: isOpen ? 280 : 80 }}
      animate={{ width: isOpen ? 280 : 80 }}
      transition={{ duration: 0.3 }}
      className={`fixed left-0 top-0 h-full bg-[#0a0a0f] border-r border-[#5D3A34]/20 z-40 ${className}`}
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-6 w-6 h-6 bg-[#D4AF37] rounded-full flex items-center justify-center shadow-lg z-50"
      >
        {isOpen ? <ChevronLeft size={14} className="text-white" /> : <ChevronRight size={14} className="text-white" />}
      </button>

      {/* Logo */}
      <div className="p-6 border-b border-[#5D3A34]/20">
        <div className="flex items-center gap-3">
          <img
            src="/assets/logos/logo-white.png"
            alt="Logo"
            className="w-10 h-10 object-contain"
          />
          {isOpen && (
            <span className="text-white font-bold text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
              PIXELS
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleNavigate(item)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeItem === item.id
                ? 'bg-gradient-to-r from-[#5D3A34] to-[#8B5A2B] text-white shadow-lg shadow-[#5D3A34]/30'
                : 'text-gray-400 hover:bg-[#5D3A34]/10 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            {isOpen && <span className="font-semibold">{item.label}</span>}
          </motion.button>
        ))}
      </nav>

      {/* Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#5D3A34]/20">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={20} />
          {isOpen && <span className="font-semibold">تسجيل الخروج</span>}
        </motion.button>
      </div>
    </motion.aside>
  );
}
