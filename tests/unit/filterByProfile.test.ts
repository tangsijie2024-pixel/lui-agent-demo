import { filterByProfile } from '../../src/skills/recommendation/filterByProfile';
import { Place, UserMemory } from '../../src/types';

// ── Fixtures ────────────────────────────────────────────────────────────────

const base: UserMemory = {
  userId: 'test',
  identity: { name: 'Test', city: '上海', age: 28 },
  lifestyle: { vibes: ['jazz', '暗光'], avoid: ['嘈杂'], favorite_areas: ['静安'] },
  consumption: { range_min: 100, range_max: 400, currency: 'CNY', sensitive: false },
  social: { type: 'ambivert', usual_group_size: 2, solo_comfort: true },
  schedule: { work_end: '19:30', free_days: ['Sat', 'Sun'], night_owl: true },
  feed: { recent_signals: [], last_visit: '', mood: 'neutral' },
  aspirations: { goals: [], avoid_routine: false },
};

const places: Place[] = [
  {
    id: 'p1', name: 'Jazz Lounge', category: 'jazz bar', area: '静安',
    price_per_person: 280, vibes: ['jazz', '暗光', '安静'],
    best_for: ['独处', '小聚', '深夜'], opening_hours: '18:00-02:00', insider_tip: 'tip',
  },
  {
    id: 'p2', name: '连锁酒吧', category: 'bar', area: '浦东',
    price_per_person: 150, vibes: ['嘈杂', '热闹'],
    best_for: ['社交'], opening_hours: '17:00-00:00', insider_tip: 'tip',
  },
  {
    id: 'p3', name: '精酿小馆', category: 'craft beer', area: '徐汇',
    price_per_person: 200, vibes: ['精酿', '低调'],
    best_for: ['小聚', '下班放松'], opening_hours: '15:00-23:00', insider_tip: 'tip',
  },
  {
    id: 'p4', name: '高端会所', category: 'club', area: '静安',
    price_per_person: 800, vibes: ['高端', '热闹'],
    best_for: ['社交'], opening_hours: '22:00-06:00', insider_tip: 'tip',
  },
  {
    id: 'p5', name: '路边摊', category: 'bar', area: '静安',
    price_per_person: 30, vibes: ['街头'],
    best_for: ['路过'], opening_hours: '18:00-00:00', insider_tip: 'tip',
  },
];

// ── Tests ────────────────────────────────────────────────────────────────────

describe('filterByProfile', () => {
  test('过滤掉超出价格范围的地点', () => {
    const result = filterByProfile(places, base);
    const prices = result.map(p => p.price_per_person);
    prices.forEach(price => {
      expect(price).toBeGreaterThanOrEqual(base.consumption.range_min);
      expect(price).toBeLessThanOrEqual(base.consumption.range_max);
    });
  });

  test('有 avoid 词的地点得分受到惩罚，不应排在首位', () => {
    const result = filterByProfile(places, base);
    if (result.length > 0) {
      expect(result[0].id).not.toBe('p2');
    }
  });

  test('匹配 vibe 的地点优先排在前面', () => {
    const result = filterByProfile(places, base);
    const jazzIndex = result.findIndex(p => p.id === 'p1');
    const craftIndex = result.findIndex(p => p.id === 'p3');
    if (jazzIndex !== -1 && craftIndex !== -1) {
      expect(jazzIndex).toBeLessThan(craftIndex);
    }
  });

  test('结果最多返回 3 个', () => {
    const result = filterByProfile(places, base);
    expect(result.length).toBeLessThanOrEqual(3);
  });

  test('预算敏感用户 + 较低上限 → 过滤掉高价地点', () => {
    const budgetUser: UserMemory = {
      ...base,
      consumption: { range_min: 50, range_max: 150, currency: 'CNY', sensitive: true },
    };
    const result = filterByProfile(places, budgetUser);
    result.forEach(p => expect(p.price_per_person).toBeLessThanOrEqual(150));
  });

  test('avoid 列表命中多次时地点被完全排除', () => {
    const strictUser: UserMemory = {
      ...base,
      lifestyle: { ...base.lifestyle, avoid: ['嘈杂', '热闹', '高端'] },
    };
    const result = filterByProfile(places, strictUser);
    const names = result.map(p => p.name);
    expect(names).not.toContain('连锁酒吧');
    expect(names).not.toContain('高端会所');
  });

  test('无匹配地点时返回空数组', () => {
    const noMatchUser: UserMemory = {
      ...base,
      consumption: { range_min: 1000, range_max: 2000, currency: 'CNY', sensitive: false },
    };
    const result = filterByProfile(places, noMatchUser);
    expect(result).toHaveLength(0);
  });

  test('收藏区域的地点在同等 vibe 下得分更高', () => {
    const mixedPlaces: Place[] = [
      {
        id: 'fav-area', name: '静安爵士', category: 'jazz bar', area: '静安',
        price_per_person: 250, vibes: ['jazz'],
        best_for: ['小聚'], opening_hours: '18:00-02:00', insider_tip: 'tip',
      },
      {
        id: 'other-area', name: '浦东爵士', category: 'jazz bar', area: '浦东',
        price_per_person: 250, vibes: ['jazz'],
        best_for: ['小聚'], opening_hours: '18:00-02:00', insider_tip: 'tip',
      },
    ];
    const result = filterByProfile(mixedPlaces, base);
    if (result.length >= 2) {
      expect(result[0].id).toBe('fav-area');
    }
  });
});
