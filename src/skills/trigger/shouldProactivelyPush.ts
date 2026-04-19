import { UserMemory } from '../../types';
import { detectFeedSignal, FeedSignal } from './detectFeedSignal';

const PUSH_COOLDOWN_HOURS = 24;

export interface PushDecision {
  shouldPush: boolean;
  signal: FeedSignal;
  reason: string;
}

function isGoldenHour(): boolean {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  return (day === 5 || day === 6) && hour >= 19 && hour < 22;
}

function isWithinCooldown(lastPushTime: string | null): boolean {
  if (!lastPushTime) return false;
  const elapsed = (Date.now() - new Date(lastPushTime).getTime()) / 3_600_000;
  return elapsed < PUSH_COOLDOWN_HOURS;
}

export function shouldProactivelyPush(memory: UserMemory): PushDecision {
  if (isWithinCooldown(memory.feed.last_push_time)) {
    return { shouldPush: false, signal: 'neutral', reason: `距上次推送不足 ${PUSH_COOLDOWN_HOURS} 小时` };
  }

  const signal = detectFeedSignal('', memory.feed);

  if (signal === 'restless') {
    return { shouldPush: true, signal, reason: 'feed 包含无聊/想出去信号' };
  }

  if (signal === 'tired') {
    return { shouldPush: true, signal, reason: 'feed 包含下班/解压信号' };
  }

  if (signal === 'social' && isGoldenHour()) {
    return { shouldPush: true, signal, reason: '周五/六黄金时段 + 社交信号' };
  }

  if (signal === 'neutral' && isGoldenHour() && memory.feed.mood !== 'neutral') {
    return { shouldPush: true, signal: 'neutral', reason: '黄金时段 + mood 非 neutral' };
  }

  return { shouldPush: false, signal, reason: '未满足触发条件' };
}
