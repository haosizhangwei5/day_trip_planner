import type { WeatherCondition, WeatherInfo } from '../types';

/** WMO天気コード → condition / 日本語ラベル */
export function mapWeatherCode(code: number): { condition: WeatherCondition; label: string } {
  if (code === 0) return { condition: 'sunny', label: '快晴' };
  if (code === 1 || code === 2) return { condition: 'sunny', label: '晴れ' };
  if (code === 3) return { condition: 'cloudy', label: '曇り' };
  if (code === 45 || code === 48) return { condition: 'cloudy', label: '霧' };
  if (code >= 51 && code <= 57) return { condition: 'rainy', label: '霧雨' };
  if (code >= 61 && code <= 67) return { condition: 'rainy', label: '雨' };
  if (code >= 71 && code <= 77) return { condition: 'snowy', label: '雪' };
  if (code >= 80 && code <= 82) return { condition: 'rainy', label: 'にわか雨' };
  if (code === 85 || code === 86) return { condition: 'snowy', label: 'にわか雪' };
  if (code >= 95 && code <= 99) return { condition: 'stormy', label: '雷雨' };
  return { condition: 'cloudy', label: '不明' };
}

export const conditionIcon: Record<WeatherCondition, string> = {
  sunny: '☀️',
  cloudy: '☁️',
  rainy: '🌧️',
  snowy: '❄️',
  stormy: '⛈️',
};

export const conditionMessage: Record<WeatherCondition, string> = {
  sunny: '絶好のお出かけ日和！屋外スポット中心のプランがおすすめ',
  cloudy: '過ごしやすい一日。屋内外バランスよく楽しめます',
  rainy: '雨の日ならではの屋内スポットを楽しみましょう',
  snowy: '雪景色と暖かい屋内スポットを楽しみましょう',
  stormy: '荒天予報。屋内完結型のプランがおすすめです',
};

/** 天気情報からClaude APIへ渡すプラン調整指示を組み立てる */
export function buildWeatherDirective(weather: WeatherInfo): string {
  const directives: string[] = [];

  if (weather.condition === 'sunny') {
    directives.push('絶好のお出かけ日和です。屋外スポット・テラス席・自然系アクティビティを積極的に提案してください');
  } else if (weather.condition === 'cloudy') {
    directives.push('過ごしやすい曇り空です。屋内外バランスよく提案してください');
  } else if (weather.condition === 'rainy') {
    directives.push('雨の日ならではの楽しみ方を提案してください。屋内施設（美術館・水族館・ショッピングモール・温泉など）を中心にし、雨だからこそ空いている・雰囲気が良いスポットがあれば優先してください');
  } else if (weather.condition === 'snowy') {
    directives.push('雪景色を楽しめるスポットや、暖かい屋内施設を中心に提案してください');
  } else if (weather.condition === 'stormy') {
    directives.push('荒天のため移動距離を最小限にし、屋内完結型のプランにしてください');
  }

  if (weather.precipitationProb >= 60) {
    directives.push('降水確率が高いため、屋外メインのスポットは避けてください');
  }
  if (weather.maxTemp >= 35) {
    directives.push('猛暑のため、長時間の屋外滞在は避け、涼しい屋内や水辺を優先してください');
  }
  if (weather.maxTemp <= 5) {
    directives.push('厳しい寒さのため、屋外の滞在時間は短めにしてください');
  }
  if (weather.windSpeed >= 10) {
    directives.push('強風のため、山頂・高所・海辺の屋外スポットは避けてください');
  }

  return directives.map((d) => `※${d}`).join('\n');
}
