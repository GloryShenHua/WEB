import type { SearchStep } from '../types';

export function generateBinarySearchSteps(
  sortedArr: number[],
  target: number
): SearchStep[] {
  const steps: SearchStep[] = [];
  const array = [...sortedArr];
  let comparisons = 0;
  let left = 0;
  let right = array.length - 1;

  steps.push({
    array,
    left,
    right,
    mid: Math.floor((left + right) / 2),
    target,
    found: null,
    eliminated: null,
    description: `在有序数组中查找目标值 ${target}，初始范围 [0, ${right}]`,
    codeLine: 1,
    comparisons,
  });

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    comparisons++;

    steps.push({
      array,
      left,
      right,
      mid,
      target,
      found: null,
      eliminated: null,
      description: `计算中间索引 mid = (${left} + ${right}) / 2 = ${mid}，arr[mid] = ${array[mid]}`,
      codeLine: 2,
      comparisons,
    });

    if (array[mid] === target) {
      steps.push({
        array,
        left,
        right,
        mid,
        target,
        found: true,
        eliminated: null,
        description: `✓ 找到目标值 ${target}，位于索引 ${mid}！`,
        codeLine: 3,
        comparisons,
      });
      return steps;
    } else if (array[mid] < target) {
      steps.push({
        array,
        left,
        right,
        mid,
        target,
        found: null,
        eliminated: 'left',
        description: `arr[mid]=${array[mid]} < ${target}，排除左半部分，left = ${mid + 1}`,
        codeLine: 4,
        comparisons,
      });
      left = mid + 1;
    } else {
      steps.push({
        array,
        left,
        right,
        mid,
        target,
        found: null,
        eliminated: 'right',
        description: `arr[mid]=${array[mid]} > ${target}，排除右半部分，right = ${mid - 1}`,
        codeLine: 5,
        comparisons,
      });
      right = mid - 1;
    }
  }

  steps.push({
    array,
    left,
    right,
    mid: -1,
    target,
    found: false,
    eliminated: null,
    description: `✗ 未找到目标值 ${target}，搜索范围为空`,
    codeLine: 6,
    comparisons,
  });

  return steps;
}
