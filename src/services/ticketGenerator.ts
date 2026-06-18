import {
  Ticket,
  TicketPriority,
  TicketTriggerReason,
  IntentType,
  Language,
  Message,
  Conversation,
} from '../types';

const intentTypeLabels: Record<Language, Record<IntentType, string>> = {
  zh: {
    consultation: '客户咨询',
    complaint: '客户投诉',
    after_sales: '售后服务',
    refund: '退款退货',
    shipping: '物流配送',
    product_info: '产品信息',
    account: '账户问题',
    greeting: '问候对话',
    thanks: '感谢反馈',
    farewell: '结束对话',
    human_request: '转人工请求',
    unknown: '未知问题',
  },
  en: {
    consultation: 'Consultation',
    complaint: 'Customer Complaint',
    after_sales: 'After-sales',
    refund: 'Refund/Return',
    shipping: 'Shipping/Delivery',
    product_info: 'Product Info',
    account: 'Account Issue',
    greeting: 'Greeting',
    thanks: 'Thanks',
    farewell: 'Farewell',
    human_request: 'Human Transfer',
    unknown: 'Unknown Issue',
  },
  ja: {
    consultation: '問い合わせ',
    complaint: '苦情・クレーム',
    after_sales: 'アフターサービス',
    refund: '返品・返金',
    shipping: '配送・物流',
    product_info: '製品情報',
    account: 'アカウント',
    greeting: '挨拶',
    thanks: '感謝',
    farewell: '終了',
    human_request: 'オペレーター転送',
    unknown: '不明な問題',
  },
  ko: {
    consultation: '문의',
    complaint: '불만/클레임',
    after_sales: '사후 관리',
    refund: '환불/반품',
    shipping: '배송/물류',
    product_info: '제품 정보',
    account: '계정',
    greeting: '인사',
    thanks: '감사',
    farewell: '종료',
    human_request: '상담원 전환',
    unknown: '알 수 없는 문제',
  },
  fr: {
    consultation: 'Consultation',
    complaint: 'Réclamation',
    after_sales: 'Après-vente',
    refund: 'Remboursement/Retour',
    shipping: 'Livraison',
    product_info: 'Info produit',
    account: 'Compte',
    greeting: 'Salutation',
    thanks: 'Merci',
    farewell: 'Fin',
    human_request: 'Transfert agent',
    unknown: 'Problème inconnu',
  },
  de: {
    consultation: 'Beratung',
    complaint: 'Beschwerde',
    after_sales: 'Kundendienst',
    refund: 'Rückerstattung/Rückgabe',
    shipping: 'Versand',
    product_info: 'Produktinfo',
    account: 'Konto',
    greeting: 'Begrüßung',
    thanks: 'Danke',
    farewell: 'Ende',
    human_request: 'Weiterleitung Mitarbeiter',
    unknown: 'Unbekanntes Problem',
  },
  es: {
    consultation: 'Consulta',
    complaint: 'Queja',
    after_sales: 'Postventa',
    refund: 'Reembolso/Devolución',
    shipping: 'Envío',
    product_info: 'Info producto',
    account: 'Cuenta',
    greeting: 'Saludo',
    thanks: 'Gracias',
    farewell: 'Fin',
    human_request: 'Transferencia agente',
    unknown: 'Problema desconocido',
  },
};

const priorityLabels: Record<Language, Record<TicketPriority, string>> = {
  zh: { urgent: '紧急', high: '高', medium: '中', low: '低' },
  en: { urgent: 'Urgent', high: 'High', medium: 'Medium', low: 'Low' },
  ja: { urgent: '緊急', high: '高', medium: '中', low: '低' },
  ko: { urgent: '긴급', high: '높음', medium: '중간', low: '낮음' },
  fr: { urgent: 'Urgent', high: 'Haute', medium: 'Moyenne', low: 'Basse' },
  de: { urgent: 'Dringend', high: 'Hoch', medium: 'Mittel', low: 'Niedrig' },
  es: { urgent: 'Urgente', high: 'Alta', medium: 'Media', low: 'Baja' },
};

