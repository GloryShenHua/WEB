// ===================== COMMON TYPES =====================

export type AlgorithmCategory =
  | 'sorting'
  | 'graph'
  | 'search'
  | 'dp'
  | 'backtracking'
  | 'divide-conquer';

export interface Metrics {
  comparisons: number;
  swaps: number;
  accesses: number;
  visitedNodes: number;
  pathLength: number;
  backtracks: number;
}

// ===================== SORTING =====================

export interface SortStep {
  array: number[];
  comparing: number[];
  swapping: number[];
  sorted: number[];
  pivot: number | null;
  rangeLeft: number;
  rangeRight: number;
  description: string;
  codeLine: number;
  comparisons: number;
  swaps: number;
  accesses: number;
  // For merge sort
  mergeLeft?: number[];
  mergeRight?: number[];
  mergeTarget?: number;
  subArrays?: [number, number][];
}

// ===================== GRAPH =====================

export interface GraphNode {
  id: string;
  x: number;
  y: number;
  label: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  weight: number;
  directed?: boolean;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  directed: boolean;
  weighted: boolean;
}

export type NodeState =
  | 'unvisited'
  | 'in-queue'
  | 'visiting'
  | 'visited'
  | 'current'
  | 'path'
  | 'start'
  | 'end'
  | 'mst';

export type EdgeState =
  | 'default'
  | 'exploring'
  | 'tree'
  | 'path'
  | 'rejected'
  | 'mst'
  | 'relaxed';

export interface GraphStep {
  nodeStates: Record<string, NodeState>;
  edgeStates: Record<string, EdgeState>;
  distances: Record<string, number>;
  queue: string[];
  stack: string[];
  current: string | null;
  path: string[];
  description: string;
  codeLine: number;
  visitedCount: number;
  pathLength: number;
  comparisons: number;
  // A* specific
  gScores?: Record<string, number>;
  fScores?: Record<string, number>;
  hScores?: Record<string, number>;
  // MST specific
  mstEdges?: GraphEdge[];
  mstCost?: number;
}

// ===================== SEARCH =====================

export interface SearchStep {
  array: number[];
  left: number;
  right: number;
  mid: number;
  target: number;
  found: boolean | null;
  eliminated: 'left' | 'right' | null;
  description: string;
  codeLine: number;
  comparisons: number;
}

// ===================== DYNAMIC PROGRAMMING =====================

export interface KnapsackItem {
  name: string;
  weight: number;
  value: number;
}

export interface KnapsackStep {
  dp: number[][];
  currentItem: number;
  currentWeight: number;
  decision: 'skip' | 'take' | 'compare' | 'init' | null;
  description: string;
  codeLine: number;
  totalValue: number;
  selectedItems: number[];
  tracePath: [number, number][];
  comparisons: number;
}

// ===================== BACKTRACKING =====================

export interface NQueensStep {
  board: number[]; // board[row] = col of queen, or -1
  n: number;
  currentRow: number;
  currentCol: number;
  conflicts: Array<[number, number]>;
  placing: [number, number] | null;
  removing: [number, number] | null;
  description: string;
  codeLine: number;
  backtracks: number;
  solutionsFound: number;
  solutions: number[][];
  allSolutions?: number[][];
}

// ===================== STORE =====================

export type AlgorithmId =
  // Sorting
  | 'quick-sort'
  | 'merge-sort'
  | 'bubble-sort'
  | 'heap-sort'
  | 'insertion-sort'
  // Graph
  | 'dijkstra'
  | 'bfs'
  | 'dfs'
  | 'prim'
  | 'kruskal'
  | 'astar'
  // Search
  | 'binary-search'
  // DP
  | 'knapsack'
  // Backtracking
  | 'n-queens';

export type AnyStep = SortStep | GraphStep | SearchStep | KnapsackStep | NQueensStep;

export interface AlgorithmInfo {
  id: AlgorithmId;
  name: string;
  category: AlgorithmCategory;
  timeComplexity: { best: string; average: string; worst: string };
  spaceComplexity: string;
  description: string;
  pseudocode: string[];
  references?: string[];
}

export interface AppState {
  selectedAlgorithm: AlgorithmId;
  category: AlgorithmCategory;
  steps: AnyStep[];
  currentStep: number;
  isPlaying: boolean;
  speed: number; // 0.5 to 4
  // Graph input
  graphData: GraphData;
  graphStart: string;
  graphEnd: string;
  // Sort input
  sortArray: number[];
  // Search input
  searchArray: number[];
  searchTarget: number;
  // Knapsack input
  knapsackItems: KnapsackItem[];
  knapsackCapacity: number;
  // NQueens input
  queensN: number;
  // Compare mode
  compareMode: boolean;
  compareAlgorithm: AlgorithmId | null;
  compareSteps: AnyStep[];
  compareCurrentStep: number;
  // UI
  activePanel: 'visualizer' | 'evaluation' | '3d';
  theme: 'dark' | 'light';
}
