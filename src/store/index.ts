import { create } from 'zustand';
import type { AppState, AlgorithmId, AnyStep, GraphData, KnapsackItem } from '../types';
import {
  generateQuickSortSteps,
  generateMergeSortSteps,
  generateBubbleSortSteps,
  generateHeapSortSteps,
  generateInsertionSortSteps,
} from '../algorithms/sorting';
import { generateBinarySearchSteps } from '../algorithms/search';
import {
  generateDijkstraSteps,
  generateBFSSteps,
  generateDFSSteps,
  generatePrimSteps,
  generateKruskalSteps,
  generateAStarSteps,
} from '../algorithms/graph';
import { generateKnapsackSteps } from '../algorithms/dp';
import { generateNQueensSteps } from '../algorithms/backtracking';

const DEFAULT_SORT_ARRAY = [64, 34, 25, 12, 22, 11, 90];
const DEFAULT_SEARCH_ARRAY = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];

const DEFAULT_GRAPH: GraphData = {
  directed: false,
  weighted: true,
  nodes: [
    { id: 'A', x: 150, y: 80, label: 'A' },
    { id: 'B', x: 300, y: 50, label: 'B' },
    { id: 'C', x: 450, y: 80, label: 'C' },
    { id: 'D', x: 150, y: 220, label: 'D' },
    { id: 'E', x: 300, y: 200, label: 'E' },
    { id: 'F', x: 450, y: 220, label: 'F' },
  ],
  edges: [
    { from: 'A', to: 'B', weight: 4 },
    { from: 'A', to: 'D', weight: 2 },
    { from: 'B', to: 'C', weight: 3 },
    { from: 'B', to: 'E', weight: 5 },
    { from: 'C', to: 'F', weight: 1 },
    { from: 'D', to: 'E', weight: 6 },
    { from: 'E', to: 'F', weight: 2 },
  ],
};

const DEFAULT_KNAPSACK_ITEMS: KnapsackItem[] = [
  { name: '物品A', weight: 2, value: 3 },
  { name: '物品B', weight: 3, value: 4 },
  { name: '物品C', weight: 4, value: 5 },
  { name: '物品D', weight: 5, value: 6 },
];

interface AlgorithmStoreActions {
  setAlgorithm: (id: AlgorithmId) => void;
  runAlgorithm: () => void;
  setSteps: (steps: AnyStep[]) => void;
  setCurrentStep: (step: number) => void;
  stepForward: () => void;
  stepBackward: () => void;
  setIsPlaying: (playing: boolean) => void;
  setSpeed: (speed: number) => void;
  setSortArray: (arr: number[]) => void;
  setSearchArray: (arr: number[], target: number) => void;
  setGraphData: (data: GraphData) => void;
  setGraphStart: (id: string) => void;
  setGraphEnd: (id: string) => void;
  setKnapsackItems: (items: KnapsackItem[], capacity: number) => void;
  setQueensN: (n: number) => void;
  toggleCompareMode: () => void;
  setCompareAlgorithm: (id: AlgorithmId | null) => void;
  runCompareAlgorithm: () => void;
  setCompareCurrentStep: (step: number) => void;
  setActivePanel: (panel: AppState['activePanel']) => void;
  reset: () => void;
}

type Store = AppState & AlgorithmStoreActions;

function generateSteps(state: AppState): AnyStep[] {
  const alg = state.selectedAlgorithm;
  try {
    switch (alg) {
      case 'quick-sort': return generateQuickSortSteps(state.sortArray);
      case 'merge-sort': return generateMergeSortSteps(state.sortArray);
      case 'bubble-sort': return generateBubbleSortSteps(state.sortArray);
      case 'heap-sort': return generateHeapSortSteps(state.sortArray);
      case 'insertion-sort': return generateInsertionSortSteps(state.sortArray);
      case 'binary-search': return generateBinarySearchSteps(state.searchArray, state.searchTarget);
      case 'dijkstra': return generateDijkstraSteps(state.graphData, state.graphStart, state.graphEnd);
      case 'bfs': return generateBFSSteps(state.graphData, state.graphStart, state.graphEnd);
      case 'dfs': return generateDFSSteps(state.graphData, state.graphStart, state.graphEnd);
      case 'prim': return generatePrimSteps(state.graphData, state.graphStart);
      case 'kruskal': return generateKruskalSteps(state.graphData);
      case 'astar': return generateAStarSteps(state.graphData, state.graphStart, state.graphEnd);
      case 'knapsack': return generateKnapsackSteps(state.knapsackItems, state.knapsackCapacity);
      case 'n-queens': return generateNQueensSteps(state.queensN);
      default: return [];
    }
  } catch {
    return [];
  }
}

