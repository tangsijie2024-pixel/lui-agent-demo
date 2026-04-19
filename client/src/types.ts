export interface ParsedIntent {
  instant: string
  context: string
  deep: string
}

export interface RecommendationCard {
  vibe_text: string
  place_name: string
  area: string
  price: string
  opening: string
  insider_tip: string
  cta: string
}

export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

export type ChatResponse =
  | { state: 'exploring' | 'new_query'; intent_summary: ParsedIntent; cards: RecommendationCard[] }
  | { state: 'decided' | 'following_up'; message: string }

export interface ProactivePush {
  opening: string
  cards: RecommendationCard[]
}

export type ProactiveResponse =
  | { shouldPush: false }
  | { shouldPush: true; push: ProactivePush }
