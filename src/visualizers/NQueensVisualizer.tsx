import React, { useState } from 'react';
import { useAlgorithmStore } from '../store';
import type { NQueensStep } from '../types';

export const NQueensVisualizer: React.FC = () => {
  const { steps, currentStep, queensN, setQueensN, runAlgorithm } = useAlgorithmStore();
  const [showSolution, setShowSolution] = useState<number | null>(null);
  const step = steps[currentStep] as NQueensStep | undefined;

  if (!step) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-6">
        <div className="text-6xl">♛</div>
        <p className="text-lg">点击"生成步骤"开始 N 皇后可视化</p>
        <div className="flex items-center gap-4">
          <span className="text-slate-400">棋盘大小 N =</span>
          <div className="flex gap-2">
            {[4, 5, 6, 7, 8].map(n => (
              <button
                key={n}
                onClick={() => { setQueensN(n); setTimeout(runAlgorithm, 0); }}
                className={`w-10 h-10 rounded-lg font-bold transition-colors ${
                  queensN === n ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { board, n, conflicts, placing, removing, solutions, solutionsFound, currentRow, currentCol } = step;

  const renderBoard = (boardState: number[], highlighted?: [number, number][], conflictCells?: Array<[number, number]>, placingCell?: [number, number] | null, removingCell?: [number, number] | null) => {
    const cellSize = Math.min(56, Math.floor(400 / n));
    return (
      <div
        className="border-2 border-slate-600 rounded overflow-hidden"
        style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, ${cellSize}px)` }}
      >
        {Array.from({ length: n }, (_, row) =>
          Array.from({ length: n }, (_, col) => {
            const hasQueen = boardState[row] === col;
            const isConflict = conflictCells?.some(([r, c]) => r === row && c === col);
            const isPlacing = placingCell?.[0] === row && placingCell?.[1] === col;
            const isRemoving = removingCell?.[0] === row && removingCell?.[1] === col;
            const isCurrentCheck = row === currentRow && col === currentCol && !hasQueen;
            const isDark = (row + col) % 2 === 1;

            let bg = isDark ? '#1e3a5f' : '#2d4a6a';
            if (isConflict) bg = '#7f1d1d';
            else if (isRemoving) bg = '#78350f';
            else if (isPlacing && !hasQueen) bg = '#1e4d2b';
            else if (isCurrentCheck) bg = '#2d3a1c';

            return (
              <div
                key={`${row}-${col}`}
                className="flex items-center justify-center font-bold transition-all duration-100"
                style={{ width: cellSize, height: cellSize, background: bg, fontSize: cellSize * 0.55 }}
              >
                {hasQueen && (
                  <span
                    style={{
                      filter: isConflict ? 'drop-shadow(0 0 4px #ef4444)' : isRemoving ? 'drop-shadow(0 0 4px #f59e0b)' : 'drop-shadow(0 0 6px #22c55e)',
                      color: isConflict ? '#fca5a5' : isRemoving ? '#fde68a' : '#86efac',
                    }}
                  >
                    ♛
                  </span>
                )}
                {isCurrentCheck && (
                  <span className="opacity-40 text-slate-400">·</span>
                )}
              </div>
            );
          })
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex gap-6 overflow-hidden p-4">
      {/* Main board */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-4">
          <h3 className="text-white font-semibold">当前执行状态</h3>
          <div className="flex gap-2">
            {[4, 5, 6, 7, 8].map(size => (
              <button
                key={size}
                onClick={() => { setQueensN(size); setTimeout(runAlgorithm, 0); }}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  n === size ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {size}×{size}
              </button>
            ))}
          </div>
        </div>

        {renderBoard(board, undefined, conflicts, placing, removing)}

        {/* Status indicators */}
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ background: '#1e3a5f' }} />
            <span className="text-slate-400">空格</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ background: '#1e4d2b' }} />
            <span className="text-green-400">放置✓</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ background: '#7f1d1d' }} />
            <span className="text-red-400">冲突✗</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ background: '#78350f' }} />
            <span className="text-yellow-400">回溯↩</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 text-sm bg-slate-900 rounded-xl px-6 py-3">
          <div>
            <div className="text-2xl font-bold text-red-400">{step.backtracks}</div>
            <div className="text-xs text-slate-500">回溯次数</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">{solutionsFound}</div>
            <div className="text-xs text-slate-500">已找到的解</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">{currentRow >= 0 ? currentRow : n}</div>
            <div className="text-xs text-slate-500">当前行</div>
          </div>
        </div>

        {conflicts.length > 0 && (
          <div className="text-sm text-red-400 bg-red-900/20 px-4 py-2 rounded-lg">
            ⚠ 冲突皇后位于行: {conflicts.map(c => c[0]).join(', ')}
          </div>
        )}
      </div>

      {/* Solutions panel */}
      <div className="flex-1 overflow-y-auto">
        <h3 className="text-white font-semibold mb-3">
          已发现的解（{solutions.length}）
          {step.allSolutions && step.allSolutions.length > 0 && (
            <span className="text-slate-500 text-sm ml-2">
              / 共 {step.allSolutions.length} 个
            </span>
          )}
        </h3>
        <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-[400px]">
          {solutions.slice(0, 12).map((sol, i) => {
            const miniSize = Math.floor(140 / n);
            return (
              <div
                key={i}
                className="bg-slate-800 rounded-lg p-2 cursor-pointer hover:bg-slate-700 transition-colors"
                onClick={() => setShowSolution(showSolution === i ? null : i)}
              >
                <div className="text-xs text-slate-400 mb-2 font-mono">解 #{i + 1}: [{sol.join(', ')}]</div>
                <div
                  className="border border-slate-700 rounded overflow-hidden"
                  style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, ${miniSize}px)` }}
                >
                  {Array.from({ length: n }, (_, row) =>
                    Array.from({ length: n }, (_, col) => (
                      <div
                        key={`${row}-${col}`}
                        className="flex items-center justify-center"
                        style={{
                          width: miniSize,
                          height: miniSize,
                          background: (row + col) % 2 === 1 ? '#1e3a5f' : '#2d4a6a',
                          fontSize: miniSize * 0.65,
                        }}
                      >
                        {sol[row] === col && <span style={{ color: '#86efac' }}>♛</span>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {solutions.length > 12 && (
          <p className="text-slate-500 text-xs mt-2">还有 {solutions.length - 12} 个解（执行完成后显示全部）</p>
        )}
      </div>
    </div>
  );
};
