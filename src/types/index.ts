export type CompanionType = 'solo' | 'friends' | 'couple' | 'family';
export type TransportType = 'car' | 'public' | 'bicycle';
export type SpotCategory = 'food' | 'shopping' | 'onsen' | 'movie' | 'sports' | 'sightseeing' | 'other';
export type Step = 1 | 2 | 3 | 4;

export interface FormData {
  date: string;
  startTime: string;
  endTime: string;
  startLocation: string;
  startLocationCoords?: { lat: number; lng: number };
  transport: TransportType;
  companionType: CompanionType;
  memberCount: number;
  childAges: number[];
  hasYoungChild: boolean;
  moodThemes: string[];
  purposeThemes: string[];
  budget: { food: number; transport: number; admission: number };
  dislikedFoods: string[];
  allergies: string[];
  isSurpriseMode: boolean;
}

export interface Spot {
  id: string;
  name: string;
  category: SpotCategory;
  address: string;
  arrivalTime: string;
  departureTime: string;
  stayDuration: number;
  travelTimeToNext: number;
  estimatedCost: { food: number; transport: number; admission: number };
  allergyNote: boolean;
  allergyDetail?: string;
  description: string;
  trendReason: string;
  areaLabel?: string;
  hint?: string;
  alternative?: {
    name: string;
    estimatedCost: { food: number; transport: number; admission: number };
    description: string;
  };
}

export interface Plan {
  planTitle: string;
  totalBudgetEstimate: { food: number; transport: number; admission: number };
  budgetOver: boolean;
  spots: Spot[];
}

// ===== Phase 2 =====

export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy';

export interface WeatherInfo {
  date: string;
  weatherCode: number;
  weatherLabel: string;
  maxTemp: number;
  precipitationProb: number;
  windSpeed: number;
  condition: WeatherCondition;
}

export interface SpotSelection {
  spotId: string;
  useAlternative: boolean;
}

export interface SpotWithReveal extends Spot {
  revealAt: string;
  isRevealed: boolean;
}

export interface PlanState {
  plan: Plan | null;
  weather: WeatherInfo | null;
  isSurpriseMode: boolean;
  revealedSpotIds: string[];
  alternativeSelections: SpotSelection[];
}

export type PlanAction =
  | { type: 'SET_PLAN'; plan: Plan; isSurpriseMode: boolean }
  | { type: 'ADJUST_STAY_DURATION'; spotId: string; deltaMinutes: number }
  | { type: 'TOGGLE_ALTERNATIVE'; spotId: string }
  | { type: 'REVEAL_SPOT'; spotId: string }
  | { type: 'REVEAL_ALL' }
  | { type: 'SET_WEATHER'; weather: WeatherInfo | null }
  | { type: 'RESET' };
