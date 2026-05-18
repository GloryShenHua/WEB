import React, { useState } from 'react';
import { useAlgorithmStore } from '../store';
import {
  generateQuickSortSteps,
  generateMergeSortSteps,
  generateBubbleSortSteps,
} from '../algorithms/sorting';
import { generateBinarySearchSteps } from '../algorithms/search';
import type { SortStep, SearchStep } from '../types';

interface TestCase {
  id: string;
  title: string;
  description: string;
  algorithm: string;
  setup: () => { steps: SortStep[] | SearchStep[]; question: string; options: string[]; correctAnswer: number };
}

const TEST_CASES: TestCase[] = [
  {
    id: 'qs1',
    title: '快速排序 — 第一次分区',
    description: '对数组 [8, 3, 1, 6, 2, 5] 执行快速排序，以最后一个元素为基准，第一次分区后结果是？',
    algorithm: 'quick-sort',
    setup: () => {
      const steps = generateQuickSortSteps([8, 3, 1, 6, 2, 5]);
      // Find the step where pivot is placed
      const partitionEnd = steps.findIndex(s => s.sorted.length === 1);
      const afterPartition = steps[partitionEnd] as SortStep;
      return {
        steps,
        question: '对 [8, 3, 1, 6, 2, 5] 快速排序（基准=5），第一次分区后的数组状态是？',
        options: [
          '[3, 1, 2, 5, 8, 6]',
          '[1, 3, 2, 5, 6, 8]',
          '[3, 1, 2, 6, 8, 5]',
          '[1, 2, 3, 5, 6, 8]',
        ],
        correctAnswer: 0,
      };
    },
  },
  {
    id: 'ms1',
    title: '归并排序 — 合并过程',
    description: '对数组 [5, 2, 8, 1, 9, 3] 进行归并排序，最终结果？',
    algorithm: 'merge-sort',
    setup: () => {
      const steps = generateMergeSortSteps([5, 2, 8, 1, 9, 3]);
      return {
        steps,
        question: '[5, 2, 8, 1, 9, 3] 归并排序的最终结果？',
        options: [
          '[1, 2, 3, 5, 8, 9]',
          '[1, 2, 3, 8, 9, 5]',
          '[2, 1, 3, 5, 8, 9]',
          '[1, 3, 2, 5, 8, 9]',
        ],
        correctAnswer: 0,
      };
    },
  },
  {
    id: 'bs1',
    title: '二分查找 — 查找次数',
    description: '在有序数组 [1,3,5,7,9,11,13,15] 中查找 7，需要比较几次？',
    algorithm: 'binary-search',
    setup: () => {
      const steps = generateBinarySearchSteps([1, 3, 5, 7, 9, 11, 13, 15], 7);
      const finalStep = steps[steps.length - 1] as SearchStep;
      return {
        steps,
        question: '在 [1,3,5,7,9,11,13,15] 中用二分查找查找 7，共需比较几次？',
        options: ['2 次', '3 次', '4 次', '5 次'],
        correctAnswer: 1,
      };
    },
  },
  {
    id: 'qs2',
    title: '时间复杂度判断',
    description: '以下哪种情况是快速排序的最坏时间复杂度？',
    algorithm: 'quick-sort',
    setup: () => {
      const steps = generateQuickSortSteps([1, 2, 3, 4, 5, 6, 7]);
      return {
        steps,
        question: '快速排序在什么情况下退化到 O(n²)？',
        options: [
          '随机无序数组',
          '数组已经排好序（或逆序）',
          '所有元素相同',
          '数组元素个数为奇数',
        ],
        correctAnswer: 1,
      };
    },
  },
  {
    id: 'bubble1',
    title: '冒泡排序 — 中间状态',
    description: '对 [5, 1, 4, 2, 8] 执行冒泡排序，第一轮结束后数组是？',
    algorithm: 'bubble-sort',
    setup: () => {
      const steps = generateBubbleSortSteps([5, 1, 4, 2, 8]);
      const firstRoundEnd = steps.find(s => s.sorted.length === 1) as SortStep | undefined;
      return {
        steps,
        question: '[5, 1, 4, 2, 8] 冒泡排序第一轮结束后的状态？',
        options: [
          '[1, 4, 2, 5, 8]',
          '[1, 2, 4, 5, 8]',
          '[5, 1, 2, 4, 8]',
          '[1, 4, 2, 8, 5]',
        ],
        correctAnswer: 0,
      };
    },
  },
  {
    id: 'knapsack1',
    title: '背包问题 — 复杂度分析',
    description: '0/1 背包问题带有几件物品、容量为 W 时，DP 的时间复杂度是？',
    algorithm: 'knapsack',
    setup: () => {
      const steps = generateQuickSortSteps([3, 1, 4, 1, 5]);
      return {
        steps,
        question: '0/1 背包问题（n 件物品，容量 W）动态规划的时间与空间复杂度？',
        options: [
          'O(nW) 时间，O(nW) 空间',
          'O(n²) 时间，O(n) 空间',
          'O(2ⁿ) 时间，O(n) 空间',
          'O(nW) 时间，O(W) 空间（空间优化）',
        ],
        correctAnswer: 0,
      };
    },
  },
];

interface TestResult {
  caseId: string;
  selected: number;
  correct: boolean;
}

