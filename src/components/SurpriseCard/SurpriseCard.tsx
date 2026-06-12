import type { SpotWithReveal } from '../../types';

interface Props {
  spot: SpotWithReveal;
}

/** サプライズモードの未公開スポットカード。名前・住所・説明は隠し、エリアとヒントのみ表示する。 */
export function SurpriseCard({ spot }: Props) {
  const totalCost =
    (spot.estimatedCost.food ?? 0) + (spot.estimatedCost.transport ?? 0) + (spot.estimatedCost.admission ?? 0);

  return (
    <div className="rounded-2xl shadow-sm border border-purple-200 overflow-hidden">
      <div className="mystery-shimmer px-4 py-3 flex items-center gap-3">
        <span className="text-2xl">🎁</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-lg leading-tight tracking-widest">？？？</h3>
          <p className="text-purple-200 text-xs">お楽しみスポット</p>
        </div>
        {spot.allergyNote && (
          <span title={spot.allergyDetail} className="bg-red-400 text-white text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
            ⚠️ アレルギー注意
          </span>
        )}
      </div>

      <div className="bg-white px-4 py-3 space-y-3">
        <div className="text-lg font-bold text-[#1a2744]">
          {spot.arrivalTime} 〜 {spot.departureTime}
        </div>

        {spot.areaLabel && (
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <span>📍</span>
            <span className="font-medium">{spot.areaLabel}</span>
          </p>
        )}

        {spot.hint && (
          <div className="bg-purple-50 border border-purple-100 rounded-xl px-3 py-2">
            <p className="text-sm text-purple-700 leading-relaxed">
              <span className="font-semibold">💬 ヒント：</span>{spot.hint}
            </p>
          </div>
        )}

        {spot.allergyNote && spot.allergyDetail && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2">
            <p className="text-xs text-red-600 leading-relaxed">
              <span className="font-semibold">⚠️ 注意：</span>{spot.allergyDetail}
            </p>
          </div>
        )}

        {totalCost > 0 && (
          <p className="text-xs text-gray-500">
            💰 このスポットの予算 <span className="font-bold text-[#1a2744]">¥{totalCost.toLocaleString()}</span>
          </p>
        )}

        <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
          <span>🔒</span>
          <p className="text-xs text-gray-500 font-medium">{spot.revealAt} に公開予定</p>
        </div>
      </div>
    </div>
  );
}
