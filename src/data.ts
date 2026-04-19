import { UserProfile } from './types';

export const users: Record<string, UserProfile> = {
  'user-1': {
    userId: 'user-1',
    name: '小李',
    preferences: {
      favoriteCategories: ['酒吧', '美食', '文艺活动'],
      travelStyle: '周末短途出游',
    },
    history: [
      {
        event: '访问了三里屯附近的小酒馆',
        timestamp: '2026-04-10T20:30:00.000Z',
        location: { lat: 39.9255, lng: 116.4553, label: '三里屯' },
      },
      {
        event: '查看了故宫门票',
        timestamp: '2026-04-12T16:10:00.000Z',
        location: { lat: 39.9163, lng: 116.3972, label: '故宫' },
      },
      {
        event: '预订了热门音乐酒吧',
        timestamp: '2026-04-14T19:00:00.000Z',
        location: { lat: 39.9335, lng: 116.4295, label: '后海' },
      },
    ],
  },
};
