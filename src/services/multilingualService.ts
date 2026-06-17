import { Language } from '../types';

const hiraganaKatakana = /[\u3040-\u309F\u30A0-\u30FF]/g;
const cjk = /[\u4E00-\u9FFF]/g;
const latin = /[a-zA-Z]/g;
const digit = /[0-9]/g;
const punctuation = /[\s\u3000.,!?;:、。！？；：、，。]/g;

export interface LanguageDetectionResult {
  language: Language;
  isMixed: boolean;
  primaryRatio: number;
  languageRatios: Record<Language, number>;
  technicalTerms: string[];
}

const TECHNICAL_TERMS_PATTERNS = [
  /\b(?:API|SDK|JSON|XML|HTML|CSS|HTTP|HTTPS|URL|URI|IP|DNS|VPN|CDN|CPU|GPU|RAM|ROM|SSD|HDD|USB|WIFI|Bluetooth|NFC|GPS|IoT|ML|DL|NLP|CRM|ERP|SaaS|PaaS|IaaS|OAuth|JWT|REST|GraphQL|WebSocket|WiFi)\b/gi,
  /\b(?:4G|5G|Gmail|Outlook|Chrome|Firefox|Safari|Edge|Windows|macOS|Linux|iOS|Android|Ubuntu|Docker|Kubernetes|Redis|MySQL|PostgreSQL|MongoDB|Elasticsearch|Kafka|RabbitMQ|Nginx|Apache|AWS|Azure|GCP|GitHub|GitLab|Slack|Teams|Zoom|Skype|PayPal|Stripe|Visa|Mastercard|Alipay|WeChat)\b/gi,
  /\b[A-Z][A-Z0-9_]{2,}\b/g,
  /#[A-Za-z0-9_]{2,}/g,
  /@[A-Za-z0-9_]{3,}/g,
  /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
  /\bhttps?:\/\/[^\s<]+[^\s<.,;:!?)\]]/g,
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  /\b(?:ORD|TK|SKU|MODEL|VERSION|Ticket|OrderId)\s*[:#-]\s*[A-Za-z0-9-]+\b/gi,
  /\b(?:ORD|TK|SKU)[-_\s][A-Za-z0-9-]{4,}\b/gi,
];

const STOPWORDS_FOR_CLEANING = new Set([
  'hello', 'hi', 'thank', 'thanks', 'please', 'sorry', 'help', 'want', 'need',
  'order', 'refund', 'shipping', 'product', 'account', 'excuse', 'welcome',
  'good', 'morning', 'afternoon', 'evening', 'bye', 'yes', 'no', 'ok', 'okay',
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'must', 'can', 'shall',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'my', 'your', 'his', 'its', 'our', 'their',
  'this', 'that', 'these', 'those', 'what', 'which', 'who', 'whom',
  'not', 'but', 'and', 'or', 'if', 'then', 'else', 'so', 'than', 'too', 'very',
  'just', 'also', 'now', 'here', 'there', 'when', 'where', 'why', 'how',
  'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during',
  'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out',
  'on', 'off', 'over', 'under', 'again', 'further', 'once',
  'speak', 'english', 'chinese', 'japanese', 'language', 'know', 'get',
  'check', 'status', 'still', 'yet', 'even', 'because', 'as', 'until',
  'while', 'of', 'at', 'by', 'any', 'all', 'each', 'few', 'more', 'most',
  'other', 'some', 'such', 'only', 'own', 'same',
]);

export function extractTechnicalTerms(text: string): string[] {
  const terms: Set<string> = new Set();
  for (const pattern of TECHNICAL_TERMS_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach((m) => {
        const trimmed = m.trim();
        const lower = trimmed.toLowerCase();
        if (!STOPWORDS_FOR_CLEANING.has(lower) && trimmed.length >= 2) {
          terms.add(trimmed);
        }
      });
    }
  }
  return Array.from(terms);
}

