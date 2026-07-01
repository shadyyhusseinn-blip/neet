import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle,
  Crown,
  Download,
  Receipt,
  TrendingDown,
  TrendingUp,
  Wallet,
  Calendar,
  Filter,
  Plus,
} from 'lucide-react';
import { motion } from 'motion/react';
import { storage } from '../../services/storage';
import { Booking, Expense, Revenue } from '../../types';
import { ARABIC_MONTHS, cn, formatDateWithDay, toArabicDigits } from '../../lib/utils';
import { audioService } from '../../services/audio';
import PageLayout from '../../components/layout/PageLayout';
import { UI } from '../../lib/ui';
import { useAllData } from '../../hooks/useFirestoreData';

interface AccountsProps {
  setView?: (view: string) => void;
}

type AccountsTab = 'overview' | 'revenues' | 'expenses' | 'yearly' | 'monthly';

export default function Accounts({ setView }: AccountsProps) {
  const [activeTab, setActiveTab] = useState<AccountsTab>('overview');
  const { revenues, expenses, bookings, loading } = useAllData();
  const [selectedYear, setSelectedYear] = useState<string>(() => {
    const now = new Date();
    return now.getFullYear().toString();
  });
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return now.getMonth().toString();
  });

  const years = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    return ['2025', '2026', '2027', '2028'].filter(y => parseInt(y) <= currentYear);
  }, []);

  const filteredRevenues = useMemo(() => {
    return revenues.filter((item) => {
      const itemDate = new Date(item.date);
      const matchesYear = itemDate.getFullYear().toString() === selectedYear;
      const matchesMonth = selectedMonth === 'all' || itemDate.getMonth() === parseInt(selectedMonth, 10);
      return matchesYear && matchesMonth;
    });
  }, [revenues, selectedYear, selectedMonth]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      const itemDate = new Date(item.date);
      const matchesYear = itemDate.getFullYear().toString() === selectedYear;
      const matchesMonth = selectedMonth === 'all' || itemDate.getMonth() === parseInt(selectedMonth, 10);
      return matchesYear && matchesMonth;
    });
  }, [expenses, selectedYear, selectedMonth]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((item) => {
      const itemDate = new Date(item.date);
      const matchesYear = itemDate.getFullYear().toString() === selectedYear;
      const matchesMonth = selectedMonth === 'all' || itemDate.getMonth() === parseInt(selectedMonth, 10);
      return matchesYear && matchesMonth;
    });
  }, [bookings, selectedYear, selectedMonth]);

  const summary = useMemo(() => {
    // حساب الإيرادات من الحجوزات بناءً على تواريخ الدفع الفعلية
    const bookingRevenues = bookings.map(booking => {
      const bookingDate = new Date(booking.date);
      const deliveryDate = booking.deliveryDate ? new Date(booking.deliveryDate) : bookingDate;
      
      // العربون يتم حسابه في شهر الحجز
      const depositRevenue = booking.paidAmount > 0 ? {
        amount: booking.paidAmount,
        date: booking.date,
        month: bookingDate.getMonth(),
        year: bookingDate.getFullYear(),
        type: 'deposit' as const
      } : null;
      
      // الباقي يتم حسابه في شهر التصوير
      const remainingRevenue = booking.remainingAmount > 0 ? {
        amount: booking.remainingAmount,
        date: booking.deliveryDate || booking.date,
        month: deliveryDate.getMonth(),
        year: deliveryDate.getFullYear(),
        type: 'remaining' as const
      } : null;
      
      return [depositRevenue, remainingRevenue].filter(Boolean);
    }).flat();

    const totalRevenue = filteredRevenues.reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalExpenses = filteredExpenses.reduce((sum, item) => sum + (item.amount || 0), 0);
    const pendingCollection = filteredBookings.reduce((sum, item) => sum + (item.remainingAmount || 0), 0);
    const netProfit = totalRevenue - totalExpenses;
    const averageTicket = filteredRevenues.length > 0 ? Math.round(totalRevenue / filteredRevenues.length) : 0;

    const monthlySeries = Array.from({ length: 12 }, (_, monthIndex) => {
      // الإيرادات من الحجوزات (العربون في شهر الحجز، الباقي في شهر التصوير)
      const bookingRevenue = bookingRevenues
        .filter((item) => item.month === monthIndex && item.year === parseInt(selectedYear))
        .reduce((sum, item) => sum + item.amount, 0);
      
      // الإيرادات اليدوية المسجلة
      const manualRevenue = filteredRevenues
        .filter((item) => new Date(item.date).getMonth() === monthIndex)
        .reduce((sum, item) => sum + item.amount, 0);
      
      const revenue = bookingRevenue + manualRevenue;
      
      const expense = filteredExpenses
        .filter((item) => new Date(item.date).getMonth() === monthIndex)
        .reduce((sum, item) => sum + item.amount, 0);

      return {
        month: `${ARABIC_MONTHS[monthIndex]} (${toArabicDigits((monthIndex + 1).toString())})`,
        revenue,
        expense,
        net: revenue - expense,
      };
    });

    // تحليل سنوي شامل
    const yearlySeries = Array.from({ length: 4 }, (_, yearIndex) => {
      const year = 2025 + yearIndex;
      
      // الإيرادات من الحجوزات
      const bookingRevenue = bookingRevenues
        .filter((item) => item.year === year)
        .reduce((sum, item) => sum + item.amount, 0);
      
      // الإيرادات اليدوية
      const manualRevenue = revenues
        .filter((item) => new Date(item.date).getFullYear() === year)
        .reduce((sum, item) => sum + item.amount, 0);
      
      const revenue = bookingRevenue + manualRevenue;
      
      const expense = expenses
        .filter((item) => new Date(item.date).getFullYear() === year)
        .reduce((sum, item) => sum + item.amount, 0);

      return {
        year: year.toString(),
        revenue,
        expense,
        net: revenue - expense,
      };
    });

    return {
      totalRevenue,
      totalExpenses,
      pendingCollection,
      netProfit,
      averageTicket,
      monthlySeries,
      yearlySeries,
      topPending: [...filteredBookings]
        .filter((booking) => (booking.remainingAmount || 0) > 0)
        .sort((a, b) => (b.remainingAmount || 0) - (a.remainingAmount || 0))
        .slice(0, 5),
      recentRevenues: [...filteredRevenues]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 6),
      recentExpenses: [...filteredExpenses]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 6),
    };
  }, [filteredBookings, filteredExpenses, filteredRevenues, revenues, expenses]);

  return (
    <PageLayout
      title="صفحة المحاسبة"
      subtitle="متابعة التدفق المالي والتحصيل والمصروفات من واجهة أوضح."
      stats={[
        { label: 'إجمالي الإيرادات', value: summary.totalRevenue, suffix: 'ج.م', icon: TrendingUp },
        { label: 'المصروفات', value: summary.totalExpenses, suffix: 'ج.م', icon: TrendingDown },
        { label: 'صافي الربح', value: summary.netProfit, suffix: 'ج.م', icon: Crown },
        { label: 'قيد التحصيل', value: summary.pendingCollection, suffix: 'ج.م', icon: Wallet },
      ]}
      tabs={[
        { id: 'overview', label: 'نظرة عامة', icon: Activity },
        { id: 'revenues', label: 'الإيرادات', icon: TrendingUp },
        { id: 'expenses', label: 'المصروفات', icon: TrendingDown },
        { id: 'yearly', label: 'تحليل سنوي', icon: Receipt },
        { id: 'monthly', label: 'تحليل شهري', icon: Calendar },
      ]}
      activeTab={activeTab}
      onTabChange={(id) => {
        setActiveTab(id as AccountsTab);
        audioService.playClick();
      }}
      actions={
        <div className="flex gap-2">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setView?.('booking-records')}
          >
            <Download size={16} />
            متابعة السجلات
          </button>
        </div>
      }
      toolbar={
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 text-text-muted">
            <Calendar size={16} />
            <span className="text-xs font-medium">السنة</span>
          </div>
          <div className="flex gap-2">
            {years.map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => {
                  setSelectedYear(year);
                  audioService.playClick();
                }}
                className={cn('filter-chip', selectedYear === year && 'filter-chip-active')}
              >
                {toArabicDigits(year)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-text-muted pt-2">
            <Filter size={16} />
            <span className="text-xs font-medium">الشهر</span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedMonth('all')}
            className={cn('filter-chip w-full', selectedMonth === 'all' && 'filter-chip-active')}
          >
            جميع الشهور
          </button>
          <div className="grid grid-cols-3 gap-2">
            {ARABIC_MONTHS.map((month, index) => (
              <button
                key={month}
                type="button"
                onClick={() => {
                  setSelectedMonth(index.toString());
                  audioService.playClick();
                }}
                className={cn(
                  'filter-chip text-[10px]',
                  selectedMonth === index.toString() && 'filter-chip-active'
                )}
              >
                {toArabicDigits((index + 1).toString())}
              </button>
            ))}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <section
          className={cn(
            UI.section,
            'relative overflow-hidden border-primary/15 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.14),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]'
          )}
        >
          <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs text-primary">
                <Activity size={14} />
                مركز القرار المالي
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-text-main">
                  المحاسبة أصبحت أوضح في القراءة والتحصيل والمتابعة.
                </h2>
                <p className="mt-4 max-w-3xl text-base md:text-lg text-text-muted leading-8">
                  تم تنظيم الصفحة لتعرض الإيرادات والمصروفات وصافي الربح والمبالغ المفتوحة مع
                  سجل أحدث العمليات وتحليل شهري وسنوي شامل يمكن قراءته بسرعة.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Pill label="متوسط العملية" value={`${toArabicDigits(summary.averageTicket)} ج.م`} />
                <Pill label="عدد الإيرادات" value={toArabicDigits(filteredRevenues.length)} />
                <Pill label="عدد المصروفات" value={toArabicDigits(filteredExpenses.length)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <MiniFinanceCard
                title="تحصيل"
                value={summary.totalRevenue}
                icon={ArrowUpRight}
                tone="success"
              />
              <MiniFinanceCard
                title="صرف"
                value={summary.totalExpenses}
                icon={ArrowDownRight}
                tone="danger"
              />
              <MiniFinanceCard
                title="صافي"
                value={summary.netProfit}
                icon={Crown}
                tone="primary"
              />
              <MiniFinanceCard
                title="مفتوح"
                value={summary.pendingCollection}
                icon={Wallet}
                tone="warning"
              />
            </div>
          </div>
        </section>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <section className={cn(UI.section, 'lg:col-span-7 space-y-5')}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-display font-semibold text-text-main">تدفق شهري</h3>
                  <p className="text-sm text-text-muted mt-1">مقارنة سريعة بين الإيراد والمصروف.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {summary.monthlySeries.slice(0, 8).map((item, index) => (
                  <MonthFinanceCard key={`${item.month}-${index}`} item={item} />
                ))}
              </div>
            </section>

            <section className={cn(UI.section, 'lg:col-span-5 space-y-5')}>
              <div>
                <h3 className="text-xl font-display font-semibold text-text-main">أعلى مبالغ مفتوحة</h3>
                <p className="text-sm text-text-muted mt-1">الحجوزات التي تحتاج متابعة تحصيل مباشرة.</p>
              </div>
              <div className="space-y-3">
                {summary.topPending.map((booking) => (
                  <OutstandingRow key={booking.id} booking={booking} />
                ))}
                {summary.topPending.length === 0 && (
                  <p className="text-sm text-text-muted">لا توجد مبالغ مفتوحة حاليًا.</p>
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'revenues' && (
          <section className={cn(UI.section, 'space-y-6')}>
            <div>
              <h3 className="text-xl font-display font-semibold text-text-main">آخر الإيرادات</h3>
              <p className="text-sm text-text-muted mt-2">أحدث الدفعات المسجلة داخل النظام.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {summary.recentRevenues.map((item) => (
                <FinanceRow
                  key={item.id}
                  title={item.clientName || 'إيراد يدوي'}
                  subtitle={formatDateWithDay(item.date)}
                  amount={item.amount}
                  icon={TrendingUp}
                  tone="success"
                  meta={item.paymentMethod}
                />
              ))}
              {summary.recentRevenues.length === 0 && (
                <p className="text-sm text-text-muted col-span-full">لا توجد إيرادات مسجلة بعد.</p>
              )}
            </div>
          </section>
        )}

        {activeTab === 'expenses' && (
          <section className={cn(UI.section, 'space-y-6')}>
            <div>
              <h3 className="text-xl font-display font-semibold text-text-main">آخر المصروفات</h3>
              <p className="text-sm text-text-muted mt-2">مراجعة أحدث المصروفات وتبويبها بسرعة.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {summary.recentExpenses.map((item) => (
                <FinanceRow
                  key={item.id}
                  title={item.name}
                  subtitle={formatDateWithDay(item.date)}
                  amount={item.amount}
                  icon={TrendingDown}
                  tone="danger"
                  meta={item.category}
                />
              ))}
              {summary.recentExpenses.length === 0 && (
                <p className="text-sm text-text-muted col-span-full">لا توجد مصروفات مسجلة بعد.</p>
              )}
            </div>
          </section>
        )}

        {activeTab === 'yearly' && (
          <section className={cn(UI.section, 'space-y-6')}>
            <div>
              <h3 className="text-xl font-display font-semibold text-text-main">تحليل سنوي شامل</h3>
              <p className="text-sm text-text-muted mt-2">
                قراءة مرئية مبسطة لصافي كل سنة خلال الفترة 2025-2028.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {summary.yearlySeries.map((item) => (
                <div key={item.year} className={cn(UI.card, 'space-y-4')}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center',
                        item.net >= 0 ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                      )}>
                        <Crown size={20} />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-text-main">{toArabicDigits(item.year)}</h4>
                        <p className="text-xs text-text-muted">سنة مالية</p>
                      </div>
                    </div>
                    <span className={cn('text-lg font-bold', item.net >= 0 ? 'text-success' : 'text-danger')}>
                      {toArabicDigits(item.net.toLocaleString())} ج.م
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">إيراد</span>
                      <span className="text-success font-semibold">{toArabicDigits(item.revenue.toLocaleString())} ج.م</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">مصروف</span>
                      <span className="text-danger font-semibold">{toArabicDigits(item.expense.toLocaleString())} ج.م</span>
                    </div>
                    <div className="h-3 rounded-full bg-white/8 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, Math.max(6, ratio(item.revenue, item.expense)))}%` }}
                        transition={{ duration: 0.55 }}
                        className={cn('h-full rounded-full', item.net >= 0 ? 'bg-success' : 'bg-danger')}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'monthly' && (
          <section className={cn(UI.section, 'space-y-6')}>
            <div>
              <h3 className="text-xl font-display font-semibold text-text-main">تحليل شهري شامل</h3>
              <p className="text-sm text-text-muted mt-2">
                قراءة مرئية مبسطة لصافي كل شهر خلال العام الحالي.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {summary.monthlySeries.map((item) => (
                <div key={item.month} className={cn(UI.card, 'space-y-3')}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-text-main">{item.month}</span>
                    <span className={cn('text-sm font-bold', item.net >= 0 ? 'text-success' : 'text-danger')}>
                      {toArabicDigits(item.net.toLocaleString())} ج.م
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-text-muted">
                      <span>إيراد</span>
                      <span className="text-success font-semibold">{toArabicDigits(item.revenue.toLocaleString())}</span>
                    </div>
                    <div className="flex justify-between text-text-muted">
                      <span>مصروف</span>
                      <span className="text-danger font-semibold">{toArabicDigits(item.expense.toLocaleString())}</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-white/8 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, Math.max(6, ratio(item.revenue, item.expense)))}%` }}
                      transition={{ duration: 0.55 }}
                      className={cn('h-full rounded-full', item.net >= 0 ? 'bg-success' : 'bg-danger')}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </PageLayout>
  );
}

function MiniFinanceCard({
  title,
  value,
  icon: Icon,
  tone,
}: {
  title: string;
  value: number;
  icon: typeof Activity;
  tone: 'success' | 'danger' | 'primary' | 'warning';
}) {
  const toneMap = {
    success: 'bg-success/10 border-success/20 text-success',
    danger: 'bg-danger/10 border-danger/20 text-danger',
    primary: 'bg-primary/10 border-primary/20 text-primary',
    warning: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  } as const;

  return (
    <div className={cn('rounded-2xl border p-5 space-y-3', toneMap[tone])}>
      <div className="flex items-center justify-between gap-3">
        <Icon size={20} />
        <span className="text-xl font-display font-bold">{toArabicDigits(value.toLocaleString())}</span>
      </div>
      <p className="text-sm font-semibold text-text-main">{title}</p>
    </div>
  );
}

function MonthFinanceCard({
  item,
}: {
  item: { month: string; revenue: number; expense: number; net: number };
}) {
  return (
    <div className={cn(UI.card, 'space-y-4')}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-text-main">{item.month}</span>
        <span className={cn('text-sm font-bold', item.net >= 0 ? 'text-success' : 'text-danger')}>
          {toArabicDigits(item.net.toLocaleString())} ج.م
        </span>
      </div>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between text-text-muted">
          <span>إيراد</span>
          <span className="text-success font-semibold">{toArabicDigits(item.revenue.toLocaleString())}</span>
        </div>
        <div className="flex justify-between text-text-muted">
          <span>مصروف</span>
          <span className="text-danger font-semibold">{toArabicDigits(item.expense.toLocaleString())}</span>
        </div>
      </div>
    </div>
  );
}

function OutstandingRow({ booking }: { booking: Booking }) {
  return (
    <div className="rounded-xl border border-main bg-white/3 p-4 flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-main truncate">{booking.clientName}</p>
        <p className="text-xs text-text-muted mt-1 truncate">{formatDateWithDay(booking.date)}</p>
      </div>
      <span className="text-sm font-bold text-danger shrink-0">
        {toArabicDigits((booking.remainingAmount || 0).toLocaleString())} ج.م
      </span>
    </div>
  );
}

function FinanceRow({
  title,
  subtitle,
  amount,
  icon: Icon,
  tone,
  meta,
}: {
  title: string;
  subtitle: string;
  amount: number;
  icon: typeof TrendingUp;
  tone: 'success' | 'danger';
  meta?: string;
}) {
  return (
    <div className="rounded-xl border border-main bg-white/3 p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
            tone === 'success' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
          )}
        >
          <Icon size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-main truncate">{title}</p>
          <p className="text-xs text-text-muted truncate">{subtitle}</p>
        </div>
      </div>
      <div className="text-left shrink-0">
        <p className={cn('text-base font-bold', tone === 'success' ? 'text-success' : 'text-danger')}>
          {toArabicDigits(amount.toLocaleString())} ج.م
        </p>
        {meta && <p className="text-[11px] text-text-muted">{meta}</p>}
      </div>
    </div>
  );
}

function Pill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-main bg-white/4 px-4 py-2.5 text-xs">
      <span className="text-text-muted">{label}</span>
      <span className="font-bold text-text-main">{value}</span>
    </div>
  );
}

function ratio(revenue: number, expense: number) {
  const total = revenue + expense;
  if (total <= 0) return 6;
  return Math.round((Math.max(revenue, expense) / total) * 100);
}