const summaryTemplates: Record<Language, (typeLabel: string, details: string) => string> = {
  zh: (t, d) => `【${t}】用户在对话中提出了相关问题。${d}`,
  en: (t, d) => `【${t}】User raised a related issue in conversation. ${d}`,
  ja: (t, d) => `【${t}】会話の中でユーザーが関連する問題を提起しました。${d}`,
  ko: (t, d) => `【${t}】대화 중 사용자가 관련 문제를 제기했습니다. ${d}`,
  fr: (t, d) => `【${t}】L'utilisateur a soulevé un problème connexe dans la conversation. ${d}`,
  de: (t, d) => `【${t}】Benutzer hat ein verwandtes Problem im Gespräch angesprochen. ${d}`,
  es: (t, d) => `【${t}】El usuario planteó un problema relacionado en la conversación. ${d}`,
};

export interface ShouldCreateTicketResult {
  shouldCreate: boolean;
  reason: TicketTriggerReason;
}

export function shouldCreateTicket(
  conversation: Conversation,
  currentIntent: IntentType,
  currentEmotionScore: number,
  currentIntentConfidence: number = 0
): ShouldCreateTicketResult {
  const { emotionTrend, unknownCount, messages } = conversation;

  if (currentIntent === 'human_request') {
    return { shouldCreate: true, reason: 'human_request' };
  }

  const userMessages = messages.filter((m) => m.role === 'user');
  const assistantMessages = messages.filter((m) => m.role === 'assistant');
  const conversationRounds = Math.min(userMessages.length, assistantMessages.length);

  if (conversationRounds > 3 && conversation.status === 'active') {
    const isResolved = userMessages.slice(-2).some((m) => {
      const intent = m.intent;
      return intent === 'thanks' || intent === 'farewell';
    });
    if (!isResolved) {
      return { shouldCreate: true, reason: 'rounds_exceeded' };
    }
  }

  const recentUserUnknowns = userMessages
    .slice(-3)
    .filter((m) => m.intent === 'unknown');
  const isLowConfidenceUnknown =
    currentIntent === 'unknown' && currentIntentConfidence < 0.35;

  if (isLowConfidenceUnknown) {
    if (unknownCount >= 3 && conversationRounds >= 3) {
      return { shouldCreate: true, reason: 'knowledge_base_exceeded' };
    }
    if (recentUserUnknowns.length >= 3 && conversationRounds >= 3) {
      return { shouldCreate: true, reason: 'knowledge_base_exceeded' };
    }
  }

  const recentScores = emotionTrend.slice(-3);
  if (recentScores.length >= 3 && recentScores.every((s) => s >= 0.5)) {
    return { shouldCreate: true, reason: 'emotion_escalation' };
  }

  if (currentIntent === 'complaint' && currentEmotionScore >= 0.4) {
    return { shouldCreate: true, reason: 'emotion_escalation' };
  }

  return { shouldCreate: false, reason: 'human_request' };
}

export function determinePriority(
  intent: IntentType,
  emotionScore: number
): TicketPriority {
  if (emotionScore >= 0.8) {
    return 'urgent';
  }

  if (intent === 'complaint' || intent === 'refund') {
    return emotionScore >= 0.6 ? 'urgent' : 'high';
  }

  if (emotionScore >= 0.6 || intent === 'shipping') {
    return 'high';
  }

  if (intent === 'after_sales' || intent === 'account') {
    return 'medium';
  }

  return 'low';
}

