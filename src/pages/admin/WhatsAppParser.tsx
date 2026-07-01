import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  MessageCircle, Copy, CheckCircle, Save, Phone, FileText,
  Sparkles, Trash2, ChevronDown, ChevronUp, Package, DollarSign,
  CheckSquare, Square, Wand2, RotateCcw, UploadCloud, Info, AlertTriangle,
  BookOpen, Zap, Send, Star, TrendingUp, Clock, Users, Banknote,
  ArrowRight, Plus, X, Edit3, Eye, EyeOff, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from '../../services/storage';
import { firestoreData } from '../../services/firestoreData';
import { Booking } from '../../types';
import { audioService } from '../../services/audio';
import { cn, toArabicDigits, formatArabicDate } from '../../lib/utils';
import { useBookings } from '../../hooks/useFirestoreData';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface ParsedEntry {
  id: string;
  clientName: string;
  phone: string;
  totalPrice: number;
  paidAmount: number;
  remainingAmount: number;
  isPaidFull: boolean;
  packageName: string;
  notes: string;
  day: number;
  month: number;
  date: string;
  rawText: string;
  selected: boolean;
  expanded: boolean;
  confidence: 'high' | 'medium' | 'low';
}

// ─────────────────────────────────────────────
// Parsing Engine
// ─────────────────────────────────────────────

function normalizeDigits(text: string): string {
  return text.replace(/[٠١٢٣٤٥٦٧٨٩]/g, d =>
    String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))
  );
}

function extractInt(text: string): number {
  const norm = normalizeDigits(text);
  const m = norm.match(/(\d[\d,]*)/);
  if (!m) return 0;
  return parseInt(m[1].replace(/,/g, ''), 10) || 0;
}

function detectPackage(text: string): string {
  const t = text;
  if (/سيشن/.test(t)) return 'سيشن';
  if (/ميشن/.test(t)) return 'ميشن';
  if (/كتاب/.test(t)) return 'تصوير كتاب';
  if (/باكيدج/.test(t)) return 'باكيدج';
  if (/بورتريه/.test(t)) return 'بورتريه';
  if (/فيديو/.test(t)) return 'فيديو';
  if (/عقد/.test(t)) return 'تصوير عقد';
  if (/زفاف|زواج/.test(t)) return 'تصوير زفاف';
  if (/خطوبة|خطبة/.test(t)) return 'تصوير خطوبة';
  if (/أطفال|طفل/.test(t)) return 'تصوير أطفال';
  return 'باقة مخصصة';
}

function extractPhone(text: string): string {
  const norm = normalizeDigits(text);
  const m = norm.match(/(\+?20|0)?1[0-2,5]\d{8}/);
  return m ? m[0] : '';
}

function parsePayment(raw: string): {
  total: number; paid: number; remaining: number; isPaidFull: boolean;
} {
  const text = normalizeDigits(raw);
  const hasKhalas = /خالص/.test(text);
  const hasRemainder = /باقي\s+\d/.test(text);
  let isPaidFull = hasKhalas && !hasRemainder;

  let total = 0;
  const totalPatterns = [
    /(?:مبلغ|المبلغ)\s+(\d[\d,]*)/,
    /(?:باكيدج\s*[أاa]ل|بل\s*داي|الاتفاق)\s+(\d[\d,]*)/,
    /إجمالي\s+(\d[\d,]*)/,
  ];
  for (const p of totalPatterns) {
    const m = text.match(p);
    if (m) { total = parseInt(m[1].replace(/,/g, ''), 10); break; }
  }

  let remaining = 0;
  const remMatch = text.match(/باقي\s+(\d[\d,]*)/);
  if (remMatch) remaining = parseInt(remMatch[1].replace(/,/g, ''), 10);

  let paid = 0;
  const andMatch = text.match(/(?:دفع|دفعت)\s+(\d+)\s+[وw&]\s*(\d+)/);
  if (andMatch) {
    paid = parseInt(andMatch[1], 10) + parseInt(andMatch[2], 10);
  } else {
    const paidMatches = [...text.matchAll(/(?:دفع|دفعت|عربون)\s+(\d[\d,]*)/g)];
    paid = paidMatches.reduce((s, m) => s + parseInt(m[1].replace(/,/g, ''), 10), 0);
  }

  if (isPaidFull && total === 0) {
    const priceKhalas = text.match(/(\d[\d,]+)\s+خالص/);
    if (priceKhalas) total = parseInt(priceKhalas[1].replace(/,/g, ''), 10);
  }

  if (total === 0 && paid > 0 && remaining > 0) total = paid + remaining;
  if (remaining === 0 && total > 0 && paid > 0) remaining = total - paid;
  if (paid === 0 && total > 0 && remaining > 0) paid = total - remaining;
  if (isPaidFull) { if (total > 0) paid = total; remaining = 0; }
  if (isPaidFull && paid > 0 && total === 0) { total = paid; }

  return { total, paid, remaining, isPaidFull };
}

