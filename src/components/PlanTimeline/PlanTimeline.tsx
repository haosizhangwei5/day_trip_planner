import { useState, useEffect, useRef, useCallback, type Dispatch } from 'react';
import type { FormData, Plan, PlanAction, PlanState, Spot } from '../../types';
import { isOverTime, withRevealTimes } from '../../utils/timeCalc';
import { useSurpriseReveal, notifyReveal } from '../../hooks/useSurpriseReveal';
import { SpotCard } from './SpotCard';
import { SurpriseCard } from '../SurpriseCard/SurpriseCard';
import { TravelSegment } from './TravelSegment';
import { BudgetSummary } from './BudgetSummary';
import { WeatherBanner } from '../WeatherBanner/WeatherBanner';

interface Props {
  state: PlanState;
  dispatch: Dispatch<PlanAction>;
  plan: Plan;
  formData: FormData;
  onRegenerate: () => void;
  onReset: () => void;
}

/** 代替案採用を反映した実効コストで予算を集計する */
function effectiveBudget(spots: Spot[], selections: PlanState['alternativeSelections']) {
  return spots.reduce(
    (acc, s) => {
      const useAlt = selections.find((sel) => sel.spotId === s.id)?.useAlternative && s.alternative;
      const cost = useAlt ? s.alternative!.estimatedCost : s.estimatedCost;
      return {
        food: acc.food + (cost.food ?? 0),
        transport: acc.transport + (cost.transport ?? 0),
        admission: acc.admission + (cost.admission ?? 0),
      };
    },
    { food: 0, transport: 0, admission: 0 }
  );
}

function isWithinBudget(est: { food: number; transport: number; admission: number }, limit: FormData['budget']) {
  return est.food <= limit.food && est.transport <= limit.transport && est.admission <= limit.admission;
}

