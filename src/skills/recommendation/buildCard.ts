import Anthropic from '@anthropic-ai/sdk';
import { Place, ParsedIntent, UserMemory, RecommendationCard } from '../../types';
import { anthropic, MODEL } from '../../lib/anthropic';
import { extractJson } from '../../lib/extractJson';
import { buildSystemPrompt } from '../../prompts/system';
import { buildCardPrompt } from '../../prompts/card';

export async function buildCard(
  place: Place,
  intent: ParsedIntent,
  memory: UserMemory
): Promise<RecommendationCard> {
  const stream = anthropic.messages.stream({
    model: MODEL,
    max_tokens: 300,
    system: buildSystemPrompt(memory),
    messages: [{ role: 'user', content: buildCardPrompt(place, intent) }],
  });

  const message = await stream.finalMessage();
  const text = message.content
    .filter(b => b.type === 'text')
    .map(b => (b as Anthropic.TextBlock).text)
    .join('');

  const { vibe_text, cta } = extractJson<{ vibe_text: string; cta: string }>(text, 'buildCard');

  return {
    vibe_text,
    place_name: place.name,
    area: place.area,
    price: `人均 ${place.price_per_person}`,
    opening: place.opening_hours,
    insider_tip: place.insider_tip,
    cta,
  };
}