function extractName(firstLine: string): string {
  let name = firstLine.replace(/^\d+\s*[-–]\s*/, '').trim();
  name = name
    .replace(/\s+(?:مبلغ|المبلغ|الاتفاق|باكيدج|بل\s*داي|دفع|دفعت|عربون|خالص)\b.*/i, '')
    .replace(/\s+\d{3,}.*$/, '')
    .replace(/\s*[-–]\s*$/, '')
    .trim();
  return name || 'عميل غير محدد';
}

function parseWhatsAppMessage(rawText: string, targetYear?: number): ParsedEntry[] {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const currentYear = targetYear || new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  // استخدام السنة المحددة فقط
  const useYear = targetYear || currentYear;

  interface Block { day: number; month: number; lines: string[] }
  const blocks: Block[] = [];
  let currentBlock: Block | null = null;
  let currentMonthNum = 0;

  for (const line of lines) {
    const monthMatch = line.match(/شهر\s+([٠-٩\d]+)/);
    if (monthMatch) {
      currentMonthNum = extractInt(monthMatch[1]);
      continue;
    }
    if (/^[-_=ـ]{3,}$/.test(line)) continue;
    const bookingStart = line.match(/^(\d+)\s*[-–]\s*/);
    if (bookingStart) {
      if (currentBlock) blocks.push(currentBlock);
      currentBlock = {
        day: parseInt(bookingStart[1], 10),
        month: currentMonthNum,
        lines: [line],
      };
    } else if (currentBlock) {
      currentBlock.lines.push(line);
    }
  }
  if (currentBlock) blocks.push(currentBlock);

  return blocks.map((block, idx) => {
    const fullText = block.lines.join(' ');
    const clientName = extractName(block.lines[0]);
    const phone = extractPhone(fullText);
    const packageName = detectPackage(fullText);
    const payment = parsePayment(fullText);

    const detailText = block.lines.slice(1).join(' ')
      .replace(/\([^)]*\)/g, m => m.replace(/[()]/g, ' '))
      .replace(/(?:مبلغ|المبلغ|دفع|دفعت|باقي|خالص|عربون|الاتفاق|باكيدج|بل\s*داي)\s+[\d,]+/gi, '')
      .replace(/خالص/g, '')
      .replace(/\d{10,}/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

    const locMatch = block.lines[0].match(/[-–]\s*(?:دم|م|ف|في|قاعة?|لوكيشن|فندق|مارسيليا|دموق|القرح)\s*\S*/);
    const location = locMatch ? locMatch[0].replace(/^[-–]\s*/, '') : '';
    const notes = [detailText, location].filter(Boolean).join(' | ').trim();

    const month = block.month || currentMonth;
    const year = useYear;
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(block.day).padStart(2, '0')}`;

    const confidence: ParsedEntry['confidence'] =
      payment.total > 0 || payment.paid > 0 ? 'high'
        : clientName !== 'عميل غير محدد' ? 'medium'
          : 'low';

    return {
      id: `entry-${Date.now()}-${idx}-${Math.random().toString(36).slice(2)}`,
      clientName,
      phone,
      totalPrice: payment.total,
      paidAmount: payment.paid,
      remainingAmount: payment.remaining,
      isPaidFull: payment.isPaidFull,
      packageName,
      notes,
      day: block.day,
      month: block.month,
      date: dateStr,
      rawText: block.lines.join('\n'),
      selected: true,
      expanded: false,
      confidence,
    };
  });
}

// ─────────────────────────────────────────────
// Generate WhatsApp summary
// ─────────────────────────────────────────────
function generateSummary(bookings: Booking[]): string {
  if (bookings.length === 0) return 'لا توجد حجوزات نشطة حالياً.';

  const byMonth: Record<string, Booking[]> = {};
  bookings.forEach(b => {
    const d = new Date(b.date);
    const key = isNaN(d.getTime()) ? 'غير محدد' : `${d.getMonth() + 1}`;
    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key].push(b);
  });

  // حساب الإجماليات
  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const totalPaid = bookings.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
  const totalRemaining = bookings.reduce((sum, b) => sum + (b.remainingAmount || 0), 0);

  let text = '';
  const monthNames = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

  // عنوان الرسالة
  text += '📊 *ملخص الحجوزات النشطة*\n';
  text += '═════════════════════\n\n';
  
  // الملخص الإجمالي
  text += `📈 *الإحصائيات العامة:*\n`;
  text += `• عدد الحجوزات: ${toArabicDigits(totalBookings)}\n`;
  text += `• الإجمالي: ${toArabicDigits(totalRevenue)} ج.م\n`;
  text += `• المحصل: ${toArabicDigits(totalPaid)} ج.م\n`;
  text += `• المتبقي: ${toArabicDigits(totalRemaining)} ج.م\n`;
  text += '═════════════════════\n\n';

  // التفاصيل حسب الشهر
  Object.entries(byMonth)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .forEach(([monthKey, list]) => {
      const mNum = parseInt(monthKey);
      const mName = isNaN(mNum) ? monthKey : monthNames[mNum - 1] || monthKey;
      const monthTotal = list.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
      
      text += `📅 *شهر ${mName}* (${toArabicDigits(list.length)} حجز - ${toArabicDigits(monthTotal)} ج.م)\n`;
      text += '───────────────────────\n';
      
      list.sort((a, b) => a.date.localeCompare(b.date)).forEach((b) => {
        const d = new Date(b.date);
        const day = isNaN(d.getTime()) ? '' : `${d.getDate()}`;
        
        // حالة الحجز
        const status = b.remainingAmount === 0 ? '✅' : b.paidAmount > 0 ? '⏳' : '❌';
        
        text += `${status} ${day}- ${b.clientName}\n`;
        if (b.packageName && b.packageName !== 'باقة مخصصة') text += `   📦 ${b.packageName}\n`;
        
        // تفاصيل الدفع
        if (b.totalPrice > 0) {
          text += `   💰 ${toArabicDigits(b.totalPrice)} ج.م`;
          if (b.paidAmount > 0) text += ` (مدفوع ${toArabicDigits(b.paidAmount)})`;
          if (b.remainingAmount > 0) text += ` (باقي ${toArabicDigits(b.remainingAmount)})`;
          text += '\n';
        }
        
        if (b.phone) text += `   📞 ${b.phone}\n`;
        if (b.notes) text += `   💬 ${b.notes}\n`;
        text += '\n';
      });
      text += '═════════════════════\n\n';
    });

  // خاتمة الرسالة
  text += '📝 *ملاحظة:* هذه الرسالة مولدة تلقائياً من نظام الحجز\n';
  text += `🕐 ${new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;

  return text.trim();
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

const ConfidenceBadge = ({ c }: { c: ParsedEntry['confidence'] }) => {
  const map = {
    high: { label: 'دقيق', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25', dot: 'bg-emerald-400' },
    medium: { label: 'جزئي', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/25', dot: 'bg-amber-400' },
    low: { label: 'ضعيف', cls: 'bg-rose-500/15 text-rose-400 border-rose-500/25', dot: 'bg-rose-400' },
  };
  const { label, cls, dot } = map[c];
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-[10px] font-bold border px-2.5 py-0.5 rounded-full', cls)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', dot)} />
      {label}
    </span>
  );
};

interface EntryCardProps {
  entry: ParsedEntry;
  index: number;
  onToggleSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onUpdate: (id: string, patch: Partial<ParsedEntry>) => void;
  onRemove: (id: string) => void;
}

function EntryCard({ entry, index, onToggleSelect, onToggleExpand, onUpdate, onRemove }: EntryCardProps) {
  const paymentStatus = entry.isPaidFull ? 'paid' : entry.paidAmount > 0 ? 'partial' : 'unpaid';

  const statusConfig = {
    paid: { bg: 'from-emerald-500/10 to-teal-500/5', border: 'border-emerald-500/20', badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25', label: 'خالص ✓' },
    partial: { bg: 'from-amber-500/10 to-orange-500/5', border: 'border-amber-500/20', badge: 'bg-amber-500/15 text-amber-400 border-amber-500/25', label: 'جزئي' },
    unpaid: { bg: 'from-slate-500/5 to-slate-500/2', border: 'border-white/[0.07]', badge: 'bg-slate-500/15 text-slate-400 border-slate-500/25', label: 'لم يدفع' },
  };

  const sc = statusConfig[paymentStatus];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 300, damping: 28 }}
      className={cn(
        'rounded-2xl border transition-all duration-300 overflow-hidden',
        entry.selected
          ? cn('bg-gradient-to-br', sc.bg, sc.border)
          : 'border-white/[0.05] bg-white/[0.02] opacity-40'
      )}
    >
      {/* Card Header */}
      <div className="flex items-center gap-3 p-4">
        {/* Checkbox */}
        <button
          onClick={() => onToggleSelect(entry.id)}
          className={cn(
            'shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200',
            entry.selected
              ? 'bg-primary border-primary text-white'
              : 'border-white/20 hover:border-primary/50'
          )}
        >
          {entry.selected && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>
          )}
        </button>

        {/* Day Badge */}
        {entry.month > 0 && (
          <div className="shrink-0 text-center w-12">
            <div className="bg-primary/10 border border-primary/20 rounded-xl px-2 py-1">
              <div className="text-[9px] text-primary/60 leading-none font-medium">ش {toArabicDigits(entry.month)}</div>
              <div className="text-lg font-black text-primary leading-tight">{toArabicDigits(entry.day)}</div>
            </div>
          </div>
        )}

        {/* Main Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-text-main">{entry.clientName}</span>
            <ConfidenceBadge c={entry.confidence} />
          </div>
          <div className="flex items-center gap-3 mt-1 text-[11px] text-text-muted flex-wrap">
            <span className="flex items-center gap-1.5">
              <Package size={10} className="text-primary/60" />
              <span>{entry.packageName}</span>
            </span>
            {entry.phone && (
              <span className="flex items-center gap-1.5">
                <Phone size={10} className="text-primary/60" />
                <span dir="ltr">{entry.phone}</span>
              </span>
            )}
          </div>
        </div>

        {/* Payment Info */}
        <div className="shrink-0 text-right">
          <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold border px-2 py-0.5 rounded-full mb-1', sc.badge)}>
            {sc.label}
          </span>
          <div className="space-y-0.5">
            {entry.totalPrice > 0 && (
              <div className="text-xs font-bold text-text-main">{toArabicDigits(entry.totalPrice)} ج</div>
            )}
            {entry.paidAmount > 0 && !entry.isPaidFull && (
              <div className="text-[10px] text-emerald-400">دفع: {toArabicDigits(entry.paidAmount)}</div>
            )}
            {entry.remainingAmount > 0 && (
              <div className="text-[10px] text-rose-400">باقي: {toArabicDigits(entry.remainingAmount)}</div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onToggleExpand(entry.id)}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-white/10 transition-all"
          >
            {entry.expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
          <button
            onClick={() => onRemove(entry.id)}
            className="p-1.5 rounded-lg text-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-all"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Expanded Editor */}
      <AnimatePresence>
        {entry.expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/[0.06] p-4 space-y-3 bg-black/10">
              {/* Raw text preview */}
              <div className="text-[11px] text-text-muted bg-white/[0.03] rounded-xl p-3 font-mono whitespace-pre-wrap border border-white/[0.05] leading-relaxed">
                {entry.rawText}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="studio-label mb-1 block">الاسم</label>
                  <input type="text" className="field-input text-sm" value={entry.clientName}
                    onChange={e => onUpdate(entry.id, { clientName: e.target.value })} />
                </div>
                <div>
                  <label className="studio-label mb-1 block">رقم الهاتف</label>
                  <input type="text" className="field-input text-sm" value={entry.phone}
                    placeholder="لم يُذكر" onChange={e => onUpdate(entry.id, { phone: e.target.value })} />
                </div>
                <div>
                  <label className="studio-label mb-1 block">التاريخ</label>
                  <input type="date" min="2025-01-01" max="2028-12-31" className="field-input text-sm" value={entry.date}
                    onChange={e => onUpdate(entry.id, { date: e.target.value })} />
                </div>
                <div>
                  <label className="studio-label mb-1 block">الباقة</label>
                  <input type="text" className="field-input text-sm" value={entry.packageName}
                    onChange={e => onUpdate(entry.id, { packageName: e.target.value })} />
                </div>
                <div>
                  <label className="studio-label mb-1 block">الإجمالي</label>
                  <input type="number" className="field-input text-sm" value={entry.totalPrice || ''}
                    placeholder="0" onChange={e => onUpdate(entry.id, { totalPrice: parseInt(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className="studio-label mb-1 block">المدفوع</label>
                  <input type="number" className="field-input text-sm" value={entry.paidAmount || ''}
                    placeholder="0" onChange={e => onUpdate(entry.id, { paidAmount: parseInt(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className="studio-label mb-1 block">الباقي</label>
                  <input type="number" className="field-input text-sm" value={entry.remainingAmount || ''}
                    placeholder="0" onChange={e => onUpdate(entry.id, { remainingAmount: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="col-span-2">
                  <label className="studio-label mb-1 block">ملاحظات</label>
                  <textarea className="field-input text-sm resize-none h-16" value={entry.notes}
                    placeholder="أي تفاصيل إضافية..."
                    onChange={e => onUpdate(entry.id, { notes: e.target.value })} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Stats Card
// ─────────────────────────────────────────────
function StatPill({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className={cn('flex items-center gap-2 px-3 py-2 rounded-xl border', color)}>
      <Icon size={13} />
      <span className="text-[11px] font-medium opacity-75">{label}</span>
      <span className="text-[12px] font-black">{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function WhatsAppParser() {
  const [inputText, setInputText] = useState('');
  const [entries, setEntries] = useState<ParsedEntry[]>([]);
  const [isParsed, setIsParsed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const { bookings: firestoreBookings } = useBookings();
  const [generatedText, setGeneratedText] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const bookings = useMemo(() => {
    return firestoreBookings;
  }, [firestoreBookings]);

  const handleParse = useCallback(() => {
    if (!inputText.trim()) return;
    audioService.playClick();
    const parsed = parseWhatsAppMessage(inputText, selectedYear);
    setEntries(parsed);
    setIsParsed(true);
    setSavedCount(0);
  }, [inputText, selectedYear]);

  const handleReset = () => {
    setInputText('');
    setEntries([]);
    setIsParsed(false);
    setSavedCount(0);
  };

  const toggleSelect = (id: string) =>
    setEntries(prev => prev.map(e => e.id === id ? { ...e, selected: !e.selected } : e));

  const toggleExpand = (id: string) =>
    setEntries(prev => prev.map(e => e.id === id ? { ...e, expanded: !e.expanded } : e));

  const updateEntry = (id: string, patch: Partial<ParsedEntry>) =>
    setEntries(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));

  const removeEntry = (id: string) =>
    setEntries(prev => prev.filter(e => e.id !== id));

  const selectAll = () => setEntries(prev => prev.map(e => ({ ...e, selected: true })));
  const deselectAll = () => setEntries(prev => prev.map(e => ({ ...e, selected: false })));

  const selectedCount = entries.filter(e => e.selected).length;
  const selectedEntries = entries.filter(e => e.selected);
  const totalMoney = selectedEntries.reduce((s, e) => s + e.totalPrice, 0);
  const totalPaid = selectedEntries.reduce((s, e) => s + e.paidAmount, 0);
  const totalRem = selectedEntries.reduce((s, e) => s + e.remainingAmount, 0);
  const fullPaid = selectedEntries.filter(e => e.isPaidFull).length;

  const handleSaveAll = async () => {
    const toSave = entries.filter(e => e.selected);
    if (toSave.length === 0) return;
    setIsSaving(true);
    audioService.playClick();

    let successCount = 0;
    let failCount = 0;

    for (const entry of toSave) {
      const isPaid = entry.isPaidFull || entry.remainingAmount === 0;
      const payStatus = isPaid ? 'paid' : entry.paidAmount > 0 ? 'deposit' : 'unpaid';

      const booking: Booking = {
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        clientName: entry.clientName,
        phone: entry.phone,
        whatsappPhone: entry.phone,
        date: entry.date,
        packageName: entry.packageName,
        totalPrice: entry.totalPrice,
        discount: 0,
        paidAmount: entry.paidAmount,
        remainingAmount: entry.remainingAmount,
        paymentStatus: payStatus,
        status: 'confirmed',
        workflowStatus: 'pending',
        notes: entry.notes,
        createdAt: new Date().toISOString(),
      };
      
      // Save to Firestore directly
      const saved = await firestoreData.saveBooking(booking);
      if (saved) {
        successCount++;
        console.log(`✅ Saved booking: ${entry.clientName}`);
      } else {
        failCount++;
        console.error(`❌ Failed to save booking: ${entry.clientName}`);
      }
    }

    await new Promise(r => setTimeout(r, 400));
    
    if (failCount > 0) {
      audioService.playError();
      storage.showNotification('تحذير', `تم حفظ ${successCount} حجز وفشل ${failCount} حجز`);
    } else {
      audioService.playSuccess();
      storage.showNotification('نجاح', `تم حفظ ${successCount} حجز من الواتساب بنجاح ✅`);
    }
    
    setSavedCount(successCount);
    setEntries(prev => prev.filter(e => !e.selected));
    setIsSaving(false);
  };

  const handleGenerate = () => {
    audioService.playClick();
    setGeneratedText(generateSummary(bookings));
    setIsCopied(false);
  };

  const copyToClipboard = () => {
    audioService.playClick();
    navigator.clipboard.writeText(generatedText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    });
  };

  return (
    <div className="view-page" dir="rtl">

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0d1f14] via-[#0a1a10] to-[#050d08] border border-green-500/20 p-6 md:p-8 mb-2">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-emerald-400/6 rounded-full blur-2xl" />
        </div>

        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {/* WhatsApp icon */}
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                <MessageCircle size={26} className="text-white" fill="white" fillOpacity={0.2} />
              </div>
              <div className="absolute -top-1 -left-1 w-4 h-4 bg-green-400 rounded-full border-2 border-[#0d1f14] flex items-center justify-center">
                <Zap size={9} className="text-white" />
              </div>
            </div>

            <div>
              <h1 className="page-heading text-white flex items-center gap-2">
                مزامنة واتساب الذكية
              </h1>
              <p className="text-sm text-green-300/60 mt-0.5">
                استيراد وتصدير الحجوزات عبر واتساب — بضغطة واحدة
              </p>
            </div>
          </div>

          {/* Live stats */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold">
              <Users size={13} />
              <span>{toArabicDigits(bookings.length)} حجز نشط</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-text-muted text-xs font-medium">
              <Sparkles size={13} />
              <span>تحليل تلقائي بالذكاء</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="relative flex gap-1 mt-6 p-1 bg-black/20 rounded-2xl border border-white/5 w-fit">
          {[
            { id: 'import', label: 'استيراد من واتساب', icon: UploadCloud },
            { id: 'export', label: 'تصدير الحجوزات', icon: Send },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300',
                activeTab === tab.id
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                  : 'text-text-muted hover:text-text-main hover:bg-white/5'
              )}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content Area ── */}
      <AnimatePresence mode="wait">

        {/* ══ IMPORT TAB ══ */}
        {activeTab === 'import' && (
          <motion.div
            key="import"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Input Phase */}
            <AnimatePresence mode="wait">
              {!isParsed ? (
                <motion.div
                  key="input-phase"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full"
                >
                  {/* Text area */}
                  <div className="section-panel space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-green-500/10 text-green-400 rounded-xl flex items-center justify-center">
                        <MessageCircle size={18} />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-text-main">الصق رسالة الواتساب</h2>
                        <p className="text-xs text-text-muted">يمكن أن تحتوي على عشرات الحجوزات من أشهر مختلفة</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center">
                        <Calendar size={18} />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-bold text-text-muted block mb-2">السنة المستهدفة للحجوزات</label>
                        <select 
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(Number(e.target.value))}
                          className="w-full h-10 bg-white/[0.04] border border-main rounded-lg px-4 text-sm font-medium text-text-main outline-none focus:border-primary/50 transition-all"
                        >
                          <option value={2025}>2025</option>
                          <option value={2026}>2026</option>
                          <option value={2027}>2027</option>
                          <option value={2028}>2028</option>
                        </select>
                      </div>
                    </div>

                    <textarea
                      className="field-input h-64 resize-none font-mono text-sm leading-relaxed"
                      placeholder="الصق رسالة الواتساب هنا... النظام سيفهم كل حجز وكل تفصيله تلقائياً 🤖"
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      autoFocus
                    />

                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleParse}
                        disabled={!inputText.trim()}
                        className="flex-1 h-12 bg-gradient-to-l from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 disabled:opacity-40 disabled:pointer-events-none text-white rounded-2xl font-bold flex items-center justify-center gap-2.5 transition-all duration-300 shadow-lg hover:shadow-green-500/25 hover:scale-[1.01] active:scale-[0.99]"
                      >
                        <Wand2 size={18} />
                        تحليل واستخراج الحجوزات
                      </button>
                      {inputText && (
                        <button onClick={() => setInputText('')} className="btn-ghost px-3 py-3 text-text-muted hover:text-rose-400">
                          <RotateCcw size={16} />
                        </button>
                      )}
                    </div>
                  </div>


                </motion.div>

              ) : (
                /* Results Phase */
                <motion.div
                  key="results-phase"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {/* Results Header */}
                  <div className="section-panel">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/10 text-green-400 rounded-xl flex items-center justify-center">
                          <Sparkles size={20} />
                        </div>
                        <div>
                          <h2 className="text-base font-bold text-text-main">
                            تم استخراج {toArabicDigits(entries.length)} حجز
                            {savedCount > 0 && (
                              <span className="text-green-400 text-sm font-normal mr-2">
                                ({toArabicDigits(savedCount)} محفوظ ✅)
                              </span>
                            )}
                          </h2>
                          <p className="text-xs text-text-muted">{toArabicDigits(selectedCount)} محدد للحفظ</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button onClick={selectAll} className="btn-ghost text-xs px-3 py-1.5">تحديد الكل</button>
                        <button onClick={deselectAll} className="btn-ghost text-xs px-3 py-1.5">إلغاء الكل</button>
                        <button onClick={handleReset} className="btn-secondary text-xs gap-1.5">
                          <RotateCcw size={13} />
                          رسالة جديدة
                        </button>
                        <button
                          onClick={handleSaveAll}
                          disabled={selectedCount === 0 || isSaving}
                          className="h-10 px-5 bg-gradient-to-l from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 disabled:opacity-40 disabled:pointer-events-none text-white rounded-2xl font-bold flex items-center gap-2 transition-all duration-300 text-sm shadow-lg hover:shadow-green-500/20 hover:scale-[1.01]"
                        >
                          {isSaving ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}>
                              <Zap size={15} />
                            </motion.div>
                          ) : <Save size={15} />}
                          حفظ {toArabicDigits(selectedCount)} حجز
                        </button>
                      </div>
                    </div>

                    {/* Financial Stats */}
                    {entries.length > 0 && (
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/[0.06] flex-wrap">
                        <StatPill icon={DollarSign} label="الإجمالي" value={`${toArabicDigits(totalMoney)} ج`} color="bg-white/5 text-text-muted border-white/10" />
                        <StatPill icon={CheckCircle} label="مدفوع" value={`${toArabicDigits(totalPaid)} ج`} color="bg-emerald-500/10 text-emerald-400 border-emerald-500/20" />
                        <StatPill icon={Clock} label="متبقي" value={`${toArabicDigits(totalRem)} ج`} color="bg-rose-500/10 text-rose-400 border-rose-500/20" />
                        <StatPill icon={Star} label="خالص" value={toArabicDigits(fullPaid)} color="bg-primary/10 text-primary border-primary/20" />
                      </div>
                    )}
                  </div>

                  {/* Entry Cards */}
                  {entries.length === 0 ? (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="empty-state"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400 mb-2">
                        <CheckCircle size={32} />
                      </div>
                      <p className="text-text-main font-bold text-lg">تم حفظ جميع الحجوزات!</p>
                      <p className="text-text-muted text-sm">يمكنك الآن تحليل رسالة جديدة</p>
                      <button onClick={handleReset} className="mt-3 h-11 px-6 bg-gradient-to-l from-green-600 to-emerald-500 text-white rounded-2xl font-bold flex items-center gap-2 transition-all hover:scale-[1.02]">
                        <UploadCloud size={16} />
                        تحليل رسالة جديدة
                      </button>
                    </motion.div>
                  ) : (
                    <div className="space-y-2">
                      <AnimatePresence mode="popLayout">
                        {entries.map((entry, i) => (
                          <EntryCard
                            entry={entry}
                            index={i}
                            onToggleSelect={toggleSelect}
                            onToggleExpand={toggleExpand}
                            onUpdate={updateEntry}
                            onRemove={removeEntry}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ══ EXPORT TAB ══ */}
        {activeTab === 'export' && (
          <motion.div
            key="export"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-5 gap-4"
          >
            {/* Left: Actions */}
            <div className="lg:col-span-2 space-y-4">
              <div className="section-panel space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/10 text-green-400 rounded-xl flex items-center justify-center">
                    <Send size={19} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-text-main">تصدير الحجوزات</h2>
                    <p className="text-xs text-text-muted">توليد رسالة واتساب جاهزة للإرسال</p>
                  </div>
                </div>

                {/* Booking count badge */}
                <div className="flex items-center justify-between p-4 bg-green-500/5 border border-green-500/15 rounded-2xl">
                  <div>
                    <p className="text-sm font-bold text-green-400">{toArabicDigits(bookings.length)} حجز نشط</p>
                    <p className="text-[11px] text-text-muted mt-0.5">سيتم تضمينهم في الرسالة</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
                    <BookOpen size={20} className="text-green-400" />
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  className="w-full h-14 bg-gradient-to-l from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all duration-300 shadow-lg hover:shadow-green-500/25 hover:scale-[1.01] active:scale-[0.99] text-base"
                >
                  <MessageCircle size={20} />
                  توليد رسالة الحجوزات
                </button>
              </div>

              {/* Info */}
              <div className="section-panel space-y-3 text-sm text-text-muted">
                <p className="font-semibold text-text-main text-xs uppercase tracking-wider">الرسالة تتضمن</p>
                {[
                  { emoji: '📅', text: 'الحجوزات مرتبة حسب الشهر' },
                  { emoji: '👤', text: 'اسم العميل والتاريخ' },
                  { emoji: '💰', text: 'تفاصيل الدفع لكل حجز' },
                  { emoji: '📞', text: 'أرقام الهاتف' },
                  { emoji: '💬', text: 'الملاحظات الخاصة' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <span>{item.emoji}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Generated text */}
            <div className="lg:col-span-3">
              <div className="section-panel h-full space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-text-main">
                    <FileText size={15} className="text-primary" />
                    <span>الرسالة المولّدة</span>
                  </div>
                  {generatedText && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={copyToClipboard}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300',
                        isCopied
                          ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                          : 'bg-white/8 text-text-muted hover:bg-white/15 hover:text-text-main border border-white/10'
                      )}
                    >
                      {isCopied ? <CheckCircle size={13} /> : <Copy size={13} />}
                      {isCopied ? 'تم النسخ!' : 'نسخ الرسالة'}
                    </motion.button>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {generatedText ? (
                    <motion.div
                      key="text"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <textarea
                        readOnly
                        className="w-full h-80 bg-black/20 border border-white/[0.07] rounded-2xl p-5 text-sm text-green-300/90 outline-none resize-none custom-scrollbar font-mono leading-relaxed"
                        value={generatedText}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center h-80 gap-4 text-center rounded-2xl border border-dashed border-white/10 bg-black/10"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-green-500/8 flex items-center justify-center text-green-400/50">
                        <MessageCircle size={28} />
                      </div>
                      <div>
                        <p className="text-text-muted font-medium">اضغط "توليد رسالة الحجوزات"</p>
                        <p className="text-text-muted/50 text-xs mt-1">ستظهر الرسالة هنا جاهزة للنسخ</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
