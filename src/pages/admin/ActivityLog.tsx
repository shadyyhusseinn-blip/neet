import { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  History,
  Trash2,
  Plus,
  Edit,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Filter,
  Search,
  Calendar,
  Download,
  X,
  ChevronDown,
  ChevronUp,
  Package,
  DollarSign,
  Users,
  FileText,
  Zap,
  Database,
  TrendingUp,
  BarChart3,
  Copy,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { cn, formatDateWithDay, toArabicDigits } from '../../lib/utils';
import PageLayout from '../../components/layout/PageLayout';
import { firebaseService } from '../../services/firebase';
import { audioService } from '../../services/audio';

interface ActivityLog {
  id: string;
  deviceName: string;
  action: string;
  details: any;
  timestamp: string;
}

type FilterType = 'all' | 'created' | 'updated' | 'deleted';
type EntityType = 'all' | 'bookings' | 'packages' | 'expenses' | 'revenues' | 'customers';

export default function ActivityLog() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [entityFilter, setEntityFilter] = useState<EntityType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(50);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseService.isReady()) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Firebase activity log loading
    const db = firebaseService.getDB();
    if (!db) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'activity_logs'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logsData = snapshot.docs.map((doc) => doc.data() as ActivityLog);
      setLogs(logsData);
      setLoading(false);
    }, (error) => {
      console.error('Error loading activity logs:', error);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const getActionIcon = (action: string) => {
    if (action.includes('deleted') || action.includes('حذف')) return Trash2;
    if (action.includes('created') || action.includes('إضافة')) return Plus;
    if (action.includes('updated') || action.includes('تعديل')) return Edit;
    return History;
  };

  const getActionColor = (action: string) => {
    if (action.includes('deleted') || action.includes('حذف')) return 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.1)]';
    if (action.includes('created') || action.includes('إضافة')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]';
    if (action.includes('updated') || action.includes('تعديل')) return 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]';
    return 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]';
  };

  const getActionLabel = (action: string) => {
    if (action.includes('deleted') || action.includes('حذف')) return 'حذف';
    if (action.includes('created') || action.includes('إضافة')) return 'إضافة';
    if (action.includes('updated') || action.includes('تعديل')) return 'تعديل';
    return 'نشاط';
  };

  const getEntityType = (action: string): EntityType => {
    if (action.includes('booking')) return 'bookings';
    if (action.includes('package')) return 'packages';
    if (action.includes('expense')) return 'expenses';
    if (action.includes('revenue')) return 'revenues';
    if (action.includes('customer')) return 'customers';
    return 'all';
  };

  const getEntityIcon = (entityType: EntityType) => {
    switch (entityType) {
      case 'bookings': return FileText;
      case 'packages': return Package;
      case 'expenses': return DollarSign;
      case 'revenues': return TrendingUp;
      case 'customers': return Users;
      default: return Database;
    }
  };

  const getEntityLabel = (entityType: EntityType) => {
    switch (entityType) {
      case 'bookings': return 'حجوزات';
      case 'packages': return 'باقات';
      case 'expenses': return 'مصروفات';
      case 'revenues': return 'إيرادات';
      case 'customers': return 'عملاء';
      default: return 'الكل';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${toArabicDigits(diffMins)} دقيقة`;
    if (diffHours < 24) return `منذ ${toArabicDigits(diffHours)} ساعة`;
    if (diffDays < 7) return `منذ ${toArabicDigits(diffDays)} يوم`;
    return formatDateWithDay(timestamp);
  };

  const getDateGroup = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();

    if (isToday) return 'اليوم';
    if (isYesterday) return 'أمس';
    
    return date.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getActionMessage = (log: ActivityLog) => {
    const { action, details } = log;
    
    if (action.includes('booking_created')) {
      return `تم إضافة حجز جديد للعميل ${details?.clientName || ''}`;
    }
    if (action.includes('booking_updated')) {
      return `تم تحديث حجز العميل ${details?.clientName || ''}`;
    }
    if (action.includes('booking_deleted')) {
      return `تم حذف حجز`;
    }
    if (action.includes('package_created')) {
      return `تم إضافة باقة جديدة: ${details?.name || ''}`;
    }
    if (action.includes('expense_created')) {
      return `تم إضافة مصروف: ${details?.name || ''} بمبلغ ${details?.amount ? toArabicDigits(details.amount) : '0'} ج.م`;
    }
    if (action.includes('revenue_created')) {
      return `تم تسجيل إيراد من العميل ${details?.clientName || ''} بمبلغ ${details?.amount ? toArabicDigits(details.amount) : '0'} ج.م`;
    }
    if (action.includes('customer_saved')) {
      return `تم حفظ بيانات العميل: ${details?.name || ''}`;
    }
    
    return action;
  };

  const getEntityColor = (entityType: EntityType) => {
    switch (entityType) {
      case 'bookings': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'packages': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'expenses': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'revenues': return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'customers': return 'bg-pink-500/10 text-pink-400 border-pink-500/30';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Filter by action type
      if (filter !== 'all') {
        if (filter === 'created' && !log.action.includes('created') && !log.action.includes('إضافة')) return false;
        if (filter === 'updated' && !log.action.includes('updated') && !log.action.includes('تعديل')) return false;
        if (filter === 'deleted' && !log.action.includes('deleted') && !log.action.includes('حذف')) return false;
      }

      // Filter by entity type
      if (entityFilter !== 'all') {
        const entityType = getEntityType(log.action);
        if (entityType !== entityFilter) return false;
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const message = getActionMessage(log).toLowerCase();
        const deviceName = log.deviceName.toLowerCase();
        if (!message.includes(query) && !deviceName.includes(query)) return false;
      }

      // Filter by date range
      if (dateRange !== 'all') {
        const logDate = new Date(log.timestamp);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        if (dateRange === 'today') {
          if (logDate < today) return false;
        } else if (dateRange === 'week') {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          if (logDate < weekAgo) return false;
        } else if (dateRange === 'month') {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          if (logDate < monthAgo) return false;
        }
      }

      return true;
    });
  }, [logs, filter, entityFilter, searchQuery, dateRange]);

  const groupedLogs = useMemo(() => {
    const limited = filteredLogs.slice(0, displayLimit);
    const groups: { [key: string]: ActivityLog[] } = {};
    
    limited.forEach(log => {
      const groupDate = getDateGroup(log.timestamp);
      if (!groups[groupDate]) {
        groups[groupDate] = [];
      }
      groups[groupDate].push(log);
    });
    
    return groups;
  }, [filteredLogs, displayLimit]);

  const stats = useMemo(() => ({
    total: logs.length,
    created: logs.filter(l => l.action.includes('created')).length,
    updated: logs.filter(l => l.action.includes('updated')).length,
    deleted: logs.filter(l => l.action.includes('deleted')).length,
    bookings: logs.filter(l => l.action.includes('booking')).length,
    packages: logs.filter(l => l.action.includes('package')).length,
    expenses: logs.filter(l => l.action.includes('expense')).length,
    revenues: logs.filter(l => l.action.includes('revenue')).length,
    customers: logs.filter(l => l.action.includes('customer')).length,
  }), [logs]);

  const exportLogs = () => {
    audioService.playClick();
    const csvContent = [
      ['التاريخ', 'الجهاز', 'الإجراء', 'التفاصيل', 'النوع'],
      ...filteredLogs.map(log => [
        formatTimestamp(log.timestamp),
        log.deviceName,
        getActionLabel(log.action),
        getActionMessage(log),
        getEntityLabel(getEntityType(log.action))
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const clearFilters = () => {
    setFilter('all');
    setEntityFilter('all');
    setSearchQuery('');
    setDateRange('all');
    audioService.playClick();
  };

  const handleCopy = (log: ActivityLog) => {
    audioService.playClick();
    const textToCopy = `معرف النشاط: ${log.id}\nالإجراء: ${log.action}\nالجهاز: ${log.deviceName}\nالتوقيت: ${new Date(log.timestamp).toLocaleString('ar-EG')}\nالتفاصيل:\n${JSON.stringify(log.details, null, 2)}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(log.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderDetails = (details: any) => {
    if (!details || typeof details !== 'object') return null;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
        {Object.entries(details).map(([key, value]) => {
          if (value === null || value === undefined || key === 'id' || key === 'createdAt' || key === 'updatedAt' || key === 'searchTerms') return null;
          return (
            <div key={key} className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-700/50 flex flex-col group hover:border-slate-600 transition-colors">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-medium">{key}</span>
              <span className="text-sm text-slate-300 font-medium truncate" title={typeof value === 'object' ? JSON.stringify(value) : String(value)}>
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <PageLayout
      title="سجل الأنشطة والمرجعية"
      subtitle="تتبع جميع الإجراءات والتغييرات في النظام في الوقت الفعلي"
      stats={[
        { label: 'إجمالي الأنشطة', value: stats.total, icon: History },
        { label: 'إضافات', value: stats.created, icon: Plus },
        { label: 'تعديلات', value: stats.updated, icon: Edit },
        { label: 'حذف', value: stats.deleted, icon: Trash2 },
      ]}
      toolbar={
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              showFilters ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
            )}
          >
            <Filter size={16} />
            <span>المرشحات</span>
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          <button
            onClick={exportLogs}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all"
          >
            <Download size={16} />
            <span>تصدير</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-xl p-5 shadow-xl"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="col-span-1 md:col-span-2">
                  <label className="studio-label mb-2 block">البحث</label>
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="ابحث في الأنشطة..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="field-input pr-10 bg-slate-900/50 focus:bg-slate-900"
                    />
                  </div>
                </div>

                {/* Action Filter */}
                <div>
                  <label className="studio-label mb-2 block">نوع الإجراء</label>
                  <div className="relative">
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value as FilterType)}
                      className="field-input appearance-none pr-10 bg-slate-900/50"
                    >
                      <option value="all">الكل</option>
                      <option value="created">إضافات</option>
                      <option value="updated">تعديلات</option>
                      <option value="deleted">حذف</option>
                    </select>
                    <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  </div>
                </div>

                {/* Entity Filter */}
                <div>
                  <label className="studio-label mb-2 block">نوع البيانات</label>
                  <div className="relative">
                    <select
                      value={entityFilter}
                      onChange={(e) => setEntityFilter(e.target.value as EntityType)}
                      className="field-input appearance-none pr-10 bg-slate-900/50"
                    >
                      <option value="all">الكل</option>
                      <option value="bookings">حجوزات</option>
                      <option value="packages">باقات</option>
                      <option value="expenses">مصروفات</option>
                      <option value="revenues">إيرادات</option>
                      <option value="customers">عملاء</option>
                    </select>
                    <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  </div>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="studio-label mb-2 block">الفترة الزمنية</label>
                  <div className="relative">
                    <select
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value as any)}
                      className="field-input appearance-none pr-10 bg-slate-900/50"
                    >
                      <option value="all">الكل</option>
                      <option value="today">اليوم</option>
                      <option value="week">آخر أسبوع</option>
                      <option value="month">آخر شهر</option>
                    </select>
                    <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-all"
                  >
                    <X size={16} />
                    <span>مسح المرشحات</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Entity Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { type: 'bookings' as EntityType, label: 'حجوزات', value: stats.bookings, icon: FileText },
            { type: 'packages' as EntityType, label: 'باقات', value: stats.packages, icon: Package },
            { type: 'expenses' as EntityType, label: 'مصروفات', value: stats.expenses, icon: DollarSign },
            { type: 'revenues' as EntityType, label: 'إيرادات', value: stats.revenues, icon: TrendingUp },
            { type: 'customers' as EntityType, label: 'عملاء', value: stats.customers, icon: Users },
          ].map((stat) => (
            <button
              key={stat.type}
              onClick={() => {
                setEntityFilter(entityFilter === stat.type ? 'all' : stat.type);
                audioService.playClick();
              }}
              className={cn(
                'relative p-4 rounded-xl border transition-all duration-300 transform hover:scale-[1.02]',
                entityFilter === stat.type
                  ? cn(getEntityColor(stat.type), 'shadow-lg scale-[1.02]')
                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-800'
              )}
            >
              <stat.icon size={20} className={cn('mb-3', entityFilter === stat.type ? '' : 'text-slate-400')} />
              <div className="text-3xl font-black mb-1">{toArabicDigits(stat.value)}</div>
              <div className="text-sm font-medium opacity-75">{stat.label}</div>
            </button>
          ))}
        </div>

        {/* Activity Logs */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="animate-spin text-blue-500" size={32} />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-800/30 rounded-2xl border border-slate-700/50 border-dashed">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 border-8 border-slate-900/50">
              <History size={32} className="text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">لا توجد أنشطة</h3>
            <p className="text-slate-500 max-w-sm">لم يتم تسجيل أي نشاط يطابق مرشحات البحث الحالية، أو لم تقم بأي إجراءات بعد.</p>
          </div>
        ) : (
          <div className="relative pl-4 md:pl-0">
            {/* Main Timeline Line */}
            <div className="absolute right-4 md:right-[29px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-500/50 via-purple-500/30 to-transparent" />
            
            <div className="space-y-8">
              {Object.entries(groupedLogs).map(([dateGroup, groupLogs], groupIndex) => (
                <div key={dateGroup} className="relative">
                  {/* Date Badge */}
                  <div className="sticky top-4 z-20 flex items-center gap-3 mb-6 pr-12 md:pr-16">
                    <div className="absolute right-0 md:right-4 w-3 h-3 rounded-full bg-slate-800 border-2 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] z-10" />
                    <span className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-slate-800 border border-slate-700 text-slate-300 shadow-sm backdrop-blur-md">
                      {dateGroup}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {(groupLogs as ActivityLog[]).map((log, index) => {
                        const ActionIcon = getActionIcon(log.action);
                        const actionColor = getActionColor(log.action);
                        const actionLabel = getActionLabel(log.action);
                        const entityType = getEntityType(log.action);
                        const EntityIcon = getEntityIcon(entityType);
                        const entityColor = getEntityColor(entityType);
                        const isExpanded = expandedLog === log.id;

                        return (
                          <motion.div
                            key={log.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.03 }}
                            className="relative pr-12 md:pr-16"
                          >
                            {/* Timeline Dot */}
                            <div className="absolute right-1 md:right-5 top-5 w-2.5 h-2.5 rounded-full bg-slate-600 border border-slate-800 z-10" />
                            
                            <div 
                              className={cn(
                                "group bg-slate-800/40 backdrop-blur-xl border rounded-xl overflow-hidden transition-all duration-300",
                                isExpanded ? "border-slate-500/50 bg-slate-800/60 shadow-lg" : "border-slate-700/60 hover:border-slate-600 hover:bg-slate-800/60"
                              )}
                            >
                              <div 
                                className="p-4 sm:p-5 cursor-pointer"
                                onClick={() => {
                                  setExpandedLog(isExpanded ? null : log.id);
                                  audioService.playClick();
                                }}
                              >
                                <div className="flex items-start gap-4">
                                  <div className={cn('p-2.5 rounded-xl border shrink-0 transition-transform group-hover:scale-105', actionColor)}>
                                    <ActionIcon size={20} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                      <span className={cn('px-2.5 py-1 rounded-md text-[11px] font-bold border tracking-wide', actionColor)}>
                                        {actionLabel}
                                      </span>
                                      <span className={cn('px-2.5 py-1 rounded-md text-[11px] font-bold border tracking-wide', entityColor)}>
                                        <EntityIcon size={12} className="inline ml-1.5" />
                                        {getEntityLabel(entityType)}
                                      </span>
                                      <span className="text-slate-500 text-xs font-medium flex items-center gap-1">
                                        <Clock size={12} />
                                        {formatTimestamp(log.timestamp)}
                                      </span>
                                    </div>
                                    <p className="text-slate-200 font-medium text-sm md:text-base mb-1.5 leading-relaxed">
                                      {getActionMessage(log)}
                                    </p>
                                    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                                      <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-white">
                                        {log.deviceName.substring(0, 2).toUpperCase()}
                                      </div>
                                      <span>بواسطة {log.deviceName}</span>
                                    </div>
                                  </div>
                                  <div className="shrink-0 flex items-center gap-1">
                                    <button
                                      className={cn(
                                        "p-2 rounded-lg transition-all",
                                        isExpanded ? "bg-slate-700 text-white" : "text-slate-400 group-hover:bg-slate-700/50 group-hover:text-slate-300"
                                      )}
                                    >
                                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </button>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Expanded Details */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="border-t border-slate-700/50 bg-slate-900/20"
                                  >
                                    <div className="p-4 sm:p-5">
                                      <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                          <Database size={16} className="text-blue-400" />
                                          البيانات المسجلة
                                        </h4>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCopy(log);
                                          }}
                                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors border border-slate-700"
                                        >
                                          {copiedId === log.id ? (
                                            <>
                                              <Check size={14} className="text-emerald-400" />
                                              <span className="text-emerald-400">تم النسخ</span>
                                            </>
                                          ) : (
                                            <>
                                              <Copy size={14} />
                                              <span>نسخ التفاصيل</span>
                                            </>
                                          )}
                                        </button>
                                      </div>

                                      <div className="space-y-4">
                                        <div className="flex flex-wrap gap-4 text-xs">
                                          <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                                            <span className="text-slate-500">معرف النشاط:</span>
                                            <code className="text-blue-400 font-mono">{log.id}</code>
                                          </div>
                                          <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                                            <span className="text-slate-500">التوقيت الدقيق:</span>
                                            <span className="text-slate-300">{new Date(log.timestamp).toLocaleString('ar-EG')}</span>
                                          </div>
                                        </div>
                                        
                                        {log.details && Object.keys(log.details).length > 0 ? (
                                          renderDetails(log.details)
                                        ) : (
                                          <div className="text-center py-4 text-slate-500 text-sm italic bg-slate-900/20 rounded-lg border border-slate-800">
                                            لا توجد تفاصيل إضافية لهذا النشاط
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Load More Button */}
            {filteredLogs.length > displayLimit && (
              <div className="mt-8 flex justify-center pb-8">
                <button
                  onClick={() => {
                    audioService.playClick();
                    setDisplayLimit(prev => prev + 50);
                  }}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-medium hover:bg-slate-700 hover:text-white transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-900/20"
                >
                  <RefreshCw size={18} />
                  <span>عرض المزيد من الأنشطة</span>
                  <span className="text-xs bg-slate-900 px-2 py-0.5 rounded-md mr-2 text-slate-400">
                    {toArabicDigits(filteredLogs.length - displayLimit)} متبقي
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
