import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, Trash2, Check, X, Search, Calendar, User, Phone as PhoneIcon } from 'lucide-react';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { firebaseService } from '../../services/firebase';
import { toast } from 'sonner';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  useEffect(() => {
    const db = firebaseService.getDB();
    const q = query(
      collection(db, 'contact-messages'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: ContactMessage[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ContactMessage));
      
      setMessages(msgs);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching messages:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let filtered = messages;

    if (searchQuery) {
      filtered = filtered.filter(msg => 
        msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus === 'unread') {
      filtered = filtered.filter(msg => !msg.read);
    } else if (filterStatus === 'read') {
      filtered = filtered.filter(msg => msg.read);
    }

    setFilteredMessages(filtered);
  }, [messages, searchQuery, filterStatus]);

  const markAsRead = async (messageId: string) => {
    try {
      const db = firebaseService.getDB();
      await updateDoc(doc(db, 'contact-messages', messageId), { read: true });
      toast.success('تم تحديد الرسالة كمقروءة');
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('حدث خطأ أثناء تحديث الرسالة');
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const db = firebaseService.getDB();
      await deleteDoc(doc(db, 'contact-messages', messageId));
      toast.success('تم حذف الرسالة');
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('حدث خطأ أثناء حذف الرسالة');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050508] via-[#0a0a1a] to-[#050508] text-white p-4 md:p-6">
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-slate-600 flex items-center justify-center">
                <Mail size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-slate-400 bg-clip-text text-transparent mb-1">
                  رسائل الاتصال
                </h1>
                <p className="text-gray-400">
                  {unreadCount > 0 ? (
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      {unreadCount} رسالة جديدة
                    </span>
                  ) : (
                    'لا توجد رسائل جديدة'
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>إجمالي الرسائل:</span>
              <span className="text-white font-semibold">{messages.length}</span>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="text"
                placeholder="بحث في الرسائل..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl pr-10 pl-4 py-3 text-white placeholder-slate-500 focus:border-blue-500/30 focus:outline-none transition-all hover:scale-[1.01] backdrop-blur-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg transition-all hover:scale-105 ${
                  filterStatus === 'all' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-black/20 text-gray-400 hover:bg-black/30'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setFilterStatus('unread')}
                className={`px-4 py-2 rounded-lg transition-all hover:scale-105 ${
                  filterStatus === 'unread' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-black/20 text-gray-400 hover:bg-black/30'
                }`}
              >
                غير مقروء
              </button>
              <button
                onClick={() => setFilterStatus('read')}
                className={`px-4 py-2 rounded-lg transition-all hover:scale-105 ${
                  filterStatus === 'read' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-black/20 text-gray-400 hover:bg-black/30'
                }`}
              >
                مقروء
              </button>
            </div>
          </div>
        </motion.div>

        {/* Messages Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">
            جاري التحميل...
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-12">
            <Mail size={64} className="mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">لا توجد رسائل</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredMessages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedMessage(message)}
                className={`bg-black/40 backdrop-blur-xl border rounded-xl md:rounded-2xl p-4 md:p-6 cursor-pointer transition-all hover:bg-black/50 hover:scale-[1.01] shadow-xl ${
                  !message.read ? 'border-blue-500/30 bg-blue-500/5' : 'border-white/10'
                } ${selectedMessage?.id === message.id ? 'border-blue-500/50 ring-2 ring-blue-500/20' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        !message.read 
                          ? 'bg-gradient-to-br from-blue-500 to-slate-600' 
                          : 'bg-white/10'
                      }`}>
                        <User size={20} className={message.read ? "text-gray-400" : "text-white"} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">{message.name}</h3>
                          {!message.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                          )}
                        </div>
                        <p className="text-sm text-gray-400">{message.email}</p>
                      </div>
                    </div>
                    <p className="text-gray-300 line-clamp-2 mb-3 text-sm leading-relaxed">{message.message}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg">
                        <PhoneIcon size={12} />
                        {message.phone}
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg">
                        <Calendar size={12} />
                        {formatDate(message.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {!message.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(message.id);
                        }}
                        className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all hover:scale-110"
                        title="تحديد كمقروء"
                      >
                        <Check size={18} />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMessage(message.id);
                      }}
                      className="p-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all hover:scale-110"
                      title="حذف"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Message Detail Modal */}
        {selectedMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedMessage(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl transition-all hover:scale-[1.01]"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedMessage.name}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{selectedMessage.email}</span>
                    <span>{selectedMessage.phone}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="p-2 rounded-lg bg-black/20 hover:bg-black/30 border border-white/10 transition-all hover:scale-110 backdrop-blur-sm"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              
              <div className="bg-black/20 rounded-xl p-4 mb-6 border border-white/10">
                <p className="text-slate-300 whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{formatDate(selectedMessage.createdAt)}</span>
                <div className="flex gap-2">
                  {!selectedMessage.read && (
                    <button
                      onClick={() => markAsRead(selectedMessage.id)}
                      className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all hover:scale-105"
                    >
                      تحديد كمقروء
                    </button>
                  )}
                  <button
                    onClick={() => deleteMessage(selectedMessage.id)}
                    className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all hover:scale-105"
                  >
                    حذف
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
