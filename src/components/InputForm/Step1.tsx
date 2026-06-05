import { useState } from 'react';
import type { FormData, TransportType } from '../../types';

interface Props {
  data: FormData;
  onChange: (data: Partial<FormData>) => void;
  onNext: () => void;
}

const transports: { value: TransportType; label: string; icon: string }[] = [
  { value: 'car', label: '車', icon: '🚗' },
  { value: 'public', label: '公共交通機関+徒歩', icon: '🚃' },
  { value: 'bicycle', label: '自転車', icon: '🚲' },
];

function getMinDate() {
  return new Date().toISOString().split('T')[0];
}

function getMaxDate() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split('T')[0];
}

export function Step1({ data, onChange, onNext }: Props) {
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState('');

  function handleGetLocation() {
    if (!navigator.geolocation) {
      setLocError('お使いのブラウザは位置情報に対応していません');
      return;
    }
    setLocLoading(true);
    setLocError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        onChange({
          startLocation: `現在地 (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
          startLocationCoords: { lat, lng },
        });
        setLocLoading(false);
      },
      () => {
        setLocError('位置情報の取得に失敗しました');
        setLocLoading(false);
      }
    );
  }

  const canProceed = data.date && data.startTime && data.endTime && data.startLocation && data.transport;

  return (
    <div className="slide-in space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#1a2744] mb-1">Step 1 — 基本設定</h2>
        <p className="text-sm text-gray-500">いつ、どこから、どうやって？</p>
      </div>

      {/* Date */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-[#1a2744]">📅 お出かけ日</label>
        <input
          type="date"
          value={data.date}
          min={getMinDate()}
          max={getMaxDate()}
          onChange={(e) => onChange({ date: e.target.value })}
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-400 bg-white text-[#1a2744] transition-colors"
        />
      </div>

      {/* Time range */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-[#1a2744]">🕐 出発時刻</label>
          <input
            type="time"
            value={data.startTime}
            onChange={(e) => onChange({ startTime: e.target.value })}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-400 bg-white text-[#1a2744] transition-colors"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-[#1a2744]">🕕 終了時刻</label>
          <input
            type="time"
            value={data.endTime}
            onChange={(e) => onChange({ endTime: e.target.value })}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-400 bg-white text-[#1a2744] transition-colors"
          />
        </div>
      </div>

      {/* Start location */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-[#1a2744]">📍 出発地</label>
        <button
          type="button"
          onClick={handleGetLocation}
          disabled={locLoading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-orange-300 bg-orange-50 text-orange-700 font-medium text-sm hover:bg-orange-100 active:scale-95 transition-all disabled:opacity-50"
        >
          {locLoading ? (
            <>
              <span className="animate-spin">⏳</span> 取得中...
            </>
          ) : (
            <>📡 現在地を使う</>
          )}
        </button>
        {locError && <p className="text-xs text-red-500">{locError}</p>}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <div className="flex-1 h-px bg-gray-200" />
          または
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <input
          type="text"
          value={data.startLocation.startsWith('現在地') ? '' : data.startLocation}
          onChange={(e) => onChange({ startLocation: e.target.value, startLocationCoords: undefined })}
          placeholder="住所・駅名・ホテル名など"
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-400 bg-white text-[#1a2744] placeholder-gray-400 transition-colors"
        />
        {data.startLocation && (
          <p className="text-xs text-green-600 font-medium">✓ {data.startLocation}</p>
        )}
      </div>

      {/* Transport */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-[#1a2744]">🗺️ 移動手段</label>
        <div className="grid grid-cols-3 gap-2">
          {transports.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => onChange({ transport: t.value })}
              className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 font-medium text-sm transition-all active:scale-95 ${
                data.transport === t.value
                  ? 'border-orange-400 bg-orange-50 text-orange-700 shadow-sm'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">{t.icon}</span>
              <span className="text-xs leading-tight text-center">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!canProceed}
        className="w-full py-4 rounded-2xl bg-[#1a2744] text-white font-bold text-base shadow-lg hover:bg-[#243460] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        次へ →
      </button>
    </div>
  );
}
