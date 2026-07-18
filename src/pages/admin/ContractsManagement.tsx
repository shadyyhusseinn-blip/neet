import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Plus, Edit, Trash2, FileText, Send, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { audioService } from '../../services/audio';
import { firebaseService } from '../../services/firebase';
import { cn } from '../../lib/utils';

interface Contract {
  id: string;
  bookingId: string;
  clientName: string;
  clientPhone: string;
  eventDate: string;
  packagePrice: number;
  depositAmount: number;
  terms: string;
  status: 'draft' | 'sent' | 'signed' | 'completed';
  signedAt?: string;
  pdfUrl?: string;
  createdAt: string;
}

export default function ContractsManagement() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [formData, setFormData] = useState({
    bookingId: '',
    clientName: '',
    clientPhone: '',
    eventDate: '',
    packagePrice: 0,
    depositAmount: 0,
    terms: '',
  });
  const [isMuted] = useState(() => audioService.getMuteState());
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      setLoading(true);
      const data = await firebaseService.getCollection('contracts');
      setContracts(data as unknown as Contract[]);
      setLoading(false);
    } catch (error) {
      console.error('Error loading contracts:', error);
      setLoading(false);
    }
  };

  const openModal = (contract: Contract | null = null) => {
    if (contract) {
      setEditingContract(contract);
      setFormData({
        bookingId: contract.bookingId,
        clientName: contract.clientName,
        clientPhone: contract.clientPhone,
        eventDate: contract.eventDate,
        packagePrice: contract.packagePrice,
        depositAmount: contract.depositAmount,
        terms: contract.terms,
      });
    } else {
      setEditingContract(null);
      setFormData({
        bookingId: '',
        clientName: '',
        clientPhone: '',
        eventDate: '',
        packagePrice: 0,
        depositAmount: 0,
        terms: getDefaultTerms(),
      });
    }
    setIsModalOpen(true);
    if (!isMuted) audioService.playClick();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingContract(null);
    setFormData({
      bookingId: '',
      clientName: '',
      clientPhone: '',
      eventDate: '',
      packagePrice: 0,
      depositAmount: 0,
      terms: '',
    });
    if (!isMuted) audioService.playClick();
  };

  const getDefaultTerms = () => {
    return `1. العربون غير المسترد: يعتبر العربون المدفوع جزءاً من إجمالي السعر ولا يمكن استرداده في حالة إلغاء الحجز من قبل العميل.

2. مواعيد التسليم: يتم تسليم الصور النهائية خلال 4-6 أسابيع من تاريخ الجلسة.

3. سياسة الإلغاء:
   - الإلغاء قبل 30 يوم: استرداد 50% من العربون
   - الإلغاء قبل 15 يوم: استرداد 25% من العربون
   - الإلغاء خلال 15 يوم: لا يوجد استرداد

4. حقوق النشر: يحق للمصور استخدام الصور في معرضه الشخصي وأعماله التسويقية مع الحفاظ على خصوصية العميل.

5. التعديلات: يحق للعميل طلب تعديلات جوهرية على الصور خلال 7 أيام من التسليم.

6. المشاركة: يمنع مشاركة الصور مع مصورين آخرين دون إذن كتابي.`;
  };

  const handleSubmit = async () => {
    if (!formData.clientName || !formData.clientPhone || !formData.eventDate) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      const contractData: any = {
        ...formData,
        id: editingContract?.id || `contract-${Date.now()}`,
        status: 'draft',
        createdAt: editingContract?.createdAt || new Date().toISOString(),
      };

      if (editingContract) {
        await firebaseService.updateDocument('contracts', editingContract.id, contractData);
      } else {
        await firebaseService.setDocument('contracts', contractData.id, contractData);
      }

      if (!isMuted) audioService.playSuccess();
      closeModal();
      loadContracts();
    } catch (error) {
      console.error('Error saving contract:', error);
      if (!isMuted) audioService.playError();
      alert('حدث خطأ أثناء حفظ العقد');
    }
  };

  const handleSendContract = async (contractId: string) => {
    try {
      await firebaseService.updateDocument('contracts', contractId, { status: 'sent' });
      if (!isMuted) audioService.playSuccess();
      setToastMessage('تم إرسال العقد للعميل بنجاح!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      loadContracts();
    } catch (error) {
      console.error('Error sending contract:', error);
      if (!isMuted) audioService.playError();
      alert('حدث خطأ أثناء إرسال العقد');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العقد؟')) return;
    
    try {
      await firebaseService.deleteDocument('contracts', id);
      if (!isMuted) audioService.playDelete();
      loadContracts();
    } catch (error) {
      console.error('Error deleting contract:', error);
      if (!isMuted) audioService.playError();
      alert('حدث خطأ أثناء حذف العقد');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      draft: { label: 'مسودة', color: 'bg-slate-600/8 text-slate-400' },
      sent: { label: 'مرسلة', color: 'bg-blue-600/8 text-blue-200' },
      signed: { label: 'موقعة', color: 'bg-emerald-600/8 text-emerald-200' },
      completed: { label: 'مكتملة', color: 'bg-slate-600/8 text-slate-200' },
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.draft;
    return (
      <span className={cn('text-xs font-medium px-2 py-1 rounded-lg', statusInfo.color)}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050508] via-[#0a0a1a] to-[#050508] text-white p-4 md:p-6" dir="rtl">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-slate-600/20 to-pink-600/20 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-r from-indigo-600/15 to-slate-600/15 rounded-full blur-[180px]"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-emerald-600/90 backdrop-blur-xl border border-emerald-500/30 rounded-xl shadow-lg shadow-emerald-500/20"
          >
            <div className="flex items-center gap-2">
              <Check size={20} className="text-white" />
              <span className="text-white font-medium">{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (!audioService.getMuteState()) audioService.playClick();
              navigate('/admin/websiteadministration');
            }}
            className="p-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-black/50 transition-all hover:scale-110 shadow-lg"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">إدارة العقود الإلكترونية</h1>
            <p className="text-slate-400 text-sm mt-1">إنشاء وإدارة عقود التصوير الرقمية</p>
          </div>
        </motion.div>

        {/* Contracts Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">العقود</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openModal()}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-pink-600 rounded-xl text-white font-medium hover:from-blue-700 hover:to-pink-700 transition-all hover:scale-105 shadow-lg shadow-blue-500/20"
            >
              <Plus size={18} />
              عقد جديد
            </motion.button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400">جاري التحميل...</p>
            </div>
          ) : contracts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl p-12 text-center shadow-xl transition-all hover:scale-[1.01]"
            >
              <FileText size={48} className="text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">لا توجد عقود حالياً</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openModal()}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-pink-600 rounded-xl text-white font-medium shadow-lg shadow-blue-500/20 hover:scale-105 transition-all"
              >
                إنشاء عقد جديد
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl overflow-hidden shadow-xl transition-all hover:scale-[1.01]"
            >
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">العميل</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">الهاتف</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">تاريخ الحدث</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">السعر</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">الحالة</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((contract) => (
                    <tr key={contract.id} className="border-b border-white/5 hover:bg-white/5 transition-all hover:scale-[1.01]">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{contract.clientName}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{contract.clientPhone}</td>
                      <td className="px-6 py-4 text-slate-300">{contract.eventDate}</td>
                      <td className="px-6 py-4 text-slate-300">{contract.packagePrice.toLocaleString()} ج.م</td>
                      <td className="px-6 py-4">{getStatusBadge(contract.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {contract.status === 'draft' && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleSendContract(contract.id)}
                              className="p-2 bg-black/20 border border-white/10 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all hover:scale-110 backdrop-blur-sm"
                              title="إرسال العقد"
                            >
                              <Send size={16} />
                            </motion.button>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openModal(contract)}
                            className="p-2 bg-black/20 border border-white/10 rounded-lg text-slate-400 hover:text-white hover:bg-black/30 transition-all hover:scale-110 backdrop-blur-sm"
                          >
                            <Edit size={16} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(contract.id)}
                            className="p-2 bg-black/20 border border-white/10 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all hover:scale-110 backdrop-blur-sm"
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl transition-all hover:scale-[1.01]"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  {editingContract ? 'تعديل العقد' : 'عقد جديد'}
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeModal}
                  className="p-2 bg-black/20 border border-white/10 rounded-lg text-slate-400 hover:text-white hover:bg-black/30 transition-all hover:scale-110 backdrop-blur-sm"
                >
                  <X size={20} />
                </motion.button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">اسم العميل</label>
                    <input
                      type="text"
                      value={formData.clientName}
                      onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                      placeholder="اسم العميل"
                      className="w-full h-12 bg-black/20 border border-white/10 rounded-xl px-4 text-white placeholder-slate-500 focus:border-blue-500/30 focus:outline-none transition-all hover:scale-[1.01] backdrop-blur-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">رقم الهاتف</label>
                    <input
                      type="tel"
                      value={formData.clientPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
                      placeholder="رقم الهاتف"
                      className="w-full h-12 bg-black/20 border border-white/10 rounded-xl px-4 text-white placeholder-slate-500 focus:border-blue-500/30 focus:outline-none transition-all hover:scale-[1.01] backdrop-blur-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">تاريخ الحدث</label>
                    <input
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                      className="w-full h-12 bg-black/20 border border-white/10 rounded-xl px-4 text-white placeholder-slate-500 focus:border-blue-500/30 focus:outline-none transition-all hover:scale-[1.01] backdrop-blur-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">سعر الباقة</label>
                    <input
                      type="number"
                      value={formData.packagePrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, packagePrice: Number(e.target.value) }))}
                      placeholder="السعر بالجنيه"
                      className="w-full h-12 bg-black/20 border border-white/10 rounded-xl px-4 text-white placeholder-slate-500 focus:border-blue-500/30 focus:outline-none transition-all hover:scale-[1.01] backdrop-blur-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">العربون</label>
                    <input
                      type="number"
                      value={formData.depositAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, depositAmount: Number(e.target.value) }))}
                      placeholder="مبلغ العربون"
                      className="w-full h-12 bg-black/20 border border-white/10 rounded-xl px-4 text-white placeholder-slate-500 focus:border-blue-500/30 focus:outline-none transition-all hover:scale-[1.01] backdrop-blur-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">البنود والشروط</label>
                  <textarea
                    value={formData.terms}
                    onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                    placeholder="البنود والشروط"
                    rows={8}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500/30 focus:outline-none transition-all hover:scale-[1.01] backdrop-blur-sm resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-pink-600 rounded-xl text-white font-semibold hover:from-blue-700 hover:to-pink-700 transition-all hover:scale-105 shadow-lg shadow-blue-500/20"
                  >
                    {editingContract ? 'حفظ التعديلات' : 'إنشاء العقد'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={closeModal}
                    className="px-6 py-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl text-white font-semibold hover:bg-black/50 transition-all hover:scale-105 shadow-lg"
                  >
                    إلغاء
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
