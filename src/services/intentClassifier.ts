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
  ko: {
    greeting: ['안녕하세요', '안녕', '여보세요', '처음 뵙겠습니다', '좋은 아침', '좋은 저녁'],
    consultation: ['문의', '질문', '궁금해', '어떻게', '무엇인가요', '알려주세요', '알고 싶어'],
    complaint: ['불만', '불평', '불량', '최악', '나쁘다', '싫어', '실망', '사기', '문제', '짜증나'],
    after_sales: ['A/S', '애프터서비스', '수리', '고장', '안 돼', '작동 안 해', '보증', '문제 있어'],
    refund: ['환불', '반품', '취소', '돌려줘', '돈 돌려줘', '반환', '취소해 줘'],
    shipping: ['배송', '출고', '물류', '택배', '추적', '언제 와', '도착', '배송비'],
    product_info: ['제품', '상품', '스펙', '사이즈', '색상', '재고', '기능', '상세 정보'],
    account: ['계정', '로그인', '비밀번호', '가입', '회원', '잊어버렸어', '설정'],
    thanks: ['감사', '고마워', '고맙습니다', '감사합니다', '도움됐어'],
    farewell: ['안녕히 가세요', '안녕', '다음에', '잘가', '끝', '더 이상 궁금한 거 없어'],
    human_request: ['사람', '상담원', '담당자', '연결해 줘', '직접', '말하고 싶어', '자동응답 말고'],
    unknown: [],
  },
  fr: {
    greeting: ['bonjour', 'salut', 'hello', 'bonsoir', 'bonjour à tous', 'coucou'],
    consultation: ['question', 'demander', 'comment', 'quel est', 'savoir', 'informations', 'en savoir plus'],
    complaint: ['plainte', 'réclamation', 'mécontent', 'mauvais', 'terrible', 'horrible', 'déçu', 'arnaque', 'problème', 'nul'],
    after_sales: ['après-vente', 'réparation', 'cassé', 'ne marche pas', 'garantie', 'défectueux', 'panne', 'problème'],
    refund: ['remboursement', 'rembourser', 'retour', 'rendre', 'annuler', 'annulation', 'rendre l\'argent'],
    shipping: ['livraison', 'expédition', 'colis', 'suivi', 'traquer', 'quand arrive', 'livrer', 'frais de port'],
    product_info: ['produit', 'spécifications', 'taille', 'couleur', 'stock', 'fonctionnalités', 'détails', 'informations produit'],
    account: ['compte', 'connexion', 'mot de passe', 'inscription', 'membre', 'oublié', 'paramètres'],
    thanks: ['merci', 'remercier', 'merci beaucoup', 'je vous remercie', 'super'],
    farewell: ['au revoir', 'salut', 'à plus', 'adieu', 'c\'est tout', 'plus de questions'],
    human_request: ['humain', 'agent', 'conseiller', 'parler à', 'directement', 'je veux parler', 'pas un robot'],
    unknown: [],
  },
  de: {
    greeting: ['hallo', 'guten tag', 'hi', 'guten morgen', 'guten abend', 'herzlich willkommen'],
    consultation: ['frage', 'fragen', 'wie', 'was ist', 'wissen', 'informationen', 'mehr erfahren'],
    complaint: ['beschwerde', 'unzufrieden', 'schlecht', 'schrecklich', 'schlimm', 'enttäuscht', 'betrug', 'problem', 'miese', 'nervig'],
    after_sales: ['kundendienst', 'reparatur', 'kaputt', 'funktioniert nicht', 'garantie', 'defekt', 'fehler', 'problem'],
    refund: ['rückerstattung', 'rückgabe', 'zurückgeben', 'stornieren', 'stornierung', 'geld zurück', 'erstatten'],
    shipping: ['versand', 'lieferung', 'paket', 'verfolgung', 'verfolgen', 'wann kommt', 'liefern', 'versandkosten'],
    product_info: ['produkt', 'spezifikationen', 'größe', 'farbe', 'lagerbestand', 'funktionen', 'details', 'produktinfo'],
    account: ['konto', 'anmeldung', 'passwort', 'registrierung', 'mitglied', 'vergessen', 'einstellungen'],
    thanks: ['danke', 'danke schön', 'vielen dank', 'ich danke dir', 'super'],
    farewell: ['auf wiedersehen', 'tschüss', 'bis bald', 'lebe wohl', 'das ist alles', 'keine fragen mehr'],
    human_request: ['mensch', 'mitarbeiter', 'berater', 'sprechen mit', 'direkt', 'ich will sprechen', 'kein bot'],
    unknown: [],
  },
  es: {
    greeting: ['hola', 'buenos días', 'buenas tardes', 'buenas noches', 'qué tal', 'saludos'],
    consultation: ['pregunta', 'consultar', 'cómo', 'qué es', 'saber', 'información', 'saber más'],
    complaint: ['queja', 'reclamación', 'insatisfecho', 'malo', 'terrible', 'horrible', 'decepcionado', 'estafa', 'problema', 'pésimo'],
    after_sales: ['postventa', 'reparación', 'roto', 'no funciona', 'garantía', 'defectuoso', 'avería', 'problema'],
    refund: ['reembolso', 'devolver', 'devolución', 'cancelar', 'cancelación', 'devolver el dinero', 'reembolsar'],
    shipping: ['envío', 'entrega', 'paquete', 'seguimiento', 'rastrear', 'cuándo llega', 'entregar', 'gastos de envío'],
    product_info: ['producto', 'especificaciones', 'tamaño', 'color', 'stock', 'funciones', 'detalles', 'información del producto'],
    account: ['cuenta', 'inicio de sesión', 'contraseña', 'registro', 'miembro', 'olvidé', 'configuración'],
    thanks: ['gracias', 'muchas gracias', 'te agradezco', 'le agradezco', 'genial'],
    farewell: ['adiós', 'hasta luego', 'hasta pronto', 'chau', 'eso es todo', 'no hay más preguntas'],
    human_request: ['humano', 'agente', 'asesor', 'hablar con', 'directamente', 'quiero hablar', 'no soy un robot'],
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
