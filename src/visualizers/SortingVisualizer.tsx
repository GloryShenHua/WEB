import React, { useState } from 'react';
import { useAlgorithmStore } from '../store';
import type { SortStep } from '../types';

const BAR_COLORS: Record<string, string> = {
  default: '#475569',
  comparing: '#f59e0b',
  swapping: '#ef4444',
  sorted: '#22c55e',
  pivot: '#a855f7',
  range: '#3b82f6',
  merge: '#06b6d4',
};

interface InputConfigProps {
  onClose: () => void;
}

const SortInputConfig: React.FC<InputConfigProps> = ({ onClose }) => {
  const { sortArray, setSortArray, runAlgorithm, selectedAlgorithm } = useAlgorithmStore();
  const [inputText, setInputText] = useState(sortArray.join(', '));
  const [error, setError] = useState('');

  const handleApply = () => {
    const nums = inputText.split(/[,\s]+/).map(Number).filter(n => !isNaN(n));
    if (nums.length < 2) { setError('请输入至少 2 个数字'); return; }
    if (nums.length > 50) { setError('最多支持 50 个数字'); return; }
    setSortArray(nums);
    runAlgorithm();
    onClose();
  };

  const handleRandom = (n: number) => {
    const arr = Array.from({ length: n }, () => Math.floor(Math.random() * 99) + 1);
    setInputText(arr.join(', '));
    setSortArray(arr);
    runAlgorithm();
    onClose();
  };

  return (
    <div className="absolute top-2 left-2 z-10 bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-2xl w-80">
      <h3 className="font-semibold text-white mb-3">配置排序数组</h3>
      <textarea
        value={inputText}
        onChange={e => { setInputText(e.target.value); setError(''); }}
        className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-sm font-mono text-white h-20 resize-none"
        placeholder="输入数字，用逗号或空格分隔"
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      <div className="flex gap-2 mt-2">
        <button onClick={handleApply} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-1.5 rounded-lg">应用</button>
        <button onClick={() => handleRandom(10)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-sm py-1.5 rounded-lg">随机(10)</button>
        <button onClick={() => handleRandom(20)} className="bg-slate-700 hover:bg-slate-600 text-white text-sm py-1.5 px-2 rounded-lg">20</button>
        <button onClick={onClose} className="bg-slate-800 hover:bg-slate-700 text-slate-400 text-sm py-1.5 px-2 rounded-lg">✕</button>
      </div>
    </div>
  );
};

export const SortingVisualizer: React.FC = () => {
  const { steps, currentStep } = useAlgorithmStore();
  const [showConfig, setShowConfig] = useState(false);

  const step = steps[currentStep] as SortStep | undefined;

  if (!step) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 relative">
        {showConfig && <SortInputConfig onClose={() => setShowConfig(false)} />}
        <div className="text-6xl mb-4">📊</div>
        <p className="text-lg">点击"生成步骤"开始排序可视化</p>
        <p className="text-sm mt-2">或先<button onClick={() => setShowConfig(true)} className="text-blue-400 underline mx-1">配置输入数组</button>再运行</p>
      </div>
    );
  }

  const arr = step.array;
  const maxVal = Math.max(...arr, 1);
  const barWidth = Math.max(20, Math.min(60, Math.floor(700 / arr.length) - 4));

  const getBarColor = (idx: number) => {
    if (step.sorted.includes(idx)) return BAR_COLORS.sorted;
    if (step.swapping.includes(idx)) return BAR_COLORS.swapping;
    if (step.comparing.includes(idx)) return step.comparing.includes(step.pivot ?? -999) && idx === step.pivot ? BAR_COLORS.pivot : BAR_COLORS.comparing;
    if (step.pivot === idx) return BAR_COLORS.pivot;
    if (idx >= step.rangeLeft && idx <= step.rangeRight) return BAR_COLORS.range;
    return BAR_COLORS.default;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {showConfig && <SortInputConfig onClose={() => setShowConfig(false)} />}

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 pt-3 pb-1 text-xs">
        {Object.entries({ '比较': BAR_COLORS.comparing, '交换': BAR_COLORS.swapping, '已排序': BAR_COLORS.sorted, '基准值': BAR_COLORS.pivot, '当前范围': BAR_COLORS.range }).map(([label, color]) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
            <span className="text-slate-400">{label}</span>
          </div>
        ))}
        <button onClick={() => setShowConfig(!showConfig)} className="ml-auto text-blue-400 hover:text-blue-300 bg-slate-800 px-3 py-1 rounded-lg">
          ⚙ 配置数组
        </button>
      </div>

      {/* Bar chart */}
      <div className="flex-1 flex items-end justify-center px-8 pb-4 gap-1 overflow-hidden">
        {arr.map((val, idx) => {
          const color = getBarColor(idx);
          const heightPct = (val / maxVal) * 100;
          const isHighlighted = step.comparing.includes(idx) || step.swapping.includes(idx) || step.pivot === idx;

          return (
            <div
              key={idx}
              className="flex flex-col items-center justify-end flex-shrink-0 transition-all duration-150"
              style={{ width: barWidth, height: '100%' }}
            >
              <div className="text-xs text-slate-400 mb-1 font-mono leading-none" style={{ fontSize: barWidth < 30 ? '9px' : '11px' }}>
                {val}
              </div>
              <div
                className="w-full rounded-t transition-all duration-150"
                style={{
                  height: `${heightPct}%`,
                  background: color,
                  boxShadow: isHighlighted ? `0 0 12px ${color}` : 'none',
                  transform: isHighlighted ? 'scaleY(1.02)' : 'none',
                  transformOrigin: 'bottom',
                }}
              />
              <div className="text-xs text-slate-600 mt-0.5 font-mono" style={{ fontSize: '9px' }}>{idx}</div>
            </div>
          );
        })}
      </div>

      {/* Merge state info */}
      {step.mergeLeft !== undefined && (
        <div className="px-4 pb-2 flex gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-cyan-500" />
            <span className="text-slate-400">左半: [{step.mergeLeft.join(', ')}]</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-purple-500" />
            <span className="text-slate-400">右半: [{step.mergeRight?.join(', ')}]</span>
          </div>
        </div>
      )}
    </div>
  );
};
