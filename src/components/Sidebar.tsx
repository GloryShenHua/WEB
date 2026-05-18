import React from 'react';
import { useAlgorithmStore } from '../store';

interface AlgorithmEntry {
  id: string;
  name: string;
  complexity: string;
}

interface Category {
  id: string;
  label: string;
  icon: string;
  algorithms: AlgorithmEntry[];
}

const CATEGORIES: Category[] = [
  {
    id: 'sorting',
    label: '排序算法',
    icon: '⚡',
    algorithms: [
      { id: 'quick-sort', name: '快速排序', complexity: 'O(n log n)' },
      { id: 'merge-sort', name: '归并排序', complexity: 'O(n log n)' },
      { id: 'bubble-sort', name: '冒泡排序', complexity: 'O(n²)' },
      { id: 'heap-sort', name: '堆排序', complexity: 'O(n log n)' },
      { id: 'insertion-sort', name: '插入排序', complexity: 'O(n²)' },
    ],
  },
  {
    id: 'graph',
    label: '图算法',
    icon: '🕸️',
    algorithms: [
      { id: 'dijkstra', name: 'Dijkstra', complexity: 'O(V²)' },
      { id: 'bfs', name: 'BFS 广度优先', complexity: 'O(V+E)' },
      { id: 'dfs', name: 'DFS 深度优先', complexity: 'O(V+E)' },
      { id: 'prim', name: "Prim's MST", complexity: 'O(V²)' },
      { id: 'kruskal', name: "Kruskal's MST", complexity: 'O(E log E)' },
      { id: 'astar', name: 'A* 启发搜索', complexity: 'O(b^d)' },
    ],
  },
  {
    id: 'search',
    label: '搜索算法',
    icon: '🔍',
    algorithms: [
      { id: 'binary-search', name: '二分查找', complexity: 'O(log n)' },
    ],
  },
  {
    id: 'dp',
    label: '动态规划',
    icon: '📊',
    algorithms: [
      { id: 'knapsack', name: '0/1 背包问题', complexity: 'O(nW)' },
    ],
  },
  {
    id: 'backtracking',
    label: '回溯算法',
    icon: '♟️',
    algorithms: [
      { id: 'n-queens', name: 'N 皇后问题', complexity: 'O(n!)' },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const { selectedAlgorithm, setAlgorithm, compareMode, toggleCompareMode, compareAlgorithm, setCompareAlgorithm, steps, runAlgorithm } = useAlgorithmStore();
  const [expandedCategory, setExpandedCategory] = React.useState<string>('sorting');

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">算法选择</h2>
        <div className="space-y-1">
          {CATEGORIES.map(cat => (
            <div key={cat.id}>
              <button
                onClick={() => setExpandedCategory(expandedCategory === cat.id ? '' : cat.id)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </span>
                <span className={`transform transition-transform ${expandedCategory === cat.id ? 'rotate-180' : ''}`}>▾</span>
              </button>

              {expandedCategory === cat.id && (
                <div className="ml-2 mt-1 space-y-1">
                  {cat.algorithms.map(alg => {
                    const isSelected = selectedAlgorithm === alg.id;
                    const isCompare = compareAlgorithm === alg.id;
                    return (
                      <button
                        key={alg.id}
                        onClick={() => {
                          if (compareMode) {
                            setCompareAlgorithm(alg.id as any);
                          } else {
                            setAlgorithm(alg.id as any);
                          }
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                          isSelected && !compareMode
                            ? 'bg-blue-600 text-white'
                            : isCompare && compareMode
                            ? 'bg-purple-600 text-white'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="font-medium">{alg.name}</div>
                        <div className="text-slate-500 text-xs mt-0.5">{alg.complexity}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-b border-slate-700">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">对比模式</h2>
        <button
          onClick={toggleCompareMode}
          className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            compareMode
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          {compareMode ? '✓ 对比模式开启' : '⚖️ 启用对比模式'}
        </button>
        {compareMode && (
          <p className="text-xs text-slate-500 mt-2">
            {compareAlgorithm ? `对比算法：已选择` : '请从上方选择对比算法'}
          </p>
        )}
      </div>

      <div className="p-4 mt-auto border-t border-slate-700">
        <div className="text-xs text-slate-500 mb-2">
          {steps.length > 0 ? `共 ${steps.length} 个执行步骤` : '点击下方按钮开始'}
        </div>
        <button
          onClick={runAlgorithm}
          className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          ▶ 生成步骤
        </button>
      </div>
    </aside>
  );
};
