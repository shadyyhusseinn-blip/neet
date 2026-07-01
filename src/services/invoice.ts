import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Booking, Package } from '../types';

interface InvoiceData {
  booking: Booking;
  packages: Package[];
  studioInfo: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
}

class InvoiceService {
  generateInvoice(data: InvoiceData): void {
    const { booking, packages, studioInfo } = data;
    const doc = new jsPDF();

    // Set font for Arabic support
    doc.setFont('helvetica');

    // Header
    doc.setFontSize(20);
    doc.setTextColor(139, 92, 246); // Purple color
    doc.text('فاتورة', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`رقم الفاتورة: ${booking.id}`, 20, 35);
    doc.text(`التاريخ: ${new Date(booking.createdAt).toLocaleDateString('ar-EG')}`, 20, 42);

    // Studio Info
    doc.setFontSize(14);
    doc.setTextColor(139, 92, 246);
    doc.text(studioInfo.name, 20, 55);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`الهاتف: ${studioInfo.phone}`, 20, 62);
    doc.text(`البريد: ${studioInfo.email}`, 20, 68);
    doc.text(`العنوان: ${studioInfo.address}`, 20, 74);

    // Client Info
    doc.setFontSize(14);
    doc.setTextColor(139, 92, 246);
    doc.text('معلومات العميل', 140, 55);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`الاسم: ${booking.clientName}`, 140, 62);
    doc.text(`الهاتف: ${booking.phone}`, 140, 68);
    doc.text(`الواتساب: ${booking.whatsappPhone || '-'}`, 140, 74);

    // Booking Details
    doc.setFontSize(14);
    doc.setTextColor(139, 92, 246);
    doc.text('تفاصيل الحجز', 20, 90);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`تاريخ الحجز: ${new Date(booking.date).toLocaleDateString('ar-EG')}`, 20, 97);
    doc.text(`تاريخ التسليم: ${booking.deliveryDate ? new Date(booking.deliveryDate).toLocaleDateString('ar-EG') : '-'}`, 20, 103);
    doc.text(`الموقع: ${booking.eventLocation || '-'}`, 20, 109);
    doc.text(`الوقت: ${booking.eventTime || '-'}`, 20, 115);

    // Packages Table
    const packageData = booking.selectedPackages || packages.filter(p => p.name === booking.packageName);
    const tableData = packageData.map(pkg => [
      pkg.name,
      pkg.description || '-',
      `${pkg.price} ج.م`,
    ]);

    autoTable(doc, {
      startY: 125,
      head: [['الباقة', 'الوصف', 'السعر']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [139, 92, 246],
        textColor: [255, 255, 255],
        fontSize: 12,
      },
      bodyStyles: {
        fontSize: 10,
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 80 },
        2: { cellWidth: 40 },
      },
    });

    // Payment Summary
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setTextColor(139, 92, 246);
    doc.text('ملخص الدفع', 20, finalY);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`السعر الإجمالي: ${booking.totalPrice} ج.م`, 20, finalY + 7);
    doc.text(`الخصم: ${booking.discount} ج.م`, 20, finalY + 14);
    doc.text(`المبلغ المدفوع: ${booking.paidAmount} ج.م`, 20, finalY + 21);
    doc.text(`المبلغ المتبقي: ${booking.remainingAmount} ج.م`, 20, finalY + 28);

    doc.setFontSize(12);
    doc.setTextColor(139, 92, 246);
    doc.text(`حالة الدفع: ${this.getPaymentStatusText(booking.paymentStatus)}`, 20, finalY + 38);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('شكراً لتعاملكم معنا', 105, 280, { align: 'center' });

    // Save
    doc.save(`invoice-${booking.id}.pdf`);
  }

  private getPaymentStatusText(status: string): string {
    switch (status) {
      case 'paid':
        return 'مدفوع بالكامل';
      case 'deposit':
        return 'دفعة مقدمة';
      case 'unpaid':
        return 'غير مدفوع';
      case 'confirmed':
        return 'مؤكد';
      default:
        return status;
    }
  }

  generateReceipt(data: InvoiceData): void {
    const { booking, studioInfo } = data;
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.setTextColor(139, 92, 246);
    doc.text('إيصال دفع', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`رقم الحجز: ${booking.id}`, 20, 30);
    doc.text(`التاريخ: ${new Date(booking.createdAt).toLocaleDateString('ar-EG')}`, 20, 36);

    // Studio Info
    doc.setFontSize(12);
    doc.setTextColor(139, 92, 246);
    doc.text(studioInfo.name, 20, 50);

    // Payment Info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`المبلغ المدفوع: ${booking.paidAmount} ج.م`, 20, 65);
    doc.text(`طريقة الدفع: ${booking.paymentMethod || '-'}`, 20, 72);
    doc.text(`السعر الإجمالي: ${booking.totalPrice} ج.م`, 20, 79);
    doc.text(`المبلغ المتبقي: ${booking.remainingAmount} ج.م`, 20, 86);

    // Client Info
    doc.setFontSize(12);
    doc.setTextColor(139, 92, 246);
    doc.text('معلومات العميل', 20, 100);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`الاسم: ${booking.clientName}`, 20, 107);
    doc.text(`الهاتف: ${booking.phone}`, 20, 113);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('شكراً لتعاملكم معنا', 105, 280, { align: 'center' });

    // Save
    doc.save(`receipt-${booking.id}.pdf`);
  }
}

export const invoiceService = new InvoiceService();
