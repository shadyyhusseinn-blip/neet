import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Users, Clock, AlertCircle, Send, X } from 'lucide-react';
import ViewShell from '../../components/layout/ViewShell';
import { listenToConversations, addMessage, updateConversationStatus } from '../../services/chatService';
import { Conversation } from '../../types/chat';

export default function ChatManagement() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    const unsubscribe = listenToConversations((convs) => {
      setConversations(convs);
    });

    return () => unsubscribe();
  }, []);

  const handleReply = async () => {
    if (!selectedConversation || !replyText.trim()) return;

    await addMessage(selectedConversation.id, replyText, 'admin');
    setReplyText('');
  };

  const handleStatusChange = async (conversationId: string, status: 'active' | 'pending' | 'closed') => {
    await updateConversationStatus(conversationId, status);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10';
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      case 'closed': return 'text-gray-400 bg-gray-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'pending': return 'قيد الانتظار';
      case 'closed': return 'مغلق';
      default: return status;
    }
  };

  return (
    <ViewShell
      title="إدارة المحادثات"
      subtitle="مراقبة والرد على محادثات الزوار"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
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

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* قائمة المحادثات */}
        <div className="lg:col-span-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl transition-all hover:scale-[1.01]">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users size={20} />
            المحادثات ({conversations.length})
          </h2>
          
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {conversations.map((conversation) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedConversation(conversation)}
                className={`p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.02] shadow-lg hover:shadow-xl ${
                  selectedConversation?.id === conversation.id
                    ? 'bg-black/50 border border-blue-500/30'
                    : 'bg-black/20 border border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-white">{conversation.userName}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(conversation.status)}`}>
                    {getStatusText(conversation.status)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock size={14} />
                  {new Date(conversation.lastMessageAt).toLocaleDateString('ar-EG')}
                </div>
                
                {conversation.needsAdminResponse && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-yellow-400">
                    <AlertCircle size={14} />
                    يحتاج رد
                  </div>
                )}
              </motion.div>
            ))}
            
            {conversations.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <MessageSquare size={48} className="mx-auto mb-2 opacity-50" />
                <p>لا توجد محادثات بعد</p>
              </div>
            )}
          </div>
        </div>

        {/* تفاصيل المحادثة */}
        <div className="lg:col-span-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-6 shadow-xl transition-all hover:scale-[1.01]">
          {selectedConversation ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <MessageSquare size={24} />
                    {selectedConversation.userName}
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    بدأ المحادثة: {new Date(selectedConversation.createdAt).toLocaleDateString('ar-EG')}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <select
                    value={selectedConversation.status}
                    onChange={(e) => handleStatusChange(selectedConversation.id, e.target.value as any)}
                    className="bg-black/20 text-white rounded-lg px-3 py-2 text-sm border border-white/10 focus:outline-none focus:border-blue-500 backdrop-blur-sm transition-all hover:scale-105"
                  >
                    <option value="active">نشط</option>
                    <option value="pending">قيد الانتظار</option>
                    <option value="closed">مغلق</option>
                  </select>
                  
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="p-2 bg-black/20 hover:bg-black/30 border border-white/10 rounded-lg transition-all hover:scale-110 text-white backdrop-blur-sm"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* الرسائل */}
              <div className="space-y-4 max-h-[400px] overflow-y-auto mb-4 p-4 bg-black/20 rounded-xl backdrop-blur-sm">
                {selectedConversation.messages.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <p>لا توجد رسائل بعد</p>
                  </div>
                ) : (
                  selectedConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl p-3 ${
                          message.sender === 'user'
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                            : message.sender === 'admin'
                            ? 'bg-green-600 text-white'
                            : 'bg-slate-700 text-white'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString('ar-EG', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* صندوق الرد */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="اكتب ردك هنا..."
                  className="flex-1 bg-black/20 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400 backdrop-blur-sm transition-all hover:scale-[1.01]"
                />
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl px-6 py-3 hover:from-blue-700 hover:to-purple-700 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  <Send size={20} />
                  <span>إرسال</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-16 text-slate-400">
              <MessageSquare size={64} className="mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">اختر محادثة</h3>
              <p>اختر محادثة من القائمة لعرض التفاصيل والرد</p>
            </div>
          )}
        </div>
      </div>
    </ViewShell>
  );
}
