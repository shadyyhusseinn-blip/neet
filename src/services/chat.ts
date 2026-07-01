// Live Chat Service

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderType: 'customer' | 'agent' | 'bot';
  content: string;
  timestamp: number;
  read: boolean;
  attachments?: string[];
}

export interface Conversation {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  status: 'active' | 'pending' | 'closed';
  assignedTo?: string;
  assignedToName?: string;
  createdAt: number;
  updatedAt: number;
  lastMessage?: string;
  lastMessageTime?: number;
  unreadCount: number;
  tags: string[];
}

export class ChatService {
  private static conversations: Conversation[] = [];
  private static messages: ChatMessage[] = [];

  // Initialize chat service
  static initialize(): void {
    // Load conversations from localStorage
    const storedConversations = localStorage.getItem('chat_conversations');
    if (storedConversations) {
      try {
        this.conversations = JSON.parse(storedConversations);
      } catch (error) {
        console.error('Failed to load conversations:', error);
      }
    }

    // Load messages from localStorage
    const storedMessages = localStorage.getItem('chat_messages');
    if (storedMessages) {
      try {
        this.messages = JSON.parse(storedMessages);
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    }
  }

  // Create new conversation
  static createConversation(customer: {
    id: string;
    name: string;
    email: string;
  }): Conversation {
    const conversation: Conversation = {
      id: this.generateConversationId(),
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      unreadCount: 0,
      tags: [],
    };

    this.conversations.push(conversation);
    this.saveConversations();

    return conversation;
  }

  // Get conversation by ID
  static getConversationById(id: string): Conversation | undefined {
    return this.conversations.find((conv) => conv.id === id);
  }

  // Get conversations by customer
  static getConversationsByCustomer(customerId: string): Conversation[] {
    return this.conversations.filter((conv) => conv.customerId === customerId);
  }

  // Get all conversations
  static getConversations(filter?: {
    status?: Conversation['status'];
    assignedTo?: string;
  }): Conversation[] {
    let filtered = [...this.conversations];

    if (filter?.status) {
      filtered = filtered.filter((conv) => conv.status === filter.status);
    }

    if (filter?.assignedTo) {
      filtered = filtered.filter((conv) => conv.assignedTo === filter.assignedTo);
    }

    // Sort by updated time (newest first)
    filtered.sort((a, b) => b.updatedAt - a.updatedAt);

    return filtered;
  }

  // Assign conversation to agent
  static assignConversation(conversationId: string, agentId: string, agentName: string): boolean {
    const conversation = this.getConversationById(conversationId);
    if (!conversation) return false;

    conversation.assignedTo = agentId;
    conversation.assignedToName = agentName;
    conversation.status = 'active';
    conversation.updatedAt = Date.now();

    this.saveConversations();
    return true;
  }

  // Close conversation
  static closeConversation(conversationId: string): boolean {
    const conversation = this.getConversationById(conversationId);
    if (!conversation) return false;

    conversation.status = 'closed';
    conversation.updatedAt = Date.now();

    this.saveConversations();
    return true;
  }

  // Reopen conversation
  static reopenConversation(conversationId: string): boolean {
    const conversation = this.getConversationById(conversationId);
    if (!conversation) return false;

    conversation.status = 'active';
    conversation.updatedAt = Date.now();

    this.saveConversations();
    return true;
  }

  // Send message
  static sendMessage(
    conversationId: string,
    senderId: string,
    senderName: string,
    senderType: ChatMessage['senderType'],
    content: string,
    attachments?: string[]
  ): ChatMessage {
    const message: ChatMessage = {
      id: this.generateMessageId(),
      conversationId,
      senderId,
      senderName,
      senderType,
      content,
      timestamp: Date.now(),
      read: false,
      attachments,
    };

    this.messages.push(message);

    // Update conversation
    const conversation = this.getConversationById(conversationId);
    if (conversation) {
      conversation.lastMessage = content;
      conversation.lastMessageTime = message.timestamp;
      conversation.updatedAt = message.timestamp;

      if (senderType === 'customer') {
        conversation.unreadCount++;
      }
    }

    this.saveMessages();
    this.saveConversations();

    return message;
  }

  // Get messages for conversation
  static getMessages(conversationId: string): ChatMessage[] {
    return this.messages
      .filter((msg) => msg.conversationId === conversationId)
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  // Mark messages as read
  static markMessagesAsRead(conversationId: string, senderId: string): void {
    this.messages.forEach((msg) => {
      if (msg.conversationId === conversationId && msg.senderId !== senderId) {
        msg.read = true;
      }
    });

    const conversation = this.getConversationById(conversationId);
    if (conversation) {
      conversation.unreadCount = 0;
    }

    this.saveMessages();
    this.saveConversations();
  }

  // Get unread message count for agent
  static getUnreadCount(agentId: string): number {
    return this.conversations
      .filter((conv) => conv.assignedTo === agentId)
      .reduce((sum, conv) => sum + conv.unreadCount, 0);
  }

  // Add tag to conversation
  static addTag(conversationId: string, tag: string): boolean {
    const conversation = this.getConversationById(conversationId);
    if (!conversation) return false;

    if (!conversation.tags.includes(tag)) {
      conversation.tags.push(tag);
      this.saveConversations();
    }

    return true;
  }

  // Remove tag from conversation
  static removeTag(conversationId: string, tag: string): boolean {
    const conversation = this.getConversationById(conversationId);
    if (!conversation) return false;

    conversation.tags = conversation.tags.filter((t) => t !== tag);
    this.saveConversations();

    return true;
  }

  // Search conversations
  static searchConversations(query: string): Conversation[] {
    const lowerQuery = query.toLowerCase();
    return this.conversations.filter(
      (conv) =>
        conv.customerName.toLowerCase().includes(lowerQuery) ||
        conv.customerEmail.toLowerCase().includes(lowerQuery) ||
        conv.lastMessage?.toLowerCase().includes(lowerQuery) ||
        conv.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  }

  // Get chat statistics
  static getStatistics(): {
    totalConversations: number;
    activeConversations: number;
    pendingConversations: number;
    closedConversations: number;
    totalMessages: number;
    averageResponseTime: number;
  } {
    const activeConversations = this.conversations.filter(
      (conv) => conv.status === 'active'
    ).length;
    const pendingConversations = this.conversations.filter(
      (conv) => conv.status === 'pending'
    ).length;
    const closedConversations = this.conversations.filter(
      (conv) => conv.status === 'closed'
    ).length;

    // Calculate average response time (simplified)
    const responseTimes: number[] = [];
    this.conversations.forEach((conv) => {
      const convMessages = this.getMessages(conv.id);
      if (convMessages.length >= 2) {
        const firstCustomerMsg = convMessages.find((m) => m.senderType === 'customer');
        const firstAgentMsg = convMessages.find((m) => m.senderType === 'agent');
        if (firstCustomerMsg && firstAgentMsg) {
          responseTimes.push(firstAgentMsg.timestamp - firstCustomerMsg.timestamp);
        }
      }
    });

    const averageResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
        : 0;

    return {
      totalConversations: this.conversations.length,
      activeConversations,
      pendingConversations,
      closedConversations,
      totalMessages: this.messages.length,
      averageResponseTime,
    };
  }

  // Generate conversation ID
  private static generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate message ID
  private static generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Save conversations to localStorage
  private static saveConversations(): void {
    try {
      localStorage.setItem('chat_conversations', JSON.stringify(this.conversations));
    } catch (error) {
      console.error('Failed to save conversations:', error);
    }
  }

  // Save messages to localStorage
  private static saveMessages(): void {
    try {
      localStorage.setItem('chat_messages', JSON.stringify(this.messages));
    } catch (error) {
      console.error('Failed to save messages:', error);
    }
  }

  // Bot auto-response
  static getBotResponse(message: string): string {
    const lower = message.toLowerCase();

    // Common responses
    if (lower.includes('سعر') || lower.includes('تكلفة')) {
      return 'أسعارنا تبدأ من 3000 ج.م للجلسات الفردية. يمكنك الاطلاع على جميع الباقات من خلال صفحة الباقات.';
    }

    if (lower.includes('حجز') || lower.includes('موعد')) {
      return 'يمكنك حجز موعد من خلال صفحة الحجز أو التواصل معنا مباشرة على هذا الشات.';
    }

    if (lower.includes('زفاف') || lower.includes('عرس')) {
      return 'نقدم باقات خاصة لحفلات الزفاف تبدأ من 15000 ج.م. تشمل التصوير والتحرير وألبوم صور.';
    }

    if (lower.includes('وقت') || lower.includes('ساعات')) {
      return 'ساعات العمل من 9 صباحاً حتى 9 مساءً يومياً.';
    }

    if (lower.includes('موقع') || lower.includes('عنوان')) {
      return 'نحن موجودون في القاهرة، مصر. يمكنك زيارة الاستوديو بعد حجز موعد.';
    }

    // Default response
    return 'شكراً لتواصلك معنا! سيقوم أحد موظفينا بالرد عليك قريباً. في هذه الأثناء، يمكنك تصفح موقعنا لمعرفة المزيد عن خدماتنا.';
  }

  // Transfer conversation to another agent
  static transferConversation(
    conversationId: string,
    newAgentId: string,
    newAgentName: string
  ): boolean {
    const conversation = this.getConversationById(conversationId);
    if (!conversation) return false;

    conversation.assignedTo = newAgentId;
    conversation.assignedToName = newAgentName;
    conversation.updatedAt = Date.now();

    this.saveConversations();
    return true;
  }
}

export const chatService = ChatService;
