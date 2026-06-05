import { useState } from 'react';
import type { Spot, SpotCategory } from '../../types';
import { formatDuration } from '../../utils/timeCalc';

interface Props {
  spot: Spot;
  budget: FormData['budget'];
  onAdjust: (delta: number) => void;
  isOverTime: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { FormData } from '../../types';

const categoryIcon: Record<SpotCategory, string> = {
  food: '🍽️',
  shopping: '🛍️',
  onsen: '♨️',
  movie: '🎬',
  sports: '🏃',
  sightseeing: '🏛️',
  other: '📍',
};

const categoryLabel: Record<SpotCategory, string> = {
  food: 'グルメ',
  shopping: 'ショッピング',
  onsen: '温泉・サウナ',
  movie: '映画',
  sports: 'スポーツ',
  sightseeing: '観光',
  other: 'その他',
};

function formatYen(n: number) {
  if (!n || n === 0) return '—';
  return `¥${n.toLocaleString('ja-JP')}`;
}

export function SpotCard({ spot, onAdjust, isOverTime }: Props) {
  const [altExpanded, setAltExpanded] = useState(false);

  const totalCost = (spot.estimatedCost.food ?? 0) + (spot.estimatedCost.transport ?? 0) + (spot.estimatedCost.admission ?? 0);

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border ${
        isOverTime ? 'border-red-300' : 'border-orange-100'
      } overflow-hidden transition-colors`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a2744] to-[#243460] px-4 py-3 flex items-center gap-3">
        <span className="text-2xl">{categoryIcon[spot.category]}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-base leading-tight truncate">{spot.name}</h3>
          <p className="text-blue-200 text-xs">{categoryLabel[spot.category]}</p>
        </div>
        {spot.allergyNote && (
          <span title={spot.allergyDetail} className="bg-red-400 text-white text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
            ⚠️ アレルギー注意
          </span>
        )}
      </div>

      <div className="px-4 py-3 space-y-3">
        {/* Time */}
        <div className="flex items-center justify-between">
          <div className={`text-lg font-bold ${isOverTime ? 'text-red-500' : 'text-[#1a2744]'}`}>
            {spot.arrivalTime} 〜 {spot.departureTime}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onAdjust(-15)}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 active:scale-90 transition-all text-gray-600 font-bold text-sm flex items-center justify-center"
            >
              −15
            </button>
            <span className="text-xs text-gray-400 px-1">{formatDuration(spot.stayDuration)}</span>
            <button
              type="button"
              onClick={() => onAdjust(15)}
              className="w-8 h-8 rounded-lg bg-orange-100 hover:bg-orange-200 active:scale-90 transition-all text-orange-600 font-bold text-sm flex items-center justify-center"
            >
              +15
            </button>
          </div>
        </div>

        {/* Address */}
        <p className="text-xs text-gray-400 flex items-start gap-1">
          <span>📍</span>
          <span>{spot.address}</span>
        </p>

        {/* Description */}
        <p className="text-sm text-gray-700 leading-relaxed">{spot.description}</p>

        {/* Trend reason */}
        {spot.trendReason && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
            <p className="text-xs text-amber-700 leading-relaxed">
              <span className="font-semibold">✨ 話題の理由：</span>{spot.trendReason}
            </p>
          </div>
        )}

        {/* Allergy note detail */}
        {spot.allergyNote && spot.allergyDetail && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2">
            <p className="text-xs text-red-600 leading-relaxed">
              <span className="font-semibold">⚠️ 注意：</span>{spot.allergyDetail}
            </p>
          </div>
        )}

        {/* Cost */}
        <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-3">
          {[
            { label: '食費', value: spot.estimatedCost.food, icon: '🍽️' },
            { label: '交通費', value: spot.estimatedCost.transport, icon: '🚃' },
            { label: '入場料', value: spot.estimatedCost.admission, icon: '🎟️' },
          ].map((c) => (
            <div key={c.label} className="text-center">
              <p className="text-xs text-gray-400">{c.icon} {c.label}</p>
              <p className="text-sm font-bold text-[#1a2744]">{formatYen(c.value)}</p>
            </div>
          ))}
        </div>

        {totalCost > 0 && (
          <p className="text-xs text-right text-gray-500">
            このスポット合計 <span className="font-bold text-[#1a2744]">¥{totalCost.toLocaleString()}</span>
          </p>
        )}

        {/* Alternative */}
        {spot.alternative && (
          <div className="border-t border-gray-100 pt-3">
            <button
              type="button"
              onClick={() => setAltExpanded((v) => !v)}
              className="flex items-center gap-2 text-sm text-orange-500 font-medium hover:text-orange-600 transition-colors"
            >
              <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full">代替案あり</span>
              <span>{altExpanded ? '▲ 閉じる' : '▼ 代替案を見る'}</span>
            </button>
            {altExpanded && (
              <div className="mt-2 bg-orange-50 border border-orange-200 rounded-xl p-3 space-y-1">
                <p className="font-bold text-sm text-orange-700">代替案: {spot.alternative.name}</p>
                <p className="text-xs text-gray-600">{spot.alternative.description}</p>
                <div className="flex gap-4 text-xs text-gray-500 mt-1">
                  {spot.alternative.estimatedCost.food > 0 && <span>🍽️ ¥{spot.alternative.estimatedCost.food.toLocaleString()}</span>}
                  {spot.alternative.estimatedCost.transport > 0 && <span>🚃 ¥{spot.alternative.estimatedCost.transport.toLocaleString()}</span>}
                  {spot.alternative.estimatedCost.admission > 0 && <span>🎟️ ¥{spot.alternative.estimatedCost.admission.toLocaleString()}</span>}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
