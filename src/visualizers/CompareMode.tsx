import React from 'react';
import { useAlgorithmStore } from '../store';
import { SortingVisualizer } from './SortingVisualizer';
import { SearchVisualizer } from './SearchVisualizer';
import type { SortStep } from '../types';

const ALGORITHM_LABELS: Record<string, string> = {
  'quick-sort': '快速排序',
  'merge-sort': '归并排序',
  'bubble-sort': '冒泡排序',
  'heap-sort': '堆排序',
  'insertion-sort': '插入排序',
  'binary-search': '二分查找',
};

const CompareStepControl: React.FC<{ isPrimary: boolean }> = ({ isPrimary }) => {
  const {
    steps, currentStep, compareSteps, compareCurrentStep,
    setCurrentStep, setCompareCurrentStep,
  } = useAlgorithmStore();

  const theSteps = isPrimary ? steps : compareSteps;
  const theCurrentStep = isPrimary ? currentStep : compareCurrentStep;
  const setStepper = isPrimary ? setCurrentStep : setCompareCurrentStep;

  const step = theSteps[theCurrentStep] as any;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setStepper(Math.max(0, theCurrentStep - 1))}
          disabled={theCurrentStep === 0}
          className="px-2 py-1 bg-slate-700 rounded text-slate-300 text-xs disabled:opacity-40 hover:bg-slate-600"
        >
          ◀
        </button>
        <span className="text-xs text-slate-500 font-mono">{theCurrentStep + 1}/{theSteps.length}</span>
        <button
          onClick={() => setStepper(Math.min(theSteps.length - 1, theCurrentStep + 1))}
          disabled={theCurrentStep >= theSteps.length - 1}
          className="px-2 py-1 bg-slate-700 rounded text-slate-300 text-xs disabled:opacity-40 hover:bg-slate-600"
        >
          ▶
        </button>
      </div>
      {step && (
        <div className="text-xs text-slate-400 px-1 leading-snug">{step.description?.slice(0, 60)}...</div>
      )}
    </div>
  );
};

