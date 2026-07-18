import { useEffect, useMemo, useState, type ComponentType } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Calendar,
  Gem,
  Save,
  Check,
  Plus,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Wallet,
  Package as PackageIcon,
  MessageSquare,
  Phone,
  Eye,
  Trash2,
  FileText,
} from 'lucide-react';
import { audioService } from '../../services/audio';
import { storage } from '../../services/storage';
import { notificationService } from '../../services/notificationService';
import { Booking, Package as StudioPackage } from '../../types';
import { cn, toArabicDigits, ARABIC_MONTHS, formatDateWithDay } from '../../lib/utils';
// import confetti from 'canvas-confetti';
import Stepper from '../../components/ui/Stepper';
import ViewShell from '../../components/layout/ViewShell';
import { UI } from '../../lib/ui';
import { sendAdminNotificationToWebhook } from '../../utils/makeWebhook';
import { usePackages, useBookings } from '../../hooks/useFirestoreData';

const STEPS = [
  {
    id: 'date',
    label: 'التاريخ',
    icon: Calendar,
    title: 'اختر التاريخ واليوم',
    hint: 'اختر اليوم الذي تريد تنفيذ التصوير فيه.',
  },
  {
    id: 'identity',
    label: 'العميل',
    icon: User,
    title: 'أدخل بيانات العميل',
    hint: 'الاسم ورقم الهاتف والواتساب (إذا كان مختلفاً).',
  },
  {
    id: 'package',
    label: 'الباقة',
    icon: PackageIcon,
    title: 'اختر الباقة والإضافات',
    hint: 'باقة جاهزة أو سعر مخصص مع إضافات.',
  },
  {
    id: 'finance',
    label: 'الحسابات',
    icon: Wallet,
    title: 'راجع الحسابات',
    hint: 'الإجمالي، العربون، والمبلغ المتبقي.',
  },
  {
    id: 'invoice',
    label: 'الفاتورة',
    icon: FileText,
    title: 'الفاتورة النهائية',
    hint: 'ملخص الحجز الكامل قبل الحفظ.',
  },
] as const;

interface CustomAddOn {
  id: string;
  name: string;
  price: number;
}

interface NewBookingProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

interface FormState {
  date: string;
  clientName: string;
  phone: string;
  isPhoneWhatsapp: boolean;
  whatsapp: string;
  selectedPackageId: string;
  customPrice: number;
  customAddOns: CustomAddOn[];
  paidAmount: number;
  deliveryDays: number;
  paymentMethod: 'cash' | 'visa' | 'instapay' | 'vodafone';
  paymentScreenshot: string;
  notes: string;
}

