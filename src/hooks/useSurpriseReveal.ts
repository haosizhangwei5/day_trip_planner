import { useEffect } from 'react';
import type { SpotWithReveal } from '../types';
import { parseTime } from '../utils/timeCalc';

/**
 * 1分ごとに現在時刻と revealAt を比較し、公開タイミングが来たスポットを自動公開する。
 * - マウント直後にも1回チェック（リロード対応）
 * - 全スポット公開済みならタイマーを張らない
 */
export function useSurpriseReveal(
  enabled: boolean,
  spots: SpotWithReveal[],
  planDate: string,
  onReveal: (spotId: string) => void
) {
  useEffect(() => {
    if (!enabled) return;
    const hasUnrevealed = spots.some((s) => !s.isRevealed);
    if (!hasUnrevealed) return;

    function check() {
      const now = new Date();
      for (const spot of spots) {
        if (!spot.isRevealed && now >= parseTime(spot.revealAt, planDate)) {
          onReveal(spot.id);
        }
      }
    }

    check();
    const timer = setInterval(check, 60 * 1000);
    return () => clearInterval(timer);
  }, [enabled, spots, planDate, onReveal]);
}

/** サプライズモードON時に一度だけ通知許可をリクエストする */
export function requestNotifyPermission() {
  if (typeof Notification === 'undefined') return;
  if (Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {});
  }
}

/** スポット公開時のブラウザ通知（許可済みのみ・非対応は静かにスキップ） */
export function notifyReveal(spotName: string, travelMinutes: number) {
  if (typeof Notification === 'undefined') return;
  if (Notification.permission !== 'granted') return;
  try {
    new Notification('🎉 次のスポットが公開されました！', {
      body: `${spotName} まで${travelMinutes > 0 ? `約${travelMinutes}分` : 'もうすぐ'}。お楽しみに！`,
    });
  } catch {
    // ignore (e.g. unsupported constructor on mobile)
  }
}
