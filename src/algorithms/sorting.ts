import type { SortStep } from '../types';

function makeStep(
  array: number[],
  sorted: number[],
  comparisons: number,
  swaps: number,
  accesses: number,
  options: Partial<SortStep>
): SortStep {
  return {
    array: [...array],
    comparing: [],
    swapping: [],
    sorted: [...sorted],
    pivot: null,
    rangeLeft: 0,
    rangeRight: array.length - 1,
    description: '',
    codeLine: 0,
    comparisons,
    swaps,
    accesses,
    ...options,
  };
}

// ==================== QUICKSORT ====================
export function generateQuickSortSteps(input: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const arr = [...input];
  const sorted: number[] = [];
  let comparisons = 0;
  let swaps = 0;
  let accesses = 0;

  function partition(low: number, high: number): number {
    const pivot = arr[high];
    accesses++;
    steps.push(makeStep(arr, sorted, comparisons, swaps, accesses, {
      pivot: high,
      rangeLeft: low,
      rangeRight: high,
      description: `选择基准值 arr[${high}] = ${pivot}，开始分区 [${low}, ${high}]`,
      codeLine: 1,
    }));

    let i = low - 1;
    for (let j = low; j < high; j++) {
      comparisons++;
      accesses += 2;
      steps.push(makeStep(arr, sorted, comparisons, swaps, accesses, {
        comparing: [j, high],
        pivot: high,
        rangeLeft: low,
        rangeRight: high,
        description: `比较 arr[${j}]=${arr[j]} 与基准值 ${pivot}`,
        codeLine: 3,
      }));

      if (arr[j] <= pivot) {
        i++;
        if (i !== j) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          swaps++;
          accesses += 2;
          steps.push(makeStep(arr, sorted, comparisons, swaps, accesses, {
            swapping: [i, j],
            pivot: high,
            rangeLeft: low,
            rangeRight: high,
            description: `交换 arr[${i}]↔arr[${j}]（现在为 ${arr[i]}, ${arr[j]}）`,
            codeLine: 5,
          }));
        }
      }
    }

    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    swaps++;
    accesses += 2;
    const pivotFinal = i + 1;
    sorted.push(pivotFinal);
    steps.push(makeStep(arr, sorted, comparisons, swaps, accesses, {
      swapping: [i + 1, high],
      pivot: pivotFinal,
      rangeLeft: low,
      rangeRight: high,
      description: `基准值归位：arr[${pivotFinal}] = ${arr[pivotFinal]}`,
      codeLine: 7,
    }));

    return pivotFinal;
  }

  function quickSort(low: number, high: number) {
    if (low >= high) {
      if (low === high) sorted.push(low);
      return;
    }
    const p = partition(low, high);
    quickSort(low, p - 1);
    quickSort(p + 1, high);
  }

  quickSort(0, arr.length - 1);
  const allSorted = Array.from({ length: arr.length }, (_, i) => i);
  steps.push(makeStep(arr, allSorted, comparisons, swaps, accesses, {
    description: '✓ 快速排序完成！',
    codeLine: 8,
  }));

  return steps;
}

