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
