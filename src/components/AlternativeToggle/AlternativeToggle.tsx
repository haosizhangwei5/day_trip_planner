import type { Spot } from '../../types';

interface Props {
  spot: Spot;
  useAlternative: boolean;
  isBudgetOver: boolean;
  onToggle: () => void;
}

function costTotal(cost: { food: number; transport: number; admission: number }) {
  return (cost.food ?? 0) + (cost.transport ?? 0) + (cost.admission ?? 0);
}

/** 予算オーバー時の代替案をワンタップで本採用と切り替えるトグルUI */
export function AlternativeToggle({ spot, useAlternative, isBudgetOver, onToggle }: Props) {
  if (!spot.alternative) return null;

  if (useAlternative) {
    // 代替案採用中 → 元プランに戻すUI
    return (
      <div className="border-t border-gray-100 pt-3 space-y-2">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-1">
          <p className="text-xs text-gray-500">
            🔄 元のプラン：<span className="font-semibold text-gray-700">{spot.name}</span>
            <span className="ml-1">(¥{costTotal(spot.estimatedCost).toLocaleString()})</span>
          </p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="w-full py-2.5 rounded-xl border-2 border-gray-300 text-gray-600 text-sm font-bold hover:bg-gray-50 active:scale-95 transition-all"
        >
          元のプランに戻す
        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-100 pt-3">
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 space-y-2">
        <div className="flex items-center gap-2">
          <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full font-semibold">
            💡 代替案
          </span>
          {isBudgetOver && (
            <span className="text-xs text-red-500 font-semibold">予算オーバー解消におすすめ</span>
          )}
        </div>
        <p className="font-bold text-sm text-orange-700">{spot.alternative.name}</p>
        <p className="text-xs text-gray-600 leading-relaxed">{spot.alternative.description}</p>
        <div className="flex gap-4 text-xs text-gray-500">
          {spot.alternative.estimatedCost.food > 0 && <span>🍽️ ¥{spot.alternative.estimatedCost.food.toLocaleString()}</span>}
          {spot.alternative.estimatedCost.transport > 0 && <span>🚃 ¥{spot.alternative.estimatedCost.transport.toLocaleString()}</span>}
          {spot.alternative.estimatedCost.admission > 0 && <span>🎟️ ¥{spot.alternative.estimatedCost.admission.toLocaleString()}</span>}
          <span className="ml-auto font-bold text-orange-600">
            計 ¥{costTotal(spot.alternative.estimatedCost).toLocaleString()}
          </span>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="w-full py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 active:scale-95 transition-all shadow-sm"
        >
          代替案に変更する
        </button>
      </div>
    </div>
  );
}
