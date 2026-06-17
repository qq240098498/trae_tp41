import { IntentType, Language } from '../types';

const intentKeywords: Record<Language, Record<IntentType, string[]>> = {
  zh: {
    greeting: ['你好', '您好', '哈喽', '嗨', '在吗', '有人吗', 'hi', 'hello', '喂'],
    consultation: ['咨询', '请问', '想了解', '打听', '问一下', '问个问题', '什么是', '如何', '怎样', '怎么'],
    complaint: ['投诉', '差评', '太垃圾', '太差', '垃圾', '不满意', '失望', '被骗', '虚假', '欺骗', '最讨厌', '恶心', '受不了', '差评', '举报'],
    after_sales: ['售后', '维修', '坏了', '故障', '不能用', '无法使用', '出问题', '质量问题', '保修', '质保'],
    refund: ['退款', '退钱', '退货', '退掉', '不想要了', '取消订单', '退单', '返还'],
    shipping: ['物流', '快递', '发货', '配送', '送货', '什么时候到', '没收到', '包裹', '单号'],
    product_info: ['产品', '商品', '规格', '参数', '尺寸', '颜色', '库存', '有没有货', '功能', '介绍'],
    account: ['账号', '账户', '登录', '密码', '注册', '忘记密码', '绑定', '解绑', '修改信息', '个人中心'],
    thanks: ['谢谢', '感谢', '多谢', 'thanks', 'thank you', 'thx', '太感谢了'],
    farewell: ['再见', '拜拜', 'bye', 'goodbye', '下次见', '没别的了', '没问题了'],
    human_request: ['人工', '真人', '客服', '转人工', '找客服', '工作人员', '人来', '不是机器人'],
    unknown: [],
  },
  en: {
    greeting: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'yo'],
    consultation: ['ask', 'question', 'inquire', 'how to', 'how do i', 'what is', 'tell me about', 'info', 'information', 'would like to know'],
    complaint: ['complain', 'complaint', 'bad', 'terrible', 'awful', 'worst', 'disappointed', 'disappointing', 'fraud', 'scam', 'hate', 'sucks', 'horrible', 'unacceptable'],
    after_sales: ['repair', 'broken', 'not working', 'warranty', 'defective', 'fault', 'issue', 'malfunction', 'after sales', 'customer service', 'support'],
    refund: ['refund', 'money back', 'return', 'returning', 'cancel order', 'give back', 'reimburse'],
    shipping: ['shipping', 'delivery', 'package', 'tracking', 'track', 'shipment', 'deliver', 'when arrive', 'where is my order', 'logistics'],
    product_info: ['product', 'specification', 'specs', 'size', 'color', 'stock', 'available', 'feature', 'details', 'information about'],
    account: ['account', 'login', 'password', 'register', 'sign up', 'sign in', 'forgot password', 'profile', 'settings'],
    thanks: ['thank', 'thanks', 'thank you', 'thx', 'appreciate', 'grateful'],
    farewell: ['bye', 'goodbye', 'see you', 'see ya', 'take care', 'thats all', 'no more questions'],
    human_request: ['human', 'agent', 'real person', 'speak to', 'representative', 'customer support', 'live agent', 'not a bot', 'real person'],
    unknown: [],
  },
  ja: {
    greeting: ['こんにちは', 'はじめまして', 'やあ', 'よろしく', 'おはよう', 'こんばんは'],
    consultation: ['問い合わせ', '質問', '聞きたい', 'どうやって', 'どのように', '何ですか', '教えて', '知りたい'],
    complaint: ['苦情', '文句', '不満', '最悪', 'ひどい', '嫌', 'がっかり', '騙された', '不正', 'ダメ'],
    after_sales: ['アフターサービス', '修理', '故障', '壊れた', '動かない', '保証', '不具合', '問題'],
    refund: ['返金', '返品', 'キャンセル', '取り消し', 'お金返して', '返還'],
    shipping: ['配送', '出荷', '物流', '荷物', '追跡', 'いつ届く', '到着', '送料'],
    product_info: ['商品', '製品', '仕様', 'サイズ', 'カラー', '在庫', '機能', '詳細'],
    account: ['アカウント', 'ログイン', 'パスワード', '登録', '会員', '忘れた', '設定'],
    thanks: ['ありがとう', '感謝', 'どうも', 'サンキュー', '助かりました'],
    farewell: ['さようなら', 'バイバイ', 'また', '失礼します', '以上です', '問題ない'],
    human_request: ['人間', 'オペレーター', '担当者', '繋げて', '直接', '話したい', '自動応答ではなく'],
    unknown: [],
  },
};

const intentWeights: Record<IntentType, number> = {
  greeting: 1.0,
  consultation: 1.0,
  complaint: 1.5,
  after_sales: 1.2,
  refund: 1.3,
  shipping: 1.0,
  product_info: 1.0,
  account: 1.0,
  thanks: 1.0,
  farewell: 1.0,
  human_request: 2.0,
  unknown: 0,
};

export interface ClassifyResult {
  intent: IntentType;
  confidence: number;
  scores: Record<IntentType, number>;
}

export function classifyIntent(
  text: string,
  language: Language,
  previousIntent?: IntentType
): ClassifyResult {
  const normalizedText = text.toLowerCase().trim();
  const scores: Record<IntentType, number> = {} as Record<IntentType, number>;
  const keywords = intentKeywords[language];

  (Object.keys(keywords) as IntentType[]).forEach((intent) => {
    let score = 0;
    const words = keywords[intent];

    words.forEach((keyword) => {
      const lowerKeyword = keyword.toLowerCase();
      const regex = new RegExp(lowerKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = normalizedText.match(regex);
      if (matches) {
        score += matches.length * (lowerKeyword.length >= 2 ? 1.2 : 0.8);
      }
    });

    scores[intent] = score * intentWeights[intent];
  });

  if (previousIntent && previousIntent !== 'unknown') {
    scores[previousIntent] = (scores[previousIntent] || 0) * 1.2;
  }

  let bestIntent: IntentType = 'unknown';
  let bestScore = 0;
  let totalScore = 0;

  (Object.keys(scores) as IntentType[]).forEach((intent) => {
    totalScore += scores[intent];
    if (scores[intent] > bestScore) {
      bestScore = scores[intent];
      bestIntent = intent;
    }
  });

  const confidence = totalScore > 0 ? Math.min(0.98, bestScore / (totalScore + 0.1)) : 0;

  if (bestScore < 0.3) {
    bestIntent = 'unknown';
  }

  return {
    intent: bestIntent,
    confidence,
    scores,
  };
}
