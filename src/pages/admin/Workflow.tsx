import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock, Camera, Scissors, CheckCircle, Truck, Search,
  Filter, Calendar, AlertTriangle, ArrowRight, ChevronRight,
  Layout, Sparkles, User, Package as PackageIcon, ArrowLeft,
  Activity, Zap, Target, Box, Database, Terminal, TrendingUp,
  BarChart3, PieChart, CalendarDays, Filter as FilterIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from '../../services/storage';
import { Booking, WorkflowStatus } from '../../types';
import { cn, formatArabicDate, toArabicDigits, ARABIC_MONTHS } from '../../lib/utils';
import { audioService } from '../../services/audio';

// --- المصور PIPELINE THEME ---
const GLASS_PIPELINE = "card-panel";

const WORKFLOW_STATUSES: Record<WorkflowStatus, { label: string, color: string, icon: any, description: string }> = {
  pending: { label: 'طابور الانتظار', color: 'text-slate-400 border-slate-500/20 bg-slate-500/5', icon: Clock, description: 'حجوزات لم يبدأ العمل عليها بعد' },
  shooting: { label: 'قيد التصوير', color: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5', icon: Camera, description: 'جلسات تصوير جارية حالياً' },
  editing: { label: 'قيد المعالجة', color: 'text-fuchsia-400 border-fuchsia-500/20 bg-fuchsia-500/5', icon: Scissors, description: 'الصور في مرحلة الإيديت والريتش' },
  ready: { label: 'جاهز للتسليم', color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5', icon: CheckCircle, description: 'تم الانتهاء وجاهز لاستلام العميل' },
  delivered: { label: 'تم التسليم', color: 'text-primary border-primary/20 bg-primary/5', icon: Truck, description: 'تم تسليم الشغل للعميل بنجاح' },
};

interface WorkflowProps {
  bookings: Booking[];
  onUpdateStatus: (id: string, newStatus: WorkflowStatus) => void;
}

export default function Workflow({ bookings, onUpdateStatus }: WorkflowProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const years = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    return [2024, 2025, 2026, 2027].filter(y => y <= currentYear);
  }, []);

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      const matchesYear = bookingDate.getFullYear() === selectedYear;
      const matchesMonth = selectedMonth === 'all' || bookingDate.getMonth() === parseInt(selectedMonth, 10);
      const matchesSearch = searchTerm.trim() === '' ||
        booking.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.phone?.includes(searchTerm);
      return matchesYear && matchesMonth && matchesSearch;
    });
  }, [bookings, selectedYear, selectedMonth, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const updateStatus = (id: string, newStatus: WorkflowStatus) => {
    audioService.playClick();
    onUpdateStatus(id, newStatus);
  };

  const getStatusCount = (status: WorkflowStatus) =>
    filteredBookings.filter(b => (b.workflowStatus || 'pending') === status).length;

  const stats = useMemo(() => {
    const total = filteredBookings.length;
    const delivered = filteredBookings.filter(b => b.workflowStatus === 'delivered').length;
    const inProgress = filteredBookings.filter(b => b.workflowStatus && b.workflowStatus !== 'delivered' && b.workflowStatus !== 'pending').length;
    const pending = filteredBookings.filter(b => !b.workflowStatus || b.workflowStatus === 'pending').length;
    const completionRate = total > 0 ? Math.round((delivered / total) * 100) : 0;

    return { total, delivered, inProgress, pending, completionRate };
  }, [filteredBookings]);

  if (isLoading) {
    return (
      <div className="space-y-12 animate-pulse">
        <div className="h-24 bg-white/[0.04] rounded-xl w-full" />
        <div className="grid grid-cols-5 gap-8 h-[600px]">
          {[1,2,3,4,5].map(i => <div key={i} className="bg-white/[0.04] rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative space-y-16 pb-20 font-sans" dir="rtl"
    >
      {/* HEADER HUD */}
      <header className="flex flex-col gap-8 border-b border-main pb-12">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
          <div className="flex items-center gap-10">
             <div className="relative group">
                <div className="absolute -inset-2 bg-primary/20 rounded-xl blur-2xl opacity-40"></div>
                <div className="relative w-28 h-28 rounded-xl bg-surface/50 border border-main flex items-center justify-center text-primary shadow-premium transition-transform duration-700 group-hover:scale-110">
                   <Terminal size={48} strokeWidth={1} className="relative z-10" />
                </div>
             </div>
             <div>
                <h1 className="text-3xl font-display font-semibold">سير <span className="text-primary not-italic font-sans">العمل</span></h1>
                <div className="flex items-center gap-6">
                   <div className="flex items-center gap-3 px-4 py-1.5 rounded-2xl bg-primary/5 border border-primary/20 shadow-primary-glow">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">المصور Pipeline Engine v4.2</span>
                   </div>
                   <span className="text-xs font-black text-text-muted uppercase tracking-[0.2em] italic opacity-40">Real-time Production Monitoring</span>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full xl:w-auto">
            {(Object.entries(WORKFLOW_STATUSES) as [WorkflowStatus, any][]).map(([status, info]) => (
              <div key={status} className={cn("p-4 rounded-xl border transition-all shadow-premium min-w-[140px] flex flex-col items-center gap-2", info.color)}>
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shadow-xl"><info.icon size={20}/></div>
                <div className="text-center">
                   <div className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">{info.label}</div>
                   <div className="text-2xl font-black tabular-nums tracking-tighter leading-none">{toArabicDigits(getStatusCount(status))}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 text-text-muted">
            <FilterIcon size={16} />
            <span className="text-xs font-medium">السنة</span>
          </div>
          <div className="flex gap-2">
            {years.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={cn('filter-chip', selectedYear === year && 'filter-chip-active')}
              >
                {toArabicDigits(year.toString())}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-text-muted">
            <CalendarDays size={16} />
            <span className="text-xs font-medium">الشهر</span>
          </div>
          <button
            onClick={() => setSelectedMonth('all')}
            className={cn('filter-chip w-full', selectedMonth === 'all' && 'filter-chip-active')}
          >
            جميع الشهور
          </button>
          <div className="grid grid-cols-3 gap-2">
            {ARABIC_MONTHS.map((month, index) => (
              <button
                key={month}
                onClick={() => setSelectedMonth(index.toString())}
                className={cn('filter-chip text-[10px]', selectedMonth === index.toString() && 'filter-chip-active')}
              >
                {toArabicDigits((index + 1).toString())}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-text-muted mr-auto">
            <Search size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث..."
              className="bg-transparent text-sm outline-none placeholder:text-text-muted w-40"
            />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-main bg-white/4">
            <div className="text-xs text-text-muted mb-1">إجمالي الحجوزات</div>
            <div className="text-2xl font-bold text-text-main">{toArabicDigits(stats.total)}</div>
          </div>
          <div className="p-4 rounded-xl border border-main bg-white/4">
            <div className="text-xs text-text-muted mb-1">قيد التنفيذ</div>
            <div className="text-2xl font-bold text-primary">{toArabicDigits(stats.inProgress)}</div>
          </div>
          <div className="p-4 rounded-xl border border-main bg-white/4">
            <div className="text-xs text-text-muted mb-1">تم التسليم</div>
            <div className="text-2xl font-bold text-success">{toArabicDigits(stats.delivered)}</div>
          </div>
          <div className="p-4 rounded-xl border border-main bg-white/4">
            <div className="text-xs text-text-muted mb-1">نسبة الإنجاز</div>
            <div className="text-2xl font-bold text-primary">{toArabicDigits(stats.completionRate)}%</div>
          </div>
        </div>
      </header>

      {/* STRATEGIC PIPELINE PHASES */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-[calc(100vh-450px)] min-h-[600px]">
        {(Object.entries(WORKFLOW_STATUSES) as [WorkflowStatus, any][]).map(([status, info]) => (
          <div key={status} className="flex flex-col gap-6 h-full">
            <div className="flex items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <div className={cn("w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]", info.color.split(' ')[1])} />
                <span className="text-sm font-black uppercase tracking-[0.3em] text-text-muted italic">{info.label}</span>
              </div>
              <div className="px-4 py-1.5 rounded-xl bg-white/[0.04] border border-main text-xs font-black tabular-nums text-primary">{toArabicDigits(getStatusCount(status))}</div>
            </div>
            
            <div className={cn("flex-1 p-6 rounded-xl space-y-6 overflow-y-auto custom-scrollbar relative", GLASS_PIPELINE)}>
              <div className="absolute top-0 right-0 w-full h-32 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
              
              <AnimatePresence mode="popLayout">
                {filteredBookings
                  .filter(b => (b.workflowStatus || 'pending') === status)
                  .map((booking, idx) => {
                    const isLate = new Date(booking.deliveryDate) < new Date() && booking.workflowStatus !== 'delivered';
                    
                    return (
                      <motion.div 
                        key={booking.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: idx * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className={cn(
                          "p-8 rounded-xl border border-main bg-white/[0.04] transition-all duration-500 cursor-pointer group relative hover:scale-[1.03] hover:border-primary/20",
                          isLate && "border-rose-500/30 bg-rose-500/5"
                        )}
                      >
                        {isLate && (
                          <div className="absolute -top-3 -right-3 bg-rose-500 text-text-main p-2 rounded-2xl shadow-premium animate-pulse z-10">
                            <AlertTriangle size={16} />
                          </div>
                        )}
                        
                        <div className="space-y-6">
                          <div className="flex items-start gap-5">
                            <div className="w-14 h-14 bg-surface/50 rounded-2xl flex items-center justify-center border border-main group-hover:bg-primary group-hover:text-text-inverse transition-all duration-700 shadow-xl">
                              <User size={24} strokeWidth={1.5} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-2xl font-black mb-1 group-hover:text-primary transition-colors truncate tracking-tighter font-display leading-none">{booking.clientName}</div>
                              <div className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest opacity-40">
                                <PackageIcon size={12} />
                                <span className="truncate">{booking.packageName || 'STUDIO MASTER'}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-6 border-t border-main">
                            <div className="flex flex-col">
                               <span className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1 opacity-30 italic">Delivery Target</span>
                               <span className={cn("text-xl font-black tabular-nums tracking-tighter italic", isLate ? "text-rose-500" : "text-text-main")}>
                                 {formatArabicDate(booking.deliveryDate)}
                               </span>
                            </div>
                            
                            {status !== 'delivered' && (
                              <button 
                                onClick={() => {
                                  const stages: WorkflowStatus[] = ['pending', 'shooting', 'editing', 'ready', 'delivered'];
                                  const nextIdx = stages.indexOf(status) + 1;
                                  if (nextIdx < stages.length) updateStatus(booking.id, stages[nextIdx]);
                                }}
                                className="w-14 h-14 bg-primary hover:bg-primary/90 text-text-inverse rounded-2xl flex items-center justify-center transition-all shadow-primary-glow group/btn"
                              >
                                <ArrowLeft size={24} className="group-hover:-translate-x-2 transition-transform" />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
              </AnimatePresence>
              
              {getStatusCount(status) === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-text-muted opacity-10 space-y-6 min-h-[200px]">
                  <Box size={64} strokeWidth={0.5} />
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] italic">Empty Phase</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
