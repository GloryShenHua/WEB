import { Injectable, signal, computed } from '@angular/core';
import { AlgorithmService } from '../services/algorithm.service';
import {
  AppState, AlgorithmCategory, AlgorithmId, AnyStep,
  GraphData, KnapsackItem
} from '../models/algorithm.models';

const DEFAULT_GRAPH: GraphData = {
  directed: false,
  weighted: true,
  nodes: [
    { id: 'A', x: 150, y: 80,  label: 'A' },
    { id: 'B', x: 300, y: 50,  label: 'B' },
    { id: 'C', x: 450, y: 80,  label: 'C' },
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

const DEFAULT_KNAPSACK: KnapsackItem[] = [
  { name: '物品A', weight: 2, value: 3 },
  { name: '物品B', weight: 3, value: 4 },
  { name: '物品C', weight: 4, value: 5 },
  { name: '物品D', weight: 5, value: 6 },
];

// Phase sequence and labels for each algorithm
const PHASE_CONFIG: Record<string, { sequence: string[]; labels: Record<string, string> }> = {
  'quick-sort': {
    sequence: ['select_pivot', 'compare', 'swap', 'pivot_placed', 'done'],
    labels: {
      select_pivot: '选择基准值', compare: '比较分区', swap: '交换元素',
      pivot_placed: '基准值归位', done: '排序完成',
    },
  },
  'merge-sort': {
    sequence: ['divide', 'merge_setup', 'merge_place', 'done'],
    labels: {
      divide: '分割数组', merge_setup: '准备合并', merge_place: '归并元素', done: '排序完成',
    },
  },
  'bubble-sort': {
    sequence: ['compare', 'swap', 'bubble_complete', 'done'],
    labels: {
      compare: '比较相邻元素', swap: '交换元素', bubble_complete: '本轮完成', done: '排序完成',
    },
  },
  'heap-sort': {
    sequence: ['build_heap', 'heapify_compare', 'heapify_swap', 'extract_max', 'done'],
    labels: {
      build_heap: '建堆', heapify_compare: '堆调整-比较', heapify_swap: '堆调整-交换',
      extract_max: '提取最大值', done: '排序完成',
    },
  },
  'insertion-sort': {
    sequence: ['key_select', 'shift', 'insert', 'done'],
    labels: {
      key_select: '选取关键字', shift: '元素后移', insert: '插入元素', done: '排序完成',
    },
  },
  'binary-search': {
    sequence: ['init', 'calculate_mid', 'compare', 'eliminate', 'found', 'not_found'],
    labels: {
      init: '初始化', calculate_mid: '计算中点', compare: '比较目标值',
      eliminate: '排除半区', found: '查找成功', not_found: '查找失败',
    },
  },
  'dijkstra': {
    sequence: ['init', 'select_min', 'explore_edge', 'update_dist', 'reconstruct_path', 'done'],
    labels: {
      init: '初始化距离', select_min: '选择最近节点', explore_edge: '探索邻边',
      update_dist: '更新距离', reconstruct_path: '重建路径', done: '算法完成',
    },
  },
  'bfs': {
    sequence: ['init', 'dequeue', 'discover_neighbor', 'reconstruct_path', 'done'],
    labels: {
      init: '初始化队列', dequeue: '出队节点', discover_neighbor: '发现邻居',
      reconstruct_path: '重建路径', done: '算法完成',
    },
  },
  'dfs': {
    sequence: ['init', 'pop_stack', 'discover_neighbor', 'reconstruct_path', 'done'],
    labels: {
      init: '初始化栈', pop_stack: '出栈节点', discover_neighbor: '发现邻居',
      reconstruct_path: '重建路径', done: '算法完成',
    },
  },
  'prim': {
    sequence: ['init', 'select_min_edge', 'add_to_mst', 'done'],
    labels: {
      init: '初始化', select_min_edge: '选择最小边', add_to_mst: '加入MST', done: 'MST完成',
    },
  },
  'kruskal': {
    sequence: ['init', 'sort_edges', 'check_cycle', 'add_to_mst', 'skip_edge', 'done'],
    labels: {
      init: '初始化', sort_edges: '边排序', check_cycle: '检查环路',
      add_to_mst: '加入MST', skip_edge: '跳过边', done: 'MST完成',
    },
  },
  'astar': {
    sequence: ['init', 'select_min', 'explore_edge', 'update_dist', 'reconstruct_path', 'done'],
    labels: {
      init: '初始化', select_min: '选择最优节点', explore_edge: '探索邻边',
      update_dist: '更新估价', reconstruct_path: '重建路径', done: '算法完成',
    },
  },
  'knapsack': {
    sequence: ['init', 'skip_weight', 'compare', 'take', 'skip', 'traceback', 'done'],
    labels: {
      init: '初始化DP表', skip_weight: '超重跳过', compare: '比较取舍',
      take: '选取物品', skip: '不选物品', traceback: '回溯方案', done: '求解完成',
    },
  },
  'n-queens': {
    sequence: ['init', 'try_place', 'place', 'solution_found', 'backtrack', 'done'],
    labels: {
      init: '初始化棋盘', try_place: '尝试放置', place: '放置皇后',
      solution_found: '找到解', backtrack: '回溯', done: '求解完成',
    },
  },
};

@Injectable({ providedIn: 'root' })
export class AlgorithmStore {
  // ---- Signals ----
  category      = signal<AlgorithmCategory>('sorting');
  selectedAlgo  = signal<AlgorithmId>('quick-sort');
  steps         = signal<AnyStep[]>([]);
  currentStep   = signal(0);
  isPlaying     = signal(false);
  speed         = signal(500);
  isLoading     = signal(false);
  error         = signal<string | null>(null);
  activePanel   = signal<'visualizer' | 'history' | 'assessment'>('visualizer');

  sortArray     = signal<number[]>([64, 34, 25, 12, 22, 11, 90]);
  searchArray   = signal<number[]>([1, 3, 5, 7, 9, 11, 13, 15, 17, 19]);
  searchTarget  = signal(7);
  graphData     = signal<GraphData>(DEFAULT_GRAPH);
  graphStart    = signal('A');
  graphEnd      = signal('F');
  knapsackItems = signal<KnapsackItem[]>(DEFAULT_KNAPSACK);
  knapsackCap   = signal(8);
  queensN       = signal(6);

  // ---- Compare mode signals ----
  compareMode      = signal(false);
  compareAlgo      = signal<AlgorithmId>('merge-sort');
  compareSteps     = signal<AnyStep[]>([]);
  compareCurrentStep = signal(0);
  compareIsPlaying = signal(false);
  compareIsLoading = signal(false);
  compareError     = signal<string | null>(null);

  // ---- Computed ----
  currentStepData = computed(() => this.steps()[this.currentStep()] ?? null);
  totalSteps      = computed(() => this.steps().length);
  canForward      = computed(() => this.currentStep() < this.steps().length - 1);
  canBackward     = computed(() => this.currentStep() > 0);

  compareCurrentStepData = computed(() => this.compareSteps()[this.compareCurrentStep()] ?? null);
  compareTotalSteps      = computed(() => this.compareSteps().length);

  // ---- Phase computed ----
  phaseConfig = computed(() => PHASE_CONFIG[this.selectedAlgo()] ?? { sequence: [], labels: {} });

  currentPhase = computed(() => {
    const step = this.currentStepData();
    if (!step || !('phase' in step)) return '';
    return (step as unknown as Record<string, unknown>)['phase'] as string ?? '';
  });

  currentPhaseIndex = computed(() => {
    const config = this.phaseConfig();
    return config.sequence.indexOf(this.currentPhase());
  });

  phaseLabel = computed(() => {
    const config = this.phaseConfig();
    return config.labels[this.currentPhase()] ?? this.currentPhase();
  });

  private playTimer: ReturnType<typeof setInterval> | null = null;
  private comparePlayTimer: ReturnType<typeof setInterval> | null = null;

  constructor(private svc: AlgorithmService) {}

  setAlgorithm(id: AlgorithmId): void {
    this.selectedAlgo.set(id);
    const catMap: Record<string, AlgorithmCategory> = {
      'quick-sort': 'sorting', 'merge-sort': 'sorting', 'bubble-sort': 'sorting',
      'heap-sort': 'sorting', 'insertion-sort': 'sorting',
      'binary-search': 'search',
      'dijkstra': 'graph', 'bfs': 'graph', 'dfs': 'graph',
      'prim': 'graph', 'kruskal': 'graph', 'astar': 'graph',
      'knapsack': 'dp',
      'n-queens': 'backtracking',
    };
    this.category.set(catMap[id] ?? 'sorting');
    this.steps.set([]);
    this.currentStep.set(0);
  }

  getCategoryForAlgo(id: AlgorithmId): AlgorithmCategory {
    const catMap: Record<string, AlgorithmCategory> = {
      'quick-sort': 'sorting', 'merge-sort': 'sorting', 'bubble-sort': 'sorting',
      'heap-sort': 'sorting', 'insertion-sort': 'sorting',
      'binary-search': 'search',
      'dijkstra': 'graph', 'bfs': 'graph', 'dfs': 'graph',
      'prim': 'graph', 'kruskal': 'graph', 'astar': 'graph',
      'knapsack': 'dp',
      'n-queens': 'backtracking',
    };
    return catMap[id] ?? 'sorting';
  }

  runAlgorithm(): void {
    this.stopPlay();
    this.isLoading.set(true);
    this.error.set(null);

    const algo = this.selectedAlgo();
    const cat  = this.category();

    const handleResponse = (steps: AnyStep[]) => {
      this.steps.set(steps);
      this.currentStep.set(0);
      this.isLoading.set(false);
    };
    const handleError = (err: unknown) => {
      this.error.set('请求失败，请确认后端服务已启动（http://localhost:8080）');
      this.isLoading.set(false);
      console.error(err);
    };

    this.dispatchRun(algo, cat, handleResponse, handleError);
  }

  runCompareAlgorithm(): void {
    this.stopComparePlay();
    this.compareIsLoading.set(true);
    this.compareError.set(null);

    const algo = this.compareAlgo();
    const cat  = this.getCategoryForAlgo(algo);

    const handleResponse = (steps: AnyStep[]) => {
      this.compareSteps.set(steps);
      this.compareCurrentStep.set(0);
      this.compareIsLoading.set(false);
    };
    const handleError = (err: unknown) => {
      this.compareError.set('对比算法请求失败');
      this.compareIsLoading.set(false);
      console.error(err);
    };

    this.dispatchRun(algo, cat, handleResponse, handleError);
  }

  private dispatchRun(
    algo: AlgorithmId, cat: AlgorithmCategory,
    onSuccess: (steps: AnyStep[]) => void, onError: (err: unknown) => void
  ): void {
    if (cat === 'sorting') {
      this.svc.runSort(algo, this.sortArray()).subscribe({
        next: r => onSuccess(r.steps), error: onError,
      });
    } else if (cat === 'search') {
      this.svc.runSearch(algo, this.searchArray(), this.searchTarget()).subscribe({
        next: r => onSuccess(r.steps), error: onError,
      });
    } else if (cat === 'graph') {
      this.svc.runGraph(algo, this.graphData(), this.graphStart(), this.graphEnd()).subscribe({
        next: r => onSuccess(r.steps), error: onError,
      });
    } else if (cat === 'dp') {
      this.svc.runDP(algo, this.knapsackItems(), this.knapsackCap()).subscribe({
        next: r => onSuccess(r.steps), error: onError,
      });
    } else if (cat === 'backtracking') {
      this.svc.runBacktracking(algo, this.queensN()).subscribe({
        next: r => onSuccess(r.steps), error: onError,
      });
    }
  }

  runBothAlgorithms(): void {
    this.runAlgorithm();
    if (this.compareMode()) {
      this.runCompareAlgorithm();
    }
  }

  stepForward(): void {
    if (this.canForward()) this.currentStep.update(s => s + 1);
  }

  stepBackward(): void {
    if (this.canBackward()) this.currentStep.update(s => s - 1);
  }

  setCurrentStep(n: number): void {
    this.currentStep.set(Math.max(0, Math.min(n, this.steps().length - 1)));
  }

  compareStepForward(): void {
    if (this.compareCurrentStep() < this.compareSteps().length - 1) {
      this.compareCurrentStep.update(s => s + 1);
    }
  }

  compareStepBackward(): void {
    if (this.compareCurrentStep() > 0) {
      this.compareCurrentStep.update(s => s - 1);
    }
  }

  startPlay(): void {
    if (this.isPlaying()) return;
    this.isPlaying.set(true);
    this.playTimer = setInterval(() => {
      if (this.canForward()) {
        this.stepForward();
      } else {
        this.stopPlay();
      }
    }, this.speed());
  }

  stopPlay(): void {
    this.isPlaying.set(false);
    if (this.playTimer) { clearInterval(this.playTimer); this.playTimer = null; }
  }

  startComparePlay(): void {
    if (this.compareIsPlaying()) return;
    this.compareIsPlaying.set(true);
    this.comparePlayTimer = setInterval(() => {
      if (this.compareCurrentStep() < this.compareSteps().length - 1) {
        this.compareStepForward();
      } else {
        this.stopComparePlay();
      }
    }, this.speed());
  }

  stopComparePlay(): void {
    this.compareIsPlaying.set(false);
    if (this.comparePlayTimer) { clearInterval(this.comparePlayTimer); this.comparePlayTimer = null; }
  }

  togglePlay(): void {
    if (this.isPlaying()) {
      this.stopPlay();
      if (this.compareMode()) this.stopComparePlay();
    } else {
      this.startPlay();
      if (this.compareMode() && this.compareSteps().length > 0) this.startComparePlay();
    }
  }

  setSpeed(s: number): void {
    this.speed.set(s);
    if (this.isPlaying()) { this.stopPlay(); this.startPlay(); }
    if (this.compareIsPlaying()) { this.stopComparePlay(); this.startComparePlay(); }
  }

  setSortArray(arr: number[]): void { this.sortArray.set(arr); }
  setSearchData(arr: number[], target: number): void {
    this.searchArray.set(arr); this.searchTarget.set(target);
  }
  setGraphData(d: GraphData): void {
    this.graphData.set(d);
    this.reset();
  }
  setGraphStart(id: string): void { this.graphStart.set(id); }
  setGraphEnd(id: string): void { this.graphEnd.set(id); }
  setKnapsackItems(items: KnapsackItem[], cap: number): void {
    this.knapsackItems.set(items); this.knapsackCap.set(cap);
  }
  setQueensN(n: number): void { this.queensN.set(n); }
  setActivePanel(p: 'visualizer' | 'history' | 'assessment'): void { this.activePanel.set(p); }

  toggleCompareMode(): void {
    this.compareMode.update(v => !v);
    if (this.compareMode()) {
      const current = this.selectedAlgo();
      const cat = this.category();
      const siblings: Record<string, AlgorithmId[]> = {
        sorting: ['quick-sort', 'merge-sort', 'bubble-sort', 'heap-sort', 'insertion-sort'],
        graph: ['dijkstra', 'bfs', 'dfs', 'prim', 'kruskal', 'astar'],
        search: ['binary-search'],
        dp: ['knapsack'],
        backtracking: ['n-queens'],
      };
      const list = siblings[cat] ?? [];
      const other = list.find(a => a !== current);
      if (other) this.compareAlgo.set(other);
      this.compareSteps.set([]);
      this.compareCurrentStep.set(0);
    }
  }

  reset(): void {
    this.stopPlay();
    this.steps.set([]);
    this.currentStep.set(0);
    this.error.set(null);
  }

  compareReset(): void {
    this.stopComparePlay();
    this.compareSteps.set([]);
    this.compareCurrentStep.set(0);
    this.compareError.set(null);
  }
}