export function cleanTextForDetection(text: string): string {
  let cleaned = text;

  const terms = extractTechnicalTerms(cleaned);
  terms.sort((a, b) => b.length - a.length);
  for (const term of terms) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    cleaned = cleaned.replace(new RegExp(escaped, 'g'), ' ');
  }

  cleaned = cleaned.replace(/\b\d+\b/g, ' ');
  cleaned = cleaned.replace(punctuation, ' ');
  return cleaned.trim();
}

export interface LanguageCharCounts {
  ja: number;
  zh: number;
  en: number;
  total: number;
}

export function countLanguageChars(text: string): LanguageCharCounts {
  const cleaned = cleanTextForDetection(text);
  let jaCount = (cleaned.match(hiraganaKatakana) || []).length;
  let cjkCount = (cleaned.match(cjk) || []).length;
  let latinCount = (cleaned.match(latin) || []).length;

  let zhCount = cjkCount;
  if (jaCount > 0) {
    zhCount = Math.max(0, cjkCount - Math.floor(jaCount * 0.3));
  }

  const total = Math.max(1, jaCount + zhCount + latinCount);
  return { ja: jaCount, zh: zhCount, en: latinCount, total };
}

export function detectLanguageDetailed(text: string): LanguageDetectionResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      language: 'zh',
      isMixed: false,
      primaryRatio: 1,
      languageRatios: { zh: 1, en: 0, ja: 0 },
      technicalTerms: [],
    };
  }

  const technicalTerms = extractTechnicalTerms(trimmed);
  const hasTechnicalTerms = technicalTerms.length > 0;
  const counts = countLanguageChars(trimmed);

  const ratios: Record<Language, number> = {
    zh: counts.zh / counts.total,
    en: counts.en / counts.total,
    ja: counts.ja / counts.total,
  };

  const sorted = Object.entries(ratios).sort((a, b) => b[1] - a[1]) as [Language, number][];
  const [primaryLang, primaryRatio] = sorted[0];
  const [secondaryLang, secondaryRatio] = sorted[1];

  const zhuEnBalance = Math.abs(ratios.zh - ratios.en);
  const nearTie = zhuEnBalance < 0.2 && counts.total > 3;
  const technicalTermsSignificant = hasTechnicalTerms
    && technicalTerms.some((t) => t.length >= 3)
    && counts.total > 5;
  let isMixed = (secondaryRatio > 0.15 && primaryRatio < 0.85 && counts.total > 5)
    || nearTie
    || (hasTechnicalTerms && secondaryRatio > 0.08 && counts.total > 5)
    || technicalTermsSignificant;

  let language: Language = primaryLang;

  if (nearTie && ratios.zh >= 0.3) {
    language = 'zh';
    isMixed = true;
  } else if (isMixed) {
    const threshold = 0.55;
    if (ratios.zh >= threshold) language = 'zh';
    else if (ratios.en >= threshold) language = 'en';
    else if (ratios.ja >= threshold) language = 'ja';
    else {
      const scoreZh = ratios.zh * 1.15 + (counts.zh > 5 ? 0.08 : 0) + (ratios.zh >= 0.3 ? 0.05 : 0);
      const scoreEn = ratios.en * 1.10 + (counts.en > 10 ? 0.05 : 0);
      const scoreJa = ratios.ja * 1.20 + (counts.ja > 3 ? 0.1 : 0);
      if (scoreJa >= scoreZh && scoreJa >= scoreEn) language = 'ja';
      else if (scoreEn >= scoreZh) language = 'en';
      else language = 'zh';
    }
  }

  if (ratios.ja > 0 && counts.zh > 0 && counts.en === 0) {
    language = 'ja';
    if (ratios.ja < 0.7) isMixed = true;
  }

  const englishIndicators = [
    'hello', 'hi', 'thank', 'thanks', 'please', 'sorry', 'help', 'want', 'need',
    'order', 'refund', 'shipping', 'product', 'account', 'excuse',
    'welcome', 'good', 'morning', 'afternoon', 'evening', 'bye',
  ];
  const japaneseIndicators = [
    'こんにちは', 'はじめまして', 'ありがとう', 'すみません', 'お願い',
    'よろしく', 'こんばんは', 'おはよう', 'さようなら', 'です', 'ます',
    'でした', 'ました', 'ください', 'ません', 'ない', 'ですか',
  ];
  const lowerText = trimmed.toLowerCase();

  if (counts.total < 12 && !isMixed && primaryRatio < 0.8) {
    let enHits = 0, jaHits = 0;
    englishIndicators.forEach((w) => { if (lowerText.includes(w)) enHits++; });
    japaneseIndicators.forEach((w) => { if (lowerText.includes(w)) jaHits++; });
    if (jaHits > enHits && jaHits > 0) language = 'ja';
    else if (enHits > 0 && enHits >= 1 && counts.en > 3) language = 'en';
  }

  return {
    language,
    isMixed,
    primaryRatio,
    languageRatios: ratios,
    technicalTerms,
  };
}

