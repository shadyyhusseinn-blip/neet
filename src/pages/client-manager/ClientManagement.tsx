import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UserPlus,
  Search,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Shield,
  Download,
  Image as ImageIcon,
  X,
  Check,
  Loader2
} from 'lucide-react';
import { createClientAccount, getClientData, updateClientSettings, Client } from '../../services/clientAuth';
import { toast } from 'sonner';
import { collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { firebaseService } from '../../services/firebase';

export default function ClientManagement() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    allowDownload: true,
    watermark: true,
    maxDownloads: 50,
    status: 'active' as 'active' | 'inactive' | 'archived'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const db = firebaseService.getDB();
      const clientsCollection = collection(db, 'clients');
      const snapshot = await getDocs(clientsCollection);
      const clientsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Client[];
      setClients(clientsData);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast.error('فشل تحميل العملاء');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createClientAccount({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        photographerId: 'admin' // Can be dynamic based on current user
      });

      toast.success('تم إنشاء حساب العميل بنجاح ✅');
      setShowAddModal(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        allowDownload: true,
        watermark: true,
        maxDownloads: 50,
        status: 'active'
      });
      loadClients();
    } catch (error) {
      console.error('Error creating client:', error);
      toast.error('فشل إنشاء حساب العميل');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (clientId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العميل؟')) return;

    try {
      const db = firebaseService.getDB();
      await deleteDoc(doc(db, 'clients', clientId));
      toast.success('تم حذف العميل بنجاح');
      loadClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('فشل حذف العميل');
    }
  };

  const handleStatusChange = async (clientId: string, status: 'active' | 'inactive' | 'archived') => {
    try {
      await updateClientSettings(clientId, { status });
      toast.success('تم تحديث حالة العميل');
      loadClients();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('فشل تحديث الحالة');
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6" dir="rtl">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              إدارة العملاء
            </h1>
            <p className="text-slate-400 mt-2">إضافة وإدارة حسابات العملاء</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-medium shadow-lg shadow-blue-500/30"
          >
            <UserPlus size={20} />
            إضافة عميل جديد
          </motion.button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="بحث عن عميل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pr-12 pl-4 text-white placeholder-slate-400 focus:border-blue-500/50 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Clients Grid */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-blue-400" size={48} />
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <UserPlus size={48} className="text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">لا يوجد عملاء حالياً</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client, index) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center">
                      <UserPlus size={24} className="text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{client.name}</h3>
                      <p className="text-slate-400 text-sm">{client.email}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    client.status === 'active' 
                      ? 'bg-green-500/20 text-green-400' 
                      : client.status === 'inactive'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {client.status === 'active' ? 'نشط' : client.status === 'inactive' ? 'غير نشط' : 'مؤرشف'}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Phone size={16} />
                    <span>{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Calendar size={16} />
                    <span>{new Date(client.createdAt).toLocaleDateString('ar-EG')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <ImageIcon size={16} />
                    <span>{client.events.length} أحداث</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Shield size={16} className={client.settings.allowDownload ? 'text-green-400' : 'text-red-400'} />
                    <span className="text-slate-400">تحميل</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download size={16} className="text-slate-400" />
                    <span className="text-slate-400">{client.settings.maxDownloads}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ImageIcon size={16} className={client.settings.watermark ? 'text-green-400' : 'text-red-400'} />
                    <span className="text-slate-400">علامة مائية</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={client.status}
                    onChange={(e) => handleStatusChange(client.id, e.target.value as any)}
                    className="flex-1 bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500/50 focus:outline-none"
                  >
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                    <option value="archived">مؤرشف</option>
                  </select>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(client.id)}
                    className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 size={18} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">إضافة عميل جديد</h2>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowAddModal(false)}
                  className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <X size={20} className="text-white" />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">الاسم</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-400 focus:border-blue-500/50 focus:outline-none transition-colors"
                    placeholder="اسم العميل"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-400 focus:border-blue-500/50 focus:outline-none transition-colors"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">رقم الهاتف</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-400 focus:border-blue-500/50 focus:outline-none transition-colors"
                    placeholder="+20 xxx xxx xxxx"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">كلمة المرور</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-400 focus:border-blue-500/50 focus:outline-none transition-colors"
                    placeholder="••••••••"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 bg-slate-800/50 border border-white/10 rounded-xl p-4">
                    <input
                      type="checkbox"
                      id="allowDownload"
                      checked={formData.allowDownload}
                      onChange={(e) => setFormData({ ...formData, allowDownload: e.target.checked })}
                      className="w-5 h-5 rounded border-white/10 bg-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <label htmlFor="allowDownload" className="text-sm text-slate-300">السماح بالتحميل</label>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-800/50 border border-white/10 rounded-xl p-4">
                    <input
                      type="checkbox"
                      id="watermark"
                      checked={formData.watermark}
                      onChange={(e) => setFormData({ ...formData, watermark: e.target.checked })}
                      className="w-5 h-5 rounded border-white/10 bg-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <label htmlFor="watermark" className="text-sm text-slate-300">علامة مائية</label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">الحد الأقصى للتحميلات</label>
                  <input
                    type="number"
                    value={formData.maxDownloads}
                    onChange={(e) => setFormData({ ...formData, maxDownloads: parseInt(e.target.value) })}
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-400 focus:border-blue-500/50 focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 bg-white/10 border border-white/10 rounded-xl text-white font-medium hover:bg-white/20 transition-colors"
                  >
                    إلغاء
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white font-medium disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        جاري الإنشاء...
                      </>
                    ) : (
                      <>
                        <Check size={18} />
                        إنشاء الحساب
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
