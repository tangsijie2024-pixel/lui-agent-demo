import fs from 'fs';
import path from 'path';
import { Place, PassiveResponseResult, ConversationMessage } from '../types';
import { getMemory } from '../skills/memory/getMemory';
import { parseIntent } from '../skills/intent/parseIntent';
import { filterByProfile } from '../skills/recommendation/filterByProfile';
import { buildCard } from '../skills/recommendation/buildCard';
import { detectState } from '../skills/state/detectState';
import { respondDecided } from '../skills/state/respondDecided';
import { extractFeedSignals } from '../skills/memory/extractFeedSignals';
import { updateFeed } from '../skills/memory/updateMemory';

const PLACES_PATH = path.join(__dirname, '../data/places.json');

// Fire-and-forget: update feed without blocking the response
function refreshFeed(
  userId: string,
  messages: ConversationMessage[],
  decidedPlace?: string
): void {
  extractFeedSignals(messages)
    .then(signals => {
      const patch = decidedPlace
        ? { ...signals, last_visit: decidedPlace }
        : signals;
      updateFeed(userId, patch);
      console.log(`[feed] ${userId} updated → mood=${signals.mood}, signals=[${signals.recent_signals.join(', ')}]`);
    })
    .catch(err => console.error('[feed] update failed:', err));
}

export async function passiveResponse(
  userId: string,
  query: string,
  history: ConversationMessage[] = []
): Promise<PassiveResponseResult> {
  const memory = getMemory(userId);
  const messages: ConversationMessage[] = [...history, { role: 'user', content: query }];

  const { state, decided_place } = await detectState(messages);
  console.log(`[state] ${state}${decided_place ? ` → ${decided_place}` : ''}`);

  if ((state === 'decided' || state === 'following_up') && decided_place) {
    const message = await respondDecided(decided_place, messages, memory, state);
    refreshFeed(userId, messages, state === 'decided' ? decided_place : undefined);
    return { state, message };
  }

  const intent = await parseIntent(query, memory);
  const allPlaces: Place[] = JSON.parse(fs.readFileSync(PLACES_PATH, 'utf-8'));
  const filtered = filterByProfile(allPlaces, memory);
  const topTwo = filtered.slice(0, 2);
  const cards = await Promise.all(topTwo.map(place => buildCard(place, intent, memory)));

  refreshFeed(userId, messages);

  return {
    state: state === 'new_query' ? 'new_query' : 'exploring',
    intent_summary: intent,
    cards,
  };
}
