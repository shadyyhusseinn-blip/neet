import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MonitorPlay, Play, Coffee, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';

const formatTime = (totalSeconds: number) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

interface EditingSession {
  id: string;
  orderName: string;
  clientName: string;
  status: 'working' | 'break' | 'rendering' | 'stopped';
  lastStatusChange: number;
  totalWorkTime: number;
  totalBreakTime: number;
  totalRenderTime: number;
}

export default function EditingStatusOverlay({ onNavigate }: { onNavigate: (view: string) => void }) {
  const [activeSession, setActiveSession] = useState<EditingSession | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const checkSession = () => {
      const saved = localStorage.getItem('shadyEditingSessions');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const active = parsed.find((s: EditingSession) => s.status !== 'stopped');
            setActiveSession(active || null);
          }
        } catch {
          setActiveSession(null);
        }
      } else {
        setActiveSession(null);
      }
    };

    checkSession();
    const interval = setInterval(() => {
      setNow(Date.now());
      checkSession();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!activeSession) return null;

  const calculateDuration = () => {
    const elapsed = Math.floor((now - activeSession.lastStatusChange) / 1000);
    if (activeSession.status === 'working')
      return activeSession.totalWorkTime + elapsed + activeSession.totalRenderTime;
    if (activeSession.status === 'rendering')
      return activeSession.totalWorkTime + activeSession.totalRenderTime + elapsed;
    return activeSession.totalWorkTime + activeSession.totalRenderTime;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[550] pointer-events-auto"
        dir="rtl"
      >
        <button
          type="button"
          onClick={() => onNavigate('editing-tracker')}
          className="modal-panel px-6 py-4 flex items-center gap-6 cursor-pointer hover:scale-[1.02] active:scale-[0.99] transition-transform duration-300"
        >
          <div
            className={cn(
              'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
              activeSession.status === 'working' && 'bg-primary/20 text-primary',
              activeSession.status === 'break' && 'bg-warning/20 text-warning',
              activeSession.status === 'rendering' && 'bg-accent/20 text-accent'
            )}
          >
            {activeSession.status === 'working' ? (
              <Play className="w-5 h-5 fill-current" />
            ) : activeSession.status === 'break' ? (
              <Coffee className="w-5 h-5" />
            ) : (
              <MonitorPlay className="w-5 h-5" />
            )}
          </div>

          <div className="text-right min-w-0">
            <p className="text-[10px] text-text-muted uppercase tracking-wider">جلسة إنتاج</p>
            <p className="text-sm font-semibold text-text-main truncate max-w-[140px]">
              {activeSession.clientName}
            </p>
          </div>

          <div className="font-mono text-xl font-bold tabular-nums text-text-main border-r border-main pr-6">
            {formatTime(calculateDuration())}
          </div>

          <ExternalLink size={16} className="text-text-muted shrink-0" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
