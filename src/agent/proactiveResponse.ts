import fs from 'fs';
import path from 'path';
import { Place, ProactiveResponse } from '../types';
import { getMemory } from '../skills/memory/getMemory';
import { shouldProactivelyPush } from '../skills/trigger/shouldProactivelyPush';
import { filterByProfile } from '../skills/recommendation/filterByProfile';
import { buildCard } from '../skills/recommendation/buildCard';
import { generateOpening } from '../skills/proactive/generateOpening';
import { buildProactiveIntent } from '../prompts/proactive';
import { updateFeed } from '../skills/memory/updateMemory';

const PLACES_PATH = path.join(__dirname, '../data/places.json');

export async function proactiveResponse(userId: string): Promise<ProactiveResponse> {
  const memory = getMemory(userId);
  const { shouldPush, signal, reason } = shouldProactivelyPush(memory);

  console.log(`[proactive] ${userId} → shouldPush=${shouldPush} (${reason})`);

  if (!shouldPush) return { shouldPush: false };

  const allPlaces: Place[] = JSON.parse(fs.readFileSync(PLACES_PATH, 'utf-8'));
  const filtered = filterByProfile(allPlaces, memory);
  const topTwo = filtered.slice(0, 2);
  const intent = buildProactiveIntent(memory, signal);

  const [opening, ...cards] = await Promise.all([
    generateOpening(memory, signal),
    ...topTwo.map(place => buildCard(place, intent, memory)),
  ]);

  // Record push time to enforce cooldown on subsequent polls
  updateFeed(userId, { last_push_time: new Date().toISOString() });
  console.log(`[proactive] ${userId} push sent, cooldown started`);

  return { shouldPush: true, push: { opening, cards } };
}
