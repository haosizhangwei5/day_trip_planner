import { useState } from 'react';
import type { FormData, Plan, WeatherInfo } from '../types';
import { buildWeatherDirective } from '../utils/weatherRules';

const SYSTEM_PROMPT = `日帰り旅行プランナー。JSONのみ返す。web_searchで「[地域] おすすめスポット 2025」を検索してからプランを作る。

ルール:移動時間は距離から推定(Google Maps×1.05倍)。滞在時間基準:食事60分,温泉120分,映画180分,ショッピング180分。苦手食材の専門店は除外。アレルギー注意店にallergyNote:true。10歳未満の子がいれば絶叫系除外。予算超過時はalternativeを付ける。代替案は元スポットと同じエリア・同じ時間帯で成立するもの（移動時間が大きく変わらないこと）。同カテゴリまたは同テーマを満たす別カテゴリでもよい。

出力JSON:
{"planTitle":"","totalBudgetEstimate":{"food":0,"transport":0,"admission":0},"budgetOver":false,"spots":[{"id":"spot_1","name":"","category":"food|shopping|onsen|movie|sports|sightseeing|other","address":"","arrivalTime":"HH:MM","departureTime":"HH:MM","stayDuration":60,"travelTimeToNext":20,"estimatedCost":{"food":0,"transport":0,"admission":0},"allergyNote":false,"allergyDetail":"","description":"","trendReason":"","areaLabel":"","hint":"","alternative":{"name":"","estimatedCost":{"food":0,"transport":0,"admission":0},"description":""}}]}`;

const SURPRISE_DIRECTIVE = `
※これはサプライズモードのプランです。各スポットの情報はすべて通常通り生成してください（表示の制御はアプリ側で行います）。ただし各スポットに必ず以下を含めてください:
- "areaLabel": 市区町村レベルのエリア名（例:「渋谷エリア」「箱根エリア」）
- "hint": スポット名を伏せたワクワクするヒント文1文。店名・施設名は絶対に含めない（例:「地元で行列ができる人気ラーメン店です」）`;

function buildUserPrompt(data: FormData, weather: WeatherInfo | null): string {
  const transportLabel = { car: '車', public: '公共交通機関+徒歩', bicycle: '自転車' }[data.transport];
  const companionLabel = { solo: '一人', friends: '友達', couple: '恋人', family: '家族' }[data.companionType];

  const weatherContext = weather
    ? `【当日の天気予報】${weather.weatherLabel} / 最高${weather.maxTemp}℃ / 降水確率${weather.precipitationProb}% / 最大風速${weather.windSpeed}m/s
${buildWeatherDirective(weather)}`
    : '';

  return `
【出発地】${data.startLocation}
【出発日時】${data.date} ${data.startTime}〜${data.endTime}
【移動手段】${transportLabel}
【同行者】${companionLabel}（${data.memberCount}人）
${data.childAges.length > 0 ? `【子どもの年齢】${data.childAges.join('、')}歳` : ''}
${data.hasYoungChild ? '※10歳未満の子どもがいます' : ''}
【気分テーマ】${data.moodThemes.join('、') || '指定なし'}
【目的テーマ】${data.purposeThemes.join('、') || '指定なし'}
【予算】食費 ¥${data.budget.food} / 交通費 ¥${data.budget.transport} / 入場料 ¥${data.budget.admission}（グループ合計）
${data.dislikedFoods.length > 0 ? `【苦手な食べ物】${data.dislikedFoods.join('、')}` : ''}
${data.allergies.length > 0 ? `【アレルギー】${data.allergies.join('、')}` : ''}
${weatherContext}
${data.isSurpriseMode ? SURPRISE_DIRECTIVE : ''}

上記の条件でお出かけプランを生成してください。
まず出発地周辺の話題スポットをweb_searchで検索してから計画してください。
`.trim();
}

function extractJSON(text: string): string {
  // Remove markdown code blocks if present
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) return codeBlock[1].trim();
  // Find first { to last }
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1) return text.slice(start, end + 1);
  return text.trim();
}

export function usePlanGenerator() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate(formData: FormData, weather: WeatherInfo | null = null): Promise<Plan | null> {
    setLoading(true);
    setError(null);
    setPlan(null);

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey) {
      setError('Anthropic APIキーが設定されていません。.envファイルを確認してください。');
      setLoading(false);
      return null;
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 8000,
          tools: [{ type: 'web_search_20250305', name: 'web_search' }],
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: buildUserPrompt(formData, weather) }],
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error?.message ?? `APIエラー: ${response.status}`);
      }

      const data = await response.json();

      if (data.stop_reason === 'max_tokens') {
        throw new Error('レスポンスが長すぎて途中で切れました。もう一度試してください。');
      }

      // Extract text content from response (may have tool_use blocks)
      let rawText = '';
      for (const block of data.content ?? []) {
        if (block.type === 'text') {
          rawText += block.text;
        }
      }

      if (!rawText.trim()) {
        throw new Error('AIからの応答が空でした。もう一度試してください。');
      }

      const jsonStr = extractJSON(rawText);
      let parsed: Plan;
      try {
        parsed = JSON.parse(jsonStr);
      } catch {
        throw new Error('プランのJSONパースに失敗しました。もう一度試してください。');
      }
      setPlan(parsed);
      return parsed;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'プランの生成に失敗しました';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { plan, setPlan, loading, error, generate };
}
