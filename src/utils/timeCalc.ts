import type { Spot, SpotWithReveal } from '../types';

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** プランの日付を基準に "HH:MM" を Date に変換する（単純な文字列比較を避けるため） */
export function parseTime(time: string, baseDate: string): Date {
  const [h, m] = time.split(':').map(Number);
  const d = new Date(`${baseDate}T00:00:00`);
  d.setHours(h, m, 0, 0);
  return d;
}

export function recalculateTimes(spots: Spot[], changedIndex: number): Spot[] {
  const updated = [...spots];
  for (let i = changedIndex; i < updated.length; i++) {
    const spot = { ...updated[i] };
    if (i === changedIndex && i > 0) {
      // arrival stays the same, recalc departure
      const arrivalMins = timeToMinutes(spot.arrivalTime);
      spot.departureTime = minutesToTime(arrivalMins + spot.stayDuration);
    } else if (i === changedIndex && i === 0) {
      const arrivalMins = timeToMinutes(spot.arrivalTime);
      spot.departureTime = minutesToTime(arrivalMins + spot.stayDuration);
    } else {
      const prev = updated[i - 1];
      const prevDepartureMins = timeToMinutes(prev.departureTime);
      const arrivalMins = prevDepartureMins + prev.travelTimeToNext;
      spot.arrivalTime = minutesToTime(arrivalMins);
      spot.departureTime = minutesToTime(arrivalMins + spot.stayDuration);
    }
    updated[i] = spot;
  }
  return updated;
}

export function totalEndTime(spots: Spot[]): string {
  if (spots.length === 0) return '';
  return spots[spots.length - 1].departureTime;
}

export function isOverTime(spots: Spot[], endTime: string): boolean {
  if (spots.length === 0) return false;
  const end = timeToMinutes(endTime);
  const last = timeToMinutes(totalEndTime(spots));
  return last > end;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}分`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}時間${m}分` : `${h}時間`;
}

export function totalBudget(spots: Spot[]): { food: number; transport: number; admission: number } {
  return spots.reduce(
    (acc, s) => ({
      food: acc.food + (s.estimatedCost.food ?? 0),
      transport: acc.transport + (s.estimatedCost.transport ?? 0),
      admission: acc.admission + (s.estimatedCost.admission ?? 0),
    }),
    { food: 0, transport: 0, admission: 0 }
  );
}

// ===== Phase 2: サプライズモード =====

/**
 * スポットの公開時刻を計算する。
 * revealAt = max(到着時刻 - 30分, 前スポットの出発時刻)
 * 移動が30分未満の近場でも公開前に到着してしまわないようにする。
 */
export function calcRevealTime(arrivalTime: string, prevDepartureTime: string): string {
  const thirtyBefore = timeToMinutes(arrivalTime) - 30;
  const prevDep = timeToMinutes(prevDepartureTime);
  return minutesToTime(Math.max(thirtyBefore, prevDep));
}

/**
 * 全スポットの revealAt を計算する。
 * 最初のスポットはプラン開始時刻を「前スポット出発時刻」として扱う。
 */
export function calcAllRevealTimes(spots: Spot[], planStartTime: string): string[] {
  return spots.map((spot, i) => {
    const prevDeparture = i === 0 ? planStartTime : spots[i - 1].departureTime;
    return calcRevealTime(spot.arrivalTime, prevDeparture);
  });
}

/** Spot[] を revealAt / isRevealed 付きに変換する */
export function withRevealTimes(
  spots: Spot[],
  planStartTime: string,
  revealedSpotIds: string[]
): SpotWithReveal[] {
  const revealTimes = calcAllRevealTimes(spots, planStartTime);
  return spots.map((spot, i) => ({
    ...spot,
    revealAt: revealTimes[i],
    isRevealed: revealedSpotIds.includes(spot.id),
  }));
}