const SortCompareChart: React.FC<{ steps: SortStep[]; currentStep: number; label: string; color: string }> = ({ steps, currentStep, label, color }) => {
  const step = steps[currentStep] as SortStep | undefined;
  if (!step) return <div className="bg-slate-800 rounded-xl p-4 text-slate-500 text-center">请运行算法</div>;

  const arr = step.array;
  const maxVal = Math.max(...arr, 1);
  const barWidth = Math.max(16, Math.min(40, Math.floor(380 / arr.length) - 2));

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700">
        <span className="font-semibold text-sm" style={{ color }}>{label}</span>
        <div className="flex gap-3 text-xs text-slate-500">
          <span>比较: <strong className="text-yellow-400">{step.comparisons}</strong></span>
          <span>交换: <strong className="text-red-400">{step.swaps}</strong></span>
          <span>已排序: <strong className="text-green-400">{step.sorted.length}/{arr.length}</strong></span>
        </div>
      </div>
      <div className="flex items-end justify-center p-3 gap-0.5" style={{ height: 160 }}>
        {arr.map((val, idx) => {
          const heightPct = (val / maxVal) * 100;
          let barColor = '#475569';
          if (step.sorted.includes(idx)) barColor = '#22c55e';
          else if (step.swapping.includes(idx)) barColor = '#ef4444';
          else if (step.comparing.includes(idx)) barColor = '#f59e0b';
          else if (step.pivot === idx) barColor = '#a855f7';

          return (
            <div
              key={idx}
              className="flex-shrink-0 rounded-t transition-all duration-100"
              style={{
                width: barWidth,
                height: `${heightPct}%`,
                background: barColor,
                minHeight: 2,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export const CompareMode: React.FC = () => {
  const {
    selectedAlgorithm, compareAlgorithm,
    steps, currentStep,
    compareSteps, compareCurrentStep,
    runAlgorithm, runCompareAlgorithm,
    category,
  } = useAlgorithmStore();

  const primaryStep = steps[currentStep] as any;
  const compareStep = compareSteps[compareCurrentStep] as any;

  const isSortingCompare = category === 'sorting' && compareAlgorithm &&
    ['quick-sort', 'merge-sort', 'bubble-sort', 'heap-sort', 'insertion-sort'].includes(compareAlgorithm);

  return (
    <div className="flex-1 flex flex-col gap-4 p-4 overflow-y-auto">
      <div className="flex items-center gap-4">
        <h2 className="text-white font-semibold text-lg">⚖ 算法对比模式</h2>
        <div className="flex gap-2">
          <button
            onClick={() => { runAlgorithm(); runCompareAlgorithm(); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm"
          >
            同步运行两个算法
          </button>
        </div>
      </div>

      {!compareAlgorithm ? (
        <div className="flex-1 flex items-center justify-center text-slate-500">
          <div className="text-center">
            <div className="text-4xl mb-3">⚖</div>
            <p>请从左侧算法列表中选择一个对比算法</p>
          </div>
        </div>
      ) : (
        <>
          {/* Side by side visualization */}
          <div className="grid grid-cols-2 gap-4">
            {isSortingCompare ? (
              <>
                <SortCompareChart
                  steps={steps as SortStep[]}
                  currentStep={currentStep}
                  label={ALGORITHM_LABELS[selectedAlgorithm] || selectedAlgorithm}
                  color="#3b82f6"
                />
                <SortCompareChart
                  steps={compareSteps as SortStep[]}
                  currentStep={compareCurrentStep}
                  label={ALGORITHM_LABELS[compareAlgorithm] || compareAlgorithm}
                  color="#a855f7"
                />
              </>
            ) : (
              <>
                <div className="bg-slate-900 rounded-xl border border-slate-700 p-4">
                  <div className="font-semibold text-blue-400 mb-2">{ALGORITHM_LABELS[selectedAlgorithm] || selectedAlgorithm}</div>
                  {primaryStep && (
                    <p className="text-sm text-slate-300">{primaryStep.description}</p>
                  )}
                </div>
                <div className="bg-slate-900 rounded-xl border border-slate-700 p-4">
                  <div className="font-semibold text-purple-400 mb-2">{ALGORITHM_LABELS[compareAlgorithm] || compareAlgorithm}</div>
                  {compareStep && (
                    <p className="text-sm text-slate-300">{compareStep.description}</p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 rounded-xl border border-blue-800 p-3">
              <div className="text-blue-400 text-xs font-semibold mb-2">{ALGORITHM_LABELS[selectedAlgorithm] || selectedAlgorithm} 控制</div>
              <CompareStepControl isPrimary={true} />
            </div>
            <div className="bg-slate-900 rounded-xl border border-purple-800 p-3">
              <div className="text-purple-400 text-xs font-semibold mb-2">{ALGORITHM_LABELS[compareAlgorithm] || compareAlgorithm} 控制</div>
              <CompareStepControl isPrimary={false} />
            </div>
          </div>

          {/* Comparison table */}
          <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800 text-slate-400">
                  <th className="px-4 py-2 text-left">指标</th>
                  <th className="px-4 py-2 text-center text-blue-400">{ALGORITHM_LABELS[selectedAlgorithm] || selectedAlgorithm}</th>
                  <th className="px-4 py-2 text-center text-purple-400">{ALGORITHM_LABELS[compareAlgorithm] || compareAlgorithm}</th>
                  <th className="px-4 py-2 text-center">胜者</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    label: '总步骤数',
                    v1: steps.length,
                    v2: compareSteps.length,
                    lower: true,
                  },
                  ...(category === 'sorting' ? [
                    {
                      label: '最终比较次数',
                      v1: (steps[steps.length - 1] as SortStep)?.comparisons ?? 0,
                      v2: (compareSteps[compareSteps.length - 1] as SortStep)?.comparisons ?? 0,
                      lower: true,
                    },
                    {
                      label: '最终交换次数',
                      v1: (steps[steps.length - 1] as SortStep)?.swaps ?? 0,
                      v2: (compareSteps[compareSteps.length - 1] as SortStep)?.swaps ?? 0,
                      lower: true,
                    },
                  ] : []),
                ].map(({ label, v1, v2, lower }) => {
                  const winner = lower ? (v1 < v2 ? 1 : v1 > v2 ? 2 : 0) : (v1 > v2 ? 1 : v1 < v2 ? 2 : 0);
                  return (
                    <tr key={label} className="border-t border-slate-800">
                      <td className="px-4 py-2 text-slate-400">{label}</td>
                      <td className={`px-4 py-2 text-center font-mono ${winner === 1 ? 'text-blue-400 font-bold' : 'text-slate-300'}`}>{v1}</td>
                      <td className={`px-4 py-2 text-center font-mono ${winner === 2 ? 'text-purple-400 font-bold' : 'text-slate-300'}`}>{v2}</td>
                      <td className="px-4 py-2 text-center">
                        {winner === 0 ? <span className="text-slate-500">平局</span> :
                         winner === 1 ? <span className="text-blue-400">🏆 算法1</span> :
                         <span className="text-purple-400">🏆 算法2</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
