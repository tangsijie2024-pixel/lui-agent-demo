import Anthropic from '@anthropic-ai/sdk';
import { ConversationMessage } from '../../types';
import { anthropic, MODEL } from '../../lib/anthropic';
import { extractJson } from '../../lib/extractJson';
import { FEED_EXTRACT_SYSTEM, buildFeedExtractPrompt } from '../../prompts/feedExtract';

export interface ExtractedFeed {
  recent_signals: string[];
  mood: string;
  last_activity_time: string;
}

export async function extractFeedSignals(
  messages: ConversationMessage[]
): Promise<ExtractedFeed> {
  const userMessages = messages.filter(m => m.role === 'user');
  if (userMessages.length === 0) {
    return { recent_signals: [], mood: 'neutral', last_activity_time: new Date().toISOString() };
  }

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 256,
    system: FEED_EXTRACT_SYSTEM,
    messages: [{ role: 'user', content: buildFeedExtractPrompt(messages) }],
  });

  const text = response.content
    .filter(b => b.type === 'text')
    .map(b => (b as Anthropic.TextBlock).text)
    .join('');

  const parsed = extractJson<{ recent_signals: string[]; mood: string }>(text, 'extractFeedSignals');

  return {
    recent_signals: parsed.recent_signals,
    mood: parsed.mood,
    last_activity_time: new Date().toISOString(),
  };
}
