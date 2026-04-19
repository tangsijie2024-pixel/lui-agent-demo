import { getMemory } from './getMemory';
import { Aspirations } from '../../types';

export function getAspirations(userId: string): Aspirations {
  return getMemory(userId).aspirations;
}
