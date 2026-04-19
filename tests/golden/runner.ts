import 'dotenv/config';
import cases from './cases.json';
import { passiveResponse } from '../../src/agent/passiveResponse';
import { ConversationMessage } from '../../src/types';

interface GoldenCase {
  id: string;
  userId: string;
  query: string;
  history: ConversationMessage[];
  expect: {
    state: string;
    card_count: number;
    vibe_keywords?: string[];
  };
}

interface CaseResult {
  id: string;
  query: string;
  passed: boolean;
  failures: string[];
  state: string;
  card_count: number;
}

async function runCase(c: GoldenCase): Promise<CaseResult> {
  const failures: string[] = [];

  let result;
  try {
    result = await passiveResponse(c.userId, c.query, c.history);
  } catch (err) {
    return {
      id: c.id, query: c.query, passed: false,
      failures: [`API 错误: ${err instanceof Error ? err.message : String(err)}`],
      state: 'error', card_count: 0,
    };
  }

  // Check state
  if (result.state !== c.expect.state) {
    failures.push(`state: 期望 "${c.expect.state}"，实际 "${result.state}"`);
  }

  // Check card count
  const card_count = 'cards' in result ? result.cards.length : 0;
  if (c.expect.card_count > 0 && card_count !== c.expect.card_count) {
    failures.push(`card_count: 期望 ${c.expect.card_count}，实际 ${card_count}`);
  }
  if (c.expect.card_count === 0 && card_count > 0) {
    failures.push(`card_count: 期望 0 张卡片，实际返回了 ${card_count} 张`);
  }

  // Check vibe keywords (soft check — any card field contains keyword)
  if (c.expect.vibe_keywords?.length && 'cards' in result) {
    const allText = result.cards
      .map(card => `${card.vibe_text} ${card.insider_tip} ${card.cta}`)
      .join(' ')
      .toLowerCase();
    const missingKeywords = c.expect.vibe_keywords.filter(kw => !allText.includes(kw.toLowerCase()));
    if (missingKeywords.length > 0) {
      failures.push(`vibe_keywords 未命中: [${missingKeywords.join(', ')}]`);
    }
  }

  return {
    id: c.id, query: c.query,
    passed: failures.length === 0,
    failures, state: result.state, card_count,
  };
}

async function main() {
  console.log(`\n${'─'.repeat(60)}`);
  console.log('  LUI Golden Set Runner');
  console.log(`${'─'.repeat(60)}\n`);

  const results: CaseResult[] = [];
  const concurrency = 3;

  for (let i = 0; i < (cases as GoldenCase[]).length; i += concurrency) {
    const batch = (cases as GoldenCase[]).slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(runCase));
    results.push(...batchResults);
    batchResults.forEach(r => {
      const icon = r.passed ? '✅' : '❌';
      console.log(`${icon} [${r.id}] "${r.query.slice(0, 25)}..."`);
      if (!r.passed) {
        r.failures.forEach(f => console.log(`      └─ ${f}`));
      }
    });
  }

  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const rate = ((passed / total) * 100).toFixed(1);

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  通过率: ${passed}/${total}  (${rate}%)`);

  const failed = results.filter(r => !r.passed);
  if (failed.length > 0) {
    console.log(`\n  失败用例:`);
    failed.forEach(r => {
      console.log(`  • [${r.id}] ${r.query}`);
      r.failures.forEach(f => console.log(`    - ${f}`));
    });
  }

  console.log(`${'─'.repeat(60)}\n`);
  process.exit(passed === total ? 0 : 1);
}

main().catch(err => {
  console.error('Runner 异常:', err);
  process.exit(1);
});