function generateCompareSteps(state: AppState): AnyStep[] {
  if (!state.compareAlgorithm) return [];
  const tempState = { ...state, selectedAlgorithm: state.compareAlgorithm };
  return generateSteps(tempState);
}

export const useAlgorithmStore = create<Store>((set, get) => ({
  // Initial state
  selectedAlgorithm: 'quick-sort',
  category: 'sorting',
  steps: [],
  currentStep: 0,
  isPlaying: false,
  speed: 1,
  graphData: DEFAULT_GRAPH,
  graphStart: 'A',
  graphEnd: 'F',
  sortArray: [...DEFAULT_SORT_ARRAY],
  searchArray: [...DEFAULT_SEARCH_ARRAY],
  searchTarget: 7,
  knapsackItems: [...DEFAULT_KNAPSACK_ITEMS],
  knapsackCapacity: 8,
  queensN: 6,
  compareMode: false,
  compareAlgorithm: null,
  compareSteps: [],
  compareCurrentStep: 0,
  activePanel: 'visualizer',
  theme: 'dark',

  // Actions
  setAlgorithm: (id) => {
    const categoryMap: Record<AlgorithmId, AppState['category']> = {
      'quick-sort': 'sorting',
      'merge-sort': 'sorting',
      'bubble-sort': 'sorting',
      'heap-sort': 'sorting',
      'insertion-sort': 'sorting',
      'binary-search': 'search',
      'dijkstra': 'graph',
      'bfs': 'graph',
      'dfs': 'graph',
      'prim': 'graph',
      'kruskal': 'graph',
      'astar': 'graph',
      'knapsack': 'dp',
      'n-queens': 'backtracking',
    };
    set({ selectedAlgorithm: id, category: categoryMap[id], steps: [], currentStep: 0, isPlaying: false });
  },

  runAlgorithm: () => {
    const state = get();
    const steps = generateSteps(state);
    set({ steps, currentStep: 0, isPlaying: false });
  },

  setSteps: (steps) => set({ steps, currentStep: 0 }),
  setCurrentStep: (step) => set({ currentStep: step }),
  stepForward: () => {
    const { currentStep, steps } = get();
    if (currentStep < steps.length - 1) set({ currentStep: currentStep + 1 });
  },
  stepBackward: () => {
    const { currentStep } = get();
    if (currentStep > 0) set({ currentStep: currentStep - 1 });
  },
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setSpeed: (speed) => set({ speed }),

  setSortArray: (arr) => set({ sortArray: arr, steps: [], currentStep: 0 }),
  setSearchArray: (arr, target) => set({ searchArray: arr, searchTarget: target, steps: [], currentStep: 0 }),
  setGraphData: (data) => set({ graphData: data, steps: [], currentStep: 0 }),
  setGraphStart: (id) => set({ graphStart: id, steps: [], currentStep: 0 }),
  setGraphEnd: (id) => set({ graphEnd: id, steps: [], currentStep: 0 }),
  setKnapsackItems: (items, capacity) => set({ knapsackItems: items, knapsackCapacity: capacity, steps: [], currentStep: 0 }),
  setQueensN: (n) => set({ queensN: n, steps: [], currentStep: 0 }),

  toggleCompareMode: () => {
    const { compareMode } = get();
    set({ compareMode: !compareMode, compareSteps: [], compareCurrentStep: 0 });
  },
  setCompareAlgorithm: (id) => set({ compareAlgorithm: id, compareSteps: [], compareCurrentStep: 0 }),
  runCompareAlgorithm: () => {
    const state = get();
    const steps = generateCompareSteps(state);
    set({ compareSteps: steps, compareCurrentStep: 0 });
  },
  setCompareCurrentStep: (step) => set({ compareCurrentStep: step }),

  setActivePanel: (panel) => set({ activePanel: panel }),

  reset: () => set({ steps: [], currentStep: 0, isPlaying: false, compareSteps: [], compareCurrentStep: 0 }),
}));
