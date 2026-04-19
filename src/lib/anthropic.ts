import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';

export const MODEL = 'claude-sonnet-4-6-thinking';

export const anthropic = new Anthropic({
  baseURL: 'https://aiapi.world',
  apiKey: process.env.GLM_API_KEY,
});
