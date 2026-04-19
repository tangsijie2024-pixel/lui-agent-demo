import { getMemory } from './getMemory';
import { Schedule } from '../../types';

export function getSchedule(userId: string): Schedule {
  return getMemory(userId).schedule;
}
