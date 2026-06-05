import type { Spot } from '../types';

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function recalculateTimes(spots: Spot[], changedIndex: number): Spot[] {
  const updated = [...spots];
  for (let i = changedIndex; i < updated.length; i++) {
    const spot = { ...updated[i] };
    if (i === changedIndex && i > 0) {
      // arrival stays the same, recalc departure
      const arrivalMins = timeToMinutes(spot.arrivalTime);
      spot.departureTime = minutesToTime(arrivalMins + spot.stayDuration);
    } else if (i > changedIndex) {
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
