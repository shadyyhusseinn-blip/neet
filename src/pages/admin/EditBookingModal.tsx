import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Save, User, Calendar, Clock, MapPin, Banknote, Edit3, 
  ShieldCheck, Sparkles, Package as PackageIcon, Activity,
  Truck, Tag, UserCheck, TrendingUp, FileText, Phone, Mail,
  Camera, Gift, CreditCard, AlertTriangle, CheckCircle2,
  Plus, Trash2, Image as ImageIcon, History, GitCompare,
  Workflow, Upload, Download, Share2, Printer, Eye,
  Check, XCircle, ArrowRight, ChevronDown, ChevronUp,
  Copy, MessageCircle, Users, FolderPlus, Folder
} from 'lucide-react';
import { Booking, Package, PaymentRecord } from '../../types';
import { cn, toArabicDigits } from '../../lib/utils';
import { audioService } from '../../services/audio';
import { storage } from '../../services/storage';

// --- المصور EDITOR THEME ---
const GLASS_MODAL = "modal-panel";

interface EditBookingModalProps {
  booking: Booking;
  onSave: (booking: Booking) => void;
  onClose: () => void;
}

export default function EditBookingModal({ booking, onSave, onClose }: EditBookingModalProps) {
  const [formData, setFormData] = useState<Partial<Booking>>(booking);
  const [activeSection, setActiveSection] = useState<'details' | 'client' | 'packages' | 'finance' | 'workflow' | 'delivery' | 'media' | 'tags' | 'history'>('details');
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [newPayment, setNewPayment] = useState({
    amount: 0,
    method: 'cash',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [newTag, setNewTag] = useState({ text: '', color: '#3b82f6' });
  
  // Package Categories Management
  const [packageCategories, setPackageCategories] = useState([
    { id: '1', name: 'باقات التصوير', packages: [
      { id: 'p1', name: 'سيشن تصوير', price: 1500 },
      { id: 'p2', name: 'تصوير زفاف', price: 8000 },
      { id: 'p3', name: 'تصوير خطوبة', price: 3000 }
    ]},
    { id: '2', name: 'باقات الأفراح', packages: [
      { id: 'p4', name: 'تصوير أطفال', price: 1200 },
      { id: 'p5', name: 'بورتريه', price: 800 }
    ]},
    { id: '3', name: 'باقات تجارية', packages: [
      { id: 'p6', name: 'تصوير كتاب', price: 2000 },
      { id: 'p7', name: 'تصوير منتجات', price: 2500 }
    ]}
  ]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingPackage, setIsAddingPackage] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [newPackageName, setNewPackageName] = useState('');
  const [newPackagePrice, setNewPackagePrice] = useState('');

  const totalPrice = Number(formData.totalPrice || 0);
  const discount = Number(formData.discount || 0);
  const finalPrice = Math.max(0, totalPrice - discount);
  const paid = Number(formData.paidAmount || 0);
  const remaining = finalPrice - paid;
  const payments = formData.paymentHistory || [];
  const statusLabelMap: Record<Booking['status'], string> = {
    confirmed: 'مؤكد',
    temporary: 'مؤقت',
    cancelled: 'ملغى',
    postponed: 'مؤجل',
    expired: 'منتهٍ'
  };

  const handleConfirmPayment = () => {
    if (newPayment.amount <= 0) {
      storage.toast('الرجاء إدخال مبلغ صحيح', 'error');
      return;
    }
    storage.addPaymentToBooking(booking.id, newPayment);
    const allBookings = storage.getAllBookings();
    const current = allBookings.find(b => b.id === booking.id);
    if (current) setFormData(current);
    setIsAddingPayment(false);
    setNewPayment({ amount: 0, method: 'cash', date: new Date().toISOString().split('T')[0], notes: '' });
    audioService.playSuccess();
    storage.toast('تمت إضافة الدفعة بنجاح', 'success');
  };

  const handleBookingAction = (action: 'cancel' | 'postpone' | 'delete') => {
    const actionLabels = {
      cancel: 'إلغاء',
      postpone: 'تأجيل',
      delete: 'حذف'
    } as const;

    if (!window.confirm(`هل أنت متأكد من ${actionLabels[action]} هذا الحجز؟`)) {
      return;
    }

    if (action === 'delete') {
      storage.deleteBooking(booking.id);
      storage.toast('تم حذف الحجز نهائيًا', 'success');
      audioService.playSuccess();
      onClose();
      return;
    }

    const targetStatus: Booking['status'] = action === 'postpone' ? 'postponed' : 'cancelled';
    storage.updateBookingStatus(booking.id, targetStatus);
    storage.toast(`تم ${actionLabels[action]} الحجز بنجاح`, 'success');
    audioService.playSuccess();
    onClose();
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      storage.toast('الرجاء إدخال اسم القسم', 'error');
      return;
    }
    const newCategory = {
      id: Date.now().toString(),
      name: newCategoryName,
      packages: []
    };
    setPackageCategories(prev => [...prev, newCategory]);
    setNewCategoryName('');
    setIsAddingCategory(false);
    audioService.playSuccess();
    storage.toast('تم إضافة القسم بنجاح', 'success');
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا القسم؟')) return;
    setPackageCategories(prev => prev.filter(cat => cat.id !== categoryId));
    audioService.playClick();
    storage.toast('تم حذف القسم', 'success');
  };

  const handleAddPackageToCategory = () => {
    if (!selectedCategoryId || !newPackageName.trim() || !newPackagePrice) {
      storage.toast('الرجاء ملء جميع البيانات', 'error');
      return;
    }
    const price = Number(newPackagePrice);
    if (isNaN(price) || price <= 0) {
      storage.toast('الرجاء إدخال سعر صحيح', 'error');
      return;
    }
    const newPackage = {
      id: Date.now().toString(),
      name: newPackageName,
      price: price
    };
    setPackageCategories(prev => prev.map(cat => 
      cat.id === selectedCategoryId 
        ? { ...cat, packages: [...cat.packages, newPackage] }
        : cat
    ));
    setNewPackageName('');
    setNewPackagePrice('');
    setIsAddingPackage(false);
    setSelectedCategoryId('');
    audioService.playSuccess();
    storage.toast('تم إضافة الباقة بنجاح', 'success');
  };

  const handleDeletePackage = (categoryId: string, packageId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الباقة؟')) return;
    setPackageCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, packages: cat.packages.filter(pkg => pkg.id !== packageId) }
        : cat
    ));
    audioService.playClick();
    storage.toast('تم حذف الباقة', 'success');
  };

  const handleAddPackage = () => {
    const packageName = window.prompt('أدخل اسم الخدمة الإضافية:');
    if (!packageName) return;
    const priceStr = window.prompt('أدخل سعر الخدمة (ج.م):');
    const price = Number(priceStr);
    if (isNaN(price)) return;
    setFormData(prev => ({
      ...prev,
      selectedPackages: [...(prev.selectedPackages || []), { id: Date.now().toString(), name: packageName, price, category: 'خدمة مضافة' as any, features: [] }],
      totalPrice: Number(prev.totalPrice || 0) + price
    }));
    audioService.playClick();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mods: any[] = [];
    const fieldsToTrack = ['clientName', 'phone', 'date', 'eventLocation', 'totalPrice', 'discount', 'notes'];
    fieldsToTrack.forEach(field => {
      if ((booking as any)[field] !== (formData as any)[field]) {
        mods.push({
          id: Date.now().toString(),
          field,
          oldValue: (booking as any)[field] || 'فارغ',
          newValue: (formData as any)[field] || 'فارغ',
          date: new Date().toISOString()
        });
      }
    });
    onSave({ 
      ...booking, 
      ...formData,
      modificationHistory: [...mods, ...(booking.modificationHistory || [])],
      remainingAmount: Math.max(0, remaining),
      paymentStatus: paid >= finalPrice ? 'paid' : (paid > 0 ? 'deposit' : 'unpaid')
    } as Booking);
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: (name.includes('Price') || name.includes('Amount') || name === 'discount' || name === 'profit' || name === 'flashDrivePrice') && value !== '' ? Number(value) : value }));
  };

  const handleAddTag = () => {
    if (!newTag.text.trim()) return;
    setFormData(prev => ({
      ...prev,
      tags: [...(prev.tags || []), { ...newTag, id: Date.now().toString() }]
    }));
    setNewTag({ text: '', color: '#3b82f6' });
    audioService.playClick();
  };

  const handleRemoveTag = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t.id !== tagId) || []
    }));
    audioService.playClick();
  };

  const handleAddDeliveryItem = () => {
    const itemName = window.prompt('أدخل اسم العنصر المراد تسليمه:');
    if (!itemName) return;
    setFormData(prev => ({
      ...prev,
      deliveryItems: [...(prev.deliveryItems || []), { id: Date.now().toString(), name: itemName, isDelivered: false }]
    }));
    audioService.playClick();
  };

  const handleToggleDeliveryItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      deliveryItems: prev.deliveryItems?.map(item => 
        item.id === itemId 
          ? { ...item, isDelivered: !item.isDelivered, deliveredAt: !item.isDelivered ? new Date().toISOString() : undefined }
          : item
      ) || []
    }));
    audioService.playClick();
  };

  return (
    <div className="fixed inset-0 z-[2500] flex items-center justify-center p-4 md:p-8" dir="rtl">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/95 backdrop-blur-3xl" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={cn("relative z-10 w-full max-w-[1600px] h-[95vh] rounded-3xl overflow-hidden flex flex-col font-sans shadow-2xl", GLASS_MODAL)}
      >
        {/* ATMOSPHERE - Vibrant New Design */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-950 via-pink-950 to-purple-950" />
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-gradient-to-br from-pink-500/25 to-rose-500/20 blur-[250px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-gradient-to-br from-purple-500/20 to-indigo-500/15 blur-[250px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-fuchsia-500/15 to-pink-500/10 blur-[200px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNjBMMCAwTDYwIDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA0KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-25" />

        {/* HEADER PROTOCOL - Vibrant New Design */}
        <header className="relative px-8 py-6 border-b border-pink-500/20 flex items-center justify-between z-20 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-rose-500/10 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-purple-500 flex items-center justify-center text-white shadow-2xl shadow-pink-500/40 ring-2 ring-pink-400/30 animate-pulse">
               <Edit3 size={32} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight bg-gradient-to-r from-pink-300 via-purple-300 to-rose-300 bg-clip-text text-transparent">تعديل الحجز</h2>
              <div className="flex items-center gap-2 mt-1.5">
                 <span className="text-xs font-bold text-pink-300/90 bg-pink-500/20 px-2 py-0.5 rounded-full">#{booking.id.slice(-8).toUpperCase()}</span>
                 <div className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 animate-pulse shadow-lg shadow-pink-500/50" />
                 <span className="text-xs font-medium text-purple-200/80">{formData.clientName}</span>
              </div>
            </div>
          </div>
          
          {/* Quick Actions Toolbar */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(formData, null, 2));
                storage.toast('تم نسخ بيانات الحجز', 'success');
                audioService.playClick();
              }}
              className="w-11 h-11 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/30 flex items-center justify-center text-pink-200/80 hover:from-pink-500/30 hover:to-rose-500/30 hover:text-white transition-all hover:scale-110 active:scale-95 shadow-lg shadow-pink-500/20"
              title="نسخ البيانات"
            >
              <Copy size={18} />
            </button>
            <button
              type="button"
              onClick={() => {
                const duplicate = { ...formData, id: Date.now().toString() + Math.random().toString(36).slice(2), clientName: formData.clientName + ' (نسخة)' };
                onSave(duplicate as Booking);
                storage.toast('تم إنشاء نسخة من الحجز', 'success');
                audioService.playSuccess();
                onClose();
              }}
              className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center text-purple-200/80 hover:from-purple-500/30 hover:to-pink-500/30 hover:text-white transition-all hover:scale-110 active:scale-95 shadow-lg shadow-purple-500/20"
              title="نسخ الحجز"
            >
              <GitCompare size={18} />
            </button>
            <button
              type="button"
              onClick={() => {
                const phone = formData.phone || formData.whatsappPhone;
                if (phone) {
                  window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank');
                  audioService.playClick();
                } else {
                  storage.toast('لا يوجد رقم هاتف', 'error');
                }
              }}
              className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-rose-500/30 flex items-center justify-center text-rose-200/80 hover:from-rose-500/30 hover:to-pink-500/30 hover:text-white transition-all hover:scale-110 active:scale-95 shadow-lg shadow-rose-500/20"
              title="فتح واتساب"
            >
              <MessageCircle size={18} />
            </button>
            <button
              type="button"
              onClick={() => {
                storage.toast('جاري إنشاء PDF...', 'info');
                audioService.playClick();
              }}
              className="w-11 h-11 rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-purple-500/20 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-200/80 hover:from-fuchsia-500/30 hover:to-purple-500/30 hover:text-white transition-all hover:scale-110 active:scale-95 shadow-lg shadow-fuchsia-500/20"
              title="تصدير PDF"
            >
              <Printer size={18} />
            </button>
            <div className="w-px h-8 bg-gradient-to-b from-pink-500/30 to-purple-500/30 mx-3" />
            <button onClick={onClose} className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-500/30 flex items-center justify-center text-red-200/80 hover:from-red-500/30 hover:to-rose-500/30 hover:text-white transition-all hover:scale-110 active:scale-95 shadow-lg shadow-red-500/20"><X size={22}/></button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden relative z-10">
           {/* SECTION NAVIGATION - Vibrant New Design */}
           <nav className="w-80 border-l border-pink-500/20 bg-gradient-to-b from-pink-500/10 via-purple-500/10 to-rose-500/10 backdrop-blur-xl flex flex-col p-5 gap-2">
             <div className="mb-5 px-3">
               <p className="text-xs font-extrabold text-pink-300/90 uppercase tracking-widest flex items-center gap-2">
                 <Activity size={14} className="text-pink-400" />
                 الأقسام
               </p>
             </div>
             
             <div className="space-y-2">
               <SectionTab icon={FileText} label="تفاصيل الحجز" active={activeSection === 'details'} onClick={() => setActiveSection('details')} />
               <SectionTab icon={User} label="العميل" active={activeSection === 'client'} onClick={() => setActiveSection('client')} />
               <SectionTab icon={PackageIcon} label="الباقات" active={activeSection === 'packages'} onClick={() => setActiveSection('packages')} />
               <SectionTab icon={Banknote} label="الماليات" active={activeSection === 'finance'} onClick={() => setActiveSection('finance')} />
               <SectionTab icon={Workflow} label="سير العمل" active={activeSection === 'workflow'} onClick={() => setActiveSection('workflow')} />
               <SectionTab icon={Truck} label="التسليم" active={activeSection === 'delivery'} onClick={() => setActiveSection('delivery')} />
               <SectionTab icon={Camera} label="الصور والمرفقات" active={activeSection === 'media'} onClick={() => setActiveSection('media')} />
               <SectionTab icon={Tag} label="الوسوم" active={activeSection === 'tags'} onClick={() => setActiveSection('tags')} />
               <SectionTab icon={History} label="سجل التعديلات" active={activeSection === 'history'} onClick={() => setActiveSection('history')} />
             </div>
             
             {/* Quick Stats */}
             <div className="mt-auto pt-5 border-t border-pink-500/20">
               <div className="rounded-2xl bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-rose-500/20 border border-pink-500/30 p-5 space-y-4 backdrop-blur-sm shadow-xl shadow-pink-500/20">
                 <div className="flex items-center justify-between">
                   <span className="text-xs font-bold text-pink-300/90">الإجمالي</span>
                   <span className="text-sm font-extrabold text-white">{formatCurrency(finalPrice)}</span>
                 </div>
                 <div className="flex items-center justify-between">
                   <span className="text-xs font-bold text-pink-300/90">المدفوع</span>
                   <span className="text-sm font-extrabold text-emerald-400">{formatCurrency(paid)}</span>
                 </div>
                 <div className="flex items-center justify-between">
                   <span className="text-xs font-bold text-pink-300/90">المتبقي</span>
                   <span className="text-sm font-extrabold text-fuchsia-400">{formatCurrency(Math.max(0, remaining))}</span>
                 </div>
               </div>
             </div>
           </nav>

           <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <form id="pro-edit-form" onSubmit={handleSubmit} className="h-full">
                <div className="grid gap-8 xl:grid-cols-[1.65fr_0.95fr]">
                  <div className="space-y-8">
                    <AnimatePresence mode="wait">
                      {activeSection === 'details' && (
                        <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                          <div className="rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-rose-500/10 p-6 space-y-6 backdrop-blur-xl shadow-xl shadow-pink-500/10">
                            <div className="flex items-center gap-3">
                              <Calendar size={22} className="text-pink-400" />
                              <p className="text-lg font-extrabold text-white">تاريخ المناسبة</p>
                            </div>
                            <input 
                              type="date" 
                              name="date" 
                              value={formData.date} 
                              onChange={handleChange} 
                              min="2025-01-01" 
                              max="2028-12-31"
                              className="w-full h-13 bg-white/5 border border-pink-500/20 rounded-2xl px-5 text-sm font-medium text-white outline-none focus:border-pink-500/50 focus:bg-gradient-to-r focus:from-pink-500/10 focus:to-purple-500/10 transition-all"
                            />
                            <EditInput label="وقت الحدث" name="eventTime" value={formData.eventTime} onChange={handleChange} icon={Clock} color="pink" />
                          </div>

                          <div className="rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-rose-500/10 p-6 space-y-6 backdrop-blur-xl shadow-xl shadow-pink-500/10">
                            <div className="flex items-center gap-3">
                              <MapPin size={22} className="text-rose-400" />
                              <p className="text-lg font-extrabold text-white">موقع الحدث</p>
                            </div>
                            <EditInput label="موقع الحدث" name="eventLocation" value={formData.eventLocation} onChange={handleChange} icon={MapPin} color="pink" />
                          </div>

                          <div className="rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-rose-500/10 p-6 space-y-6 backdrop-blur-xl shadow-xl shadow-pink-500/10">
                            <div className="flex items-center gap-3">
                              <FileText size={22} className="text-fuchsia-400" />
                              <p className="text-lg font-extrabold text-white">ملاحظات</p>
                            </div>
                            <textarea
                              name="notes"
                              value={formData.notes || ''}
                              onChange={handleChange}
                              className="w-full min-h-[140px] rounded-2xl border border-pink-500/20 bg-white/5 p-5 text-sm font-medium text-white outline-none focus:border-pink-500/50 focus:bg-gradient-to-r focus:from-pink-500/10 focus:to-purple-500/10 transition-all resize-none"
                              placeholder="اكتب ملاحظات الحجز هنا..."
                            />
                          </div>
                        </motion.div>
                      )}

                      {activeSection === 'client' && (
                        <motion.div key="client" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                          <div className="rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-rose-500/10 p-6 space-y-6 backdrop-blur-xl shadow-xl shadow-pink-500/10">
                            <div className="flex items-center gap-3">
                              <User size={22} className="text-pink-400" />
                              <p className="text-lg font-extrabold text-white">بيانات العميل</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              <div className="space-y-2.5">
                                <label className="text-xs font-extrabold text-pink-300/90">اسم العميل</label>
                                <div className="relative">
                                  <input 
                                    type="text" 
                                    name="clientName" 
                                    value={formData.clientName} 
                                    onChange={handleChange}
                                    className="w-full h-13 rounded-2xl border border-pink-500/20 bg-white/5 px-5 text-sm font-medium text-white outline-none focus:border-pink-500/50 focus:bg-gradient-to-r focus:from-pink-500/10 focus:to-purple-500/10 transition-all"
                                    placeholder="ابحث عن عميل..."
                                  />
                                  {formData.clientName && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const allBookings = storage.getAllBookings();
                                        const suggestions = allBookings
                                          .filter(b => b.clientName.toLowerCase().includes(formData.clientName?.toLowerCase() || ''))
                                          .slice(0, 3);
                                        if (suggestions.length > 0) {
                                          const suggested = suggestions[0];
                                          setFormData(prev => ({
                                            ...prev,
                                            phone: suggested.phone,
                                            whatsappPhone: suggested.whatsappPhone,
                                            eventType: suggested.eventType
                                          }));
                                          audioService.playSuccess();
                                          storage.toast('تم تعبئة البيانات تلقائياً', 'success');
                                        }
                                      }}
                                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-gradient-to-br from-pink-500/30 to-purple-500/30 text-pink-300 hover:from-pink-500/40 hover:to-purple-500/40 transition-all"
                                      title="تعبئة تلقائية من حجوزات سابقة"
                                    >
                                      <Sparkles size={16} />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <EditInput label="رقم الهاتف" name="phone" value={formData.phone} onChange={handleChange} icon={Phone} color="pink" />
                              <EditInput label="رقم واتساب" name="whatsappPhone" value={formData.whatsappPhone} onChange={handleChange} icon={Phone} color="pink" />
                              <EditInput label="البريد الإلكتروني" name="email" value={formData.email} onChange={handleChange} icon={Mail} color="pink" />
                              <EditInput label="نوع الحدث" name="eventType" value={formData.eventType} onChange={handleChange} icon={Camera} color="pink" />
                              <EditInput label="عدد الأشخاص" name="guestCount" value={formData.guestCount} onChange={handleChange} icon={Users} color="pink" />
                            </div>
                          </div>

                          <div className="rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-rose-500/10 p-6 space-y-6 backdrop-blur-xl shadow-xl shadow-pink-500/10">
                            <div className="flex items-center gap-3">
                              <UserCheck size={22} className="text-rose-400" />
                              <p className="text-lg font-extrabold text-white">معلومات إضافية</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              <EditInput label="العنوان" name="address" value={formData.address} onChange={handleChange} icon={MapPin} color="pink" />
                              <EditInput label="المدينة" name="city" value={formData.city} onChange={handleChange} icon={MapPin} color="pink" />
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeSection === 'packages' && (
                        <motion.div key="packages" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                          {/* Add Category Section */}
                          <div className="rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-rose-500/10 p-6 space-y-6 backdrop-blur-xl shadow-xl shadow-pink-500/10">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <FolderPlus size={22} className="text-fuchsia-400" />
                                <p className="text-lg font-extrabold text-white">إدارة الأقسام - جديد</p>
                              </div>
                              <button 
                                type="button" 
                                onClick={() => setIsAddingCategory(!isAddingCategory)}
                                className="text-xs font-extrabold text-pink-300/90 hover:text-pink-300 transition-colors flex items-center gap-2"
                              >
                                <Plus size={16} /> إضافة قسم جديد
                              </button>
                            </div>
                            
                            <AnimatePresence>
                              {isAddingCategory && (
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }} 
                                  animate={{ height: 'auto', opacity: 1 }} 
                                  exit={{ height: 0, opacity: 0 }}
                                  className="space-y-3"
                                >
                                  <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="اسم القسم الجديد..."
                                    className="w-full h-13 rounded-2xl border border-pink-500/20 bg-white/5 px-5 text-sm font-medium text-white outline-none focus:border-pink-500/50 focus:bg-gradient-to-r focus:from-pink-500/10 focus:to-purple-500/10 transition-all"
                                  />
                                  <div className="flex gap-3">
                                    <button
                                      type="button"
                                      onClick={handleAddCategory}
                                      className="flex-1 h-11 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-sm hover:from-pink-600 hover:to-rose-600 transition-all"
                                    >
                                      إضافة القسم
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => { setIsAddingCategory(false); setNewCategoryName(''); }}
                                      className="px-4 h-11 rounded-xl bg-white/5 text-pink-200/80 border border-pink-500/20 font-bold text-sm hover:bg-gradient-to-r hover:from-pink-500/30 hover:to-purple-500/30 hover:text-white transition-all"
                                    >
                                      إلغاء
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Categories and Packages */}
                          <div className="space-y-6">
                            {packageCategories.map((category) => (
                              <div key={category.id} className="rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-rose-500/10 p-6 space-y-6 backdrop-blur-xl shadow-xl shadow-pink-500/10">
                                <div className="flex items-center justify-between gap-4">
                                  <div className="flex items-center gap-3">
                                    <Folder size={22} className="text-pink-400" />
                                    <p className="text-lg font-extrabold text-white">{category.name}</p>
                                    <span className="text-xs font-bold text-pink-300/70 bg-pink-500/20 px-2 py-1 rounded-full">{category.packages.length} باقة</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => { setIsAddingPackage(true); setSelectedCategoryId(category.id); }}
                                      className="text-xs font-extrabold text-pink-300/90 hover:text-pink-300 transition-colors flex items-center gap-2"
                                    >
                                      <Plus size={14} /> إضافة باقة
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteCategory(category.id)}
                                      className="p-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>

                                <AnimatePresence>
                                  {isAddingPackage && selectedCategoryId === category.id && (
                                    <motion.div 
                                      initial={{ height: 0, opacity: 0 }} 
                                      animate={{ height: 'auto', opacity: 1 }} 
                                      exit={{ height: 0, opacity: 0 }}
                                      className="space-y-3 p-4 rounded-xl bg-white/5 border border-pink-500/20"
                                    >
                                      <input
                                        type="text"
                                        value={newPackageName}
                                        onChange={(e) => setNewPackageName(e.target.value)}
                                        placeholder="اسم الباقة..."
                                        className="w-full h-11 rounded-xl border border-pink-500/20 bg-white/5 px-4 text-sm font-medium text-white outline-none focus:border-pink-500/50 focus:bg-gradient-to-r focus:from-pink-500/10 focus:to-purple-500/10 transition-all"
                                      />
                                      <input
                                        type="number"
                                        value={newPackagePrice}
                                        onChange={(e) => setNewPackagePrice(e.target.value)}
                                        placeholder="السعر (ج.م)..."
                                        className="w-full h-11 rounded-xl border border-pink-500/20 bg-white/5 px-4 text-sm font-medium text-white outline-none focus:border-pink-500/50 focus:bg-gradient-to-r focus:from-pink-500/10 focus:to-purple-500/10 transition-all"
                                      />
                                      <div className="flex gap-3">
                                        <button
                                          type="button"
                                          onClick={handleAddPackageToCategory}
                                          className="flex-1 h-11 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-sm hover:from-pink-600 hover:to-rose-600 transition-all"
                                        >
                                          إضافة الباقة
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => { setIsAddingPackage(false); setSelectedCategoryId(''); setNewPackageName(''); setNewPackagePrice(''); }}
                                          className="px-4 h-11 rounded-xl bg-white/5 text-pink-200/80 border border-pink-500/20 font-bold text-sm hover:bg-gradient-to-r hover:from-pink-500/30 hover:to-purple-500/30 hover:text-white transition-all"
                                        >
                                          إلغاء
                                        </button>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>

                                <div className="grid gap-3">
                                  {category.packages.map((pkg) => (
                                    <div key={pkg.id} className="p-4 rounded-xl bg-white/5 border border-pink-500/20 flex items-center justify-between gap-4 hover:border-pink-400/30 transition-all">
                                      <div className="flex-1">
                                        <h4 className="text-base font-bold text-white">{pkg.name}</h4>
                                        <p className="text-xs text-pink-300/70 mt-1">{toArabicDigits(pkg.price.toLocaleString())} ج.م</p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setFormData(prev => ({
                                              ...prev,
                                              selectedPackages: [...(prev.selectedPackages || []), { 
                                                id: Date.now().toString(), 
                                                name: pkg.name, 
                                                price: pkg.price, 
                                                category: category.name as any, 
                                                features: [] 
                                              }],
                                              totalPrice: Number(prev.totalPrice || 0) + pkg.price
                                            }));
                                            audioService.playClick();
                                            storage.toast('تمت إضافة الباقة', 'success');
                                          }}
                                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500/30 to-rose-500/30 text-pink-200/80 border border-pink-500/30 font-bold text-xs hover:from-pink-500/50 hover:to-rose-500/50 hover:text-white transition-all"
                                        >
                                          إضافة للحجز
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeletePackage(category.id, pkg.id)}
                                          className="p-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                  {category.packages.length === 0 && (
                                    <p className="text-sm text-pink-300/70 text-center py-6">لا توجد باقات في هذا القسم</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Selected Packages */}
                          <div className="rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-rose-500/10 p-6 space-y-6 backdrop-blur-xl shadow-xl shadow-pink-500/10">
                            <div className="flex items-center gap-3">
                              <CheckCircle2 size={22} className="text-emerald-400" />
                              <p className="text-lg font-extrabold text-white">الباقات المختارة</p>
                            </div>
                            
                            <div className="grid gap-3">
                              {(formData.selectedPackages || []).map((pkg, idx) => (
                                <div key={idx} className="p-4 rounded-xl bg-white/5 border border-pink-500/20 flex items-center justify-between gap-4 hover:border-pink-400/30 transition-all">
                                  <div>
                                    <h4 className="text-base font-bold text-white">{pkg.name}</h4>
                                    <p className="text-xs text-pink-300/70 mt-1">{pkg.category}</p>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="text-lg font-extrabold text-fuchsia-400 tabular-nums">{toArabicDigits(pkg.price.toLocaleString())} ج.م</div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setFormData(prev => ({
                                          ...prev,
                                          selectedPackages: prev.selectedPackages?.filter((_, i) => i !== idx) || [],
                                          totalPrice: Math.max(0, Number(prev.totalPrice || 0) - pkg.price)
                                        }));
                                        audioService.playClick();
                                      }}
                                      className="p-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                              {(formData.selectedPackages || []).length === 0 && (
                                <p className="text-sm text-pink-300/70 text-center py-6">لا توجد باقات مختارة</p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeSection === 'media' && (
                        <motion.div key="media" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                          <div className="rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-rose-500/10 p-6 space-y-6 backdrop-blur-xl shadow-xl shadow-pink-500/10">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <ImageIcon size={22} className="text-fuchsia-400" />
                                <p className="text-lg font-extrabold text-white">المرفقات والصور</p>
                              </div>
                              <button type="button" className="text-xs font-extrabold text-pink-300/90 hover:text-pink-300 transition-colors flex items-center gap-2">
                                <Upload size={16} /> رفع ملف
                              </button>
                            </div>
                            <div className="border-2 border-dashed border-pink-500/30 rounded-2xl p-8 text-center hover:border-pink-500/50 transition-all cursor-pointer bg-white/5">
                              <ImageIcon size={48} className="text-pink-400 mx-auto mb-4" />
                              <p className="text-sm font-bold text-pink-300/80 mb-2">اسحب وأفلت الصور هنا</p>
                              <p className="text-xs text-pink-300/60">أو انقر لاختيار ملفات</p>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {formData.attachments?.slice(0, 4).map((att, idx) => (
                                <div key={idx} className="aspect-square rounded-xl bg-white/5 border border-pink-500/20 flex items-center justify-center group relative overflow-hidden">
                                  <ImageIcon size={32} className="text-pink-400/70" />
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white"><Eye size={18} /></button>
                                    <button className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white"><Download size={18} /></button>
                                    <button className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white"><Trash2 size={18} /></button>
                                  </div>
                                </div>
                              ))}
                              {(!formData.attachments || formData.attachments.length === 0) && (
                                <div className="col-span-full text-center py-6">
                                  <p className="text-sm text-pink-300/70">لا توجد مرفقات</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeSection === 'finance' && (
                        <motion.div key="finance" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                          <div className="rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-rose-500/10 p-6 space-y-6 backdrop-blur-xl shadow-xl shadow-pink-500/10">
                            <div className="flex items-center gap-3">
                              <Banknote size={22} className="text-rose-400" />
                              <p className="text-lg font-extrabold text-white">ملخص الماليات</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="rounded-xl border border-pink-500/20 bg-white/5 p-4">
                                <p className="text-xs font-bold text-pink-300/90 mb-2">المبلغ الكامل</p>
                                <p className="text-xl font-extrabold text-white">{formatCurrency(finalPrice)}</p>
                              </div>
                              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                                <p className="text-xs font-bold text-pink-300/90 mb-2">المدفوع (عربون)</p>
                                <p className="text-xl font-extrabold text-emerald-400">{formatCurrency(paid)}</p>
                              </div>
                              <div className="rounded-xl border border-pink-500/20 bg-white/5 p-4">
                                <p className="text-xs font-bold text-pink-300/90 mb-2">المتبقي</p>
                                <p className="text-xl font-extrabold text-fuchsia-400">{formatCurrency(Math.max(0, remaining))}</p>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-pink-300/80">نسبة الدفع</span>
                                <span className="font-extrabold text-white">{toArabicDigits(finalPrice > 0 ? ((paid / finalPrice) * 100).toFixed(1) : '0')}%</span>
                              </div>
                              <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${finalPrice > 0 ? (paid / finalPrice) * 100 : 0}%` }}
                                  className={cn(
                                    "h-full rounded-full transition-all duration-1000",
                                    paid >= finalPrice ? "bg-emerald-500" : "bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500"
                                  )}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-rose-500/10 p-6 space-y-6 backdrop-blur-xl shadow-xl shadow-pink-500/10">
                            <div className="flex items-center gap-3">
                              <TrendingUp size={22} className="text-fuchsia-400" />
                              <p className="text-lg font-extrabold text-white">تفاصيل الأسعار</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              <div className="space-y-2.5">
                                <label className="text-xs font-extrabold text-pink-300/90">المبلغ الأساسي</label>
                                <input 
                                  type="number" 
                                  name="totalPrice"
                                  value={formData.totalPrice || ''}
                                  onChange={handleChange}
                                  className="w-full h-13 rounded-2xl border border-pink-500/20 bg-white/5 px-5 text-sm font-medium text-white outline-none focus:border-pink-500/50 focus:bg-gradient-to-r focus:from-pink-500/10 focus:to-purple-500/10 transition-all"
                                />
                              </div>
                              <div className="space-y-2.5">
                                <label className="text-xs font-extrabold text-pink-300/90">الخصم (ج.م)</label>
                                <input 
                                  type="number" 
                                  name="discount"
                                  value={formData.discount || ''}
                                  onChange={handleChange}
                                  className="w-full h-13 rounded-2xl border border-pink-500/20 bg-white/5 px-5 text-sm font-medium text-white outline-none focus:border-pink-500/50 focus:bg-gradient-to-r focus:from-pink-500/10 focus:to-purple-500/10 transition-all"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-rose-500/10 p-6 space-y-6 backdrop-blur-xl shadow-xl shadow-pink-500/10">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <Plus size={22} className="text-pink-400" />
                                <p className="text-lg font-extrabold text-white">إضافة دفعة جديدة</p>
                              </div>
                              <button type="button" onClick={() => setIsAddingPayment(!isAddingPayment)} className="text-xs font-extrabold text-pink-300/90 hover:text-pink-300 transition-colors">
                                {isAddingPayment ? 'إغلاق' : 'إضافة'}
                              </button>
                            </div>
                            
                            {/* Payment Reminder */}
                            {remaining > 0 && (
                              <div className="rounded-xl bg-white/5 border border-pink-500/20 p-4">
                                <div className="flex items-center gap-3">
                                  <AlertTriangle size={20} className="text-pink-400" />
                                  <div className="flex-1">
                                    <p className="text-sm font-extrabold text-white">متبقي {formatCurrency(remaining)}</p>
                                    <p className="text-xs text-pink-300/70 mt-1">يمكنك إرسال تذكير بالدفع عبر واتساب</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const phone = formData.phone || formData.whatsappPhone;
                                      if (phone) {
                                        const message = `مرحباً ${formData.clientName}، نود تذكيركم بأن هناك مبلغ متبقي بقيمة ${formatCurrency(remaining)} على حجزكم. شكراً لتعاونكم.`;
                                        window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                                        audioService.playClick();
                                      } else {
                                        storage.toast('لا يوجد رقم هاتف', 'error');
                                      }
                                    }}
                                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold hover:from-pink-600 hover:to-rose-600 transition-all"
                                  >
                                    إرسال تذكير
                                  </button>
                                </div>
                              </div>
                            )}
                            
                            <AnimatePresence>
                              {isAddingPayment && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <label className="text-xs font-bold text-slate-500">المبلغ</label>
                                      <input type="number" value={newPayment.amount || ''} onChange={e => setNewPayment({ ...newPayment, amount: Number(e.target.value) })} className="w-full h-12 rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 text-sm font-medium text-white outline-none focus:border-blue-500/50 focus:bg-slate-800/70 transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-xs font-bold text-slate-500">التاريخ</label>
                                      <input type="date" min="2025-01-01" max="2028-12-31" value={newPayment.date} onChange={e => setNewPayment({ ...newPayment, date: e.target.value })} className="w-full h-12 rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 text-sm font-medium text-white outline-none focus:border-blue-500/50 focus:bg-slate-800/70 transition-all" />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">طريقة الدفع</label>
                                    <select value={newPayment.method} onChange={e => setNewPayment({ ...newPayment, method: e.target.value })} className="w-full h-12 rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 text-sm font-medium text-white outline-none focus:border-blue-500/50 focus:bg-slate-800/70 transition-all">
                                      <option value="cash">كاش</option>
                                      <option value="instapay">InstaPay</option>
                                      <option value="vodafone">فودافون كاش</option>
                                    </select>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">ملاحظات الدفع</label>
                                    <textarea value={newPayment.notes} onChange={e => setNewPayment({ ...newPayment, notes: e.target.value })} className="w-full min-h-[80px] rounded-lg border border-slate-700/50 bg-slate-800/50 p-3 text-sm font-medium text-white outline-none focus:border-blue-500/50 focus:bg-slate-800/70 transition-all resize-none" />
                                  </div>
                                  <button type="button" onClick={handleConfirmPayment} className="w-full h-12 rounded-lg bg-gradient-to-r from-blue-600 via-purple-600 to-rose-600 text-white font-semibold text-sm hover:shadow-lg transition-all">حفظ الدفعة</button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/50 p-6 space-y-4 backdrop-blur-xl">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Activity size={20} className="text-slate-400" />
                                <p className="text-lg font-bold text-white">سجل الدفعات</p>
                              </div>
                              <span className="text-xs text-slate-400">{toArabicDigits(payments.length.toString())} دفعات</span>
                            </div>
                            <div className="space-y-2">
                              {payments.length > 0 ? (
                                payments.map((item) => (
                                  <div key={item.id} className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4 hover:border-slate-600/50 transition-all">
                                    <div className="flex items-center justify-between gap-4">
                                      <div>
                                        <p className="text-base font-bold text-white">{toArabicDigits(item.amount.toLocaleString())} ج.م</p>
                                        <p className="text-xs text-slate-400 mt-1">{new Date(item.date).toLocaleDateString('ar-EG')}</p>
                                      </div>
                                      <div className="text-left">
                                        <p className="text-xs font-semibold text-blue-400">{item.method === 'cash' ? 'كاش' : item.method === 'instapay' ? 'InstaPay' : 'فودافون كاش'}</p>
                                        <p className="text-xs text-slate-400">{item.notes || 'بدون ملاحظة'}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-slate-400 text-center py-6">لا توجد دفعات مسجلة حتى الآن.</p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeSection === 'workflow' && (
                        <motion.div key="workflow" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                          <div className="rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-rose-500/10 p-6 space-y-6 backdrop-blur-xl shadow-xl shadow-pink-500/10">
                            <div className="flex items-center gap-3">
                              <Workflow size={22} className="text-fuchsia-400" />
                              <p className="text-lg font-extrabold text-white">حالة سير العمل</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {[
                                { id: 'pending', label: 'انتظار', icon: Clock },
                                { id: 'shooting', label: 'تصوير', icon: Camera },
                                { id: 'editing', label: 'تعديل', icon: Edit3 },
                                { id: 'ready', label: 'جاهز', icon: CheckCircle2 },
                                { id: 'delivered', label: 'تم التسليم', icon: Truck }
                              ].map((status) => (
                                <button
                                  key={status.id}
                                  type="button"
                                  onClick={() => { audioService.playClick(); setFormData(prev => ({ ...prev, workflowStatus: status.id as any })); }}
                                  className={cn(
                                    "p-4 rounded-xl border flex items-center gap-4 transition-all",
                                    formData.workflowStatus === status.id
                                      ? "bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 border-pink-500/40 text-white shadow-xl shadow-pink-500/30"
                                      : "bg-white/5 border-pink-500/20 text-pink-200/70 hover:bg-gradient-to-r hover:from-pink-500/20 hover:to-purple-500/20 hover:text-white hover:border-pink-400/30"
                                  )}
                                >
                                  <status.icon size={22} />
                                  <span className="text-sm font-bold">{status.label}</span>
                                  {formData.workflowStatus === status.id && <Check size={20} className="mr-auto" />}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-rose-500/10 p-6 space-y-6 backdrop-blur-xl shadow-xl shadow-pink-500/10">
                            <div className="flex items-center gap-3">
                              <TrendingUp size={22} className="text-rose-400" />
                              <p className="text-lg font-extrabold text-white">تقدم المشروع</p>
                            </div>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-pink-300/80">نسبة الإنجاز</span>
                                <span className="font-extrabold text-white">{toArabicDigits(calculateWorkflowProgress(formData.workflowStatus || 'pending'))}%</span>
                              </div>
                              <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${calculateWorkflowProgress(formData.workflowStatus || 'pending')}%` }}
                                  className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 rounded-full"
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeSection === 'delivery' && (
                        <motion.div key="delivery" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                          <div className="rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-rose-500/10 p-6 space-y-6 backdrop-blur-xl shadow-xl shadow-pink-500/10">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <Truck size={22} className="text-fuchsia-400" />
                                <p className="text-lg font-extrabold text-white">عناصر التسليم</p>
                              </div>
                              <button type="button" onClick={handleAddDeliveryItem} className="text-xs font-extrabold text-pink-300/90 hover:text-pink-300 transition-colors flex items-center gap-2">
                                <Plus size={16} /> إضافة عنصر
                              </button>
                            </div>
                            <div className="space-y-3">
                              {(formData.deliveryItems || []).length > 0 ? (
                                formData.deliveryItems.map((item) => (
                                  <div key={item.id} className="p-4 rounded-xl bg-white/5 border border-pink-500/20 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                      <button
                                        type="button"
                                        onClick={() => handleToggleDeliveryItem(item.id)}
                                        className={cn(
                                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                          item.isDelivered ? "bg-emerald-500/20 text-emerald-400" : "bg-pink-500/20 text-pink-400"
                                        )}
                                      >
                                        {item.isDelivered ? <Check size={18} /> : <XCircle size={18} />}
                                      </button>
                                      <span className={cn("text-base font-bold", item.isDelivered ? "text-emerald-400 line-through" : "text-white")}>{item.name}</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setFormData(prev => ({
                                          ...prev,
                                          deliveryItems: prev.deliveryItems?.filter(i => i.id !== item.id) || []
                                        }));
                                        audioService.playClick();
                                      }}
                                      className="text-red-400 hover:text-red-300 transition-colors"
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-pink-300/70 text-center py-8">لا توجد عناصر تسليم مضافة</p>
                              )}
                            </div>
                          </div>

                          <div className="rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-rose-500/10 p-6 space-y-6 backdrop-blur-xl shadow-xl shadow-pink-500/10">
                            <div className="flex items-center gap-3">
                              <CreditCard size={22} className="text-rose-400" />
                              <p className="text-lg font-extrabold text-white">تفاصيل التسليم</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              <EditInput label="رابط التسليم" name="deliveryLink" value={formData.deliveryLink} onChange={handleChange} icon={CreditCard} color="pink" />
                              <div className="space-y-2.5">
                                <label className="text-xs font-extrabold text-pink-300/90">تاريخ التسليم</label>
                                <input
                                  type="date"
                                  name="deliveryDate"
                                  value={formData.deliveryDate || ''}
                                  onChange={handleChange}
                                  min="2025-01-01"
                                  max="2028-12-31"
                                  className="w-full h-13 rounded-2xl border border-pink-500/20 bg-white/5 px-5 text-sm font-medium text-white outline-none focus:border-pink-500/50 focus:bg-gradient-to-r focus:from-pink-500/10 focus:to-purple-500/10 transition-all"
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeSection === 'tags' && (
                        <motion.div key="tags" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                          <div className="rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-rose-500/10 p-6 space-y-6 backdrop-blur-xl shadow-xl shadow-pink-500/10">
                            <div className="flex items-center gap-3">
                              <Tag size={22} className="text-fuchsia-400" />
                              <p className="text-lg font-extrabold text-white">الوسوم</p>
                            </div>
                            
                            <div className="flex gap-4">
                              <input
                                type="text"
                                value={newTag.text}
                                onChange={(e) => setNewTag({ ...newTag, text: e.target.value })}
                                placeholder="اسم الوسم..."
                                className="flex-1 h-13 rounded-2xl border border-pink-500/20 bg-white/5 px-5 text-sm font-medium text-white outline-none focus:border-pink-500/50 focus:bg-gradient-to-r focus:from-pink-500/10 focus:to-purple-500/10 transition-all"
                              />
                              <input
                                type="color"
                                value={newTag.color}
                                onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                                className="w-13 h-13 rounded-2xl border border-pink-500/20 bg-white/5 cursor-pointer"
                              />
                              <button
                                type="button"
                                onClick={handleAddTag}
                                className="h-13 px-6 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-sm hover:from-pink-600 hover:to-rose-600 transition-all"
                              >
                                إضافة
                              </button>
                            </div>

                            <div className="flex flex-wrap gap-3">
                              {(formData.tags || []).map((tag) => (
                                <div
                                  key={tag.id}
                                  className="px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold text-white border"
                                  style={{ backgroundColor: tag.color + '30', borderColor: tag.color + '50' }}
                                >
                                  <span>{tag.text}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveTag(tag.id)}
                                    className="hover:opacity-70 transition-opacity"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ))}
                              {(formData.tags || []).length === 0 && (
                                <p className="text-sm text-pink-300/70">لا توجد وسوم مضافة</p>
                              )}
                            </div>
                          </div>

                          <div className="rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-rose-500/10 p-6 space-y-6 backdrop-blur-xl shadow-xl shadow-pink-500/10">
                            <div className="flex items-center gap-3">
                              <Sparkles size={22} className="text-rose-400" />
                              <p className="text-lg font-extrabold text-white">الوسوم المقترحة</p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                              {['VIP', 'عاجل', 'تحت مراجعة', 'مميز', 'جديد', 'قديم'].map((suggested) => (
                                <button
                                  key={suggested}
                                  type="button"
                                  onClick={() => {
                                    if (!formData.tags?.find(t => t.text === suggested)) {
                                      handleAddTag();
                                      setNewTag({ ...newTag, text: suggested, color: '#ec4899' });
                                    }
                                  }}
                                  className="px-4 py-2 rounded-xl bg-white/5 border border-pink-500/20 text-xs font-bold text-pink-200/80 hover:bg-gradient-to-r hover:from-pink-500/30 hover:to-purple-500/30 hover:text-white transition-all"
                                >
                                  {suggested}
                                </button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeSection === 'history' && (
                        <motion.div key="history" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                          <div className="rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-rose-500/10 p-6 space-y-6 backdrop-blur-xl shadow-xl shadow-pink-500/10">
                            <div className="flex items-center gap-3">
                              <History size={22} className="text-fuchsia-400" />
                              <p className="text-lg font-extrabold text-white">سجل التعديلات</p>
                            </div>
                            
                            <div className="space-y-3">
                              {(booking.modificationHistory || []).length > 0 ? (
                                booking.modificationHistory.map((mod, idx) => (
                                  <div key={idx} className="p-4 rounded-xl bg-white/5 border border-pink-500/20 space-y-3">
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-extrabold text-pink-300/90 uppercase tracking-wider">
                                        {getFieldLabel(mod.field)}
                                      </span>
                                      <span className="text-xs text-pink-300/70">
                                        {new Date(mod.date).toLocaleDateString('ar-EG')} {new Date(mod.date).toLocaleTimeString('ar-EG')}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                      <span className="text-pink-300/60 line-through opacity-60">{mod.oldValue}</span>
                                      <ArrowRight size={16} className="text-pink-400" />
                                      <span className="text-white font-bold">{mod.newValue}</span>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-pink-300/70 text-center py-8">لا توجد تعديلات مسجلة</p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <aside className="space-y-6">
                    <div className="rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-rose-500/10 p-5 space-y-5 backdrop-blur-xl shadow-xl shadow-pink-500/10">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-extrabold text-white">الملخص المالي</p>
                          <p className="text-xs text-pink-300/70">المبلغ النهائي وبيانات الدفع الحالية.</p>
                        </div>
                        <span className="rounded-xl border border-pink-500/30 bg-pink-500/20 px-3 py-1.5 text-xs font-extrabold text-pink-300">{statusLabelMap[booking.status]}</span>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        <SummaryTile label="المبلغ النهائي" value={formatCurrency(finalPrice)} compact />
                        <SummaryTile label="المدفوع" value={formatCurrency(paid)} tone="success" compact />
                        <SummaryTile label="المتبقي" value={formatCurrency(Math.max(0, remaining))} tone={remaining > 0 ? 'danger' : 'success'} compact />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-rose-500/10 p-5 space-y-4 backdrop-blur-xl shadow-xl shadow-pink-500/10">
                      <p className="text-sm font-extrabold text-white">إجراءات سريعة</p>
                      <div className="grid grid-cols-2 gap-3">
                        <button type="button" className="h-11 rounded-xl bg-white/5 text-pink-200/80 border border-pink-500/20 font-bold text-xs hover:bg-gradient-to-r hover:from-pink-500/30 hover:to-purple-500/30 hover:text-white transition-all flex items-center justify-center gap-2">
                          <Share2 size={16} /> مشاركة
                        </button>
                        <button type="button" className="h-11 rounded-xl bg-white/5 text-pink-200/80 border border-pink-500/20 font-bold text-xs hover:bg-gradient-to-r hover:from-pink-500/30 hover:to-purple-500/30 hover:text-white transition-all flex items-center justify-center gap-2">
                          <Printer size={16} /> طباعة
                        </button>
                        <button type="button" className="h-11 rounded-xl bg-white/5 text-pink-200/80 border border-pink-500/20 font-bold text-xs hover:bg-gradient-to-r hover:from-pink-500/30 hover:to-purple-500/30 hover:text-white transition-all flex items-center justify-center gap-2">
                          <Download size={16} /> تصدير
                        </button>
                        <button type="button" className="h-11 rounded-xl bg-white/5 text-pink-200/80 border border-pink-500/20 font-bold text-xs hover:bg-gradient-to-r hover:from-pink-500/30 hover:to-purple-500/30 hover:text-white transition-all flex items-center justify-center gap-2">
                          <FileText size={16} /> نسخ
                        </button>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-rose-500/10 p-5 space-y-4 backdrop-blur-xl shadow-xl shadow-pink-500/10">
                      <p className="text-sm font-extrabold text-white">أوامر الحالة</p>
                      <button type="submit" className="w-full h-11 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-sm hover:from-pink-600 hover:to-rose-600 transition-all">حفظ التعديلات</button>
                      <button type="button" onClick={() => handleBookingAction('postpone')} className="w-full h-11 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold text-sm hover:bg-amber-500/20 transition-all">تأجيل الحجز</button>
                      <button type="button" onClick={() => handleBookingAction('cancel')} className="w-full h-11 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 font-bold text-sm hover:bg-red-500/20 transition-all">إلغاء الحجز</button>
                      <button type="button" onClick={() => handleBookingAction('delete')} className="w-full h-11 rounded-xl bg-white/5 text-pink-200/80 border border-pink-500/20 font-bold text-sm hover:bg-gradient-to-r hover:from-pink-500/30 hover:to-purple-500/30 hover:text-white transition-all">حذف نهائي</button>
                    </div>
                  </aside>
                </div>
              </form>
           </main>
        </div>

        {/* FOOTER SYNC - Vibrant New Design */}
        <footer className="px-8 py-4 border-t border-pink-500/20 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-rose-500/10 backdrop-blur-xl flex justify-between items-center z-20">
           <div className="flex items-center gap-3 text-pink-300/80">
              <ShieldCheck size={18} className="text-pink-400" />
              <span className="text-xs font-extrabold">نظام إدارة الحجوز الآمن</span>
           </div>
           <div className="flex gap-4">
              <button type="button" onClick={onClose} className="px-5 h-11 rounded-xl bg-white/5 text-xs font-extrabold text-pink-200/80 hover:bg-gradient-to-r hover:from-pink-500/30 hover:to-purple-500/30 hover:text-white transition-all">إلغاء</button>
              <button type="submit" form="pro-edit-form" className="px-5 h-11 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-extrabold flex items-center gap-2 hover:from-pink-600 hover:to-rose-600 transition-all">
                 <Save size={16} strokeWidth={1.5} />
                 حفظ التغييرات
              </button>
           </div>
        </footer>
      </motion.div>
    </div>
  );
}

function SummaryTile({ label, value, tone = 'muted', compact = false }: { label: string; value: string; tone?: 'muted' | 'success' | 'danger' | 'warning'; compact?: boolean }) {
  const toneClass = {
    muted: 'bg-slate-800/50 border-slate-700/50 text-slate-400',
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    danger: 'bg-red-500/10 border-red-500/30 text-red-400',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  } as const;

  return (
    <div className={cn('rounded-xl border p-4 transition-all hover:scale-[1.02] active:scale-[0.98]', toneClass[tone])}>
      <p className="text-xs font-bold text-slate-500 mb-1">{label}</p>
      <p className={cn('font-bold text-white', compact ? 'text-base' : 'text-lg')}>
        {value}
      </p>
    </div>
  );
}

function formatCurrency(value: number) {
  return `${toArabicDigits(value.toLocaleString())} ج.م`;
}

function calculateWorkflowProgress(status: string): number {
  const progressMap: Record<string, number> = {
    pending: 0,
    shooting: 25,
    editing: 50,
    ready: 75,
    delivered: 100
  };
  return progressMap[status] || 0;
}

function getFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    clientName: 'اسم العميل',
    phone: 'رقم الهاتف',
    date: 'تاريخ الحجز',
    eventLocation: 'موقع الحدث',
    totalPrice: 'المبلغ الكلي',
    discount: 'الخصم',
    notes: 'الملاحظات',
    eventTime: 'وقت الحدث',
    eventType: 'نوع الحدث',
    deliveryDate: 'تاريخ التسليم',
    deliveryLink: 'رابط التسليم'
  };
  return labels[field] || field;
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

function EditInput({ label, name, value, onChange, icon: Icon, color, type = "text" }: any) {
  const colorClasses: Record<string, string> = {
    primary: 'text-pink-400',
    pink: 'text-pink-400',
  };
  
  return (
    <div className="space-y-2.5">
       <label className="text-xs font-extrabold text-pink-300/90 block flex items-center gap-2">
         <Icon size={13} className={colorClasses[color] || 'text-pink-400'} />
         {label}
       </label>
       <div className="relative group">
          <input 
            type={type} name={name} value={value || ''} onChange={onChange} 
            className="w-full h-13 bg-white/5 border border-pink-500/20 rounded-2xl px-5 pl-14 text-sm font-medium text-white outline-none focus:border-pink-500/50 focus:bg-gradient-to-r focus:from-pink-500/10 focus:to-purple-500/10 focus:shadow-xl focus:shadow-pink-500/20 transition-all group-hover:border-pink-400/30" 
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center border border-pink-500/20">
            <Icon className={cn('w-5 h-5', colorClasses[color] || 'text-pink-400')} strokeWidth={1.5} />
          </div>
       </div>
    </div>
  );
}

function SectionTab({ icon: Icon, label, active, onClick }: { icon: any; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full px-5 py-4 rounded-2xl flex items-center gap-4 transition-all group text-right relative overflow-hidden",
        active 
          ? "bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 text-white shadow-2xl shadow-pink-500/40 ring-2 ring-pink-400/30" 
          : "bg-white/5 text-pink-200/70 hover:bg-gradient-to-r hover:from-pink-500/20 hover:via-rose-500/20 hover:to-purple-500/20 hover:text-white hover:scale-[1.03] active:scale-[0.97]"
      )}
    >
      {active && (
        <motion.div 
          layoutId="activeTab"
          className="absolute inset-0 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <div className="relative z-10 flex items-center gap-4">
        <Icon size={20} strokeWidth={1.5} className={active ? "text-white" : "text-pink-400/80 group-hover:text-pink-400 transition-colors"} />
        <span className="text-sm font-bold">{label}</span>
      </div>
    </button>
  );
}
