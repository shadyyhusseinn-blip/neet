import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { Download, Printer, Camera, Phone, Mail, MapPin, Calendar, CreditCard, User, FileText } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface Booking {
  id?: string;
  clientName: string;
  phone: string;
  email?: string;
  packageType: string;
  date: string;
  totalAmount: number;
  depositPaid: number;
  remainingAmount: number;
  eventLocation?: string;
  eventTime?: string;
  notes?: string;
  createdAt?: string;
}

interface BookingInvoiceProps {
  booking: Booking;
  studioInfo?: {
    name: string;
    phone: string;
    email: string;
    address: string;
    logo?: string;
  };
}

export default function BookingInvoice({ booking, studioInfo }: BookingInvoiceProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const defaultStudioInfo = {
    name: 'شادي حسين للتصوير',
    phone: '+20 123 456 7890',
    email: 'contact@shadyhussein.com',
    address: 'القاهرة، مصر',
    logo: ''
  };

  const studio = studioInfo || defaultStudioInfo;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const generatePDF = () => {
    if (!invoiceRef.current) return;

    const element = invoiceRef.current;
    const opt = {
      margin: 0,
      filename: `فاتورة-${booking.clientName}-${booking.date}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      },
      pagebreak: { mode: 'avoid', before: '#invoice-content' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const printInvoice = () => {
    if (!invoiceRef.current) return;
    
    // Use CSS print media for safer printing
    const printStyles = document.createElement('style');
    printStyles.textContent = `
      @media print {
        body > *:not(.print-container) {
          display: none !important;
        }
        .print-container {
          display: block !important;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
        }
      }
    `;
    document.head.appendChild(printStyles);
    
    // Add print class to invoice
    invoiceRef.current.classList.add('print-container');
    
    window.print();
    
    // Cleanup
    document.head.removeChild(printStyles);
    invoiceRef.current.classList.remove('print-container');
  };

  return (
    <div className="w-full bg-[#050508] text-white font-['Cairo','Tajawal',sans-serif]" dir="rtl">
      {/* Action Buttons */}
      <div className="sticky top-0 z-50 bg-[#050508]/95 backdrop-blur-xl border-b border-white/10 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            فاتورة الحجز
          </h2>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={generatePDF}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2"
            >
              <Download size={18} />
              تحميل PDF
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={printInvoice}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white font-semibold hover:bg-white/20 transition-all flex items-center gap-2"
            >
              <Printer size={18} />
              طباعة
            </motion.button>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div
            ref={invoiceRef}
            id="invoice-content"
            className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl"
            style={{ direction: 'rtl', fontFamily: "'Cairo', 'Tajawal', sans-serif" }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-12 pb-8 border-b border-white/10">
              {/* Logo & Studio Info */}
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Camera size={40} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                    {studio.name}
                  </h1>
                  <div className="space-y-1 text-gray-400 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone size={14} />
                      <span>{studio.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={14} />
                      <span>{studio.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} />
                      <span>{studio.address}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Invoice Details */}
              <div className="text-left">
                <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl px-6 py-3 mb-4">
                  <p className="text-purple-400 text-sm">فاتورة رقم</p>
                  <p className="text-white font-bold text-xl">#{booking.id || 'INV-' + Date.now()}</p>
                </div>
                <div className="text-gray-400 text-sm">
                  <p>التاريخ: {formatDate(booking.createdAt || new Date().toISOString())}</p>
                </div>
              </div>
            </div>

            {/* Client Information */}
            <div className="mb-12">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <User size={18} className="text-white" />
                </div>
                معلومات العميل
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <p className="text-gray-400 text-sm mb-2">اسم العميل</p>
                  <p className="text-white font-semibold text-lg">{booking.clientName}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <p className="text-gray-400 text-sm mb-2">رقم الهاتف</p>
                  <p className="text-white font-semibold text-lg">{booking.phone}</p>
                </div>
                {booking.email && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <p className="text-gray-400 text-sm mb-2">البريد الإلكتروني</p>
                    <p className="text-white font-semibold text-lg">{booking.email}</p>
                  </div>
                )}
                {booking.eventLocation && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <p className="text-gray-400 text-sm mb-2">موقع الحدث</p>
                    <p className="text-white font-semibold text-lg">{booking.eventLocation}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Details */}
            <div className="mb-12">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Calendar size={18} className="text-white" />
                </div>
                تفاصيل الحجز
              </h3>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-gray-400 text-sm mb-2">نوع الباقة</p>
                    <p className="text-white font-semibold text-lg">{booking.packageType}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-2">تاريخ الجلسة</p>
                    <p className="text-white font-semibold text-lg">{formatDate(booking.date)}</p>
                  </div>
                  {booking.eventTime && (
                    <div>
                      <p className="text-gray-400 text-sm mb-2">وقت الجلسة</p>
                      <p className="text-white font-semibold text-lg">{booking.eventTime}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Breakdown */}
            <div className="mb-12">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <CreditCard size={18} className="text-white" />
                </div>
                تفاصيل الدفع
              </h3>
              <div className="bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-xl p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-white/10">
                    <span className="text-gray-400">إجمالي المبلغ</span>
                    <span className="text-white font-bold text-xl">{formatCurrency(booking.totalAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-white/10">
                    <span className="text-gray-400">المقدم المدفوع</span>
                    <span className="text-green-400 font-bold text-xl">{formatCurrency(booking.depositPaid)}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-white font-semibold text-lg">المتبقي</span>
                    <span className="text-purple-400 font-bold text-2xl">{formatCurrency(booking.remainingAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {booking.notes && (
              <div className="mb-12">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <FileText size={18} className="text-white" />
                  </div>
                  ملاحظات
                </h3>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <p className="text-gray-300">{booking.notes}</p>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="pt-8 border-t border-white/10">
              <div className="flex items-start justify-between">
                <div className="text-gray-400 text-sm">
                  <p className="mb-2">شكراً لاختيارك {studio.name}</p>
                  <p>نتطلع لتقديم أفضل خدمة لك</p>
                </div>
                {/* QR Code Placeholder */}
                <div className="bg-white p-4 rounded-xl">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Camera size={32} className="text-gray-400" />
                  </div>
                  <p className="text-center text-gray-600 text-xs mt-2">امسح للدفع</p>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="mt-8 pt-8 border-t border-white/10">
              <div className="text-gray-500 text-xs space-y-1">
                <p>• الفاتورة صالحة لمدة 30 يوماً من تاريخ الإصدار</p>
                <p>• يرجى الاحتفاظ بنسخة من الفاتورة للرجوع إليها</p>
                <p>• لأي استفسارات، يرجى التواصل معنا على {studio.phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
