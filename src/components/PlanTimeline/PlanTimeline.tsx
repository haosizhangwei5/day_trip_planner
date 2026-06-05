import { useState } from 'react';
import type { Plan, FormData } from '../../types';
import { recalculateTimes, isOverTime, totalBudget } from '../../utils/timeCalc';
import { SpotCard } from './SpotCard';
import { TravelSegment } from './TravelSegment';
import { BudgetSummary } from './BudgetSummary';

interface Props {
  plan: Plan;
  formData: FormData;
  onRegenerate: () => void;
  onReset: () => void;
}

export function PlanTimeline({ plan, formData, onRegenerate, onReset }: Props) {
  const [spots, setSpots] = useState(plan.spots);

  function handleAdjust(index: number, delta: number) {
    const updated = spots.map((s, i) =>
      i === index ? { ...s, stayDuration: Math.max(15, s.stayDuration + delta) } : s
    );
    setSpots(recalculateTimes(updated, index));
  }

  const overTime = spots.length > 0 && isOverTime(spots, formData.endTime);
  const actualBudget = totalBudget(spots);

  return (
    <div className="space-y-4">
      {/* Plan header */}
      <div className="bg-gradient-to-r from-[#1a2744] to-[#243460] rounded-2xl p-5 text-white">
        <p className="text-orange-300 text-xs font-semibold uppercase tracking-wider mb-1">🗺️ 今日のプラン</p>
        <h2 className="text-xl font-bold leading-tight">{plan.planTitle}</h2>
        <div className="flex gap-4 mt-3 text-sm text-blue-200">
          <span>📅 {formData.date}</span>
          <span>🕐 {formData.startTime} 〜 {formData.endTime}</span>
        </div>
        {overTime && (
          <div className="mt-3 bg-red-500/20 border border-red-400/50 rounded-xl px-3 py-2">
            <p className="text-red-200 text-xs font-semibold">
              ⚠️ 予定終了時刻を超えています。滞在時間を調整してください。
            </p>
          </div>
        )}
      </div>

      {/* Budget summary */}
      <BudgetSummary estimated={actualBudget} limit={formData.budget} />

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

        {spots.map((spot, i) => (
          <div key={spot.id} className="flex gap-3">
            {/* Timeline rail */}
            <div className="w-8 flex flex-col items-center flex-shrink-0">
              <div className="w-0.5 flex-1 bg-orange-200" />
              <div className="w-3 h-3 rounded-full bg-orange-400 my-1 flex-shrink-0" />
              {i < spots.length - 1 && <div className="w-0.5 flex-1 bg-orange-200" />}
            </div>

            <div className="flex-1 pb-2">
              <SpotCard
                spot={spot}
                budget={formData.budget}
                onAdjust={(delta) => handleAdjust(i, delta)}
                isOverTime={overTime && i === spots.length - 1}
              />
              {i < spots.length - 1 && spot.travelTimeToNext > 0 && (
                <TravelSegment minutes={spot.travelTimeToNext} transport={formData.transport} />
              )}
            </div>
          </div>
        ))}

        {/* End marker */}
        <div className="flex items-center gap-3 px-2 py-2 ml-0">
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
