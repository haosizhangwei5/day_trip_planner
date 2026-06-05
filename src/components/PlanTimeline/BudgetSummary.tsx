interface BudgetData {
  food: number;
  transport: number;
  admission: number;
}

interface Props {
  estimated: BudgetData;
  limit: BudgetData;
}

function formatYen(n: number) {
  return `¥${Math.round(n).toLocaleString('ja-JP')}`;
}

function Item({ label, icon, estimated, limit }: { label: string; icon: string; estimated: number; limit: number }) {
  const over = limit > 0 && estimated > limit;
  const diff = estimated - limit;
  return (
    <div className={`rounded-xl p-3 ${over ? 'bg-red-50 border border-red-200' : 'bg-white border border-gray-100'}`}>
      <div className="flex items-center gap-1 mb-1">
        <span>{icon}</span>
        <span className="text-xs font-semibold text-gray-600">{label}</span>
      </div>
      <p className={`text-base font-bold ${over ? 'text-red-500' : 'text-[#1a2744]'}`}>
        {formatYen(estimated)}
      </p>
      {limit > 0 && (
        <p className={`text-xs mt-0.5 ${over ? 'text-red-400 font-semibold' : 'text-gray-400'}`}>
          {over ? `¥${diff.toLocaleString()} オーバー` : `予算内 (上限 ${formatYen(limit)})`}
        </p>
      )}
    </div>
  );
}

export function BudgetSummary({ estimated, limit }: Props) {
  const totalEst = estimated.food + estimated.transport + estimated.admission;
  const totalLimit = limit.food + limit.transport + limit.admission;
  const totalOver = totalLimit > 0 && totalEst > totalLimit;

  return (
    <div className="bg-[#fef9f0] border border-orange-200 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[#1a2744] text-sm">💰 予算サマリー</h3>
        {totalOver && (
          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">
            予算オーバー
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Item label="食費" icon="🍽️" estimated={estimated.food} limit={limit.food} />
        <Item label="交通費" icon="🚃" estimated={estimated.transport} limit={limit.transport} />
        <Item label="入場料" icon="🎟️" estimated={estimated.admission} limit={limit.admission} />
      </div>
      <div className={`flex justify-between items-center pt-2 border-t ${totalOver ? 'border-red-200' : 'border-orange-100'}`}>
        <span className="text-sm font-semibold text-gray-600">合計</span>
        <span className={`text-xl font-bold ${totalOver ? 'text-red-500' : 'text-[#1a2744]'}`}>
          {formatYen(totalEst)}
        </span>
      </div>
    </div>
  );
}
