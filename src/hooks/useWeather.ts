import { useState, useEffect, useRef } from 'react';
import type { WeatherInfo } from '../types';
import { mapWeatherCode } from '../utils/weatherRules';
import { geocode } from './useGeocoding';

interface UseWeatherArgs {
  date: string;
  startLocation: string;
  lat?: number;
  lng?: number;
}

async function fetchForecast(lat: number, lng: number, date: string): Promise<WeatherInfo | null> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lng));
  url.searchParams.set('daily', 'weather_code,temperature_2m_max,precipitation_probability_max,wind_speed_10m_max');
  url.searchParams.set('timezone', 'Asia/Tokyo');
  url.searchParams.set('forecast_days', '8');

  const res = await fetch(url.toString());
  if (!res.ok) return null;

  const data = await res.json();
  const idx = (data.daily?.time as string[] | undefined)?.indexOf(date) ?? -1;
  if (idx === -1) return null;

  const code: number = data.daily.weather_code[idx];
  const { condition, label } = mapWeatherCode(code);

  return {
    date,
    weatherCode: code,
    weatherLabel: label,
    maxTemp: Math.round(data.daily.temperature_2m_max[idx]),
    precipitationProb: data.daily.precipitation_probability_max[idx] ?? 0,
    windSpeed: Math.round(data.daily.wind_speed_10m_max[idx] * 10) / 10,
    condition,
  };
}

/**
 * 日付・出発地が確定したら天気予報を自動取得する。
 * - 座標があればそのまま、なければ Geocoding で変換
 * - 入力変更は500msのdebounce付きで再取得
 * - 失敗してもエラー状態を返すだけでブロックしない
 */
export function useWeather({ date, startLocation, lat, lng }: UseWeatherArgs) {
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const requestSeq = useRef(0);

  useEffect(() => {
    const seq = ++requestSeq.current;

    const timer = setTimeout(async () => {
      const hasCoords = lat !== undefined && lng !== undefined;
      if (!date || (!hasCoords && !startLocation.trim())) {
        if (seq !== requestSeq.current) return;
        setWeather(null);
        setFailed(false);
        setLoading(false);
        return;
      }

      setLoading(true);
      setFailed(false);

      try {
        let qLat = lat, qLng = lng;
        if (!hasCoords) {
          const geo = await geocode(startLocation);
          if (!geo) throw new Error('geocoding failed');
          qLat = geo.lat;
          qLng = geo.lng;
        }

        const info = await fetchForecast(qLat!, qLng!, date);
        if (seq !== requestSeq.current) return; // stale request
        if (!info) throw new Error('forecast unavailable');

        setWeather(info);
        setLoading(false);
      } catch {
        if (seq !== requestSeq.current) return;
        setWeather(null);
        setFailed(true);
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [date, startLocation, lat, lng]);

  return { weather, loading, failed };
}
