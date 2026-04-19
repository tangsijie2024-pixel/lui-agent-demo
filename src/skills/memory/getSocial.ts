import { getMemory } from './getMemory';
import { Social } from '../../types';

export function getSocial(userId: string): Social {
  return getMemory(userId).social;
}
