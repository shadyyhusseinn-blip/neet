import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Bot, User, Minimize2, Maximize2 } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const FAQ_RESPONSES: Record<string, string> = {
  'الأسعار': 'أسعارنا تبدأ من 1500 جنيه للبورتريه و5000 جنيه للأفراح. يمكننا تخصيص باقة تناسب ميزانيتك. هل تريد معرفة المزيد عن باقة معينة؟',
  'الباقات': 'لدينا 4 باقات رئيسية:\n1. باقة البرونز: من 5000 جنيه\n2. باقة الفضة: من 8000 جنيه\n3. باقة الذهب: من 12000 جنيه\n4. باقة البلاتين: من 20000 جنيه\nأي باقة تهمك؟',
  'الحجز': 'يمكنك حجز موعد من خلال صفحة "احجز الآن" أو التواصل معنا مباشرة. نحتاج معلومات أساسية مثل التاريخ والوقت ونوع الخدمة المطلوبة.',
  'التسليم': 'عادة يتم تسليم الصور خلال 2-4 أسابيع بعد الحدث. يمكن تقديم التسليم مقابل رسوم إضافية.',
  'التعديل': 'نقوم بتعديل احترافي للصور يشمل تصحيح الألوان، الريتوش، وتحسين الجودة.',
  'الموقع': 'مقرنا الرئيسي في القاهرة، مصر. نغطي جميع المناطق.',
  'طرق الدفع': 'نقبل الدفع النقدي، التحويل البنكي، والبطاقات البنكية. يمكن تقسيم الدفع على دفعات.',
  'الإلغاء': 'يمكن إلغاء الحجز مع إشعار مسبق بـ 48 ساعة. سيتم خصم رسوم إلغاء بسيطة.',
  'default': 'أنا مساعد ذكي لشادي حسين. يمكنني مساعدتك في:\n- معرفة الأسعار والباقات\n- حجز المواعيد\n- معرفة المزيد عن خدماتنا\n- الإجابة على أسئلتك\n\nكيف يمكنني مساعدتك؟'
};

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'مرحباً! 👋 أنا مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const generateResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    for (const [keyword, response] of Object.entries(FAQ_RESPONSES)) {
      if (keyword !== 'default' && lowerMessage.includes(keyword.toLowerCase())) {
        return response;
      }
    }
    
    return FAQ_RESPONSES.default;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: generateResponse(inputValue),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { label: 'الأسعار', message: 'كم الأسعار؟' },
    { label: 'الباقات', message: 'ما هي الباقات المتاحة؟' },
    { label: 'الحجز', message: 'كيف أحجز موعد؟' },
    { label: 'التسليم', message: 'متى يتم تسليم الصور؟' }
  ];

  return (
    <>
      {/* Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 left-4 z-50 w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg shadow-purple-500/30 flex items-center justify-center hover:shadow-purple-500/50 transition-all ${isOpen ? 'hidden' : ''}`}
        aria-label="فتح المساعد الذكي"
      >
        <Bot size={28} className="text-white" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className={`fixed bottom-24 left-4 z-50 bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] border border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-500/20 backdrop-blur-lg ${
              isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
            } overflow-hidden`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-purple-500/30 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Bot size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">المساعد الذكي</h3>
                    <p className="text-xs text-gray-400">متاح 24/7</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {isMinimized ? <Maximize2 size={18} className="text-gray-400" /> : <Minimize2 size={18} className="text-gray-400" />}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X size={18} className="text-gray-400" />
                  </button>
                </div>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="h-[420px] overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-3 ${
                          message.type === 'user'
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                            : 'bg-white/10 text-gray-200'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {message.type === 'bot' && <Bot size={16} className="text-purple-400 flex-shrink-0 mt-1" />}
                          {message.type === 'user' && <User size={16} className="text-white flex-shrink-0 mt-1" />}
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                        <p className="text-xs opacity-50 mt-1">
                          {message.timestamp.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-white/10 rounded-2xl p-3 flex items-center gap-2">
                        <Bot size={16} className="text-purple-400" />
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100" />
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                <div className="px-4 pb-2">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {quickActions.map((action) => (
                      <button
                        key={action.label}
                        onClick={() => {
                          setInputValue(action.message);
                          handleSendMessage();
                        }}
                        className="flex-shrink-0 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-300 hover:bg-white/10 hover:border-purple-500/30 transition-all"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input */}
                <div className="p-4 border-t border-purple-500/30">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="اكتب رسالتك..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/30 transition-colors"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim()}
                      className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={20} className="text-white" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
