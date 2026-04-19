export function extractJson<T>(text: string, context?: string): T {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`No JSON in response${context ? ` (${context})` : ''}: ${text}`);
  return JSON.parse(match[0]) as T;
}
