import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AlgorithmStore } from './store/algorithm.store';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ControlPanelComponent } from './components/control-panel/control-panel.component';
import { InputConfigComponent } from './components/input-config/input-config.component';
import { ComplexityPanelComponent } from './components/complexity-panel/complexity-panel.component';
import { SortingVisualizerComponent } from './visualizers/sorting/sorting-visualizer.component';
import { GraphVisualizerComponent } from './visualizers/graph/graph-visualizer.component';
import { SearchVisualizerComponent } from './visualizers/search/search-visualizer.component';
import { DpVisualizerComponent } from './visualizers/dp/dp-visualizer.component';
import { NQueensVisualizerComponent } from './visualizers/n-queens/n-queens-visualizer.component';
import { DivideConquerVisualizerComponent } from './visualizers/divide-conquer/divide-conquer-visualizer.component';
import { HistoryPanelComponent } from './components/history-panel/history-panel.component';
import {Vr3dVisualizerComponent} from "./visualizers/vr-3d/vr-3d-visualizer.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    //RouterOutlet,
    SidebarComponent,
    ControlPanelComponent,
    InputConfigComponent,
    ComplexityPanelComponent,
    SortingVisualizerComponent,
    GraphVisualizerComponent,
    SearchVisualizerComponent,
    DpVisualizerComponent,
    NQueensVisualizerComponent,
    DivideConquerVisualizerComponent,
    HistoryPanelComponent,
    Vr3dVisualizerComponent,
  ],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  tabs = [
    { id: 'visualizer' as const, label: '可视化', icon: '⚡' },
    { id: 'history'    as const, label: '历史记录', icon: '📋' },
  ];

  constructor(public store: AlgorithmStore) {}

  ngOnInit(): void {}
}
