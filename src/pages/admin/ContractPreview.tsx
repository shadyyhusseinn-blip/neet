import { motion } from 'motion/react';
import { FileText, Download, Printer, Share2, X, CheckCircle2, Camera, QrCode } from 'lucide-react';
import { Booking } from '../../types';
import { cn, toArabicDigits, formatArabicDate } from '../../lib/utils';

interface ContractPreviewProps {
  booking: Booking;
  onClose: () => void;
}

export default function ContractPreview({ booking, onClose }: ContractPreviewProps) {
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl overflow-y-auto custom-scrollbar">
      {/* Background glow behind the receipt */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[400px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

      <motion.div
        id="print-area"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-sm relative z-10 flex flex-col my-auto"
      >
        {/* Floating Header Actions (Not Printed) */}
        <div className="flex justify-between items-center mb-4 print-hidden">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-glass flex items-center justify-center border border-main20 backdrop-blur-xl">
                 <FileText className="w-4 h-4 text-text-main" />
              </div>
              <span className="text-text-main font-bold text-sm tracking-widest uppercase">Invoice</span>
           </div>
           <button 
             onClick={onClose}
             className="w-8 h-8 rounded-full bg-glass flex items-center justify-center border border-main20 hover:bg-rose-500/80 hover:border-rose-500 transition-all backdrop-blur-xl"
           >
             <X className="w-4 h-4 text-text-main" />
           </button>
        </div>

        {/* ========================================= */}
        {/* THE RECEIPT (Physical paper illusion) */}
        {/* ========================================= */}
        <div className="relative bg-[#FDFDFD] text-zinc-900 rounded-lg shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden">
          
          {/* Perforated Top Edge */}
          <div className="absolute top-0 left-0 right-0 h-2 w-full flex bg-[#FDFDFD]" style={{ maskImage: 'radial-gradient(circle at 4px 0, transparent 4px, black 4.5px)', maskSize: '12px 10px', maskRepeat: 'repeat-x' }} />

          {/* Watermark Logo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none flex items-center justify-center">
             <Camera className="w-64 h-64" />
          </div>

          <div className="p-8 pt-10 relative z-10" dir="rtl">
            
            {/* Header & Logo */}
            <div className="flex flex-col items-center text-center space-y-3 pb-6 border-b-2 border-dashed border-zinc-200">
               <div className="w-12 h-12 bg-zinc-900 text-text-main rounded-2xl flex items-center justify-center rotate-3 shadow-lg">
                  <Camera className="w-6 h-6 -rotate-3" />
               </div>
               <div>
                  <h1 className="text-2xl font-black tracking-tighter text-zinc-900">شادي حسين</h1>
                  <p className="text-[9px] font-black tracking-[0.3em] uppercase text-zinc-400 mt-1">Photography Studio</p>
               </div>
            </div>

            {/* Meta Info */}
            <div className="py-5 space-y-3 border-b border-zinc-100">
               <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 font-bold">رقم الإيصال</span>
                  <span className="font-black font-display tracking-widest text-zinc-900">#{toArabicDigits((booking.id || '').slice(-8).toUpperCase())}</span>
               </div>
               <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 font-bold">التاريخ</span>
                  <span className="font-black text-zinc-900">{formatArabicDate(new Date().toISOString())}</span>
               </div>
               <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 font-bold">العميل</span>
                  <span className="font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md">{booking.clientName}</span>
               </div>
               <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 font-bold">الهاتف</span>
                  <span className="font-black font-display text-zinc-900">{toArabicDigits(booking.phone || '--')}</span>
               </div>
            </div>

            {/* Event Time */}
            <div className="py-5 border-b border-zinc-100 bg-zinc-50/50 -mx-8 px-8 border-y border-dashed">
               <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                     <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">موعد التصوير</span>
                     <span className="text-sm font-black text-zinc-900 mt-1">{formatArabicDate(booking.date || '')}</span>
                  </div>
                  <div className="flex flex-col items-end">
                     <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">الوقت</span>
                     <span className="text-sm font-black text-primary font-display mt-1">{toArabicDigits(booking.eventTime || '--:--')}</span>
                  </div>
               </div>
            </div>

            {/* Services List */}
            <div className="py-6 space-y-4 border-b-2 border-zinc-900">
               <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">الخدمات والباقات</h4>
               <div className="space-y-3">
                 {booking.selectedPackages && booking.selectedPackages.length > 0 ? booking.selectedPackages.map((pkg, idx) => (
                   <div key={idx} className="flex justify-between items-start text-sm">
                      <span className="font-bold text-zinc-800 leading-tight flex-1 ml-4">{pkg.name}</span>
                      <span className="font-black text-zinc-900 font-display shrink-0">{toArabicDigits(pkg.price.toLocaleString())}</span>
                   </div>
                 )) : (
                   <div className="flex justify-between items-start text-sm">
                      <span className="font-bold text-zinc-800 leading-tight flex-1 ml-4">{booking.packageName || 'باقة مخصصة'}</span>
                      <span className="font-black text-zinc-900 font-display shrink-0">{toArabicDigits((booking.totalPrice || 0).toLocaleString())}</span>
                   </div>
                 )}
               </div>
            </div>

            {/* Totals */}
            <div className="py-5 space-y-2 border-b-2 border-dashed border-zinc-200">
               <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500 font-bold">الإجمالي الكلي</span>
                  <span className="font-black text-zinc-900 font-display">{toArabicDigits((booking.totalPrice || 0).toLocaleString())} ج.م</span>
               </div>
               {(booking.discount || 0) > 0 && (
                  <div className="flex justify-between items-center text-sm text-rose-500">
                     <span className="font-bold">الخصم</span>
                     <span className="font-black font-display">-{toArabicDigits((booking.discount || 0).toLocaleString())} ج.م</span>
                  </div>
               )}
               <div className="flex justify-between items-center text-sm">
                  <span className="text-emerald-600 font-bold">المدفوع مقدماً</span>
                  <span className="font-black text-emerald-600 font-display">{toArabicDigits((booking.paidAmount || 0).toLocaleString())} ج.م</span>
               </div>
               <div className="flex justify-between items-center pt-3 mt-3 border-t border-zinc-100">
                  <span className="text-zinc-900 font-black">المبلغ المتبقي</span>
                  <span className="font-black text-xl text-primary font-display">
                     {toArabicDigits((booking.remainingAmount || 0).toLocaleString())} ج.م
                  </span>
               </div>
            </div>

            {/* Footer / Barcode */}
            <div className="pt-8 pb-4 flex flex-col items-center space-y-4">
               <div className="w-full h-12 flex items-center justify-center opacity-40">
                 {/* Fake Barcode Effect */}
                 <div className="w-full flex justify-between items-end h-full px-4">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <div key={i} className="bg-zinc-900" style={{ 
                        width: `${Math.random() * 4 + 1}px`, 
                        height: `${Math.random() > 0.8 ? '100%' : '80%'}`
                      }} />
                    ))}
                 </div>
               </div>
               <p className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400">Scan to Verify • SHADY HUSSEIN STUDIO</p>
            </div>

          </div>

          {/* Perforated Bottom Edge */}
          <div className="absolute bottom-0 left-0 right-0 h-2 w-full bg-[#FDFDFD] rotate-180" style={{ maskImage: 'radial-gradient(circle at 4px 0, transparent 4px, black 4.5px)', maskSize: '12px 10px', maskRepeat: 'repeat-x' }} />
        </div>

        {/* Action Buttons underneath receipt */}
        <div className="mt-6 flex gap-3 print-hidden w-full">
           <button onClick={() => window.print()} className="flex-1 py-4 bg-glass border border-main hover:bg-glass hover:border-main20 text-text-main rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all backdrop-blur-xl">
             <Printer className="w-4 h-4" /> طباعة
           </button>
           <button className="flex-1 bg-primary hover:bg-primary/90 text-text-main rounded-2xl text-xs font-black shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] border border-primary/50 flex justify-center items-center gap-2 transition-all">
             <Share2 className="w-4 h-4" /> مشاركة الفاتورة
           </button>
        </div>
      </motion.div>
    </div>
  );
}