export function PlanTimeline({ state, dispatch, plan, formData, onRegenerate, onReset }: Props) {
  const [justRevealedIds, setJustRevealedIds] = useState<string[]>([]);
  const [showToast, setShowToast] = useState(false);
  const prevWithinBudget = useRef<boolean | null>(null);

  const spots = plan.spots;
  const spotsWithReveal = withRevealTimes(spots, formData.startTime, state.revealedSpotIds);

  const handleReveal = useCallback(
    (spotId: string) => {
      dispatch({ type: 'REVEAL_SPOT', spotId });
      setJustRevealedIds((ids) => [...ids, spotId]);
      setTimeout(() => setJustRevealedIds((ids) => ids.filter((id) => id !== spotId)), 3000);

      const idx = spots.findIndex((s) => s.id === spotId);
      if (idx !== -1) {
        const travelMins = idx === 0 ? 0 : spots[idx - 1].travelTimeToNext;
        notifyReveal(spots[idx].name, travelMins);
      }
    },
    [dispatch, spots]
  );

  useSurpriseReveal(state.isSurpriseMode, spotsWithReveal, formData.date, handleReveal);

  const actualBudget = effectiveBudget(spots, state.alternativeSelections);
  const overTime = spots.length > 0 && isOverTime(spots, formData.endTime);

  // 全カテゴリ予算内に収まった瞬間にトーストを表示する
  const withinBudget = isWithinBudget(actualBudget, formData.budget);
  useEffect(() => {
    if (prevWithinBudget.current === false && withinBudget) {
      setShowToast(true);
      const t = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(t);
    }
    prevWithinBudget.current = withinBudget;
  }, [withinBudget]);

  function isAltSelected(spotId: string) {
    return state.alternativeSelections.find((s) => s.spotId === spotId)?.useAlternative ?? false;
  }

  return (
    <div className="space-y-4 relative">
      {/* Toast */}
      {showToast && (
        <div className="toast-in fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-5 py-3 rounded-2xl shadow-lg font-bold text-sm whitespace-nowrap">
          ✅ 予算内に収まりました！
        </div>
      )}

      {/* Plan header */}
      <div className="bg-gradient-to-r from-[#1a2744] to-[#243460] rounded-2xl p-5 text-white">
        <p className="text-orange-300 text-xs font-semibold uppercase tracking-wider mb-1">
          {state.isSurpriseMode ? '🎲 サプライズプラン' : '🗺️ 今日のプラン'}
        </p>
        <h2 className="text-xl font-bold leading-tight">
          {state.isSurpriseMode && state.revealedSpotIds.length < spots.length
            ? 'お楽しみツアー 🎁'
            : plan.planTitle}
        </h2>
        <div className="flex gap-4 mt-3 text-sm text-blue-200">
          <span>📅 {formData.date}</span>
          <span>🕐 {formData.startTime} 〜 {formData.endTime}</span>
        </div>
        {state.isSurpriseMode && (
          <p className="mt-2 text-xs text-purple-200">
            🔓 {state.revealedSpotIds.length} / {spots.length} スポット公開済み
          </p>
        )}
        {overTime && (
          <div className="mt-3 bg-red-500/20 border border-red-400/50 rounded-xl px-3 py-2">
            <p className="text-red-200 text-xs font-semibold">
              ⚠️ 予定終了時刻を超えています。滞在時間を調整してください。
            </p>
          </div>
        )}
      </div>

      {/* Weather banner */}
      <WeatherBanner weather={state.weather} loading={false} failed={false} />

      {/* Budget summary */}
      <BudgetSummary estimated={actualBudget} limit={formData.budget} />

      {/* Dev-only reveal all */}
      {import.meta.env.DEV && state.isSurpriseMode && state.revealedSpotIds.length < spots.length && (
        <button
          type="button"
          onClick={() => dispatch({ type: 'REVEAL_ALL' })}
          className="w-full py-2 rounded-xl border-2 border-dashed border-purple-300 text-purple-500 text-xs font-bold hover:bg-purple-50 transition-colors"
        >
          🛠️ [DEV] 全スポットを公開する
        </button>
      )}

      {/* Timeline */}
      <div className="space-y-0">
        {/* Start marker */}
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 flex flex-col items-center">
            <div className="w-4 h-4 rounded-full bg-orange-500 ring-4 ring-orange-100" />
          </div>
          <div className="text-sm font-bold text-[#1a2744]">
            {formData.startTime} 出発 📍 {formData.startLocation}
          </div>
        </div>

        {spotsWithReveal.map((spot, i) => {
          const hidden = state.isSurpriseMode && !spot.isRevealed;
          return (
            <div key={spot.id} className="flex gap-3">
              {/* Timeline rail */}
              <div className="w-8 flex flex-col items-center flex-shrink-0">
                <div className="w-0.5 flex-1 bg-orange-200" />
                <div className={`w-3 h-3 rounded-full my-1 flex-shrink-0 ${hidden ? 'bg-purple-400' : 'bg-orange-400'}`} />
                {i < spots.length - 1 && <div className="w-0.5 flex-1 bg-orange-200" />}
              </div>

              <div className="flex-1 pb-2 min-w-0">
                {hidden ? (
                  <SurpriseCard spot={spot} />
                ) : (
                  <SpotCard
                    spot={spot}
                    useAlternative={isAltSelected(spot.id)}
                    onToggleAlternative={() => dispatch({ type: 'TOGGLE_ALTERNATIVE', spotId: spot.id })}
                    onAdjust={(delta) => dispatch({ type: 'ADJUST_STAY_DURATION', spotId: spot.id, deltaMinutes: delta })}
                    isOverTime={overTime && i === spots.length - 1}
                    isBudgetOver={!withinBudget}
                    justRevealed={justRevealedIds.includes(spot.id)}
                  />
                )}
                {i < spots.length - 1 && spot.travelTimeToNext > 0 && (
                  <TravelSegment minutes={spot.travelTimeToNext} transport={formData.transport} />
                )}
              </div>
            </div>
          );
        })}

        {/* End marker */}
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 flex flex-col items-center">
            <div className="w-0.5 h-4 bg-orange-200" />
            <div className="w-4 h-4 rounded-full bg-[#1a2744] ring-4 ring-blue-100" />
          </div>
          <div className="text-sm font-bold text-[#1a2744]">
            {spots.length > 0 ? spots[spots.length - 1].departureTime : formData.endTime} 解散 🏁
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2 pb-6">
        <button
          type="button"
          onClick={onReset}
          className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 active:scale-95 transition-all"
        >
          🔄 最初から
        </button>
        <button
          type="button"
          onClick={onRegenerate}
          className="flex-[2] py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-400 text-white font-bold text-sm shadow-lg hover:from-orange-600 hover:to-orange-500 active:scale-95 transition-all"
        >
          ✨ 別のプランを提案
        </button>
      </div>
    </div>
  );
}
