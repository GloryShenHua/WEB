import React, { useState } from 'react';
import { useAlgorithmStore } from '../store';
import type { SearchStep } from '../types';

interface SearchConfigProps {
  onClose: () => void;
}

const SearchConfig: React.FC<SearchConfigProps> = ({ onClose }) => {
  const { searchArray, searchTarget, setSearchArray, runAlgorithm } = useAlgorithmStore();
  const [arrText, setArrText] = useState(searchArray.join(', '));
  const [target, setTarget] = useState(String(searchTarget));

  const handleApply = () => {
    const nums = arrText.split(/[,\s]+/).map(Number).filter(n => !isNaN(n));
    const sorted = [...new Set(nums)].sort((a, b) => a - b);
    setSearchArray(sorted, Number(target) || sorted[Math.floor(sorted.length / 2)]);
    runAlgorithm();
    onClose();
  };

  const handleRandom = () => {
    const n = 16;
    const arr = Array.from({ length: n }, (_, i) => i * 2 + 1);
    const t = arr[Math.floor(Math.random() * arr.length)];
    setArrText(arr.join(', '));
    setTarget(String(t));
    setSearchArray(arr, t);
    runAlgorithm();
    onClose();
  };

  return (
    <div className="absolute top-2 left-2 z-10 bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-2xl w-80">
      <h3 className="font-semibold text-white mb-3">配置二分查找</h3>
      <div className="mb-2">
        <label className="text-xs text-slate-400 mb-1 block">有序数组（将自动排序）</label>
        <input
          value={arrText}
          onChange={e => setArrText(e.target.value)}
          className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-sm font-mono text-white"
          placeholder="1, 3, 5, 7, 9..."
        />
      </div>
      <div className="mb-3">
        <label className="text-xs text-slate-400 mb-1 block">目标值</label>
        <input
          type="number"
          value={target}
          onChange={e => setTarget(e.target.value)}
          className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-sm font-mono text-white"
        />
      </div>
      <div className="flex gap-2">
        <button onClick={handleApply} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-1.5 rounded-lg">应用</button>
        <button onClick={handleRandom} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-sm py-1.5 rounded-lg">随机</button>
        <button onClick={onClose} className="bg-slate-800 text-slate-400 text-sm py-1.5 px-2 rounded-lg">✕</button>
      </div>
    </div>
  );
};

export const SearchVisualizer: React.FC = () => {
  const { steps, currentStep } = useAlgorithmStore();
  const [showConfig, setShowConfig] = useState(false);
  const step = steps[currentStep] as SearchStep | undefined;

  if (!step) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 relative">
        {showConfig && <SearchConfig onClose={() => setShowConfig(false)} />}
        <div className="text-6xl mb-4">🔍</div>
        <p className="text-lg">点击"生成步骤"开始二分查找可视化</p>
        <p className="text-sm mt-2">或先<button onClick={() => setShowConfig(true)} className="text-blue-400 underline mx-1">配置输入</button>再运行</p>
      </div>
    );
  }

  const { array, left, right, mid, target, found, eliminated } = step;

  const getCellStyle = (idx: number) => {
    if (found && idx === mid) return { bg: 'bg-green-500', text: 'text-white', border: 'border-green-400', glow: '0 0 16px #22c55e' };
    if (found === false) return { bg: 'bg-red-900/40', text: 'text-red-400', border: 'border-red-700', glow: 'none' };
    if (idx === mid) return { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-400', glow: '0 0 12px #3b82f6' };
    if (idx === left && idx === right) return { bg: 'bg-yellow-700/50', text: 'text-yellow-200', border: 'border-yellow-500', glow: 'none' };
    if (idx === left || idx === right) return { bg: 'bg-yellow-600/40', text: 'text-yellow-300', border: 'border-yellow-600', glow: 'none' };
    if (idx >= left && idx <= right) return { bg: 'bg-slate-700', text: 'text-white', border: 'border-slate-500', glow: 'none' };
    return { bg: 'bg-slate-900', text: 'text-slate-600', border: 'border-slate-800', glow: 'none' };
  };

  const getLabel = (idx: number) => {
    const labels = [];
    if (idx === left) labels.push('L');
    if (idx === right) labels.push('R');
    if (idx === mid) labels.push('M');
    return labels.join('/');
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8 relative">
      {showConfig && <SearchConfig onClose={() => setShowConfig(false)} />}

      <button onClick={() => setShowConfig(!showConfig)} className="absolute top-3 right-3 text-blue-400 bg-slate-800 px-3 py-1 rounded-lg text-sm">
        ⚙ 配置
      </button>

      {/* Target display */}
      <div className="flex items-center gap-4">
        <span className="text-slate-400 text-sm">查找目标：</span>
        <div className="bg-purple-600 text-white font-bold text-2xl w-14 h-14 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
          {target}
        </div>
        {found === true && <span className="text-green-400 text-lg font-semibold">✓ 已找到！位于索引 {mid}</span>}
        {found === false && <span className="text-red-400 text-lg font-semibold">✗ 未找到</span>}
      </div>

      {/* Array display */}
      <div className="flex flex-wrap justify-center gap-2 px-8">
        {array.map((val, idx) => {
          const style = getCellStyle(idx);
          const label = getLabel(idx);
          return (
            <div key={idx} className="flex flex-col items-center gap-1">
              {/* Pointer labels */}
              <div className="h-5 text-xs font-mono font-bold text-center" style={{ minWidth: 40 }}>
                {label && <span className={
                  label.includes('M') ? 'text-blue-400' : 'text-yellow-400'
                }>{label}</span>}
              </div>
              {/* Cell */}
              <div
                className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center font-bold text-lg font-mono transition-all duration-200 ${style.bg} ${style.text} ${style.border}`}
                style={{ boxShadow: style.glow }}
              >
                {val}
              </div>
              {/* Index */}
              <div className="text-xs text-slate-600 font-mono">{idx}</div>
            </div>
          );
        })}
      </div>

      {/* Range indicator */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-600" />
          <span className="text-slate-400">mid = {mid >= 0 ? mid : '-'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-yellow-600/60 border border-yellow-600" />
          <span className="text-slate-400">范围 [{left}, {right}]</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-slate-900 border border-slate-700" />
          <span className="text-slate-400">已排除</span>
        </div>
      </div>

      {/* Complexity indicator */}
      <div className="flex gap-6 text-sm text-slate-400 bg-slate-900 rounded-xl px-6 py-3">
        <span>比较次数: <strong className="text-yellow-400">{step.comparisons}</strong></span>
        <span>理论上限: <strong className="text-blue-400">⌈log₂({array.length})⌉ = {Math.ceil(Math.log2(array.length))}</strong></span>
      </div>
    </div>
  );
};
