import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlgorithmStore } from '../../store/algorithm.store';
import { GraphData, KnapsackItem } from '../../models/algorithm.models';

@Component({
  selector: 'app-input-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './input-config.component.html',
})
export class InputConfigComponent implements OnInit {
  // ---- Sorting ----
  sortArrayInput = '';
  sortSize = 10;

  // ---- Search ----
  searchArrayInput = '';
  searchTargetInput = 7;

  // ---- Graph ----
  nodesInput = '';
  edgesInput = '';
  isDirected = false;
  isWeighted = true;
  graphStartInput = 'A';
  graphEndInput = 'F';

  // ---- DP ----
  itemsInput = '';
  capacity = 8;

  // ---- N-Queens ----
  queensN = 6;

  constructor(public store: AlgorithmStore) {}

  ngOnInit(): void {
    this.sortArrayInput = this.store.sortArray().join(', ');
    this.searchArrayInput = this.store.searchArray().join(', ');
    this.searchTargetInput = this.store.searchTarget();
    this.capacity = this.store.knapsackCap();
    this.queensN = this.store.queensN();
    this.graphStartInput = this.store.graphStart();
    this.graphEndInput = this.store.graphEnd();

    const g = this.store.graphData();
    this.nodesInput = g.nodes.map(n => n.id).join(', ');
    this.edgesInput = g.edges.map(e => `${e.from}-${e.to}:${e.weight}`).join(', ');
    this.isDirected = g.directed;
    this.isWeighted = g.weighted;

    this.itemsInput = this.store.knapsackItems()
      .map(i => `${i.name}:${i.weight}:${i.value}`).join(', ');
  }

  // ---- Sorting ----
  applySortArray(): void {
    const arr = this.sortArrayInput
      .split(/[,\s]+/)
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n));
    if (arr.length > 0) this.store.setSortArray(arr);
  }

  randomSortArray(): void {
    const size = Math.min(Math.max(this.sortSize, 3), 30);
    const arr = Array.from({ length: size }, () => Math.floor(Math.random() * 99) + 1);
    this.store.setSortArray(arr);
    this.sortArrayInput = arr.join(', ');
  }

  // ---- Search ----
  applySearch(): void {
    let arr = this.searchArrayInput
      .split(/[,\s]+/)
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n));
    arr = [...new Set(arr)].sort((a, b) => a - b);
    if (arr.length > 0) {
      this.store.setSearchData(arr, this.searchTargetInput);
      this.searchArrayInput = arr.join(', ');
    }
  }

  randomSearch(): void {
    const arr = Array.from({ length: 10 }, (_, i) => i * 2 + 1);
    const target = arr[Math.floor(Math.random() * arr.length)];
    this.store.setSearchData(arr, target);
    this.searchArrayInput = arr.join(', ');
    this.searchTargetInput = target;
  }

  // ---- Graph ----
  applyGraph(): void {
    const nodeIds = this.nodesInput
      .split(/[,\s]+/)
      .map(s => s.trim())
      .filter(Boolean);
    if (nodeIds.length === 0) return;

    const nodes = nodeIds.map((id, i) => {
      const angle = (2 * Math.PI * i) / nodeIds.length - Math.PI / 2;
      return {
        id, label: id,
        x: Math.round(300 + 200 * Math.cos(angle)),
        y: Math.round(160 + 120 * Math.sin(angle)),
      };
    });

    const edges = this.edgesInput
      .split(/,\s*/)
      .map(s => {
        const m = s.trim().match(/^(\w+)-(\w+)(?::(\d+(?:\.\d+)?))?$/);
        if (!m) return null;
        return { from: m[1], to: m[2], weight: parseFloat(m[3] ?? '1') };
      })
      .filter((e): e is { from: string; to: string; weight: number } => e !== null);

    const graphData: GraphData = {
      nodes, edges,
      directed: this.isDirected,
      weighted: this.isWeighted,
    };
    this.store.setGraphData(graphData);
    this.store.setGraphStart(this.graphStartInput);
    this.store.setGraphEnd(this.graphEndInput);
  }

  randomGraph(): void {
    const ids = ['A', 'B', 'C', 'D', 'E', 'F'];
    const nodes = ids.map((id, i) => {
      const angle = (2 * Math.PI * i) / ids.length - Math.PI / 2;
      return {
        id, label: id,
        x: Math.round(300 + 200 * Math.cos(angle)),
        y: Math.round(160 + 120 * Math.sin(angle)),
      };
    });
    const edges: { from: string; to: string; weight: number }[] = [];
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        if (Math.random() < 0.45) {
          edges.push({ from: ids[i], to: ids[j], weight: Math.floor(Math.random() * 9) + 1 });
        }
      }
    }
    // Ensure basic connectivity
    for (let i = 0; i < ids.length - 1; i++) {
      const connected = edges.some(
        e => (e.from === ids[i] && e.to === ids[i + 1]) ||
             (!this.isDirected && e.from === ids[i + 1] && e.to === ids[i])
      );
      if (!connected) {
        edges.push({ from: ids[i], to: ids[i + 1], weight: Math.floor(Math.random() * 9) + 1 });
      }
    }
    const gd: GraphData = { nodes, edges, directed: this.isDirected, weighted: this.isWeighted };
    this.store.setGraphData(gd);
    this.store.setGraphStart('A');
    this.store.setGraphEnd('F');
    this.graphStartInput = 'A';
    this.graphEndInput = 'F';
    this.nodesInput = ids.join(', ');
    this.edgesInput = edges.map(e => `${e.from}-${e.to}:${e.weight}`).join(', ');
  }

  // ---- DP ----
  applyDP(): void {
    const items: KnapsackItem[] = this.itemsInput
      .split(/,\s*/)
      .map(s => {
        const parts = s.trim().split(':');
        if (parts.length < 3) return null;
        const w = parseInt(parts[1], 10);
        const v = parseInt(parts[2], 10);
        if (isNaN(w) || isNaN(v)) return null;
        return { name: parts[0].trim(), weight: w, value: v };
      })
      .filter((i): i is KnapsackItem => i !== null);
    if (items.length > 0) {
      this.store.setKnapsackItems(items, this.capacity);
    }
  }

  randomDP(): void {
    const pool = ['电脑', '手机', '平板', '相机', '书', '耳机', '键盘', '手表'];
    const n = 4 + Math.floor(Math.random() * 3);
    const items: KnapsackItem[] = Array.from({ length: n }, (_, i) => ({
      name: pool[i % pool.length],
      weight: Math.floor(Math.random() * 5) + 1,
      value: Math.floor(Math.random() * 8) + 2,
    }));
    this.capacity = 10 + Math.floor(Math.random() * 6);
    this.store.setKnapsackItems(items, this.capacity);
    this.itemsInput = items.map(i => `${i.name}:${i.weight}:${i.value}`).join(', ');
  }

  // ---- N-Queens ----
  applyQueens(): void {
    this.store.setQueensN(this.queensN);
  }

  get category() { return this.store.category(); }
}