export default function StaffNewBooking({ onComplete, onCancel }: NewBookingProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<FormState>({
    date: toDateKey(new Date()),
    clientName: '',
    phone: '',
    isPhoneWhatsapp: true,
    whatsapp: '',
    selectedPackageId: '',
    customPrice: 0,
    customAddOns: [],
    paidAmount: 0,
    deliveryDays: 7,
    paymentMethod: 'cash',
    paymentScreenshot: '',
    notes: '',
  });
  const { packages: firestorePackages } = usePackages();
  const { bookings: firestoreBookings } = useBookings();
  const [isCustomPrice, setIsCustomPrice] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [newAddOnName, setNewAddOnName] = useState('');
  const [newAddOnPrice, setNewAddOnPrice] = useState('');
  const [calendarView, setCalendarView] = useState(() => {
    const date = new Date();
    return { month: date.getMonth(), year: date.getFullYear() };
  });

  const packages = useMemo(() => {
    return firestorePackages.filter((pkg) => pkg.isActive !== false);
  }, [firestorePackages]);

  const allBookings = useMemo(() => {
    return firestoreBookings;
  }, [firestoreBookings]);

  useEffect(() => {
    if (!formData.date) return;
    const date = new Date(formData.date);
    if (!Number.isNaN(date.getTime())) {
      setCalendarView({ month: date.getMonth(), year: date.getFullYear() });
    }
  }, [formData.date]);

  const selectedPackage = packages.find((pkg) => pkg.id === formData.selectedPackageId) || null;
  const basePrice = isCustomPrice ? formData.customPrice : selectedPackage?.price || 0;
  const addOnsTotal = Array.isArray(formData.customAddOns) ? formData.customAddOns.reduce((sum, addon) => sum + addon.price, 0) : 0;
  const totalPrice = basePrice + addOnsTotal;
  const remainingAmount = Math.max(0, totalPrice - formData.paidAmount);
  const estimatedDeliveryDate = addDays(formData.date, formData.deliveryDays);
  const bookingStatus = formData.paidAmount > 0 ? 'confirmed' : 'temporary';
  const selectedDateLoad = allBookings.filter((booking) => booking.date === formData.date).length;

  const stepValidity = [
    !!formData.date,
    !!formData.clientName.trim() &&
      (formData.isPhoneWhatsapp ? true : !!formData.whatsapp.trim()),
    isCustomPrice ? formData.customPrice > 0 : !!selectedPackage,
    formData.paidAmount >= 0,
    true,
  ];

  const completionRate = Math.round((stepValidity.filter(Boolean).length / stepValidity.length) * 100);

  const stepSummary = useMemo(
    () =>
      STEPS.map((step, index) => ({
        ...step,
        complete: stepValidity[index],
        active: currentStepIndex === index,
      })),
    [currentStepIndex, stepValidity]
  );

  const nextStep = () => {
    if (!stepValidity[currentStepIndex]) {
      storage.toast(stepValidationMessage(currentStepIndex), 'error');
      return;
    }

    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex((index) => index + 1);
      audioService.playClick();
      return;
    }

    handleSave();
  };

  const prevStep = () => {
    if (currentStepIndex === 0) {
      onCancel?.();
      return;
    }

    setCurrentStepIndex((index) => index - 1);
    audioService.playClick();
  };

  const addCustomAddOn = () => {
    if (!newAddOnName.trim() || !newAddOnPrice.trim()) {
      storage.toast('أدخل اسم وسعر الإضافة', 'error');
      return;
    }

    const price = parseNumber(newAddOnPrice);
    if (price <= 0) {
      storage.toast('السعر يجب أن يكون أكبر من صفر', 'error');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      customAddOns: [...prev.customAddOns, { id: Date.now().toString(), name: newAddOnName.trim(), price }],
    }));
    setNewAddOnName('');
    setNewAddOnPrice('');
    audioService.playClick();
  };

  const removeCustomAddOn = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      customAddOns: prev.customAddOns.filter((addon) => addon.id !== id),
    }));
    audioService.playClick();
  };

  const handleSave = () => {
    const packageLabel = isCustomPrice ? 'سعر مخصص' : selectedPackage?.name || 'باقة غير محددة';
    const addOnNames = formData.customAddOns.map((addon) => addon.name).join(' + ');
    const finalPackageText = addOnNames ? `${packageLabel} + ${addOnNames}` : packageLabel;

    const booking: Booking = {
      id: Date.now().toString(),
      clientName: formData.clientName.trim(),
      phone: formData.phone.trim(),
      whatsappPhone: formData.isPhoneWhatsapp ? formData.phone.trim() : formData.whatsapp.trim() || formData.phone.trim(),
      date: formData.date,
      packageName: finalPackageText,
      totalPrice,
      discount: 0,
      paidAmount: formData.paidAmount,
      remainingAmount,
      paymentStatus: formData.paidAmount >= totalPrice ? 'paid' : formData.paidAmount > 0 ? 'deposit' : 'unpaid',
      status: bookingStatus,
      workflowStatus: 'pending',
      paymentMethod: formData.paymentMethod,
      paymentScreenshot: formData.paymentScreenshot || undefined,
      deliveryDate: estimatedDeliveryDate,
      deliveryMethod: 'جوجل درايف',
      eventLocation: '',
      eventTime: '10:00',
      eventType: 'حجز جديد',
      clientSource: 'النظام',
      notes: formData.notes,
      createdAt: new Date().toISOString(),
      selectedPackages: selectedPackage ? [selectedPackage] : undefined,
      paymentHistory: formData.paidAmount > 0 ? [{
        id: `${Date.now()}-payment`,
        amount: formData.paidAmount,
        date: toDateKey(new Date()),
        method: formData.paymentMethod,
        notes: 'عربون عند تسجيل الحجز',
      }] : [],
    };

    storage.saveBooking(booking);

    // Send notifications
    notificationService.sendBookingNotification(booking);
    if (formData.paidAmount > 0) {
      notificationService.sendPaymentNotification(booking);
    }

    // confetti({ particleCount: 180, spread: 90, origin: { y: 0.55 }, colors: ['#d4af37', '#ffffff', '#22c55e'] });
    audioService.playSuccess();
    setTimeout(() => onComplete?.(), 800);
  };

  return (
    <ViewShell
      title="حجز جديد"
      subtitle={`الخطوة ${toArabicDigits(currentStepIndex + 1)} من ${toArabicDigits(
        STEPS.length
      )} • ${STEPS[currentStepIndex].title}`}
      actions={
        <div className="flex gap-2 items-center">
          <button type="button" onClick={() => setShowPreview(true)} className="btn-ghost">
            <Eye size={18} />
            معاينة
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            إلغاء
          </button>
        </div>
      }
      className="pb-10"
    >
      <div className="space-y-6">
        <Stepper steps={STEPS as any} currentIndex={currentStepIndex} className="mb-1" />

        <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_0.95fr] gap-5 items-start">
          <div className="space-y-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStepIndex}
                initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className={cn(UI.section, 'space-y-6')}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs text-primary">{STEPS[currentStepIndex].label}</p>
                    <h3 className="text-2xl font-display font-bold text-white">
                      {STEPS[currentStepIndex].title}
                    </h3>
                    <p className="text-sm text-slate-400 mt-2">{STEPS[currentStepIndex].hint}</p>
                  </div>
                  <div className="rounded-full border border-white/5 bg-white/[0.03] px-3 py-2 text-xs text-slate-400">
                    {stepValidity[currentStepIndex] ? 'مكتملة' : 'تحتاج إدخال'}
                  </div>
                </div>

                {currentStepIndex === 0 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.4fr_0.9fr]">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-white flex items-center gap-2">
                          <Calendar size={16} className="text-blue-400" />
                          اكتب التاريخ أو اختره
                        </label>
                        <input
                          type="date"
                          min="2025-01-01"
                          max="2028-12-31"
                          value={formData.date}
                          onChange={(e) => {
                            setFormData((prev) => ({ ...prev, date: e.target.value }));
                            const parsed = new Date(e.target.value);
                            if (!Number.isNaN(parsed.getTime())) {
                              setCalendarView({ month: parsed.getMonth(), year: parsed.getFullYear() });
                            }
                            audioService.playClick();
                          }}
                          className="w-full h-12 bg-black/20 border border-white/10 rounded-xl px-4 text-sm font-medium text-white outline-none focus:border-blue-500/50 focus:bg-black/30 transition-all hover:scale-[1.01] backdrop-blur-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="number"
                          min={1}
                          max={12}
                          value={String(calendarView.month + 1)}
                          onChange={(event) => {
                            const month = Math.min(12, Math.max(1, parseNumber(event.target.value)));
                            const year = calendarView.year;
                            setCalendarView({ month: month - 1, year });
                            setFormData((prev) => ({
                              ...prev,
                              date: `${year}-${String(month).padStart(2, '0')}-01`,
                            }));
                            audioService.playClick();
                          }}
                          placeholder="الشهر"
                          className="field-input h-12 text-sm"
                        />
                        <input
                          type="number"
                          min={2024}
                          value={String(calendarView.year)}
                          onChange={(event) => {
                            const year = Math.max(2024, parseNumber(event.target.value));
                            const month = calendarView.month + 1;
                            setCalendarView({ month: month - 1, year });
                            setFormData((prev) => ({
                              ...prev,
                              date: `${year}-${String(month).padStart(2, '0')}-01`,
                            }));
                            audioService.playClick();
                          }}
                          placeholder="السنة"
                          className="field-input h-12 text-sm"
                        />
                      </div>
                    </div>
                    <CalendarPanel
                      value={formData.date}
                      bookings={allBookings}
                      view={calendarView}
                      onViewChange={setCalendarView}
                      onSelect={(date) => {
                        setFormData((prev) => ({ ...prev, date }));
                        audioService.playClick();
                      }}
                    />
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-2">
                      <p className="text-sm font-semibold text-white">التاريخ المختار</p>
                      <p className="text-lg font-bold text-slate-400">
                        {formData.date ? formatDateWithDay(formData.date) : 'لم يتم اختيار تاريخ'}
                      </p>
                      {selectedDateLoad > 0 && (
                        <p className="text-xs text-blue-400">
                          هناك {toArabicDigits(selectedDateLoad)} حجوزات في نفس اليوم
                        </p>
                      )}
                    </div>

                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-cyan-400" />
                        <p className="text-sm font-semibold text-white">موعد التسليم</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs text-slate-400">عدد الأيام بعد المناسبة</label>
                          <input
                            type="number"
                            min={1}
                            max={365}
                            value={String(formData.deliveryDays)}
                            onChange={(e) => {
                              const days = Math.max(1, parseNumber(e.target.value));
                              setFormData((prev) => ({ ...prev, deliveryDays: days }));
                              audioService.playClick();
                            }}
                            className="w-full h-10 bg-black/20 border border-white/10 rounded-lg px-3 text-sm font-medium text-white outline-none focus:border-blue-500/50 focus:bg-black/30 transition-all hover:scale-[1.01] backdrop-blur-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs text-slate-400">تاريخ التسليم</label>
                          <div className="h-10 bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 flex items-center text-sm font-bold text-cyan-400">
                            {formData.date ? formatDateWithDay(estimatedDeliveryDate) : '—'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStepIndex === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field
                        label="اسم العميل"
                        icon={User}
                        value={formData.clientName}
                        onChange={(value) => setFormData((prev) => ({ ...prev, clientName: value }))}
                        placeholder="اكتب اسم العميل بالكامل"
                        autoFocus
                      />
                      <Field
                        label="رقم التليفون"
                        icon={Phone}
                        value={formData.phone}
                        onChange={(value) => setFormData((prev) => ({ ...prev, phone: value }))}
                        placeholder="01xxxxxxxxx"
                        dir="ltr"
                      />
                    </div>

                    <label className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-black/20 cursor-pointer hover:bg-black/30 transition-all hover:scale-[1.01] backdrop-blur-sm">
                      <input
                        type="checkbox"
                        checked={formData.isPhoneWhatsapp}
                        onChange={(event) =>
                          setFormData((prev) => ({ ...prev, isPhoneWhatsapp: event.target.checked }))
                        }
                        className="w-4 h-4 rounded cursor-pointer"
                      />
                      <span className="text-sm text-white">هذا الرقم هو رقم الواتساب أيضاً</span>
                    </label>

                    {!formData.isPhoneWhatsapp && (
                      <Field
                        label="رقم الواتساب"
                        icon={MessageSquare}
                        value={formData.whatsapp}
                        onChange={(value) => setFormData((prev) => ({ ...prev, whatsapp: value }))}
                        placeholder="01xxxxxxxxx"
                        dir="ltr"
                      />
                    )}
                  </div>
                )}

                {currentStepIndex === 2 && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-3">
                      <ModeButton
                        active={!isCustomPrice}
                        label="باقة جاهزة"
                        onClick={() => {
                          setIsCustomPrice(false);
                          audioService.playClick();
                        }}
                      />
                      <ModeButton
                        active={isCustomPrice}
                        label="سعر مخصص"
                        onClick={() => {
                          setIsCustomPrice(true);
                          setFormData((prev) => ({ ...prev, selectedPackageId: '' }));
                          audioService.playClick();
                        }}
                      />
                    </div>

                    {!isCustomPrice ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {packages.map((pkg) => {
                          const selected = formData.selectedPackageId === pkg.id;
                          return (
                            <button
                              type="button"
                              key={pkg.id}
                              onClick={() => {
                                setFormData((prev) => ({ ...prev, selectedPackageId: pkg.id }));
                                audioService.playClick();
                              }}
                              className={cn(
                                'rounded-2xl border p-5 text-right transition-all duration-300 hover:scale-[1.02]',
                                selected
                                  ? 'border-blue-500 bg-slate-500 text-white shadow-slate-500/30'
                                  : 'border-white/5 bg-black/20 hover:border-blue-500/30 hover:bg-black/30'
                              )}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <h4 className="text-lg font-bold">{pkg.name}</h4>
                                  <p className="text-xs mt-2 leading-6 text-slate-400">
                                    {pkg.description || 'باقة بدون وصف'}
                                  </p>
                                </div>
                                {selected && <Check size={18} />}
                              </div>
                              <p className={cn('mt-4 text-2xl font-display font-bold', selected ? 'text-white' : 'text-slate-400')}>
                                {toArabicDigits(pkg.price.toLocaleString())}
                                <span className='text-xs font-normal mr-1'>ج.م</span>
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <Field
                        label="السعر المخصص"
                        icon={Gem}
                        type="number"
                        value={String(formData.customPrice || '')}
                        onChange={(value) =>
                          setFormData((prev) => ({ ...prev, customPrice: parseNumber(value) }))
                        }
                        placeholder="اكتب السعر المتفق عليه"
                        autoFocus
                      />
                    )}

                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 space-y-4">
                      <p className="text-sm font-semibold text-white">أضف شيء</p>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={newAddOnName}
                          onChange={(event) => setNewAddOnName(event.target.value)}
                          placeholder="اسم الإضافة"
                          className="field-input h-12 text-sm"
                        />
                        <input
                          type="number"
                          value={newAddOnPrice}
                          onChange={(event) => setNewAddOnPrice(event.target.value)}
                          placeholder="السعر"
                          dir="ltr"
                          className="field-input h-12 text-sm"
                        />
                      </div>
                      <button type="button" onClick={addCustomAddOn} className="btn-primary w-full">
                        <Plus size={18} />
                        إضافة
                      </button>

                      {formData.customAddOns.length > 0 && (
                        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 space-y-2">
                          <p className="text-xs text-slate-400 font-semibold">الإضافات الحالية</p>
                          {formData.customAddOns.map((addon) => (
                            <div key={addon.id} className="flex items-center justify-between gap-3 bg-white/[0.03] p-2 rounded-xl">
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{addon.name}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-400">{toArabicDigits(addon.price)} ج.م</span>
                                <button
                                  type="button"
                                  onClick={() => removeCustomAddOn(addon.id)}
                                  className="btn-ghost p-1 text-blue-400 hover:text-rose-500"
                                  aria-label="حذف الإضافة"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <MiniInvoice
                      packageName={isCustomPrice ? 'سعر مخصص' : selectedPackage?.name || 'غير محددة'}
                      packagePrice={basePrice}
                      addOns={formData.customAddOns}
                      total={totalPrice}
                    />
                  </div>
                )}

                {currentStepIndex === 3 && (
                  <div className="space-y-5">
                    <div className="space-y-3 rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-white">الحسابات</p>
                        <span className="text-xs text-slate-400">{bookingStatus}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <SummaryRow label="الإجمالي" value={formatCurrency(totalPrice)} />
                        <SummaryRow label="العربون المدفوع" value={formatCurrency(formData.paidAmount)} />
                        <SummaryRow label="المتبقي" value={formatCurrency(remainingAmount)} strong />
                      </div>
                    </div>

                    <Field
                      label="العربون"
                      icon={Wallet}
                      type="number"
                      value={String(formData.paidAmount || '')}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, paidAmount: parseNumber(value) }))
                      }
                      placeholder="0"
                    />

                    <Field
                      label="أيام التسليم"
                      icon={Calendar}
                      type="number"
                      value={String(formData.deliveryDays)}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, deliveryDays: Math.max(1, parseNumber(value)) }))
                      }
                    />

                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 space-y-3">
                      <p className="text-sm font-semibold text-white">طريقة الدفع</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {(['cash', 'visa', 'instapay', 'vodafone'] as const).map((method) => (
                          <button
                            type="button"
                            key={method}
                            onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: method }))}
                            className={cn(
                              'rounded-xl border px-3 py-3 text-sm font-semibold transition-all hover:scale-105',
                              formData.paymentMethod === method
                                ? 'border-blue-500 bg-slate-500 text-white'
                                : 'border-white/5 bg-black/20 text-slate-400 hover:border-blue-500/30 hover:bg-black/30'
                            )}
                          >
                            {method === 'cash'
                              ? 'نقدي'
                              : method === 'visa'
                              ? 'فيزا'
                              : method === 'instapay'
                              ? 'إنستاپاي'
                              : 'فودافون كاش'}
                          </button>
                        ))}
                      </div>

                      {formData.paymentMethod !== 'cash' && (
                        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 space-y-3">
                          <p className="text-sm font-semibold text-white">رفع سكرين شوت التحويل</p>
                          <input
                            type="file"
                            accept="image/*"
                            aria-label="رفع سكرين شوت التحويل"
                            placeholder="اختر صورة التحويل"
                            onChange={(event) => {
                              const file = event.target.files?.[0] || null;
                              if (!file) {
                                setFormData((prev) => ({ ...prev, paymentScreenshot: '' }));
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = () => {
                                setFormData((prev) => ({
                                  ...prev,
                                  paymentScreenshot: String(reader.result ?? ''),
                                }));
                              };
                              reader.readAsDataURL(file);
                              audioService.playClick();
                            }}
                            className="w-full text-sm text-slate-400"
                          />
                          {formData.paymentScreenshot && (
                            <img
                              src={formData.paymentScreenshot}
                              alt="سكرين شوت الدفع"
                              className="max-h-48 w-full rounded-xl object-contain border border-white/5"
                            />
                          )}
                        </div>
                      )}
                    </div>

                    <TextArea
                      label="ملاحظات إضافية"
                      icon={MessageSquare}
                      value={formData.notes}
                      onChange={(value) => setFormData((prev) => ({ ...prev, notes: value }))}
                      placeholder="أي تفاصيل عن الدفع أو التسليم"
                    />
                  </div>
                )}

                {currentStepIndex === 4 && (
                  <InvoicePreview
                    formData={formData}
                    selectedPackage={selectedPackage}
                    isCustomPrice={isCustomPrice}
                    totalPrice={totalPrice}
                    remainingAmount={remainingAmount}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            <div className={cn(UI.card, 'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between')}>
              <button type="button" onClick={prevStep} className="btn-secondary">
                <ArrowLeft size={18} />
                {currentStepIndex === 0 ? 'إلغاء' : 'السابق'}
              </button>

              <button type="button" onClick={nextStep} className="btn-primary">
                {currentStepIndex === STEPS.length - 1 ? (
                  <>
                    <Save size={18} />
                    حفظ الحجز
                  </>
                ) : (
                  <>
                    التالي
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-5 xl:sticky xl:top-6">
            <section className={cn(UI.section, 'space-y-4')}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary/12 border border-primary/20 flex items-center justify-center text-primary">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg">ملخص سريع</h3>
                  <p className="text-sm text-text-muted">تحديث مباشر أثناء إدخال البيانات.</p>
                </div>
              </div>

              <div className="space-y-3">
                <SummaryRow label="التاريخ" value={formData.date ? formatDateWithDay(formData.date) : '—'} />
                <SummaryRow label="العميل" value={formData.clientName || '—'} />
                <SummaryRow label="الرقم" value={formData.phone || '—'} />
                <SummaryRow label="الباقة" value={selectedPackage?.name || (isCustomPrice ? 'سعر مخصص' : '—')} />
              </div>

              <div className="h-px bg-white/[0.06]" />

              <div className="space-y-3">
                <SummaryRow label="الإجمالي" value={formatCurrency(totalPrice)} />
                <SummaryRow label="المدفوع" value={formatCurrency(formData.paidAmount)} positive />
                <SummaryRow label="المتبقي" value={formatCurrency(remainingAmount)} strong />
              </div>
            </section>

            <section className={cn(UI.section, 'space-y-4')}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-semibold text-lg">تقدم الخطوات</h3>
                  <p className="text-sm text-text-muted">{toArabicDigits(completionRate)}% مكتملة</p>
                </div>
              </div>

              <div className="h-2.5 rounded-full bg-white/8 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(completionRate, 6)}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>

              <div className="space-y-2">
                {stepSummary.map((step, index) => (
                  <button
                    type="button"
                    key={step.id}
                    onClick={() => setCurrentStepIndex(index)}
                    className={cn(
                      'w-full rounded-xl border px-3 py-3 text-right transition-all hover:scale-[1.02]',
                      step.active ? 'border-primary bg-primary/10' : 'border-white/10 bg-black/20 hover:border-primary/20 hover:bg-black/30'
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-9 h-9 rounded-xl flex items-center justify-center',
                            step.complete ? 'bg-emerald-500/15 text-emerald-400' : step.active ? 'bg-primary/15 text-primary' : 'bg-white/[0.05] text-text-muted'
                          )}
                        >
                          {step.complete ? '✓' : toArabicDigits(index + 1)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-main">{step.label}</p>
                          <p className="text-xs text-text-muted">{step.complete ? 'مكتمل' : 'بانتظار'}</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-text-muted" />
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPreview(false)}
            className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={cn(UI.section, 'max-w-2xl w-full max-h-[90vh] overflow-y-auto')}
            >
              <div className="flex items-center justify-between gap-4 mb-6">
                <h2 className="text-2xl font-display font-bold text-text-main">الفاتورة النهائية</h2>
                <button type="button" onClick={() => setShowPreview(false)} className="btn-ghost">
                  ✕
                </button>
              </div>
              <InvoicePreview
                formData={formData}
                selectedPackage={selectedPackage}
                isCustomPrice={isCustomPrice}
                totalPrice={totalPrice}
                remainingAmount={remainingAmount}
              />
              <div className="flex gap-3 pt-4 mt-6 border-t border-white/10">
                <button type="button" onClick={() => setShowPreview(false)} className="flex-1 btn-secondary">
                  إغلاق
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ViewShell>
  );
}

function Field({
  label,
  value,
  onChange,
  icon: Icon,
  placeholder,
  type = 'text',
  dir = 'rtl',
  autoFocus,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon: ComponentType<{ size?: number; className?: string }>;
  placeholder?: string;
  type?: string;
  dir?: 'rtl' | 'ltr';
  autoFocus?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-xs text-text-muted">
        <Icon size={14} className="text-primary" />
        {label}
      </label>
      <input
        autoFocus={autoFocus}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        dir={dir}
        disabled={disabled}
        className={cn('field-input h-12 text-sm', disabled && 'opacity-70 cursor-not-allowed')}
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  icon: Icon,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon: ComponentType<{ size?: number; className?: string }>;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-xs text-text-muted">
        <Icon size={14} className="text-primary" />
        {label}
      </label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="field-input min-h-24 resize-none py-3 text-sm"
      />
    </div>
  );
}

function ModeButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-xl border px-4 py-3 text-sm font-semibold transition-all hover:scale-105',
        active
          ? 'border-primary bg-primary text-text-inverse'
          : 'border-white/10 bg-black/20 text-text-muted hover:border-primary/25 hover:text-text-main hover:bg-black/30'
      )}
    >
      {label}
    </button>
  );
}

function CalendarPanel({
  value,
  bookings,
  view,
  onViewChange,
  onSelect,
}: {
  value: string;
  bookings: Booking[];
  view: { month: number; year: number };
  onViewChange: (next: { month: number; year: number }) => void;
  onSelect: (date: string) => void;
}) {
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const startOffset = new Date(view.year, view.month, 1).getDay();

  const bookingMap = useMemo(() => {
    const map: Record<string, number> = {};
    bookings.forEach((booking) => {
      if (booking.status === 'cancelled') return;
      map[booking.date] = (map[booking.date] || 0) + 1;
    });
    return map;
  }, [bookings]);

  return (
    <div className="rounded-2xl border border-main bg-white/[0.03] p-4 md:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-display font-semibold text-lg">{ARABIC_MONTHS[view.month]}</h4>
          <p className="text-xs text-text-muted">{toArabicDigits(view.year)}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              onViewChange(
                view.month === 0
                  ? { year: view.year - 1, month: 11 }
                  : { ...view, month: view.month - 1 }
              )
            }
            className="btn-ghost p-2"
            aria-label="الشهر السابق"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() =>
              onViewChange(
                view.month === 11
                  ? { year: view.year + 1, month: 0 }
                  : { ...view, month: view.month + 1 }
              )
            }
            className="btn-ghost p-2"
            aria-label="الشهر التالي"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'].map((day) => (
          <div key={day} className="h-8 flex items-center justify-center text-[11px] font-medium text-text-muted">
            {day}
          </div>
        ))}

        {Array.from({ length: startOffset }).map((_, index) => (
          <div key={`pad-${index}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const dateStr = `${view.year}-${String(view.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const selected = value === dateStr;
          const count = bookingMap[dateStr] || 0;

          return (
            <button
              type="button"
              key={dateStr}
              onClick={() => onSelect(dateStr)}
              className={cn(
                'relative h-12 rounded-xl text-sm font-semibold transition-all hover:scale-105',
                selected
                  ? 'bg-primary text-text-inverse shadow-primary-glow scale-105'
                  : 'bg-black/20 text-text-muted hover:bg-black/30 hover:text-text-main'
              )}
            >
              {toArabicDigits(day)}
              {count > 0 && !selected && (
                <span className={cn('absolute top-2 left-2 w-2 h-2 rounded-full', count >= 3 ? 'bg-blue-500' : 'bg-blue-500')} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MiniInvoice({
  packageName,
  packagePrice,
  addOns,
  total,
}: {
  packageName: string;
  packagePrice: number;
  addOns: CustomAddOn[];
  total: number;
}) {
  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/8 p-4 space-y-3">
      <p className="text-sm font-bold text-primary">ملخص سريع</p>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-text-muted">{packageName}</span>
          <span className="font-semibold text-text-main">{toArabicDigits(packagePrice.toLocaleString())} ج.م</span>
        </div>
        {addOns.map((addon) => (
          <div key={addon.id} className="flex items-center justify-between text-sm">
            <span className="text-text-muted">+ {addon.name}</span>
            <span className="font-semibold text-primary">{toArabicDigits(addon.price.toLocaleString())} ج.م</span>
          </div>
        ))}
        <div className="h-px bg-white/10" />
        <div className="flex items-center justify-between font-bold text-base">
          <span className="text-text-main">الإجمالي</span>
          <span className="text-primary">{toArabicDigits(total.toLocaleString())} ج.م</span>
        </div>
      </div>
    </div>
  );
}

function InvoicePreview({
  formData,
  selectedPackage,
  isCustomPrice,
  totalPrice,
  remainingAmount,
}: {
  formData: FormState;
  selectedPackage: StudioPackage | null;
  isCustomPrice: boolean;
  totalPrice: number;
  remainingAmount: number;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-main bg-white/[0.02] p-4 space-y-3">
        <p className="text-sm font-semibold text-text-main">بيانات العميل</p>
        <PreviewRow label="الاسم" value={formData.clientName || '—'} />
        <PreviewRow label="الهاتف" value={formData.phone || '—'} />
        <PreviewRow label="الواتساب" value={formData.isPhoneWhatsapp ? formData.phone || '—' : formData.whatsapp || '—'} />
        <PreviewRow label="التاريخ" value={formData.date ? formatDateWithDay(formData.date) : '—'} />
      </div>

      <div className="rounded-xl border border-main bg-white/[0.02] p-4 space-y-3">
        <p className="text-sm font-semibold text-text-main">الخدمات</p>
        <PreviewRow label="الباقة" value={isCustomPrice ? 'سعر مخصص' : selectedPackage?.name || '—'} />
        {isCustomPrice && <PreviewRow label="السعر" value={formatCurrency(formData.customPrice)} />}
        {formData.customAddOns.map((addon) => (
          <PreviewRow label={addon.name} value={formatCurrency(addon.price)} />
        ))}
      </div>

      <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 space-y-3">
        <p className="text-sm font-semibold text-primary">الملخص المالي</p>
        <PreviewRow label="الإجمالي" value={formatCurrency(totalPrice)} />
        <PreviewRow label="المدفوع" value={formatCurrency(formData.paidAmount)} positive />
        <PreviewRow label="المتبقي" value={formatCurrency(remainingAmount)} strong />
        <PreviewRow
          label="طريقة الدفع"
          value={
            formData.paymentMethod === 'cash'
              ? 'نقدي'
              : formData.paymentMethod === 'visa'
              ? 'فيزا'
              : formData.paymentMethod === 'instapay'
              ? 'إنستاپاي'
              : 'فودافون كاش'
          }
        />
        {formData.paymentScreenshot && (
          <div className="space-y-2 pt-3">
            <p className="text-xs text-text-muted">سكرين شوت التحويل</p>
            <img
              src={formData.paymentScreenshot}
              alt="سكرين شوت الدفع"
              className="max-h-48 w-full rounded-xl object-contain border border-main"
            />
          </div>
        )}
      </div>

      {formData.notes && (
        <div className="rounded-xl border border-main bg-white/[0.02] p-4">
          <p className="text-sm font-semibold text-text-main">ملاحظات</p>
          <p className="text-sm text-text-muted whitespace-pre-wrap">{formData.notes}</p>
        </div>
      )}
    </div>
  );
}

function PreviewRow({
  label,
  value,
  positive,
  negative,
  strong,
}: {
  label: string;
  value: string;
  positive?: boolean;
  negative?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-text-muted">{label}</span>
      <span
        className={cn(
          'text-sm font-semibold text-right',
          positive && 'text-emerald-400',
          negative && 'text-blue-400',
          strong && 'text-primary text-base font-bold'
        )}
      >
        {value}
      </span>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  positive,
  negative,
  strong,
}: {
  label: string;
  value: string;
  positive?: boolean;
  negative?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-text-muted">{label}</span>
      <span
        className={cn(
          'font-semibold',
          positive && 'text-emerald-400',
          negative && 'text-blue-400',
          strong && 'text-primary text-base font-bold',
          !positive && !negative && !strong && 'text-text-main'
        )}
      >
        {value}
      </span>
    </div>
  );
}

function parseNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function addDays(dateStr: string, days: number) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

function stepValidationMessage(stepIndex: number) {
  const messages = [
    'اختر التاريخ أولاً.',
    'أدخل اسم العميل، ويمكن إضافة الهاتف أو الواتساب حسب الحاجة.',
    'اختر باقة أو أدخل سعرًا مخصصًا.',
    'أدخل بيانات الحسابات.',
    'راجع الفاتورة النهائية.',
  ];
  return messages[stepIndex] || 'أكمل البيانات المطلوبة.';
}

function formatCurrency(value: number) {
  return `${toArabicDigits(value.toLocaleString())} ج.م`;
}
