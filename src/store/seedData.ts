import { Conversation, Ticket, DashboardStats, Message, IntentType, Language } from '../types';

const now = Date.now();
const hr = 60 * 60 * 1000;
const day = 24 * hr;

function genId(prefix: string, t: number, i: number): string {
  return prefix + t.toString(36).toUpperCase() + i.toString(36).toUpperCase();
}

const seedConversations: Conversation[] = [
  {
    id: genId('CONV', now - 1 * day, 0),
    createdAt: now - 1 * day,
    updatedAt: now - 1 * day + 15 * 60 * 1000,
    currentLanguage: 'zh',
    status: 'resolved',
    unknownCount: 0,
    consecutiveNegativeCount: 0,
    emotionTrend: [0.1, 0.15, 0.08, 0.12, 0.05],
    satisfaction: 5,
    messages: [
      { id: 'm1', role: 'user', content: '你好，我想查询一下订单AB12345678的物流', timestamp: now - 1 * day, language: 'zh', emotion: 'calm', emotionScore: 0.1, intent: 'shipping' },
      { id: 'm2', role: 'assistant', content: '您好，我来帮您查询物流状态。请稍等...订单AB12345678已于昨天下午由顺丰揽收，预计明天上午送达。如有延迟请随时联系我！', timestamp: now - 1 * day + 3000, language: 'zh', intent: 'shipping' },
      { id: 'm3', role: 'user', content: '好的谢谢，那么快！', timestamp: now - 1 * day + 8000, language: 'zh', emotion: 'calm', emotionScore: 0.05, intent: 'thanks' },
      { id: 'm4', role: 'assistant', content: '不客气！很高兴能帮到您。祝您生活愉快，包裹早日送达！', timestamp: now - 1 * day + 11000, language: 'zh', intent: 'thanks' },
    ],
  },
  {
    id: genId('CONV', now - 2 * day, 1),
    createdAt: now - 2 * day,
    updatedAt: now - 2 * day + 45 * 60 * 1000,
    currentLanguage: 'zh',
    status: 'ticket_created',
    ticketId: 'TKT1',
    unknownCount: 0,
    consecutiveNegativeCount: 3,
    emotionTrend: [0.6, 0.75, 0.82, 0.88, 0.72],
    messages: [
      { id: 'm1', role: 'user', content: '我买的手机才用了三天就坏了！什么垃圾质量！！！订单CD99887766', timestamp: now - 2 * day, language: 'zh', emotion: 'angry', emotionScore: 0.75, intent: 'complaint' },
      { id: 'm2', role: 'assistant', content: '真的太抱歉了！花钱买的东西出问题，任谁都会火大，我完全理解。您放心，我现在就帮您启动VIP绿色通道处理：1️⃣ 免费上门取件 2️⃣ 优先换新 3️⃣ 额外补偿。请告诉我订单号，立刻安排！', timestamp: now - 2 * day + 4000, language: 'zh', intent: 'after_sales' },
      { id: 'm3', role: 'user', content: '我不要什么换新！我已经对你们产品完全不信任了，我要全额退款，还要投诉你们！！！', timestamp: now - 2 * day + 12000, language: 'zh', emotion: 'angry', emotionScore: 0.88, intent: 'refund' },
    ],
  },
  {
    id: genId('CONV', now - 3 * day, 2),
    createdAt: now - 3 * day,
    updatedAt: now - 3 * day + 30 * 60 * 1000,
    currentLanguage: 'en',
    status: 'resolved',
    unknownCount: 0,
    consecutiveNegativeCount: 0,
    emotionTrend: [0.2, 0.25, 0.3, 0.22, 0.15],
    satisfaction: 4,
    messages: [
      { id: 'm1', role: 'user', content: 'Hello! I need help with my account password.', timestamp: now - 3 * day, language: 'en', emotion: 'concerned', emotionScore: 0.3, intent: 'account' },
      { id: 'm2', role: 'assistant', content: 'I am happy to help with your account! Here are the steps to reset your password:\n\n1. Click "Forgot Password" on the login page\n2. Enter your registered email address\n3. Check your inbox for the reset link\n4. Follow the link and create a new password\n\nIf you do not receive the email within 10 minutes, please check your spam folder or contact us again!', timestamp: now - 3 * day + 3500, language: 'en', intent: 'account' },
      { id: 'm3', role: 'user', content: 'Great! That worked. Thank you so much!', timestamp: now - 3 * day + 18000, language: 'en', emotion: 'calm', emotionScore: 0.15, intent: 'thanks' },
    ],
  },
  {
    id: genId('CONV', now - 4 * day, 3),
    createdAt: now - 4 * day,
    updatedAt: now - 4 * day + 50 * 60 * 1000,
    currentLanguage: 'zh',
    status: 'resolved',
    unknownCount: 0,
    consecutiveNegativeCount: 0,
    emotionTrend: [0.08, 0.12, 0.1, 0.05],
    satisfaction: 5,
    messages: [
      { id: 'm1', role: 'user', content: '请问你们的产品Pro X200有什么规格参数？', timestamp: now - 4 * day, language: 'zh', emotion: 'calm', emotionScore: 0.08, intent: 'product_info' },
      { id: 'm2', role: 'assistant', content: '您好！Pro X200 产品规格如下：\n\n📱 屏幕：6.7英寸 2K AMOLED 120Hz\n🔋 电池：5500mAh 支持100W快充\n📷 相机：5000万主摄+1200万超广角+800万长焦\n💾 存储：8+256GB / 12+512GB / 16+1TB\n⚡ 芯片：旗舰处理器\n\n支持12期免息分期，全国联保12个月。需要了解具体哪方面呢？', timestamp: now - 4 * day + 4000, language: 'zh', intent: 'product_info' },
      { id: 'm3', role: 'user', content: '好的我考虑一下，谢谢！', timestamp: now - 4 * day + 15000, language: 'zh', emotion: 'calm', emotionScore: 0.05, intent: 'farewell' },
    ],
  },
  {
    id: genId('CONV', now - 5 * day, 4),
    createdAt: now - 5 * day,
    updatedAt: now - 5 * day + 25 * 60 * 1000,
    currentLanguage: 'ja',
    status: 'resolved',
    unknownCount: 0,
    consecutiveNegativeCount: 0,
    emotionTrend: [0.1, 0.15, 0.08, 0.1],
    satisfaction: 4,
    messages: [
      { id: 'm1', role: 'user', content: 'こんにちは！返品をお願いしたいです。注文番号はJP2024567890です。', timestamp: now - 5 * day, language: 'ja', emotion: 'calm', emotionScore: 0.1, intent: 'refund' },
      { id: 'm2', role: 'assistant', content: '承知いたしました！返金をお手伝いいたします。注文番号JP2024567890を確認しましたので、返金手続きを開始いたします。\n\n【返金の流れ】\n• 審査：1-3営業日\n• 返金先：お支払い方法へ\n• 反映まで：銀行振込の場合1-7日かかることがあります\n\n進捗はマイページでいつでも確認できます！', timestamp: now - 5 * day + 4500, language: 'ja', intent: 'refund' },
      { id: 'm3', role: 'user', content: 'ありがとうございます！助かりました！', timestamp: now - 5 * day + 12000, language: 'ja', emotion: 'calm', emotionScore: 0.08, intent: 'thanks' },
    ],
  },
  {
    id: genId('CONV', now - 6 * day, 5),
    createdAt: now - 6 * day,
    updatedAt: now - 6 * day + 1 * hr,
    currentLanguage: 'zh',
    status: 'ticket_created',
    ticketId: 'TKT2',
    unknownCount: 1,
    consecutiveNegativeCount: 2,
    emotionTrend: [0.3, 0.42, 0.55, 0.48],
    messages: [
      { id: 'm1', role: 'user', content: '你们客服到底在吗？我等了好久都没人回复我之前的消息，我的退款EF11223344到底处理了没有？', timestamp: now - 6 * day, language: 'zh', emotion: 'concerned', emotionScore: 0.42, intent: 'refund' },
      { id: 'm2', role: 'assistant', content: '非常抱歉让您等了这么久！我理解您的心情，退款的事我会帮您加急处理的。请稍等我查一下状态...', timestamp: now - 6 * day + 4000, language: 'zh', intent: 'refund' },
      { id: 'm3', role: 'user', content: '我已经等了一个星期了！每次都说在处理，你们是不是不想退钱啊？太过分了！！', timestamp: now - 6 * day + 15000, language: 'zh', emotion: 'angry', emotionScore: 0.55, intent: 'complaint' },
    ],
  },
  {
    id: genId('CONV', now - 7 * day, 6),
    createdAt: now - 7 * day,
    updatedAt: now - 7 * day + 20 * 60 * 1000,
    currentLanguage: 'en',
    status: 'resolved',
    unknownCount: 0,
    consecutiveNegativeCount: 0,
    emotionTrend: [0.15, 0.12, 0.1],
    satisfaction: 5,
    messages: [
      { id: 'm1', role: 'user', content: 'Hi there! Just wanted to say the product arrived today and I love it! Great quality!', timestamp: now - 7 * day, language: 'en', emotion: 'calm', emotionScore: 0.1, intent: 'thanks' },
      { id: 'm2', role: 'assistant', content: 'Thank you so much for your wonderful feedback! So glad the product arrived and that you love it! \n\nIf you have a spare moment, please consider leaving us a review - it would help other shoppers discover our products too! \n\nEnjoy your new purchase! 😊', timestamp: now - 7 * day + 3500, language: 'en', intent: 'thanks' },
    ],
  },
  {
    id: genId('CONV', now - 4 * hr, 7),
    createdAt: now - 4 * hr,
    updatedAt: now - 3.5 * hr,
    currentLanguage: 'zh',
    status: 'resolved',
    unknownCount: 0,
    consecutiveNegativeCount: 0,
    emotionTrend: [0.12, 0.08, 0.1, 0.05],
    satisfaction: 4,
    messages: [
      { id: 'm1', role: 'user', content: '在吗？我想问一下怎么绑定微信账号？', timestamp: now - 4 * hr, language: 'zh', emotion: 'calm', emotionScore: 0.12, intent: 'account' },
      { id: 'm2', role: 'assistant', content: '您好！关于账户绑定问题，以下是操作步骤：\n\n📌 微信账号绑定步骤：\n1. 登录后进入「个人中心」\n2. 点击「设置」-「账号与安全」\n3. 选择「第三方账号绑定」\n4. 点击「微信」图标\n5. 扫描弹出的二维码完成绑定\n\n绑定后可以使用微信快捷登录哦！', timestamp: now - 4 * hr + 3000, language: 'zh', intent: 'account' },
      { id: 'm3', role: 'user', content: '找到了！谢啦！', timestamp: now - 3.5 * hr, language: 'zh', emotion: 'calm', emotionScore: 0.05, intent: 'thanks' },
    ],
  },
  {
    id: genId('CONV', now - 2 * hr, 8),
    createdAt: now - 2 * hr,
    updatedAt: now - 1.8 * hr,
    currentLanguage: 'zh',
    status: 'resolved',
    unknownCount: 0,
    consecutiveNegativeCount: 0,
    emotionTrend: [0.1, 0.05, 0.08],
    satisfaction: 5,
    messages: [
      { id: 'm1', role: 'user', content: 'Hi，请问你们的售后服务政策是什么？', timestamp: now - 2 * hr, language: 'zh', emotion: 'calm', emotionScore: 0.1, intent: 'after_sales' },
      { id: 'm2', role: 'assistant', content: '感谢反馈！我们的售后团队会竭诚为您服务。以下是售后政策摘要：\n\n🛡️ 【售后服务】\n✓ 7天无理由退换货（商品完好）\n✓ 12个月全国联保\n✓ 质量问题：免费上门取件+换新/全额退款\n✓ 非质量问题：买家承担寄回运费\n\n请描述一下具体的故障现象和购买时间，我将为您匹配最合适的解决方案（维修/换新/退款）。', timestamp: now - 2 * hr + 4000, language: 'zh', intent: 'after_sales' },
      { id: 'm3', role: 'user', content: '好的了解了，谢谢！', timestamp: now - 1.8 * hr, language: 'zh', emotion: 'calm', emotionScore: 0.08, intent: 'thanks' },
    ],
  },
  {
    id: genId('CONV', now - 1 * hr, 9),
    createdAt: now - 1 * hr,
    updatedAt: now - 0.8 * hr,
    currentLanguage: 'en',
    status: 'active',
    unknownCount: 0,
    consecutiveNegativeCount: 0,
    emotionTrend: [0.08],
    messages: [
      { id: 'm1', role: 'user', content: 'Hello! I would like to ask about your premium subscription plan.', timestamp: now - 1 * hr, language: 'en', emotion: 'calm', emotionScore: 0.08, intent: 'consultation' },
    ],
  },
];

