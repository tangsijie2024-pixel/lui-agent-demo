import { getMemory } from './getMemory';
import { Consumption } from '../../types';

export function getConsumption(userId: string): Consumption {
  return getMemory(userId).consumption;
}
