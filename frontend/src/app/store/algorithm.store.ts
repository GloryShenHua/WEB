import { Injectable, signal, computed } from '@angular/core';
import { AlgorithmService } from '../services/algorithm.service';
import {
  AppState, AlgorithmCategory, AlgorithmId, AnyStep,
  GraphData, KnapsackItem
} from '../models/algorithm.models';
import {CustomStructureData, StructureType} from "../visualizers/vr-3d/renderers/structure-renderer.types";

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
  activePanel   = signal<'visualizer' | 'history'>('visualizer');

  sortArray     = signal<number[]>([64, 34, 25, 12, 22, 11, 90]);
  searchArray   = signal<number[]>([1, 3, 5, 7, 9, 11, 13, 15, 17, 19]);
  searchTarget  = signal(7);
  graphData     = signal<GraphData>(DEFAULT_GRAPH);
  graphStart    = signal('A');
  graphEnd      = signal('F');
  knapsackItems = signal<KnapsackItem[]>(DEFAULT_KNAPSACK);
  knapsackCap   = signal(8);
  queensN       = signal(6);
  divideX       = signal('12345678');
  divideY       = signal('87654321');
  vr3dStructure = signal<StructureType>('array');
  vr3dData      = signal<CustomStructureData>({ values: ['10', '20', '30', '40', '50'] });

  // ---- Computed ----
  currentStepData = computed(() => this.steps()[this.currentStep()] ?? null);
  totalSteps      = computed(() => this.steps().length);
  canForward      = computed(() => this.currentStep() < this.steps().length - 1);
  canBackward     = computed(() => this.currentStep() > 0);

  private playTimer: ReturnType<typeof setInterval> | null = null;

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
      'karatsuba': 'divide-conquer',
      'data-structure-3d': 'vr-3d',
    };
    this.category.set(catMap[id] ?? 'sorting');
    this.steps.set([]);
    this.currentStep.set(0);
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

    if (cat === 'vr-3d') {
      this.steps.set([{ type: 'vr-3d' } as any]);
      this.currentStep.set(0);
      this.isLoading.set(false);
      return;
    }

    if (cat === 'sorting') {
      this.svc.runSort(algo, this.sortArray()).subscribe({
        next: r => handleResponse(r.steps), error: handleError,
      });
    } else if (cat === 'search') {
      this.svc.runSearch(algo, this.searchArray(), this.searchTarget()).subscribe({
        next: r => handleResponse(r.steps), error: handleError,
      });
    } else if (cat === 'graph') {
      this.svc.runGraph(algo, this.graphData(), this.graphStart(), this.graphEnd()).subscribe({
        next: r => handleResponse(r.steps), error: handleError,
      });
    } else if (cat === 'dp') {
      this.svc.runDP(algo, this.knapsackItems(), this.knapsackCap()).subscribe({
        next: r => handleResponse(r.steps), error: handleError,
      });
    } else if (cat === 'backtracking') {
      this.svc.runBacktracking(algo, this.queensN()).subscribe({
        next: r => handleResponse(r.steps), error: handleError,
      });
    } else if (cat === 'divide-conquer') {
      this.svc.runDivideConquer(algo, this.divideX(), this.divideY()).subscribe({
        next: r => handleResponse(r.steps), error: handleError,
      });
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

  togglePlay(): void {
    this.isPlaying() ? this.stopPlay() : this.startPlay();
  }

  setSpeed(s: number): void {
    this.speed.set(s);
    if (this.isPlaying()) { this.stopPlay(); this.startPlay(); }
  }

  setSortArray(arr: number[]): void { this.sortArray.set(arr); }
  setSearchData(arr: number[], target: number): void {
    this.searchArray.set(arr); this.searchTarget.set(target);
  }
  setGraphData(d: GraphData): void { this.graphData.set(d); }
  setGraphStart(id: string): void { this.graphStart.set(id); }
  setGraphEnd(id: string): void { this.graphEnd.set(id); }
  setKnapsackItems(items: KnapsackItem[], cap: number): void {
    this.knapsackItems.set(items); this.knapsackCap.set(cap);
  }
  setQueensN(n: number): void { this.queensN.set(n); }
  setDivideNumbers(x: string, y: string): void {
    this.divideX.set(x);
    this.divideY.set(y);
  }
  setVr3dStructure(type: StructureType): void {
    this.vr3dStructure.set(type);
    this.vr3dData.set({ values: this.defaultVr3dValues(type) });
  }
  setVr3dData(values: string[]): void {
    this.vr3dData.set({ values });
  }
  randomVr3dData(): void {
    const type = this.vr3dStructure();

    if (type === 'linked-list') {
      const pool = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
      const n = 3 + Math.floor(Math.random() * 4);
      this.vr3dData.set({ values: pool.slice(0, n) });
      return;
    }

    if (type === 'binary-tree') {
      const values = Array.from({ length: 7 }, () => String(Math.floor(Math.random() * 90) + 10));
      this.vr3dData.set({ values });
      return;
    }

    if (type === 'b-plus-tree') {
      const n = 8 + Math.floor(Math.random() * 5);
      const values = Array.from({ length: n }, (_, i) => String((i + 1) * 10));
      this.vr3dData.set({ values });
      return;
    }

    const n = 4 + Math.floor(Math.random() * 5);
    const values = Array.from({ length: n }, () => String(Math.floor(Math.random() * 90) + 10));
    this.vr3dData.set({ values });
  }

  private defaultVr3dValues(type: StructureType): string[] {
    switch (type) {
      case 'array':
      case 'stack':
      case 'queue':
        return ['10', '20', '30', '40', '50'];
      case 'linked-list':
        return ['A', 'B', 'C', 'D'];
      case 'binary-tree':
        return ['8', '4', '12', '2', '6', '10', '14'];
      case 'b-plus-tree':
        return ['10', '20', '30', '40', '50', '60', '70', '80'];
    }
  }
  setActivePanel(p: 'visualizer' | 'history'): void { this.activePanel.set(p); }

  reset(): void {
    this.stopPlay();
    this.steps.set([]);
    this.currentStep.set(0);
    this.error.set(null);
  }
}
