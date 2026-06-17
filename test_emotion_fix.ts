import { analyzeEmotion } from './src/services/emotionAnalyzer';

const testCases = [
  { text: '你好！', lang: 'zh', desc: '正常问候带一个感叹号' },
  { text: 'Hello!', lang: 'en', desc: '英文问候带一个感叹号' },
  { text: '请问你们产品质量怎么样？', lang: 'zh', desc: '正常咨询' },
  { text: '垃圾产品！', lang: 'zh', desc: '一个负面词+一个感叹号' },
  { text: '垃圾产品！！！', lang: 'zh', desc: '一个负面词+三个感叹号' },
  { text: '我要投诉你们！', lang: 'zh', desc: '直接投诉词' },
  { text: '太生气了！！！什么垃圾服务！！！气死我了！！！', lang: 'zh', desc: '重度愤怒多感叹号' },
  { text: '谢谢！', lang: 'zh', desc: '正面感谢+感叹号' },
  { text: '感谢！非常棒！', lang: 'zh', desc: '多个正面词+感叹号' },
  { text: '📦 查询物流信息', lang: 'zh', desc: '快速问题示例（带emoji）' },
];

console.log('=== 情绪分析修复验证 ===\n');

for (const tc of testCases) {
  const result = analyzeEmotion(tc.text, tc.lang);
  const score = result.score.toFixed(3);
  console.log(`【${tc.desc}】`);
  console.log(`  文本: "${tc.text}"`);
  console.log(`  情绪分: ${score} | 状态: ${result.state} | 等级: ${result.level}`);
  console.log(`  负面词: ${result.details.negativeWordCount} | 感叹号: ${result.details.exclamationCount} | 投诉词: ${result.details.directComplaintWords}`);
  console.log();
}
