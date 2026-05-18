import type { KnapsackItem, KnapsackStep } from '../types';

export function generateKnapsackSteps(
  items: KnapsackItem[],
  capacity: number
): KnapsackStep[] {
  const steps: KnapsackStep[] = [];
  const n = items.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));
  let comparisons = 0;

  steps.push({
    dp: dp.map(row => [...row]),
    currentItem: -1,
    currentWeight: -1,
    decision: 'init',
    description: `初始化 DP 表：dp[i][w] 表示前 i 件物品、容量为 w 时的最大价值`,
    codeLine: 1,
    totalValue: 0,
    selectedItems: [],
    tracePath: [],
    comparisons,
  });

  for (let i = 1; i <= n; i++) {
    const item = items[i - 1];
    for (let w = 0; w <= capacity; w++) {
      comparisons++;
      if (item.weight > w) {
        // Can't take item i
        dp[i][w] = dp[i - 1][w];
        steps.push({
          dp: dp.map(row => [...row]),
          currentItem: i,
          currentWeight: w,
          decision: 'skip',
          description: `物品 ${i}（${item.name}, 重量=${item.weight}）超过当前容量 ${w}，跳过 → dp[${i}][${w}]=${dp[i][w]}`,
          codeLine: 3,
          totalValue: dp[i][w],
          selectedItems: [],
          tracePath: [],
          comparisons,
        });
      } else {
        const withItem = dp[i - 1][w - item.weight] + item.value;
        const withoutItem = dp[i - 1][w];
        comparisons++;
        steps.push({
          dp: dp.map(row => [...row]),
          currentItem: i,
          currentWeight: w,
          decision: 'compare',
          description: `比较：不取物品 ${i} = dp[${i-1}][${w}]=${withoutItem}，取物品 ${i} = dp[${i-1}][${w}-${item.weight}]+${item.value}=${withItem}`,
          codeLine: 4,
          totalValue: Math.max(withItem, withoutItem),
          selectedItems: [],
          tracePath: [],
          comparisons,
        });

        if (withItem > withoutItem) {
          dp[i][w] = withItem;
          steps.push({
            dp: dp.map(row => [...row]),
            currentItem: i,
            currentWeight: w,
            decision: 'take',
            description: `选择取物品 ${i}（${item.name}）→ dp[${i}][${w}] = ${withItem}`,
            codeLine: 5,
            totalValue: withItem,
            selectedItems: [],
            tracePath: [],
            comparisons,
          });
        } else {
          dp[i][w] = withoutItem;
          steps.push({
            dp: dp.map(row => [...row]),
            currentItem: i,
            currentWeight: w,
            decision: 'skip',
            description: `选择不取物品 ${i}（${item.name}）→ dp[${i}][${w}] = ${withoutItem}`,
            codeLine: 5,
            totalValue: withoutItem,
            selectedItems: [],
            tracePath: [],
            comparisons,
          });
        }
      }
    }
  }

  // Traceback
  const selectedItems: number[] = [];
  const tracePath: [number, number][] = [];
  let w = capacity;
  for (let i = n; i > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      selectedItems.push(i - 1);
      tracePath.push([i, w]);
      w -= items[i - 1].weight;
    } else {
      tracePath.push([i, w]);
    }
  }

  steps.push({
    dp: dp.map(row => [...row]),
    currentItem: -1,
    currentWeight: -1,
    decision: null,
    description: `✓ 背包问题求解完成！最大价值 = ${dp[n][capacity]}，选取物品：${selectedItems.map(i => items[i].name).join(', ')}`,
    codeLine: 6,
    totalValue: dp[n][capacity],
    selectedItems,
    tracePath,
    comparisons,
  });

  return steps;
}