export function detectLanguage(text: string): Language {
  return detectLanguageDetailed(text).language;
}

export interface LanguageSwitchDecision {
  shouldSwitch: boolean;
  newLanguage: Language;
  confidence: number;
  reason: string;
}

const SWITCH_THRESHOLD_FIRST_MESSAGE = 0.5;
const SWITCH_THRESHOLD_SUBSEQUENT = 0.7;
const SWITCH_CONSISTENCY_WINDOW = 2;

export function decideLanguageSwitch(
  currentLang: Language,
  newText: string,
  conversationHistory: { text: string; language: Language }[] = []
): LanguageSwitchDecision {
  const result = detectLanguageDetailed(newText);
  const detectedLang = result.language;
  const newRatio = result.languageRatios[detectedLang];

  if (detectedLang === currentLang) {
    return {
      shouldSwitch: false,
      newLanguage: currentLang,
      confidence: newRatio,
      reason: 'detected_language_matches_current',
    };
  }

  const isFirstMessage = conversationHistory.length === 0;
  const threshold = isFirstMessage ? SWITCH_THRESHOLD_FIRST_MESSAGE : SWITCH_THRESHOLD_SUBSEQUENT;

  if (newRatio < threshold) {
    return {
      shouldSwitch: false,
      newLanguage: currentLang,
      confidence: newRatio,
      reason: `insufficient_confidence_${newRatio.toFixed(2)}_<${threshold}`,
    };
  }

  if (isFirstMessage) {
    return {
      shouldSwitch: true,
      newLanguage: detectedLang,
      confidence: newRatio,
      reason: 'first_message_language_detection',
    };
  }

  const recentHistory = conversationHistory.slice(-SWITCH_CONSISTENCY_WINDOW);
  const consistentSwitchSignals = recentHistory.filter(
    (h) => detectLanguage(h.text) === detectedLang
  ).length;

  if (consistentSwitchSignals >= SWITCH_CONSISTENCY_WINDOW - 1 || newRatio >= 0.85) {
    return {
      shouldSwitch: true,
      newLanguage: detectedLang,
      confidence: newRatio,
      reason: consistentSwitchSignals >= 1 ? 'consistent_switch_signals' : 'strong_language_signal',
    };
  }

  return {
    shouldSwitch: false,
    newLanguage: currentLang,
    confidence: newRatio,
    reason: `pending_consistency_signals_${consistentSwitchSignals}/${SWITCH_CONSISTENCY_WINDOW}`,
  };
}

export const langLabels: Record<Language, { native: string; flag: string; code: string }> = {
  zh: { native: '中文', flag: '🇨🇳', code: 'ZH' },
  en: { native: 'English', flag: '🇺🇸', code: 'EN' },
  ja: { native: '日本語', flag: '🇯🇵', code: 'JP' },
};

