import { Language } from '../types';

const hiraganaKatakana = /[\u3040-\u309F\u30A0-\u30FF]/g;
const cjk = /[\u4E00-\u9FFF]/g;
const hangul = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/g;
const latin = /[a-zA-Z]/g;
const digit = /[0-9]/g;
const punctuation = /[\s\u3000.,!?;:、。！？；：、，。¿¡«»‹›]/g;

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
  zh: number;
  en: number;
  ja: number;
  ko: number;
  fr: number;
  de: number;
  es: number;
  total: number;
}

const LATIN_LANG_INDICATORS: Record<string, string[]> = {
  fr: ['é', 'è', 'ê', 'ë', 'à', 'â', 'ç', 'î', 'ï', 'ô', 'œ', 'ù', 'û', 'ü'],
  de: ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'],
  es: ['ñ', 'á', 'é', 'í', 'ó', 'ú', 'ü', '¿', '¡', 'Ñ'],
};

function countLatinLanguageIndicators(text: string): Record<string, number> {
  const counts: Record<string, number> = { fr: 0, de: 0, es: 0 };
  const lower = text.toLowerCase();
  for (const lang of Object.keys(LATIN_LANG_INDICATORS) as (keyof typeof LATIN_LANG_INDICATORS)[]) {
    for (const char of LATIN_LANG_INDICATORS[lang]) {
      const regex = new RegExp(char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      counts[lang] += (lower.match(regex) || []).length;
    }
  }
  return counts;
}

export function countLanguageChars(text: string): LanguageCharCounts {
  const cleaned = cleanTextForDetection(text);
  const jaCount = (cleaned.match(hiraganaKatakana) || []).length;
  const cjkCount = (cleaned.match(cjk) || []).length;
  const hangulCount = (cleaned.match(hangul) || []).length;
  const latinCount = (cleaned.match(latin) || []).length;

  let zhCount = cjkCount;
  if (jaCount > 0) {
    zhCount = Math.max(0, cjkCount - Math.floor(jaCount * 0.3));
  }

  const latinIndicators = countLatinLanguageIndicators(text);
  const totalLatinIndicators = Object.values(latinIndicators).reduce((a, b) => a + b, 0);

  let frCount = 0, deCount = 0, esCount = 0;
  if (totalLatinIndicators > 0 && latinCount > 5) {
    const maxIndicator = Math.max(...Object.values(latinIndicators));
    if (maxIndicator > 0) {
      const dominantLang = Object.entries(latinIndicators).find(([, v]) => v === maxIndicator)?.[0];
      if (dominantLang && maxIndicator / totalLatinIndicators > 0.5) {
        if (dominantLang === 'fr') frCount = Math.floor(latinCount * 0.8);
        else if (dominantLang === 'de') deCount = Math.floor(latinCount * 0.8);
        else if (dominantLang === 'es') esCount = Math.floor(latinCount * 0.8);
      }
    }
  }

  const enCount = Math.max(0, latinCount - frCount - deCount - esCount);

  const total = Math.max(1, jaCount + zhCount + hangulCount + latinCount);
  return {
    zh: zhCount,
    en: enCount,
    ja: jaCount,
    ko: hangulCount,
    fr: frCount,
    de: deCount,
    es: esCount,
    total,
  };
}

export function detectLanguageDetailed(text: string): LanguageDetectionResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      language: 'zh',
      isMixed: false,
      primaryRatio: 1,
      languageRatios: { zh: 1, en: 0, ja: 0, ko: 0, fr: 0, de: 0, es: 0 },
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
    ko: counts.ko / counts.total,
    fr: counts.fr / counts.total,
    de: counts.de / counts.total,
    es: counts.es / counts.total,
  };

  const sorted = Object.entries(ratios).sort((a, b) => b[1] - a[1]) as [Language, number][];
  const [primaryLang, primaryRatio] = sorted[0];
  const [, secondaryRatio] = sorted[1];

  const technicalTermsSignificant = hasTechnicalTerms
    && technicalTerms.some((t) => t.length >= 3)
    && counts.total > 5;
  let isMixed = (secondaryRatio > 0.15 && primaryRatio < 0.85 && counts.total > 5)
    || (hasTechnicalTerms && secondaryRatio > 0.08 && counts.total > 5)
    || technicalTermsSignificant;

  let language: Language = primaryLang;

  const LANGUAGE_WEIGHTS: Record<Language, number> = {
    zh: 1.15,
    en: 1.10,
    ja: 1.20,
    ko: 1.25,
    fr: 1.15,
    de: 1.15,
    es: 1.15,
  };

  if (isMixed) {
    const threshold = 0.55;
    const overThreshold = (Object.entries(ratios) as [Language, number][])
      .find(([lang, ratio]) => ratio >= threshold);
    if (overThreshold) {
      language = overThreshold[0];
    } else {
      const scores: Record<Language, number> = {} as Record<Language, number>;
      (Object.keys(ratios) as Language[]).forEach((lang) => {
        scores[lang] = ratios[lang] * LANGUAGE_WEIGHTS[lang];
      });
      const sortedByScore = Object.entries(scores).sort((a, b) => b[1] - a[1]) as [Language, number][];
      language = sortedByScore[0][0];
    }
  }

  const langIndicators: Record<Language, string[]> = {
    zh: ['你好', '您好', '谢谢', '请问', '什么', '怎么', '为什么', '的', '了', '是', '我', '你', '他', '她', '它', '我们', '你们', '他们', '吗', '呢', '吧', '啊', '哦', '嗯'],
    en: ['hello', 'hi', 'thank', 'thanks', 'please', 'sorry', 'help', 'want', 'need', 'the', 'a', 'an', 'is', 'are', 'was', 'were', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their', 'this', 'that', 'these', 'those', 'what', 'which', 'who', 'whom', 'not', 'but', 'and', 'or', 'if', 'then', 'else', 'so', 'for', 'with', 'about', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'good', 'morning', 'afternoon', 'evening', 'bye', 'yes', 'no', 'ok', 'okay'],
    ja: ['こんにちは', 'はじめまして', 'ありがとう', 'すみません', 'お願い', 'よろしく', 'こんばんは', 'おはよう', 'さようなら', 'です', 'ます', 'でした', 'ました', 'ください', 'ません', 'ない', 'ですか', 'ませ', 'た', 'て', 'に', 'を', 'は', 'が', 'と', 'も', 'から', 'まで', 'より', 'へ', 'や', 'か', 'の', 'に', 'で', 'と', 'や', 'など', 'なら', 'ば', 'たら', 'なら', 'でも', 'しかし', 'だが', 'けれど', 'だって', 'でも', 'たり', 'り'],
    ko: ['안녕하세요', '감사합니다', '죄송합니다', '도와주세요', '주세요', '입니다', '입니다', '습니다', '했습니다', '할', '것', '입니다', '있습니다', '없습니다', '하고', '와', '과', '은', '는', '이', '가', '을', '를', '에', '에서', '으로', '로', '까지', '부터', '처럼', '같이', '만큼', '마냥', '처럼', '만', '도', '밖에', '마저', '조차', '까지', '마저', '조차', '마저', '고', '며', '거나', '거나', '든지', '든가', '이랑', '랑', '하고', '와', '과'],
    fr: ['bonjour', 'merci', 's\'il vous plaît', 'svp', 'désolé', 'aide', 'aider', 'vouloir', 'besoin', 'le', 'la', 'les', 'un', 'une', 'des', 'est', 'sont', 'était', 'étaient', 'avoir', 'a', 'ont', 'avait', 'faire', 'fait', 'font', 'faisait', 'aller', 'va', 'vont', 'allait', 'pouvoir', 'peut', 'peuvent', 'pouvait', 'devoir', 'doit', 'doivent', 'devait', 'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'me', 'te', 'le', 'la', 'lui', 'nous', 'vous', 'leur', 'mon', 'ton', 'son', 'notre', 'votre', 'leur', 'ce', 'cette', 'ces', 'cet', 'quoi', 'qui', 'que', 'dont', 'où', 'ne', 'pas', 'mais', 'et', 'ou', 'si', 'alors', 'sinon', 'donc', 'pour', 'avec', 'sans', 'sous', 'sur', 'dans', 'par', 'à', 'de', 'en', 'vers', 'jusque', 'depuis', 'pendant', 'avant', 'après'],
    de: ['hallo', 'danke', 'bitte', 'entschuldigung', 'tut mir leid', 'hilfe', 'helfen', 'wollen', 'brauchen', 'der', 'die', 'das', 'ein', 'eine', 'ist', 'sind', 'war', 'waren', 'haben', 'hat', 'hatten', 'machen', 'macht', 'machten', 'gehen', 'geht', 'gehen', 'gingen', 'können', 'kann', 'können', 'konnten', 'müssen', 'muss', 'müssen', 'mussten', 'ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'sie', 'Sie', 'mich', 'dich', 'ihn', 'sie', 'es', 'uns', 'euch', 'sie', 'Sie', 'mein', 'dein', 'sein', 'ihr', 'unser', 'euer', 'ihr', 'Ihr', 'dieser', 'diese', 'dieses', 'jener', 'jene', 'jenes', 'was', 'wer', 'welche', 'welcher', 'welches', 'nicht', 'sondern', 'und', 'oder', 'wenn', 'dann', 'sonst', 'also', 'denn', 'weil', 'für', 'mit', 'ohne', 'unter', 'über', 'auf', 'in', 'im', 'an', 'am', 'bei', 'von', 'zu', 'zur', 'zum', 'nach', 'vor', 'hinter', 'neben', 'zwischen', 'durch', 'über', 'um', 'während', 'seit', 'bis'],
    es: ['hola', 'gracias', 'por favor', 'disculpe', 'lo siento', 'ayuda', 'ayudar', 'querer', 'necesitar', 'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'es', 'son', 'era', 'eran', 'haber', 'ha', 'han', 'había', 'hacer', 'hace', 'hacen', 'hacía', 'ir', 'va', 'van', 'iba', 'poder', 'puede', 'pueden', 'podía', 'deber', 'debe', 'debemos', 'debían', 'yo', 'tú', 'él', 'ella', 'nosotros', 'vosotros', 'ellos', 'ellas', 'me', 'te', 'lo', 'la', 'le', 'nos', 'os', 'los', 'las', 'mi', 'tu', 'su', 'nuestro', 'vuestro', 'su', 'este', 'esta', 'estos', 'estas', 'ese', 'esa', 'esos', 'esas', 'aquel', 'aquella', 'aquellos', 'aquellas', 'qué', 'quién', 'cuál', 'cuáles', 'dónde', 'cuándo', 'cómo', 'cuánto', 'no', 'ni', 'pero', 'sino', 'y', 'o', 'u', 'si', 'entonces', 'luego', 'así que', 'porque', 'pues', 'para', 'por', 'con', 'sin', 'bajo', 'sobre', 'en', 'de', 'a', 'hacia', 'desde', 'hasta', 'durante', 'antes', 'después', 'mientras', 'cuando'],
  };

  const lowerText = trimmed.toLowerCase();

  if (counts.total < 12 && !isMixed && primaryRatio < 0.8) {
    const hits: Record<Language, number> = {
      zh: 0, en: 0, ja: 0, ko: 0, fr: 0, de: 0, es: 0,
    };
    (Object.keys(langIndicators) as Language[]).forEach((lang) => {
      langIndicators[lang].forEach((w) => {
        if (lowerText.includes(w.toLowerCase())) hits[lang]++;
      });
    });

    const sortedByHits = Object.entries(hits).sort((a, b) => b[1] - a[1]) as [Language, number][];
    if (sortedByHits[0][1] > 0 && sortedByHits[0][1] > sortedByHits[1][1]) {
      language = sortedByHits[0][0];
    }
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
  ko: { native: '한국어', flag: '🇰🇷', code: 'KO' },
  fr: { native: 'Français', flag: '🇫🇷', code: 'FR' },
  de: { native: 'Deutsch', flag: '🇩🇪', code: 'DE' },
  es: { native: 'Español', flag: '🇪🇸', code: 'ES' },
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
    askHuman: '联系人工客服',
    satisfactionTitle: '服务评价',
    satisfactionDesc: '请对本次服务进行评价',
    submit: '提交',
    cancel: '取消',
    search: '搜索...',
    filter: '筛选',
    all: '全部',
    open: '待处理',
    queued: '排队中',
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
    resolve: '解决',
    messagesLabel: '条消息',
    ticketLabel: '工单',
    resolvedStatus: '已解决',
    ticketCreatedTitle: '工单已创建（{ticketId}），您仍可继续对话补充信息',
    ticketCreatedDesc: '人工客服将在30分钟内开始处理，您可以继续提问或稍后查看工单进度',
    comfortModeTitle: '情绪安抚模式',
    autoDetect: '自动检测语言',
    footerHint: '💡 系统将自动识别语言并进行情绪分析 · Enter 发送',
    footerHintComfort: '🤗 情绪安抚模式已启动（{level}）· 系统将优先共情回应 · Enter 发送',
    thanksForRating: '感谢您的评价！',
    systemNotice: '系统通知',
    comfortMildDesc: '已切换至共情安抚模式，优先倾听与理解您的感受',
    comfortModerateDesc: '已启动深度安抚模式，我们将先理解您的感受，再提供解决方案',
    comfortSevereDesc: '已启动最高级别安抚模式，我们深切理解您的不满，将全力为您解决问题',
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
    askHuman: 'Contact Human Agent',
    satisfactionTitle: 'Rate Service',
    satisfactionDesc: 'Please rate your experience',
    submit: 'Submit',
    cancel: 'Cancel',
    search: 'Search...',
    filter: 'Filter',
    all: 'All',
    open: 'Open',
    queued: 'Queued',
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
    resolve: 'Resolve',
    messagesLabel: 'messages',
    ticketLabel: 'Ticket',
    resolvedStatus: 'Resolved',
    ticketCreatedTitle: 'Ticket created ({ticketId}), you can continue chatting to add more details',
    ticketCreatedDesc: 'A human agent will start handling it within 30 minutes. You can continue asking questions or check the ticket progress later',
    comfortModeTitle: 'Emotional Comfort Mode',
    autoDetect: 'Auto-detect language',
    footerHint: '💡 System auto-detects language and analyzes emotion · Enter to send',
    footerHintComfort: '🤗 Emotional Comfort Mode active ({level}) · System prioritizes empathetic responses · Enter to send',
    thanksForRating: 'Thank you for your rating!',
    systemNotice: 'System Notice',
    comfortMildDesc: 'Switched to empathetic comfort mode, prioritizing listening and understanding your feelings',
    comfortModerateDesc: 'Deep comfort mode activated. We will first understand your feelings, then provide solutions',
    comfortSevereDesc: 'Highest level comfort mode activated. We deeply understand your frustration and will do our utmost to resolve your issue',
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
    askHuman: 'オペレーターに接続',
    satisfactionTitle: 'サービス評価',
    satisfactionDesc: '今回のサービスを評価してください',
    submit: '送信',
    cancel: 'キャンセル',
    search: '検索...',
    filter: 'フィルター',
    all: 'すべて',
    open: '未対応',
    queued: '待機中',
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
    resolve: '解決',
    messagesLabel: 'メッセージ',
    ticketLabel: 'チケット',
    resolvedStatus: '解決済み',
    ticketCreatedTitle: 'チケットが作成されました（{ticketId}）、会話を続けて情報を補足できます',
    ticketCreatedDesc: '人間のオペレーターが30分以内に対応を開始します。質問を続けるか、後でチケットの進捗状況を確認できます',
    comfortModeTitle: '感情サポートモード',
    autoDetect: '言語を自動検出',
    footerHint: '💡 システムが言語を自動認識し、感情分析を行います · Enter で送信',
    footerHintComfort: '🤗 感情サポートモードが起動しました（{level}）· システムが共感的な応答を優先します · Enter で送信',
    thanksForRating: '評価をありがとうございます！',
    systemNotice: 'システム通知',
    comfortMildDesc: '共感サポートモードに切り替わりました。あなたの気持ちに耳を傾け、理解することを優先します',
    comfortModerateDesc: 'ディープサポートモードが起動しました。まずあなたの気持ちを理解してから、解決策を提案します',
    comfortSevereDesc: '最高レベルのサポートモードが起動しました。あなたの不満を深く理解し、全力で問題を解決します',
  },
  ko: {
    appTitle: '스마트 고객 서비스',
    chatTitle: 'AI 고객 지원',
    chatSubtitle: 'AI가 24시간 연중무휴로 대기 중입니다',
    inputPlaceholder: '질문을 입력해 주세요...',
    send: '전송',
    quickQuestions: '빠른 질문',
    emotionStatus: '감정 상태',
    newConversation: '새 채팅',
    language: '언어',
    adminPanel: '관리자 패널',
    tickets: '티켓',
    dashboard: '대시보드',
    chatView: '채팅',
    typing: '상담원이 입력 중입니다',
    ticketCreated: '티켓이 생성되었습니다',
    askHuman: '상담원 연결',
    satisfactionTitle: '서비스 평가',
    satisfactionDesc: '이용 경험을 평가해 주세요',
    submit: '제출',
    cancel: '취소',
    search: '검색...',
    filter: '필터',
    all: '전체',
    open: '미처리',
    queued: '대기 중',
    processing: '처리 중',
    pending: '보류 중',
    resolved: '해결됨',
    closed: '종료',
    priority: '우선순위',
    urgent: '긴급',
    high: '높음',
    medium: '중간',
    low: '낮음',
    assignedTo: '담당자',
    createdAt: '생성일',
    updatedAt: '업데이트일',
    summary: '요약',
    conversation: '대화 기록',
    notes: '메모',
    addNote: '메모 추가',
    ticketDetails: '티켓 상세',
    backToList: '목록으로 돌아가기',
    changeStatus: '상태 변경',
    assignAgent: '상담원 배정',
    totalConversations: '총 대화 수',
    autoResolutionRate: '자동 해결률',
    avgResponseTime: '평균 응답 시간',
    avgSatisfaction: '평균 만족도',
    ticketsCreated: '생성된 티켓',
    ticketsResolved: '해결된 티켓',
    emotionDistribution: '감정 분포',
    intentDistribution: '의도 분포',
    dailyTrend: '일일 추세',
    calm: '안정',
    concerned: '주의',
    angry: '화남',
    consultation: '문의',
    complaint: '불만',
    after_sales: '사후 관리',
    refund: '환불',
    shipping: '배송',
    product_info: '제품',
    account: '계정',
    greeting: '인사',
    noData: '데이터 없음',
    viewTicket: '티켓 보기',
    unassigned: '미배정',
    addNotePlaceholder: '메모를 입력하세요...',
    seconds: '초',
    conversations: '대화 수',
    ticketsLabel: '티켓 수',
    resolve: '해결',
    messagesLabel: '개의 메시지',
    ticketLabel: '티켓',
    resolvedStatus: '해결됨',
    ticketCreatedTitle: '티켓이 생성되었습니다({ticketId}). 계속 대화하여 정보를 추가할 수 있습니다',
    ticketCreatedDesc: '상담원이 30분 이내에 처리를 시작합니다. 계속 질문하거나 나중에 티켓 진행 상황을 확인할 수 있습니다',
    comfortModeTitle: '감정 위로 모드',
    autoDetect: '언어 자동 감지',
    footerHint: '💡 시스템이 언어를 자동으로 인식하고 감정을 분석합니다 · Enter로 전송',
    footerHintComfort: '🤗 감정 위로 모드가 시작되었습니다({level}) · 시스템이 공감 응답을 우선합니다 · Enter로 전송',
    thanksForRating: '평가해 주셔서 감사합니다!',
    systemNotice: '시스템 알림',
    comfortMildDesc: '공감 위로 모드로 전환되었습니다. 고객님의 감정을 경청하고 이해하는 것을 우선합니다',
    comfortModerateDesc: '심층 위로 모드가 시작되었습니다. 먼저 고객님의 감정을 이해한 후, 해결 방안을 제시하겠습니다',
    comfortSevereDesc: '최고 수준 위로 모드가 시작되었습니다. 고객님의 불만을 깊이 이해하며, 문제 해결을 위해 최선을 다하겠습니다',
  },
  fr: {
    appTitle: 'Service Client Intelligent',
    chatTitle: 'Assistant Client IA',
    chatSubtitle: 'IA en ligne 24h/24, prête à vous aider',
    inputPlaceholder: 'Tapez votre question ici...',
    send: 'Envoyer',
    quickQuestions: 'Questions Rapides',
    emotionStatus: 'Statut Émotionnel',
    newConversation: 'Nouveau Chat',
    language: 'Langue',
    adminPanel: 'Panneau Admin',
    tickets: 'Tickets',
    dashboard: 'Tableau de Bord',
    chatView: 'Chat',
    typing: 'L\'agent tape',
    ticketCreated: 'Ticket Créé',
    askHuman: 'Contacter un Agent',
    satisfactionTitle: 'Évaluer le Service',
    satisfactionDesc: 'Veuillez évaluer votre expérience',
    submit: 'Soumettre',
    cancel: 'Annuler',
    search: 'Rechercher...',
    filter: 'Filtrer',
    all: 'Tous',
    open: 'Ouvert',
    queued: 'En file',
    processing: 'En cours',
    pending: 'En attente',
    resolved: 'Résolu',
    closed: 'Fermé',
    priority: 'Priorité',
    urgent: 'Urgent',
    high: 'Haute',
    medium: 'Moyenne',
    low: 'Basse',
    assignedTo: 'Assigné à',
    createdAt: 'Créé le',
    updatedAt: 'Mis à jour le',
    summary: 'Résumé',
    conversation: 'Conversation',
    notes: 'Notes',
    addNote: 'Ajouter une note',
    ticketDetails: 'Détails du Ticket',
    backToList: 'Retour à la liste',
    changeStatus: 'Changer le statut',
    assignAgent: 'Assigner un agent',
    totalConversations: 'Total Conversations',
    autoResolutionRate: 'Taux de Résolution Automatique',
    avgResponseTime: 'Temps de Réponse Moyen',
    avgSatisfaction: 'Satisfaction Moyenne',
    ticketsCreated: 'Tickets Créés',
    ticketsResolved: 'Tickets Résolus',
    emotionDistribution: 'Distribution Émotionnelle',
    intentDistribution: 'Distribution des Intentions',
    dailyTrend: 'Tendance Quotidienne',
    calm: 'Calme',
    concerned: 'Préoccupé',
    angry: 'En colère',
    consultation: 'Consultation',
    complaint: 'Réclamation',
    after_sales: 'Après-vente',
    refund: 'Remboursement',
    shipping: 'Livraison',
    product_info: 'Produit',
    account: 'Compte',
    greeting: 'Salutation',
    noData: 'Aucune donnée',
    viewTicket: 'Voir le ticket',
    unassigned: 'Non assigné',
    addNotePlaceholder: 'Ajouter une note...',
    seconds: 's',
    conversations: 'Conversations',
    ticketsLabel: 'Tickets',
    resolve: 'Résoudre',
    messagesLabel: 'messages',
    ticketLabel: 'Ticket',
    resolvedStatus: 'Résolu',
    ticketCreatedTitle: 'Ticket créé ({ticketId}), vous pouvez continuer la conversation pour ajouter des informations',
    ticketCreatedDesc: 'Un agent humain commencera à le traiter dans les 30 minutes. Vous pouvez continuer à poser des questions ou consulter l\'avancement du ticket plus tard',
    comfortModeTitle: 'Mode de Confort Émotionnel',
    autoDetect: 'Détection automatique de la langue',
    footerHint: '💡 Le système détecte automatiquement la langue et analyse l\'émotion · Entrée pour envoyer',
    footerHintComfort: '🤗 Mode de Confort Émotionnel activé ({level}) · Le système privilégie les réponses empathiques · Entrée pour envoyer',
    thanksForRating: 'Merci pour votre évaluation !',
    systemNotice: 'Avis Système',
    comfortMildDesc: 'Passage au mode de confort empathique, nous privilégions l\'écoute et la compréhension de vos sentiments',
    comfortModerateDesc: 'Mode de confort profond activé. Nous comprendrons d\'abord vos sentiments, puis fournirons des solutions',
    comfortSevereDesc: 'Niveau maximum de confort activé. Nous comprenons profondément votre mécontentement et ferons tout notre possible pour résoudre votre problème',
  },
  de: {
    appTitle: 'Intelligenter Kundenservice',
    chatTitle: 'AI-Kundenassistent',
    chatSubtitle: 'KI rund um die Uhr online, bereit zu helfen',
    inputPlaceholder: 'Geben Sie Ihre Frage hier ein...',
    send: 'Senden',
    quickQuestions: 'Schnelle Fragen',
    emotionStatus: 'Emotionsstatus',
    newConversation: 'Neuer Chat',
    language: 'Sprache',
    adminPanel: 'Admin-Panel',
    tickets: 'Tickets',
    dashboard: 'Dashboard',
    chatView: 'Chat',
    typing: 'Agent tippt',
    ticketCreated: 'Ticket Erstellt',
    askHuman: 'Mitarbeiter Sprechen',
    satisfactionTitle: 'Service Bewerten',
    satisfactionDesc: 'Bitte bewerten Sie Ihre Erfahrung',
    submit: 'Absenden',
    cancel: 'Abbrechen',
    search: 'Suchen...',
    filter: 'Filter',
    all: 'Alle',
    open: 'Offen',
    queued: 'In Warteschlange',
    processing: 'In Bearbeitung',
    pending: 'Ausstehend',
    resolved: 'Gelöst',
    closed: 'Geschlossen',
    priority: 'Priorität',
    urgent: 'Dringend',
    high: 'Hoch',
    medium: 'Mittel',
    low: 'Niedrig',
    assignedTo: 'Zugewiesen an',
    createdAt: 'Erstellt am',
    updatedAt: 'Aktualisiert am',
    summary: 'Zusammenfassung',
    conversation: 'Unterhaltung',
    notes: 'Notizen',
    addNote: 'Notiz hinzufügen',
    ticketDetails: 'Ticket-Details',
    backToList: 'Zurück zur Liste',
    changeStatus: 'Status ändern',
    assignAgent: 'Agent zuweisen',
    totalConversations: 'Gesamte Unterhaltungen',
    autoResolutionRate: 'Automatische Lösungsrate',
    avgResponseTime: 'Durchschnittliche Antwortzeit',
    avgSatisfaction: 'Durchschnittliche Zufriedenheit',
    ticketsCreated: 'Erstellte Tickets',
    ticketsResolved: 'Gelöste Tickets',
    emotionDistribution: 'Emotionsverteilung',
    intentDistribution: 'Absichtsverteilung',
    dailyTrend: 'Täglicher Trend',
    calm: 'Ruhig',
    concerned: 'Besorgt',
    angry: 'Wütend',
    consultation: 'Beratung',
    complaint: 'Beschwerde',
    after_sales: 'Kundendienst',
    refund: 'Rückerstattung',
    shipping: 'Versand',
    product_info: 'Produkt',
    account: 'Konto',
    greeting: 'Begrüßung',
    noData: 'Keine Daten',
    viewTicket: 'Ticket ansehen',
    unassigned: 'Nicht zugewiesen',
    addNotePlaceholder: 'Notiz hinzufügen...',
    seconds: 's',
    conversations: 'Unterhaltungen',
    ticketsLabel: 'Tickets',
    resolve: 'Lösen',
    messagesLabel: 'Nachrichten',
    ticketLabel: 'Ticket',
    resolvedStatus: 'Gelöst',
    ticketCreatedTitle: 'Ticket erstellt ({ticketId}), Sie können weiter chatten, um weitere Informationen hinzuzufügen',
    ticketCreatedDesc: 'Ein menschlicher Agent wird innerhalb von 30 Minuten mit der Bearbeitung beginnen. Sie können weiterhin Fragen stellen oder später den Ticketfortschritt prüfen',
    comfortModeTitle: 'Emotionaler Komfortmodus',
    autoDetect: 'Sprache automatisch erkennen',
    footerHint: '💡 Das System erkennt die Sprache automatisch und analysiert Emotionen · Enter zum Senden',
    footerHintComfort: '🤗 Emotionaler Komfortmodus aktiv ({level}) · Das System priorisiert einfühlsame Antworten · Enter zum Senden',
    thanksForRating: 'Vielen Dank für Ihre Bewertung!',
    systemNotice: 'Systemhinweis',
    comfortMildDesc: 'In den einfühlsamen Komfortmodus gewechselt, wir priorisieren das Zuhören und Verstehen Ihrer Gefühle',
    comfortModerateDesc: 'Tiefer Komfortmodus aktiviert. Wir werden zuerst Ihre Gefühle verstehen und dann Lösungen anbieten',
    comfortSevereDesc: 'Höchster Komfortmodus aktiviert. Wir verstehen Ihre Unzufriedenheit zutiefst und werden unser Bestes tun, um Ihr Problem zu lösen',
  },
  es: {
    appTitle: 'Atención al Cliente Inteligente',
    chatTitle: 'Asistente de Cliente IA',
    chatSubtitle: 'IA en línea 24/7, lista para ayudar',
    inputPlaceholder: 'Escriba su pregunta aquí...',
    send: 'Enviar',
    quickQuestions: 'Preguntas Rápidas',
    emotionStatus: 'Estado Emocional',
    newConversation: 'Nuevo Chat',
    language: 'Idioma',
    adminPanel: 'Panel de Admin',
    tickets: 'Tickets',
    dashboard: 'Panel de Control',
    chatView: 'Chat',
    typing: 'El agente está escribiendo',
    ticketCreated: 'Ticket Creado',
    askHuman: 'Hablar con un Agente',
    satisfactionTitle: 'Evaluar Servicio',
    satisfactionDesc: 'Por favor, evalúe su experiencia',
    submit: 'Enviar',
    cancel: 'Cancelar',
    search: 'Buscar...',
    filter: 'Filtrar',
    all: 'Todos',
    open: 'Abierto',
    queued: 'En cola',
    processing: 'En Proceso',
    pending: 'Pendiente',
    resolved: 'Resuelto',
    closed: 'Cerrado',
    priority: 'Prioridad',
    urgent: 'Urgente',
    high: 'Alta',
    medium: 'Media',
    low: 'Baja',
    assignedTo: 'Asignado a',
    createdAt: 'Creado el',
    updatedAt: 'Actualizado el',
    summary: 'Resumen',
    conversation: 'Conversación',
    notes: 'Notas',
    addNote: 'Agregar nota',
    ticketDetails: 'Detalles del Ticket',
    backToList: 'Volver a la lista',
    changeStatus: 'Cambiar estado',
    assignAgent: 'Asignar agente',
    totalConversations: 'Total de Conversaciones',
    autoResolutionRate: 'Tasa de Resolución Automática',
    avgResponseTime: 'Tiempo de Respuesta Promedio',
    avgSatisfaction: 'Satisfacción Promedio',
    ticketsCreated: 'Tickets Creados',
    ticketsResolved: 'Tickets Resueltos',
    emotionDistribution: 'Distribución Emocional',
    intentDistribution: 'Distribución de Intenciones',
    dailyTrend: 'Tendencia Diaria',
    calm: 'Tranquilo',
    concerned: 'Preocupado',
    angry: 'Enojado',
    consultation: 'Consulta',
    complaint: 'Queja',
    after_sales: 'Postventa',
    refund: 'Reembolso',
    shipping: 'Envío',
    product_info: 'Producto',
    account: 'Cuenta',
    greeting: 'Saludo',
    noData: 'Sin datos',
    viewTicket: 'Ver ticket',
    unassigned: 'Sin asignar',
    addNotePlaceholder: 'Agregar una nota...',
    seconds: 's',
    conversations: 'Conversaciones',
    ticketsLabel: 'Tickets',
    resolve: 'Resolver',
    messagesLabel: 'mensajes',
    ticketLabel: 'Ticket',
    resolvedStatus: 'Resuelto',
    ticketCreatedTitle: 'Ticket creado ({ticketId}), puede seguir chateando para agregar más detalles',
    ticketCreatedDesc: 'Un agente humano comenzará a tratarlo en 30 minutos. Puede seguir haciendo preguntas o comprobar el progreso del ticket más tarde',
    comfortModeTitle: 'Modo de Confort Emocional',
    autoDetect: 'Detectar idioma automáticamente',
    footerHint: '💡 El sistema detecta el idioma automáticamente y analiza la emoción · Enter para enviar',
    footerHintComfort: '🤗 Modo de Confort Emocional activo ({level}) · El sistema prioriza las respuestas empáticas · Enter para enviar',
    thanksForRating: '¡Gracias por su valoración!',
    systemNotice: 'Aviso del Sistema',
    comfortMildDesc: 'Cambiado al modo de confort empático, priorizamos escuchar y comprender sus sentimientos',
    comfortModerateDesc: 'Modo de confort profundo activado. Primero entenderemos sus sentimientos y luego ofreceremos soluciones',
    comfortSevereDesc: 'Nivel máximo de confort activado. Entendemos profundamente su insatisfacción y haremos todo lo posible para resolver su problema',
  },
};

export function t(language: Language): typeof uiTexts.zh {
  return uiTexts[language] as typeof uiTexts.zh;
}
