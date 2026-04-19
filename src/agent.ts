import { AgentCard, AgentResponse, Location, QueryRequest, UserProfile } from './types';
import { users } from './data';

const buildCard = (title: string, description: string, location: Location): AgentCard => ({
  title,
  description,
  location,
  actions: [
    { label: '查看详情', value: 'view_details' },
    { label: '导航前往', value: 'navigate' },
    { label: '保存活动', value: 'save_event' },
  ],
});

const simulatePoiSearch = (query: string, location: Location) => {
  const normalized = query.toLowerCase();
  if (normalized.includes('酒吧')) {
    return {
      title: '夜光酒吧',
      description: `在 ${location.label || '附近'} 的热门酒吧，适合朋友聚会和轻松小酌。`, 
      location: { ...location, label: '夜光酒吧' },
    };
  }
  if (normalized.includes('咖啡')) {
    return {
      title: '慢时光咖啡馆',
      description: `安静的文艺咖啡馆，适合下午休闲聊天。`,
      location: { ...location, label: '慢时光咖啡馆' },
    };
  }
  return {
    title: '热门推荐地点',
    description: `为你在 ${location.label || '附近'} 智能推荐了一处值得体验的地点。`, 
    location: { ...location, label: '推荐地点' },
  };
};

export const handlePassiveQuery = (request: QueryRequest): AgentResponse => {
  const poi = simulatePoiSearch(request.query, request.location);
  const message = `我已为你找到“${poi.title}”。这里比较适合你当前的需求，下面是一个快速信息卡片。`;
  return {
    userId: request.userId,
    mode: 'passive',
    message,
    card: buildCard(poi.title, poi.description, poi.location),
  };
};

const buildPushMessage = (profile: UserProfile): AgentResponse => {
  const topCategory = profile.preferences.favoriteCategories[0];
  const recommendations = [`${topCategory}探索路线`, '周末通勤轻旅行', '城市夜间活动推荐'];
  return {
    userId: profile.userId,
    mode: 'proactive',
    message: `根据你最近的偏好和浏览记录，我为你准备了三条行程建议：${recommendations.join('，')}。`, 
    recommendations,
  };
};

export const generateProactivePush = (userId: string): AgentResponse => {
  const profile = users[userId];
  if (!profile) {
    return {
      userId,
      mode: 'proactive',
      message: '未找到该用户，请先创建用户画像。',
      recommendations: [],
    };
  }
  return buildPushMessage(profile);
};
