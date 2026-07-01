import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, Calendar, Box, CreditCard, Save, X, Camera, Printer, MapPin, 
  Video, Check, AlertCircle, Clock, Banknote, ChevronRight, ChevronLeft, Sparkles, 
  Ticket, Smartphone, Layers, ShieldCheck, Phone, Gem, Target, Globe, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from '../../services/storage';
import { audioService } from '../../services/audio';
import { Package, Booking, DeliveryItem } from '../../types';
import { cn, ARABIC_MONTHS, formatDateWithDay, toArabicDigits } from '../../lib/utils';

// --- STYLES (Ultra-Professional Elite Obsidian) ---
const GLASS_FORM = "card-panel";
const INPUT_STYLE = "w-full h-18 px-8 bg-glass border border-main rounded-[2rem] text-xl font-bold text-text-main focus:border-primary focus:bg-primary/5 transition-all outline-none placeholder:text-text-muted";

// --- Premium Input Components ---
const MiniCalendar = ({ value, onChange, existingBookings }: any) => {
  const dateObj = value ? new Date(value) : new Date();
  const [view, setView] = useState({ year: dateObj.getFullYear(), month: dateObj.getMonth() });
  
  const { year, month } = view;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = new Date(year, month, 1).getDay();
  const cells: (number | null)[] = [...Array(startOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const bookingMap = React.useMemo(() => {
    const map: Record<string, number> = {};
    existingBookings.forEach((b: any) => {
      if (b.status === 'cancelled') return;
      map[b.date] = (map[b.date] || 0) + 1;
    });
    return map;
  }, [existingBookings]);

  return (
    <div className="bg-background border border-main rounded-xl p-8 shadow-inner">
      <div className="flex justify-between items-center mb-8">
        <button type="button" onClick={() => setView(v => v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 })} className="w-10 h-10 rounded-xl bg-glass flex items-center justify-center text-text-muted hover:bg-glass hover:text-text-main transition-all"><ChevronRight size={20}/></button>
        <div className="text-base font-black text-primary font-display">{ARABIC_MONTHS[month]} {toArabicDigits(year.toString())}</div>
        <button type="button" onClick={() => setView(v => v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 })} className="w-10 h-10 rounded-xl bg-glass flex items-center justify-center text-text-muted hover:bg-glass hover:text-text-main transition-all"><ChevronLeft size={20}/></button>
      </div>
      <div className="grid grid-cols-7 mb-6">
        {['أحد','إثن','ثلا','أرب','خمي','جمع','سبت'].map(d => <div key={d} className="text-center text-[10px] font-black text-text-muted uppercase tracking-widest">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isSelected = value === dateStr;
          const count = bookingMap[dateStr] || 0;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onChange(dateStr)}
              className={cn(
                "h-12 rounded-xl flex items-center justify-center text-sm font-bold transition-all relative group",
                isSelected ? "bg-primary text-text-inverse scale-110 shadow-[0_0_20px_rgba(212,175,55,0.4)] z-10" : "hover:bg-glass text-text-muted hover:text-text-main",
              )}
            >
              {toArabicDigits(day.toString())}
              {count > 0 && !isSelected && <div className={cn("absolute bottom-2 w-1.5 h-1.5 rounded-full", count >= 3 ? "bg-rose-500 shadow-[0_0_8px_#f43f5e]" : "bg-amber-500 shadow-[0_0_8px_#f59e0b]")} />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const FastInput = ({ label, icon: Icon, ...props }: any) => (
  <div className="space-y-4">
    <label className="flex items-center gap-4 px-8 text-[11px] font-black text-text-muted uppercase tracking-[0.4em]">
      <Icon size={16} className="text-primary" />
      {label}
    </label>
    <input 
      {...props}
      className={INPUT_STYLE}
    />
  </div>
);

const FastSelect = ({ label, icon: Icon, options, ...props }: any) => (
  <div className="space-y-4">
    <label className="flex items-center gap-4 px-8 text-[11px] font-black text-text-muted uppercase tracking-[0.4em]">
      <Icon size={16} className="text-primary" />
      {label}
    </label>
    <select 
      {...props}
      className={cn(INPUT_STYLE, "appearance-none cursor-pointer")}
    >
      {options.map((opt: any) => <option key={opt} value={opt} className="bg-background">{opt}</option>)}
    </select>
  </div>
);

const FormSection = ({ title, icon: Icon, children }: any) => (
  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="flex items-center gap-8">
      <div className="w-16 h-16 rounded-[1.8rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-premium">
        <Icon size={32} />
      </div>
      <h3 className="text-4xl font-black text-text-main tracking-tighter font-display">{title}</h3>
    </div>
    <div className="space-y-10">
      {children}
    </div>
  </div>
);

export default function BookingForm({ initialData, onSave, onCancel, onDataUpdate }: any) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    clientName: initialData?.clientName || '',
    phone: initialData?.phone || '',
    whatsappPhone: initialData?.whatsappPhone || '',
    isWhatsappSame: !initialData?.whatsappPhone || initialData?.whatsappPhone === initialData?.phone,
    date: initialData?.date || new Date().toISOString().split('T')[0],
    eventLocation: initialData?.eventLocation || '',
    eventTime: initialData?.eventTime || '18:00',
    eventType: initialData?.eventType || '',
    clientSource: initialData?.clientSource || '',
    discount: initialData?.discount || 0,
    paidAmount: initialData?.paidAmount || 0,
    totalPrice: initialData?.totalPrice || 0,
    remainingAmount: initialData?.remainingAmount || 0,
    deliveryDays: initialData?.deliveryDate ? Math.ceil((new Date(initialData.deliveryDate).getTime() - new Date(initialData.date || '').getTime()) / (1000 * 60 * 60 * 24)) : 30,
    deliveryMethod: initialData?.deliveryMethod || 'جوجل درايف',
    notes: initialData?.notes || '',
    bookingType: (initialData?.paidAmount || 0) > 0 ? 'confirmed' : 'temporary',
    deliveryItems: initialData?.deliveryItems || [] as DeliveryItem[],
    paymentMethod: initialData?.paymentMethod || 'cash',
  });

  const [selectedPackages, setSelectedPackages] = useState<Package[]>([]);
  const [isCustomPrice, setIsCustomPrice] = useState(initialData?.packageName === 'سعر مخصص');
  const [customPrice, setCustomPrice] = useState(initialData?.totalPrice || 0);
  const [packages, setPackages] = useState<Package[]>([]);

  useEffect(() => {
    const allPkgs = storage.getPackages();
    setPackages(allPkgs.filter(p => p.isActive !== false));
    
    if (initialData?.id) {
      if (initialData.selectedPackages && initialData.selectedPackages.length > 0) {
        setSelectedPackages(initialData.selectedPackages);
      } else if (initialData.packageName && initialData.packageName !== 'سعر مخصص') {
        const names = initialData.packageName.split(' + ');
        const matched = allPkgs.filter(p => names.includes(p.name));
        setSelectedPackages(matched);
      }
    }
  }, [initialData]);

  const totalPrice = useMemo(() => {
    return isCustomPrice ? customPrice : selectedPackages.reduce((sum, p) => sum + p.price, 0);
  }, [isCustomPrice, customPrice, selectedPackages]);

  const finalPrice = Math.max(0, totalPrice - formData.discount);
  const remainingAmount = Math.max(0, finalPrice - formData.paidAmount);

  useEffect(() => {
    if (onDataUpdate) {
      onDataUpdate({ ...formData, selectedPackages, finalPrice, remainingAmount, packageName: isCustomPrice ? 'سعر مخصص' : selectedPackages.map(p => p.name).join(' + ') });
    }
  }, [formData, selectedPackages, finalPrice, remainingAmount, isCustomPrice, onDataUpdate]);

  const togglePackage = (pkg: Package) => {
    const isSelected = selectedPackages.find(p => p.id === pkg.id);
    const newSelected = isSelected ? selectedPackages.filter(p => p.id !== pkg.id) : [...selectedPackages, pkg];
    setSelectedPackages(newSelected);
    audioService.playClick();
  };

  const handleSubmit = () => {
    if (!formData.clientName || !formData.date) {
      storage.toast('يرجى ملء اسم العميل والتاريخ', 'error');
      setCurrentStep(1);
      return;
    }

    const booking: Booking = {
      id: initialData?.id || Date.now().toString(),
      clientName: formData.clientName,
      phone: formData.phone,
      whatsappPhone: formData.isWhatsappSame ? formData.phone : formData.whatsappPhone,
      date: formData.date,
      eventLocation: formData.eventLocation,
      eventTime: formData.eventTime,
      eventType: formData.eventType,
      clientSource: formData.clientSource,
      packageName: isCustomPrice ? 'سعر مخصص' : selectedPackages.map(p => p.name).join(' + '),
      totalPrice,
      profit: isCustomPrice ? customPrice * 0.7 : selectedPackages.reduce((sum, p) => sum + (p.profit || 0), 0),
      discount: formData.discount,
      paidAmount: formData.paidAmount,
      remainingAmount,
      paymentStatus: formData.paidAmount >= finalPrice ? 'paid' : (formData.paidAmount > 0 ? 'deposit' : 'unpaid'),
      status: (initialData?.id ? initialData.status : (formData.paidAmount > 0 ? 'confirmed' : 'temporary')) as any,
      workflowStatus: initialData?.workflowStatus || 'pending',
      deliveryDate: new Date(new Date(formData.date).getTime() + formData.deliveryDays * 86400000).toISOString().split('T')[0],
      deliveryMethod: formData.deliveryMethod,
      notes: formData.notes,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      selectedPackages: isCustomPrice ? undefined : selectedPackages,
      deliveryItems: formData.deliveryItems,
      paymentMethod: formData.paymentMethod as any
    };

    onSave(booking);
  };

  const steps = [
    { id: 1, name: 'الموعد والمكان', icon: Calendar },
    { id: 2, name: 'بيانات العميل', icon: User },
    { id: 3, name: 'باقة التصوير', icon: Camera },
    { id: 4, name: 'التسوية المالية', icon: CreditCard },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
      
      {/* Main Form Area */}
      <div className="lg:col-span-8 space-y-12">
        
        {/* Step Indicator */}
        <div className="p-10 rounded-xl bg-panel border border-main backdrop-blur-xl shadow-premium relative overflow-hidden">
          <div className="flex items-center justify-between relative px-8">
            <div className="absolute top-1/2 left-8 right-8 h-px bg-glass -translate-y-1/2 z-0" />
            <motion.div 
              className="absolute top-1/2 right-8 h-px bg-primary -translate-y-1/2 z-0"
              initial={false}
              animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
            
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="relative z-10 flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => step.id <= currentStep + 1 && setCurrentStep(step.id)}
                    className={cn(
                      "w-16 h-16 rounded-[1.8rem] flex items-center justify-center transition-all duration-700",
                      isActive ? "bg-primary text-text-inverse shadow-[0_0_30px_rgba(212,175,55,0.4)] scale-110" : 
                      isCompleted ? "bg-emerald-500 text-text-main" : 
                      "bg-glass text-text-muted border border-main"
                    )}
                  >
                    {isCompleted ? <Check size={28} /> : <Icon size={28} />}
                  </button>
                  <span className={cn(
                    "absolute -bottom-10 whitespace-nowrap text-[10px] font-black tracking-[0.4em] uppercase transition-all duration-700",
                    isActive ? "text-primary opacity-100" : "text-text-muted opacity-0"
                  )}>
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content with Animation */}
        <div className={cn("p-16 rounded-2xl min-h-[650px] relative overflow-hidden", GLASS_FORM)}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
            {currentStep === 1 && (
              <FormSection title="اللوجستيات الاستراتيجية" icon={Calendar}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <FastInput label="تاريخ التنفيذ" icon={Calendar} type="date" min="2025-01-01" max="2028-12-31" value={formData.date} onChange={(e: any) => setFormData({ ...formData, date: e.target.value })} />
                  <FastInput label="وقت الحضور الملكي" icon={Clock} type="time" value={formData.eventTime} onChange={(e: any) => setFormData({ ...formData, eventTime: e.target.value })} />
                  <FastInput label="موقع الحدث" icon={MapPin} value={formData.eventLocation} onChange={(e: any) => setFormData({ ...formData, eventLocation: e.target.value })} placeholder="حدد الموقع بدقة..." />
                  <FastSelect label="بروتوكول التسليم" icon={Layers} options={['جوجل درايف', 'فلاشة خاصة', 'ألبوم مطبوع', 'أخرى']} value={formData.deliveryMethod} onChange={(e: any) => setFormData({ ...formData, deliveryMethod: e.target.value })} />
                </div>
              </FormSection>
            )}

            {currentStep === 2 && (
              <FormSection title="بيانات العضو النخبة" icon={User}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <FastInput label="اسم العميل الكامل" icon={User} value={formData.clientName} onChange={(e: any) => setFormData({ ...formData, clientName: e.target.value })} placeholder="أدخل الاسم..." />
                  <FastInput label="قناة التواصل (هاتف)" icon={Phone} value={formData.phone} onChange={(e: any) => setFormData({ ...formData, phone: e.target.value })} placeholder="01xxxxxxxxx" dir="ltr" />
                  <FastInput label="نوع المناسبة الفنية" icon={Sparkles} value={formData.eventType} onChange={(e: any) => setFormData({ ...formData, eventType: e.target.value })} placeholder="زفاف، خطوبة، تخرج..." />
                  <FastInput label="مصدر التعاقد" icon={Target} value={formData.clientSource} onChange={(e: any) => setFormData({ ...formData, clientSource: e.target.value })} placeholder="فيسبوك، انستجرام..." />
                </div>
              </FormSection>
            )}

            {currentStep === 3 && (
              <FormSection title="اختيار الباقة الملكية" icon={Camera}>
                <div className="flex gap-8 mb-12">
                   <button onClick={() => setIsCustomPrice(false)} className={cn("flex-1 h-18 rounded-2xl font-black text-xs uppercase tracking-widest transition-all", !isCustomPrice ? "bg-primary text-text-inverse shadow-premium" : "bg-glass text-text-muted hover:bg-glass")}>باقات المصور</button>
                   <button onClick={() => setIsCustomPrice(true)} className={cn("flex-1 h-18 rounded-2xl font-black text-xs uppercase tracking-widest transition-all", isCustomPrice ? "bg-primary text-text-inverse shadow-premium" : "bg-glass text-text-muted hover:bg-glass")}>تسعير مخصص</button>
                </div>

                {!isCustomPrice ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[350px] overflow-y-auto custom-scrollbar pr-4">
                    {packages.map(pkg => {
                      const isSelected = selectedPackages.find(s => s.id === pkg.id);
                      return (
                        <div key={pkg.id} onClick={() => togglePackage(pkg)} className={cn("p-10 rounded-xl border-2 transition-all cursor-pointer group relative overflow-hidden", isSelected ? "bg-primary border-primary text-text-inverse shadow-premium" : "bg-glass border-main hover:border-primary/40")}>
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-black text-xl font-display">{pkg.name}</h4>
                            {isSelected && <CheckCircle size={24} />}
                          </div>
                          <div className="text-2xl font-black font-display tabular-nums">{toArabicDigits(pkg.price.toString())} ج.م</div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <FastInput label="القيمة المتفق عليها (ج.م)" icon={Banknote} type="number" value={customPrice} onChange={(e: any) => setCustomPrice(Number(e.target.value))} />
                )}
              </FormSection>
            )}

            {currentStep === 4 && (
              <FormSection title="التسوية والاعتماد" icon={CreditCard}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <FastInput label="خصم التميز (ج.م)" icon={Ticket} type="number" value={formData.discount} onChange={(e: any) => setFormData({ ...formData, discount: Number(e.target.value) })} />
                  <FastInput label="العربون المودع (ج.م)" icon={ShieldCheck} type="number" value={formData.paidAmount} onChange={(e: any) => setFormData({ ...formData, paidAmount: Number(e.target.value) })} />
                </div>
                <div className="space-y-4 mt-10">
                  <label className="text-[11px] font-black text-text-muted uppercase tracking-[0.4em] px-8">ملاحظات البروتوكول الاستراتيجية</label>
                  <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full h-48 p-10 bg-glass border border-main rounded-xl text-lg font-bold text-text-main outline-none focus:border-primary focus:bg-primary/5 transition-all" placeholder="سجل التفاصيل الهامة هنا..." />
                </div>
              </FormSection>
            )}
          </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center mt-16 pt-12 border-t border-main">
             <button 
                type="button"
                onClick={() => currentStep > 1 && setCurrentStep(v => v - 1)}
                disabled={currentStep === 1}
                className={cn(
                   "h-20 px-10 rounded-[2rem] border transition-all font-black text-sm flex items-center gap-6",
                   currentStep === 1 ? "opacity-0 pointer-events-none" : "bg-glass border-main text-text-main hover:bg-white hover:text-text-inverse"
                )}
             >
                <ChevronRight size={24} />
                <span>الخطوة السابقة</span>
             </button>

             {currentStep < 4 ? (
                <button 
                   type="button"
                   onClick={() => {
                     if (currentStep === 1 && !formData.date) return storage.toast('يرجى تحديد تاريخ الحجز', 'error');
                     if (currentStep === 2 && (!formData.clientName || !formData.phone)) return storage.toast('يرجى إكمال بيانات العميل', 'error');
                     setCurrentStep(v => v + 1);
                     audioService.playClick();
                   }}
                   className="h-20 px-14 rounded-[2rem] bg-primary text-text-inverse font-black text-lg flex items-center gap-6 shadow-primary-glow hover:scale-105 active:scale-95 transition-all"
                >
                   <span>الخطوة التالية</span>
                   <ChevronLeft size={24} />
                </button>
             ) : (
                <button 
                   type="button"
                   onClick={handleSubmit}
                   className="h-20 px-14 rounded-[2rem] bg-primary text-text-inverse font-black text-lg flex items-center gap-8 shadow-primary-glow hover:scale-105 active:scale-95 transition-all"
                >
                   <Save size={32} />
                   <span>اعتماد البروتوكول</span>
                </button>
             )}
          </div>
        </div>
      </div>

      {/* Sticky Intelligence Sidebar */}
      <div className="lg:col-span-4">
        <div className="sticky top-12 space-y-12">
           
           <div className={cn("p-12 rounded-2xl shadow-premium relative overflow-hidden group", GLASS_FORM)}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full group-hover:bg-primary/20 transition-all duration-1000" />
              
              <div className="flex items-center gap-6 border-b border-main pb-8 mb-10">
                 <div className="w-16 h-16 rounded-[1.8rem] bg-primary flex items-center justify-center text-text-inverse shadow-premium">
                   <ShieldCheck size={36} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-text-main font-display leading-none">ملخص الاعتماد</h3>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.5em] mt-2">Real-time Summary</p>
                 </div>
              </div>

              <div className="space-y-8">
                 <SummaryItem label="قيمة الباقة" val={totalPrice} />
                 <SummaryItem label="خصم التميز" val={formData.discount} color="text-rose-500" minus />
                 <SummaryItem label="المبلغ المودع" val={formData.paidAmount} color="text-emerald-500" />
                 
                 <div className="h-px bg-glass w-full" />

                 <div className="pt-6">
                    <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.5em] mb-3">الرصيد المتبقي</div>
                    <div className="text-2xl font-display font-semibold">
                      {toArabicDigits(remainingAmount.toLocaleString())} <span className="text-sm opacity-20 mr-2 italic">ج.م</span>
                    </div>
                 </div>
              </div>
           </div>

           <MiniCalendar 
              value={formData.date} 
              onChange={(date: string) => { setFormData({ ...formData, date }); audioService.playClick(); }} 
              existingBookings={storage.getAllBookings()} 
           />
        </div>
      </div>

    </div>
  );
}

function SummaryItem({ label, val, color, minus }: any) {
  return (
    <div className="flex justify-between items-center group">
       <span className="text-base font-bold text-text-muted italic">{label}</span>
       <span className={cn("text-2xl font-black font-display tabular-nums", color || "text-text-main")}>
          {minus ? '-' : ''}{toArabicDigits(val.toLocaleString())} <span className="text-[10px] opacity-20 mr-1 italic">ج.م</span>
       </span>
    </div>
  );
}
