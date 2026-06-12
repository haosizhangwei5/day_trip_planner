import { useState, useEffect, useCallback } from 'react';
import type { FormData, Step } from './types';
import { StepIndicator } from './components/common/StepIndicator';
import { LoadingScreen } from './components/common/LoadingScreen';
import { Step1 } from './components/InputForm/Step1';
import { Step2 } from './components/InputForm/Step2';
import { Step3 } from './components/InputForm/Step3';
import { Step4 } from './components/InputForm/Step4';
import { PlanTimeline } from './components/PlanTimeline/PlanTimeline';
import { WeatherBanner } from './components/WeatherBanner/WeatherBanner';
import { usePlanGenerator } from './hooks/usePlanGenerator';
import { usePlanState } from './hooks/usePlanState';
import { useWeather } from './hooks/useWeather';
import { requestNotifyPermission } from './hooks/useSurpriseReveal';

const STORAGE_KEY = 'day-trip-planner-form';

const defaultFormData: FormData = {
  date: new Date().toISOString().split('T')[0],
  startTime: '09:00',
  endTime: '18:00',
  startLocation: '',
  transport: 'public',
  companionType: 'solo',
  memberCount: 1,
  childAges: [],
  hasYoungChild: false,
  moodThemes: [],
  purposeThemes: [],
  budget: { food: 3000, transport: 1000, admission: 2000 },
  dislikedFoods: [],
  allergies: [],
  isSurpriseMode: false,
};

const stepLabels = ['基本設定', 'メンバー', 'テーマ', '食の制限'];

export default function App() {
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState<FormData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultFormData, ...JSON.parse(saved) } : defaultFormData;
    } catch {
      return defaultFormData;
    }
  });

  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const { plan, setPlan, loading, error, generate } = usePlanGenerator();
  const [showPlan, setShowPlan] = useState(false);

  // Phase 2: プラン状態（useReducer + localStorage永続化）
  const { state: planState, dispatch } = usePlanState();

  // Phase 2: 天気予報の自動取得（debounce付き）
  const { weather, loading: weatherLoading, failed: weatherFailed } = useWeather({
    date: formData.date,
    startLocation: formData.startLocation,
    lat: formData.startLocationCoords?.lat,
    lng: formData.startLocationCoords?.lng,
  });

  useEffect(() => {
    dispatch({ type: 'SET_WEATHER', weather });
  }, [weather, dispatch]);

  // Auto-save form to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch { /* ignore storage errors */ }
  }, [formData]);

  // Cycle loading messages
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingMsgIdx((i) => i + 1);
    }, 2500);
    return () => clearInterval(interval);
  }, [loading]);

  // サプライズモードON時に一度だけ通知許可をリクエスト
  useEffect(() => {
    if (formData.isSurpriseMode) requestNotifyPermission();
  }, [formData.isSurpriseMode]);

  const updateForm = useCallback((partial: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...partial }));
  }, []);

  async function handleSubmit() {
    const result = await generate(formData, weather);
    if (result) {
      dispatch({ type: 'SET_PLAN', plan: result, isSurpriseMode: formData.isSurpriseMode });
      setShowPlan(true);
    }
  }

  async function handleRegenerate() {
    setShowPlan(false);
    setPlan(null);
    const result = await generate(formData, planState.weather);
    if (result) {
      dispatch({ type: 'SET_PLAN', plan: result, isSurpriseMode: formData.isSurpriseMode });
      setShowPlan(true);
    }
  }

  function handleReset() {
    setShowPlan(false);
    setPlan(null);
    dispatch({ type: 'RESET' });
    setStep(1);
  }

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fef9f0] flex flex-col">
        <AppHeader minimal />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-sm">
            <LoadingScreen messageIndex={loadingMsgIdx} />
          </div>
        </div>
      </div>
    );
  }

  // Plan view（リロード後も planState.plan から復元できる）
  const activePlan = (showPlan && plan) || planState.plan;
  if (activePlan && (showPlan || planState.plan)) {
    return (
      <div className="min-h-screen bg-[#fef9f0] flex flex-col">
        <AppHeader minimal />
        <div className="flex-1 px-4 py-4 max-w-lg mx-auto w-full">
          <PlanTimeline
            state={planState}
            dispatch={dispatch}
            plan={activePlan}
            formData={formData}
            onRegenerate={handleRegenerate}
            onReset={handleReset}
          />
        </div>
      </div>
    );
  }

  // Input form
  return (
    <div className="min-h-screen bg-[#fef9f0] flex flex-col">
      <AppHeader />
      <div className="flex-1 px-4 py-4 max-w-lg mx-auto w-full">
        <StepIndicator current={step} total={4} labels={stepLabels} />

        {/* Step1完了後（=日付・出発地が入っている間）は常に天気バナーを表示 */}
        {(step > 1 || (formData.date && formData.startLocation)) && (
          <WeatherBanner weather={weather} loading={weatherLoading} failed={weatherFailed} />
        )}

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl p-4">
            <p className="text-sm text-red-600 font-medium">❌ {error}</p>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="text-xs text-red-400 mt-1 underline"
            >
              もう一度試す
            </button>
          </div>
        )}

        {step === 1 && (
          <Step1
            data={formData}
            onChange={updateForm}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <Step2
            data={formData}
            onChange={updateForm}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <Step3
            data={formData}
            onChange={updateForm}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && (
          <Step4
            data={formData}
            onChange={updateForm}
            onSubmit={handleSubmit}
            onBack={() => setStep(3)}
          />
        )}
      </div>
    </div>
  );
}

function AppHeader({ minimal }: { minimal?: boolean }) {
  return (
    <header className="bg-[#1a2744] text-white px-4 py-3 shadow-lg">
      <div className="max-w-lg mx-auto flex items-center gap-3">
        <span className="text-2xl">✈️</span>
        <div>
          <h1 className="text-base font-bold leading-tight">Day Trip Planner</h1>
          {!minimal && (
            <p className="text-blue-200 text-xs">AIが最旬スポットで旅をプランニング</p>
          )}
        </div>
      </div>
    </header>
  );
}
