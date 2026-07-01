import React, { useState, useEffect, useMemo } from 'react';
import {
  Tag,
  Sparkles,
  Package as PackageIcon,
  RefreshCw,
  TrendingUp,
  Star,
  Zap,
  BarChart3,
  Crown,
  Target,
  Award,
  Search,
  Filter,
  ArrowUpRight,
  Gem,
  Layout,
  Layers,
  PieChart,
  Megaphone,
  Percent
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, toArabicDigits } from '../../lib/utils';
import { audioService } from '../../services/audio';
import Packages from './Packages';
import { storage } from '../../services/storage';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function PricesAndOffers({ initialTab = 'packages', setTab }: { initialTab?: 'packages', setTab?: (tab: 'packages') => void }) {
  const [activeTab, setActiveTab] = useState<'packages'>(initialTab as 'packages');
  const [stats, setStats] = useState({
    totalPackages: 0,
    activeOffers: 0,
    avgPrice: 0,
    totalRevenue: 0,
    topPackage: { name: '-', price: 0 },
    monthlyRevenue: 0,
    bookingsCount: 0,
    potentialProfit: 0
  });

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const loadStats = () => {
      const packages = storage.getPackages();
      const offers = storage.getOffers();
      const bookings = storage.getBookings();
      
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const monthlyBookings = bookings.filter(b => {
        const bookingDate = new Date(b.date);
        return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
      });
      
      const monthlyRevenue = monthlyBookings.reduce((sum, b) => sum + b.totalPrice, 0);
      const sortedPackages = [...packages].sort((a, b) => b.price - a.price);
      const topPackage = sortedPackages.length > 0 ? { name: sortedPackages[0].name, price: sortedPackages[0].price } : { name: '-', price: 0 };
      
      setStats({
        totalPackages: packages.filter(p => p.isActive !== false).length,
        activeOffers: offers.filter(o => o.isActive !== false).length,
        avgPrice: packages.length > 0 ? Math.round(packages.reduce((sum, p) => sum + p.price, 0) / packages.length) : 0,
        totalRevenue: bookings.reduce((sum, b) => sum + b.totalPrice, 0),
        topPackage,
        monthlyRevenue,
        bookingsCount: bookings.length,
        potentialProfit: packages.reduce((sum, p) => sum + (p.profit || 0), 0)
      });
    };

    loadStats();
    const unsubscribe = storage.subscribeToAll(loadStats);
    return unsubscribe;
  }, []);

  const handleTabChange = (tab: 'packages') => {
    audioService.playClick();
    setActiveTab(tab);
    if (setTab) setTab(tab);
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-12 pb-20 text-right"
    >
      {/* === CINEMATIC HERO SECTION === */}
      <motion.div variants={item} className="relative overflow-hidden rounded-xl p-12 border border-main bg-white/[0.01]">
         <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
         <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent/5 blur-[120px] rounded-full pointer-events-none" />
         
         <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-12">
            <div className="max-w-xl space-y-6">
               <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                  <Star className="w-4 h-4 text-primary animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Price Intelligence Dashboard</span>
               </div>
               <h1 className="text-5xl font-black tracking-tighter text-text-primary leading-tight">
                  كتالوج <span className="text-primary italic">الأسعار</span> <br />
                  والعروض الاستراتيجية
               </h1>
               <p className="text-lg text-text-muted font-bold opacity-60 leading-relaxed">
                  نظام ذكي لإدارة تسعير الخدمات وتتبع هوامش الربح وإطلاق حملات تسويقية حصرية تزيد من جاذبية عروضك.
               </p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
               <div className="bg-glass border border-main p-8 rounded-3xl backdrop-blur-xl hover:border-primary/30 transition-all group">
                  <div className="flex items-center gap-3 mb-4 text-primary">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100">Monthly Yield</span>
                  </div>
                  <div className="text-4xl font-black text-text-primary font-display">{toArabicDigits(stats.monthlyRevenue.toLocaleString())}</div>
                  <div className="text-[10px] text-text-muted font-bold mt-2 opacity-40 uppercase tracking-widest">Egyptian Pounds</div>
               </div>
               <div className="bg-glass border border-main p-8 rounded-3xl backdrop-blur-xl hover:border-accent/30 transition-all group">
                  <div className="flex items-center gap-3 mb-4 text-accent">
                    <Zap className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100">Active Campaign</span>
                  </div>
                  <div className="text-4xl font-black text-text-primary font-display">{toArabicDigits(stats.activeOffers.toString())}</div>
                  <div className="text-[10px] text-text-muted font-bold mt-2 opacity-40 uppercase tracking-widest">Verified Offers</div>
               </div>
            </div>
         </div>
      </motion.div>

      {/* === NAVIGATION & ANALYTICS BAR === */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Sidebar Nav */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-black/20 border border-main p-2 rounded-xl backdrop-blur-xl">
            {[
              { id: 'packages', label: 'كتالوج الباكدجات', icon: PackageIcon, desc: 'الخدمات والأسعار', color: 'text-primary' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as 'packages')}
                className={cn(
                  "w-full flex items-center gap-4 px-6 py-5 rounded-[2rem] transition-all relative group overflow-hidden",
                  activeTab === tab.id
                    ? "bg-white/[0.04] shadow-premium"
                    : "text-text-muted hover:text-text-primary hover:bg-glass"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                  activeTab === tab.id ? "bg-primary text-text-main shadow-lg shadow-primary/20 scale-110" : "bg-glass text-text-muted group-hover:text-text-primary"
                )}>
                  <tab.icon className="w-6 h-6" />
                </div>
                <div className="text-right flex-1">
                  <div className={cn("text-base font-black tracking-tight", activeTab === tab.id ? "text-text-primary" : "text-text-muted")}>{tab.label}</div>
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">{tab.desc}</div>
                </div>
                {activeTab === tab.id && (
                  <motion.div layoutId="activeTabGlow" className="absolute left-4 w-1 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" />
                )}
              </button>
            ))}
          </div>

          {/* Quick Insights Card */}
          <div className="premium-card p-8 border-main space-y-6 bg-gradient-to-br from-primary/10 to-transparent">
             <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h4 className="text-xs font-black uppercase tracking-widest text-text-primary">إحصائيات سريعة</h4>
             </div>
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-black text-text-muted opacity-40">متوسط سعر الباقة</span>
                   <span className="text-sm font-black text-text-primary font-display">{toArabicDigits(stats.avgPrice.toLocaleString())} ج.م</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-black text-text-muted opacity-40">إجمالي الحجوزات</span>
                   <span className="text-sm font-black text-text-primary font-display">{toArabicDigits(stats.bookingsCount.toString())}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-black text-text-muted opacity-40">أعلى باقة مبيعاً</span>
                   <span className="text-sm font-black text-primary truncate max-w-[120px]">{stats.topPackage.name}</span>
                </div>
             </div>
             <div className="pt-6 border-t border-main">
                <div className="h-1 bg-glass rounded-full overflow-hidden">
                   <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} className="h-full bg-primary" />
                </div>
                <p className="text-[9px] font-black text-text-muted opacity-40 mt-3 text-center uppercase tracking-widest">Performance optimized</p>
             </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-9 min-h-[700px] relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 20 }}
              transition={{ duration: 0.4, ease: "circOut" }}
              className="w-full"
            >
              {activeTab === 'packages' && <Packages />}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </motion.div>
  );
}
