import { EmotionState, Language } from '../types';

const negativeWords: Record<Language, string[]> = {
  zh: [
    '生气', '愤怒', '讨厌', '恶心', '垃圾', '太差', '糟糕', '失望', '绝望', '欺骗',
    '虚假', '被骗', '投诉', '差评', '可恶', '可恨', '无语', '崩溃', '炸了', '服了',
    '不负责任', '不负责', '骗人', '忽悠', '态度差', '效率低', '太慢了', '等太久',
    '不合理', '过分', '离谱', '破', '烂', '垃圾公司', '什么玩意', '垃圾产品',
    '!!!', '！！！', '气死人', '气死我', '搞什么', '凭什么', '垃圾服务',
  ],
  en: [
    'angry', 'furious', 'hate', 'terrible', 'awful', 'worst', 'horrible', 'disappointed',
    'frustrated', 'annoyed', 'mad', 'disgusting', 'sucks', 'bullshit', 'crap', 'fraud',
    'scam', 'unacceptable', 'outrageous', 'ridiculous', 'useless', 'pathetic', 'shitty',
    'fake', 'cheated', 'lied', 'liar', 'broken', 'defective', 'terrible service',
    'never again', 'waste of money', 'poor quality', 'bad experience', '!!!',
  ],
  ja: [
    '怒ってる', '最悪', 'ひどい', '嫌', '嫌い', 'がっかり', '腹立たしい', 'むかつく',
    'だまされた', '不正', 'ダメ', 'でたらめ', 'ふざけるな', '許せない', '頭にくる',
    'イライラ', '不満', '苦情', '文句', '最低', '!!!', '！！！',
  ],
};

const positiveWords: Record<Language, string[]> = {
  zh: ['满意', '开心', '高兴', '喜欢', '感谢', '谢谢', '很好', '棒', '赞', '优秀', '好评', '惊喜'],
  en: ['happy', 'satisfied', 'great', 'good', 'excellent', 'amazing', 'love', 'thanks', 'thank you', 'appreciate', 'wonderful', 'perfect'],
  ja: ['満足', '嬉しい', '楽しい', '好き', '感謝', 'ありがとう', '素晴らしい', '最高', '良い', '優れている'],
};

export interface EmotionResult {
  state: EmotionState;
  score: number;
  details: {
    negativeWordCount: number;
    positiveWordCount: number;
    exclamationCount: number;
    uppercaseRatio: number;
    repeatedChars: number;
  };
}

export function analyzeEmotion(text: string, language: Language): EmotionResult {
  const normalized = text.toLowerCase().trim();
  const details = {
    negativeWordCount: 0,
    positiveWordCount: 0,
    exclamationCount: 0,
    uppercaseRatio: 0,
    repeatedChars: 0,
  };

  negativeWords[language].forEach((word) => {
    const lowerWord = word.toLowerCase();
    const regex = new RegExp(lowerWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = normalized.match(regex);
    if (matches) details.negativeWordCount += matches.length;
  });

  positiveWords[language].forEach((word) => {
    const lowerWord = word.toLowerCase();
    const regex = new RegExp(lowerWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = normalized.match(regex);
    if (matches) details.positiveWordCount += matches.length;
  });

  const exclamationMatches = text.match(/[!！]/g);
  details.exclamationCount = exclamationMatches ? exclamationMatches.length : 0;

  const latinChars = text.match(/[a-zA-Z]/g);
  if (latinChars && latinChars.length > 0) {
    const uppercaseChars = text.match(/[A-Z]/g);
    details.uppercaseRatio = uppercaseChars ? uppercaseChars.length / latinChars.length : 0;
  }

  const repeatedMatches = text.match(/(.)\1{2,}/g);
  details.repeatedChars = repeatedMatches ? repeatedMatches.length : 0;

  const textLength = Math.max(1, text.length);

  const rawScore =
    (details.negativeWordCount * 2.5 +
      details.exclamationCount * 0.8 +
      details.uppercaseRatio * 8 +
      details.repeatedChars * 1.5 -
      details.positiveWordCount * 1.2) /
    Math.sqrt(textLength);

  let score = 1 / (1 + Math.exp(-rawScore * 2));

  score = Math.max(0, Math.min(1, score));

  let state: EmotionState = 'calm';
  if (score >= 0.7) {
    state = 'angry';
  } else if (score >= 0.35) {
    state = 'concerned';
  }

  return { state, score, details };
}

export function getEmotionColor(state: EmotionState): string {
  switch (state) {
    case 'calm':
      return 'text-emotion-calm bg-emerald-50';
    case 'concerned':
      return 'text-emotion-concerned bg-amber-50';
    case 'angry':
      return 'text-emotion-angry bg-red-50';
  }
}

export function getEmotionBorderColor(state: EmotionState): string {
  switch (state) {
    case 'calm':
      return 'border-emerald-200';
    case 'concerned':
      return 'border-amber-200';
    case 'angry':
      return 'border-red-200';
  }
}

export function getEmotionLabel(state: EmotionState, language: Language): string {
  const labels: Record<Language, Record<EmotionState, string>> = {
    zh: { calm: '情绪正常', concerned: '需要关注', angry: '情绪激动' },
    en: { calm: 'Calm', concerned: 'Needs Attention', angry: 'Upset' },
    ja: { calm: '穏やか', concerned: '要注意', angry: '怒っている' },
  };
  return labels[language][state];
}
