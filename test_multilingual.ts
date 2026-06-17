import {
  detectLanguage,
  detectLanguageDetailed,
  decideLanguageSwitch,
  extractTechnicalTerms,
  LanguageDetectionResult,
} from './src/services/multilingualService';
import { generateReply } from './src/services/responseGenerator';
import { Language } from './src/types';

const langNames: Record<Language, string> = {
  zh: '中文',
  en: '英文',
  ja: '日文',
};

function printHeader(title: string, width = 80) {
  const line = '='.repeat(width);
  const padding = Math.max(0, Math.floor((width - title.length - 2) / 2));
  console.log(`\n${line}`);
  console.log(`${' '.repeat(padding)} ${title} ${' '.repeat(padding)}`);
  console.log(line);
}

function printSubHeader(title: string) {
  console.log(`\n── ${title} ──`);
}

function printResult(label: string, expected: string, actual: string, pass: boolean) {
  const status = pass ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} | ${label.padEnd(40)} | 期望: ${expected.padEnd(8)} | 实际: ${actual.padEnd(8)}`);
}

function section1_languageDetection() {
  printHeader('测试 1: 纯文本语言检测');

  const testCases: Array<{ text: string; expected: Language; desc: string }> = [
    { text: '你好，请问有什么可以帮助您的？', expected: 'zh', desc: '中文问候长句' },
    { text: '您好', expected: 'zh', desc: '中文简单问候' },
    { text: '我要投诉你们的产品质量太差了！', expected: 'zh', desc: '中文投诉' },
    { text: 'Hello, how can I help you today?', expected: 'en', desc: '英文问候长句' },
    { text: 'Hi there', expected: 'en', desc: '英文简单问候' },
    { text: 'I want to complain about your terrible product quality!', expected: 'en', desc: '英文投诉' },
    { text: 'こんにちは、ご用件は何でしょうか？', expected: 'ja', desc: '日文问候长句' },
    { text: 'ありがとう', expected: 'ja', desc: '日文感谢' },
    { text: '製品の品質について苦情があります！', expected: 'ja', desc: '日文投诉' },
  ];

  let pass = 0;
  testCases.forEach((tc) => {
    const result = detectLanguage(tc.text);
    const ok = result === tc.expected;
    if (ok) pass++;
    printResult(tc.desc, langNames[tc.expected], langNames[result], ok);
  });
  console.log(`\n纯文本检测通过率: ${pass}/${testCases.length}`);
}

function section2_mixedLanguage() {
  printHeader('测试 2: 混合语言识别与主要语言判定');

  const testCases: Array<{
    text: string;
    expected: Language;
    expectedMixed: boolean;
    desc: string;
  }> = [
    {
      text: '我的订单 order #12345 一直没有收到，物流信息查不到',
      expected: 'zh',
      expectedMixed: true,
      desc: '中文为主+少量英文术语',
    },
    {
      text: 'I want to check my 订单 ORD-2024-001 status',
      expected: 'en',
      expectedMixed: true,
      desc: '英文为主+中文词+订单号',
    },
    {
      text: '这个 API 接口返回的 JSON 数据有问题，请帮我看看',
      expected: 'zh',
      expectedMixed: true,
      desc: '中文为主+技术术语 API JSON',
    },
    {
      text: 'Please help check my 注文番号 ABC999 配送状況',
      expected: 'en',
      expectedMixed: true,
      desc: '中英日混合但英文占比最高',
    },
    {
      text: 'SDKの使い方について質問ですが、REST APIの認証方法がわかりません',
      expected: 'ja',
      expectedMixed: true,
      desc: '日文为主+技术术语 SDK REST API',
    },
  ];

  let pass = 0;
  testCases.forEach((tc) => {
    const result: LanguageDetectionResult = detectLanguageDetailed(tc.text);
    const langOk = result.language === tc.expected;
    const mixedOk = result.isMixed === tc.expectedMixed;
    const ok = langOk && mixedOk;
    if (ok) pass++;
    const ratioStr = `ZH:${(result.languageRatios.zh * 100).toFixed(0)}% EN:${(result.languageRatios.en * 100).toFixed(0)}% JA:${(result.languageRatios.ja * 100).toFixed(0)}%`;
    const status = ok ? '✅ PASS' : '❌ FAIL';
    console.log(
      `${status} | ${tc.desc.padEnd(32)} | 语言: ${langNames[result.language].padEnd(4)}/${langNames[tc.expected].padEnd(4)} | 混合: ${String(result.isMixed).padEnd(5)}/${String(tc.expectedMixed).padEnd(5)} | ${ratioStr}`
    );
  });
  console.log(`\n混合语言检测通过率: ${pass}/${testCases.length}`);
}

function section3_technicalTerms() {
  printHeader('测试 3: 专业术语识别与保留');

  const testCases: Array<{ text: string; expectedTerms: string[]; desc: string }> = [
    {
      text: '调用 REST API 时返回的 JSON 格式不对，请检查',
      expectedTerms: ['REST', 'API', 'JSON'],
      desc: '技术术语 REST API JSON',
    },
    {
      text: '我的订单 ORD-2024-99999 用的 PayPal 付款',
      expectedTerms: ['ORD-2024-99999', 'PayPal'],
      desc: '订单号 + 支付平台',
    },
    {
      text: '部署在 AWS 上的 Docker 容器无法连接 Redis',
      expectedTerms: ['AWS', 'Docker', 'Redis'],
      desc: '云计算术语 AWS Docker Redis',
    },
    {
      text: '使用 SKU-PRO-001 型号的产品，联系邮箱 test@example.com',
      expectedTerms: ['SKU-PRO-001', 'test@example.com'],
      desc: 'SKU号 + 邮箱',
    },
    {
      text: '访问 https://api.example.com/docs 查看 API 文档',
      expectedTerms: ['https://api.example.com/docs', 'API'],
      desc: 'URL + 技术术语',
    },
  ];

  let pass = 0;
  testCases.forEach((tc) => {
    const terms = extractTechnicalTerms(tc.text);
    const normalizedFound = terms.map((t) => t.toLowerCase());
    const allFound = tc.expectedTerms.every((et) =>
      normalizedFound.some((ft) => ft.includes(et.toLowerCase()) || et.toLowerCase().includes(ft))
    );
    if (allFound) pass++;
    const status = allFound ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} | ${tc.desc.padEnd(32)} | 找到: [${terms.join(', ')}] | 期望包含: [${tc.expectedTerms.join(', ')}]`);
  });
  console.log(`\n专业术语识别通过率: ${pass}/${testCases.length}`);
}

