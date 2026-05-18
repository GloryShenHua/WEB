import React from 'react';
import { useAlgorithmStore } from '../store';
import { useAnimation } from '../hooks/useAnimation';

export const ControlPanel: React.FC = () => {
  const {
    steps,
    currentStep,
    isPlaying,
    speed,
    setIsPlaying,
    setSpeed,
    stepForward,
    stepBackward,
    setCurrentStep,
    reset,
    runAlgorithm,
  } = useAlgorithmStore();

  useAnimation();

  const progress = steps.length > 0 ? (currentStep / (steps.length - 1)) * 100 : 0;
  const currentStepData = steps[currentStep];

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentStep(Number(e.target.value));
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    if (steps.length === 0) {
      runAlgorithm();
      setTimeout(() => setIsPlaying(true), 50);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const speedOptions = [0.5, 1, 1.5, 2, 3, 4];

  return (
    <div className="bg-slate-900 border-t border-slate-700 px-4 py-3">
      {/* Description bar */}
      {currentStepData && (
        <div className="mb-3 px-3 py-2 bg-slate-800 rounded-lg text-sm text-slate-300 min-h-[36px] flex items-center gap-2">
          <span className="text-blue-400 font-mono text-xs flex-shrink-0">步骤 {currentStep + 1}/{steps.length}</span>
          <span>{(currentStepData as any).description || ''}</span>
        </div>
      )}

      {/* Progress slider */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs text-slate-500 font-mono w-8 text-right">{currentStep + 1}</span>
        <input
          type="range"
          min={0}
          max={Math.max(0, steps.length - 1)}
          value={currentStep}
          onChange={handleSliderChange}
          className="flex-1 h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
          disabled={steps.length === 0}
        />
        <span className="text-xs text-slate-500 font-mono w-8">{steps.length}</span>
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between gap-4">
        {/* Playback controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentStep(0)}
            disabled={steps.length === 0}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="跳到开头"
          >
            ⏮
          </button>
          <button
            onClick={stepBackward}
            disabled={steps.length === 0 || currentStep === 0}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="上一步"
          >
            ◀
          </button>
          <button
            onClick={handlePlayPause}
            className={`px-5 py-2 rounded-lg font-semibold text-sm transition-colors ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            title={isPlaying ? '暂停' : '播放'}
          >
            {isPlaying ? '⏸ 暂停' : '▶ 播放'}
          </button>
          <button
            onClick={stepForward}
            disabled={steps.length === 0 || currentStep >= steps.length - 1}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="下一步"
          >
            ▶
          </button>
          <button
            onClick={() => setCurrentStep(steps.length - 1)}
            disabled={steps.length === 0}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="跳到末尾"
          >
            ⏭
          </button>
          <button
            onClick={reset}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="重置"
          >
            ↺
          </button>
        </div>

        {/* Speed control */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">速度:</span>
          <div className="flex gap-1">
            {speedOptions.map(s => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
                  speed === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