// ==================== MERGE SORT ====================
export function generateMergeSortSteps(input: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const arr = [...input];
  let comparisons = 0;
  let swaps = 0;
  let accesses = 0;

  function merge(left: number, mid: number, right: number) {
    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);
    accesses += leftArr.length + rightArr.length;

    steps.push(makeStep(arr, [], comparisons, swaps, accesses, {
      rangeLeft: left,
      rangeRight: right,
      mergeLeft: leftArr,
      mergeRight: rightArr,
      mergeTarget: left,
      description: `合并子数组 [${left}..${mid}] 和 [${mid + 1}..${right}]`,
      codeLine: 2,
    }));

    let i = 0, j = 0, k = left;
    while (i < leftArr.length && j < rightArr.length) {
      comparisons++;
      accesses += 2;
      if (leftArr[i] <= rightArr[j]) {
        arr[k] = leftArr[i];
        i++;
      } else {
        arr[k] = rightArr[j];
        j++;
      }
      swaps++;
      steps.push(makeStep(arr, [], comparisons, swaps, accesses, {
        swapping: [k],
        rangeLeft: left,
        rangeRight: right,
        mergeLeft: leftArr.slice(i),
        mergeRight: rightArr.slice(j),
        mergeTarget: k + 1,
        description: `放入元素 ${arr[k]} → arr[${k}]`,
        codeLine: 4,
      }));
      k++;
    }

    while (i < leftArr.length) {
      arr[k] = leftArr[i]; i++; k++; swaps++;
      steps.push(makeStep(arr, [], comparisons, swaps, accesses, {
        swapping: [k - 1],
        rangeLeft: left,
        rangeRight: right,
        mergeLeft: leftArr.slice(i),
        mergeRight: [],
        mergeTarget: k,
        description: `放入剩余左半 ${arr[k - 1]} → arr[${k - 1}]`,
        codeLine: 5,
      }));
    }

    while (j < rightArr.length) {
      arr[k] = rightArr[j]; j++; k++; swaps++;
      steps.push(makeStep(arr, [], comparisons, swaps, accesses, {
        swapping: [k - 1],
        rangeLeft: left,
        rangeRight: right,
        mergeLeft: [],
        mergeRight: rightArr.slice(j),
        mergeTarget: k,
        description: `放入剩余右半 ${arr[k - 1]} → arr[${k - 1}]`,
        codeLine: 6,
      }));
    }
  }

  function mergeSort(left: number, right: number) {
    if (left >= right) return;
    const mid = Math.floor((left + right) / 2);
    steps.push(makeStep(arr, [], comparisons, swaps, accesses, {
      rangeLeft: left,
      rangeRight: right,
      description: `分割 [${left}..${right}] → [${left}..${mid}] 和 [${mid + 1}..${right}]`,
      codeLine: 1,
    }));
    mergeSort(left, mid);
    mergeSort(mid + 1, right);
    merge(left, mid, right);
  }

  mergeSort(0, arr.length - 1);
  const allSorted = Array.from({ length: arr.length }, (_, i) => i);
  steps.push(makeStep(arr, allSorted, comparisons, swaps, accesses, {
    description: '✓ 归并排序完成！',
    codeLine: 7,
  }));

  return steps;
}

// ==================== BUBBLE SORT ====================
export function generateBubbleSortSteps(input: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const arr = [...input];
  const sorted: number[] = [];
  let comparisons = 0;
  let swaps = 0;
  let accesses = 0;

  for (let i = 0; i < arr.length - 1; i++) {
    let swapped = false;
    for (let j = 0; j < arr.length - 1 - i; j++) {
      comparisons++;
      accesses += 2;
      steps.push(makeStep(arr, sorted, comparisons, swaps, accesses, {
        comparing: [j, j + 1],
        rangeLeft: 0,
        rangeRight: arr.length - 1 - i,
        description: `比较 arr[${j}]=${arr[j]} 与 arr[${j + 1}]=${arr[j + 1]}`,
        codeLine: 2,
      }));

      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swaps++;
        accesses += 2;
        swapped = true;
        steps.push(makeStep(arr, sorted, comparisons, swaps, accesses, {
          swapping: [j, j + 1],
          rangeLeft: 0,
          rangeRight: arr.length - 1 - i,
          description: `交换 arr[${j}]↔arr[${j + 1}]（现在为 ${arr[j]}, ${arr[j + 1]}）`,
          codeLine: 3,
        }));
      }
    }
    sorted.push(arr.length - 1 - i);
    steps.push(makeStep(arr, sorted, comparisons, swaps, accesses, {
      description: `第 ${arr.length - 1 - i} 轮结束，元素 ${arr[arr.length - 1 - i]} 已归位`,
      codeLine: 4,
    }));
    if (!swapped) break;
  }

  sorted.push(0);
  const allSorted = Array.from({ length: arr.length }, (_, i) => i);
  steps.push(makeStep(arr, allSorted, comparisons, swaps, accesses, {
    description: '✓ 冒泡排序完成！',
    codeLine: 5,
  }));

  return steps;
}

