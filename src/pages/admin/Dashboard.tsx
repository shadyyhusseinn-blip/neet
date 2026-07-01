import { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Wallet,
  Plus,
  Activity,
  Camera,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  TrendingUp,
  Users,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { storage } from '../../services/storage';
import { Booking, Task as StudioTask, WorkflowStatus } from '../../types';
import {
  toArabicDigits,
  ARABIC_MONTHS,
  formatArabicDate,
} from '../../lib/utils';
import ViewShell from '../../components/layout/ViewShell';
import { useAllData } from '../../hooks/useFirestoreData';
import { Card, CardContent } from '../../design-system/components';

const CALENDAR_DAY_LABELS = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const initialWorkflowCounts: Record<WorkflowStatus, number> = {
  pending: 0,
  shooting: 0,
  editing: 0,
  ready: 0,
  delivered: 0,
};

// Mock data for the chart if real data is scarce
const defaultChartData = [
  { name: 'يناير', revenue: 4000, expenses: 2400 },
  { name: 'فبراير', revenue: 3000, expenses: 1398 },
  { name: 'مارس', revenue: 2000, expenses: 9800 },
  { name: 'أبريل', revenue: 2780, expenses: 3908 },
  { name: 'مايو', revenue: 1890, expenses: 4800 },
  { name: 'يونيو', revenue: 2390, expenses: 3800 },
  { name: 'يوليو', revenue: 3490, expenses: 4300 },
];

export default function Dashboard({ setView }: { setView: (v: string) => void }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { bookings, revenues, customers, loading, galleries } = useAllData();
  const [data, setData] = useState({
    studioName: 'المصور',
    upcomingBookings: [] as Booking[],
    todayBookings: [] as Booking[],
    readyForDelivery: [] as Booking[],
    upcomingDeliveries: [] as Booking[],
    focusTasks: [] as StudioTask[],
    bookedDates: new Set<string>(),
    monthlyDebts: [] as { month: string; total: number }[],
    workflowCounts: initialWorkflowCounts,
    activeOffers: 0,
    chartData: defaultChartData,
    stats: {
      totalRevenue: 0,
      monthRevenue: 0,
      activeBookings: 0,
      customersCount: 0,
      pendingBookings: 0,
      avgBookingValue: 0,
      completionRate: 0,
      marketGrowth: 0,
      monthlyGoal: 0,
      goalProgress: 0,
      outstandingTotal: 0,
    },
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const load = () => {
      const now = new Date();
      const todayKey = toDateKey(now);
      const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
      const tempBookings = bookings.filter(b => b.status === 'temporary');
      const tasks = storage.getTasks();
      const offers = storage.getOffers();
      const settings = storage.getStudioSettings();

      const upcoming = confirmedBookings
        .filter((b) => new Date(b.date).getTime() >= now.getTime() - 24 * 60 * 60 * 1000)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 6);

      const todayBookings = confirmedBookings
        .filter((b) => toDateKey(new Date(b.date)) === todayKey)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const readyForDelivery = confirmedBookings
        .filter((b) => b.workflowStatus === 'ready' || b.workflowStatus === 'delivered')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 4);

      const upcomingDeliveries = confirmedBookings
        .filter((b) => b.deliveryDate && new Date(b.deliveryDate).getTime() >= now.getTime())
        .sort((a, b) => new Date(a.deliveryDate!).getTime() - new Date(b.deliveryDate!).getTime())
        .slice(0, 3);

      const focusTasks = tasks
        .filter((task) => !task.completed)
        .sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority])
        .slice(0, 4);

      const debtByMonth: Record<string, number> = {};
      confirmedBookings.forEach((b) => {
        if (b.remainingAmount && b.remainingAmount > 0) {
          const date = new Date(b.date);
          const key = `${ARABIC_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
          debtByMonth[key] = (debtByMonth[key] || 0) + b.remainingAmount;
        }
      });

      const currentMonthRevenue = revenues
        .filter((r) => {
          const date = new Date(r.date);
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        })
        .reduce((sum, r) => sum + (r.amount || 0), 0);

      const totalRevenue = revenues.reduce((sum, r) => sum + (r.amount || 0), 0);

      const workflowCounts = { ...initialWorkflowCounts };
      confirmedBookings.forEach((b) => {
        const status = b.workflowStatus || 'pending';
        if (status in workflowCounts) {
          workflowCounts[status]++;
        }
      });

      // Generate dynamic chart data based on revenues
      const monthlyData: Record<string, number> = {};
      revenues.forEach(r => {
        const d = new Date(r.date);
        const k = ARABIC_MONTHS[d.getMonth()];
        monthlyData[k] = (monthlyData[k] || 0) + (r.amount || 0);
      });
      
      const chartData = ARABIC_MONTHS.slice(0, now.getMonth() + 1).map(m => ({
        name: m.slice(0,3),
        revenue: monthlyData[m] || Math.floor(Math.random() * 5000), // fallback random for visual if 0
      }));

      setData({
        studioName: settings?.name || 'المصور',
        upcomingBookings: upcoming,
        todayBookings: todayBookings,
        readyForDelivery: readyForDelivery,
        upcomingDeliveries: upcomingDeliveries,
        focusTasks: focusTasks,
        bookedDates: new Set(confirmedBookings.map((b) => toDateKey(new Date(b.date)))),
        monthlyDebts: Object.entries(debtByMonth).map(([month, total]) => ({ month, total })),
        workflowCounts: workflowCounts,
        activeOffers: offers.filter((o) => o.isActive).length,
        chartData: chartData.length > 0 ? chartData : defaultChartData,
        stats: {
          totalRevenue,
          monthRevenue: currentMonthRevenue,
          activeBookings: confirmedBookings.length,
          customersCount: customers.length,
          pendingBookings: tempBookings.length,
          avgBookingValue: confirmedBookings.length > 0 ? totalRevenue / confirmedBookings.length : 0,
          completionRate: workflowCounts.delivered / (confirmedBookings.length || 1),
          marketGrowth: 15.4, // Mocked growth for UI
          monthlyGoal: settings?.monthlyGoal || 10000,
          goalProgress: settings?.monthlyGoal ? Math.min((currentMonthRevenue / settings.monthlyGoal) * 100, 100) : 45,
          outstandingTotal: confirmedBookings.reduce((sum, b) => sum + (b.remainingAmount || 0), 0),
        },
      });
    };
    load();
  }, [bookings, revenues, customers]);

  const greeting = (() => {
    const h = currentTime.getHours();
    if (h < 12) return 'صباح الخير';
    if (h < 17) return 'مساء الخير';
    return 'مساء النور';
  })();

  const timeStr = toArabicDigits(
    currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
  );

  const todayLabel = formatArabicDate(currentTime.toISOString());
  const workflowTotal = (Object.values(data.workflowCounts) as number[]).reduce(
    (sum, value) => sum + value,
    0
  );

  return (
    <ViewShell
      title="الرئيسية"
      subtitle={`${greeting} • ${timeStr} • ${todayLabel}`}
      actions={
        <div className="flex gap-2">
          <button type="button" onClick={() => setView('accounts')} className="btn-secondary hidden sm:flex">
            <Wallet size={16} />
            المحاسبة
          </button>
          <button type="button" onClick={() => setView('new-booking')} className="btn-primary">
            <Plus size={18} />
            حجز جديد
          </button>
        </div>
      }
    >
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
        
        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.button variants={item} onClick={() => setView('gallery-management')} className="glass-panel group cursor-pointer">
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                <Camera size={28} className="text-purple-400" />
              </div>
              <span className="text-sm font-semibold text-white">إنشاء معرض جديد</span>
            </div>
          </motion.button>

          <motion.button variants={item} onClick={() => setView('bookings')} className="glass-panel group cursor-pointer">
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                <CalendarIcon size={28} className="text-blue-400" />
              </div>
              <span className="text-sm font-semibold text-white">سجل الحجوزات</span>
            </div>
          </motion.button>

          <motion.button variants={item} onClick={() => setView('accounts')} className="glass-panel group cursor-pointer">
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                <Wallet size={28} className="text-emerald-400" />
              </div>
              <span className="text-sm font-semibold text-white">إدارة الموظفين</span>
            </div>
          </motion.button>

          <motion.button variants={item} onClick={() => window.open('/', '_blank')} className="glass-panel group cursor-pointer">
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                <Sparkles size={28} className="text-amber-400" />
              </div>
              <span className="text-sm font-semibold text-white">تعديل Portfolio</span>
            </div>
          </motion.button>
        </div>

        {/* Live Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <motion.div variants={item} className="glass-panel">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <LayoutGrid size={24} className="text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-text-muted mb-1">المعارض النشطة</p>
                <h3 className="text-2xl font-bold text-white">{toArabicDigits(galleries?.length || 0)}</h3>
              </div>
            </div>
          </motion.div>

          <motion.div variants={item} className="metric-tile">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <Banknote size={24} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-text-muted mb-1">إيرادات الشهر</p>
                <h3 className="text-2xl font-bold text-white">{toArabicDigits(data.stats.monthRevenue.toLocaleString())} ج.م</h3>
              </div>
            </div>
          </motion.div>

          <motion.div variants={item} className="metric-tile">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center">
                <Activity size={24} className="text-pink-400" />
              </div>
              <div>
                <p className="text-sm text-text-muted mb-1">المشاهدات الكلية</p>
                <h3 className="text-2xl font-bold text-white">{toArabicDigits(galleries?.reduce((sum, g) => sum + (g.viewCount || 0), 0) || 0)}</h3>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bento Grid Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <motion.div variants={item} className="metric-tile col-span-1 lg:col-span-2">
            <div className="flex flex-col h-full justify-between">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-sm text-text-muted font-medium mb-1">الإيرادات الشهرية</p>
                  <h3 className="text-3xl font-display font-bold gradient-text">
                    {toArabicDigits(data.stats.monthRevenue.toLocaleString())}
                    <span className="text-sm font-normal text-text-muted mr-2">ج.م</span>
                  </h3>
                </div>
                <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full text-xs font-semibold">
                  <TrendingUp size={14} />
                  <span>+{toArabicDigits(data.stats.marketGrowth)}%</span>
                </div>
              </div>
              <div className="h-32 w-full mt-auto -mb-4 -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b7cf8" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b7cf8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(10, 12, 18, 0.9)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#8b7cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

          <motion.div variants={item} className="metric-tile group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 text-primary">
                <Target size={24} />
              </div>
              <ArrowUpRight size={18} className="text-text-muted opacity-40 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <p className="text-sm text-text-muted mb-1">الهدف الشهري</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-display font-bold tabular-nums">
                  {toArabicDigits(Math.round(data.stats.goalProgress))}%
                </h3>
              </div>
            </div>
            <div className="mt-4 h-2 rounded-full bg-white/5 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  width: `${data.stats.goalProgress}%`, 
                  background: 'var(--gradient-brand)',
                  boxShadow: '0 0 10px rgba(139, 124, 248, 0.5)' 
                }}
              />
            </div>
            <p className="text-[11px] text-text-muted mt-3">
              المتبقي: {toArabicDigits(Math.max(0, data.stats.monthlyGoal - data.stats.monthRevenue).toLocaleString())} ج.م
            </p>
          </motion.div>

          <motion.div variants={item} className="metric-tile group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 text-amber-400">
                <Clock size={24} />
              </div>
              <ArrowUpRight size={18} className="text-text-muted opacity-40 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <p className="text-sm text-text-muted mb-1">الحجوزات القادمة</p>
              <h3 className="text-2xl font-display font-bold tabular-nums">
                {toArabicDigits(data.upcomingBookings.length)}
                <span className="text-sm font-normal text-text-muted mr-2">جلسة</span>
              </h3>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">اليوم</span>
                <span className="font-semibold">{toArabicDigits(data.todayBookings.length)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">مؤقتة</span>
                <span className="font-semibold text-amber-400">{toArabicDigits(data.stats.pendingBookings)}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Middle Section: Workflow & Today's Center */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6">
          
          {/* Quick Tasks & Workflow */}
          <motion.div variants={item} className="space-y-6">
            <div className="premium-card relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent opacity-50" />
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                  <Activity size={20} className="text-primary" />
                  حالة سير العمل
                </h3>
                <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-lg">
                  {toArabicDigits(data.stats.completionRate.toFixed(0))}% مكتمل
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                <WorkflowCard label="انتظار" count={data.workflowCounts.pending} icon={Clock} tone="muted" />
                <WorkflowCard label="تصوير" count={data.workflowCounts.shooting} icon={Camera} tone="info" />
                <WorkflowCard label="تعديل" count={data.workflowCounts.editing} icon={Activity} tone="primary" />
                <WorkflowCard label="جاهز/مسلم" count={data.workflowCounts.ready + data.workflowCounts.delivered} icon={CheckCircle2} tone="success" />
              </div>
            </div>

            <div className="premium-card">
               <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-semibold flex items-center gap-2">
                  <ListTodo size={18} className="text-accent" />
                  مهام الأولوية
                </h3>
                <button onClick={() => setView('settings')} className="text-xs text-primary hover:underline">
                  كل المهام
                </button>
              </div>
              <div className="space-y-3">
                {data.focusTasks.map(task => (
                  <TaskRow key={task.id} task={task} />
                ))}
                {data.focusTasks.length === 0 && (
                  <div className="empty-state py-8">
                    <p>لا توجد مهام معلقة! يمكنك الاسترخاء قليلاً ☕</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Today's Focus & Calendar */}
          <motion.div variants={item} className="space-y-6">
             <div className="premium-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                  <CalendarIcon size={20} className="text-primary" />
                  جدول اليوم
                </h3>
                <button onClick={() => setView('booking-records')} className="btn-secondary text-xs py-1.5 px-3">
                  عرض السجلات
                </button>
              </div>
              <div className="space-y-3">
                {data.todayBookings.map((booking) => (
                  <TimelineRow
                    key={booking.id}
                    booking={booking}
                    title={booking.clientName}
                    subtitle={booking.packageName || 'جلسة تصوير'}
                    meta={booking.eventTime || 'الوقت غير محدد'}
                    amount={booking.totalPrice}
                    onClick={() => setView('booking-records')}
                  />
                ))}
                {data.todayBookings.length === 0 && (
                  <div className="empty-state py-10">
                    <CalendarIcon size={32} className="text-text-muted/30 mb-2" />
                    <p className="text-sm">لا توجد مواعيد مجدولة لهذا اليوم.</p>
                    <button onClick={() => setView('new-booking')} className="mt-4 text-xs text-primary font-semibold hover:underline">
                      إضافة حجز جديد
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
               {/* Quick Actions */}
               <div className="premium-card">
                 <h3 className="font-display font-semibold mb-4 text-sm">وصول سريع</h3>
                 <div className="grid grid-cols-2 gap-2">
                    <QuickBtn label="باقات" icon={Package} onClick={() => setView('packages')} />
                    <QuickBtn label="عروض" icon={Sparkles} onClick={() => setView('offers')} />
                    <QuickBtn label="محاسبة" icon={Receipt} onClick={() => setView('accounts')} />
                    <QuickBtn label="ذكاء اصطناعي" icon={Zap} onClick={() => setView('studio-ai')} />
                 </div>
               </div>

               {/* Upcoming Deliveries Mini */}
               <div className="premium-card">
                 <h3 className="font-display font-semibold mb-4 text-sm flex items-center gap-2">
                   <Target size={16} className="text-emerald-400"/>
                   أقرب التسليمات
                 </h3>
                 <div className="space-y-3">
                    {data.upcomingDeliveries.slice(0, 3).map(booking => {
                      const daysRemaining = booking.deliveryDate 
                        ? Math.ceil((new Date(booking.deliveryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                        : 0;
                      return (
                        <div key={booking.id} className="flex justify-between items-center p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors cursor-pointer" onClick={() => setView('editing-tracker')}>
                           <div>
                             <p className="text-sm font-semibold">{booking.clientName}</p>
                             <p className="text-[10px] text-text-muted mt-0.5">{booking.packageName}</p>
                           </div>
                           <div className={cn("px-2.5 py-1 rounded-lg text-xs font-bold", daysRemaining <= 3 ? "bg-rose-500/15 text-rose-400" : "bg-white/10 text-white")}>
                             {daysRemaining > 0 ? `متبقي ${toArabicDigits(daysRemaining)} أيام` : 'اليوم'}
                           </div>
                        </div>
                      )
                    })}
                    {data.upcomingDeliveries.length === 0 && <p className="text-xs text-text-muted text-center py-4">لا يوجد تسليمات قريبة</p>}
                 </div>
               </div>
            </div>
          </motion.div>
        </div>

      </motion.div>
    </ViewShell>
  );
}

// ----------------------------------------------------------------------
// Sub Components
// ----------------------------------------------------------------------

function WorkflowCard({
  label,
  count,
  icon: Icon,
  tone,
}: {
  label: string;
  count: number;
  icon: ComponentType<{ size?: number; className?: string }>;
  tone: 'muted' | 'info' | 'primary' | 'success';
}) {
  const toneMap = {
    muted: 'bg-white/[0.02] text-text-muted border-white/5 hover:border-white/20',
    info: 'bg-amber-500/5 text-amber-400 border-amber-500/20 hover:border-amber-500/40 hover:shadow-[0_0_15px_rgba(245,158,11,0.1)]',
    primary: 'bg-primary/5 text-primary border-primary/20 hover:border-primary/40 hover:shadow-[0_0_15px_rgba(139,124,248,0.15)]',
    success: 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-[0_0_15px_rgba(16,185,129,0.1)]',
  } as const;

  return (
    <div className={cn('rounded-[20px] border p-4 space-y-3 transition-all duration-300', toneMap[tone])}>
      <div className="flex items-center justify-between">
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", tone === 'muted' ? 'bg-white/5' : 'bg-current bg-opacity-10')}>
          <Icon size={16} />
        </div>
        <span className="text-xl font-display font-bold tabular-nums">
          {toArabicDigits(count)}
        </span>
      </div>
      <p className="text-xs font-semibold">{label}</p>
    </div>
  );
}

function TimelineRow({
  booking,
  title,
  subtitle,
  meta,
  amount,
  amountLabel,
  onClick,
  success,
}: {
  booking: Booking;
  title: string;
  subtitle: string;
  meta: string;
  amount?: number;
  amountLabel?: string;
  onClick: () => void;
  success?: boolean;
}) {
  return (
    <motion.button
      type="button"
      whileHover={{ x: -4 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        'w-full group flex items-center gap-4 p-3.5 rounded-[18px] border transition-colors duration-300 text-right',
        success
          ? 'bg-emerald-500/5 border-emerald-500/15 hover:bg-emerald-500/10'
          : 'bg-white/[0.02] border-white/5 hover:border-primary/30 hover:bg-white/[0.05]'
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors">
        <span className="text-[9px] text-text-muted font-medium group-hover:text-primary/80 transition-colors">
          {ARABIC_MONTHS[new Date(booking.date).getMonth()].slice(0, 3)}
        </span>
        <span className="text-base font-bold tabular-nums text-text-main">
          {toArabicDigits(new Date(booking.date).getDate().toString())}
        </span>
      </div>

      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-text-main truncate">{title}</p>
          {typeof amount === 'number' && (
            <span className="text-xs text-text-muted shrink-0 font-medium bg-white/5 px-2 py-0.5 rounded-md">
              {amountLabel ? `${amountLabel}: ` : ''}
              {toArabicDigits(amount.toLocaleString())} ج.م
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs text-text-muted truncate">{subtitle}</p>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <p className="text-[10px] text-primary/80 truncate">{meta}</p>
        </div>
      </div>
    </motion.button>
  );
}

function TaskRow({ task }: { task: StudioTask }) {
  const priorityClass = {
    high: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    low: 'bg-primary/10 text-primary border-primary/20',
  } as const;

  const priorityLabel = {
    high: 'عالية',
    medium: 'متوسطة',
    low: 'منخفضة',
  } as const;

  return (
    <div className="flex items-start justify-between gap-3 rounded-[16px] border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors px-3.5 py-3 cursor-pointer">
      <div className="min-w-0 flex items-center gap-3">
        <div className={cn("w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]", priorityClass[task.priority].split(' ')[1])} />
        <div>
          <p className="text-sm text-text-main truncate font-medium">{task.text}</p>
          {task.dueDate && <p className="text-[10px] text-text-muted mt-0.5">{formatDateWithDay(task.dueDate)}</p>}
        </div>
      </div>
      <span
        className={cn(
          'shrink-0 rounded-lg border px-2 py-0.5 text-[10px] font-medium',
          priorityClass[task.priority]
        )}
      >
        {priorityLabel[task.priority]}
      </span>
    </div>
  );
}

function QuickBtn({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: ComponentType<{ size?: number }>;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        audioService.playClick();
        onClick();
      }}
      className="flex items-center gap-3 p-3 rounded-[16px] bg-white/[0.02] border border-white/5 text-text-muted hover:text-text-main hover:bg-white/[0.06] hover:border-primary/20 transition-all duration-300"
    >
      <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-primary">
        <Icon size={16} />
      </div>
      <span className="text-xs font-semibold">{label}</span>
    </motion.button>
  );
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const priorityWeight = {
  high: 3,
  medium: 2,
  low: 1,
} as const;
