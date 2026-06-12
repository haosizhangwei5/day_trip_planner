import type { FormData, CompanionType } from '../../types';

interface Props {
  data: FormData;
  onChange: (data: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const companions: { value: CompanionType; label: string; icon: string }[] = [
  { value: 'solo', label: '一人', icon: '👤' },
  { value: 'friends', label: '友達', icon: '👫' },
  { value: 'couple', label: '恋人', icon: '💑' },
  { value: 'family', label: '家族', icon: '👨‍👩‍👧' },
];

export function Step2({ data, onChange, onNext, onBack }: Props) {
  function handleCompanionType(type: CompanionType) {
    const updates: Partial<FormData> = { companionType: type };
    if (type === 'solo') {
      updates.memberCount = 1;
      updates.childAges = [];
      updates.hasYoungChild = false;
    }
    if (type !== 'family') {
      updates.childAges = [];
      updates.hasYoungChild = false;
    }
    onChange(updates);
  }

  function handleMemberCount(count: number) {
    onChange({ memberCount: Math.max(1, Math.min(20, count)) });
  }

  function addChild() {
    const ages = [...data.childAges, 5];
    const hasYoungChild = ages.some((a) => a < 10);
    onChange({ childAges: ages, hasYoungChild });
  }

  function updateChildAge(index: number, age: number) {
    const ages = data.childAges.map((a, i) => (i === index ? Math.max(0, Math.min(17, age)) : a));
    onChange({ childAges: ages, hasYoungChild: ages.some((a) => a < 10) });
  }

  function removeChild(index: number) {
    const ages = data.childAges.filter((_, i) => i !== index);
    onChange({ childAges: ages, hasYoungChild: ages.some((a) => a < 10) });
  }

  const canProceed = !!data.companionType;

  return (
    <div className="slide-in space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#1a2744] mb-1">Step 2 — メンバー設定</h2>
        <p className="text-sm text-gray-500">誰と一緒に？</p>
      </div>

      {/* Companion type */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-[#1a2744]">同行者タイプ</label>
        <div className="grid grid-cols-2 gap-3">
          {companions.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => handleCompanionType(c.value)}
              className={`flex items-center gap-3 py-3.5 px-4 rounded-xl border-2 font-medium text-sm transition-all active:scale-95 ${
                data.companionType === c.value
                  ? 'border-orange-400 bg-orange-50 text-orange-700 shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">{c.icon}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Member count */}
      {data.companionType !== 'solo' && (
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-[#1a2744]">人数（合計）</label>
          <div className="flex items-center gap-4 bg-white border-2 border-gray-200 rounded-xl px-4 py-3">
            <button
              type="button"
              onClick={() => handleMemberCount(data.memberCount - 1)}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-90 transition-all font-bold text-lg flex items-center justify-center text-gray-600"
            >
              −
            </button>
            <span className="flex-1 text-center text-xl font-bold text-[#1a2744]">
              {data.memberCount}人
            </span>
            <button
              type="button"
              onClick={() => handleMemberCount(data.memberCount + 1)}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-90 transition-all font-bold text-lg flex items-center justify-center text-gray-600"
            >
              ＋
            </button>
          </div>
        </div>
      )}

      {/* Surprise mode toggle */}
      <div className={`rounded-2xl border-2 p-4 transition-colors ${
        data.isSurpriseMode ? 'border-purple-300 bg-purple-50' : 'border-gray-200 bg-white'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎲</span>
            <span className="text-sm font-semibold text-[#1a2744]">サプライズモードで計画する</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={data.isSurpriseMode}
            onClick={() => onChange({ isSurpriseMode: !data.isSurpriseMode })}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              data.isSurpriseMode ? 'bg-purple-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                data.isSurpriseMode ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
        {data.isSurpriseMode && (
          <p className="text-xs text-purple-600 mt-2 leading-relaxed">
            行き先はすべてお楽しみ！移動を始めるタイミングで次の目的地が明かされます 🎉
          </p>
        )}
      </div>

      {/* Children ages (family only) */}
      {data.companionType === 'family' && (
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-[#1a2744]">子どもの年齢</label>

          {data.childAges.length === 0 && (
            <p className="text-xs text-gray-400">子どもがいる場合は追加してください</p>
          )}

          {data.childAges.map((age, i) => (
            <div key={i} className="flex items-center gap-3 bg-white border-2 border-gray-200 rounded-xl px-4 py-3">
              <span className="text-sm text-gray-500">子ども {i + 1}</span>
              <div className="flex items-center gap-2 flex-1">
                <button
                  type="button"
                  onClick={() => updateChildAge(i, age - 1)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-90 transition-all font-bold flex items-center justify-center text-gray-600"
                >
                  −
                </button>
                <span className="flex-1 text-center font-bold text-[#1a2744]">{age}歳</span>
                <button
                  type="button"
                  onClick={() => updateChildAge(i, age + 1)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-90 transition-all font-bold flex items-center justify-center text-gray-600"
                >
                  ＋
                </button>
              </div>
              <button
                type="button"
                onClick={() => removeChild(i)}
                className="text-gray-400 hover:text-red-400 transition-colors text-lg"
              >
                ×
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addChild}
            className="w-full py-2.5 rounded-xl border-2 border-dashed border-orange-300 text-orange-500 text-sm font-medium hover:bg-orange-50 transition-colors"
          >
            ＋ 子どもを追加
          </button>

          {data.hasYoungChild && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
              <span>🚸</span>
              <p className="text-xs text-amber-700">10歳未満のお子さまがいるため、絶叫系アトラクションは除外されます</p>
            </div>
          )}
        </div>
      )}

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
          disabled={!canProceed}
          className="flex-[2] py-4 rounded-2xl bg-[#1a2744] text-white font-bold text-base shadow-lg hover:bg-[#243460] active:scale-95 transition-all disabled:opacity-40"
        >
          次へ →
        </button>
      </div>
    </div>
  );
}
