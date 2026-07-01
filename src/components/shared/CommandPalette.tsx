import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Command, X, Calendar, Users, Calculator, Package, Settings, ArrowRight, Wallet, Film, User, Phone, Banknote, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, toArabicDigits } from '../../lib/utils';
import { storage } from '../../services/storage';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
}

const STATIC_COMMANDS = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: Calculator, category: 'نظام' },
  { id: 'new-booking', label: 'إضافة حجز جديد', icon: ArrowRight, category: 'إجراءات' },
  { id: 'booking-records', label: 'سجل الحجوزات', icon: Calendar, category: 'نظام' },
  { id: 'editing-tracker', label: 'مراقب الإيديت', icon: Clock, category: 'نظام' },
  { id: 'packages', label: 'الباقات والأسعار', icon: Package, category: 'نظام' },
  { id: 'accounts', label: 'الحسابات والمالية', icon: Wallet, category: 'نظام' },
  { id: 'smart-sync', label: 'المزامنة السحابية', icon: Film, category: 'نظام' },
  { id: 'settings', label: 'الإعدادات', icon: Settings, category: 'نظام' },
];

export default function CommandPalette({ isOpen, onClose, onNavigate }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const searchResults = useMemo(() => {
    if (!search.trim()) return STATIC_COMMANDS.map(cmd => ({ ...cmd, type: 'command' }));

    const query = search.toLowerCase();
    const results: any[] = [];

    // 1. Static Commands
    STATIC_COMMANDS.forEach(cmd => {
      if (cmd.label.toLowerCase().includes(query)) {
        results.push({ ...cmd, type: 'command' });
      }
    });

    // 2. Bookings
    const bookings = storage.getAllBookings();
    bookings.forEach(b => {
      if (b.clientName.toLowerCase().includes(query) || (b.phone && b.phone.includes(query))) {
        results.push({
          id: b.id,
          label: b.clientName,
          subLabel: `حجز ${b.packageName} - ${b.date}`,
          icon: Calendar,
          category: 'حجوزات',
          type: 'booking',
          data: b
        });
      }
    });

    // 3. Customers
    const customers = storage.getCustomers();
    customers.forEach(c => {
      if (c.name.toLowerCase().includes(query) || (c.phone && c.phone.includes(query))) {
        // Only add if not already in results as a booking (to avoid duplicates if name is same)
        if (!results.find(r => r.type === 'booking' && r.label === c.name)) {
          results.push({
            id: c.id,
            label: c.name,
            subLabel: `عميل - ${c.phone}`,
            icon: User,
            category: 'عملاء',
            type: 'customer',
            data: c
          });
        }
      }
    });

    return results.slice(0, 10); // Limit to 10 results
  }, [search]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleSelect = (item: any) => {
    if (item.type === 'command') {
      onNavigate(item.id);
    } else if (item.type === 'booking') {
      localStorage.setItem('booking_search_query', item.label);
      onNavigate('booking-records');
    } else if (item.type === 'customer') {
      localStorage.setItem('booking_search_query', item.label);
      onNavigate('booking-records');
    }
    onClose();
    setSearch('');
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % searchResults.length);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + searchResults.length) % searchResults.length);
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        handleSelect(searchResults[selectedIndex]);
      }
    }
  }, [searchResults, selectedIndex, onNavigate, onClose]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4 font-sans" dir="rtl">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            className="w-full max-w-2xl modal-panel overflow-hidden relative z-10 shadow-premium"
          >
            <div className="p-5 border-b border-main flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-primary/25 bg-primary/10 text-primary">
                <Search className="w-5 h-5" />
              </div>
              <input 
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث عن عميل، حجز، أو صفحة..."
                className="flex-1 bg-transparent border-none text-lg font-semibold text-text-main focus:outline-none placeholder:text-text-muted"
              />
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-panel border border-main text-xs text-text-muted">
                <Command className="w-3 h-3 text-primary" /> ESC
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-6 no-scrollbar">
              {searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((item, i) => (
                    <button
                      key={`${item.type}-${item.id}`}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(i)}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-xl transition-all group",
                        selectedIndex === i ? "bg-primary/10 border border-primary/20" : "hover:bg-panel border border-transparent"
                      )}
                    >
                      <div className="flex items-center gap-5 relative z-10">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500",
                          selectedIndex === i ? "bg-primary/15 border-primary/25 text-primary" : "bg-panel border-main text-text-muted"
                        )}>
                          <item.icon className="w-5 h-5" />
                        </div>
                        <div className="text-right">
                          <span className={cn("block text-base font-semibold", selectedIndex === i ? "text-text-main" : "text-text-muted")}>{item.label}</span>
                          {item.subLabel ? (
                            <span className="block text-xs text-text-muted mt-0.5">{item.subLabel}</span>
                          ) : (
                            <span className="block text-xs text-primary mt-0.5">انتقال</span>
                          )}
                        </div>
                      </div>
                        <div className="flex items-center gap-4 relative z-10">
                        <span className="px-2 py-1 rounded-md bg-panel text-xs text-text-muted border border-main">{item.category}</span>
                        {selectedIndex === i && (
                          <motion.div layoutId="arrow" initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                            <ArrowRight className="w-5 h-5 text-primary" />
                          </motion.div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center flex flex-col items-center gap-4">
                  <Search className="w-12 h-12 text-text-muted opacity-40" />
                  <p className="text-lg font-semibold text-text-main">لا توجد نتائج</p>
                  <p className="text-sm text-text-muted">جرّب كلمات بحث أخرى</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-panel border-t border-main flex items-center justify-between text-xs text-text-muted">
              <div className="flex gap-6">
                <span>↵ اختيار</span>
                <span>↑↓ تنقل</span>
              </div>
              <span className="text-primary/80">مصور شادي حسين</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
