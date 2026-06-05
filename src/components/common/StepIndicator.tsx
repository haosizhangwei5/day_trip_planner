interface Props {
  current: number;
  total: number;
  labels: string[];
}

export function StepIndicator({ current, total, labels }: Props) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1;
        const isActive = step === current;
        const isDone = step < current;
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isDone
                    ? 'bg-orange-500 text-white shadow-md'
                    : isActive
                    ? 'bg-[#1a2744] text-white shadow-lg ring-4 ring-orange-200'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {isDone ? '✓' : step}
              </div>
              <span
                className={`text-xs mt-1 whitespace-nowrap ${
                  isActive ? 'text-[#1a2744] font-bold' : isDone ? 'text-orange-500' : 'text-gray-400'
                }`}
              >
                {labels[i]}
              </span>
            </div>
            {step < total && (
              <div
                className={`w-10 h-0.5 mx-1 mb-4 transition-colors duration-300 ${
                  isDone ? 'bg-orange-400' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
