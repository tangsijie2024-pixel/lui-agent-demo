import { getMemory } from './getMemory';
import { Lifestyle } from '../../types';

export function getLifestyle(userId: string): Lifestyle {
  return getMemory(userId).lifestyle;
}
