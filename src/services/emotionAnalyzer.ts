import { EmotionState, Language, EmotionLevel, ComfortModeState, Conversation } from '../types';

const negativeWords: Record<Language, string[]> = {
  zh: [
    '生气', '愤怒', '讨厌', '恶心', '垃圾', '太差', '糟糕', '失望', '绝望', '欺骗',
    '虚假', '被骗', '投诉', '差评', '可恶', '可恨', '无语', '崩溃', '炸了', '服了',
    '不负责任', '不负责', '骗人', '忽悠', '态度差', '效率低', '太慢了', '等太久',
    '不合理', '过分', '离谱', '破', '烂', '垃圾公司', '什么玩意', '垃圾产品',
    '气死人', '气死我', '搞什么', '凭什么', '垃圾服务',
  ],
  en: [
    'angry', 'furious', 'hate', 'terrible', 'awful', 'worst', 'horrible', 'disappointed',
    'frustrated', 'annoyed', 'mad', 'disgusting', 'sucks', 'bullshit', 'crap', 'fraud',
    'scam', 'unacceptable', 'outrageous', 'ridiculous', 'useless', 'pathetic', 'shitty',
    'fake', 'cheated', 'lied', 'liar', 'broken', 'defective', 'terrible service',
    'never again', 'waste of money', 'poor quality', 'bad experience',
  ],
  ja: [
    '怒ってる', '最悪', 'ひどい', '嫌', '嫌い', 'がっかり', '腹立たしい', 'むかつく',
    'だまされた', '不正', 'ダメ', 'でたらめ', 'ふざけるな', '許せない', '頭にくる',
    'イライラ', '不満', '苦情', '文句', '最低',
  ],
  ko: [
    '화나', '짜증나', '최악', '싫어', '실망', '속상해', '어이없어', '황당해',
    '사기당했어', '불만', '불량', '고장', '후회돼', '아니', '뭐야', '어이가 없네',
    '스트레스', '짜증', '불쾌', '최악이야',
  ],
  fr: [
    'furieux', 'en colère', 'déçu', 'déception', 'horrible', 'terrible', 'pire', 'nul',
    'arnaque', 'escroquerie', 'plainte', 'réclamation', 'insupportable', 'scandaleux',
    'abusif', 'détestable', 'affreux', 'épouvantable', 'mauvais', 'problème',
  ],
  de: [
    'wütend', 'ärgerlich', 'enttäuscht', 'schrecklich', 'schlimm', 'schlecht', 'schrott',
    'betrogen', 'betrug', 'beschwerde', 'unerträglich', 'skandalös', 'unakzeptabel',
    'frustrierend', 'nervig', 'verärgert', 'empört', 'fürchterlich', 'miese', 'problem',
  ],
  es: [
    'enojado', 'furioso', 'decepcionado', 'terrible', 'horrible', 'peor', 'malo',
    'estafa', 'fraude', 'queja', 'reclamación', 'insoportable', 'escandaloso',
    'inaceptable', 'frustrante', 'molesto', 'enfadado', 'rabia', 'pésimo', 'problema',
  ],
};

const positiveWords: Record<Language, string[]> = {
  zh: ['满意', '开心', '高兴', '喜欢', '感谢', '谢谢', '很好', '棒', '赞', '优秀', '好评', '惊喜'],
  en: ['happy', 'satisfied', 'great', 'good', 'excellent', 'amazing', 'love', 'thanks', 'thank you', 'appreciate', 'wonderful', 'perfect'],
  ja: ['満足', '嬉しい', '楽しい', '好き', '感謝', 'ありがとう', '素晴らしい', '最高', '良い', '優れている'],
  ko: ['만족', '행복', '기뻐', '좋아', '감사', '고마워', '최고', '좋다', '훌륭해', '감사합니다'],
  fr: ['content', 'satisfait', 'super', 'bon', 'excellent', 'incroyable', 'aimer', 'merci', 'merci beaucoup', 'apprécier', 'parfait', 'génial'],
  de: ['glücklich', 'zufrieden', 'großartig', 'gut', 'hervorragend', 'fantastisch', 'lieben', 'danke', 'vielen dank', 'schätzen', 'perfekt', 'wunderbar'],
  es: ['feliz', 'satisfecho', 'excelente', 'bueno', 'magnífico', 'increíble', 'encantar', 'gracias', 'muchas gracias', 'apreciar', 'perfecto', 'genial'],
};

