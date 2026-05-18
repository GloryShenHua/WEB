import React from 'react';
import { useAlgorithmStore } from '../store';
import type { SortStep, GraphStep, SearchStep, KnapsackStep, NQueensStep } from '../types';

const ALGORITHM_INFO: Record<string, {
  timeComplexity: { best: string; average: string; worst: string };
  spaceComplexity: string;
  description: string;
  pseudocode: string[];
}> = {
  'quick-sort': {
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
    spaceComplexity: 'O(log n)',
    description: '通过选择基准元素将数组分区，递归排序两个子数组。平均性能优异，但最坏情况退化为 O(n²)。',
    pseudocode: ['procedure quickSort(arr, low, high)', '  pivot = arr[high]  // 选择基准', '  i = low - 1', '  for j = low to high-1', '    if arr[j] ≤ pivot: swap(arr[++i], arr[j])', '  swap(arr[i+1], arr[high])', '  return i+1', '  // 递归处理子数组'],
  },
  'merge-sort': {
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    spaceComplexity: 'O(n)',
    description: '分治法排序：将数组递归地分成两半，分别排序后合并。时间复杂度稳定，但需要额外空间。',
    pseudocode: ['procedure mergeSort(arr, left, right)', '  mid = (left + right) / 2  // 分割', '  mergeSort(arr, left, mid)', '  mergeSort(arr, mid+1, right)', '  merge(arr, left, mid, right)  // 合并', '  // 合并两个有序子数组', '  while i < len(L) and j < len(R)', '  // end merge-sort'],
  },
  'bubble-sort': {
    timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
    description: '重复遍历数组，比较相邻元素并交换。每轮将最大元素"冒泡"到末尾。简单但效率低。',
    pseudocode: ['procedure bubbleSort(arr)', '  for i = 0 to n-1', '    for j = 0 to n-2-i: compare(arr[j], arr[j+1])', '    if arr[j] > arr[j+1]: swap(arr[j], arr[j+1])', '    // 最大元素已就位', '  // end bubble-sort'],
  },
  'heap-sort': {
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    spaceComplexity: 'O(1)',
    description: '利用堆数据结构排序。先建立最大堆，再依次取出堆顶元素。原地排序，但缓存不友好。',
    pseudocode: ['procedure heapSort(arr)', '  buildMaxHeap(arr)  // 建堆', '  for i = n-1 down to 1', '    swap(arr[0], arr[i])  // 堆顶与末尾交换', '    heapify(arr, i, 0)  // 重建堆', '  // end heap-sort'],
  },
  'insertion-sort': {
    timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
    description: '逐个将元素插入已排序部分的正确位置。小数组或基本有序数组效率高。',
    pseudocode: ['procedure insertionSort(arr)', '  for i = 1 to n-1', '    key = arr[i]  // 取出待插元素', '    j = i - 1; while j ≥ 0 and arr[j] > key: arr[j+1]=arr[j]; j--', '    arr[j+1] = key  // 插入正确位置', '  // end insertion-sort'],
  },
  'binary-search': {
    timeComplexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
    spaceComplexity: 'O(1)',
    description: '在有序数组中通过反复将搜索范围减半来定位目标值。每次比较排除一半元素。',
    pseudocode: ['procedure binarySearch(arr, target)', '  left=0, right=n-1', '  while left ≤ right', '  mid = (left+right)/2', '  if arr[mid] == target: return mid', '  elif arr[mid] < target: left=mid+1', '  else: right=mid-1'],
  },
  'dijkstra': {
    timeComplexity: { best: 'O(V log V)', average: 'O(V²)', worst: 'O(V²)' },
    spaceComplexity: 'O(V)',
    description: '计算从源点到所有节点的最短路径。贪心策略：每次选择当前最短路径节点扩展。适用于非负权图。',
    pseudocode: ['procedure dijkstra(G, src)', '  dist[src]=0, dist[v]=∞ for all other v', '  while unvisited nodes exist', '    u = unvisited node with min dist', '    for each neighbor v of u', '    if dist[u]+w(u,v) < dist[v]', '      dist[v] = dist[u] + w(u,v)'],
  },
  'bfs': {
    timeComplexity: { best: 'O(V+E)', average: 'O(V+E)', worst: 'O(V+E)' },
    spaceComplexity: 'O(V)',
    description: '广度优先搜索：从起点出发，逐层扩展访问邻居节点。使用队列，找到的路径在无权图中是最短的。',
    pseudocode: ['procedure BFS(G, start)', '  queue.enqueue(start)', '  visited.add(start)', '  while queue not empty', '    u = queue.dequeue()', '    for each neighbor v of u', '      if v not visited: queue.enqueue(v)'],
  },
  'dfs': {
    timeComplexity: { best: 'O(V+E)', average: 'O(V+E)', worst: 'O(V+E)' },
    spaceComplexity: 'O(V)',
    description: '深度优先搜索：沿着一条路径尽可能深入，再回溯。使用栈（或递归）。适合检测环、拓扑排序。',
    pseudocode: ['procedure DFS(G, u)', '  visited.add(u)', '  for each neighbor v of u', '    if v not visited', '      DFS(G, v)  // 递归深入'],
  },
  'prim': {
    timeComplexity: { best: 'O(E log V)', average: 'O(V²)', worst: 'O(V²)' },
    spaceComplexity: 'O(V)',
    description: "Prim 最小生成树算法：从一个节点出发，每次选择连接已选集合和未选节点的最小权边。",
    pseudocode: ["procedure prim(G, start)", "  inMST = {start}", "  while inMST.size < V", "    minEdge = min weight edge crossing cut", "    add minEdge to MST", "    add endpoint to inMST"],
  },
  'kruskal': {
    timeComplexity: { best: 'O(E log E)', average: 'O(E log E)', worst: 'O(E log E)' },
    spaceComplexity: 'O(V)',
    description: "Kruskal 最小生成树算法：将所有边按权重排序，依次添加不形成环的最小边（使用并查集检测环）。",
    pseudocode: ["procedure kruskal(G)", "  sort edges by weight", "  for each edge (u,v,w)", "    if find(u) ≠ find(v)  // 不形成环", "      add edge to MST", "      union(u, v)"],
  },
  'astar': {
    timeComplexity: { best: 'O(b^d)', average: 'O(b^d)', worst: 'O(b^d)' },
    spaceComplexity: 'O(b^d)',
    description: "A* 算法：结合 Dijkstra 的最优性和贪心搜索的效率。使用启发式函数 h(n) 估计到终点距离，f(n)=g(n)+h(n)。",
    pseudocode: ["procedure aStar(G, start, end)", "  openSet = {start}", "  g[start]=0, f[start]=h(start,end)", "  while openSet not empty", "    u = node in openSet with min f", "    for each neighbor v", "      tentativeG = g[u] + w(u,v)", "      if tentativeG < g[v]: update g[v], f[v]"],
  },
  'knapsack': {
    timeComplexity: { best: 'O(nW)', average: 'O(nW)', worst: 'O(nW)' },
    spaceComplexity: 'O(nW)',
    description: "0/1 背包问题动态规划：dp[i][w] = 前i件物品、容量为w时的最大价值。状态转移：取或不取第i件物品。",
    pseudocode: ["procedure knapsack(items, W)", "  dp[0..n][0..W] = 0  // 初始化", "  for i = 1 to n", "    for w = 0 to W", "      if items[i].weight > w: dp[i][w]=dp[i-1][w]", "      else: dp[i][w]=max(dp[i-1][w], dp[i-1][w-wi]+vi)", "  return dp[n][W]"],
  },
  'n-queens': {
    timeComplexity: { best: 'O(n!)', average: 'O(n!)', worst: 'O(n!)' },
    spaceComplexity: 'O(n)',
    description: "N皇后回溯：逐行放置皇后，检测冲突后回溯。利用剪枝避免无效状态，求所有合法布局方案。",
    pseudocode: ["procedure nQueens(board, row)", "  if row == n: addSolution(board)", "  for col = 0 to n-1", "    if isSafe(board, row, col)", "      board[row] = col  // 放置皇后", "      nQueens(board, row+1)  // 递归", "      board[row] = -1  // 回溯"],
  },
};

