import {
  LayoutDashboard,
  Archive,
  Globe,
  Code,
  Camera,
  PanelRightClose,
  PanelRightOpen,
  Menu,
  X,
  BarChart3,
  MessageSquare,
  Send,
  Package,
  Users,
  Calendar,
  CheckSquare,
  Users as CRMIcon,
  CreditCard,
  Mail,
  Shield,
  Database,
  FileText,
  MessageCircle,
  Calendar as EventIcon,
  Share2,
  Cloud,
  MessageSquare as SMSIcon,
  TrendingUp,
  Languages,
  DollarSign,
  Star,
  Settings,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { audioService } from '../../services/audio';

const NAV_ITEMS = [
  // الرئيسية
  { id: 'home', label: 'الرئيسية', icon: LayoutDashboard, path: '/admin', section: 'main' },
  
  // الأقسام الرئيسية
  { id: 'bookings', label: 'الحجوزات', icon: Archive, path: '/admin/bookings', section: 'main' },
  { id: 'galleries', label: 'المعارض', icon: Globe, path: '/admin/galleries', section: 'main' },
  { id: 'users', label: 'المستخدمين', icon: Users, path: '/admin/users', section: 'main' },
  { id: 'developer', label: 'المطور', icon: Code, path: '/admin/developer', section: 'main' },
  { id: 'client-gallery', label: 'معرض العملاء', icon: Camera, path: '/admin/client-gallery', section: 'main' },
  
  // الحجوزات - Sub-items
  { id: 'new-booking', label: 'حجز جديد', icon: Package, path: '/admin/new-booking', section: 'bookings' },
  { id: 'bookings-accounts', label: 'حسابات الحجوزات', icon: Users, path: '/admin/bookings-accounts', section: 'bookings' },
  { id: 'bookings-management', label: 'إدارة الحجوزات', icon: Archive, path: '/admin/bookings-management', section: 'bookings' },
  
  // المعارض - Sub-items
  { id: 'gallery-editor', label: 'محرر المعرض', icon: Globe, path: '/admin/gallery-editor', section: 'galleries' },
  { id: 'public-galleries', label: 'المعارض العامة', icon: Globe, path: '/admin/public-galleries', section: 'galleries' },
  
  // المستخدمين - Sub-items
  { id: 'activity', label: 'سجل النشاط', icon: MessageSquare, path: '/admin/activity', section: 'users' },
  
  // المطور - Sub-items
  { id: 'developer-tools', label: 'أدوات المطور', icon: Code, path: '/admin/developer-tools', section: 'developer' },
  { id: 'developer-management', label: 'إدارة المطور', icon: Code, path: '/admin/developer-management', section: 'developer' },
  { id: 'firebase', label: 'إعدادات Firebase', icon: Code, path: '/admin/firebase', section: 'developer' },
  { id: 'backup', label: 'النسخ الاحتياطي', icon: Database, path: '/admin/backup', section: 'developer' },
  { id: 'editing', label: 'تتبع التعديل', icon: FileText, path: '/admin/editing', section: 'developer' },
  { id: 'ai', label: 'الذكاء الاصطناعي', icon: Code, path: '/admin/ai', section: 'developer' },
  { id: 'whatsapp', label: 'واتساب', icon: MessageSquare, path: '/admin/whatsapp', section: 'developer' },
  { id: 'settings', label: 'الإعدادات', icon: Settings, path: '/admin/settings', section: 'developer' },
];

const SECTION_LABELS = {
  main: 'الرئيسية',
  bookings: 'الحجوزات',
  galleries: 'المعارض',
  users: 'المستخدمين',
  developer: 'المطور',
};

interface NavItem {
  id: string;
  label: string;
  icon: any;
  path: string;
  badge?: boolean;
  beta?: boolean;
  section?: string;
}

interface SidebarProps {
  isOpen: boolean;
  currentView: string;
  onNavigate: (view: string) => void;
  onToggle: () => void;
  currentUser?: any;
}

export default function Sidebar({ isOpen, currentView, onNavigate, onToggle, currentUser }: SidebarProps) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('sidebar-favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (itemId: string) => {
    setFavorites(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  // Filter navigation items based on user role
  const filteredNavItems = NAV_ITEMS.filter(item => {
    if (!currentUser) return true;
    
    // Admin can see everything
    if (currentUser.role === 'admin') return true;
    
    // Editor and Viewer cannot see developer and user-management
    if (currentUser.role === 'editor' || currentUser.role === 'viewer') {
      return item.id !== 'developer' && item.id !== 'user-management';
    }
    
    return true;
  });

  const favoriteItems = filteredNavItems.filter(item => favorites.includes(item.id));

  return (
    <>
      {/* Mobile Hamburger Menu Button */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 right-4 z-[600] p-3 rounded-xl bg-purple-500 text-white shadow-lg hover:bg-purple-600 transition-all"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="lg:hidden fixed inset-0 bg-black/50 z-[400]"
        />
      )}

      <aside
        className={cn(
          'fixed top-0 bottom-0 right-0 z-[500] flex flex-col arabic-ui border-l border-white/10 transition-all duration-500 shadow-[0_0_50px_rgba(0,0,0,0.5)]',
          'bg-gradient-to-b from-[#1e293b]/95 to-[#0f172a]/95 backdrop-blur-[30px] saturate-150',
          // Desktop: Full sidebar when open, collapsed icons when closed
          'lg:translate-x-0 lg:w-[17rem]',
          !isOpen && 'lg:w-[5.25rem]',
          // Mobile & Tablet: Hidden by default, shown as drawer when open
          '-translate-x-full w-[17rem]',
          isOpen && 'translate-x-0'
        )}
        dir="rtl"
      >
      <div className={cn('flex items-center gap-3 p-4 border-b border-white/10', 'lg:justify-start', !isOpen && 'justify-center')}>
        <motion.div
          layout
          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-primary-glow"
          style={{ background: 'var(--gradient-brand)' }}
        >
          <Camera size={20} className="text-white" strokeWidth={1.75} />
        </motion.div>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            className="min-w-0 hidden lg:block"
          >
            <p className="text-sm font-semibold text-text-main leading-tight">شادي حسين</p>
            <p className="text-[11px] text-text-muted">إدارة المصور</p>
          </motion.div>
        )}
      </div>

      <nav className={cn('flex-1 flex flex-col gap-0.5 p-3 overflow-y-auto custom-scrollbar', 'lg:items-start', !isOpen && 'items-center')}>
        {/* Favorites Section */}
        {favoriteItems.length > 0 && (
          <div className="mb-2">
            {isOpen && (
              <div className="px-3 py-2 text-xs font-semibold text-text-muted/60 uppercase tracking-wider flex items-center gap-2">
                <Star size={14} className="text-orange-500" />
                المفضلة
              </div>
            )}
            {favoriteItems.map((item) => {
              const active = currentView === item.id;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => audioService.playClick()}
                  title={item.label}
                  className={cn(
                    'relative flex items-center gap-3 rounded-xl text-sm font-semibold transition-all duration-300 group',
                    'lg:px-3 lg:py-2.5 lg:w-full',
                    !isOpen && 'w-10 h-10 justify-center',
                    active ? 'text-white bg-gradient-to-r from-orange-500/20 to-orange-500/10 border-r-2 border-orange-500' : 'text-text-muted hover:text-white hover:bg-white/[0.05]'
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/20 to-orange-500/10 border-r-2 border-orange-500"
                      style={{ boxShadow: 'inset -10px 0 20px -10px rgba(249, 115, 22, 0.2)' }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon
                    size={19}
                    className={cn('relative z-10 shrink-0', active && 'text-orange-500')}
                    strokeWidth={active ? 2.25 : 1.75}
                  />
                  <span className="relative z-10 flex-1 text-right hidden lg:block">{item.label}</span>
                  {isOpen && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleFavorite(item.id);
                      }}
                      className="relative z-10 hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Star size={14} className={favorites.includes(item.id) ? 'text-orange-500 fill-orange-500' : 'text-gray-400'} />
                    </button>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {/* Main Navigation Sections */}
        {Object.entries(SECTION_LABELS).map(([sectionKey, sectionLabel]) => {
          const sectionItems = filteredNavItems.filter(item => item.section === sectionKey);
          if (sectionItems.length === 0) return null;
          
          return (
            <div key={sectionKey} className="mb-2">
              {isOpen && (
                <div className="px-3 py-2 text-xs font-semibold text-text-muted/60 uppercase tracking-wider">
                  {sectionLabel}
                </div>
              )}
              {sectionItems.map((item) => {
                const active = currentView === item.id;
                const isFavorite = favorites.includes(item.id);
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => audioService.playClick()}
                    title={item.label}
                    className={cn(
                      'relative flex items-center gap-3 rounded-xl text-sm font-semibold transition-all duration-300 group',
                      'lg:px-3 lg:py-2.5 lg:w-full',
                      !isOpen && 'w-10 h-10 justify-center',
                      active ? 'text-white bg-gradient-to-r from-primary/20 to-primary/10 border-r-2 border-primary' : 'text-text-muted hover:text-white hover:bg-white/[0.05]'
                    )}
                  >
                    {active && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-primary/10 border-r-2 border-primary"
                        style={{ boxShadow: 'inset -10px 0 20px -10px rgba(99, 102, 241, 0.2)' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                    <item.icon
                      size={19}
                      className={cn('relative z-10 shrink-0', active && 'text-primary')}
                      strokeWidth={active ? 2.25 : 1.75}
                    />
                    <span className="relative z-10 flex-1 text-right hidden lg:block">{item.label}</span>
                    {isOpen && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleFavorite(item.id);
                        }}
                        className="relative z-10 hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Star size={14} className={isFavorite ? 'text-orange-500 fill-orange-500' : 'text-gray-400'} />
                      </button>
                    )}
                    {(item as NavItem).badge && (
                      <span className="relative z-10 hidden lg:flex items-center justify-center w-6 h-6 rounded-full bg-amber-700 text-white text-xs font-bold">
                        14
                      </span>
                    )}
                    {(item as NavItem).beta && (
                      <span className="relative z-10 hidden lg:flex items-center justify-center px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-xs font-bold">
                        BETA
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className={cn('p-3 border-t border-main', 'lg:flex lg:justify-start', !isOpen && 'flex justify-center')}>
        <button
          onClick={() => {
            audioService.playClick();
            onToggle();
          }}
          className="btn-ghost w-full justify-center hidden lg:flex"
          aria-label={isOpen ? 'طي القائمة' : 'فتح القائمة'}
        >
          {isOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
          {isOpen && <span>طي القائمة</span>}
        </button>
      </div>
    </aside>
    </>
  );
}
