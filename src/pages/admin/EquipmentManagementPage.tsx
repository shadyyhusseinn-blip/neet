import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit, Trash2, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface Equipment {
  id: string;
  name: string;
  category: string;
  status: 'available' | 'in-use' | 'maintenance' | 'broken';
  lastMaintenance: string;
  nextMaintenance: string;
  usageCount: number;
}

export function EquipmentManagementPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([
    {
      id: '1',
      name: 'كاميرا Canon EOS R5',
      category: 'كاميرات',
      status: 'available',
      lastMaintenance: '2024-06-01',
      nextMaintenance: '2024-09-01',
      usageCount: 45,
    },
    {
      id: '2',
      name: 'عدسة 24-70mm f/2.8',
      category: 'عدسات',
      status: 'in-use',
      lastMaintenance: '2024-05-15',
      nextMaintenance: '2024-08-15',
      usageCount: 62,
    },
    {
      id: '3',
      name: 'إضاءة Godox AD600',
      category: 'إضاءة',
      status: 'maintenance',
      lastMaintenance: '2024-04-20',
      nextMaintenance: '2024-07-20',
      usageCount: 38,
    },
    {
      id: '4',
      name: 'ترايبود Manfrotto',
      category: 'ترايبود',
      status: 'available',
      lastMaintenance: '2024-06-10',
      nextMaintenance: '2024-12-10',
      usageCount: 55,
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500/20 text-green-400';
      case 'in-use':
        return 'bg-blue-500/20 text-blue-400';
      case 'maintenance':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'broken':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4" />;
      case 'in-use':
        return <Clock className="w-4 h-4" />;
      case 'maintenance':
      case 'broken':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleDelete = (id: string) => {
    setEquipment(items => items.filter(e => e.id !== id));
  };

  const maintenanceAlerts = equipment.filter(
    e => new Date(e.nextMaintenance) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );

  return (
    <div className="min-h-screen bg-[#0B0B0F] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">إدارة المعدات</h1>
            <p className="text-gray-400">إدارة معدات الاستوديو وجدولة الصيانة</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <Plus className="w-5 h-5" />
            إضافة جهاز
          </button>
        </div>

        {/* Maintenance Alerts */}
        {maintenanceAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 mb-6"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
              <div>
                <p className="text-yellow-400 font-semibold">
                  {maintenanceAlerts.length} معدات تحتاج للصيانة قريباً
                </p>
                <p className="text-gray-400 text-sm">
                  يرجى جدولة الصيانة في أقرب وقت ممكن
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-2">إجمالي المعدات</p>
            <p className="text-3xl font-bold text-white">{equipment.length}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-2">متاحة</p>
            <p className="text-3xl font-bold text-green-400">
              {equipment.filter(e => e.status === 'available').length}
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-2">قيد الاستخدام</p>
            <p className="text-3xl font-bold text-blue-400">
              {equipment.filter(e => e.status === 'in-use').length}
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-2">تحتاج صيانة</p>
            <p className="text-3xl font-bold text-yellow-400">
              {equipment.filter(e => e.status === 'maintenance').length}
            </p>
          </div>
        </div>

        {/* Equipment List */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white">قائمة المعدات</h3>
          </div>
          <div className="divide-y divide-white/10">
            {equipment.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
                      <span className="text-2xl">📷</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{item.name}</h4>
                      <p className="text-gray-400 text-sm">{item.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-gray-400 text-xs mb-1">آخر صيانة</p>
                      <p className="text-white text-sm">
                        {new Date(item.lastMaintenance).toLocaleDateString('ar-EG')}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 text-xs mb-1">الصيانة القادمة</p>
                      <p className="text-white text-sm">
                        {new Date(item.nextMaintenance).toLocaleDateString('ar-EG')}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 text-xs mb-1">الاستخدام</p>
                      <p className="text-white font-semibold">{item.usageCount}</p>
                    </div>
                    <span
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${getStatusColor(item.status)}`}
                    >
                      {getStatusIcon(item.status)}
                      {item.status === 'available' && 'متاح'}
                      {item.status === 'in-use' && 'قيد الاستخدام'}
                      {item.status === 'maintenance' && 'صيانة'}
                      {item.status === 'broken' && 'معطل'}
                    </span>
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <Edit className="w-5 h-5 text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Add Equipment Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold text-white mb-4">إضافة جهاز جديد</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">اسم الجهاز</label>
                  <input
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                    placeholder="أدخل اسم الجهاز"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">الفئة</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white">
                    <option value="">اختر الفئة</option>
                    <option value="camera">كاميرات</option>
                    <option value="lens">عدسات</option>
                    <option value="lighting">إضاءة</option>
                    <option value="tripod">ترايبود</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">تاريخ الصيانة القادمة</label>
                  <input
                    type="date"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-white/10 text-white px-4 py-3 rounded-xl hover:bg-white/20 transition-colors"
                >
                  إلغاء
                </button>
                <button className="flex-1 btn-primary">
                  إضافة
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
