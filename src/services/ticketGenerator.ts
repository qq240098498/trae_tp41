import {
  Ticket,
  TicketPriority,
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

export function shouldCreateTicket(
  conversation: Conversation,
  currentIntent: IntentType,
  currentEmotionScore: number
): boolean {
  const { emotionTrend, unknownCount, messages } = conversation;

  if (currentIntent === 'human_request') return true;

  const recentScores = emotionTrend.slice(-3);
  if (recentScores.length >= 3 && recentScores.every((s) => s >= 0.5)) {
    return true;
  }

  const recentUnknowns = messages
    .filter((m) => m.role === 'assistant')
    .slice(-2);
  if (
    unknownCount >= 2 ||
    (recentUnknowns.length >= 2 && recentUnknowns.every((m) => m.intent === 'unknown'))
  ) {
    return true;
  }

  if (currentIntent === 'complaint' && currentEmotionScore >= 0.4) {
    return true;
  }

  return false;
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
} {
  const userMessages = messages
    .filter((m) => m.role === 'user')
    .slice(-5)
    .map((m) => m.content)
    .join(' ');

  const entities: { orderId?: string; productName?: string; amount?: string } = {};

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

  return entities;
}

export function generateSummary(
  intent: IntentType,
  language: Language,
  messages: Message[],
  avgEmotionScore: number,
  entities: { orderId?: string; productName?: string; amount?: string }
): string {
  const typeLabel = intentTypeLabels[language][intent];
  const details: string[] = [];

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

export function createTicket(
  conversation: Conversation,
  language: Language
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
  const summary = generateSummary(currentIntent, language, messages, avgEmotionScore, entities);
  const title = generateTitle(currentIntent, language, priority, entities);

  const now = Date.now();
  const ticketId = 'TKT' + now.toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();

  const ticket: Ticket = {
    id: ticketId,
    title,
    type: currentIntent,
    priority,
    status: 'open',
    summary,
    conversationId: conversation.id,
    messages: [...messages],
    createdAt: now,
    updatedAt: now,
    language,
    emotionLevel: Math.round(maxEmotionScore * 100),
    keyEntities: entities,
    notes: [],
  };

  const priorityText = priorityLabels[language][priority];
  const notifyMessage: Record<Language, string> = {
    zh: `✅ 工单创建成功！\n\n📋 工单编号：${ticketId}\n📌 工单类型：${intentTypeLabels.zh[currentIntent]}\n⚡ 优先级：${priorityText}\n\n${summary}\n\n我们的人工客服专员将在30分钟内开始处理，您可随时在后台查看进度。`,
    en: `✅ Ticket Created Successfully!\n\n📋 Ticket ID: ${ticketId}\n📌 Type: ${intentTypeLabels.en[currentIntent]}\n⚡ Priority: ${priorityText}\n\n${summary}\n\nOur agent will start processing within 30 minutes. You can track progress anytime.`,
    ja: `✅ チケットが作成されました！\n\n📋 チケットID: ${ticketId}\n📌 種類: ${intentTypeLabels.ja[currentIntent]}\n⚡ 優先度: ${priorityText}\n\n${summary}\n\n担当者が30分以内に対応を開始します。いつでも進捗を確認できます。`,
    ko: `✅ 티켓이 생성되었습니다!\n\n📋 티켓 번호: ${ticketId}\n📌 유형: ${intentTypeLabels.ko[currentIntent]}\n⚡ 우선순위: ${priorityText}\n\n${summary}\n\n상담원이 30분 이내에 처리를 시작합니다. 언제든지 진행 상황을 확인하실 수 있습니다.`,
    fr: `✅ Ticket créé avec succès !\n\n📋 Numéro de ticket : ${ticketId}\n📌 Type : ${intentTypeLabels.fr[currentIntent]}\n⚡ Priorité : ${priorityText}\n\n${summary}\n\nNotre agent commencera le traitement dans les 30 minutes. Vous pouvez suivre l'avancement à tout moment.`,
    de: `✅ Ticket erfolgreich erstellt!\n\n📋 Ticket-Nummer: ${ticketId}\n📌 Typ: ${intentTypeLabels.de[currentIntent]}\n⚡ Priorität: ${priorityText}\n\n${summary}\n\nUnser Mitarbeiter beginnt innerhalb von 30 Minuten mit der Bearbeitung. Sie können den Fortschritt jederzeit verfolgen.`,
    es: `✅ ¡Ticket creado con éxito!\n\n📋 Número de ticket: ${ticketId}\n📌 Tipo: ${intentTypeLabels.es[currentIntent]}\n⚡ Prioridad: ${priorityText}\n\n${summary}\n\nNuestro agente empezará a procesarlo en 30 minutos. Puede seguir el progreso en cualquier momento.`,
  };

  return { ticket, notifyMessage };
}

export { intentTypeLabels, priorityLabels };
