import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AlgorithmStore } from './store/algorithm.store';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ControlPanelComponent } from './components/control-panel/control-panel.component';
import { InputConfigComponent } from './components/input-config/input-config.component';
import { ComplexityPanelComponent } from './components/complexity-panel/complexity-panel.component';
import { PhaseGuideComponent } from './components/phase-guide/phase-guide.component';
import { SortingVisualizerComponent } from './visualizers/sorting/sorting-visualizer.component';
import { GraphVisualizerComponent } from './visualizers/graph/graph-visualizer.component';
import { SearchVisualizerComponent } from './visualizers/search/search-visualizer.component';
import { DpVisualizerComponent } from './visualizers/dp/dp-visualizer.component';
import { NQueensVisualizerComponent } from './visualizers/n-queens/n-queens-visualizer.component';
import { HistoryPanelComponent } from './components/history-panel/history-panel.component';
import { AssessmentComponent } from './components/assessment/assessment.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    ControlPanelComponent,
    InputConfigComponent,
    ComplexityPanelComponent,
    PhaseGuideComponent,
    SortingVisualizerComponent,
    GraphVisualizerComponent,
    SearchVisualizerComponent,
    DpVisualizerComponent,
    NQueensVisualizerComponent,
    HistoryPanelComponent,
    AssessmentComponent,
  ],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  tabs = [
    { id: 'visualizer' as const, label: '可视化', icon: '⚡' },
    { id: 'assessment' as const, label: '评估测试', icon: '📝' },
    { id: 'history'    as const, label: '历史记录', icon: '📋' },
  ];

  compareMetrics = computed(() => {
    if (!this.store.compareMode() || this.store.steps().length === 0 || this.store.compareSteps().length === 0) {
      return null;
    }
    const pLast = this.store.steps()[this.store.steps().length - 1] as unknown as Record<string, number>;
    const cLast = this.store.compareSteps()[this.store.compareSteps().length - 1] as unknown as Record<string, number>;
    return {
      primarySteps: this.store.steps().length,
      compareSteps: this.store.compareSteps().length,
      primaryComps: pLast['comparisons'] ?? 0,
      compareComps: cLast['comparisons'] ?? 0,
      primarySwaps: pLast['swaps'] ?? pLast['backtracks'] ?? 0,
      compareSwaps: cLast['swaps'] ?? cLast['backtracks'] ?? 0,
    };
  });

  constructor(public store: AlgorithmStore) {}

  ngOnInit(): void {}
}
