import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Shield, Users, UserPlus, Trash2, Lock, Unlock,
  MoreVertical, Search, Filter, ChevronDown,
  CheckCircle, XCircle, AlertTriangle, Crown, Eye, Edit, LogOut
} from 'lucide-react';
import { User, UserRole } from '../../types';
import { firestoreData } from '../../services/firestoreData';
import { audioService } from '../../services/audio';
import { cn } from '../../lib/utils';
import { sanitizeString, sanitizeEmail, sanitizePhone, sanitizeUsername } from '../../lib/sanitize';

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'viewer' as UserRole,
    phone: '',
    username: '',
    password: ''
  });

  useEffect(() => {
    const unsubscribe = firestoreData.subscribeToUsers((data) => {
      setUsers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (user.username && user.username.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && !user.isBlocked) ||
                         (statusFilter === 'blocked' && user.isBlocked);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const success = await firestoreData.updateUserRole(userId, newRole);
    if (success) {
      audioService.playSuccess();
    }
  };

  const handleToggleBlock = async (userId: string, isBlocked: boolean) => {
    const success = await firestoreData.toggleUserBlock(userId, !isBlocked);
    if (success) {
      audioService.playClick();
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    const success = await firestoreData.deleteUser(userId);
    if (success) {
      audioService.playSuccess();
    }
  };

  const handleForceLogout = async (userId: string, userName: string) => {
    if (!window.confirm(`هل أنت متأكد من طرد المستخدم "${userName}" وإنهاء جلسته؟`)) return;
    const success = await firestoreData.forceLogoutUser(userId);
    if (success) {
      audioService.playSuccess();
      alert('تم إرسال أمر طرد المستخدم بنجاح. سيتم تسجيل خروجه فوراً.');
    } else {
      alert('فشل طرد المستخدم. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.username || !newUser.password) {
      alert('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }
    // Sanitize inputs
    const sanitizedName = sanitizeString(newUser.name);
    const sanitizedUsername = sanitizeUsername(newUser.username);
    const sanitizedPhone = sanitizePhone(newUser.phone);
    // Generate auto email if not provided
    const email = newUser.email ? sanitizeEmail(newUser.email) : `${sanitizedUsername}@studio.com`;
    
    const user: User = {
      id: Date.now().toString(),
      name: sanitizedName,
      email: email,
      role: newUser.role,
      isBlocked: false,
      createdAt: new Date().toISOString(),
      phone: sanitizedPhone,
      username: sanitizedUsername,
      password: newUser.password
    };
    const success = await firestoreData.saveUser(user);
    if (success) {
      audioService.playSuccess();
      setNewUser({ name: '', email: '', role: 'viewer' as UserRole, phone: '', username: '', password: '' });
      setIsAddUserOpen(false);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const badges = {
      admin: { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/30', icon: Crown, label: 'مدير' },
      editor: { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/30', icon: Edit, label: 'محرر' },
      viewer: { bg: 'bg-gray-500/20', text: 'text-gray-300', border: 'border-gray-500/30', icon: Eye, label: 'مشاهد' }
    };
    const badge = badges[role];
    const Icon = badge.icon;
    return (
      <span className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold', badge.bg, badge.text, badge.border)}>
        <Icon size={14} />
        {badge.label}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center">
            <Shield size={24} className="text-pink-400" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">إدارة الصلاحيات والموظفين</h1>
            <p className="text-sm text-pink-300/70 mt-1">إدارة المستخدمين وصلاحياتهم</p>
          </div>
        </div>
        <button
          onClick={() => setIsAddUserOpen(true)}
          className="px-5 h-12 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-sm flex items-center gap-2 hover:from-pink-600 hover:to-rose-600 transition-all"
        >
          <UserPlus size={18} />
          إضافة مستخدم
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-rose-500/10 p-5 backdrop-blur-xl shadow-xl shadow-pink-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
              <Users size={20} className="text-pink-400" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-white">{users.length}</p>
              <p className="text-xs text-pink-300/70">إجمالي المستخدمين</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-rose-500/10 p-5 backdrop-blur-xl shadow-xl shadow-pink-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Crown size={20} className="text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-white">{users.filter(u => u.role === 'admin').length}</p>
              <p className="text-xs text-pink-300/70">مديرين</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-rose-500/10 p-5 backdrop-blur-xl shadow-xl shadow-pink-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle size={20} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-white">{users.filter(u => !u.isBlocked).length}</p>
              <p className="text-xs text-pink-300/70">نشطين</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-rose-500/10 p-5 backdrop-blur-xl shadow-xl shadow-pink-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <XCircle size={20} className="text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-white">{users.filter(u => u.isBlocked).length}</p>
              <p className="text-xs text-pink-300/70">محظورين</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-rose-500/10 p-5 backdrop-blur-xl shadow-xl shadow-pink-500/10">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-pink-400" />
              <input
                type="text"
                placeholder="بحث عن مستخدم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 rounded-xl border border-pink-500/20 bg-white/5 pr-12 pl-4 text-sm font-medium text-white outline-none focus:border-pink-500/50 focus:bg-gradient-to-r focus:from-pink-500/10 focus:to-purple-500/10 transition-all"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as 'all' | UserRole)}
              className="h-11 px-4 rounded-xl border border-pink-500/20 bg-white/5 text-sm font-medium text-white outline-none focus:border-pink-500/50 focus:bg-gradient-to-r focus:from-pink-500/10 focus:to-purple-500/10 transition-all"
            >
              <option value="all">جميع الصلاحيات</option>
              <option value="admin">مدير</option>
              <option value="editor">محرر</option>
              <option value="viewer">مشاهد</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'blocked')}
              className="h-11 px-4 rounded-xl border border-pink-500/20 bg-white/5 text-sm font-medium text-white outline-none focus:border-pink-500/50 focus:bg-gradient-to-r focus:from-pink-500/10 focus:to-purple-500/10 transition-all"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="blocked">محظور</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-rose-500/10 p-6 backdrop-blur-xl shadow-xl shadow-pink-500/10">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-pink-300/70">جاري التحميل...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <Users size={48} className="text-pink-400/50 mx-auto mb-4" />
            <p className="text-pink-300/70">لا يوجد مستخدمين</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="space-y-4 md:hidden">
              {filteredUsers.map((user) => (
                <div key={user.id} className="p-4 rounded-xl bg-white/5 border border-pink-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center shrink-0">
                      <span className="text-lg font-bold text-pink-300">{user.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{user.name}</p>
                      <p className="text-xs text-pink-300/70 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-pink-300/70">الصلاحية:</span>
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                        className="h-8 px-2 rounded-lg border border-pink-500/20 bg-white/5 text-xs font-medium text-white outline-none focus:border-pink-500/50 transition-all"
                      >
                        <option value="viewer">مشاهد</option>
                        <option value="editor">محرر</option>
                        <option value="admin">مدير</option>
                      </select>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-pink-300/70">الحالة:</span>
                      {user.isBlocked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/20 border border-red-500/30 text-xs font-bold text-red-400">
                          <Lock size={12} />
                          محظور
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-xs font-bold text-emerald-400">
                          <Unlock size={12} />
                          نشط
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-pink-500/20">
                    <button
                      onClick={() => handleToggleBlock(user.id, user.isBlocked)}
                      className={cn(
                        "flex-1 p-2 rounded-lg transition-all text-xs font-bold",
                        user.isBlocked
                          ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                          : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      )}
                    >
                      {user.isBlocked ? 'إلغاء الحظر' : 'حظر'}
                    </button>
                    <button
                      onClick={() => handleForceLogout(user.id, user.name)}
                      className="flex-1 p-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-all text-xs font-bold"
                    >
                      طرد
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="flex-1 p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all text-xs font-bold"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-pink-500/20">
                    <th className="text-right py-4 px-4 text-xs font-extrabold text-pink-300/90 uppercase tracking-wider">المستخدم</th>
                    <th className="text-right py-4 px-4 text-xs font-extrabold text-pink-300/90 uppercase tracking-wider">البريد الإلكتروني</th>
                    <th className="text-right py-4 px-4 text-xs font-extrabold text-pink-300/90 uppercase tracking-wider">الصلاحية</th>
                    <th className="text-right py-4 px-4 text-xs font-extrabold text-pink-300/90 uppercase tracking-wider">الحالة</th>
                    <th className="text-right py-4 px-4 text-xs font-extrabold text-pink-300/90 uppercase tracking-wider">تاريخ الإنشاء</th>
                    <th className="text-right py-4 px-4 text-xs font-extrabold text-pink-300/90 uppercase tracking-wider">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-pink-500/10 hover:bg-white/5 transition-all">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center">
                            <span className="text-lg font-bold text-pink-300">{user.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{user.name}</p>
                            {user.phone && <p className="text-xs text-pink-300/70">{user.phone}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-pink-200/80">{user.email}</p>
                      </td>
                      <td className="py-4 px-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                          className="h-9 px-3 rounded-lg border border-pink-500/20 bg-white/5 text-xs font-medium text-white outline-none focus:border-pink-500/50 transition-all"
                        >
                          <option value="viewer">مشاهد</option>
                          <option value="editor">محرر</option>
                          <option value="admin">مدير</option>
                        </select>
                      </td>
                      <td className="py-4 px-4">
                        {user.isBlocked ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/20 border border-red-500/30 text-xs font-bold text-red-400">
                            <Lock size={14} />
                            محظور
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-xs font-bold text-emerald-400">
                            <Unlock size={14} />
                            نشط
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-pink-200/80">
                          {new Date(user.createdAt).toLocaleDateString('ar-EG')}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleBlock(user.id, user.isBlocked)}
                            className={cn(
                              "p-2 rounded-xl transition-all",
                              user.isBlocked 
                                ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30" 
                                : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                            )}
                            title={user.isBlocked ? "إلغاء الحظر" : "حظر"}
                          >
                            {user.isBlocked ? <Unlock size={16} /> : <Lock size={16} />}
                          </button>
                          <button
                            onClick={() => handleForceLogout(user.id, user.name)}
                            className="p-2 rounded-xl bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-all"
                            title="طرد وإنهاء الجلسة"
                          >
                            <LogOut size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                            title="حذف"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-rose-500/10 p-6 w-full max-w-md backdrop-blur-xl shadow-xl shadow-pink-500/10"
          >
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-extrabold text-white">إضافة مستخدم جديد</h2>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="p-2 rounded-xl bg-white/5 text-pink-200/80 hover:bg-white/10 transition-all"
              >
                <XCircle size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-pink-300/90 mb-2">الاسم</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full h-11 rounded-xl border border-pink-500/20 bg-white/5 px-4 text-sm font-medium text-white outline-none focus:border-pink-500/50 focus:bg-gradient-to-r focus:from-pink-500/10 focus:to-purple-500/10 transition-all"
                  placeholder="اسم المستخدم"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-pink-300/90 mb-2">البريد الإلكتروني <span className="text-pink-300/60">(اختياري)</span></label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full h-11 rounded-xl border border-pink-500/20 bg-white/5 px-4 text-sm font-medium text-white outline-none focus:border-pink-500/50 focus:bg-gradient-to-r focus:from-pink-500/10 focus:to-purple-500/10 transition-all"
                  placeholder="example@email.com"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-pink-300/90 mb-2">اسم المستخدم للدخول</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full h-11 rounded-xl border border-pink-500/20 bg-white/5 px-4 text-sm font-medium text-white outline-none focus:border-pink-500/50 focus:bg-gradient-to-r focus:from-pink-500/10 focus:to-purple-500/10 transition-all"
                  placeholder="اسم المستخدم"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-pink-300/90 mb-2">كلمة المرور</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full h-11 rounded-xl border border-pink-500/20 bg-white/5 px-4 text-sm font-medium text-white outline-none focus:border-pink-500/50 focus:bg-gradient-to-r focus:from-pink-500/10 focus:to-purple-500/10 transition-all"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-pink-300/90 mb-2">رقم الهاتف</label>
                <input
                  type="text"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className="w-full h-11 rounded-xl border border-pink-500/20 bg-white/5 px-4 text-sm font-medium text-white outline-none focus:border-pink-500/50 focus:bg-gradient-to-r focus:from-pink-500/10 focus:to-purple-500/10 transition-all"
                  placeholder="رقم الهاتف (اختياري)"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-pink-300/90 mb-2">الصلاحية</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                  className="w-full h-11 rounded-xl border border-pink-500/20 bg-white/5 px-4 text-sm font-medium text-white outline-none focus:border-pink-500/50 focus:bg-gradient-to-r focus:from-pink-500/10 focus:to-purple-500/10 transition-all"
                >
                  <option value="viewer">مشاهد</option>
                  <option value="editor">محرر</option>
                  <option value="admin">مدير</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddUser}
                  className="flex-1 h-11 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-sm hover:from-pink-600 hover:to-rose-600 transition-all"
                >
                  إضافة
                </button>
                <button
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 h-11 rounded-xl bg-white/5 text-pink-200/80 border border-pink-500/20 font-bold text-sm hover:bg-gradient-to-r hover:from-pink-500/30 hover:to-purple-500/30 hover:text-white transition-all"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