export function extractKeyEntities(messages: Message[]): {
  orderId?: string;
  productName?: string;
  amount?: string;
  userDemand?: string;
  attemptedSolutions?: string[];
  problemType?: string;
} {
  const userMessages = messages
    .filter((m) => m.role === 'user')
    .slice(-5)
    .map((m) => m.content)
    .join(' ');

  const entities: { orderId?: string; productName?: string; amount?: string; userDemand?: string; attemptedSolutions?: string[]; problemType?: string } = {};

  const orderRegexes = [
    /(?:订单|訂單|order|注文)[^a-zA-Z0-9]*([A-Za-z]{0,3}\d{6,20})/i,
    /(?:NO\.|编号|番號|Number|番号)[^a-zA-Z0-9]*([A-Za-z0-9]{6,20})/i,
    /\b([A-Z]{2,5}\d{6,15})\b/,
    /#(\d{6,15})/,
  ];

  for (const regex of orderRegexes) {
    const match = userMessages.match(regex);
    if (match) {
      entities.orderId = match[1] || match[0];
      break;
    }
  }

  const amountRegexes = [
    /[¥$￥€£]\s*(\d+(?:[.,]\d{1,2})?)/,
    /(\d+(?:[.,]\d{1,2})?)\s*(?:元|块|RMB|RMB|dollars?|USD|円|ドル)/i,
  ];

  for (const regex of amountRegexes) {
    const match = userMessages.match(regex);
    if (match) {
      entities.amount = match[1];
      break;
    }
  }

  const productPatterns = [
    /(?:购买|買賣|bought|purchased|ordered|注文した|買った)[^。.!?！？]*?(?:产品|產品|product|item|商品|製品)[^a-zA-Z0-9\u4e00-\u9fff]*([^ 。.!?！？,，、]{2,30})/i,
  ];

  for (const regex of productPatterns) {
    const match = userMessages.match(regex);
    if (match) {
      entities.productName = match[1];
      break;
    }
  }

  entities.userDemand = extractUserDemand(messages);
  entities.attemptedSolutions = extractAttemptedSolutions(messages);
  entities.problemType = extractProblemType(messages);

  return entities;
}

