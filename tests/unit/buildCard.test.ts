import { buildCard } from '../../src/skills/recommendation/buildCard';
import { getMemory } from '../../src/skills/memory/getMemory';
import { Place, ParsedIntent } from '../../src/types';

const memory = getMemory('user_001');

const intent: ParsedIntent = {
  instant: '想找一个安静的酒吧喝一杯',
  context: '周五晚上，下班后，一个人',
  deep: '需要一个可以放空的空间，不被打扰，缓解一周的疲劳',
};

const places: Place[] = [
  {
    id: 'place_001',
    name: 'Constellation Bar',
    category: 'jazz bar',
    area: '静安',
    price_per_person: 280,
    vibes: ['jazz', '暗光', '安静', '复古'],
    best_for: ['独处', '小聚', '深夜'],
    opening_hours: '18:00-02:00',
    insider_tip: '周五有现场爵士乐队，吧台位不需要预订',
  },
  {
    id: 'place_005',
    name: 'Volar',
    category: 'jazz bar',
    area: '徐汇',
    price_per_person: 320,
    vibes: ['jazz', '高端', '暗光', '沉浸'],
    best_for: ['约会', '小聚', '深夜'],
    opening_hours: '20:00-03:00',
    insider_tip: '周六有爵士quartet演出，建议提前预约',
  },
];

const REQUIRED_FIELDS = [
  'vibe_text', 'place_name', 'area', 'price', 'opening', 'insider_tip', 'cta',
] as const;

describe('buildCard', () => {
  test.each(places.map(p => [p.name, p]))(
    '%s → 卡片包含所有必要字段',
    async (_name, place) => {
      const card = await buildCard(place as Place, intent, memory);
      REQUIRED_FIELDS.forEach(field => {
        expect(card).toHaveProperty(field);
        expect(typeof card[field]).toBe('string');
        expect(card[field].length).toBeGreaterThan(0);
      });
    }
  );

  test('place_name 与输入地点名称一致', async () => {
    const card = await buildCard(places[0], intent, memory);
    expect(card.place_name).toBe(places[0].name);
  });

  test('area 与输入一致', async () => {
    const card = await buildCard(places[0], intent, memory);
    expect(card.area).toBe(places[0].area);
  });

  test('price 包含人均金额信息', async () => {
    const card = await buildCard(places[0], intent, memory);
    expect(card.price).toContain(String(places[0].price_per_person));
  });

  test('opening 与原始数据一致', async () => {
    const card = await buildCard(places[0], intent, memory);
    expect(card.opening).toBe(places[0].opening_hours);
  });

  test('insider_tip 与原始数据一致', async () => {
    const card = await buildCard(places[0], intent, memory);
    expect(card.insider_tip).toBe(places[0].insider_tip);
  });

  test('vibe_text 为 AI 生成的非空字符串', async () => {
    const card = await buildCard(places[0], intent, memory);
    expect(card.vibe_text.length).toBeGreaterThan(3);
  });

  test('cta 为 AI 生成的非空字符串', async () => {
    const card = await buildCard(places[0], intent, memory);
    expect(card.cta.length).toBeGreaterThan(3);
  });
});
