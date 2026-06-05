import type { FormData } from '../../types';

interface Props {
  data: FormData;
  onChange: (data: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const moodThemes = [
  { label: 'リフレッシュ', icon: '😌' },
  { label: 'アクティブ', icon: '⚡' },
  { label: 'のんびり', icon: '😴' },
  { label: '非日常', icon: '✨' },
  { label: 'ワクワク・刺激', icon: '🎢' },
];

const purposeThemes = [
  { label: 'グルメ重視', icon: '🍜' },
  { label: '自然・アウトドア', icon: '🌿' },
  { label: '文化・歴史', icon: '🏯' },
  { label: '体を動かす', icon: '🏃' },
  { label: 'ショッピング', icon: '🛍️' },
  { label: '温泉・サウナ', icon: '♨️' },
];

function formatYen(n: number) {
  return n.toLocaleString('ja-JP');
}

function perPerson(total: number, members: number) {
  if (!members || members < 1) return 0;
  return Math.round(total / members);
}

export function Step3({ data, onChange, onNext, onBack }: Props) {
  function toggleMood(label: string) {
    const themes = data.moodThemes.includes(label)
      ? data.moodThemes.filter((t) => t !== label)
      : [...data.moodThemes, label];
    onChange({ moodThemes: themes });
  }

  function togglePurpose(label: string) {
    const themes = data.purposeThemes.includes(label)
      ? data.purposeThemes.filter((t) => t !== label)
      : [...data.purposeThemes, label];
    onChange({ purposeThemes: themes });
  }

  function handleBudget(key: keyof FormData['budget'], value: string) {
    const num = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
    onChange({ budget: { ...data.budget, [key]: num } });
  }

  const budgetFields: { key: keyof FormData['budget']; label: string; icon: string; description: string }[] = [
    { key: 'food', label: '食費', icon: '🍽️', description: '食事・カフェ代' },
    { key: 'transport', label: '交通費', icon: '🚃', description: '電車・バス・高速等' },
    { key: 'admission', label: '施設入場料', icon: '🎟️', description: '温泉・映画・施設等' },
  ];

  return (
    <div className="slide-in space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#1a2744] mb-1">Step 3 — テーマ・予算</h2>
        <p className="text-sm text-gray-500">どんな旅にしたい？</p>
      </div>

      {/* Mood themes */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-[#1a2744]">気分テーマ <span className="text-gray-400 font-normal">（複数選択可）</span></label>
        <div className="flex flex-wrap gap-2">
          {moodThemes.map((t) => {
            const selected = data.moodThemes.includes(t.label);
            return (
              <button
                key={t.label}
                type="button"
                onClick={() => toggleMood(t.label)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border-2 text-sm font-medium transition-all active:scale-95 ${
                  selected
                    ? 'border-orange-400 bg-orange-100 text-orange-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Purpose themes */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-[#1a2744]">目的テーマ <span className="text-gray-400 font-normal">（複数選択可）</span></label>
        <div className="flex flex-wrap gap-2">
          {purposeThemes.map((t) => {
            const selected = data.purposeThemes.includes(t.label);
            return (
              <button
                key={t.label}
                type="button"
                onClick={() => togglePurpose(t.label)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border-2 text-sm font-medium transition-all active:scale-95 ${
                  selected
                    ? 'border-[#1a2744] bg-[#1a2744] text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Budget */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-[#1a2744]">予算 <span className="text-gray-400 font-normal">（グループ合計）</span></label>
        {budgetFields.map((f) => (
          <div key={f.key} className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3 focus-within:border-orange-400 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <span>{f.icon}</span>
              <span className="text-sm font-semibold text-[#1a2744]">{f.label}</span>
              <span className="text-xs text-gray-400">{f.description}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-medium">¥</span>
              <input
                type="number"
                value={data.budget[f.key] || ''}
                onChange={(e) => handleBudget(f.key, e.target.value)}
                placeholder="0"
                min={0}
                className="flex-1 outline-none text-lg font-bold text-[#1a2744] bg-transparent"
              />
            </div>
            {data.budget[f.key] > 0 && data.memberCount > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                一人あたり約 ¥{formatYen(perPerson(data.budget[f.key], data.memberCount))}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-4 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold text-base hover:bg-gray-50 active:scale-95 transition-all"
        >
          ← 戻る
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-[2] py-4 rounded-2xl bg-[#1a2744] text-white font-bold text-base shadow-lg hover:bg-[#243460] active:scale-95 transition-all"
        >
          次へ →
        </button>
      </div>
    </div>
  );
}
