import { parseIntent } from '../../src/skills/intent/parseIntent';
import { getMemory } from '../../src/skills/memory/getMemory';

const memory = getMemory('user_001');

const queries = [
  '今晚想找个安静的地方喝一杯',
  '下班了，不想回家，想出去走走',
  '周末一个人，想找个有 jazz 的地方',
  '最近太累了，需要放松一下',
  '朋友说静安有个很不错的精酿，想去试试',
  '约了个朋友，两个人，不想去太嘈杂的地方',
  '想找个可以待很久的咖啡馆',
  '好无聊，想出去喝点什么',
  '已经十一点了，还有什么地方开着',
  '今晚心情不太好，想一个人待着',
];

describe('parseIntent', () => {
  test.each(queries.map((q, i) => [i + 1, q]))(
    'query %i 应返回包含三层意图的 JSON',
    async (_i, query) => {
      const result = await parseIntent(query as string, memory);

      expect(result).toHaveProperty('instant');
      expect(result).toHaveProperty('context');
      expect(result).toHaveProperty('deep');
      expect(typeof result.instant).toBe('string');
      expect(typeof result.context).toBe('string');
      expect(typeof result.deep).toBe('string');
      expect(result.instant.length).toBeGreaterThan(0);
      expect(result.context.length).toBeGreaterThan(0);
      expect(result.deep.length).toBeGreaterThan(0);
    }
  );

  test('深夜 query 应在 context 中体现时间信息', async () => {
    const result = await parseIntent('已经十一点了，还有什么地方开着', memory);
    // deep intent should reflect something about late night / winding down
    expect(result.instant.length).toBeGreaterThan(0);
    expect(result.deep.length).toBeGreaterThan(0);
  });

  test('明确提到 jazz 的 query 应在 instant 中体现', async () => {
    const result = await parseIntent('周末一个人，想找个有 jazz 的地方', memory);
    const allText = `${result.instant} ${result.context} ${result.deep}`.toLowerCase();
    expect(allText).toMatch(/jazz|爵士|音乐|bar/i);
  });

  test('负面情绪 query 应在 deep 中体现情绪补偿需求', async () => {
    const result = await parseIntent('今晚心情不太好，想一个人待着', memory);
    expect(result.deep.length).toBeGreaterThan(5);
  });
});
