import type { NQueensStep } from '../types';

export function generateNQueensSteps(n: number): NQueensStep[] {
  const steps: NQueensStep[] = [];
  const board = new Array(n).fill(-1);
  const allSolutions: number[][] = [];
  let backtracks = 0;
  let solutionsFound = 0;

  function isSafe(row: number, col: number): Array<[number, number]> {
    const conflicts: Array<[number, number]> = [];
    for (let r = 0; r < row; r++) {
      const c = board[r];
      if (c === col || Math.abs(c - col) === Math.abs(r - row)) {
        conflicts.push([r, c]);
      }
    }
    return conflicts;
  }

  function solveNQueens(row: number) {
    if (row === n) {
      solutionsFound++;
      allSolutions.push([...board]);
      steps.push({
        board: [...board],
        n,
        currentRow: row,
        currentCol: -1,
        conflicts: [],
        placing: null,
        removing: null,
        description: `🎉 找到第 ${solutionsFound} 个解！棋盘配置：[${board.join(', ')}]`,
        codeLine: 2,
        backtracks,
        solutionsFound,
        solutions: [...allSolutions],
        allSolutions: [],
      });
      return;
    }

    for (let col = 0; col < n; col++) {
      const conflicts = isSafe(row, col);

      steps.push({
        board: [...board],
        n,
        currentRow: row,
        currentCol: col,
        conflicts,
        placing: [row, col],
        removing: null,
        description:
          conflicts.length > 0
            ? `尝试在 (${row}, ${col}) 放置皇后 → 冲突！（与行 ${conflicts.map(c => c[0]).join(', ')} 的皇后冲突）`
            : `尝试在 (${row}, ${col}) 放置皇后 → 安全！`,
        codeLine: 3,
        backtracks,
        solutionsFound,
        solutions: [...allSolutions],
      });

      if (conflicts.length === 0) {
        board[row] = col;
        steps.push({
          board: [...board],
          n,
          currentRow: row,
          currentCol: col,
          conflicts: [],
          placing: [row, col],
          removing: null,
          description: `✓ 在 (${row}, ${col}) 放置皇后，进入下一行`,
          codeLine: 4,
          backtracks,
          solutionsFound,
          solutions: [...allSolutions],
        });

        solveNQueens(row + 1);

        // Backtrack
        board[row] = -1;
        backtracks++;
        steps.push({
          board: [...board],
          n,
          currentRow: row,
          currentCol: col,
          conflicts: [],
          placing: null,
          removing: [row, col],
          description: `回溯：撤销 (${row}, ${col}) 的皇后，尝试下一列`,
          codeLine: 5,
          backtracks,
          solutionsFound,
          solutions: [...allSolutions],
        });
      }
    }
  }

  steps.push({
    board: [...board],
    n,
    currentRow: 0,
    currentCol: -1,
    conflicts: [],
    placing: null,
    removing: null,
    description: `${n} 皇后问题：在 ${n}×${n} 棋盘上放置 ${n} 个互不攻击的皇后`,
    codeLine: 1,
    backtracks: 0,
    solutionsFound: 0,
    solutions: [],
    allSolutions: [],
  });

  solveNQueens(0);

  steps.push({
    board: new Array(n).fill(-1),
    n,
    currentRow: -1,
    currentCol: -1,
    conflicts: [],
    placing: null,
    removing: null,
    description: `✓ ${n} 皇后问题求解完成！共找到 ${solutionsFound} 个解，回溯 ${backtracks} 次`,
    codeLine: 6,
    backtracks,
    solutionsFound,
    solutions: [...allSolutions],
    allSolutions: [...allSolutions],
  });

  return steps;
}
