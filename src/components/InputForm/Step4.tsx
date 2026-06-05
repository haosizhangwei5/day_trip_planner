import type { FormData } from '../../types';
import { TagInput } from '../common/TagInput';

interface Props {
  data: FormData;
  onChange: (data: Partial<FormData>) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export function Step4({ data, onChange, onSubmit, onBack }: Props) {
  return (
    <div className="slide-in space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#1a2744] mb-1">Step 4 — 食の制限</h2>
        <p className="text-sm text-gray-500">安心して楽しめるプランにするために</p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-[#1a2744]">🙅 苦手な食べ物</label>
        <p className="text-xs text-gray-400">入力してEnterで追加。例: 生もの、レバー、パクチー</p>
        <TagInput
          tags={data.dislikedFoods}
          onChange={(tags) => onChange({ dislikedFoods: tags })}
          placeholder="例: 生もの、辛い食べ物..."
          color="orange"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-[#1a2744]">⚠️ アレルギー</label>
        <p className="text-xs text-gray-400">入力してEnterで追加。例: 卵、乳、小麦、ナッツ</p>
        <TagInput
          tags={data.allergies}
          onChange={(tags) => onChange({ allergies: tags })}
          placeholder="例: 卵、小麦、乳製品..."
          color="red"
        />
        {data.allergies.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2">
            <span>⚠️</span>
            <p className="text-xs text-red-600">
              アレルギー対応が必要なスポットには注意マークを表示します。
              飲食店では必ずスタッフにアレルギーをお伝えください。
            </p>
          </div>
        )}
      </div>

      {/* Summary card */}
      <div className="bg-white border-2 border-orange-100 rounded-2xl p-4 space-y-2">
        <p className="text-sm font-bold text-[#1a2744] mb-2">📋 入力内容の確認</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
          <span className="text-gray-400">出発日時</span>
          <span className="font-medium">{data.date} {data.startTime}〜{data.endTime}</span>
          <span className="text-gray-400">出発地</span>
          <span className="font-medium truncate">{data.startLocation || '未設定'}</span>
          <span className="text-gray-400">移動手段</span>
          <span className="font-medium">{{ car: '🚗 車', public: '🚃 公共交通', bicycle: '🚲 自転車' }[data.transport]}</span>
          <span className="text-gray-400">メンバー</span>
          <span className="font-medium">
            {{ solo: '👤 一人', friends: '👫 友達', couple: '💑 恋人', family: '👨‍👩‍👧 家族' }[data.companionType]} {data.memberCount}人
          </span>
          <span className="text-gray-400">気分テーマ</span>
          <span className="font-medium">{data.moodThemes.join('・') || '—'}</span>
          <span className="text-gray-400">目的テーマ</span>
          <span className="font-medium">{data.purposeThemes.join('・') || '—'}</span>
        </div>
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
          onClick={onSubmit}
          className="flex-[2] py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-400 text-white font-bold text-base shadow-lg hover:from-orange-600 hover:to-orange-500 active:scale-95 transition-all"
        >
          ✈️ プランを生成する
        </button>
      </div>
    </div>
  );
}
