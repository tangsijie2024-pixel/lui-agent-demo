import 'dotenv/config';
import { passiveResponse } from '../../src/agent/passiveResponse';
import { anthropic, MODEL } from '../../src/lib/anthropic';
import Anthropic from '@anthropic-ai/sdk';

interface EvalCase {
  id: string;
  userId: string;
  query: string;
}

interface DimensionScore {
  朋友感: number;
  命中度: number;
  语气自然度: number;
}

interface EvalResult {
  id: string;
  query: string;
  response_summary: string;
  scores: DimensionScore;
  avg: number;
  reasoning: string;
}

const EVAL_CASES: EvalCase[] = [
  { id: 'e01', userId: 'user_001', query: '今晚想找个安静的地方喝一杯' },
  { id: 'e02', userId: 'user_001', query: '下班了，不想回家，随便去哪喝点什么' },
  { id: 'e03', userId: 'user_001', query: '心情不太好，一个人想出去坐坐' },
  { id: 'e04', userId: 'user_002', query: '一个人，想找个低调的地方，不要太吵' },
  { id: 'e05', userId: 'user_001', query: '好久没出门了，今晚随便推荐个地方' },
  { id: 'e06', userId: 'user_001', query: '周六晚上，想找个有现场音乐的地方' },
  { id: 'e07', userId: 'user_002', query: '朋友说要去喝精酿，有推荐吗' },
  { id: 'e08', userId: 'user_001', query: '十一点了，哪里还开着' },
];

const SCORER_SYSTEM = `你是 LUI Agent 的回复质量评审官。
你要对 AI 助手的回复做三个维度的评分，每个维度 1-5 分，只返回 JSON。

评分维度：
- 朋友感（1-5）：回复是否像真正的朋友在聊天，有温度，不像机器人
- 命中度（1-5）：推荐是否贴合用户的实际需求和语境
- 语气自然度（1-5）：文案是否口语化自然，无文艺腔、鸡汤味、机器客服味

返回格式：
{
  "朋友感": <1-5>,
  "命中度": <1-5>,
  "语气自然度": <1-5>,
  "reasoning": "<一句简短的评语>"
}`;

function buildScorerPrompt(query: string, responseSummary: string): string {
  return `用户 query："${query}"

AI 回复内容：
${responseSummary}

请对以上回复打分。`;
}

function summarizeResponse(result: Awaited<ReturnType<typeof passiveResponse>>): string {
  if ('message' in result) return result.message;

  const { cards } = result;
  return cards
    .map(c => `【${c.place_name}】${c.vibe_text} / ${c.insider_tip} / CTA: ${c.cta}`)
    .join('\n');
}

async function scoreResponse(query: string, responseSummary: string): Promise<DimensionScore & { reasoning: string }> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 256,
    system: SCORER_SYSTEM,
    messages: [{ role: 'user', content: buildScorerPrompt(query, responseSummary) }],
  });

  const text = response.content
    .filter(b => b.type === 'text')
    .map(b => (b as Anthropic.TextBlock).text)
    .join('');

  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`Scorer returned no JSON: ${text}`);

  return JSON.parse(match[0]);
}

function avg(scores: DimensionScore): number {
  return +((scores['朋友感'] + scores['命中度'] + scores['语气自然度']) / 3).toFixed(2);
}

function bar(score: number): string {
  const filled = Math.round(score);
  return '█'.repeat(filled) + '░'.repeat(5 - filled);
}

async function runEval(c: EvalCase): Promise<EvalResult> {
  const result = await passiveResponse(c.userId, c.query, []);
  const summary = summarizeResponse(result);
  const scored = await scoreResponse(c.query, summary);

  return {
    id: c.id,
    query: c.query,
    response_summary: summary,
    scores: {
      朋友感: scored['朋友感'],
      命中度: scored['命中度'],
      语气自然度: scored['语气自然度'],
    },
    avg: avg(scored),
    reasoning: scored.reasoning,
  };
}

async function main() {
  console.log(`\n${'═'.repeat(60)}`);
  console.log('  LUI Agent — AI 质量评分报告');
  console.log(`${'═'.repeat(60)}\n`);

  const results: EvalResult[] = [];

  for (const c of EVAL_CASES) {
    process.stdout.write(`评测 [${c.id}] "${c.query.slice(0, 20)}..."  `);
    try {
      const r = await runEval(c);
      results.push(r);
      console.log(`avg ${r.avg.toFixed(1)}/5`);
    } catch (err) {
      console.log(`ERROR: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // ── 输出报告 ─────────────────────────────────────────────────────
  console.log(`\n${'─'.repeat(60)}`);
  console.log('  详细评分\n');

  for (const r of results) {
    console.log(`  [${r.id}] ${r.query}`);
    console.log(`  朋友感     ${bar(r.scores['朋友感'])}  ${r.scores['朋友感']}/5`);
    console.log(`  命中度     ${bar(r.scores['命中度'])}  ${r.scores['命中度']}/5`);
    console.log(`  语气自然度 ${bar(r.scores['语气自然度'])}  ${r.scores['语气自然度']}/5`);
    console.log(`  评语：${r.reasoning}`);
    console.log();
  }

  // ── 汇总 ─────────────────────────────────────────────────────────
  if (results.length > 0) {
    const totals = results.reduce(
      (acc, r) => ({
        朋友感: acc['朋友感'] + r.scores['朋友感'],
        命中度: acc['命中度'] + r.scores['命中度'],
        语气自然度: acc['语气自然度'] + r.scores['语气自然度'],
      }),
      { 朋友感: 0, 命中度: 0, 语气自然度: 0 }
    );
    const n = results.length;
    const overall = results.reduce((s, r) => s + r.avg, 0) / n;

    console.log(`${'─'.repeat(60)}`);
    console.log('  汇总\n');
    console.log(`  朋友感平均      ${(totals['朋友感'] / n).toFixed(2)} / 5`);
    console.log(`  命中度平均      ${(totals['命中度'] / n).toFixed(2)} / 5`);
    console.log(`  语气自然度平均  ${(totals['语气自然度'] / n).toFixed(2)} / 5`);
    console.log(`\n  综合得分        ${overall.toFixed(2)} / 5`);
  }

  console.log(`\n${'═'.repeat(60)}\n`);
}

main().catch(err => {
  console.error('Eval 异常:', err);
  process.exit(1);
});
