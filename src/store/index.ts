import { create } from 'zustand';
import {
  Conversation,
  Ticket,
  Message,
  DashboardStats,
  Language,
  IntentType,
  TicketStatus,
  TicketNote,
} from '../types';
import { seedConversations, seedTickets, seedStats } from './seedData';
import { classifyIntent } from '../services/intentClassifier';
import { analyzeEmotion, evaluateComfortMode } from '../services/emotionAnalyzer';
import { detectLanguage } from '../services/multilingualService';
import { generateReply } from '../services/responseGenerator';
import {
  shouldCreateTicket,
  createTicket,
} from '../services/ticketGenerator';

enum StorageKeys {
  CONVERSATIONS = 'smartcs_conversations',
  TICKETS = 'smartcs_tickets',
  STATS_CACHE = 'smartcs_stats_cache',
  INIT_FLAG = 'smartcs_init_flag',
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Storage save failed:', e);
  }
}

function initIfNeeded(): {
  conversations: Conversation[];
  tickets: Ticket[];
  stats: DashboardStats;
} {
  const initFlag = localStorage.getItem(StorageKeys.INIT_FLAG);
  if (initFlag) {
    return {
      conversations: loadFromStorage<Conversation[]>(StorageKeys.CONVERSATIONS, seedConversations),
      tickets: loadFromStorage<Ticket[]>(StorageKeys.TICKETS, seedTickets),
      stats: loadFromStorage<DashboardStats>(StorageKeys.STATS_CACHE, seedStats),
    };
  }
  localStorage.setItem(StorageKeys.INIT_FLAG, '1');
  saveToStorage(StorageKeys.CONVERSATIONS, seedConversations);
  saveToStorage(StorageKeys.TICKETS, seedTickets);
  saveToStorage(StorageKeys.STATS_CACHE, seedStats);
  return {
    conversations: [...seedConversations],
    tickets: [...seedTickets],
    stats: { ...seedStats },
  };
}

function newId(prefix: string): string {
  return prefix + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
}

interface AppState {
  conversations: Conversation[];
  tickets: Ticket[];
  stats: DashboardStats;
  activeConversationId: string | null;
  isTyping: boolean;
  adminLanguage: Language;

  ensureConversation: () => Conversation;
  getActiveConversation: () => Conversation | null;
  setActiveConversation: (id: string | null) => void;
  newConversation: (lang?: Language) => string;

  sendUserMessage: (text: string) => Promise<{ createdTicket?: Ticket }>;

  updateConversationLanguage: (convId: string, lang: Language) => void;
  markConversationResolved: (convId: string, satisfaction?: number) => void;

  updateTicket: (ticketId: string, updates: Partial<Ticket>) => void;
  updateTicketStatus: (ticketId: string, status: TicketStatus) => void;
  assignTicket: (ticketId: string, assignee: string) => void;
  addTicketNote: (ticketId: string, noteContent: string, author: string) => void;

  setAdminLanguage: (lang: Language) => void;
  resetData: () => void;
}

