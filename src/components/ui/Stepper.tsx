import { type ComponentType } from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface StepItem {
  id: string;
  label: string;
  icon?: ComponentType<{ size?: number }>;
}

interface StepperProps {
  steps: StepItem[];
  currentIndex: number;
  className?: string;
}

export default function Stepper({ steps, currentIndex, className }: StepperProps) {
  return (
    <div className={cn('flex items-center gap-1 overflow-x-auto custom-scrollbar pb-1', className)}>
      {steps.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <div key={step.id} className="flex items-center gap-1 shrink-0">
            <div
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300',
                active && 'bg-primary/15 text-primary border border-primary/30',
                done && 'text-success bg-success/10 border border-success/20',
                !active && !done && 'text-text-muted border border-transparent'
              )}
            >
              <span
                className={cn(
                  'w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold',
                  active && 'bg-primary text-text-inverse',
                  done && 'bg-success/20 text-success',
                  !active && !done && 'bg-white/[0.06]'
                )}
              >
                {done ? <Check size={12} /> : i + 1}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'w-6 h-px mx-0.5',
                  i < currentIndex ? 'bg-success/40' : 'bg-main'
                )}
              />
            )}
          </div>
        );
      })}
      <motion.div
        className="h-0.5 bg-primary/50 rounded-full absolute bottom-0 hidden"
        layoutId="step-progress"
      />
    </div>
  );
}
