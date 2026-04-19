import fs from 'fs';
import path from 'path';
import { UserMemory } from '../../types';

const DATA_PATH = path.join(__dirname, '../../data/users.json');

export function getMemory(userId: string): UserMemory {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  const users: UserMemory[] = JSON.parse(raw);
  const user = users.find(u => u.userId === userId);
  if (!user) throw new Error(`User ${userId} not found`);
  return user;
}