export const uiTexts = {
  zh: {
    appTitle: '智能客服系统',
    chatTitle: '智能客服助手',
    chatSubtitle: 'AI 在线为您服务，7x24小时响应',
    inputPlaceholder: '请输入您的问题...',
    send: '发送',
    quickQuestions: '常见问题',
    emotionStatus: '情绪状态',
    newConversation: '新对话',
    language: '语言',
    adminPanel: '管理后台',
    tickets: '工单管理',
    dashboard: '数据面板',
    chatView: '对话界面',
    typing: '客服正在输入',
    ticketCreated: '工单已创建',
    ticketCreatedDesc: '已为您创建服务工单，专员将尽快跟进处理',
    askHuman: '联系人工客服',
    satisfactionTitle: '服务评价',
    satisfactionDesc: '请对本次服务进行评价',
    submit: '提交',
    cancel: '取消',
    search: '搜索...',
    filter: '筛选',
    all: '全部',
    open: '待处理',
    processing: '处理中',
    pending: '待跟进',
    resolved: '已解决',
    closed: '已关闭',
    priority: '优先级',
    urgent: '紧急',
    high: '高',
    medium: '中',
    low: '低',
    assignedTo: '处理人',
    createdAt: '创建时间',
    updatedAt: '更新时间',
    summary: '问题摘要',
    conversation: '对话记录',
    notes: '处理笔记',
    addNote: '添加备注',
    ticketDetails: '工单详情',
    backToList: '返回列表',
    changeStatus: '变更状态',
    assignAgent: '分配处理人',
    totalConversations: '总会话数',
    autoResolutionRate: '自动解决率',
    avgResponseTime: '平均响应时间',
    avgSatisfaction: '平均满意度',
    ticketsCreated: '创建工单数',
    ticketsResolved: '已解决工单',
    emotionDistribution: '情绪分布',
    intentDistribution: '意图分布',
    dailyTrend: '每日趋势',
    calm: '正常',
    concerned: '关注',
    angry: '激动',
    consultation: '咨询',
    complaint: '投诉',
    after_sales: '售后',
    refund: '退款',
    shipping: '物流',
    product_info: '产品',
    account: '账户',
    greeting: '问候',
    noData: '暂无数据',
    viewTicket: '查看工单',
    unassigned: '未分配',
    addNotePlaceholder: '输入处理备注...',
    seconds: '秒',
    conversations: '对话数',
    ticketsLabel: '工单数',
  },
  en: {
    appTitle: 'Smart Customer Service',
    chatTitle: 'AI Customer Assistant',
    chatSubtitle: 'AI online 24/7, ready to help',
    inputPlaceholder: 'Type your question here...',
    send: 'Send',
    quickQuestions: 'Quick Questions',
    emotionStatus: 'Emotion Status',
    newConversation: 'New Chat',
    language: 'Language',
    adminPanel: 'Admin Panel',
    tickets: 'Tickets',
    dashboard: 'Dashboard',
    chatView: 'Chat',
    typing: 'Agent is typing',
    ticketCreated: 'Ticket Created',
    ticketCreatedDesc: 'A service ticket has been created, our agent will follow up soon',
    askHuman: 'Contact Human Agent',
    satisfactionTitle: 'Rate Service',
    satisfactionDesc: 'Please rate your experience',
    submit: 'Submit',
    cancel: 'Cancel',
    search: 'Search...',
    filter: 'Filter',
    all: 'All',
    open: 'Open',
    processing: 'Processing',
    pending: 'Pending',
    resolved: 'Resolved',
    closed: 'Closed',
    priority: 'Priority',
    urgent: 'Urgent',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    assignedTo: 'Assigned To',
    createdAt: 'Created At',
    updatedAt: 'Updated At',
    summary: 'Summary',
    conversation: 'Conversation',
    notes: 'Notes',
    addNote: 'Add Note',
    ticketDetails: 'Ticket Details',
    backToList: 'Back to List',
    changeStatus: 'Change Status',
    assignAgent: 'Assign Agent',
    totalConversations: 'Total Conversations',
    autoResolutionRate: 'Auto Resolution Rate',
    avgResponseTime: 'Avg Response Time',
    avgSatisfaction: 'Avg Satisfaction',
    ticketsCreated: 'Tickets Created',
    ticketsResolved: 'Tickets Resolved',
    emotionDistribution: 'Emotion Distribution',
    intentDistribution: 'Intent Distribution',
    dailyTrend: 'Daily Trend',
    calm: 'Calm',
    concerned: 'Concerned',
    angry: 'Upset',
    consultation: 'Consultation',
    complaint: 'Complaint',
    after_sales: 'After Sales',
    refund: 'Refund',
    shipping: 'Shipping',
    product_info: 'Product',
    account: 'Account',
    greeting: 'Greeting',
    noData: 'No data',
    viewTicket: 'View Ticket',
    unassigned: 'Unassigned',
    addNotePlaceholder: 'Add a note...',
    seconds: 's',
    conversations: 'Conversations',
    ticketsLabel: 'Tickets',
  },
  ja: {
    appTitle: 'インテリジェントカスタマーサービス',
    chatTitle: 'AIカスタマーアシスタント',
    chatSubtitle: 'AIが24時間年中無休で対応',
    inputPlaceholder: 'ご質問を入力してください...',
    send: '送信',
    quickQuestions: 'よくある質問',
    emotionStatus: '感情状態',
    newConversation: '新しいチャット',
    language: '言語',
    adminPanel: '管理画面',
    tickets: 'チケット',
    dashboard: 'ダッシュボード',
    chatView: 'チャット',
    typing: 'エージェントが入力中',
    ticketCreated: 'チケット作成完了',
    ticketCreatedDesc: 'サービスチケットが作成されました。担当者がすぐに対応します',
    askHuman: 'オペレーターに接続',
    satisfactionTitle: 'サービス評価',
    satisfactionDesc: '今回のサービスを評価してください',
    submit: '送信',
    cancel: 'キャンセル',
    search: '検索...',
    filter: 'フィルター',
    all: 'すべて',
    open: '未対応',
    processing: '対応中',
    pending: '保留中',
    resolved: '解決済み',
    closed: '終了',
    priority: '優先度',
    urgent: '緊急',
    high: '高',
    medium: '中',
    low: '低',
    assignedTo: '担当者',
    createdAt: '作成日時',
    updatedAt: '更新日時',
    summary: '概要',
    conversation: '会話履歴',
    notes: 'メモ',
    addNote: 'メモを追加',
    ticketDetails: 'チケット詳細',
    backToList: 'リストに戻る',
    changeStatus: 'ステータス変更',
    assignAgent: '担当者割り当て',
    totalConversations: '総会話数',
    autoResolutionRate: '自動解決率',
    avgResponseTime: '平均応答時間',
    avgSatisfaction: '平均満足度',
    ticketsCreated: '作成チケット数',
    ticketsResolved: '解決チケット数',
    emotionDistribution: '感情分布',
    intentDistribution: '意図分布',
    dailyTrend: '日次トレンド',
    calm: '穏やか',
    concerned: '要注意',
    angry: '怒っている',
    consultation: '問い合わせ',
    complaint: '苦情',
    after_sales: 'アフター',
    refund: '返金',
    shipping: '配送',
    product_info: '製品',
    account: 'アカウント',
    greeting: '挨拶',
    noData: 'データなし',
    viewTicket: 'チケットを見る',
    unassigned: '未割り当て',
    addNotePlaceholder: 'メモを入力...',
    seconds: '秒',
    conversations: '会話数',
    ticketsLabel: 'チケット数',
  },
};

export function t(language: Language): typeof uiTexts.zh {
  return uiTexts[language] as typeof uiTexts.zh;
}