const directComplaintWords: Record<Language, string[]> = {
  zh: [
    '投诉', '举报', '12315', '消费者协会', '工商局', '曝光', '媒体', '告你们',
    '起诉', '法律', '维权', '赔偿', '十倍赔偿', '假一赔三', '欺诈',
    '我要投诉', '坚决投诉', '必须赔偿', '太过分了', '忍无可忍',
  ],
  en: [
    'complaint', 'complain', 'lawsuit', 'sue', 'legal', 'bbb', 'better business bureau',
    'ftc', 'consumer protection', 'expose', 'media', 'public', 'report',
    'demand compensation', 'refund immediately', 'unacceptable behavior',
    'i will sue', 'take legal action', 'this is fraud',
  ],
  ja: [
    '苦情', '訴える', '裁判', '法律', '消費者センター', '公正取引委員会',
    'メディア', '暴露', '賠償', '損害賠償', '詐欺', '不当行為',
    '絶対に許せない', '絶対に訴える', '絶対に払わせる',
  ],
  ko: [
    '신고', '고발', '소비자원', '공정거래위원회', '언론', '고소', '고발',
    '소송', '법적 조치', '배상', '손해배상', '사기', '불법행위',
    '절대 용서 안 돼', '꼭 고소할 거야', '반드시 배상받을 거야',
  ],
  fr: [
    'plainte', 'réclamation', 'procès', 'justice', 'consommateur', 'dgccrf',
    'médias', 'dénoncer', 'indemnisation', 'dommages et intérêts', 'arnaque',
    'fraude', 'action en justice', 'porter plainte', 'démarrer une procédure',
  ],
  de: [
    'beschwerde', 'klage', 'gericht', 'verbraucherschutz', 'bundesnetzagentur',
    'medien', 'anklagen', 'entschädigung', 'schadenersatz', 'betrug',
    'rechtswidrig', 'rechtliche schritte', 'klage einreichen', 'verbraucherzentrale',
    'ich werde klagen', 'das ist rechtswidrig', 'ich verlangen entschädigung',
  ],
  es: [
    'queja', 'reclamación', 'demanda', 'juicio', 'consumidor', 'consumo',
    'medios', 'denunciar', 'indemnización', 'daños y perjuicios', 'estafa',
    'fraude', 'acción legal', 'poner una queja', 'iniciar un procedimiento',
    'voy a denunciar', 'esto es inaceptable', 'exijo compensación',
  ],
};

