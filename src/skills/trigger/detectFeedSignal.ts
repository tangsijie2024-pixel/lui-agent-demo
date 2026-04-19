import { Feed } from '../../types';

const RESTLESS_KEYWORDS = [
  '无聊', '好无聊', '想出去', '出去玩', '去哪', '去哪儿', '没事干', '闲着',
];
const TIRED_KEYWORDS = [
  '下班', '累了', '好累', '想放松', '解压', '透透气', '散散心',
];
const SOCIAL_KEYWORDS = [
  '找朋友', '约个', '一起', '周末', '出去吃', '出去喝',
];

export type FeedSignal = 'restless' | 'tired' | 'social' | 'neutral';

export function detectFeedSignal(query: string, feed: Feed): FeedSignal {
  const text = (query + ' ' + feed.recent_signals.join(' ')).toLowerCase();

  if (TIRED_KEYWORDS.some(k => text.includes(k))) return 'tired';
  if (SOCIAL_KEYWORDS.some(k => text.includes(k))) return 'social';
  if (RESTLESS_KEYWORDS.some(k => text.includes(k))) return 'restless';

  // Fall back to stored mood if keywords don't match
  if (feed.mood === 'restless' || feed.mood === 'tired' || feed.mood === 'social') {
    return feed.mood;
  }

  return 'neutral';
}
