import { useReducer, useEffect } from 'react';
import type { PlanState, PlanAction } from '../types';
import { recalculateTimes } from '../utils/timeCalc';

const STORAGE_KEY = 'dtp_plan_state';

const initialState: PlanState = {
  plan: null,
  weather: null,
  isSurpriseMode: false,
  revealedSpotIds: [],
  alternativeSelections: [],
};

function planReducer(state: PlanState, action: PlanAction): PlanState {
  switch (action.type) {
    case 'SET_PLAN':
      return {
        ...state,
        plan: action.plan,
        isSurpriseMode: action.isSurpriseMode,
        revealedSpotIds: [],
        alternativeSelections: [],
      };

    case 'ADJUST_STAY_DURATION': {
      if (!state.plan) return state;
      const index = state.plan.spots.findIndex((s) => s.id === action.spotId);
      if (index === -1) return state;
      const spots = state.plan.spots.map((s, i) =>
        i === index ? { ...s, stayDuration: Math.max(15, s.stayDuration + action.deltaMinutes) } : s
      );
      // 後続時刻を再計算（revealAt は spots から導出されるため自動的に追従する）
      return { ...state, plan: { ...state.plan, spots: recalculateTimes(spots, index) } };
    }

    case 'TOGGLE_ALTERNATIVE': {
      const existing = state.alternativeSelections.find((s) => s.spotId === action.spotId);
      const selections = existing
        ? state.alternativeSelections.map((s) =>
            s.spotId === action.spotId ? { ...s, useAlternative: !s.useAlternative } : s
          )
        : [...state.alternativeSelections, { spotId: action.spotId, useAlternative: true }];
      return { ...state, alternativeSelections: selections };
    }

    case 'REVEAL_SPOT':
      if (state.revealedSpotIds.includes(action.spotId)) return state;
      return { ...state, revealedSpotIds: [...state.revealedSpotIds, action.spotId] };

    case 'REVEAL_ALL':
      return {
        ...state,
        revealedSpotIds: state.plan ? state.plan.spots.map((s) => s.id) : [],
      };

    case 'SET_WEATHER':
      return { ...state, weather: action.weather };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

function loadState(): PlanState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return { ...initialState, ...JSON.parse(saved) };
  } catch { /* ignore */ }
  return initialState;
}

export function usePlanState() {
  const [state, dispatch] = useReducer(planReducer, undefined, loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch { /* ignore */ }
  }, [state]);

  return { state, dispatch };
}
