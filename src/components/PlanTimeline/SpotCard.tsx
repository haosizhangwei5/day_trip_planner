import type { Spot, SpotCategory } from '../../types';
import { formatDuration } from '../../utils/timeCalc';
import { AlternativeToggle } from '../AlternativeToggle/AlternativeToggle';

interface Props {
  spot: Spot;
  useAlternative: boolean;
  onToggleAlternative: () => void;
  onAdjust: (delta: number) => void;
  isOverTime: boolean;
  isBudgetOver: boolean;
  justRevealed?: boolean;
}

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

export function SpotCard({ spot, useAlternative, onToggleAlternative, onAdjust, isOverTime, isBudgetOver, justRevealed }: Props) {
  // 代替案採用時は名前・説明・費用を差し替える（時刻・カテゴリは維持）
  const displayName = useAlternative && spot.alternative ? spot.alternative.name : spot.name;
  const displayDescription = useAlternative && spot.alternative ? spot.alternative.description : spot.description;
  const displayCost = useAlternative && spot.alternative ? spot.alternative.estimatedCost : spot.estimatedCost;

  const totalCost = (displayCost.food ?? 0) + (displayCost.transport ?? 0) + (displayCost.admission ?? 0);

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border ${
        isOverTime ? 'border-red-300' : 'border-orange-100'
      } overflow-hidden transition-colors ${justRevealed ? 'flip-reveal' : ''}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a2744] to-[#243460] px-4 py-3 flex items-center gap-3">
        <span className="text-2xl">{categoryIcon[spot.category]}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-base leading-tight truncate">{displayName}</h3>
          <p className="text-blue-200 text-xs">{categoryLabel[spot.category]}</p>
        </div>
        {justRevealed && (
          <span className="badge-pop bg-purple-400 text-white text-xs px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
            🎉 公開！
          </span>
        )}
        {useAlternative && (
          <span className="bg-green-400 text-white text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
            ✅ 代替案採用中
          </span>
        )}
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
        {!useAlternative && (
          <p className="text-xs text-gray-400 flex items-start gap-1">
            <span>📍</span>
            <span>{spot.address}</span>
          </p>
        )}

        {/* Description */}
        <p className="text-sm text-gray-700 leading-relaxed">{displayDescription}</p>

        {/* Trend reason (original only) */}
        {!useAlternative && spot.trendReason && (
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
            { label: '食費', value: displayCost.food, icon: '🍽️' },
            { label: '交通費', value: displayCost.transport, icon: '🚃' },
            { label: '入場料', value: displayCost.admission, icon: '🎟️' },
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

        {/* Alternative toggle */}
        <AlternativeToggle
          spot={spot}
          useAlternative={useAlternative}
          isBudgetOver={isBudgetOver}
          onToggle={onToggleAlternative}
        />
      </div>
    </div>
  );
}