// ==================== HEAP SORT ====================
export function generateHeapSortSteps(input: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const arr = [...input];
  const sorted: number[] = [];
  let comparisons = 0;
  let swaps = 0;
  let accesses = 0;

  function heapify(n: number, i: number) {
    let largest = i;
    const l = 2 * i + 1;
    const r = 2 * i + 2;

    if (l < n) {
      comparisons++;
      accesses += 2;
      steps.push(makeStep(arr, sorted, comparisons, swaps, accesses, {
        comparing: [l, largest],
        description: `比较左子节点 arr[${l}]=${arr[l]} 与父节点 arr[${largest}]=${arr[largest]}`,
        codeLine: 2,
      }));
      if (arr[l] > arr[largest]) largest = l;
    }

    if (r < n) {
      comparisons++;
      accesses += 2;
      steps.push(makeStep(arr, sorted, comparisons, swaps, accesses, {
        comparing: [r, largest],
        description: `比较右子节点 arr[${r}]=${arr[r]} 与最大值 arr[${largest}]=${arr[largest]}`,
        codeLine: 3,
      }));
      if (arr[r] > arr[largest]) largest = r;
    }

    if (largest !== i) {
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      swaps++;
      accesses += 2;
      steps.push(makeStep(arr, sorted, comparisons, swaps, accesses, {
        swapping: [i, largest],
        description: `交换 arr[${i}]↔arr[${largest}]，维护堆性质`,
        codeLine: 4,
      }));
      heapify(n, largest);
    }
  }

  // Build max heap
  steps.push(makeStep(arr, sorted, comparisons, swaps, accesses, {
    description: '建立最大堆（Build Max Heap）',
    codeLine: 1,
  }));

  for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) {
    heapify(arr.length, i);
  }

  // Extract elements
  for (let i = arr.length - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    swaps++;
    accesses += 2;
    sorted.push(i);
    steps.push(makeStep(arr, sorted, comparisons, swaps, accesses, {
      swapping: [0, i],
      description: `将堆顶 ${arr[i]} 与末尾交换，缩小堆范围`,
      codeLine: 5,
    }));
    heapify(i, 0);
  }

  sorted.push(0);
  steps.push(makeStep(arr, Array.from({ length: arr.length }, (_, i) => i), comparisons, swaps, accesses, {
    description: '✓ 堆排序完成！',
    codeLine: 6,
  }));

  return steps;
}

// ==================== INSERTION SORT ====================
export function generateInsertionSortSteps(input: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const arr = [...input];
  const sorted: number[] = [0];
  let comparisons = 0;
  let swaps = 0;
  let accesses = 0;

  steps.push(makeStep(arr, sorted, comparisons, swaps, accesses, {
    description: 'arr[0] 已排序，从 arr[1] 开始插入',
    codeLine: 1,
  }));

  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    accesses++;
    let j = i - 1;

    steps.push(makeStep(arr, sorted, comparisons, swaps, accesses, {
      comparing: [i],
      description: `取出 key = ${key}（arr[${i}]），向已排序部分插入`,
      codeLine: 2,
    }));

    while (j >= 0 && arr[j] > key) {
      comparisons++;
      accesses++;
      arr[j + 1] = arr[j];
      swaps++;
      steps.push(makeStep(arr, sorted, comparisons, swaps, accesses, {
        swapping: [j, j + 1],
        comparing: [j],
        description: `arr[${j}]=${arr[j - 1] ?? arr[j]} > ${key}，右移一位`,
        codeLine: 3,
      }));
      j--;
    }

    comparisons++;
    arr[j + 1] = key;
    accesses++;
    sorted.push(i);
    steps.push(makeStep(arr, sorted, comparisons, swaps, accesses, {
      swapping: [j + 1],
      description: `将 ${key} 插入到 arr[${j + 1}]`,
      codeLine: 4,
    }));
  }

  steps.push(makeStep(arr, Array.from({ length: arr.length }, (_, i) => i), comparisons, swaps, accesses, {
    description: '✓ 插入排序完成！',
    codeLine: 5,
  }));

  return steps;
}

// ==================== BINARY SEARCH ====================
export { generateBinarySearchSteps } from './search.ts';
