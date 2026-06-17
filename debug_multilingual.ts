import {
  detectLanguageDetailed,
  countLanguageChars,
  cleanTextForDetection,
  extractTechnicalTerms,
} from './src/services/multilingualService';

const testCases = [
  '我的订单 order #12345 一直没有收到，物流信息查不到',
  'I want to check my 订单 ORD-2024-001 status',
  '这个 API 接口返回的 JSON 数据有问题，请帮我看看',
  'Please help check my 注文番号 ABC999 配送状況',
  'SDKの使い方について質問ですが、REST APIの認証方法がわかりません',
];

console.log('===== 混合语言调试 =====\n');
testCases.forEach((text, i) => {
  console.log(`案例 ${i + 1}: "${text}"`);
  console.log(`  原始长度: ${text.length}`);

  const terms = extractTechnicalTerms(text);
  console.log(`  识别到的专业术语: [${terms.join(', ')}]`);

  const cleaned = cleanTextForDetection(text);
  console.log(`  清理后文本: "${cleaned}"`);
  console.log(`  清理后长度: ${cleaned.length}`);

  const counts = countLanguageChars(text);
  console.log(`  字符计数: ZH=${counts.zh}, EN=${counts.en}, JA=${counts.ja}, TOTAL=${counts.total}`);

  const result = detectLanguageDetailed(text);
  console.log(`  语言比例: ZH=${(result.languageRatios.zh*100).toFixed(0)}%, EN=${(result.languageRatios.en*100).toFixed(0)}%, JA=${(result.languageRatios.ja*100).toFixed(0)}%`);
  console.log(`  判定结果: language=${result.language}, isMixed=${result.isMixed}, primaryRatio=${(result.primaryRatio*100).toFixed(0)}%`);
  console.log();
});
