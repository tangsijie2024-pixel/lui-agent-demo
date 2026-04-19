import { getMemory } from './getMemory';
import { Feed } from '../../types';

export function getFeed(userId: string): Feed {
  return getMemory(userId).feed;
}
