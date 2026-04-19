import fs from 'fs';
import path from 'path';
import { UserMemory, Feed } from '../../types';

const DATA_PATH = path.join(__dirname, '../../data/users.json');

function readUsers(): UserMemory[] {
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
}

function writeUsers(users: UserMemory[]): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(users, null, 2), 'utf-8');
}

export function updateMemory(
  userId: string,
  field: keyof Omit<UserMemory, 'userId' | 'identity'>,
  value: unknown
): void {
  const users = readUsers();
  const idx = users.findIndex(u => u.userId === userId);
  if (idx === -1) throw new Error(`User ${userId} not found`);

  (users[idx] as unknown as Record<string, unknown>)[field] = value;
  writeUsers(users);
}

export function updateFeed(userId: string, patch: Partial<Feed>): void {
  const users = readUsers();
  const idx = users.findIndex(u => u.userId === userId);
  if (idx === -1) throw new Error(`User ${userId} not found`);

  users[idx].feed = { ...users[idx].feed, ...patch };
  writeUsers(users);
}