export interface EmotionResult {
  state: EmotionState;
  score: number;
  level: EmotionLevel;
  details: {
    negativeWordCount: number;
    positiveWordCount: number;
    exclamationCount: number;
    uppercaseRatio: number;
    repeatedChars: number;
    directComplaintWords: number;
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
    directComplaintWords: 0,
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

  directComplaintWords[language].forEach((word) => {
    const lowerWord = word.toLowerCase();
    const regex = new RegExp(lowerWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = normalized.match(regex);
    if (matches) details.directComplaintWords += matches.length;
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

  const exclamationWeight = details.exclamationCount >= 2
    ? Math.log2(details.exclamationCount) * 0.6
    : 0;

  const shortTextPenalty = textLength < 10 ? Math.max(0.3, textLength / 10) : 1;

  const rawScore =
    (details.negativeWordCount * 2.5 +
      exclamationWeight +
      details.uppercaseRatio * 6 +
      details.repeatedChars * 1.5 +
      details.directComplaintWords * 4.0 -
      details.positiveWordCount * 1.5) /
    Math.sqrt(textLength) *
    shortTextPenalty;

  let score = 1 / (1 + Math.exp(-rawScore * 2.5));

  if (details.directComplaintWords > 0) {
    score = Math.min(1, score + 0.15 * details.directComplaintWords);
  }

  score = Math.max(0, Math.min(1, score));

  if (details.negativeWordCount === 0 && details.directComplaintWords === 0 && details.exclamationCount < 3) {
    score = Math.min(score, 0.35);
  }

  let state: EmotionState = 'calm';
  if (score >= 0.7) {
    state = 'angry';
  } else if (score >= 0.35) {
    state = 'concerned';
  }

  let level: EmotionLevel = 'mild';
  const hasStrongNegativity = details.negativeWordCount >= 2 || details.directComplaintWords >= 1;
  if (details.directComplaintWords >= 2 || (score >= 0.85 && hasStrongNegativity)) {
    level = 'severe';
  } else if ((score >= 0.6 && hasStrongNegativity) || (details.exclamationCount >= 4 && details.negativeWordCount >= 1)) {
    level = 'moderate';
  } else if (score >= 0.35 && hasStrongNegativity) {
    level = 'mild';
  }

  if (!hasStrongNegativity && details.exclamationCount < 3) {
    level = 'mild';
    state = score >= 0.5 ? 'concerned' : 'calm';
    score = Math.min(score, 0.45);
  }

  return { state, score, level, details };
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
    ko: { calm: '안정', concerned: '주의 필요', angry: '화남' },
    fr: { calm: 'Calme', concerned: 'Attention Requise', angry: 'En Colère' },
    de: { calm: 'Ruhig', concerned: 'Aufmerksamkeit Erforderlich', angry: 'Wütend' },
    es: { calm: 'Tranquilo', concerned: 'Requiere Atención', angry: 'Enojado' },
  };
  return labels[language][state];
}

export function getEmotionLevelLabel(level: EmotionLevel, language: Language): string {
  const labels: Record<Language, Record<EmotionLevel, string>> = {
    zh: { mild: '轻度不满', moderate: '中度愤怒', severe: '重度投诉' },
    en: { mild: 'Mild Dissatisfaction', moderate: 'Moderate Anger', severe: 'Severe Complaint' },
    ja: { mild: '軽度不満', moderate: '中度怒り', severe: '重度苦情' },
    ko: { mild: '경미한 불만', moderate: '중간 정도 화남', severe: '심각한 불만' },
    fr: { mild: 'Mécontentement Léger', moderate: 'Colère Modérée', severe: 'Plainte Grave' },
    de: { mild: 'Leichte Unzufriedenheit', moderate: 'Mäßige Wut', severe: 'Schwere Beschwerde' },
    es: { mild: 'Insatisfacción Leve', moderate: 'Ira Moderada', severe: 'Queja Grave' },
  };
  return labels[language][level];
}

export function getEmotionLevelColor(level: EmotionLevel): string {
  switch (level) {
    case 'mild':
      return 'text-amber-600 bg-amber-50 border-amber-200';
    case 'moderate':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'severe':
      return 'text-red-600 bg-red-50 border-red-200';
  }
}

export function evaluateComfortMode(
  conversation: Conversation,
  latestEmotionScore: number,
  latestEmotionLevel: EmotionLevel
): ComfortModeState {
  const emotionTrend = conversation.emotionTrend;
  const recentScores = emotionTrend.slice(-3);
  const avgEmotionScore =
    recentScores.length > 0
      ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length
      : latestEmotionScore;

  const consecutiveNegativeCount = conversation.consecutiveNegativeCount;

  let enabled = false;
  let level: EmotionLevel = latestEmotionLevel;

  if (latestEmotionLevel === 'severe') {
    enabled = true;
    level = 'severe';
  } else if (latestEmotionLevel === 'moderate' && consecutiveNegativeCount >= 2) {
    enabled = true;
    level = 'moderate';
  } else if (avgEmotionScore >= 0.5 && consecutiveNegativeCount >= 3) {
    enabled = true;
    level = latestEmotionLevel === 'mild' ? 'mild' : latestEmotionLevel;
  } else if (consecutiveNegativeCount >= 4) {
    enabled = true;
    level = 'moderate';
  }

  if (enabled && avgEmotionScore >= 0.8) {
    level = 'severe';
  }

  return {
    enabled,
    level,
    triggeredAt: enabled ? Date.now() : undefined,
    consecutiveNegativeCount,
    avgEmotionScore,
  };
}

export function isComfortModeRequired(
  consecutiveNegativeCount: number,
  avgEmotionScore: number,
  latestLevel: EmotionLevel
): boolean {
  return (
    latestLevel === 'severe' ||
    (latestLevel === 'moderate' && consecutiveNegativeCount >= 2) ||
    (avgEmotionScore >= 0.5 && consecutiveNegativeCount >= 3) ||
    consecutiveNegativeCount >= 4
  );
}
