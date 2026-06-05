import type { TransportType } from '../../types';
import { formatDuration } from '../../utils/timeCalc';

interface Props {
  minutes: number;
  transport: TransportType;
}

const transportIcon: Record<TransportType, string> = {
  car: '🚗',
  public: '🚃',
  bicycle: '🚲',
};

export function TravelSegment({ minutes, transport }: Props) {
  if (minutes <= 0) return null;

  return (
    <div className="flex items-center gap-3 py-1 px-2">
      <div className="flex flex-col items-center w-8">
        <div className="w-0.5 h-4 bg-orange-300" />
        <div className="w-3 h-3 rounded-full bg-orange-300 flex items-center justify-center" />
        <div className="w-0.5 h-4 bg-orange-300" />
      </div>
      <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-full px-3 py-1.5">
        <span className="text-sm">{transportIcon[transport]}</span>
        <span className="text-xs text-orange-600 font-medium">移動 {formatDuration(minutes)}</span>
      </div>
    </div>
  );
}
