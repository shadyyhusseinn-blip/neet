/**
 * Stat Card Component
 * مكون Stat Card لعرض الإحصائيات
 */

import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon?: React.ReactNode;
  color?: 'purple' | 'pink' | 'blue' | 'green' | 'orange' | 'red';
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeType,
  icon,
  color = 'purple',
  className,
}: StatCardProps) {
  const colors = {
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    pink: 'from-pink-500/20 to-pink-600/20 border-pink-500/30',
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
    red: 'from-red-500/20 to-red-600/20 border-red-500/30',
  };

  const iconColors = {
    purple: 'text-purple-400',
    pink: 'text-pink-400',
    blue: 'text-blue-400',
    green: 'text-green-400',
    orange: 'text-orange-400',
    red: 'text-red-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className={cn(
        'relative overflow-hidden bg-gradient-to-br',
        colors[color],
        'border rounded-2xl p-6 backdrop-blur-xl',
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <motion.p
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-3xl font-bold text-white"
          >
            {value}
          </motion.p>
        </div>
        {icon && (
          <div className={cn('p-3 rounded-xl bg-white/5', iconColors[color])}>
            {icon}
          </div>
        )}
      </div>

      {change !== undefined && (
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'flex items-center gap-1 text-sm font-semibold',
              changeType === 'increase' ? 'text-green-400' : 'text-red-400'
            )}
          >
            {changeType === 'increase' ? (
              <ArrowUp size={16} />
            ) : (
              <ArrowDown size={16} />
            )}
            {Math.abs(change)}%
          </div>
          <span className="text-gray-500 text-sm">من الشهر الماضي</span>
        </div>
      )}
    </motion.div>
  );
}

/**
 * Mini Stat Card Component
 * مكون Mini Stat Card صغير
 */
interface MiniStatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
}

export function MiniStatCard({ label, value, icon, color = 'text-purple-400' }: MiniStatCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
      {icon && <div className={color}>{icon}</div>}
      <div>
        <p className="text-gray-400 text-xs">{label}</p>
        <p className="text-white font-semibold">{value}</p>
      </div>
    </div>
  );
}
