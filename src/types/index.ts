export type Language = 'zh' | 'en' | 'ja';

export type EmotionState = 'calm' | 'concerned' | 'angry';

export type EmotionLevel = 'mild' | 'moderate' | 'severe';

export interface ComfortModeState {
  enabled: boolean;
  level: EmotionLevel;
  triggeredAt?: number;
  consecutiveNegativeCount: number;
  avgEmotionScore: number;
}

export type IntentType =
  | 'consultation'
  | 'complaint'
  | 'after_sales'
  | 'refund'
  | 'shipping'
  | 'product_info'
  | 'account'
  | 'greeting'
  | 'thanks'
  | 'farewell'
  | 'human_request'
  | 'unknown';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TicketStatus = 'open' | 'processing' | 'pending' | 'resolved' | 'closed';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  language: Language;
  emotion?: EmotionState;
  emotionScore?: number;
  intent?: IntentType;
}

export interface TicketNote {
  id: string;
  content: string;
  author: string;
  timestamp: number;
}

export interface Ticket {
  id: string;
  title: string;
  type: IntentType;
  priority: TicketPriority;
  status: TicketStatus;
  summary: string;
  conversationId: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  assignee?: string;
  notes?: TicketNote[];
  language: Language;
  emotionLevel: number;
  keyEntities?: {
    orderId?: string;
    productName?: string;
    amount?: string;
  };
}

export interface Conversation {
  id: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  currentLanguage: Language;
  emotionTrend: number[];
  status: 'active' | 'resolved' | 'ticket_created';
  ticketId?: string;
  satisfaction?: number;
  unknownCount: number;
  consecutiveNegativeCount: number;
  comfortMode: ComfortModeState;
}

export interface DailyStat {
  date: string;
  conversations: number;
  tickets: number;
  avgSatisfaction: number;
}

export interface DashboardStats {
  totalConversations: number;
  autoResolutionRate: number;
  avgResponseTime: number;
  avgSatisfaction: number;
  ticketsCreated: number;
  ticketsResolved: number;
  emotions: { calm: number; concerned: number; angry: number };
  dailyTrend: DailyStat[];
  intentDistribution: Record<IntentType, number>;
}

export interface IntentKeywords {
  [key: string]: string[];
}

export interface ReplyTemplate {
  [intent: string]: string[];
}
