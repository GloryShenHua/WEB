import { Component, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlgorithmStore } from '../../store/algorithm.store';
import { GraphStep, GraphNode, GraphEdge } from '../../models/algorithm.models';

interface RenderEdge extends GraphEdge {
  x1: number; y1: number; x2: number; y2: number;
  midX: number; midY: number; state: string;
}
interface RenderNode extends GraphNode { state: string; }

@Component({
  selector: 'app-graph-visualizer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './graph-visualizer.component.html',
})
export class GraphVisualizerComponent {
  @Input() source: 'primary' | 'compare' = 'primary';

  step = computed(() => {
    const data = this.source === 'primary'
      ? this.store.currentStepData()
      : this.store.compareCurrentStepData();
    return data as GraphStep | null;
  });

  nodes = computed<RenderNode[]>(() => {
    const s = this.step();
    return this.store.graphData().nodes.map(n => ({
      ...n,
      state: s?.nodeStates[n.id] ?? 'unvisited',
    }));
  });

  edges = computed<RenderEdge[]>(() => {
    const s = this.step();
    const g = this.store.graphData();
    return g.edges.map(e => {
      const from = g.nodes.find(n => n.id === e.from)!;
      const to   = g.nodes.find(n => n.id === e.to)!;
      return {
        ...e,
        x1: from.x, y1: from.y, x2: to.x, y2: to.y,
        midX: (from.x + to.x) / 2,
        midY: (from.y + to.y) / 2,
        state: s?.edgeStates[`${e.from}-${e.to}`] ?? 'default',
      };
    });
  });

  constructor(public store: AlgorithmStore) {}

  nodeColor(state: string): string {
    const map: Record<string, string> = {
      start: '#3b82f6', end: '#f59e0b', current: '#a855f7',
      visiting: '#a855f7', 'in-queue': '#f59e0b', visited: '#10b981',
      path: '#22c55e', mst: '#10b981',
    };
    return map[state] ?? '#1e293b';
  }

  edgeColor(state: string): string {
    const map: Record<string, string> = { exploring: '#f59e0b', tree: '#3b82f6', path: '#22c55e', mst: '#10b981' };
    return map[state] ?? '#334155';
  }

  edgeWidth(state: string): number {
    return ['path', 'mst', 'tree'].includes(state) ? 3 : 1.5;
  }

  visitedRatio = computed(() => {
    const s = this.step();
    const total = this.store.graphData().nodes.length;
    if (!s || total === 0) return 0;
    return Math.round((s.visitedCount / total) * 100);
  });

  trackById(i: number, n: { id: string }) { return n.id; }
  trackByEdge(i: number) { return i; }
}