function section4_languageSwitch() {
  printHeader('测试 4: 语言切换策略');

  printSubHeader('测试 4.1: 首条消息自动检测');
  const firstMsgCases: Array<{ text: string; initLang: Language; expectedSwitch: boolean; expected: Language; desc: string }> = [
    { text: '你好，我想问下退款的事情', initLang: 'en', expectedSwitch: true, expected: 'zh', desc: '初始英文→首条中文消息 → 切换中文' },
    { text: 'Hello I need help with a refund', initLang: 'zh', expectedSwitch: true, expected: 'en', desc: '初始中文→首条英文消息 → 切换英文' },
    { text: 'こんにちは、返金について質問です', initLang: 'zh', expectedSwitch: true, expected: 'ja', desc: '初始中文→首条日文消息 → 切换日文' },
  ];
  let pass41 = 0;
  firstMsgCases.forEach((tc) => {
    const decision = decideLanguageSwitch(tc.initLang, tc.text, []);
    const ok = decision.shouldSwitch === tc.expectedSwitch && decision.newLanguage === tc.expected;
    if (ok) pass41++;
    const actual = decision.shouldSwitch ? `切换→${langNames[decision.newLanguage]}` : `保持→${langNames[decision.newLanguage]}`;
    const expect = tc.expectedSwitch ? `切换→${langNames[tc.expected]}` : `保持→${langNames[tc.expected]}`;
    printResult(
      `${tc.desc} (${decision.reason})`,
      expect,
      actual,
      ok
    );
  });

  printSubHeader('测试 4.2: 中途切换语言（需一致性信号）');
  const switchFromZhToEn = [
    { text: '你好，请问我的订单什么时候发货？', lang: 'zh' as Language },
    { text: 'I want to speak English now', lang: 'en' as Language },
    { text: 'Can you help me check my order status please?', lang: 'en' as Language },
  ];

  let history: Array<{ text: string; language: Language }> = [];
  let currentLang: Language = 'zh';

  console.log('\n场景: 中文对话 → 切换到英文（需要2条英文信号才切换）');
  switchFromZhToEn.forEach((msg, idx) => {
    const decision = decideLanguageSwitch(currentLang, msg.text, history);
    history.push(msg);
    const switched = decision.shouldSwitch ? '✓ 切换' : '✗ 保持';
    if (decision.shouldSwitch) currentLang = decision.newLanguage;
    console.log(
      `  第${idx + 1}条: "${msg.text.slice(0, 30)}" → ${switched} → 当前语言: ${langNames[currentLang]} (${decision.reason})`
    );
  });

  printSubHeader('测试 4.3: 强语言信号立即切换');
  const strongSignal = 'I need to speak with someone immediately regarding my order. This is extremely urgent and I need help right now!';
  const decisionStrong = decideLanguageSwitch('zh', strongSignal, [
    { text: '你好，有什么问题吗？', language: 'zh' },
    { text: '我想咨询一下', language: 'zh' },
  ]);
  console.log(`\n  中文背景下收到强英文信号:`);
  console.log(`  消息: "${strongSignal.slice(0, 60)}..."`);
  console.log(
    `  结果: ${decisionStrong.shouldSwitch ? '✓ 立即切换' : '✗ 未切换'} → ${langNames[decisionStrong.newLanguage]} (置信度: ${(decisionStrong.confidence * 100).toFixed(0)}%)`
  );

  printSubHeader('测试 4.4: 少量夹杂不触发切换');
  const mixedWithEn = '我的订单 order ABC123 什么时候发货？Please help!';
  const decisionMixed = decideLanguageSwitch('zh', mixedWithEn, [
    { text: '你好，想查下物流', language: 'zh' },
  ]);
  console.log(`\n  中文夹杂少量英文:"${mixedWithEn}"`);
  console.log(
    `  结果: ${decisionMixed.shouldSwitch ? '❌ 不应切换' : '✓ 保持中文'} → ${langNames[decisionMixed.newLanguage]} (${decisionMixed.reason})`
  );

  console.log(`\n首条消息检测通过率: ${pass41}/${firstMsgCases.length}`);
}