const seedTickets: Ticket[] = [
  {
    id: 'TKT1',
    title: '【紧急】客户投诉-CD99887766',
    type: 'complaint',
    priority: 'urgent',
    status: 'processing',
    summary: '【客户投诉】用户在对话中提出了相关问题。涉及订单：CD99887766 用户情绪激动',
    conversationId: seedConversations[1].id,
    messages: [...seedConversations[1].messages],
    createdAt: now - 2 * day,
    updatedAt: now - 2 * day + 2 * 60 * 60 * 1000,
    language: 'zh',
    emotionLevel: 88,
    keyEntities: { orderId: 'CD99887766' },
    assignee: '张经理',
    notes: [
      { id: 'n1', content: '已联系用户，同意全额退款+10%优惠券补偿。等用户寄回商品。', author: '张经理', timestamp: now - 2 * day + 30 * 60 * 1000 },
      { id: 'n2', content: '顺丰已上门取件，等待收到后退款。', author: '张经理', timestamp: now - 2 * day + 2 * 60 * 60 * 1000 },
    ],
  },
  {
    id: 'TKT2',
    title: '【高优】退款退货-EF11223344',
    type: 'complaint',
    priority: 'high',
    status: 'open',
    summary: '【客户投诉】用户在对话中提出了相关问题。涉及订单：EF11223344 用户情绪不安',
    conversationId: seedConversations[5].id,
    messages: [...seedConversations[5].messages],
    createdAt: now - 6 * day,
    updatedAt: now - 6 * day,
    language: 'zh',
    emotionLevel: 55,
    keyEntities: { orderId: 'EF11223344' },
  },
  {
    id: genId('TKT', now - 5 * day, 0),
    title: '售后服务请求',
    type: 'after_sales',
    priority: 'medium',
    status: 'resolved',
    summary: '【售后服务】用户反映产品屏幕有亮点，经检测属质量问题。',
    conversationId: 'legacy-1',
    messages: [],
    createdAt: now - 5 * day,
    updatedAt: now - 3 * day,
    language: 'zh',
    emotionLevel: 35,
    keyEntities: { orderId: 'GH88776655', productName: '智能手表' },
    assignee: '李客服',
    notes: [
      { id: 'n1', content: '安排换新，用户确认收到新品。', author: '李客服', timestamp: now - 4 * day },
      { id: 'n2', content: '用户满意度回访，评价5分。关闭工单。', author: '李客服', timestamp: now - 3 * day },
    ],
  },
  {
    id: genId('TKT', now - 4 * day, 1),
    title: 'Account Issue - Password Recovery',
    type: 'account',
    priority: 'low',
    status: 'closed',
    summary: '【Account Issue】User unable to login due to forgotten password. Guided through reset process.',
    conversationId: seedConversations[2].id,
    messages: [...seedConversations[2].messages],
    createdAt: now - 4 * day,
    updatedAt: now - 4 * day + 1 * hr,
    language: 'en',
    emotionLevel: 30,
    assignee: 'Sarah W.',
    notes: [
      { id: 'n1', content: 'User confirmed password reset successful. Resolved.', author: 'Sarah W.', timestamp: now - 4 * day + 45 * 60 * 1000 },
    ],
  },
  {
    id: genId('TKT', now - 3 * day, 2),
    title: '【中】物流配送问题',
    type: 'shipping',
    priority: 'high',
    status: 'pending',
    summary: '【物流配送】用户反馈包裹显示签收但实际未收到。涉及订单：IJ55443322。情绪不安。',
    conversationId: 'legacy-2',
    messages: [],
    createdAt: now - 3 * day,
    updatedAt: now - 1.5 * day,
    language: 'zh',
    emotionLevel: 48,
    keyEntities: { orderId: 'IJ55443322' },
    assignee: '王物流',
    notes: [
      { id: 'n1', content: '联系快递网点核实，反馈说可能是门卫签收。等待用户确认。', author: '王物流', timestamp: now - 2 * day },
      { id: 'n2', content: '用户仍未找到，已发起查件流程，预计3天出结果。', author: '王物流', timestamp: now - 1.5 * day },
    ],
  },
  {
    id: genId('TKT', now - 2 * day, 3),
    title: '[Medium] Product Info Request',
    type: 'product_info',
    priority: 'low',
    status: 'closed',
    summary: '【Product Info】Inquired about Pro X200 specs. All questions answered satisfactorily.',
    conversationId: seedConversations[3].id,
    messages: [...seedConversations[3].messages],
    createdAt: now - 4 * day,
    updatedAt: now - 4 * day,
    language: 'zh',
    emotionLevel: 10,
  },
  {
    id: genId('TKT', now - 1 * day, 4),
    title: '【高优】产品质量投诉(智能耳机)',
    type: 'complaint',
    priority: 'high',
    status: 'processing',
    summary: '【客户投诉】购买的智能耳机使用一周后左耳无声。相关产品：智能耳机。用户情绪不安',
    conversationId: 'legacy-3',
    messages: [],
    createdAt: now - 1 * day,
    updatedAt: now - 12 * hr,
    language: 'zh',
    emotionLevel: 62,
    keyEntities: { orderId: 'KL22334455', productName: '智能耳机', amount: '599' },
    assignee: '赵售后',
    notes: [
      { id: 'n1', content: '用户提供视频证明确认问题。已发送换新链接。', author: '赵售后', timestamp: now - 12 * hr },
    ],
  },
  {
    id: genId('TKT', now - 8 * hr, 5),
    title: '咨询转人工 - 批量采购',
    type: 'consultation',
    priority: 'low',
    status: 'open',
    summary: '【客户咨询】用户希望了解50台以上企业批量采购折扣方案。',
    conversationId: 'legacy-4',
    messages: [],
    createdAt: now - 8 * hr,
    updatedAt: now - 8 * hr,
    language: 'zh',
    emotionLevel: 12,
  },
];

