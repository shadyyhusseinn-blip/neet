import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Phone, Mail, MapPin, CheckCircle, XCircle, Clock, Filter, Search, ArrowRight, User, CreditCard } from 'lucide-react';

interface BookingRequest {
  id: string;
  clientName: string;
  phone: string;
  email?: string;
  eventType: string;
  eventDate: string;
  location?: string;
  packageName?: string;
  totalPrice?: number;
  notes?: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed';
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  createdAt: string;
}

export default function BookingRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'rejected'>('all');
  const [search, setSearch] = useState('');

  // Mock data - replace with Firestore integration
  useEffect(() => {
    const mockRequests: BookingRequest[] = [
      {
        id: '1',
        clientName: 'أحمد محمد',
        phone: '01012345678',
        email: 'ahmed@example.com',
        eventType: 'زفاف',
        eventDate: '2024-07-15',
        location: 'فندق القاهرة',
        packageName: 'باقة الزفاف الأساسية',
        totalPrice: 15000,
        notes: 'يحتاج مصور إضافي',
        status: 'pending',
        paymentStatus: 'unpaid',
        createdAt: '2024-06-20T10:00:00'
      },
      {
        id: '2',
        clientName: 'سارة علي',
        phone: '01198765432',
        email: 'sara@example.com',
        eventType: 'خطوبة',
        eventDate: '2024-08-01',
        location: 'استوديو',
        packageName: 'باقة الخطوبة',
        totalPrice: 8000,
        notes: '',
        status: 'confirmed',
        paymentStatus: 'partial',
        createdAt: '2024-06-19T14:30:00'
      },
      {
        id: '3',
        clientName: 'محمد حسن',
        phone: '01234567890',
        eventType: 'تخرج',
        eventDate: '2024-06-25',
        packageName: 'باقة التخرج',
        totalPrice: 5000,
        notes: 'تصوير جماعي',
        status: 'completed',
        paymentStatus: 'paid',
        createdAt: '2024-06-18T09:00:00'
      }
    ];
    setRequests(mockRequests);
  }, []);

  const filteredRequests = requests.filter(req => {
    const matchesFilter = filter === 'all' || req.status === filter;
    const matchesSearch = req.clientName.includes(search) || 
                         req.phone.includes(search) ||
                         (req.email && req.email.includes(search));
    return matchesFilter && matchesSearch;
  });

  const handleStatusChange = (id: string, newStatus: BookingRequest['status']) => {
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status: newStatus } : req
    ));
  };

  const getStatusColor = (status: BookingRequest['status']) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'confirmed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const getStatusText = (status: BookingRequest['status']) => {
    switch (status) {
      case 'pending': return 'قيد الانتظار';
      case 'confirmed': return 'مؤكد';
      case 'rejected': return 'مرفوض';
      case 'completed': return 'مكتمل';
    }
  };

  const getPaymentStatusColor = (status: BookingRequest['paymentStatus']) => {
    switch (status) {
      case 'unpaid': return 'bg-red-500/20 text-red-400';
      case 'partial': return 'bg-amber-500/20 text-amber-400';
      case 'paid': return 'bg-emerald-500/20 text-emerald-400';
    }
  };

  const getPaymentStatusText = (status: BookingRequest['paymentStatus']) => {
    switch (status) {
      case 'unpaid': return 'غير مدفوع';
      case 'partial': return 'دفعة جزئية';
      case 'paid': return 'مدفوع بالكامل';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">طلبات الحجز</h1>
        <p className="text-gray-400">إدارة طلبات الحجز الواردة من الموقع</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#111111] border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Clock size={24} className="text-amber-400" />
            <div>
              <p className="text-2xl font-bold text-white">
                {requests.filter(r => r.status === 'pending').length}
              </p>
              <p className="text-xs text-gray-400">قيد الانتظار</p>
            </div>
          </div>
        </div>
        <div className="bg-[#111111] border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <CheckCircle size={24} className="text-emerald-400" />
            <div>
              <p className="text-2xl font-bold text-white">
                {requests.filter(r => r.status === 'confirmed').length}
              </p>
              <p className="text-xs text-gray-400">مؤكد</p>
            </div>
          </div>
        </div>
        <div className="bg-[#111111] border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <CreditCard size={24} className="text-purple-400" />
            <div>
              <p className="text-2xl font-bold text-white">
                {requests.filter(r => r.paymentStatus === 'paid').length}
              </p>
              <p className="text-xs text-gray-400">مدفوع</p>
            </div>
          </div>
        </div>
        <div className="bg-[#111111] border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <User size={24} className="text-blue-400" />
            <div>
              <p className="text-2xl font-bold text-white">{requests.length}</p>
              <p className="text-xs text-gray-400">إجمالي الطلبات</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="بحث بالاسم أو الهاتف..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 rounded-lg border border-gray-700 bg-gray-800/50 px-4 pr-10 text-sm text-white outline-none focus:border-purple-500 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'confirmed', 'rejected'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {f === 'all' ? 'الكل' : 
               f === 'pending' ? 'قيد الانتظار' : 
               f === 'confirmed' ? 'مؤكد' : 'مرفوض'}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">لا توجد طلبات</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#111111] border border-gray-800 rounded-xl p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Client Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <User size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{request.clientName}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Phone size={14} />
                        {request.phone}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar size={14} />
                      {request.eventDate}
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <MapPin size={14} />
                      {request.eventType}
                    </div>
                    {request.packageName && (
                      <div className="text-gray-400">
                        {request.packageName}
                      </div>
                    )}
                    {request.totalPrice && (
                      <div className="text-purple-400 font-semibold">
                        {request.totalPrice} ج.م
                      </div>
                    )}
                  </div>
                  
                  {request.notes && (
                    <p className="mt-3 text-sm text-gray-500 bg-gray-800/50 rounded-lg p-2">
                      {request.notes}
                    </p>
                  )}
                </div>

                {/* Status & Actions */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                      {getStatusText(request.status)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(request.paymentStatus)}`}>
                      {getPaymentStatusText(request.paymentStatus)}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(request.id, 'confirmed')}
                          className="flex-1 px-3 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm hover:bg-emerald-500/30 transition-all flex items-center justify-center gap-1"
                        >
                          <CheckCircle size={14} />
                          تأكيد
                        </button>
                        <button
                          onClick={() => handleStatusChange(request.id, 'rejected')}
                          className="flex-1 px-3 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm hover:bg-red-500/30 transition-all flex items-center justify-center gap-1"
                        >
                          <XCircle size={14} />
                          رفض
                        </button>
                      </>
                    )}
                    {request.status === 'confirmed' && (
                      <button
                        onClick={() => handleStatusChange(request.id, 'completed')}
                        className="flex-1 px-3 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm hover:bg-blue-500/30 transition-all flex items-center justify-center gap-1"
                      >
                        <CheckCircle size={14} />
                        إكمال
                      </button>
                    )}
                    <button
                      onClick={() => window.open(`https://wa.me/2${request.phone.substring(1)}`, '_blank')}
                      className="px-3 py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-sm hover:bg-green-500/30 transition-all flex items-center justify-center gap-1"
                    >
                      واتساب
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