export const MetricsPanel: React.FC = () => {
  const { selectedAlgorithm, steps, currentStep, category } = useAlgorithmStore();
  const step = steps[currentStep] as any;
  const info = ALGORITHM_INFO[selectedAlgorithm];

  if (!info) return null;

  const renderMetrics = () => {
    if (!step) return null;
    const metrics: Array<{ label: string; value: string | number; color: string }> = [];

    if (category === 'sorting' && step.comparisons !== undefined) {
      metrics.push({ label: '比较次数', value: step.comparisons, color: 'text-yellow-400' });
      metrics.push({ label: '交换次数', value: step.swaps, color: 'text-red-400' });
      metrics.push({ label: '数组访问', value: step.accesses, color: 'text-blue-400' });
      metrics.push({ label: '已排序', value: `${step.sorted?.length ?? 0} / ${step.array?.length ?? 0}`, color: 'text-green-400' });
    } else if (category === 'graph' && step.visitedCount !== undefined) {
      metrics.push({ label: '已访问节点', value: step.visitedCount, color: 'text-blue-400' });
      metrics.push({ label: '路径长度', value: step.pathLength === Infinity ? '∞' : (typeof step.pathLength === 'number' ? step.pathLength.toFixed?.(2) ?? step.pathLength : step.pathLength), color: 'text-green-400' });
      metrics.push({ label: '比较次数', value: step.comparisons, color: 'text-yellow-400' });
      if (step.queue?.length !== undefined) metrics.push({ label: '队列/栈大小', value: step.queue?.length ?? 0, color: 'text-purple-400' });
    } else if (category === 'search' && step.comparisons !== undefined) {
      metrics.push({ label: '比较次数', value: step.comparisons, color: 'text-yellow-400' });
      metrics.push({ label: '当前范围', value: `[${step.left}, ${step.right}]`, color: 'text-blue-400' });
      metrics.push({ label: '中间索引', value: step.mid >= 0 ? step.mid : '-', color: 'text-cyan-400' });
    } else if (category === 'dp' && step.comparisons !== undefined) {
      metrics.push({ label: '比较次数', value: step.comparisons, color: 'text-yellow-400' });
      metrics.push({ label: '当前最大价值', value: step.totalValue, color: 'text-green-400' });
    } else if (category === 'backtracking' && step.backtracks !== undefined) {
      metrics.push({ label: '回溯次数', value: step.backtracks, color: 'text-red-400' });
      metrics.push({ label: '已找到解', value: step.solutionsFound, color: 'text-green-400' });
    }

    return metrics;
  };

  const metrics = renderMetrics();

  return (
    <aside className="w-72 bg-slate-900 border-l border-slate-700 flex flex-col overflow-y-auto">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">实时指标</h2>
        <div className="grid grid-cols-2 gap-2">
          {metrics && metrics.length > 0 ? metrics.map(m => (
            <div key={m.label} className="bg-slate-800 rounded-lg p-2.5">
              <div className={`text-lg font-bold font-mono ${m.color}`}>{m.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{m.label}</div>
            </div>
          )) : (
            <div className="col-span-2 text-slate-500 text-sm">运行算法后查看指标</div>
          )}
        </div>

        {steps.length > 0 && (
          <div className="mt-3 bg-slate-800 rounded-lg p-2.5">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">执行进度</span>
              <span className="text-blue-400">{Math.round((currentStep / Math.max(1, steps.length - 1)) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-150"
                style={{ width: `${(currentStep / Math.max(1, steps.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-b border-slate-700">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">复杂度分析</h2>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">最好情况</span>
            <span className="text-xs font-mono text-green-400 bg-slate-800 px-2 py-0.5 rounded">{info.timeComplexity.best}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">平均情况</span>
            <span className="text-xs font-mono text-yellow-400 bg-slate-800 px-2 py-0.5 rounded">{info.timeComplexity.average}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">最坏情况</span>
            <span className="text-xs font-mono text-red-400 bg-slate-800 px-2 py-0.5 rounded">{info.timeComplexity.worst}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">空间复杂度</span>
            <span className="text-xs font-mono text-purple-400 bg-slate-800 px-2 py-0.5 rounded">{info.spaceComplexity}</span>
          </div>
        </div>

        <div className="mt-3 p-2.5 bg-slate-800 rounded-lg">
          <p className="text-xs text-slate-400 leading-relaxed">{info.description}</p>
        </div>
      </div>

      <div className="p-4">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">伪代码</h2>
        <div className="bg-slate-950 rounded-lg p-3 font-mono text-xs">
          {info.pseudocode.map((line, i) => {
            const isActive = step && (step as any).codeLine === i;
            return (
              <div
                key={i}
                className={`py-0.5 px-1 rounded transition-colors ${
                  isActive ? 'bg-blue-600/20 text-blue-300' : 'text-slate-500'
                }`}
              >
                <span className="text-slate-700 mr-2 select-none">{i}</span>
                {line}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