export const EvaluationPanel: React.FC = () => {
  const { setAlgorithm, setSteps, setCurrentStep } = useAlgorithmStore();
  const [currentCaseIdx, setCurrentCaseIdx] = useState(0);
  const [results, setResults] = useState<TestResult[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [caseSetup, setCaseSetup] = useState<ReturnType<TestCase['setup']> | null>(null);

  const currentCase = TEST_CASES[currentCaseIdx];

  const loadCase = (idx: number) => {
    const tc = TEST_CASES[idx];
    const setup = tc.setup();
    setCaseSetup(setup);
    setAlgorithm(tc.algorithm as any);
    setSteps(setup.steps as any);
    setCurrentStep(0);
    setSelectedOption(null);
    setShowAnswer(false);
    setCurrentCaseIdx(idx);
  };

  const handleSelect = (optionIdx: number) => {
    if (showAnswer) return;
    setSelectedOption(optionIdx);
  };

  const handleSubmit = () => {
    if (selectedOption === null || !caseSetup) return;
    const correct = selectedOption === caseSetup.correctAnswer;
    setResults(prev => {
      const existing = prev.find(r => r.caseId === currentCase.id);
      if (existing) {
        return prev.map(r => r.caseId === currentCase.id ? { ...r, selected: selectedOption, correct } : r);
      }
      return [...prev, { caseId: currentCase.id, selected: selectedOption, correct }];
    });
    setShowAnswer(true);
  };

  const score = results.filter(r => r.correct).length;
  const total = results.length;

  return (
    <div className="flex-1 flex gap-4 p-4 overflow-hidden">
      {/* Test case list */}
      <div className="w-56 flex-shrink-0 overflow-y-auto">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">测试题目</h2>
        <div className="space-y-2">
          {TEST_CASES.map((tc, idx) => {
            const result = results.find(r => r.caseId === tc.id);
            return (
              <button
                key={tc.id}
                onClick={() => loadCase(idx)}
                className={`w-full text-left px-3 py-2.5 rounded-xl border transition-colors text-xs ${
                  currentCaseIdx === idx
                    ? 'bg-blue-900/40 border-blue-700 text-white'
                    : result?.correct
                    ? 'bg-green-900/20 border-green-800 text-slate-300 hover:bg-green-900/30'
                    : result && !result.correct
                    ? 'bg-red-900/20 border-red-800 text-slate-300 hover:bg-red-900/30'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-mono font-bold">{idx + 1}.</span>
                  {result && (
                    <span>{result.correct ? '✓' : '✗'}</span>
                  )}
                </div>
                <span>{tc.title}</span>
              </button>
            );
          })}
        </div>

        {/* Score */}
        {total > 0 && (
          <div className="mt-4 bg-slate-800 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-white">{score}/{total}</div>
            <div className="text-xs text-slate-400">已答题得分</div>
            <div className="mt-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${(score / total) * 100}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Main test area */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
        <div className="bg-slate-900 rounded-xl border border-slate-700 p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-white font-semibold text-lg">{currentCase.title}</h3>
              <p className="text-slate-400 text-sm mt-1">{currentCase.description}</p>
            </div>
            <span className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded font-mono">
              {currentCase.algorithm}
            </span>
          </div>

          {caseSetup && (
            <div className="mt-4">
              <p className="text-white font-medium mb-4">{caseSetup.question}</p>
              <div className="space-y-2">
                {caseSetup.options.map((opt, i) => {
                  let optStyle = 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750 cursor-pointer';
                  if (selectedOption === i && !showAnswer) {
                    optStyle = 'bg-blue-900/40 border-blue-600 text-white';
                  } else if (showAnswer && i === caseSetup.correctAnswer) {
                    optStyle = 'bg-green-900/40 border-green-600 text-green-300';
                  } else if (showAnswer && selectedOption === i && i !== caseSetup.correctAnswer) {
                    optStyle = 'bg-red-900/40 border-red-600 text-red-300';
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handleSelect(i)}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors ${optStyle}`}
                    >
                      <span className="font-mono font-bold mr-2 text-slate-500">{String.fromCharCode(65 + i)}.</span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3 mt-4">
                {!showAnswer ? (
                  <button
                    onClick={handleSubmit}
                    disabled={selectedOption === null}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    提交答案
                  </button>
                ) : (
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${
                    results.find(r => r.caseId === currentCase.id)?.correct
                      ? 'bg-green-900/40 text-green-400'
                      : 'bg-red-900/40 text-red-400'
                  }`}>
                    {results.find(r => r.caseId === currentCase.id)?.correct
                      ? '✓ 回答正确！'
                      : `✗ 答案是 ${String.fromCharCode(65 + caseSetup.correctAnswer)}`}
                  </div>
                )}

                <button
                  onClick={() => loadCase(currentCaseIdx)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm"
                >
                  在可视化中查看
                </button>

                {currentCaseIdx < TEST_CASES.length - 1 && (
                  <button
                    onClick={() => loadCase(currentCaseIdx + 1)}
                    className="ml-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm"
                  >
                    下一题 →
                  </button>
                )}
              </div>
            </div>
          )}

          {!caseSetup && (
            <button
              onClick={() => loadCase(currentCaseIdx)}
              className="mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold"
            >
              开始此题
            </button>
          )}
        </div>

        {/* Algorithm visualization hint */}
        {caseSetup && (
          <div className="bg-slate-900 rounded-xl border border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-blue-400">💡</span>
              <span className="text-white font-semibold text-sm">提示：使用可视化验证</span>
            </div>
            <p className="text-slate-400 text-sm">
              切换到"可视化"面板，使用步骤控制观察算法执行过程，帮助理解和验证答案。当前已加载相关算法。
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
