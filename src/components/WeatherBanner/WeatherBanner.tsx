import type { WeatherInfo } from '../../types';
import { conditionIcon, conditionMessage } from '../../utils/weatherRules';

interface Props {
  weather: WeatherInfo | null;
  loading: boolean;
  failed: boolean;
}

const conditionGradient: Record<WeatherInfo['condition'], string> = {
  sunny: 'from-orange-400 to-amber-300',
  cloudy: 'from-slate-400 to-slate-300',
  rainy: 'from-slate-500 to-blue-400',
  snowy: 'from-sky-300 to-blue-200',
  stormy: 'from-slate-700 to-slate-500',
};

function formatDateLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  return `${d.getMonth() + 1}月${d.getDate()}日(${days[d.getDay()]})`;
}

export function WeatherBanner({ weather, loading, failed }: Props) {
  if (loading) {
    return (
      <div className="rounded-2xl bg-gray-100 p-4 animate-pulse mb-4">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-3/4" />
      </div>
    );
  }

  if (failed) {
    return (
      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 mb-4 flex gap-2 items-start">
        <span>⚠️</span>
        <p className="text-xs text-amber-700">
          天気情報を取得できませんでした。テーマ選択をもとにプランを作成します
        </p>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className={`rounded-2xl bg-gradient-to-r ${conditionGradient[weather.condition]} p-4 mb-4 text-white shadow-md`}>
      <div className="flex items-center gap-3">
        <span className="text-4xl drop-shadow">{conditionIcon[weather.condition]}</span>
        <div className="flex-1">
          <p className="text-xs font-semibold opacity-90">{formatDateLabel(weather.date)}の天気予報</p>
          <p className="text-base font-bold">
            {weather.weatherLabel} / 最高{weather.maxTemp}℃ / 降水確率{weather.precipitationProb}%
          </p>
          {weather.windSpeed >= 10 && (
            <p className="text-xs opacity-90">💨 最大風速 {weather.windSpeed}m/s</p>
          )}
        </div>
      </div>
      <div className="mt-2 bg-white/20 rounded-xl px-3 py-2 backdrop-blur-sm">
        <p className="text-xs font-medium">💡 {conditionMessage[weather.condition]}</p>
      </div>
    </div>
  );
}
