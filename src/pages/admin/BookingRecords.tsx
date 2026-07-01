import { useState, useEffect, useMemo, type ComponentType } from 'react';
import {
  Filter,
  Calendar,
  CheckCircle,
  Clock,
  Scissors,
  RefreshCcw,
  Download,
  Share2,
  Database,
  ShieldCheck,
  List,
  Grid,
  ArrowLeft,
  Wallet,
  Users,
  Receipt,
  Sparkles,
  AlertCircle,
  Trash2,
  Camera,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from '../../services/storage';
import { Booking } from '../../types';
import { cn, toArabicDigits, ARABIC_MONTHS, formatDateWithDay } from '../../lib/utils';
import { audioService } from '../../services/audio';
import { statusBadge } from '../../lib/theme';
import PageLayout from '../../components/layout/PageLayout';
import SearchInput from '../../components/ui/SearchInput';
import EmptyState from '../../components/ui/EmptyState';
import EditBookingModal from './EditBookingModal';
import { UI } from '../../lib/ui';
import { useBookings } from '../../hooks/useFirestoreData';

const STATUS_TABS = [
  { id: 'confirmed', label: 'المؤكدة', icon: CheckCircle },
  { id: 'temporary', label: 'المؤقتة', icon: Clock },
  { id: 'expired', label: 'المنتهية', icon: AlertCircle },
  { id: 'cancelled', label: 'الملغية', icon: X },
  { id: 'postponed', label: 'المؤجلة', icon: Clock },
  { id: 'all', label: 'الكل', icon: RefreshCcw },
];

const WORKFLOW_CHIPS = [
  { id: 'all', label: 'كل المراحل' },
  { id: 'pending', label: 'انتظار' },
  { id: 'shooting', label: 'تصوير' },
  { id: 'editing', label: 'تعديل' },
  { id: 'ready', label: 'جاهز' },
  { id: 'delivered', label: 'تم التسليم' },
];

export default function BookingRecords({
  activeTab,
  onTabChange,
}: {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}) {
  const { bookings: firestoreBookings, loading } = useBookings();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(normalizeIncomingTab(activeTab));
  const [selectedYear, setSelectedYear] = useState<string>(() => {
    const now = new Date();
    return now.getFullYear().toString();
  });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return now.getMonth().toString();
  });
  const [workflowFilter, setWorkflowFilter] = useState('all');
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    audioService.playClick();
  };

  const handleBookingSave = (updatedBooking: Booking) => {
    storage.updateBooking(updatedBooking.id, updatedBooking);
    setSelectedBooking(null);
    audioService.playSuccess();
  };

  useEffect(() => {
    if (activeTab) setStatusFilter(normalizeIncomingTab(activeTab));
  }, [activeTab]);

  const years = useMemo(() => {
    const extracted = Array.from(
      new Set(
        firestoreBookings
          .map((booking) => new Date(booking.date).getFullYear())
          .filter((year) => !Number.isNaN(year))
          .map(String)
      )
    ).sort((a, b) => Number(b) - Number(a));

    // إضافة السنوات 2025-2028 يدوياً
    const allowedYears = ['2025', '2026', '2027', '2028'];
    const allYears = Array.from(new Set([...extracted, ...allowedYears]));
    
    return allYears.sort((a, b) => Number(b) - Number(a));
  }, [firestoreBookings]);

  useEffect(() => {
    if (!years.includes(selectedYear)) {
      setSelectedYear(years[0]);
    }
  }, [years, selectedYear]);

  const filteredBookings = useMemo(() => {
    return firestoreBookings
      .filter((booking) => matchesStatusFilter(booking, statusFilter))
      .filter((booking) =>
        selectedYear === 'all' ? true : booking.date.startsWith(selectedYear)
      )
      .filter((booking) => {
        if (selectedMonth === 'all') return true;
        return new Date(booking.date).getMonth() === parseInt(selectedMonth, 10);
      })
      .filter((booking) =>
        workflowFilter === 'all' ? true : (booking.workflowStatus || 'pending') === workflowFilter
      )
      .filter((booking) => {
        const search = searchTerm.trim().toLowerCase();
        if (!search) return true;
        return (
          booking.clientName.toLowerCase().includes(search) ||
          booking.phone?.includes(searchTerm) ||
          booking.packageName?.toLowerCase().includes(search)
        );
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [firestoreBookings, searchTerm, selectedMonth, selectedYear, statusFilter, workflowFilter]);

  const stats = useMemo(() => {
    const collected = filteredBookings.reduce((sum, booking) => sum + (booking.paidAmount || 0), 0);
    const remaining = filteredBookings.reduce(
      (sum, booking) => sum + (booking.remainingAmount || 0),
      0
    );
    const totalValue = filteredBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
    const delivered = filteredBookings.filter((booking) => booking.workflowStatus === 'delivered').length;
    return {
      count: filteredBookings.length,
      collected,
      remaining,
      totalValue,
      delivered,
      confirmed: filteredBookings.filter((booking) => booking.status === 'confirmed').length,
      temporary: filteredBookings.filter((booking) => booking.status === 'temporary').length,
    };
  }, [filteredBookings]);

  const workflowCounts = useMemo(
    () => ({
      pending: filteredBookings.filter((booking) => (booking.workflowStatus || 'pending') === 'pending')
        .length,
      shooting: filteredBookings.filter((booking) => booking.workflowStatus === 'shooting').length,
      editing: filteredBookings.filter((booking) => booking.workflowStatus === 'editing').length,
      ready: filteredBookings.filter((booking) => booking.workflowStatus === 'ready').length,
      delivered: filteredBookings.filter((booking) => booking.workflowStatus === 'delivered').length,
    }),
    [filteredBookings]
  );

  const handleTab = (id: string) => {
    setStatusFilter(id);
    if (id !== 'workflow' && id !== 'editing') {
      setWorkflowFilter('all');
    }
    onTabChange?.(id);
    audioService.playClick();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedMonth('all');
    setWorkflowFilter('all');
    setSelectedYear(years[0] || new Date().getFullYear().toString());
    setStatusFilter('confirmed');
    onTabChange?.('confirmed');
    audioService.playClick();
  };

  return (
    <PageLayout
      title="سجل الحجوزات"
      subtitle="عرض وتحليل وإدارة جميع الحجوزات في سجل واحد أوضح."
      stats={[
        { label: 'عدد الحجوزات', value: stats.count, icon: Database },
        { label: 'إجمالي التعاقدات', value: stats.totalValue, suffix: 'ج.م', icon: Wallet },
        { label: 'المحصل', value: stats.collected, suffix: 'ج.م', icon: CheckCircle },
        { label: 'المتبقي', value: stats.remaining, suffix: 'ج.م', icon: Receipt },
      ]}
      tabs={STATUS_TABS}
      activeTab={statusFilter}
      onTabChange={handleTab}
      toolbar={
        <>
          <div className="flex rounded-xl p-1 bg-white/[0.04] border border-main">
            <button
              type="button"
              onClick={() => setViewType('list')}
              aria-label="عرض كقائمة"
              className={cn(
                'p-2 rounded-lg transition-all',
                viewType === 'list' ? 'bg-primary text-text-inverse' : 'text-text-muted'
              )}
            >
              <List size={18} />
            </button>
            <button
              type="button"
              onClick={() => setViewType('grid')}
              aria-label="عرض كشبكة"
              className={cn(
                'p-2 rounded-lg transition-all',
                viewType === 'grid' ? 'bg-primary text-text-inverse' : 'text-text-muted'
              )}
            >
              <Grid size={18} />
            </button>
          </div>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="بحث بالاسم أو الهاتف أو الباقة..."
            className="w-full sm:w-80"
          />
          <button type="button" className="btn-secondary" onClick={clearFilters}>
            <RefreshCcw size={16} />
            إعادة الضبط
          </button>
          <button type="button" className="btn-secondary" onClick={() => {
            const yearText = selectedYear === 'all' ? 'جميع السنوات' : `سنة ${selectedYear}`;
            const monthText = selectedMonth === 'all' ? 'جميع الأشهر' : `شهر ${parseInt(selectedMonth) + 1}`;
            const shareText = `سجل الحجوزات - ${yearText} - ${monthText}\nعدد الحجوزات: ${toArabicDigits(filteredBookings.length)}\nإجمالي التعاقدات: ${formatCurrency(stats.totalValue)}\nالمحصل: ${formatCurrency(stats.collected)}`;
            if (navigator.share) {
              navigator.share({
                title: 'سجل الحجوزات',
                text: shareText
              });
            } else {
              navigator.clipboard.writeText(shareText);
              alert('تم نسخ السجل إلى الحافظة');
            }
            audioService.playClick();
          }} aria-label="مشاركة السجلات">
            <Share2 size={16} />
          </button>
          <button type="button" className="btn-secondary" onClick={() => {
            const csvContent = "data:text/csv;charset=utf-8," 
              + "اسم العميل,رقم الهاتف,الباقة,التاريخ,السعر,المحصل,المتبقي,الحالة\n"
              + filteredBookings.map(b => 
                `${b.clientName},${b.phone || ''},${b.packageName || ''},${b.date},${b.totalPrice},${b.paidAmount},${b.remainingAmount},${b.status}`
              ).join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `سجل_الحجوزات_${selectedYear}_${selectedMonth}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            audioService.playClick();
          }} aria-label="تصدير السجلات">
            <Download size={16} />
          </button>
          <button type="button" onClick={async () => {
            const yearText = selectedYear === 'all' ? 'جميع السنوات' : `سنة ${selectedYear}`;
            const monthText = selectedMonth === 'all' ? 'جميع الأشهر' : `شهر ${parseInt(selectedMonth) + 1}`;
            if (confirm(`هل أنت متأكد من حذف حجوزات الفترة (${yearText} - ${monthText})؟ هذا الإجراء لا يمكن التراجع عنه.`)) {
              const filteredToDelete = firestoreBookings.filter((booking) => {
                const bookingDate = new Date(booking.date);
                const matchesYear = selectedYear === 'all' || bookingDate.getFullYear().toString() === selectedYear;
                const matchesMonth = selectedMonth === 'all' || bookingDate.getMonth() === parseInt(selectedMonth, 10);
                return matchesYear && matchesMonth;
              });
              
              // Delete from Firestore directly
              filteredToDelete.forEach(booking => {
                storage.deleteBooking(booking.id);
              });
              
              // البيانات ستحدث تلقائياً عبر onSnapshot من Firestore
              audioService.playSuccess();
            }
          }} className="bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-all px-4 py-2 rounded-lg flex items-center gap-2">
            <Trash2 size={16} />
            حذف حجوزات الفترة
          </button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-9 space-y-4">
            <div className={cn(UI.card, 'space-y-4')}>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-display font-semibold text-text-main">نتائج السجل</h3>
                  <p className="text-sm text-text-muted">
                    عرض مرن للسجلات مع دعم تصفية مراحل سير العمل.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {WORKFLOW_CHIPS.map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => {
                        setWorkflowFilter(chip.id);
                        audioService.playClick();
                      }}
                      className={cn(
                        'filter-chip',
                        workflowFilter === chip.id && 'filter-chip-active'
                      )}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {filteredBookings.length === 0 ? (
                <EmptyState
                  title="لا توجد سجلات مطابقة"
                  description="جرّب تغيير الفلاتر أو إعادة ضبط البحث."
                  icon={Database}
                />
              ) : (
                <motion.div
                  layout
                  className={cn(
                    'grid gap-4',
                    viewType === 'grid' ? 'md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'
                  )}
                >
                  {filteredBookings.map((booking, index) => (
                    <div key={booking.id}>
                      <RecordCard booking={booking} viewType={viewType} index={index} onOpen={() => handleBookingClick(booking)} />
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <aside className="lg:col-span-3 space-y-4">
            <div className={cn(UI.section, 'space-y-5')}>
              <div className="flex items-center gap-2 text-text-muted">
                <Calendar size={16} />
                <span className="text-xs font-medium">السنة</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
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

            <div className={cn(UI.section, 'space-y-4')}>
              <div className="flex items-center gap-3">
                <AlertCircle size={18} className="text-primary" />
                <h3 className="font-display font-semibold text-lg">قراءة سريعة</h3>
              </div>
              <SidebarNote
                title="المبلغ المتبقي"
                text={`${formatCurrency(stats.remaining)} تحتاج متابعة من قسم المحاسبة أو التسليم.`}
              />
              <SidebarNote
                title="السجلات المؤقتة"
                text={`${toArabicDigits(stats.temporary)} سجلات يمكن تحويلها إلى حجوزات مؤكدة عند الدفع.`}
              />
              <SidebarNote
                title="الأمان"
                text="السجلات محفوظة محليًا داخل النظام ويمكن الرجوع لها في أي وقت."
              />
            </div>

            <div className={cn(UI.card, 'flex gap-3 items-start border-primary/20 bg-primary/5')}>
              <ShieldCheck size={20} className="text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-text-muted leading-relaxed">
                صفحة السجلات أصبحت جاهزة للفرز السريع والمتابعة المالية والتشغيلية في مكان واحد.
              </p>
            </div>
          </aside>
        </div>
      </div>
      {selectedBooking && (
        <EditBookingModal
          booking={selectedBooking}
          onSave={handleBookingSave}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </PageLayout>
  );
}

function RecordCard({
  booking,
  viewType,
  index,
  onOpen,
}: {
  booking: Booking;
  viewType: 'grid' | 'list';
  index: number;
  onOpen: () => void;
}) {
  const workflow = booking.workflowStatus || 'pending';
  const workflowBadge = statusBadge(workflow);
  const paymentBadge = statusBadge(booking.paymentStatus);

  // أقرب حجز فقط باللون الأخضر
  const isClosest = index === 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3 }}
      onClick={onOpen}
      className={cn(
        UI.card,
        'group cursor-pointer overflow-hidden',
        viewType === 'list' && 'flex items-center justify-between gap-4'
      )}
    >
      <div className={cn('space-y-4', viewType === 'list' && 'flex-1 min-w-0')}>
        <div className="flex items-start gap-4">
          <div className={cn(
            'w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0',
            isClosest ? 'bg-green-500/20 border border-green-500/40' : 'bg-primary/10 border border-primary/20'
          )}>
            <span className={cn('text-[9px]', isClosest ? 'text-green-400' : 'text-text-muted')}>
              {ARABIC_MONTHS[new Date(booking.date).getMonth()].slice(0, 3)}
            </span>
            <span className={cn('text-lg font-bold tabular-nums', isClosest ? 'text-green-400' : '')}>
              {toArabicDigits(new Date(booking.date).getDate())}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <h4 className="font-semibold text-text-main truncate group-hover:text-primary transition-colors">
                {booking.clientName}
              </h4>
              <span className={workflowBadge}>{workflowLabel(workflow)}</span>
            </div>
            <p className="text-xs text-text-muted truncate mt-1">
              {booking.packageName || 'جلسة تصوير'}
            </p>
            <p className="text-[11px] text-primary/80 mt-2">
              {formatDateWithDay(booking.date)}
            </p>
          </div>
        </div>

        {viewType === 'grid' ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <InfoCell label="المحصل" value={booking.paidAmount || 0} tone="success" />
              <InfoCell label="المتبقي" value={booking.remainingAmount || 0} tone="danger" />
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-main pt-4">
              <span className={paymentBadge}>{paymentLabel(booking.paymentStatus)}</span>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <Users size={14} />
                <span dir="ltr">{booking.phone || 'بدون رقم'}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-left">
              <p className="text-[10px] text-text-muted">المتبقي</p>
              <p className="font-bold text-danger tabular-nums">
                {formatCurrency(booking.remainingAmount || 0)}
              </p>
            </div>
            <span className={paymentBadge}>{paymentLabel(booking.paymentStatus)}</span>
            <ArrowLeft
              size={18}
              className="text-text-muted opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all"
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}

function MiniMetric({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: ComponentType<{ size?: number; className?: string }>;
  tone: 'muted' | 'warning' | 'primary' | 'success';
}) {
  const toneClass = {
    muted: 'bg-white/[0.03] border-main text-text-muted',
    warning: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    primary: 'bg-primary/10 border-primary/20 text-primary',
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  } as const;

  return (
    <div className={cn('rounded-2xl border p-4 space-y-2', toneClass[tone])}>
      <div className="flex items-center justify-between gap-3">
        <Icon size={18} />
        <span className="text-lg font-display font-bold">{toArabicDigits(value)}</span>
      </div>
      <p className="text-sm font-semibold text-text-main">{label}</p>
    </div>
  );
}

function InfoCell({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'success' | 'danger';
}) {
  return (
    <div className="rounded-xl border border-main bg-white/[0.03] p-3">
      <p className="text-[10px] text-text-muted mb-1">{label}</p>
      <p className={cn('text-base font-bold tabular-nums', tone === 'success' ? 'text-success' : 'text-danger')}>
        {toArabicDigits(value.toLocaleString())}
        <span className="text-xs font-normal mr-1">ج.م</span>
      </p>
    </div>
  );
}

function SidebarNote({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-main bg-white/[0.03] p-3">
      <p className="text-sm font-semibold text-text-main">{title}</p>
      <p className="text-xs text-text-muted mt-1 leading-6">{text}</p>
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-main bg-white/[0.04] px-3 py-2 text-xs">
      <span className="text-text-muted">{label}</span>
      <span className="font-semibold text-text-main">{value}</span>
    </div>
  );
}

function formatCurrency(value: number) {
  return `${toArabicDigits(value.toLocaleString())} ج.م`;
}

function normalizeIncomingTab(tab?: string) {
  if (!tab) return 'confirmed';
  if (['confirmed', 'temporary', 'expired', 'cancelled', 'postponed', 'all'].includes(tab)) return tab;
  if (tab === 'pending') return 'temporary';
  if (['shooting', 'ready', 'delivered'].includes(tab)) return 'workflow';
  return 'confirmed';
}

function matchesStatusFilter(booking: Booking, filter: string) {
  if (filter === 'confirmed') return booking.status === 'confirmed';
  if (filter === 'temporary') return booking.status === 'temporary';
  if (filter === 'expired') return booking.status === 'expired';
  if (filter === 'cancelled') return booking.status === 'cancelled';
  if (filter === 'postponed') return booking.status === 'postponed';
  if (filter === 'editing') return booking.workflowStatus === 'editing';
  if (filter === 'workflow') {
    return ['pending', 'shooting', 'editing', 'ready', 'delivered'].includes(
      booking.workflowStatus || 'pending'
    );
  }
  return true;
}

function workflowLabel(status: string) {
  const labels: Record<string, string> = {
    pending: 'انتظار',
    shooting: 'تصوير',
    editing: 'تعديل',
    ready: 'جاهز',
    delivered: 'تم التسليم',
  };
  return labels[status] || status;
}

function paymentLabel(status: string) {
  const labels: Record<string, string> = {
    paid: 'مدفوع',
    deposit: 'عربون',
    unpaid: 'غير مدفوع',
    confirmed: 'مؤكد',
  };
  return labels[status] || status;
}