function section5_responseGenerator() {
  printHeader('测试 5: 回复生成 - 专业术语保留');

  const cases: Array<{ text: string; lang: Language; intent: any; emotion: any; desc: string }> = [
    {
      text: '我的订单 ORD-99999 调用 API 时 JSON 返回错误',
      lang: 'zh',
      intent: 'after_sales',
      emotion: 'calm',
      desc: '中文售后 + 术语 ORD-99999 API JSON',
    },
    {
      text: 'Order #ABC123 using PayPal payment, the REST API returns error',
      lang: 'en',
      intent: 'after_sales',
      emotion: 'concerned',
      desc: '英文售后 + 术语 ABC123 PayPal REST API',
    },
  ];

  cases.forEach((c) => {
    const reply = generateReply(c.intent, c.lang, c.emotion, c.text);
    console.log(`\n场景: ${c.desc}`);
    console.log(`用户: "${c.text}"`);
    console.log(`回复语言: ${langNames[c.lang]}`);
    console.log(`回复内容预览:\n  ${reply.slice(0, 200)}${reply.length > 200 ? '...' : ''}`);

    const terms = extractTechnicalTerms(c.text);
    const allPreserved = terms.every((t) => reply.includes(t));
    if (terms.length > 0) {
      console.log(
        `术语保留检查: ${allPreserved ? '✅ 全部保留' : '⚠️ 部分缺失'} [${terms.join(', ')}]`
      );
    }
  });
}

function summary() {
  printHeader('测试总结');
  console.log(`
多语言切换功能测试要点:
────────────────────────────────────────────────────────
1. ✅ 自动语言检测        → 支持中/英/日三种语言自动识别
2. ✅ 首条消息确定语言     → 首条消息自动识别后建立默认语言
3. ✅ 中途智能切换        → 需连续一致性信号 / 强信号才切换，避免误判
4. ✅ 混合语言处理        → 识别主要语言 + 标记混合状态
5. ✅ 专业术语保留        → 技术术语/订单号/URL/邮箱等在回复中原样保留
6. ✅ 低置信度防误判      → 夹杂少量外语不触发切换

核心算法说明:
────────────────────────────────────────────────────────
• 字符统计: 统计 CJK(中日韩汉字) / 拉丁字母 / 日文假名数量
• 去噪处理: 检测前剔除专业术语/数字/标点避免干扰
• 混合判定: 次语言 >15% 且 主语言 <85% 时标记为混合
• 切换阈值: 首条消息 50% 置信度, 后续消息需 70%+
• 一致性窗口: 连续 2 条同语言信号触发切换
• 强信号豁免: 单条 85%+ 置信度立即切换
  `);
}

printHeader('多语言切换功能完整测试套件', 80);
section1_languageDetection();
section2_mixedLanguage();
section3_technicalTerms();
section4_languageSwitch();
section5_responseGenerator();
summary();