function generateDailyStats(): DashboardStats['dailyTrend'] {
  const days: DashboardStats['dailyTrend'] = [];
  const intents: Record<IntentType, number> = {
    consultation: 0, complaint: 0, after_sales: 0, refund: 0, shipping: 0,
    product_info: 0, account: 0, greeting: 0, thanks: 0, farewell: 0,
    human_request: 0, unknown: 0,
  };

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i * day);
    const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
    const base = 30 + Math.floor(Math.random() * 40);
    const conv = base + Math.floor(Math.random() * 20);
    const tickets = Math.floor(conv * (0.1 + Math.random() * 0.15));
    days.push({
      date: dateStr,
      conversations: conv,
      tickets,
      avgSatisfaction: Math.round((3.8 + Math.random() * 1.1) * 10) / 10,
    });
  }

  return days;
}

function generateIntentDist(): DashboardStats['intentDistribution'] {
  const dist: DashboardStats['intentDistribution'] = {
    consultation: 45, complaint: 18, after_sales: 28, refund: 22, shipping: 38,
    product_info: 52, account: 25, greeting: 88, thanks: 62, farewell: 40,
    human_request: 15, unknown: 12,
  };
  return dist;
}

const seedStats: DashboardStats = {
  totalConversations: 368,
  autoResolutionRate: 78.5,
  avgResponseTime: 3.2,
  avgSatisfaction: 4.42,
  ticketsCreated: 57,
  ticketsResolved: 42,
  emotions: { calm: 245, concerned: 82, angry: 41 },
  dailyTrend: generateDailyStats(),
  intentDistribution: generateIntentDist(),
};

export { seedConversations, seedTickets, seedStats };
