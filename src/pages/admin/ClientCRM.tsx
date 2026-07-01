import { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  Crown,
  DollarSign,
  History,
  Phone,
  Search,
  Star,
  Users,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { storage } from '../../services/storage';
import { Booking, Customer } from '../../types';
import { cn, formatDateWithDay, toArabicDigits } from '../../lib/utils';
import { audioService } from '../../services/audio';
import PageLayout from '../../components/layout/PageLayout';
import SearchInput from '../../components/ui/SearchInput';
import EmptyState from '../../components/ui/EmptyState';
import { UI } from '../../lib/ui';
import { useCustomers, useBookings } from '../../hooks/useFirestoreData';

export default function ClientCRM() {
  const { customers: firestoreCustomers } = useCustomers();
  const { bookings: firestoreBookings } = useBookings();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = useMemo(
    () =>
      firestoreCustomers
        .filter((customer) => {
          const search = searchTerm.trim().toLowerCase();
          if (!search) return true;
          return (
            customer.name.toLowerCase().includes(search) ||
            customer.phone.includes(search) ||
            customer.whatsappPhone?.includes(search)
          );
        })
        .sort((a, b) => b.totalBookings - a.totalBookings),
    [firestoreCustomers, searchTerm]
  );

  const stats = useMemo(() => {
    const totalPaid = firestoreCustomers.reduce((sum, customer) => sum + (customer.totalPaid || 0), 0);
    const repeated = firestoreCustomers.filter((customer) => customer.totalBookings > 1).length;
    const recentActive = firestoreBookings.filter((booking) => {
      const date = new Date(booking.date);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;
    return {
      total: firestoreCustomers.length,
      repeated,
      totalPaid,
      recentActive,
    };
  }, [firestoreBookings, firestoreCustomers]);

  const selectedBookings = useMemo(
    () =>
      selectedCustomer
        ? firestoreBookings
            .filter((booking) => booking.phone === selectedCustomer.phone)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        : [],
    [firestoreBookings, selectedCustomer]
  );

  return (
    <PageLayout
      title="صفحة العملاء"
      subtitle="إدارة قاعدة العملاء ومراجعة تاريخهم وحجوزاتهم بشكل أوضح."
      stats={[
        { label: 'إجمالي العملاء', value: stats.total, icon: Users },
        { label: 'عملاء متكررون', value: stats.repeated, icon: Star },
        { label: 'إجمالي المدفوع', value: stats.totalPaid, suffix: 'ج.م', icon: DollarSign },
        { label: 'نشاط هذا الشهر', value: stats.recentActive, icon: Calendar },
      ]}
      toolbar={
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="ابحث بالاسم أو الهاتف..."
          className="w-full sm:w-80"
        />
      }
    >
      <div className="space-y-6">
        <section
          className={cn(
            UI.section,
            'relative overflow-hidden border-primary/15 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.12),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]'
          )}
        >
          <div className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
                <Users size={14} />
                CRM أوضح
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-text-main">
                  صفحة العملاء أصبحت أقرب لإدارة علاقات حقيقية مع المصور.
                </h2>
                <p className="mt-3 max-w-3xl text-sm md:text-base text-text-muted leading-7">
                  تم تنظيم الصفحة لعرض أهم العملاء، إجمالي تعاملاتهم، وتاريخ نشاطهم مع تفاصيل
                  واضحة عند فتح ملف كل عميل.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <MiniNode title="عملاء نشطون" value={stats.total} />
              <MiniNode title="متكررون" value={stats.repeated} />
              <MiniNode title="هذا الشهر" value={stats.recentActive} />
              <MiniNode title="نتائج البحث" value={filteredCustomers.length} />
            </div>
          </div>
        </section>

        {filteredCustomers.length === 0 ? (
          <EmptyState
            title="لا يوجد عملاء مطابقون"
            description="جرّب تعديل نص البحث أو أضف بيانات عملاء جديدة عبر الحجوزات."
            icon={Users}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredCustomers.map((customer, index) => {
              const customerBookings = firestoreBookings.filter((booking) => booking.phone === customer.phone);
              return (
                <motion.button
                  type="button"
                  key={customer.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => {
                    setSelectedCustomer(customer);
                    audioService.playClick();
                  }}
                  className={cn(UI.card, 'space-y-5 text-right')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <Users size={20} />
                    </div>
                    <span className={customer.totalBookings > 1 ? 'badge-primary' : 'badge-muted'}>
                      {customer.totalBookings > 1 ? 'عميل متكرر' : 'عميل جديد'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-display font-semibold text-text-main">{customer.name}</h3>
                    <p className="text-sm text-text-muted mt-2" dir="ltr">
                      {customer.phone || 'بدون رقم'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <InfoBox label="الحجوزات" value={customerBookings.length} />
                    <InfoBox label="المدفوع" value={customer.totalPaid || 0} suffix="ج.م" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedCustomer && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70"
              onClick={() => setSelectedCustomer(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              className={cn(UI.modal, 'relative z-10 w-full max-w-5xl space-y-5')}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-display font-semibold text-text-main">
                    {selectedCustomer.name}
                  </h3>
                  <p className="text-sm text-text-muted mt-2" dir="ltr">
                    {selectedCustomer.phone || 'بدون رقم'}
                  </p>
                </div>
                <button type="button" onClick={() => setSelectedCustomer(null)} className="btn-ghost p-2">
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DetailCard label="إجمالي الحجوزات" value={selectedBookings.length} icon={History} />
                <DetailCard
                  label="إجمالي المدفوع"
                  value={selectedCustomer.totalPaid || 0}
                  suffix="ج.م"
                  icon={DollarSign}
                />
                <DetailCard
                  label="آخر تعامل"
                  value={selectedCustomer.lastBookingDate ? formatDateWithDay(selectedCustomer.lastBookingDate) : 'غير متوفر'}
                  icon={Calendar}
                />
              </div>

              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Crown size={16} className="text-primary" />
                  <h4 className="text-lg font-display font-semibold text-text-main">سجل العميل</h4>
                </div>
                <div className="space-y-3 max-h-[360px] overflow-y-auto custom-scrollbar pr-1">
                  {selectedBookings.map((booking, index) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group rounded-2xl border border-main/50 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-4 hover:border-primary/30 hover:from-white/[0.08] hover:to-white/[0.04] transition-all duration-300"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                              <Calendar size={14} className="text-primary" />
                            </div>
                            <p className="text-sm font-semibold text-text-main">
                              {booking.eventType || booking.packageName}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-text-muted">
                            <History size={12} />
                            <span>{formatDateWithDay(booking.date)}</span>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-3 py-1">
                            <DollarSign size={12} className="text-primary" />
                            <p className="text-sm font-semibold text-primary">
                              {toArabicDigits((booking.totalPrice || 0).toLocaleString())} ج.م
                            </p>
                          </div>
                          <p className="text-xs text-text-muted">{booking.packageName}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {selectedBookings.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-main/30 bg-white/[0.02] p-8 text-center">
                      <History size={32} className="mx-auto mb-3 text-text-muted/50" />
                      <p className="text-sm text-text-muted">لا يوجد سجل حجوزات مرتبط بهذا العميل.</p>
                    </div>
                  )}
                </div>
              </section>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageLayout>
  );
}

function MiniNode({ title, value }: { title: string; value: number }) {
  return (
    <div className={cn(UI.card, 'space-y-2')}>
      <p className="text-xs text-text-muted">{title}</p>
      <p className="text-xl font-display font-bold text-text-main">{toArabicDigits(value)}</p>
    </div>
  );
}

function InfoBox({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="rounded-xl border border-main bg-white/[0.03] p-3">
      <p className="text-[11px] text-text-muted">{label}</p>
      <p className="text-base font-semibold text-text-main mt-1">
        {toArabicDigits(value.toLocaleString())}
        {suffix && <span className="text-xs text-text-muted font-normal mr-1">{suffix}</span>}
      </p>
    </div>
  );
}

function DetailCard({
  label,
  value,
  icon: Icon,
  suffix,
}: {
  label: string;
  value: string | number;
  icon: typeof Users;
  suffix?: string;
}) {
  return (
    <div className={cn(UI.card, 'space-y-3')}>
      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-base font-semibold text-text-main mt-1">
          {typeof value === 'number' ? toArabicDigits(value.toLocaleString()) : value}
          {suffix && typeof value === 'number' && (
            <span className="text-xs text-text-muted font-normal mr-1">{suffix}</span>
          )}
        </p>
      </div>
    </div>
  );
}
