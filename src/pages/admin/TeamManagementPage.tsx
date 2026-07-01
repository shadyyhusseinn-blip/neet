import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit, Trash2, Calendar, Clock } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  joinDate: string;
  hoursWorked: number;
  tasksCompleted: number;
}

export function TeamManagementPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'أحمد محمد',
      role: 'مصور رئيسي',
      email: 'ahmed@example.com',
      phone: '01012345678',
      status: 'active',
      joinDate: '2024-01-15',
      hoursWorked: 120,
      tasksCompleted: 45,
    },
    {
      id: '2',
      name: 'سارة علي',
      role: 'محرر صور',
      email: 'sara@example.com',
      phone: '01098765432',
      status: 'active',
      joinDate: '2024-02-01',
      hoursWorked: 95,
      tasksCompleted: 38,
    },
    {
      id: '3',
      name: 'محمد خالد',
      role: 'مساعد',
      email: 'mohamed@example.com',
      phone: '01055555555',
      status: 'inactive',
      joinDate: '2024-03-10',
      hoursWorked: 60,
      tasksCompleted: 20,
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);

  const handleDelete = (id: string) => {
    setTeamMembers(members => members.filter(m => m.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setTeamMembers(members =>
      members.map(m =>
        m.id === id
          ? { ...m, status: m.status === 'active' ? 'inactive' : 'active' }
          : m
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">إدارة الفريق</h1>
            <p className="text-gray-400">إدارة أعضاء الفريق وتوزيع المهام</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <Plus className="w-5 h-5" />
            إضافة عضو
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-2">إجمالي الفريق</p>
            <p className="text-3xl font-bold text-white">{teamMembers.length}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-2">نشط</p>
            <p className="text-3xl font-bold text-green-400">
              {teamMembers.filter(m => m.status === 'active').length}
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-2">إجمالي الساعات</p>
            <p className="text-3xl font-bold text-white">
              {teamMembers.reduce((sum, m) => sum + m.hoursWorked, 0)}
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-2">المهام المكتملة</p>
            <p className="text-3xl font-bold text-white">
              {teamMembers.reduce((sum, m) => sum + m.tasksCompleted, 0)}
            </p>
          </div>
        </div>

        {/* Team Members List */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white">أعضاء الفريق</h3>
          </div>
          <div className="divide-y divide-white/10">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{member.name}</h4>
                      <p className="text-gray-400 text-sm">{member.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-gray-400 text-xs mb-1">ساعات العمل</p>
                      <p className="text-white font-semibold">{member.hoursWorked}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 text-xs mb-1">المهام</p>
                      <p className="text-white font-semibold">{member.tasksCompleted}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        member.status === 'active'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {member.status === 'active' ? 'نشط' : 'غير نشط'}
                    </span>
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <Edit className="w-5 h-5 text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(member.id)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Calendar className="w-5 h-5 text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
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

        {/* Add Member Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold text-white mb-4">إضافة عضو جديد</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">الاسم</label>
                  <input
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                    placeholder="أدخل الاسم"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">الدور</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white">
                    <option value="">اختر الدور</option>
                    <option value="photographer">مصور</option>
                    <option value="editor">محرر صور</option>
                    <option value="assistant">مساعد</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                    placeholder="أدخل البريد الإلكتروني"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">الهاتف</label>
                  <input
                    type="tel"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                    placeholder="أدخل رقم الهاتف"
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
