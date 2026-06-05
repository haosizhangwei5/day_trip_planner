const messages = [
  'スポットを検索中...',
  '最新情報を確認中...',
  '移動時間を計算中...',
  '最適なルートを組み立て中...',
  'もうすぐ完成です！',
];

interface Props {
  messageIndex: number;
}

export function LoadingScreen({ messageIndex }: Props) {
  const msg = messages[messageIndex % messages.length];

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <div className="text-7xl loading-plane mb-8 select-none">✈️</div>

      <h2 className="text-2xl font-bold text-[#1a2744] mb-2">プランを生成中...</h2>
      <p className="text-gray-500 text-sm mb-8 h-5 transition-all duration-500">{msg}</p>

      <div className="flex gap-3 mb-10">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`pulse-dot w-3 h-3 rounded-full bg-orange-400`}
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm max-w-xs w-full border border-orange-100">
        <p className="text-xs text-gray-400 text-center leading-relaxed">
          AIがあなたの条件に合った<br />
          最旬スポットを探しています🗺️
        </p>
      </div>
    </div>
  );
}
