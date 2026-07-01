import { motion, AnimatePresence } from 'motion/react';
import { Package, X, Check, Clock } from 'lucide-react';
import { toArabicDigits } from '../../lib/utils';

interface Delivery {
  id: string;
  clientName: string;
  phone: string;
  deliveryDate: string;
  status: string;
}

interface DeliveryAlarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliveries: Delivery[];
  onAddToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function DeliveryAlarmModal({ isOpen, onClose, deliveries, onAddToast }: DeliveryAlarmModalProps) {
  if (!isOpen || deliveries.length === 0) return null;

  const handleMarkDelivered = (id: string) => {
    const bookings = JSON.parse(localStorage.getItem('shadyBookings') || '[]');
    const index = bookings.findIndex((b: any) => b.id === id);
    if (index !== -1) {
      bookings[index].status = 'delivered';
      localStorage.setItem('shadyBookings', JSON.stringify(bookings));
      onAddToast('تم تحديث حالة التسليم', 'success');
      onClose();
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <motion.div
        className="modal modal-lg"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <div className="modal-header">
          <h3><Package size={20} /> مواعيد التسليم اليوم</h3>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="alarm-list">
            {deliveries.map((delivery) => (
              <div key={delivery.id} className="alarm-item">
                <div className="alarm-info">
                  <h4>{delivery.clientName}</h4>
                  <p>{delivery.phone}</p>
                </div>
                <div className="alarm-actions">
                  <button className="btn btn-success btn-sm" onClick={() => handleMarkDelivered(delivery.id)}>
                    <Check size={14} /> تم التسليم
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>إغلاق</button>
        </div>
      </motion.div>
    </>
  );
}
