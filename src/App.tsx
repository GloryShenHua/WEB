import React, { Suspense, lazy } from 'react';
import { useAlgorithmStore } from './store';
import { Sidebar } from './components/Sidebar';
import { ControlPanel } from './components/ControlPanel';
import { MetricsPanel } from './components/MetricsPanel';
import { EvaluationPanel } from './components/EvaluationPanel';
import { SortingVisualizer } from './visualizers/SortingVisualizer';
import { GraphVisualizer } from './visualizers/GraphVisualizer';
import { NQueensVisualizer } from './visualizers/NQueensVisualizer';
import { DPVisualizer } from './visualizers/DPVisualizer';
import { SearchVisualizer } from './visualizers/SearchVisualizer';
import { CompareMode } from './visualizers/CompareMode';

const ThreeDView = lazy(() => import('./components/ThreeDView').then(m => ({ default: m.ThreeDView })));

const ALGORITHM_LABELS: Record<string, string> = {
  'quick-sort': '快速排序',
  'merge-sort': '归并排序',
  'bubble-sort': '冒泡排序',
  'heap-sort': '堆排序',
  'insertion-sort': '插入排序',
  'binary-search': '二分查找',
  'dijkstra': 'Dijkstra',
  'bfs': 'BFS',
  'dfs': 'DFS',
  'prim': "Prim's MST",
  'kruskal': "Kruskal's MST",
  'astar': 'A*',
  'knapsack': '0/1 背包',
  'n-queens': 'N 皇后',
};

const VisualizerContent: React.FC = () => {
  const { category, compareMode, activePanel } = useAlgorithmStore();

  if (activePanel === 'evaluation') return <EvaluationPanel />;
  if (activePanel === '3d') {
    return (
      <Suspense fallback={<div className="flex-1 flex items-center justify-center text-slate-400">加载 3D 视图...</div>}>
        <ThreeDView />
      </Suspense>
    );
  }

  if (compareMode) return <CompareMode />;

  switch (category) {
    case 'sorting': return <SortingVisualizer />;
    case 'graph': return <GraphVisualizer />;
    case 'dp': return <DPVisualizer />;
    case 'backtracking': return <NQueensVisualizer />;
    case 'search': return <SearchVisualizer />;
    default: return <SortingVisualizer />;
  }
};

const App: React.FC = () => {
  const { selectedAlgorithm, activePanel, setActivePanel, compareMode } = useAlgorithmStore();

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-white overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 bg-slate-900 border-b border-slate-700 flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-lg font-bold">
            λ
          </div>
          <div>
            <h1 className="font-bold text-white leading-none">算法与复杂度可视化学习平台</h1>
            <p className="text-xs text-slate-500 leading-none mt-0.5">Algorithm & Complexity Visualization</p>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="flex gap-1">
          {[
            { id: 'visualizer' as const, label: '可视化', icon: '⚡' },
            { id: 'evaluation' as const, label: '评估系统', icon: '📝' },
            { id: '3d' as const, label: '3D 视图', icon: '🌐' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActivePanel(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activePanel === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Current algorithm badge */}
        <div className="flex items-center gap-2">
          {compareMode && (
            <span className="text-xs bg-purple-900/40 text-purple-400 border border-purple-700 px-2 py-1 rounded-lg">
              ⚖ 对比模式
            </span>
          )}
          <span className="text-xs text-slate-500">当前算法:</span>
          <span className="text-sm font-semibold text-blue-400 bg-blue-900/30 px-3 py-1 rounded-lg border border-blue-800">
            {ALGORITHM_LABELS[selectedAlgorithm] || selectedAlgorithm}
          </span>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - only in visualizer mode */}
        {activePanel === 'visualizer' && <Sidebar />}

        {/* Center content */}
        <main className="flex flex-col flex-1 overflow-hidden">
          {/* Visualization / Content */}
          <div className="flex flex-1 overflow-hidden">
            <VisualizerContent />
          </div>

          {/* Control panel - only in visualizer mode */}
          {activePanel === 'visualizer' && !compareMode && <ControlPanel />}
        </main>

        {/* Right metrics panel - only in visualizer mode */}
        {activePanel === 'visualizer' && !compareMode && <MetricsPanel />}
      </div>
    </div>
  );
};

export default App;
