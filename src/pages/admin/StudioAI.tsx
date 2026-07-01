import React, { useState, useEffect } from 'react';
import { 
  Cpu, Sparkles, Brain, Zap, Target, TrendingUp, TrendingDown,
  ShieldCheck, AlertCircle, CheckCircle, BarChart3, LineChart,
  PieChart, Activity, Layers, Box, Crown, Star, Flame, Award,
  Camera, Film, User, Search, RefreshCcw, Maximize2, MessageSquare,
  ArrowUpRight, ArrowDownRight, Globe, Gem, Database, Info,
  SearchCode, FileSearch, Fingerprint, ChevronRight, ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from '../../services/storage';
import { audioService } from '../../services/audio';
import { cn, toArabicDigits } from '../../lib/utils';

// --- المصور AI THEME ---
const GLASS_MODULE = "card-panel";

export default function StudioAI() {
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    generateReport();
  }, []);

  const generateReport = () => {
    setAnalyzing(true);
    audioService.playClick();
    
    // Neural Core Simulation Delay
    setTimeout(() => {
      const bookings = storage.getBookings();
      const revenues = storage.getRevenues();
      const expenses = storage.getExpenses();

      const totalRev = revenues.reduce((s, r) => s + (r.amount || 0), 0);
      const totalExp = expenses.reduce((s, r) => s + (r.amount || 0), 0);
      const netProfit = totalRev - totalExp;

      setReport({
        score: 94,
        status: 'استقرار استراتيجي مثالي',
        revenueTrend: '+٣٢٪ نمو سنوي',
        efficiency: '٩٤٪ كفاءة تشغيل',
        recommendations: [
          'تفعيل "باقات النخبة" لموسم الزفاف القادم لرفع القيمة السوقية بنسبة ١٥٪.',
          'تقليل زمن المعالجة الفنية (Post-Production) لزيادة دورة رأس المال.',
          'التركيز على التسويق الرقمي في فئة "السيشن الخارجي" لارتفاع الطلب.',
          'إعادة هيكلة المصاريف التشغيلية لزيادة صافي الربح بمقدار ١٠٪.'
        ],
        metrics: [
          { label: 'أداء المصور العام', val: 92, icon: Crown, color: 'text-primary' },
          { label: 'مؤشر التدفق المالي', val: 96, icon: TrendingUp, color: 'text-emerald-400' },
          { label: 'كفاءة سير العمل', val: 84, icon: Activity, color: 'text-primary' },
          { label: 'مستوى ولاء العملاء', val: 98, icon: Star, color: 'text-amber-400' }
        ]
      });
      setAnalyzing(false);
      audioService.playSuccess();
    }, 3000);
  };

  return (
    <div className="view-page" dir="rtl">
      
      {/* المصور ATMOSPHERE */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[100%] h-[100%] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_60%)] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.03)_0%,transparent_70%)] blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-[1900px] mx-auto space-y-20">
        
        {/* CINEMATIC HEADER */}
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-16 border-b border-main pb-20">
          <div className="flex items-center gap-12 group">
             <div className="relative">
                <div className="absolute -inset-4 bg-primary/20 rounded-xl blur-3xl opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative w-36 h-36 rounded-xl bg-surface/50 border border-main flex items-center justify-center text-primary shadow-premium overflow-hidden transition-transform duration-1000 group-hover:scale-110">
                   <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
                   <Brain size={64} strokeWidth={1} className="relative z-10 animate-pulse" />
                </div>
             </div>
             <div>
                <h1 className="page-heading">المستشار <span className="text-primary not-italic font-sans">الذكي</span></h1>
                <div className="flex items-center gap-8">
                   <div className="flex items-center gap-4 px-6 py-2 rounded-2xl bg-primary/5 border border-primary/20 shadow-primary-glow">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_15px_primary]" />
                      <span className="text-[11px] font-black text-primary uppercase tracking-[0.6em]">Neural Strategic Matrix v12.0</span>
                   </div>
                   <div className="text-xs font-black text-text-muted uppercase tracking-[0.2em] italic opacity-40">System IQ: Enhanced / Core Stability: Maximum</div>
                </div>
             </div>
          </div>

          <button 
             onClick={generateReport}
             disabled={analyzing}
             className="h-24 px-16 bg-surface/50 border border-main text-text-main rounded-xl font-black text-xl flex items-center gap-8 shadow-premium hover:bg-primary hover:text-text-inverse hover:border-primary transition-all disabled:opacity-50 group"
          >
             <RefreshCcw size={36} className={cn("transition-transform duration-1000", analyzing ? 'animate-spin' : 'group-hover:rotate-180')} />
             {analyzing ? 'جاري استدعاء مصفوفة البيانات...' : 'تحديث الرؤية الاستراتيجية'}
          </button>
        </header>

        <AnimatePresence mode="wait">
          {analyzing ? (
            <motion.div 
               key="analyzing"
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }}
               className="min-h-[60vh] flex flex-col items-center justify-center space-y-16"
            >
               <div className="relative w-80 h-80">
                  <motion.div 
                     animate={{ rotate: 360 }} 
                     transition={{ duration: 4, repeat: Infinity, ease: "linear" }} 
                     className="absolute inset-0 rounded-2xl border-[8px] border-primary/5 border-t-primary shadow-[0_0_100px_rgba(59,130,246,0.3)]" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                     <div className="relative">
                        <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute -inset-8 bg-primary/20 rounded-full blur-3xl" />
                        <Fingerprint size={100} strokeWidth={1} className="text-primary relative z-10" />
                     </div>
                  </div>
               </div>
               <div className="text-center space-y-6">
                  <h3 className="text-3xl font-display font-semibold">جاري تحليل <span className="text-primary not-italic font-sans">الأرشيف</span></h3>
                  <div className="flex items-center gap-6 justify-center">
                     <div className="h-px w-24 bg-white/[0.04]" />
                     <p className="text-2xl text-text-muted uppercase tracking-[0.8em] font-medium italic opacity-40">Neural Strategic Scan Active</p>
                     <div className="h-px w-24 bg-white/[0.04]" />
                  </div>
               </div>
            </motion.div>
          ) : report && (
            <motion.div 
               key="report"
               initial={{ opacity: 0, y: 50 }} 
               animate={{ opacity: 1, y: 0 }}
               className="grid grid-cols-1 lg:grid-cols-12 gap-16"
            >
               {/* PRIMARY NEURAL MATRIX */}
               <div className="lg:col-span-8 space-y-16">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                     {report.metrics.map((m: any, i: number) => (
                       <motion.div 
                         key={i} 
                         initial={{ opacity: 0, scale: 0.95 }} 
                         animate={{ opacity: 1, scale: 1 }} 
                         transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                         className={cn("p-14 rounded-2xl relative overflow-hidden group hover:scale-[1.03] transition-all duration-700", GLASS_MODULE)}
                       >
                          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32 group-hover:bg-primary/15 transition-all duration-1000" />
                          <div className="flex justify-between items-start mb-12">
                             <div className="relative">
                                <div className="absolute -inset-2 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative w-24 h-24 rounded-xl bg-white/[0.04] border border-main flex items-center justify-center shadow-premium transition-all duration-1000 group-hover:rotate-12">
                                   <m.icon size={48} strokeWidth={1} className={m.color} />
                                </div>
                             </div>
                             <div className="px-8 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-black uppercase tracking-[0.3em] italic">+ {toArabicDigits('٢٤')}٪ تحسن فني</div>
                          </div>
                          <div className="space-y-4">
                             <div className="text-[12rem] font-black text-text-main font-display tracking-tighter tabular-nums leading-none mb-4">{toArabicDigits(m.val.toString())}%</div>
                             <div className="text-[14px] font-black text-primary uppercase tracking-[0.8em] opacity-40 group-hover:opacity-100 group-hover:translate-x-4 transition-all duration-700 italic leading-none">{m.label}</div>
                          </div>
                       </motion.div>
                     ))}
                  </div>

                  {/* RECOMMENDATION COMMAND CENTER */}
                  <div className={cn("p-20 rounded-2xl relative overflow-hidden group", GLASS_MODULE)}>
                     <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,rgba(59,130,246,0.03),transparent_60%)]" />
                     <div className="relative z-10 space-y-16">
                        <div className="flex items-center gap-10">
                           <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-primary-glow"><Target size={40} strokeWidth={1}/></div>
                           <h3 className="text-2xl font-display font-semibold">خريطة <span className="text-primary not-italic font-sans">النمو الاستراتيجي</span></h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                           {report.recommendations.map((rec: string, i: number) => (
                              <motion.div 
                                 key={i} 
                                 initial={{ opacity: 0, x: -30 }} 
                                 animate={{ opacity: 1, x: 0 }} 
                                 transition={{ delay: 0.6 + i * 0.2 }}
                                 className="flex items-start gap-10 p-12 rounded-xl bg-white/[0.04] border border-main hover:bg-white/10 hover:border-primary/20 transition-all duration-700 group/rec shadow-2xl"
                              >
                                 <div className="w-20 h-20 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover/rec:bg-primary group-hover/rec:text-text-inverse transition-all duration-700 shrink-0 shadow-xl">
                                    <Zap size={36} className="group-hover/rec:scale-110 transition-transform" />
                                 </div>
                                 <p className="text-3xl font-black text-text-muted group-hover/rec:text-text-main transition-colors leading-relaxed italic tracking-tighter">{rec}</p>
                              </motion.div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>

               {/* PERFORMANCE HUB */}
               <div className="lg:col-span-4">
                  <div className={cn("p-20 rounded-2xl min-h-[900px] flex flex-col justify-between group relative overflow-hidden", GLASS_MODULE)}>
                     <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.05),transparent_70%)]" />
                     
                     <div className="space-y-20 text-center relative z-10">
                        <div className="space-y-6">
                           <h4 className="text-4xl font-black text-text-muted uppercase tracking-[0.5em] leading-none font-display opacity-40">مؤشر الكفاءة الكلي</h4>
                           <div className="text-[14px] font-black text-primary uppercase tracking-[0.8em] opacity-40">NEURAL CORE ENGINE ACTIVE</div>
                        </div>

                        {/* HIGH-FIDELITY GAUGE */}
                        <div className="relative w-96 h-96 mx-auto group/gauge">
                           <div className="absolute inset-0 rounded-full bg-primary/5 blur-[100px] opacity-0 group-hover/gauge:opacity-100 transition-opacity duration-1000" />
                           <svg className="w-full h-full transform -rotate-90">
                              <circle cx="192" cy="192" r="170" className="stroke-white/5" strokeWidth="20" fill="transparent" />
                              <motion.circle 
                                 cx="192" cy="192" r="170" className="stroke-primary" strokeWidth="20" fill="transparent"
                                 strokeDasharray="1068" 
                                 initial={{ strokeDashoffset: 1068 }} 
                                 animate={{ strokeDashoffset: 1068 - (1068 * report.score) / 100 }} 
                                 transition={{ duration: 3, ease: [0.16, 1, 0.3, 1] }}
                                 strokeLinecap="round"
                              />
                           </svg>
                           <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-[18rem] font-black text-text-main font-display tabular-nums tracking-tighter leading-none">{toArabicDigits(report.score.toString())}</span>
                              <div className="flex items-center gap-4 mt-6">
                                 <Star className="text-primary fill-primary shadow-primary-glow" size={32} />
                                 <span className="text-[14px] font-black text-primary uppercase tracking-[0.8em] italic">Elite Rank IQ</span>
                              </div>
                           </div>
                        </div>

                        <div className="p-16 rounded-2xl bg-surface/50 border border-main space-y-8 shadow-2xl relative overflow-hidden group/status">
                           <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover/status:translate-y-0 transition-transform duration-1000" />
                           <div className="text-5xl font-black text-emerald-400 font-sans relative z-10 italic tracking-tighter">{report.status}</div>
                           <p className="text-2xl font-black text-text-muted italic leading-relaxed relative z-10 opacity-60">أداء النواة الاستراتيجية يتجاوز المعايير العالمية للفئة Diamond.</p>
                        </div>
                     </div>

                     <div className="pt-24 border-t border-main space-y-12 relative z-10">
                        <div className="flex justify-between items-center px-10">
                           <div className="flex items-center gap-6 text-primary">
                              <ShieldCheck size={40} className="animate-pulse shadow-primary-glow" />
                              <span className="text-xs font-black uppercase tracking-[0.6em] italic opacity-40">Secure Neural Protocol Alpha</span>
                           </div>
                           <div className="flex gap-3">
                              <div className="w-3 h-3 rounded-full bg-primary shadow-primary-glow" />
                              <div className="w-3 h-3 rounded-full bg-white/10" />
                              <div className="w-3 h-3 rounded-full bg-white/10" />
                           </div>
                        </div>
                        <button className="w-full h-28 rounded-xl bg-white/[0.04] border border-main text-text-main font-black text-[12px] uppercase tracking-[0.6em] flex items-center justify-center gap-10 hover:bg-white hover:text-black transition-all shadow-premium group/print">
                           <Maximize2 size={36} className="group-hover:scale-125 transition-transform duration-700" />
                           استخراج التقرير العصبي (PDF)
                        </button>
                     </div>
                  </div>
               </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