const demandPatterns: Record<Language, RegExp[]> = {
  zh: [
    /(?:我想要|我希望|我要|请|帮我|能不能|可以吗|需要|要求)([^。.!?！？\n]{2,50})/g,
    /(?:怎么|如何|为什么|为何)([^。.!?！？\n]{2,50})/g,
  ],
  en: [
    /(?:I want|I need|please|can you|could you|I'd like|help me|I require)([^.!?]{2,60})/gi,
    /(?:how to|how do|why|what can)([^.!?]{2,60})/gi,
  ],
  ja: [
    /(?:してほしい|お願い|してください|助けて|必要|欲しい)([^。.!?！？\n]{2,50})/g,
    /(?:どうすれば|なぜ|どうやって)([^。.!?！？\n]{2,50})/g,
  ],
  ko: [
    /(?:해주세요|도와주세요|원해요|필요해요|부탁해요|바라요)([^。.!?！？\n]{2,50})/g,
    /(?:어떻게|왜|왜그래)([^。.!?！？\n]{2,50})/g,
  ],
  fr: [
    /(?:je veux|j'ai besoin|aidez|s'il vous plaît|pouvez-vous)([^.!?]{2,60})/gi,
  ],
  de: [
    /(?:ich möchte|ich brauche|bitte|können Sie|helfen Sie)([^.!?]{2,60})/gi,
  ],
  es: [
    /(?:quiero|necesito|por favor|ayúdeme|puede)([^.!?]{2,60})/gi,
  ],
};

export function extractUserDemand(messages: Message[]): string | undefined {
  const userMessages = messages.filter((m) => m.role === 'user').slice(-5);
  if (userMessages.length === 0) return undefined;

  const demands: string[] = [];

  for (const msg of userMessages) {
    const patterns = demandPatterns[msg.language] || demandPatterns.zh;
    for (const pattern of patterns) {
      const regex = new RegExp(pattern.source, pattern.flags);
      let match;
      while ((match = regex.exec(msg.content)) !== null) {
        const demand = (match[0] + (match[1] || '')).trim();
        if (demand.length >= 2 && demand.length <= 80) {
          demands.push(demand);
        }
      }
    }
  }

  if (demands.length === 0) {
    const lastUserMsg = userMessages[userMessages.length - 1];
    const content = lastUserMsg.content.trim();
    if (content.length <= 100) {
      return content;
    }
    return content.slice(0, 100) + '...';
  }

  return demands[demands.length - 1];
}

const solutionKeywords: Record<Language, string[]> = {
  zh: ['试过', '尝试了', '已经', '之前', '重试了', '重启了', '重新', '换了', '重置了', '按你说的', '照做了', '按照'],
  en: ['tried', 'attempted', 'already', 'restarted', 'reset', 're-did', 'followed', 'did what you said', 'as instructed'],
  ja: ['試しました', 'やってみました', 'もう一度', '再起動', 'リセット', '指示通り', '言われた通り'],
  ko: ['시도했', '해봤어', '이미', '재시작', '초기화', '말씀대로', '지시대로'],
  fr: ['essayé', 'tenté', 'déjà', 'redémarré', 'réinitialisé', 'comme indiqué'],
  de: ['versucht', 'bereits', 'neugestartet', 'zurückgesetzt', 'wie angewiesen'],
  es: ['intentado', 'probado', 'ya', 'reiniciado', 'restablecido', 'como indicaste'],
};

export function extractAttemptedSolutions(messages: Message[]): string[] {
  const solutions: string[] = [];
  const userMessages = messages.filter((m) => m.role === 'user');

  for (const msg of userMessages) {
    const keywords = solutionKeywords[msg.language] || solutionKeywords.zh;
    const normalizedContent = msg.content.toLowerCase();

    for (const keyword of keywords) {
      if (normalizedContent.includes(keyword.toLowerCase())) {
        const idx = normalizedContent.indexOf(keyword.toLowerCase());
        const start = Math.max(0, idx - 5);
        const end = Math.min(msg.content.length, idx + keyword.length + 40);
        const snippet = msg.content.slice(start, end).trim();
        if (snippet.length >= 2) {
          solutions.push(snippet);
        }
        break;
      }
    }
  }

  return solutions.slice(0, 5);
}

export function extractProblemType(messages: Message[]): string | undefined {
  const userMessages = messages.filter((m) => m.role === 'user');
  if (userMessages.length === 0) return undefined;

  const lastUserMsg = userMessages[userMessages.length - 1];
  if (lastUserMsg.intent && lastUserMsg.intent !== 'unknown' && lastUserMsg.intent !== 'greeting' && lastUserMsg.intent !== 'thanks' && lastUserMsg.intent !== 'farewell') {
    return lastUserMsg.intent;
  }

  for (let i = userMessages.length - 1; i >= 0; i--) {
    const intent = userMessages[i].intent;
    if (intent && intent !== 'unknown' && intent !== 'greeting' && intent !== 'thanks' && intent !== 'farewell') {
      return intent;
    }
  }

  return undefined;
}

export function generateSummary(
  intent: IntentType,
  language: Language,
  messages: Message[],
  avgEmotionScore: number,
  entities: { orderId?: string; productName?: string; amount?: string; userDemand?: string; attemptedSolutions?: string[]; problemType?: string },
  triggerReason?: TicketTriggerReason
): string {
  const typeLabel = intentTypeLabels[language][intent];
  const details: string[] = [];

  if (triggerReason) {
    const triggerLabels: Record<Language, Record<TicketTriggerReason, string>> = {
      zh: {
        human_request: '触发原因：用户主动要求人工客服',
        rounds_exceeded: '触发原因：对话超过3轮未解决',
        knowledge_base_exceeded: '触发原因：问题超出知识库覆盖范围',
        emotion_escalation: '触发原因：用户情绪升级',
        unknown_escalation: '触发原因：问题持续无法识别',
      },
      en: {
        human_request: 'Trigger: User requested human agent',
        rounds_exceeded: 'Trigger: Conversation exceeded 3 rounds without resolution',
        knowledge_base_exceeded: 'Trigger: Issue beyond knowledge base coverage',
        emotion_escalation: 'Trigger: User emotion escalation',
        unknown_escalation: 'Trigger: Issue persistently unrecognizable',
      },
      ja: {
        human_request: 'トリガー：ユーザーがオペレーターを要求',
        rounds_exceeded: 'トリガー：3往復以上解決せず',
        knowledge_base_exceeded: 'トリガー：ナレッジベースの範囲外',
        emotion_escalation: 'トリガー：ユーザーの感情がエスカレート',
        unknown_escalation: 'トリガー：問題が継続的に認識不可',
      },
      ko: {
        human_request: '트리거: 사용자가 상담원 요청',
        rounds_exceeded: '트리거: 3라운드 이상 미해결',
        knowledge_base_exceeded: '트리거: 지식베이스 범위 초과',
        emotion_escalation: '트리거: 사용자 감정 악화',
        unknown_escalation: '트리거: 문제 지속적 인식 불가',
      },
      fr: {
        human_request: 'Déclencheur : Utilisateur a demandé un agent',
        rounds_exceeded: 'Déclencheur : Plus de 3 tours sans résolution',
        knowledge_base_exceeded: 'Déclencheur : Hors couverture de la base de connaissances',
        emotion_escalation: 'Déclencheur : Escalade émotionnelle',
        unknown_escalation: 'Déclencheur : Problème persistant non identifié',
      },
      de: {
        human_request: 'Auslöser: Benutzer wünscht Mitarbeiter',
        rounds_exceeded: 'Auslöser: Mehr als 3 Runden ungelöst',
        knowledge_base_exceeded: 'Auslöser: Außerhalb der Wissensdatenbank',
        emotion_escalation: 'Auslöser: Emotionale Eskalation',
        unknown_escalation: 'Auslöser: Problem dauerhaft unidentifizierbar',
      },
      es: {
        human_request: 'Desencadenante: Usuario solicitó agente',
        rounds_exceeded: 'Desencadenante: Más de 3 rondas sin resolver',
        knowledge_base_exceeded: 'Desencadenante: Fuera de cobertura de base de conocimiento',
        emotion_escalation: 'Desencadenante: Escalada emocional',
        unknown_escalation: 'Desencadenante: Problema persistentemente no identificado',
      },
    };
    details.push(triggerLabels[language][triggerReason]);
  }

  if (entities.problemType) {
    const problemTypeLabels = {
      zh: `问题类型：${intentTypeLabels.zh[entities.problemType as IntentType] || entities.problemType}`,
      en: `Problem Type: ${intentTypeLabels.en[entities.problemType as IntentType] || entities.problemType}`,
      ja: `問題タイプ: ${intentTypeLabels.ja[entities.problemType as IntentType] || entities.problemType}`,
      ko: `문제 유형: ${intentTypeLabels.ko[entities.problemType as IntentType] || entities.problemType}`,
      fr: `Type de problème : ${intentTypeLabels.fr[entities.problemType as IntentType] || entities.problemType}`,
      de: `Problemtyp: ${intentTypeLabels.de[entities.problemType as IntentType] || entities.problemType}`,
      es: `Tipo de problema : ${intentTypeLabels.es[entities.problemType as IntentType] || entities.problemType}`,
    };
    details.push(problemTypeLabels[language]);
  }

  if (entities.orderId) {
    const orderLabels = {
      zh: `涉及订单：${entities.orderId}`,
      en: `Order ID: ${entities.orderId}`,
      ja: `注文番号: ${entities.orderId}`,
      ko: `주문 번호: ${entities.orderId}`,
      fr: `Numéro de commande : ${entities.orderId}`,
      de: `Bestellnummer: ${entities.orderId}`,
      es: `Número de pedido: ${entities.orderId}`,
    };
    details.push(orderLabels[language]);
  }

  if (entities.productName) {
    const productLabels = {
      zh: `相关产品：${entities.productName}`,
      en: `Product: ${entities.productName}`,
      ja: `製品: ${entities.productName}`,
      ko: `관련 제품: ${entities.productName}`,
      fr: `Produit : ${entities.productName}`,
      de: `Produkt: ${entities.productName}`,
      es: `Producto: ${entities.productName}`,
    };
    details.push(productLabels[language]);
  }

  if (entities.amount) {
    const amountLabels = {
      zh: `涉及金额：${entities.amount}`,
      en: `Amount: ${entities.amount}`,
      ja: `金額: ${entities.amount}`,
      ko: `금액: ${entities.amount}`,
      fr: `Montant : ${entities.amount}`,
      de: `Betrag: ${entities.amount}`,
      es: `Importe: ${entities.amount}`,
    };
    details.push(amountLabels[language]);
  }

  if (entities.userDemand) {
    const demandLabels = {
      zh: `用户诉求：${entities.userDemand}`,
      en: `User Demand: ${entities.userDemand}`,
      ja: `ユーザーの要望: ${entities.userDemand}`,
      ko: `사용자 요구: ${entities.userDemand}`,
      fr: `Demande utilisateur : ${entities.userDemand}`,
      de: `Benutzeranfrage: ${entities.userDemand}`,
      es: `Demanda del usuario: ${entities.userDemand}`,
    };
    details.push(demandLabels[language]);
  }

  if (entities.attemptedSolutions && entities.attemptedSolutions.length > 0) {
    const solutionsText = entities.attemptedSolutions.join(language === 'zh' || language === 'ja' ? '；' : '; ');
    const solutionsLabels = {
      zh: `已尝试方案：${solutionsText}`,
      en: `Attempted Solutions: ${solutionsText}`,
      ja: `試した解決策: ${solutionsText}`,
      ko: `시도한 해결책: ${solutionsText}`,
      fr: `Solutions tentées : ${solutionsText}`,
      de: `Versuchte Lösungen: ${solutionsText}`,
      es: `Soluciones intentadas: ${solutionsText}`,
    };
    details.push(solutionsLabels[language]);
  }

  const emotionLabels = {
    zh: avgEmotionScore >= 0.7 ? '用户情绪激动' : avgEmotionScore >= 0.35 ? '用户情绪不安' : '用户情绪平稳',
    en: avgEmotionScore >= 0.7 ? 'User is very upset' : avgEmotionScore >= 0.35 ? 'User is concerned' : 'User is calm',
    ja: avgEmotionScore >= 0.7 ? 'ユーザーは非常に怒っている' : avgEmotionScore >= 0.35 ? 'ユーザーは不安を感じている' : 'ユーザーは穏やか',
    ko: avgEmotionScore >= 0.7 ? '사용자가 매우 화남' : avgEmotionScore >= 0.35 ? '사용자가 걱정함' : '사용자 안정',
    fr: avgEmotionScore >= 0.7 ? 'L\'utilisateur est très en colère' : avgEmotionScore >= 0.35 ? 'L\'utilisateur est préoccupé' : 'L\'utilisateur est calme',
    de: avgEmotionScore >= 0.7 ? 'Benutzer ist sehr wütend' : avgEmotionScore >= 0.35 ? 'Benutzer ist besorgt' : 'Benutzer ist ruhig',
    es: avgEmotionScore >= 0.7 ? 'El usuario está muy enfadado' : avgEmotionScore >= 0.35 ? 'El usuario está preocupado' : 'El usuario está tranquilo',
  };
  details.push(emotionLabels[language]);

  const recentUserMessages = messages
    .filter((m) => m.role === 'user')
    .slice(-3)
    .map((m) => `"${m.content.length > 40 ? m.content.slice(0, 40) + '...' : m.content}"`)
    .join(language === 'zh' || language === 'ja' ? '；' : '; ');

  if (recentUserMessages) {
    const msgLabels = {
      zh: `用户原话摘要：${recentUserMessages}`,
      en: `User quotes: ${recentUserMessages}`,
      ja: `ユーザー発言: ${recentUserMessages}`,
      ko: `사용자 발췌: ${recentUserMessages}`,
      fr: `Citations utilisateur : ${recentUserMessages}`,
      de: `Benutzerzitate: ${recentUserMessages}`,
      es: `Citas del usuario: ${recentUserMessages}`,
    };
    details.push(msgLabels[language]);
  }

  return summaryTemplates[language](typeLabel, details.join(' '));
}

export function generateTitle(
  intent: IntentType,
  language: Language,
  priority: TicketPriority,
  entities: { orderId?: string; productName?: string }
): string {
  const typeLabel = intentTypeLabels[language][intent];
  const parts: string[] = [];

  if (priority === 'urgent') {
    const urgentLabels = { zh: '【紧急】', en: '[URGENT] ', ja: '【緊急】', ko: '【긴급】', fr: '[URGENT] ', de: '[DRINGEND] ', es: '[URGENTE] ' };
    parts.push(urgentLabels[language]);
  } else if (priority === 'high') {
    const highLabels = { zh: '【高优】', en: '[HIGH] ', ja: '【高優先度】', ko: '【고우선】', fr: '[HAUT] ', de: '[HOCH] ', es: '[ALTA] ' };
    parts.push(highLabels[language]);
  }

  parts.push(typeLabel);

  if (entities.orderId) {
    const orderLabels = { zh: `-${entities.orderId}`, en: ` - ${entities.orderId}`, ja: `-${entities.orderId}`, ko: `-${entities.orderId}`, fr: ` - ${entities.orderId}`, de: ` - ${entities.orderId}`, es: ` - ${entities.orderId}` };
    parts.push(orderLabels[language]);
  }

  if (entities.productName) {
    const productLabels = { zh: `(${entities.productName})`, en: ` (${entities.productName})`, ja: `(${entities.productName})`, ko: `(${entities.productName})`, fr: ` (${entities.productName})`, de: ` (${entities.productName})`, es: ` (${entities.productName})` };
    parts.push(productLabels[language]);
  }

  return parts.join('');
}

export interface TicketCreateResult {
  ticket: Ticket;
  notifyMessage: Record<Language, string>;
}

const queueMapping: Record<IntentType, string> = {
  complaint: 'complaint-queue',
  refund: 'refund-queue',
  after_sales: 'after-sales-queue',
  shipping: 'shipping-queue',
  account: 'account-queue',
  consultation: 'general-queue',
  product_info: 'general-queue',
  greeting: 'general-queue',
  thanks: 'general-queue',
  farewell: 'general-queue',
  human_request: 'general-queue',
  unknown: 'general-queue',
};

const triggerReasonLabels: Record<Language, Record<TicketTriggerReason, string>> = {
  zh: {
    human_request: '用户主动要求人工客服',
    rounds_exceeded: '对话超过3轮未解决',
    knowledge_base_exceeded: '问题超出知识库覆盖范围',
    emotion_escalation: '用户情绪升级',
    unknown_escalation: '问题持续无法识别',
  },
  en: {
    human_request: 'User requested human agent',
    rounds_exceeded: 'Exceeded 3 rounds without resolution',
    knowledge_base_exceeded: 'Issue beyond knowledge base',
    emotion_escalation: 'Emotion escalation',
    unknown_escalation: 'Issue persistently unrecognized',
  },
  ja: {
    human_request: 'ユーザーがオペレーターを要求',
    rounds_exceeded: '3往復以上解決せず',
    knowledge_base_exceeded: 'ナレッジベースの範囲外',
    emotion_escalation: '感情のエスカレート',
    unknown_escalation: '問題が継続的に認識不可',
  },
  ko: {
    human_request: '사용자가 상담원 요청',
    rounds_exceeded: '3라운드 이상 미해결',
    knowledge_base_exceeded: '지식베이스 범위 초과',
    emotion_escalation: '감정 악화',
    unknown_escalation: '문제 지속적 인식 불가',
  },
  fr: {
    human_request: 'Utilisateur a demandé un agent',
    rounds_exceeded: 'Plus de 3 tours sans résolution',
    knowledge_base_exceeded: 'Hors base de connaissances',
    emotion_escalation: 'Escalade émotionnelle',
    unknown_escalation: 'Problème non identifié',
  },
  de: {
    human_request: 'Benutzer wünscht Mitarbeiter',
    rounds_exceeded: 'Mehr als 3 Runden ungelöst',
    knowledge_base_exceeded: 'Außerhalb Wissensdatenbank',
    emotion_escalation: 'Emotionale Eskalation',
    unknown_escalation: 'Problem unidentifizierbar',
  },
  es: {
    human_request: 'Usuario solicitó agente',
    rounds_exceeded: 'Más de 3 rondas sin resolver',
    knowledge_base_exceeded: 'Fuera de base de conocimiento',
    emotion_escalation: 'Escalada emocional',
    unknown_escalation: 'Problema no identificado',
  },
};

export function createTicket(
  conversation: Conversation,
  language: Language,
  triggerReason?: TicketTriggerReason,
  existingTicketsCount: number = 0
): TicketCreateResult {
  const messages = conversation.messages;
  const userMessages = messages.filter((m) => m.role === 'user');

  const lastUserMessage = userMessages[userMessages.length - 1];
  const currentIntent = lastUserMessage?.intent || 'unknown';
  const avgEmotionScore =
    conversation.emotionTrend.length > 0
      ? conversation.emotionTrend.reduce((a, b) => a + b, 0) / conversation.emotionTrend.length
      : 0;
  const maxEmotionScore =
    conversation.emotionTrend.length > 0 ? Math.max(...conversation.emotionTrend) : 0;

  const priority = determinePriority(currentIntent, maxEmotionScore);
  const entities = extractKeyEntities(messages);
  const effectiveTriggerReason = triggerReason || 'human_request';
  const summary = generateSummary(currentIntent, language, messages, avgEmotionScore, entities, effectiveTriggerReason);
  const title = generateTitle(currentIntent, language, priority, entities);

  const now = Date.now();
  const ticketId = 'TKT' + now.toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();

  const assignedQueue = queueMapping[currentIntent] || 'general-queue';
  const queuePosition = existingTicketsCount + 1;

  const ticket: Ticket = {
    id: ticketId,
    title,
    type: currentIntent,
    priority,
    status: 'queued',
    summary,
    conversationId: conversation.id,
    messages: [...messages],
    createdAt: now,
    updatedAt: now,
    language,
    emotionLevel: Math.round(maxEmotionScore * 100),
    triggerReason: effectiveTriggerReason,
    assignedQueue,
    queuePosition,
    keyEntities: entities,
    notes: [],
  };

  const priorityText = priorityLabels[language][priority];
  const triggerText = triggerReasonLabels[language][effectiveTriggerReason];
  const notifyMessage: Record<Language, string> = {
    zh: `✅ 工单创建成功！\n\n📋 工单编号：${ticketId}\n📌 工单类型：${intentTypeLabels.zh[currentIntent]}\n⚡ 优先级：${priorityText}\n🔔 触发原因：${triggerText}\n👥 队列：${assignedQueue}（位置 #${queuePosition}）\n\n${summary}\n\n我们的人工客服专员将在30分钟内开始处理，您可随时在后台查看进度。`,
    en: `✅ Ticket Created Successfully!\n\n📋 Ticket ID: ${ticketId}\n📌 Type: ${intentTypeLabels.en[currentIntent]}\n⚡ Priority: ${priorityText}\n🔔 Trigger: ${triggerText}\n👥 Queue: ${assignedQueue} (Position #${queuePosition})\n\n${summary}\n\nOur agent will start processing within 30 minutes. You can track progress anytime.`,
    ja: `✅ チケットが作成されました！\n\n📋 チケットID: ${ticketId}\n📌 種類: ${intentTypeLabels.ja[currentIntent]}\n⚡ 優先度: ${priorityText}\n🔔 トリガー: ${triggerText}\n👥 キュー: ${assignedQueue} (順位 #${queuePosition})\n\n${summary}\n\n担当者が30分以内に対応を開始します。いつでも進捗を確認できます。`,
    ko: `✅ 티켓이 생성되었습니다!\n\n📋 티켓 번호: ${ticketId}\n📌 유형: ${intentTypeLabels.ko[currentIntent]}\n⚡ 우선순위: ${priorityText}\n🔔 트리거: ${triggerText}\n👥 대기열: ${assignedQueue} (순서 #${queuePosition})\n\n${summary}\n\n상담원이 30분 이내에 처리를 시작합니다. 언제든지 진행 상황을 확인하실 수 있습니다.`,
    fr: `✅ Ticket créé avec succès !\n\n📋 Numéro de ticket : ${ticketId}\n📌 Type : ${intentTypeLabels.fr[currentIntent]}\n⚡ Priorité : ${priorityText}\n🔔 Déclencheur : ${triggerText}\n👥 File : ${assignedQueue} (Position #${queuePosition})\n\n${summary}\n\nNotre agent commencera le traitement dans les 30 minutes. Vous pouvez suivre l'avancement à tout moment.`,
    de: `✅ Ticket erfolgreich erstellt!\n\n📋 Ticket-Nummer: ${ticketId}\n📌 Typ: ${intentTypeLabels.de[currentIntent]}\n⚡ Priorität: ${priorityText}\n🔔 Auslöser: ${triggerText}\n👥 Warteschlange: ${assignedQueue} (Position #${queuePosition})\n\n${summary}\n\nUnser Mitarbeiter beginnt innerhalb von 30 Minuten mit der Bearbeitung. Sie können den Fortschritt jederzeit verfolgen.`,
    es: `✅ ¡Ticket creado con éxito!\n\n📋 Número de ticket: ${ticketId}\n📌 Tipo: ${intentTypeLabels.es[currentIntent]}\n⚡ Prioridad: ${priorityText}\n🔔 Desencadenante: ${triggerText}\n👥 Cola: ${assignedQueue} (Posición #${queuePosition})\n\n${summary}\n\nNuestro agente empezará a procesarlo en 30 minutos. Puede seguir el progreso en cualquier momento.`,
  };

  return { ticket, notifyMessage };
}

export { intentTypeLabels, priorityLabels };
