import React, { useState } from 'react';
import { useAlgorithmStore } from '../store';
import type { KnapsackStep, KnapsackItem } from '../types';

const KnapsackConfig: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { knapsackItems, knapsackCapacity, setKnapsackItems, runAlgorithm } = useAlgorithmStore();
  const [items, setItems] = useState<KnapsackItem[]>(knapsackItems);
  const [capacity, setCapacity] = useState(knapsackCapacity);

  const updateItem = (i: number, field: keyof KnapsackItem, value: string | number) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: field === 'name' ? value : Number(value) };
    setItems(updated);
  };

  const addItem = () => setItems([...items, { name: `物品${items.length + 1}`, weight: 1, value: 1 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  const handleApply = () => {
    setKnapsackItems(items, capacity);
    runAlgorithm();
    onClose();
  };

  return (
    <div className="absolute top-2 left-2 z-10 bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-2xl w-80">
      <h3 className="font-semibold text-white mb-3">背包问题配置</h3>
      <div className="mb-3">
        <label className="text-xs text-slate-400">背包容量</label>
        <input
          type="number"
          min={1}
          value={capacity}
          onChange={e => setCapacity(Number(e.target.value))}
          className="w-full mt-1 bg-slate-800 border border-slate-600 rounded p-1.5 text-white text-sm"
        />
      </div>
      <div className="max-h-48 overflow-y-auto space-y-2 mb-3">
        {items.map((item, i) => (
          <div key={i} className="flex gap-1 items-center">
            <input
              value={item.name}
              onChange={e => updateItem(i, 'name', e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-600 rounded p-1 text-white text-xs"
              placeholder="名称"
            />
            <input
              type="number"
              min={1}
              value={item.weight}
              onChange={e => updateItem(i, 'weight', e.target.value)}
              className="w-12 bg-slate-800 border border-slate-600 rounded p-1 text-white text-xs text-center"
              title="重量"
            />
            <input
              type="number"
              min={1}
              value={item.value}
              onChange={e => updateItem(i, 'value', e.target.value)}
              className="w-12 bg-slate-800 border border-slate-600 rounded p-1 text-white text-xs text-center"
              title="价值"
            />
            <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-300 text-xs px-1">✕</button>
          </div>
        ))}
      </div>
      <div className="text-xs text-slate-500 mb-2">← 名称 | 重量 | 价值 →</div>
      <div className="flex gap-2">
        <button onClick={addItem} className="bg-slate-700 text-white text-xs py-1.5 px-3 rounded-lg hover:bg-slate-600">+ 添加</button>
        <button onClick={handleApply} className="flex-1 bg-blue-600 text-white text-sm py-1.5 rounded-lg hover:bg-blue-700">应用</button>
        <button onClick={onClose} className="bg-slate-800 text-slate-400 text-xs py-1.5 px-2 rounded-lg">✕</button>
      </div>
    </div>
  );
};

export const DPVisualizer: React.FC = () => {
  const { steps, currentStep, knapsackItems, knapsackCapacity } = useAlgorithmStore();
  const [showConfig, setShowConfig] = useState(false);
  const step = steps[currentStep] as KnapsackStep | undefined;

  if (!step) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4 relative">
        {showConfig && <KnapsackConfig onClose={() => setShowConfig(false)} />}
        <div className="text-6xl">🎒</div>
        <p className="text-lg">点击"生成步骤"开始背包问题可视化</p>
        <button onClick={() => setShowConfig(true)} className="text-blue-400 bg-slate-800 px-4 py-2 rounded-lg text-sm">⚙ 配置物品</button>
      </div>
    );
  }

  const { dp, currentItem, currentWeight, decision, selectedItems, tracePath } = step;
  const n = knapsackItems.length;
  const W = knapsackCapacity;

  const cellMaxVal = Math.max(...dp.flat(), 1);

  const getCellStyle = (i: number, w: number) => {
    const isTrace = tracePath.some(([ti, tw]) => ti === i && tw === w);
    const isCurrent = i === currentItem && w === currentWeight;
    const isSelected = selectedItems.length > 0 && tracePath.some(([ti, tw]) => ti === i && tw === w);

    if (isCurrent) {
      if (decision === 'take') return 'bg-green-600 text-white font-bold ring-2 ring-green-400';
      if (decision === 'skip') return 'bg-blue-700 text-white font-bold ring-2 ring-blue-400';
      if (decision === 'compare') return 'bg-yellow-700 text-white font-bold ring-2 ring-yellow-400';
      return 'bg-blue-600 text-white font-bold ring-2 ring-blue-400';
    }
    if (isTrace && selectedItems.length > 0) return 'bg-purple-700 text-white';
    if (isTrace) return 'bg-slate-600 text-white';
    if (i === currentItem) return 'bg-slate-700 text-slate-300';
    if (dp[i][w] > 0) {
      const intensity = dp[i][w] / cellMaxVal;
      const alpha = Math.round(intensity * 180);
      return '';
    }
    return '';
  };

  const getCellBg = (i: number, w: number): string => {
    const isTrace = tracePath.some(([ti, tw]) => ti === i && tw === w);
    const isCurrent = i === currentItem && w === currentWeight;
    if (isCurrent && decision === 'take') return '#16a34a';
    if (isCurrent && decision === 'skip') return '#1d4ed8';
    if (isCurrent && decision === 'compare') return '#b45309';
    if (isCurrent) return '#2563eb';
    if (isTrace && selectedItems.length > 0) return '#7e22ce';
    if (isTrace) return '#475569';
    return '';
  };

  const cellW = Math.max(28, Math.min(48, Math.floor(600 / (W + 2))));
  const cellH = 26;

  return (
    <div className="flex-1 flex gap-4 overflow-hidden p-4 relative">
      {showConfig && <KnapsackConfig onClose={() => setShowConfig(false)} />}

      {/* Items panel */}
      <div className="w-52 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-semibold text-sm">物品列表</h3>
          <button onClick={() => setShowConfig(true)} className="text-blue-400 text-xs bg-slate-800 px-2 py-1 rounded">⚙</button>
        </div>
        <div className="bg-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-700 text-slate-400">
                <th className="px-2 py-2 text-left">物品</th>
                <th className="px-2 py-2">重量</th>
                <th className="px-2 py-2">价值</th>
              </tr>
            </thead>
            <tbody>
              {knapsackItems.map((item, i) => {
                const isActive = i + 1 === currentItem;
                const isSelected = selectedItems.includes(i);
                return (
                  <tr
                    key={i}
                    className={`transition-colors ${isActive ? 'bg-blue-900/40' : isSelected ? 'bg-green-900/40' : 'hover:bg-slate-750'}`}
                  >
                    <td className="px-2 py-1.5 text-left">
                      <span className={isSelected ? 'text-green-400 font-bold' : 'text-slate-300'}>{item.name}</span>
                      {isSelected && <span className="ml-1 text-green-500">✓</span>}
                    </td>
                    <td className="px-2 py-1.5 text-center text-slate-400">{item.weight}</td>
                    <td className="px-2 py-1.5 text-center text-yellow-400">{item.value}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Selected items */}
        {selectedItems.length > 0 && (
          <div className="mt-3 bg-green-900/20 border border-green-800 rounded-xl p-3">
            <div className="text-xs text-green-400 font-semibold mb-1">最优选择</div>
            {selectedItems.map(i => (
              <div key={i} className="text-xs text-slate-300">{knapsackItems[i]?.name}</div>
            ))}
            <div className="mt-1 text-green-400 font-bold text-sm">总价值: {step.totalValue}</div>
          </div>
        )}

        {/* Decision indicator */}
        {decision && decision !== 'init' && (
          <div className={`mt-3 rounded-xl p-3 text-xs font-semibold text-center ${
            decision === 'take' ? 'bg-green-900/40 text-green-400' :
            decision === 'skip' ? 'bg-blue-900/40 text-blue-400' :
            'bg-yellow-900/40 text-yellow-400'
          }`}>
            {decision === 'take' ? '✓ 选择取物品' : decision === 'skip' ? '↷ 跳过物品' : '⚖ 比较中...'}
          </div>
        )}

        {/* Current cell info */}
        {currentItem >= 1 && (
          <div className="mt-3 bg-slate-800 rounded-xl p-3 text-xs space-y-1">
            <div className="text-slate-400">当前: dp[{currentItem}][{currentWeight}]</div>
            <div className="text-white font-bold">{dp[currentItem]?.[currentWeight] ?? 0}</div>
          </div>
        )}
      </div>

      {/* DP Table */}
      <div className="flex-1 overflow-auto">
        <h3 className="text-white font-semibold text-sm mb-2">DP 决策矩阵</h3>
        <div className="overflow-auto">
          <table className="border-collapse text-xs font-mono">
            <thead>
              <tr>
                <th className="sticky left-0 bg-slate-900 px-2 py-1 text-slate-500 z-10">i\w</th>
                {Array.from({ length: W + 1 }, (_, w) => (
                  <th key={w} className="text-slate-500 text-center" style={{ width: cellW, height: cellH }}>
                    {w}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dp.map((row, i) => (
                <tr key={i}>
                  <td className="sticky left-0 bg-slate-900 px-2 py-0.5 text-slate-400 z-10 font-bold">
                    {i === 0 ? '∅' : knapsackItems[i - 1]?.name ?? `i${i}`}
                  </td>
                  {row.map((val, w) => {
                    const bg = getCellBg(i, w);
                    const isCurrent = i === currentItem && w === currentWeight;
                    return (
                      <td
                        key={w}
                        className="text-center border border-slate-800 transition-all duration-100"
                        style={{
                          width: cellW,
                          height: cellH,
                          background: bg || (val > 0 ? `rgba(59, 130, 246, ${0.08 + (val / cellMaxVal) * 0.25})` : '#1e293b'),
                          color: isCurrent ? '#fff' : val > 0 ? '#e2e8f0' : '#475569',
                          boxShadow: isCurrent ? `0 0 8px ${bg}` : 'none',
                        }}
                      >
                        {val}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-3 text-xs">
          {[
            { color: '#2563eb', label: '当前格' },
            { color: '#16a34a', label: '取物品' },
            { color: '#1d4ed8', label: '不取' },
            { color: '#b45309', label: '比较中' },
            { color: '#7e22ce', label: '最优路径' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
              <span className="text-slate-400">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
