import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit, Trash2, Calendar, Clock, AlertCircle, CheckCircle, User } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in-progress' | 'review' | 'done';
  dueDate: string;
  createdAt: string;
  tags: string[];
  comments: number;
  attachments: number;
}

export function TaskManagementPage() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'تحرير صور حفل الزفاف',
      description: 'تحرير 200 صورة من حفل الزفاف وتسليمها خلال أسبوع',
      assignedTo: 'سارة علي',
      priority: 'high',
      status: 'in-progress',
      dueDate: '2024-07-10',
      createdAt: '2024-07-01',
      tags: ['تحرير', 'زفاف'],
      comments: 3,
      attachments: 5,
    },
    {
      id: '2',
      title: 'تصوير جلسة عائلية',
      description: 'تصوير جلسة عائلية في الحديقة',
      assignedTo: 'أحمد محمد',
      priority: 'medium',
      status: 'todo',
      dueDate: '2024-07-15',
      createdAt: '2024-07-02',
      tags: ['تصوير', 'عائلي'],
      comments: 1,
      attachments: 0,
    },
    {
      id: '3',
      title: 'صيانة الكاميرا الرئيسية',
      description: 'صيانة دورية للكاميرا Canon EOS R5',
      assignedTo: 'محمد خالد',
      priority: 'high',
      status: 'todo',
      dueDate: '2024-07-05',
      createdAt: '2024-07-01',
      tags: ['صيانة', 'معدات'],
      comments: 0,
      attachments: 2,
    },
    {
      id: '4',
      title: 'إنشاء عرض جديد',
      description: 'إنشاء عرض خاص للشهر الجديد',
      assignedTo: 'أحمد محمد',
      priority: 'low',
      status: 'review',
      dueDate: '2024-07-20',
      createdAt: '2024-07-03',
      tags: ['تسويق', 'عروض'],
      comments: 5,
      attachments: 1,
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const handleDelete = (id: string) => {
    setTasks(items => items.filter(t => t.id !== id));
  };

  const handleStatusChange = (id: string, newStatus: Task['status']) => {
    setTasks(items => items.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'low':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-500/20 text-gray-400';
      case 'in-progress':
        return 'bg-blue-500/20 text-blue-400';
      case 'review':
        return 'bg-purple-500/20 text-purple-400';
      case 'done':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'todo':
        return <Clock className="w-4 h-4" />;
      case 'in-progress':
        return <AlertCircle className="w-4 h-4" />;
      case 'review':
        return <Edit className="w-4 h-4" />;
      case 'done':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    return true;
  });

  const taskStats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    review: tasks.filter(t => t.status === 'review').length,
    done: tasks.filter(t => t.status === 'done').length,
    high: tasks.filter(t => t.priority === 'high').length,
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
            <h1 className="text-3xl font-bold text-white mb-2">إدارة المهام</h1>
            <p className="text-gray-400">نظام شامل لإدارة المهام والتوكل</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <Plus className="w-5 h-5" />
            مهمة جديدة
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-gray-400 text-sm mb-1">إجمالي</p>
            <p className="text-2xl font-bold text-white">{taskStats.total}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-gray-400 text-sm mb-1">قيد الانتظار</p>
            <p className="text-2xl font-bold text-gray-400">{taskStats.todo}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-gray-400 text-sm mb-1">قيد التنفيذ</p>
            <p className="text-2xl font-bold text-blue-400">{taskStats.inProgress}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-gray-400 text-sm mb-1">مراجعة</p>
            <p className="text-2xl font-bold text-purple-400">{taskStats.review}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-gray-400 text-sm mb-1">مكتمل</p>
            <p className="text-2xl font-bold text-green-400">{taskStats.done}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white"
          >
            <option value="all">جميع الحالات</option>
            <option value="todo">قيد الانتظار</option>
            <option value="in-progress">قيد التنفيذ</option>
            <option value="review">مراجعة</option>
            <option value="done">مكتمل</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white"
          >
            <option value="all">جميع الأولويات</option>
            <option value="high">عالية</option>
            <option value="medium">متوسطة</option>
            <option value="low">منخفضة</option>
          </select>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {['todo', 'in-progress', 'review', 'done'].map((status) => (
            <div key={status} className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  {getStatusIcon(status)}
                  {status === 'todo' && 'قيد الانتظار'}
                  {status === 'in-progress' && 'قيد التنفيذ'}
                  {status === 'review' && 'مراجعة'}
                  {status === 'done' && 'مكتمل'}
                </h3>
                <span className="text-gray-400 text-sm">
                  {tasks.filter(t => t.status === status).length}
                </span>
              </div>
              <div className="space-y-3">
                {filteredTasks
                  .filter(task => task.status === status)
                  .map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-white font-medium text-sm">{task.title}</h4>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}
                      >
                        {task.priority === 'high' && 'عالية'}
                        {task.priority === 'medium' && 'متوسطة'}
                        {task.priority === 'low' && 'منخفضة'}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs mb-3 line-clamp-2">{task.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-gray-400">
                        <User className="w-3 h-3" />
                        <span>{task.assignedTo}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(task.dueDate).toLocaleDateString('ar-EG')}</span>
                      </div>
                    </div>
                    {task.tags.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {task.tags.map((tag, i) => (
                          <span key={i} className="text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Add Task Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold text-white mb-4">مهمة جديدة</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">العنوان</label>
                  <input
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                    placeholder="أدخل عنوان المهمة"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">الوصف</label>
                  <textarea
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                    placeholder="أدخل وصف المهمة"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">المسؤول</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white">
                    <option value="">اختر المسؤول</option>
                    <option value="ahmed">أحمد محمد</option>
                    <option value="sara">سارة علي</option>
                    <option value="mohamed">محمد خالد</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">الأولوية</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white">
                      <option value="high">عالية</option>
                      <option value="medium">متوسطة</option>
                      <option value="low">منخفضة</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">تاريخ الاستحقاق</label>
                    <input
                      type="date"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">الوسوم (مفصولة بفاصلة)</label>
                  <input
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                    placeholder="مثال: تحرير, زفاف"
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
                  إنشاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
