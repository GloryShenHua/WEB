import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlgorithmStore } from '../../store/algorithm.store';
import { AlgorithmId } from '../../models/algorithm.models';

interface AlgoEntry { id: AlgorithmId; label: string; complexity: string; }
interface AlgoGroup { category: string; icon: string; items: AlgoEntry[]; }

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  groups: AlgoGroup[] = [
    {
      category: '排序算法', icon: '📊',
      items: [
        { id: 'quick-sort',     label: '快速排序',   complexity: 'O(n log n)' },
        { id: 'merge-sort',     label: '归并排序',   complexity: 'O(n log n)' },
        { id: 'bubble-sort',    label: '冒泡排序',   complexity: 'O(n²)' },
        { id: 'heap-sort',      label: '堆排序',     complexity: 'O(n log n)' },
        { id: 'insertion-sort', label: '插入排序',   complexity: 'O(n²)' },
      ],
    },
    {
      category: '搜索类', icon: '🔍',
      items: [
        { id: 'binary-search', label: '二分查找', complexity: 'O(log n)' },
        { id: 'bfs',           label: 'BFS 广度优先', complexity: 'O(V+E)' },
        { id: 'dfs',           label: 'DFS 深度优先', complexity: 'O(V+E)' },
      ],
    },
    {
      category: '贪心算法', icon: '💚',
      items: [
        { id: 'astar', label: 'A* 启发搜索', complexity: 'O(E log V)' },
      ],
    },
    {
      category: '图算法', icon: '🕸',
      items: [
        { id: 'dijkstra', label: 'Dijkstra 最短路', complexity: 'O((V+E)logV)' },
        { id: 'prim',     label: "Prim's MST",      complexity: 'O(E log V)' },
        { id: 'kruskal',  label: "Kruskal's MST",   complexity: 'O(E log E)' },
      ],
    },
    {
      category: '动态规划', icon: '💡',
      items: [
        { id: 'knapsack', label: '0/1 背包', complexity: 'O(nW)' },
      ],
    },
    {
      category: '回溯算法', icon: '♟',
      items: [
        { id: 'n-queens', label: 'N 皇后 / 八皇后', complexity: 'O(n!)' },
      ],
    },
    {
      category: '分治算法', icon: '🌳',
      items: [
        { id: 'karatsuba', label: '大整数乘法 Karatsuba', complexity: 'O(n^1.585)' },
      ],
    },
    {
      category: 'VR/3D',
      icon: '🕶',
      items: [
        { id: 'data-structure-3d', label: '3D 数据结构学习', complexity: '' },
      ],
    }
  ];

  constructor(public store: AlgorithmStore) {}

  select(id: AlgorithmId): void {
    this.store.setAlgorithm(id);
  }
}
