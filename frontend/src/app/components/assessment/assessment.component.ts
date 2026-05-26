import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlgorithmStore } from '../../store/algorithm.store';
import { AlgorithmService } from '../../services/algorithm.service';
import { TestScenario } from '../../models/algorithm.models';
import { TEST_SCENARIOS } from '../../data/test-scenarios';

interface QuestionResult {
  scenarioId: number;
  correct: boolean;
  userAnswer: string;
  explanation: string;
}

@Component({
  selector: 'app-assessment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assessment.component.html',
})
export class AssessmentComponent {
  scenarios = TEST_SCENARIOS;
  currentIndex = signal(0);
  userInput = signal('');
  results = signal<QuestionResult[]>([]);
  isSubmitted = signal(false);
  isVerifying = signal(false);

  currentScenario = computed(() => this.scenarios[this.currentIndex()] ?? null);
  totalQuestions = this.scenarios.length;
  answeredCount = computed(() => this.results().length);
  correctCount = computed(() => this.results().filter(r => r.correct).length);
  isComplete = computed(() => this.results().length >= this.totalQuestions);

  currentResult = computed(() => {
    const s = this.currentScenario();
    if (!s) return null;
    return this.results().find(r => r.scenarioId === s.id) ?? null;
  });

  constructor(private store: AlgorithmStore, private svc: AlgorithmService) {}

  prevQuestion(): void {
    if (this.currentIndex() > 0) {
      this.currentIndex.update(i => i - 1);
      this.isSubmitted.set(false);
      this.userInput.set('');
      const existing = this.results().find(r => r.scenarioId === this.currentScenario()?.id);
      if (existing) {
        this.isSubmitted.set(true);
        this.userInput.set(existing.userAnswer);
      }
    }
  }

  nextQuestion(): void {
    if (this.currentIndex() < this.totalQuestions - 1) {
      this.currentIndex.update(i => i + 1);
      this.isSubmitted.set(false);
      this.userInput.set('');
      const existing = this.results().find(r => r.scenarioId === this.currentScenario()?.id);
      if (existing) {
        this.isSubmitted.set(true);
        this.userInput.set(existing.userAnswer);
      }
    }
  }

  submitAnswer(): void {
    const scenario = this.currentScenario();
    if (!scenario || this.isSubmitted()) return;

    const userAnswer = this.userInput().trim();
    if (!userAnswer) return;

    this.isSubmitted.set(true);

    if (scenario.questionType === 'value-fill') {
      this.gradeValueFill(scenario, userAnswer);
    } else if (scenario.questionType === 'state-fill' || scenario.questionType === 'table-fill') {
      this.gradeViaApi(scenario, userAnswer);
    } else if (scenario.questionType === 'path-fill') {
      this.gradePathFill(scenario, userAnswer);
    } else {
      this.gradeChoice(scenario, userAnswer);
    }
  }

  private gradeValueFill(scenario: TestScenario, userAnswer: string): void {
    const answer = scenario.answer as Record<string, unknown>;
    // Parse user answer: try to match numeric values or comma-separated lists
    const userLower = userAnswer.toLowerCase().replace(/\s+/g, '');
    const expectedComparisons = String(answer['comparisons'] ?? '');

    // Simple check: see if user mentioned the correct number of comparisons and mids
    let correct = false;

    // For scenario 3 (binary search), answer has comparisons and mids
    if (scenario.id === 3) {
      const mids = (answer['mids'] as number[]).map(String);
      const hasComparisonCount = userLower.includes(expectedComparisons) ||
        userLower.includes(String(expectedComparisons));
      const hasMids = mids.every(m => userLower.includes(m));
      correct = hasComparisonCount && hasMids;
    } else {
      correct = userLower.includes(expectedComparisons);
    }

    this.addResult(scenario, userAnswer, correct);
  }

  private gradePathFill(scenario: TestScenario, userAnswer: string): void {
    const answer = scenario.answer as Record<string, unknown>;
    const expectedPath = String(answer['path']).replace(/\s+/g, '').toLowerCase();
    const expectedDist = String(answer['distance'] ?? '');
    const userClean = userAnswer.replace(/\s+/g, '').toLowerCase();

    const pathCorrect = userClean.includes(expectedPath) ||
      userClean.includes(expectedPath.replace(/→/g, ''));
    const distCorrect = userClean.includes(expectedDist);

    this.addResult(scenario, userAnswer, pathCorrect && distCorrect);
  }

  private gradeChoice(scenario: TestScenario, userAnswer: string): void {
    const answer = scenario.answer as string;
    const correct = userAnswer.trim().toLowerCase() === answer.toLowerCase();
    this.addResult(scenario, userAnswer, correct);
  }

