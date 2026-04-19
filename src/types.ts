// ── LUI Agent Types ──────────────────────────────────────────────

export interface UserIdentity {
  name: string;
  city: string;
  age: number;
}

export interface Lifestyle {
  vibes: string[];
  avoid: string[];
  favorite_areas: string[];
}

export interface Consumption {
  range_min: number;
  range_max: number;
  currency: string;
  sensitive: boolean;
}

export interface Social {
  type: 'introvert' | 'extrovert' | 'ambivert';
  usual_group_size: number;
  solo_comfort: boolean;
}

export interface Schedule {
  work_end: string;
  free_days: string[];
  night_owl: boolean;
}

export interface Feed {
  recent_signals: string[];
  last_visit: string;
  mood: string;
  last_activity_time: string | null;
  last_push_time: string | null;
}

export interface Aspirations {
  goals: string[];
  avoid_routine: boolean;
}

export interface UserMemory {
  userId: string;
  identity: UserIdentity;
  lifestyle: Lifestyle;
  consumption: Consumption;
  social: Social;
  schedule: Schedule;
  feed: Feed;
  aspirations: Aspirations;
}

export interface Place {
  id: string;
  name: string;
  category: string;
  area: string;
  price_per_person: number;
  vibes: string[];
  best_for: string[];
  opening_hours: string;
  insider_tip: string;
}

export interface ParsedIntent {
  instant: string;
  context: string;
  deep: string;
}

export interface RecommendationCard {
  vibe_text: string;
  place_name: string;
  area: string;
  price: string;
  opening: string;
  insider_tip: string;
  cta: string;
}

export type ConversationState = 'exploring' | 'decided' | 'following_up' | 'new_query';

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type PassiveResponseResult =
  | { state: 'exploring' | 'new_query'; intent_summary: ParsedIntent; cards: RecommendationCard[] }
  | { state: 'decided' | 'following_up'; message: string };

export interface ProactivePush {
  opening: string;
  cards: RecommendationCard[];
}

export type ProactiveResponse =
  | { shouldPush: false }
  | { shouldPush: true; push: ProactivePush };

// ── Legacy Types ──────────────────────────────────────────────────

export interface Location {
  lat: number;
  lng: number;
  label?: string;
}

export interface QueryRequest {
  userId: string;
  location: Location;
  query: string;
}

export interface AgentCard {
  title: string;
  description: string;
  location: Location;
  actions: Array<{ label: string; value: string }>;
}

export interface AgentResponse {
  userId: string;
  mode: 'passive' | 'proactive';
  message: string;
  card?: AgentCard;
  recommendations?: string[];
}

export interface UserProfile {
  userId: string;
  name: string;
  preferences: {
    favoriteCategories: string[];
    travelStyle: string;
  };
  history: Array<{ event: string; timestamp: string; location: Location }>;  
}
