import { UserMemory } from '../types';
import { FeedSignal } from '../skills/trigger/detectFeedSignal';

const SIGNAL_CONTEXT: Record<FeedSignal, string> = {
  restless: '用户最近发出了无聊/想出去的信号',
  tired:    '用户刚下班，需要解压放松',
  social:   '用户有出去找朋友的意愿',
  neutral:  '用户可能需要一点出门的推动力',
};

export function buildProactiveOpeningPrompt(memory: UserMemory, signal: FeedSignal): string {
  const signalCtx = SIGNAL_CONTEXT[signal];
  const vibes = memory.lifestyle.vibes.slice(0, 3).join('、');
  const areas = memory.lifestyle.favorite_areas.join('、');

  return `你要主动给用户发一条消息，推荐今晚出去。

背景：
- ${signalCtx}
- 用户偏好：${vibes}
- 常去区域：${areas}
- 当前心情：${memory.feed.mood}

写一句破冰开场白，像老朋友发微信一样，自然地推他出门。
要求：
- 口语化，带点幽默，不要"您好"和感叹号堆砌
- 基于上面的背景，不能是通用模板
- 20字以内，一句话

只返回这句话，不要其他任何内容。`;
}

export function buildProactiveIntent(memory: UserMemory, signal: FeedSignal): {
  instant: string;
  context: string;
  deep: string;
} {
  const now = new Date();
  const hour = now.getHours();
  const timeCtx = hour >= 20 ? '深夜想出门' : hour >= 17 ? '傍晚下班后' : '下午空闲时';

  return {
    instant: `找个符合 ${memory.lifestyle.vibes[0] || '自己风格'} 的地方去`,
    context: `${timeCtx}，${signal === 'social' ? '想约朋友' : '可能一个人或两个人'}`,
    deep: memory.feed.recent_signals.join('，') || memory.feed.mood,
  };
}