  private gradeViaApi(scenario: TestScenario, userAnswer: string): void {
    if (scenario.targetStepIndex == null || !scenario.verifyField) {
      // Fallback to simple string matching
      const answerStr = JSON.stringify(scenario.answer);
      const correct = userAnswer.replace(/\s+/g, '') === answerStr.replace(/\s+/g, '');
      this.addResult(scenario, userAnswer, correct);
      return;
    }

    this.isVerifying.set(true);

    this.svc.verifyStep(scenario.algorithm, scenario.inputParams, scenario.targetStepIndex).subscribe({
      next: (res) => {
        this.isVerifying.set(false);
        if (!res?.stepData) {
          // If API not available, do basic check
          const answerStr = JSON.stringify(scenario.answer);
          const correct = userAnswer.replace(/\s+/g, '').includes(
            answerStr.replace(/\s+/g, '').substring(0, 20));
          this.addResult(scenario, userAnswer, correct);
          return;
        }

        const stepData = res.stepData as Record<string, unknown>;
        const verifyField = scenario.verifyField!;
        const expectedValue = stepData[verifyField];
        const expectedStr = JSON.stringify(expectedValue).replace(/\s+/g, '');

        // For array comparison, normalize both and compare
        const userClean = userAnswer.replace(/\s+/g, '');
        let correct = userClean.includes(expectedStr.substring(0, Math.min(expectedStr.length, 30)));

        // Special handling for dp table: check specific cell value
        if (scenario.questionType === 'table-fill') {
          const answer = scenario.answer as Record<string, unknown>;
          const dpValue = String(answer['dpValue'] ?? '');
          correct = userClean.includes(dpValue);
        }

        this.addResult(scenario, userAnswer, correct);
      },
      error: () => {
        this.isVerifying.set(false);
        // Fallback on API error
        const answerStr = JSON.stringify(scenario.answer);
        const correct = userAnswer.replace(/\s+/g, '').includes(
          answerStr.replace(/\s+/g, '').substring(0, 20));
        this.addResult(scenario, userAnswer, correct);
      },
    });
  }

  private addResult(scenario: TestScenario, userAnswer: string, correct: boolean): void {
    const existing = this.results().find(r => r.scenarioId === scenario.id);
    if (existing) {
      this.results.update(list => list.map(r =>
        r.scenarioId === scenario.id
          ? { ...r, correct, userAnswer, explanation: scenario.explanation }
          : r
      ));
    } else {
      this.results.update(list => [...list, {
        scenarioId: scenario.id,
        correct,
        userAnswer,
        explanation: scenario.explanation,
      }]);
    }
  }

  restart(): void {
    this.currentIndex.set(0);
    this.userInput.set('');
    this.results.set([]);
    this.isSubmitted.set(false);
  }

  placeholderText(): string {
    const s = this.currentScenario();
    if (!s) return '输入你的答案...';
    switch (s.questionType) {
      case 'value-fill': return '输入数值或说明...';
      case 'state-fill': return '输入数组状态（如 [3,1,2,5,8,6]）或描述...';
      case 'path-fill': return '输入路径和距离（如 A→D→E→F, 距离10）...';
      case 'table-fill': return '输入 DP 表格中指定位置的值...';
      case 'choice': return '选择或输入你的答案...';
      default: return '输入你的答案...';
    }
  }

  getResultClass(scenarioId: number): string {
    const r = this.results().find(x => x.scenarioId === scenarioId);
    if (!r) return 'bg-slate-700 text-slate-500';
    if (scenarioId === this.currentScenario()?.id) {
      return r.correct ? 'bg-green-600 text-white ring-2 ring-green-400' : 'bg-red-600 text-white ring-2 ring-red-400';
    }
    return r.correct ? 'bg-green-600 text-white' : 'bg-red-600 text-white';
  }

  getDotLabel(scenarioId: number): string {
    const r = this.results().find(x => x.scenarioId === scenarioId);
    if (!r) return String(scenarioId);
    return r.correct ? '✓' : '✗';
  }

  formatParams(params: Record<string, unknown>): string {
    if (params['array']) {
      return `array: [${(params['array'] as number[]).join(', ')}]${params['target'] != null ? ', target: ' + params['target'] : ''}`;
    }
    if (params['items']) {
      const items = params['items'] as Array<Record<string, unknown>>;
      return `items: ${items.map(i => `${i['name']}(w:${i['weight']},v:${i['value']})`).join(', ')}, capacity: ${params['capacity']}`;
    }
    if (params['graph']) return '图数据（见题目描述）';
    return JSON.stringify(params);
  }

  formatAnswer(answer: unknown): string {
    if (typeof answer === 'string') return answer;
    return JSON.stringify(answer, null, 2);
  }
}