const useAppStore = create<AppState>((set, get) => {
  const initial = initIfNeeded();
  const activeConv = initial.conversations.find((c) => c.status === 'active') || null;

  return {
    conversations: initial.conversations,
    tickets: initial.tickets,
    stats: initial.stats,
    activeConversationId: activeConv?.id || null,
    isTyping: false,
    adminLanguage: 'zh',

    ensureConversation: (): Conversation => {
      const state = get();
      let conv = state.activeConversationId
        ? state.conversations.find((c) => c.id === state.activeConversationId)
        : null;
      if (!conv || conv.status === 'resolved') {
        const newConvId = state.newConversation();
        conv = get().conversations.find((c) => c.id === newConvId)!;
      }
      return conv;
    },

    getActiveConversation: (): Conversation | null => {
      const state = get();
      if (!state.activeConversationId) return null;
      return state.conversations.find((c) => c.id === state.activeConversationId) || null;
    },

    setActiveConversation: (id: string | null) => {
      set({ activeConversationId: id });
    },

    newConversation: (lang: Language = 'zh'): string => {
      const now = Date.now();
      const id = newId('CONV');
      const conv: Conversation = {
        id,
        createdAt: now,
        updatedAt: now,
        currentLanguage: lang,
        status: 'active',
        messages: [],
        emotionTrend: [],
        unknownCount: 0,
        consecutiveNegativeCount: 0,
        comfortMode: {
          enabled: false,
          level: 'mild',
          consecutiveNegativeCount: 0,
          avgEmotionScore: 0,
        },
      };
      set((s) => {
        const updated = [conv, ...s.conversations];
        saveToStorage(StorageKeys.CONVERSATIONS, updated);
        return { conversations: updated, activeConversationId: id };
      });
      return id;
    },

    sendUserMessage: async (text: string): Promise<{ createdTicket?: Ticket }> => {
      const state = get();
      let conv = state.ensureConversation();
      const trimmed = text.trim();
      if (!trimmed) return {};

      const detectedLang = detectLanguage(trimmed);
      const effectiveLang: Language = detectedLang;

      const previousUserMsg = [...conv.messages].reverse().find((m) => m.role === 'user');
      const previousIntent = previousUserMsg?.intent;

      const emotionResult = analyzeEmotion(trimmed, effectiveLang);
      const intentResult = classifyIntent(trimmed, effectiveLang, previousIntent);

      const now = Date.now();
      const userMessage: Message = {
        id: newId('MSG'),
        role: 'user',
        content: trimmed,
        timestamp: now,
        language: effectiveLang,
        emotion: emotionResult.state,
        emotionScore: emotionResult.score,
        intent: intentResult.intent,
      };

      set({ isTyping: true });

      set((s) => {
        const updatedConvs = s.conversations.map((c) => {
          if (c.id !== conv.id) return c;
          const newEmotionTrend = [...c.emotionTrend, emotionResult.score].slice(-10);
          const newConsec = emotionResult.score >= 0.4 ? c.consecutiveNegativeCount + 1 : 0;
          const newUnknown = intentResult.intent === 'unknown' ? c.unknownCount + 1 : c.unknownCount;
          const tempConv: Conversation = {
            ...c,
            messages: [...c.messages, userMessage],
            updatedAt: now,
            currentLanguage: effectiveLang,
            emotionTrend: newEmotionTrend,
            consecutiveNegativeCount: newConsec,
            unknownCount: newUnknown,
            comfortMode: c.comfortMode,
          };
          const comfortState = evaluateComfortMode(tempConv, emotionResult.score, emotionResult.level);
          return {
            ...tempConv,
            comfortMode: comfortState,
          };
        });
        saveToStorage(StorageKeys.CONVERSATIONS, updatedConvs);
        return { conversations: updatedConvs };
      });

      await new Promise((r) => setTimeout(r, 700 + Math.random() * 600));

      conv = get().conversations.find((c) => c.id === conv.id)!;

      const replyIntent: IntentType =
        intentResult.intent === 'unknown' ? 'unknown' : intentResult.intent;
      const comfortLevel = conv.comfortMode.enabled ? conv.comfortMode.level : undefined;
      const replyContent = generateReply(replyIntent, effectiveLang, emotionResult.state, trimmed, comfortLevel);

      const replyMessage: Message = {
        id: newId('MSG'),
        role: 'assistant',
        content: replyContent,
        timestamp: Date.now(),
        language: effectiveLang,
        intent: replyIntent,
      };

      let createdTicket: Ticket | undefined;

      set((s) => {
        let updatedConvs = s.conversations.map((c) => {
          if (c.id !== conv.id) return c;
          return {
            ...c,
            messages: [...c.messages, replyMessage],
            updatedAt: replyMessage.timestamp,
          };
        });

        const updatedConv = updatedConvs.find((c) => c.id === conv.id)!;

        let newTickets = s.tickets;
        let updatedStats = s.stats;

        if (!updatedConv.ticketId && shouldCreateTicket(updatedConv, intentResult.intent, emotionResult.score)) {
          const { ticket, notifyMessage } = createTicket(updatedConv, effectiveLang);
          createdTicket = ticket;
          newTickets = [ticket, ...s.tickets];

          const notifyMsg: Message = {
            id: newId('MSG'),
            role: 'system',
            content: notifyMessage[effectiveLang],
            timestamp: Date.now(),
            language: effectiveLang,
          };

          updatedConvs = updatedConvs.map((c) => {
            if (c.id !== conv.id) return c;
            return {
              ...c,
              messages: [...c.messages, notifyMsg],
              status: 'ticket_created',
              ticketId: ticket.id,
              updatedAt: notifyMsg.timestamp,
            };
          });

          updatedStats = {
            ...updatedStats,
            ticketsCreated: updatedStats.ticketsCreated + 1,
          };

          saveToStorage(StorageKeys.TICKETS, newTickets);
          saveToStorage(StorageKeys.STATS_CACHE, updatedStats);
        }

        saveToStorage(StorageKeys.CONVERSATIONS, updatedConvs);

        return {
          conversations: updatedConvs,
          tickets: newTickets,
          stats: updatedStats,
          isTyping: false,
        };
      });

      if (createdTicket) return { createdTicket };
      return {};
    },

    updateConversationLanguage: (convId: string, lang: Language) => {
      set((s) => {
        const updated = s.conversations.map((c) =>
          c.id === convId ? { ...c, currentLanguage: lang, updatedAt: Date.now() } : c
        );
        saveToStorage(StorageKeys.CONVERSATIONS, updated);
        return { conversations: updated };
      });
    },

    markConversationResolved: (convId: string, satisfaction?: number) => {
      set((s) => {
        const updated = s.conversations.map((c) => {
          if (c.id !== convId) return c;
          return {
            ...c,
            status: 'resolved' as const,
            updatedAt: Date.now(),
            satisfaction,
          };
        });
        saveToStorage(StorageKeys.CONVERSATIONS, updated);

        let stats = s.stats;
        if (satisfaction !== undefined) {
          const totalSatisfaction = stats.avgSatisfaction * stats.totalConversations + satisfaction;
          stats = {
            ...stats,
            totalConversations: stats.totalConversations + 1,
            avgSatisfaction: Math.round((totalSatisfaction / (stats.totalConversations + 1)) * 100) / 100,
          };
          saveToStorage(StorageKeys.STATS_CACHE, stats);
        }

        return { conversations: updated, stats };
      });
    },

    updateTicket: (ticketId: string, updates: Partial<Ticket>) => {
      set((s) => {
        const updated = s.tickets.map((t) =>
          t.id === ticketId ? { ...t, ...updates, updatedAt: Date.now() } : t
        );
        saveToStorage(StorageKeys.TICKETS, updated);
        return { tickets: updated };
      });
    },

    updateTicketStatus: (ticketId: string, status: TicketStatus) => {
      set((s) => {
        const updated = s.tickets.map((t) => {
          if (t.id !== ticketId) return t;
          return { ...t, status, updatedAt: Date.now() };
        });
        saveToStorage(StorageKeys.TICKETS, updated);

        let stats = s.stats;
        if (status === 'resolved' || status === 'closed') {
          stats = { ...stats, ticketsResolved: stats.ticketsResolved + 1 };
          saveToStorage(StorageKeys.STATS_CACHE, stats);
        }
        return { tickets: updated, stats };
      });
    },

    assignTicket: (ticketId: string, assignee: string) => {
      set((s) => {
        const updated = s.tickets.map((t) =>
          t.id === ticketId ? { ...t, assignee, updatedAt: Date.now() } : t
        );
        saveToStorage(StorageKeys.TICKETS, updated);
        return { tickets: updated };
      });
    },

    addTicketNote: (ticketId: string, noteContent: string, author: string) => {
      if (!noteContent.trim()) return;
      set((s) => {
        const updated = s.tickets.map((t) => {
          if (t.id !== ticketId) return t;
          const note: TicketNote = {
            id: newId('NOTE'),
            content: noteContent.trim(),
            author,
            timestamp: Date.now(),
          };
          return {
            ...t,
            notes: [...(t.notes || []), note],
            updatedAt: Date.now(),
          };
        });
        saveToStorage(StorageKeys.TICKETS, updated);
        return { tickets: updated };
      });
    },

    setAdminLanguage: (lang: Language) => set({ adminLanguage: lang }),

    resetData: () => {
      localStorage.removeItem(StorageKeys.INIT_FLAG);
      localStorage.removeItem(StorageKeys.CONVERSATIONS);
      localStorage.removeItem(StorageKeys.TICKETS);
      localStorage.removeItem(StorageKeys.STATS_CACHE);
      set({
        conversations: [...seedConversations],
        tickets: [...seedTickets],
        stats: { ...seedStats },
        activeConversationId: null,
      });
    },
  };
});

export default useAppStore;
