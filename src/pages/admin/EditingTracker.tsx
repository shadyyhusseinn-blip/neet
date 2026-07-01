import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Camera,
  CheckCircle,
  Clock,
  Download,
  Film,
  Play,
  Scissors,
  Search,
  Sparkles,
  Truck,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { storage } from '../../services/storage';
import { Booking, WorkflowStatus } from '../../types';
import { cn, formatDateWithDay, toArabicDigits } from '../../lib/utils';
import { audioService } from '../../services/audio';
import PageLayout from '../../components/layout/PageLayout';
import SearchInput from '../../components/ui/SearchInput';
import EmptyState from '../../components/ui/EmptyState';
import { UI } from '../../lib/ui';
import { useBookings } from '../../hooks/useFirestoreData';

type TrackerFilter = 'all' | 'pending' | 'shooting' | 'editing' | 'ready' | 'delivered';

const workflowTabs = [
  { id: 'all', label: 'الكل', icon: Sparkles },
  { id: 'pending', label: 'انتظار', icon: Clock },
  { id: 'shooting', label: 'تصوير', icon: Camera },
  { id: 'editing', label: 'تعديل', icon: Scissors },
  { id: 'ready', label: 'جاهز', icon: CheckCircle },
  { id: 'delivered', label: 'تم التسليم', icon: Truck },
] as const;

export default function EditingTracker() {
  const { bookings: firestoreBookings } = useBookings();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<TrackerFilter>('all');

  const tasks = useMemo(() => {
    return firestoreBookings;
  }, [firestoreBookings]);

  const filteredTasks = useMemo(
    () =>
      tasks
        .filter((task) => filter === 'all' || (task.workflowStatus || 'pending') === filter)
        .filter((task) => {
          const search = searchTerm.trim().toLowerCase();
          if (!search) return true;
          return (
            task.clientName.toLowerCase().includes(search) ||
            task.packageName.toLowerCase().includes(search)
          );
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [filter, searchTerm, tasks]
  );

  const counts = useMemo(
    () => ({
      pending: tasks.filter((task) => (task.workflowStatus || 'pending') === 'pending').length,
      shooting: tasks.filter((task) => task.workflowStatus === 'shooting').length,
      editing: tasks.filter((task) => task.workflowStatus === 'editing').length,
      ready: tasks.filter((task) => task.workflowStatus === 'ready').length,
      delivered: tasks.filter((task) => task.workflowStatus === 'delivered').length,
    }),
    [tasks]
  );

  const updateStatus = (id: string, status: WorkflowStatus) => {
    storage.updateWorkflowStatus(id, status);
    audioService.playClick();
  };

  return (
    <PageLayout
      title="صفحة الإنتاج"
      subtitle="متابعة مراحل التنفيذ من الانتظار حتى الجاهزية والتسليم."
      stats={[
        { label: 'قيد الانتظار', value: counts.pending, icon: Clock },
        { label: 'التصوير', value: counts.shooting, icon: Camera },
        { label: 'التعديل', value: counts.editing, icon: Scissors },
        { label: 'الجاهز والتسليم', value: counts.ready + counts.delivered, icon: Truck },
      ]}
      tabs={workflowTabs as any}
      activeTab={filter}
      onTabChange={(id) => {
        setFilter(id as TrackerFilter);
        audioService.playClick();
      }}
      toolbar={
        <>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="ابحث باسم العميل أو الباقة..."
            className="w-full sm:w-80"
          />
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setFilter('all');
              setSearchTerm('');
              audioService.playClick();
            }}
          >
            <Download size={16} />
            إعادة الضبط
          </button>
        </>
      }
    >
      <div className="space-y-6">
        <section
          className={cn(
            UI.section,
            'relative overflow-hidden border-primary/15 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.12),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]'
          )}
        >
          <div className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
                <Activity size={14} />
                مركز متابعة الإنتاج
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-text-main">
                  صفحة الإنتاج أصبحت أوضح في ترتيب الأولويات والحالة الحالية.
                </h2>
                <p className="mt-3 max-w-3xl text-sm md:text-base text-text-muted leading-7">
                  تم تبسيط صفحة التنفيذ لتعرض المراحل بوضوح، وتسمح بتغيير الحالة مباشرة مع
                  إبراز المواعيد القريبة والجلسات الجاهزة للتسليم.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <MiniCount title="انتظار" value={counts.pending} />
              <MiniCount title="تصوير" value={counts.shooting} />
              <MiniCount title="تعديل" value={counts.editing} />
              <MiniCount title="تسليم" value={counts.delivered} />
            </div>
          </div>
        </section>

        <AnimatePresence mode="popLayout">
          {filteredTasks.length === 0 ? (
            <EmptyState
              title="لا توجد مهام مطابقة"
              description="جرّب تغيير المرحلة أو نص البحث."
              icon={Scissors}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={cn(UI.card, 'space-y-5')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      {task.eventType?.includes('فيديو') ? <Film size={20} /> : <Camera size={20} />}
                    </div>
                    <span className="badge-primary">{workflowLabel(task.workflowStatus || 'pending')}</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-display font-semibold text-text-main">{task.clientName}</h3>
                    <p className="text-sm text-text-muted mt-2">{task.packageName || 'جلسة تصوير'}</p>
                    <p className="text-[11px] text-primary/80 mt-2">{formatDateWithDay(task.date)}</p>
                  </div>

                  <ProgressBlock status={task.workflowStatus || 'pending'} />

                  <div className="grid grid-cols-2 gap-3">
                    <StageButton
                      label="بدء/تصوير"
                      active={task.workflowStatus === 'shooting'}
                      onClick={() => updateStatus(task.id, 'shooting')}
                    />
                    <StageButton
                      label="قيد التعديل"
                      active={task.workflowStatus === 'editing'}
                      onClick={() => updateStatus(task.id, 'editing')}
                    />
                    <StageButton
                      label="جاهز"
                      active={task.workflowStatus === 'ready'}
                      onClick={() => updateStatus(task.id, 'ready')}
                    />
                    <StageButton
                      label="تم التسليم"
                      active={task.workflowStatus === 'delivered'}
                      onClick={() => updateStatus(task.id, 'delivered')}
                      success
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  );
}

function ProgressBlock({ status }: { status: WorkflowStatus }) {
  const percent = status === 'pending' ? 20 : status === 'shooting' ? 40 : status === 'editing' ? 70 : status === 'ready' ? 92 : 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-text-muted">التقدم</span>
        <span className="text-primary font-semibold">{toArabicDigits(percent)}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-white/8 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.45 }}
          className="h-full rounded-full bg-primary"
        />
      </div>
    </div>
  );
}

function StageButton({
  label,
  active,
  onClick,
  success,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  success?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-xl border px-3 py-3 text-sm transition-all',
        active
          ? success
            ? 'bg-success text-white border-success'
            : 'bg-primary text-text-inverse border-primary'
          : 'bg-white/[0.03] border-main text-text-muted hover:border-primary/20 hover:text-text-main'
      )}
    >
      {label}
    </button>
  );
}

function MiniCount({ title, value }: { title: string; value: number }) {
  return (
    <div className={cn(UI.card, 'space-y-2')}>
      <p className="text-xs text-text-muted">{title}</p>
      <p className="text-xl font-display font-bold text-text-main">{toArabicDigits(value)}</p>
    </div>
  );
}

function workflowLabel(status: WorkflowStatus) {
  const labels: Record<WorkflowStatus, string> = {
    pending: 'انتظار',
    shooting: 'تصوير',
    editing: 'تعديل',
    ready: 'جاهز',
    delivered: 'تم التسليم',
  };
  return labels[status];
}
