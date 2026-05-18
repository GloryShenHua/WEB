import type { GraphData, GraphStep, GraphEdge } from '../types';

const INF = Infinity;

function edgeKey(from: string, to: string) {
  return `${from}-${to}`;
}

function initStep(graphData: GraphData): GraphStep {
  const nodeStates: Record<string, string> = {};
  const edgeStates: Record<string, string> = {};
  graphData.nodes.forEach(n => (nodeStates[n.id] = 'unvisited'));
  graphData.edges.forEach(e => {
    edgeStates[edgeKey(e.from, e.to)] = 'default';
    if (!graphData.directed) edgeStates[edgeKey(e.to, e.from)] = 'default';
  });
  return {
    nodeStates: nodeStates as GraphStep['nodeStates'],
    edgeStates: edgeStates as GraphStep['edgeStates'],
    distances: {},
    queue: [],
    stack: [],
    current: null,
    path: [],
    description: '',
    codeLine: 0,
    visitedCount: 0,
    pathLength: 0,
    comparisons: 0,
  };
}

// ==================== DIJKSTRA ====================
export function generateDijkstraSteps(
  graphData: GraphData,
  startId: string,
  endId: string
): GraphStep[] {
  const steps: GraphStep[] = [];
  const nodes = graphData.nodes.map(n => n.id);
  const adj: Record<string, Array<{ to: string; weight: number }>> = {};
  nodes.forEach(n => (adj[n] = []));
  graphData.edges.forEach(e => {
    adj[e.from].push({ to: e.to, weight: e.weight });
    if (!graphData.directed) adj[e.to].push({ to: e.from, weight: e.weight });
  });

  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const visited = new Set<string>();
  let comparisons = 0;

  nodes.forEach(n => { dist[n] = INF; prev[n] = null; });
  dist[startId] = 0;

  const nodeStates: Record<string, string> = {};
  const edgeStates: Record<string, string> = {};
  nodes.forEach(n => (nodeStates[n] = 'unvisited'));
  graphData.edges.forEach(e => {
    edgeStates[edgeKey(e.from, e.to)] = 'default';
    if (!graphData.directed) edgeStates[edgeKey(e.to, e.from)] = 'default';
  });
  nodeStates[startId] = 'start';
  if (endId) nodeStates[endId] = 'end';

  steps.push({
    nodeStates: { ...nodeStates } as GraphStep['nodeStates'],
    edgeStates: { ...edgeStates } as GraphStep['edgeStates'],
    distances: { ...dist },
    queue: [startId],
    stack: [],
    current: null,
    path: [],
    description: `初始化：dist[${startId}]=0，其余节点距离为 ∞`,
    codeLine: 1,
    visitedCount: 0,
    pathLength: 0,
    comparisons,
  });

  while (true) {
    // Find unvisited node with minimum distance
    let u: string | null = null;
    let minD = INF;
    nodes.forEach(n => {
      if (!visited.has(n) && dist[n] < minD) {
        minD = dist[n]; u = n;
      }
    });
    if (!u) break;

    visited.add(u);
    comparisons++;
    const oldState = nodeStates[u];
    if (u !== startId && u !== endId) nodeStates[u] = 'current';

    const unvisitedQ = nodes.filter(n => !visited.has(n) && dist[n] < INF);

    steps.push({
      nodeStates: { ...nodeStates } as GraphStep['nodeStates'],
      edgeStates: { ...edgeStates } as GraphStep['edgeStates'],
      distances: { ...dist },
      queue: unvisitedQ,
      stack: [],
      current: u,
      path: [],
      description: `选取距离最短的未访问节点 ${u}（距离=${dist[u] === INF ? '∞' : dist[u]}）`,
      codeLine: 2,
      visitedCount: visited.size,
      pathLength: dist[endId] ?? INF,
      comparisons,
    });

    for (const { to, weight } of adj[u]) {
      if (visited.has(to)) continue;
      const newDist = dist[u] + weight;
      comparisons++;
      edgeStates[edgeKey(u, to)] = 'exploring';
      if (!graphData.directed) edgeStates[edgeKey(to, u)] = 'exploring';

      steps.push({
        nodeStates: { ...nodeStates } as GraphStep['nodeStates'],
        edgeStates: { ...edgeStates } as GraphStep['edgeStates'],
        distances: { ...dist },
        queue: unvisitedQ,
        stack: [],
        current: u,
        path: [],
        description: `松弛边 ${u}→${to}：dist[${u}]+${weight}=${newDist} ${newDist < dist[to] ? '<' : '≥'} dist[${to}]=${dist[to] === INF ? '∞' : dist[to]}`,
        codeLine: 3,
        visitedCount: visited.size,
        pathLength: dist[endId] ?? INF,
        comparisons,
      });

      if (newDist < dist[to]) {
        dist[to] = newDist;
        prev[to] = u;
        edgeStates[edgeKey(u, to)] = 'relaxed';
        if (!graphData.directed) edgeStates[edgeKey(to, u)] = 'relaxed';
        steps.push({
          nodeStates: { ...nodeStates } as GraphStep['nodeStates'],
          edgeStates: { ...edgeStates } as GraphStep['edgeStates'],
          distances: { ...dist },
          queue: unvisitedQ,
          stack: [],
          current: u,
          path: [],
          description: `更新 dist[${to}] = ${newDist}（通过 ${u}）`,
          codeLine: 4,
          visitedCount: visited.size,
          pathLength: dist[endId] ?? INF,
          comparisons,
        });
      } else {
        edgeStates[edgeKey(u, to)] = 'rejected';
        if (!graphData.directed) edgeStates[edgeKey(to, u)] = 'rejected';
      }
    }

    if (u !== startId && u !== endId) nodeStates[u] = 'visited';
  }

  // Reconstruct path
  const path: string[] = [];
  let cur: string | null = endId;
  while (cur) { path.unshift(cur); cur = prev[cur] ?? null; }
  if (path[0] === startId) {
    path.forEach(n => { if (n !== startId && n !== endId) nodeStates[n] = 'path'; });
    for (let i = 0; i < path.length - 1; i++) {
      edgeStates[edgeKey(path[i], path[i + 1])] = 'path';
      if (!graphData.directed) edgeStates[edgeKey(path[i + 1], path[i])] = 'path';
    }
  }

  steps.push({
    nodeStates: { ...nodeStates } as GraphStep['nodeStates'],
    edgeStates: { ...edgeStates } as GraphStep['edgeStates'],
    distances: { ...dist },
    queue: [],
    stack: [],
    current: null,
    path,
    description: `✓ Dijkstra 完成！${startId}→${endId} 最短距离: ${dist[endId] === INF ? '不可达' : dist[endId]}`,
    codeLine: 5,
    visitedCount: visited.size,
    pathLength: dist[endId] ?? INF,
    comparisons,
  });

  return steps;
}

// ==================== BFS ====================
export function generateBFSSteps(
  graphData: GraphData,
  startId: string,
  endId: string
): GraphStep[] {
  const steps: GraphStep[] = [];
  const adj: Record<string, string[]> = {};
  graphData.nodes.forEach(n => (adj[n.id] = []));
  graphData.edges.forEach(e => {
    adj[e.from].push(e.to);
    if (!graphData.directed) adj[e.to].push(e.from);
  });

  const nodeStates: Record<string, string> = {};
  const edgeStates: Record<string, string> = {};
  graphData.nodes.forEach(n => (nodeStates[n.id] = 'unvisited'));
  graphData.edges.forEach(e => {
    edgeStates[edgeKey(e.from, e.to)] = 'default';
    if (!graphData.directed) edgeStates[edgeKey(e.to, e.from)] = 'default';
  });
  nodeStates[startId] = 'start';
  if (endId) nodeStates[endId] = 'end';

  const queue: string[] = [startId];
  const visited = new Set<string>([startId]);
  const prev: Record<string, string | null> = { [startId]: null };
  let comparisons = 0;
  let found = false;

  steps.push({
    nodeStates: { ...nodeStates } as GraphStep['nodeStates'],
    edgeStates: { ...edgeStates } as GraphStep['edgeStates'],
    distances: {},
    queue: [...queue],
    stack: [],
    current: null,
    path: [],
    description: `BFS 初始化：将起点 ${startId} 加入队列`,
    codeLine: 1,
    visitedCount: 1,
    pathLength: 0,
    comparisons,
  });

  while (queue.length > 0) {
    const u = queue.shift()!;
    comparisons++;

    if (u !== startId && u !== endId) nodeStates[u] = 'current';

    steps.push({
      nodeStates: { ...nodeStates } as GraphStep['nodeStates'],
      edgeStates: { ...edgeStates } as GraphStep['edgeStates'],
      distances: {},
      queue: [...queue],
      stack: [],
      current: u,
      path: [],
      description: `从队列出队节点 ${u}，开始处理其邻居`,
      codeLine: 2,
      visitedCount: visited.size,
      pathLength: 0,
      comparisons,
    });

    if (u === endId) {
      found = true;
      break;
    }

    for (const v of adj[u]) {
      if (!visited.has(v)) {
        visited.add(v);
        prev[v] = u;
        queue.push(v);
        edgeStates[edgeKey(u, v)] = 'tree';
        if (!graphData.directed) edgeStates[edgeKey(v, u)] = 'tree';
        if (v !== endId) nodeStates[v] = 'in-queue';
        comparisons++;

        steps.push({
          nodeStates: { ...nodeStates } as GraphStep['nodeStates'],
          edgeStates: { ...edgeStates } as GraphStep['edgeStates'],
          distances: {},
          queue: [...queue],
          stack: [],
          current: u,
          path: [],
          description: `发现新节点 ${v}，加入队列`,
          codeLine: 3,
          visitedCount: visited.size,
          pathLength: 0,
          comparisons,
        });
      }
    }

    if (u !== startId && u !== endId) nodeStates[u] = 'visited';
  }

  // Reconstruct path
  const path: string[] = [];
  if (found) {
    let cur: string | null = endId;
    while (cur !== null) { path.unshift(cur); cur = prev[cur] ?? null; }
    path.forEach(n => { if (n !== startId && n !== endId) nodeStates[n] = 'path'; });
    for (let i = 0; i < path.length - 1; i++) {
      edgeStates[edgeKey(path[i], path[i + 1])] = 'path';
      if (!graphData.directed) edgeStates[edgeKey(path[i + 1], path[i])] = 'path';
    }
  }

  steps.push({
    nodeStates: { ...nodeStates } as GraphStep['nodeStates'],
    edgeStates: { ...edgeStates } as GraphStep['edgeStates'],
    distances: {},
    queue: [],
    stack: [],
    current: null,
    path,
    description: found
      ? `✓ BFS 完成！找到路径，长度 ${path.length - 1}：${path.join(' → ')}`
      : `✗ BFS 完成！未找到从 ${startId} 到 ${endId} 的路径`,
    codeLine: 4,
    visitedCount: visited.size,
    pathLength: path.length - 1,
    comparisons,
  });

  return steps;
}

// ==================== DFS ====================
export function generateDFSSteps(
  graphData: GraphData,
  startId: string,
  endId: string
): GraphStep[] {
  const steps: GraphStep[] = [];
  const adj: Record<string, string[]> = {};
  graphData.nodes.forEach(n => (adj[n.id] = []));
  graphData.edges.forEach(e => {
    adj[e.from].push(e.to);
    if (!graphData.directed) adj[e.to].push(e.from);
  });

  const nodeStates: Record<string, string> = {};
  const edgeStates: Record<string, string> = {};
  graphData.nodes.forEach(n => (nodeStates[n.id] = 'unvisited'));
  graphData.edges.forEach(e => {
    edgeStates[edgeKey(e.from, e.to)] = 'default';
    if (!graphData.directed) edgeStates[edgeKey(e.to, e.from)] = 'default';
  });
  nodeStates[startId] = 'start';
  if (endId) nodeStates[endId] = 'end';

  const visited = new Set<string>();
  const prev: Record<string, string | null> = {};
  let comparisons = 0;
  let found = false;
  const stackTrace: string[] = [];

  function dfs(u: string): boolean {
    visited.add(u);
    stackTrace.push(u);
    if (u !== startId && u !== endId) nodeStates[u] = 'current';

    steps.push({
      nodeStates: { ...nodeStates } as GraphStep['nodeStates'],
      edgeStates: { ...edgeStates } as GraphStep['edgeStates'],
      distances: {},
      queue: [],
      stack: [...stackTrace],
      current: u,
      path: [],
      description: `DFS 访问节点 ${u}，当前栈深度 ${stackTrace.length}`,
      codeLine: 2,
      visitedCount: visited.size,
      pathLength: 0,
      comparisons,
    });

    if (u === endId) return true;

    for (const v of adj[u]) {
      comparisons++;
      if (!visited.has(v)) {
        prev[v] = u;
        edgeStates[edgeKey(u, v)] = 'tree';
        if (!graphData.directed) edgeStates[edgeKey(v, u)] = 'tree';
        if (dfs(v)) return true;
        edgeStates[edgeKey(u, v)] = 'rejected';
        if (!graphData.directed) edgeStates[edgeKey(v, u)] = 'rejected';
      } else {
        steps.push({
          nodeStates: { ...nodeStates } as GraphStep['nodeStates'],
          edgeStates: { ...edgeStates } as GraphStep['edgeStates'],
          distances: {},
          queue: [],
          stack: [...stackTrace],
          current: u,
          path: [],
          description: `节点 ${v} 已访问，跳过（回边/交叉边）`,
          codeLine: 3,
          visitedCount: visited.size,
          pathLength: 0,
          comparisons,
        });
      }
    }

    if (u !== startId && u !== endId) nodeStates[u] = 'visited';
    stackTrace.pop();
    return false;
  }

  prev[startId] = null;
  found = dfs(startId);

  const path: string[] = [];
  if (found) {
    let cur: string | null = endId;
    while (cur !== null) { path.unshift(cur); cur = prev[cur] ?? null; }
    path.forEach(n => { if (n !== startId && n !== endId) nodeStates[n] = 'path'; });
    for (let i = 0; i < path.length - 1; i++) {
      edgeStates[edgeKey(path[i], path[i + 1])] = 'path';
      if (!graphData.directed) edgeStates[edgeKey(path[i + 1], path[i])] = 'path';
    }
  }

  steps.push({
    nodeStates: { ...nodeStates } as GraphStep['nodeStates'],
    edgeStates: { ...edgeStates } as GraphStep['edgeStates'],
    distances: {},
    queue: [],
    stack: [],
    current: null,
    path,
    description: found
      ? `✓ DFS 完成！路径：${path.join(' → ')}`
      : `✗ DFS 完成！未找到从 ${startId} 到 ${endId} 的路径`,
    codeLine: 4,
    visitedCount: visited.size,
    pathLength: path.length - 1,
    comparisons,
  });

  return steps;
}

// ==================== PRIM ====================
export function generatePrimSteps(graphData: GraphData, startId: string): GraphStep[] {
  const steps: GraphStep[] = [];
  const nodes = graphData.nodes.map(n => n.id);
  const adj: Record<string, Array<{ to: string; weight: number }>> = {};
  nodes.forEach(n => (adj[n] = []));
  graphData.edges.forEach(e => {
    adj[e.from].push({ to: e.to, weight: e.weight });
    adj[e.to].push({ to: e.from, weight: e.weight });
  });

  const nodeStates: Record<string, string> = {};
  const edgeStates: Record<string, string> = {};
  nodes.forEach(n => (nodeStates[n] = 'unvisited'));
  graphData.edges.forEach(e => {
    edgeStates[edgeKey(e.from, e.to)] = 'default';
    edgeStates[edgeKey(e.to, e.from)] = 'default';
  });
  nodeStates[startId] = 'start';

  const inMST = new Set<string>();
  const mstEdges: GraphEdge[] = [];
  let mstCost = 0;
  let comparisons = 0;

  inMST.add(startId);

  steps.push({
    nodeStates: { ...nodeStates } as GraphStep['nodeStates'],
    edgeStates: { ...edgeStates } as GraphStep['edgeStates'],
    distances: {},
    queue: [startId],
    stack: [],
    current: startId,
    path: [],
    description: `Prim 算法：从节点 ${startId} 开始构建最小生成树`,
    codeLine: 1,
    visitedCount: 1,
    pathLength: mstCost,
    comparisons,
    mstEdges: [],
    mstCost: 0,
  });

  while (inMST.size < nodes.length) {
    let bestEdge: { from: string; to: string; weight: number } | null = null;
    let bestWeight = INF;

    for (const u of inMST) {
      for (const { to, weight } of adj[u]) {
        comparisons++;
        if (!inMST.has(to) && weight < bestWeight) {
          bestWeight = weight;
          bestEdge = { from: u, to, weight };
        }
      }
    }

    if (!bestEdge) break;

    inMST.add(bestEdge.to);
    mstEdges.push(bestEdge);
    mstCost += bestEdge.weight;

    edgeStates[edgeKey(bestEdge.from, bestEdge.to)] = 'mst';
    edgeStates[edgeKey(bestEdge.to, bestEdge.from)] = 'mst';
    nodeStates[bestEdge.to] = 'mst';

    steps.push({
      nodeStates: { ...nodeStates } as GraphStep['nodeStates'],
      edgeStates: { ...edgeStates } as GraphStep['edgeStates'],
      distances: {},
      queue: nodes.filter(n => !inMST.has(n)),
      stack: [],
      current: bestEdge.to,
      path: [],
      description: `选择最小权重边 ${bestEdge.from}→${bestEdge.to}（权重=${bestEdge.weight}），MST总代价=${mstCost}`,
      codeLine: 2,
      visitedCount: inMST.size,
      pathLength: mstCost,
      comparisons,
      mstEdges: [...mstEdges],
      mstCost,
    });
  }

  steps.push({
    nodeStates: { ...nodeStates } as GraphStep['nodeStates'],
    edgeStates: { ...edgeStates } as GraphStep['edgeStates'],
    distances: {},
    queue: [],
    stack: [],
    current: null,
    path: [],
    description: `✓ Prim 算法完成！最小生成树代价 = ${mstCost}`,
    codeLine: 3,
    visitedCount: inMST.size,
    pathLength: mstCost,
    comparisons,
    mstEdges,
    mstCost,
  });

  return steps;
}

// ==================== KRUSKAL ====================
export function generateKruskalSteps(graphData: GraphData): GraphStep[] {
  const steps: GraphStep[] = [];
  const nodes = graphData.nodes.map(n => n.id);

  const nodeStates: Record<string, string> = {};
  const edgeStates: Record<string, string> = {};
  nodes.forEach(n => (nodeStates[n] = 'unvisited'));
  graphData.edges.forEach(e => {
    edgeStates[edgeKey(e.from, e.to)] = 'default';
    edgeStates[edgeKey(e.to, e.from)] = 'default';
  });

  // Union-Find
  const parent: Record<string, string> = {};
  const rank: Record<string, number> = {};
  nodes.forEach(n => { parent[n] = n; rank[n] = 0; });

  function find(x: string): string {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }

  function union(x: string, y: string): boolean {
    const px = find(x), py = find(y);
    if (px === py) return false;
    if (rank[px] < rank[py]) parent[px] = py;
    else if (rank[px] > rank[py]) parent[py] = px;
    else { parent[py] = px; rank[px]++; }
    return true;
  }

  const sortedEdges = [...graphData.edges].sort((a, b) => a.weight - b.weight);
  const mstEdges: GraphEdge[] = [];
  let mstCost = 0;
  let comparisons = 0;

  steps.push({
    nodeStates: { ...nodeStates } as GraphStep['nodeStates'],
    edgeStates: { ...edgeStates } as GraphStep['edgeStates'],
    distances: {},
    queue: sortedEdges.map(e => `${e.from}-${e.to}`),
    stack: [],
    current: null,
    path: [],
    description: `Kruskal 算法：将所有边按权重排序，依次选择最小边（不形成环）`,
    codeLine: 1,
    visitedCount: 0,
    pathLength: mstCost,
    comparisons,
    mstEdges: [],
    mstCost: 0,
  });

  for (const edge of sortedEdges) {
    comparisons++;
    edgeStates[edgeKey(edge.from, edge.to)] = 'exploring';
    edgeStates[edgeKey(edge.to, edge.from)] = 'exploring';

    steps.push({
      nodeStates: { ...nodeStates } as GraphStep['nodeStates'],
      edgeStates: { ...edgeStates } as GraphStep['edgeStates'],
      distances: {},
      queue: [],
      stack: [],
      current: edge.from,
      path: [],
      description: `考虑边 ${edge.from}→${edge.to}（权重=${edge.weight}）：${find(edge.from) === find(edge.to) ? '会形成环' : '安全添加'}`,
      codeLine: 2,
      visitedCount: mstEdges.length,
      pathLength: mstCost,
      comparisons,
      mstEdges: [...mstEdges],
      mstCost,
    });

    if (union(edge.from, edge.to)) {
      mstEdges.push(edge);
      mstCost += edge.weight;
      edgeStates[edgeKey(edge.from, edge.to)] = 'mst';
      edgeStates[edgeKey(edge.to, edge.from)] = 'mst';
      nodeStates[edge.from] = 'mst';
      nodeStates[edge.to] = 'mst';

      steps.push({
        nodeStates: { ...nodeStates } as GraphStep['nodeStates'],
        edgeStates: { ...edgeStates } as GraphStep['edgeStates'],
        distances: {},
        queue: [],
        stack: [],
        current: null,
        path: [],
        description: `✓ 添加边 ${edge.from}→${edge.to}（权重=${edge.weight}），MST代价=${mstCost}`,
        codeLine: 3,
        visitedCount: mstEdges.length,
        pathLength: mstCost,
        comparisons,
        mstEdges: [...mstEdges],
        mstCost,
      });

      if (mstEdges.length === nodes.length - 1) break;
    } else {
      edgeStates[edgeKey(edge.from, edge.to)] = 'rejected';
      edgeStates[edgeKey(edge.to, edge.from)] = 'rejected';
      steps.push({
        nodeStates: { ...nodeStates } as GraphStep['nodeStates'],
        edgeStates: { ...edgeStates } as GraphStep['edgeStates'],
        distances: {},
        queue: [],
        stack: [],
        current: null,
        path: [],
        description: `✗ 跳过边 ${edge.from}→${edge.to}：会形成环（Union-Find 检测）`,
        codeLine: 4,
        visitedCount: mstEdges.length,
        pathLength: mstCost,
        comparisons,
        mstEdges: [...mstEdges],
        mstCost,
      });
    }
  }

  steps.push({
    nodeStates: { ...nodeStates } as GraphStep['nodeStates'],
    edgeStates: { ...edgeStates } as GraphStep['edgeStates'],
    distances: {},
    queue: [],
    stack: [],
    current: null,
    path: [],
    description: `✓ Kruskal 算法完成！最小生成树代价 = ${mstCost}`,
    codeLine: 5,
    visitedCount: mstEdges.length,
    pathLength: mstCost,
    comparisons,
    mstEdges,
    mstCost,
  });

  return steps;
}

// ==================== A* ====================
export function generateAStarSteps(
  graphData: GraphData,
  startId: string,
  endId: string
): GraphStep[] {
  const steps: GraphStep[] = [];
  const adj: Record<string, Array<{ to: string; weight: number }>> = {};
  graphData.nodes.forEach(n => (adj[n.id] = []));
  graphData.edges.forEach(e => {
    adj[e.from].push({ to: e.to, weight: e.weight });
    if (!graphData.directed) adj[e.to].push({ to: e.from, weight: e.weight });
  });

  const nodePos: Record<string, { x: number; y: number }> = {};
  graphData.nodes.forEach(n => (nodePos[n.id] = { x: n.x, y: n.y }));

  function heuristic(a: string, b: string): number {
    const pa = nodePos[a], pb = nodePos[b];
    return Math.sqrt((pa.x - pb.x) ** 2 + (pa.y - pb.y) ** 2) / 100;
  }

  const nodeStates: Record<string, string> = {};
  const edgeStates: Record<string, string> = {};
  graphData.nodes.forEach(n => (nodeStates[n.id] = 'unvisited'));
  graphData.edges.forEach(e => {
    edgeStates[edgeKey(e.from, e.to)] = 'default';
    if (!graphData.directed) edgeStates[edgeKey(e.to, e.from)] = 'default';
  });
  nodeStates[startId] = 'start';
  if (endId) nodeStates[endId] = 'end';

  const openSet = new Set<string>([startId]);
  const closedSet = new Set<string>();
  const prev: Record<string, string | null> = { [startId]: null };
  const gScore: Record<string, number> = { [startId]: 0 };
  const fScore: Record<string, number> = { [startId]: heuristic(startId, endId) };
  const hScore: Record<string, number> = { [startId]: heuristic(startId, endId) };

  graphData.nodes.forEach(n => {
    if (n.id !== startId) {
      gScore[n.id] = INF;
      fScore[n.id] = INF;
      hScore[n.id] = heuristic(n.id, endId);
    }
  });

  let comparisons = 0;
  let found = false;

  steps.push({
    nodeStates: { ...nodeStates } as GraphStep['nodeStates'],
    edgeStates: { ...edgeStates } as GraphStep['edgeStates'],
    distances: { ...gScore },
    queue: [...openSet],
    stack: [],
    current: null,
    path: [],
    description: `A* 初始化：g[${startId}]=0, h[${startId}]=${heuristic(startId, endId).toFixed(2)}, f[${startId}]=${fScore[startId].toFixed(2)}`,
    codeLine: 1,
    visitedCount: 0,
    pathLength: 0,
    comparisons,
    gScores: { ...gScore },
    fScores: { ...fScore },
    hScores: { ...hScore },
  });

  while (openSet.size > 0) {
    let current: string | null = null;
    let lowestF = INF;
    for (const n of openSet) {
      if (fScore[n] < lowestF) { lowestF = fScore[n]; current = n; }
    }
    if (!current) break;

    openSet.delete(current);
    closedSet.add(current);
    comparisons++;

    if (current !== startId && current !== endId) nodeStates[current] = 'visiting';

    steps.push({
      nodeStates: { ...nodeStates } as GraphStep['nodeStates'],
      edgeStates: { ...edgeStates } as GraphStep['edgeStates'],
      distances: { ...gScore },
      queue: [...openSet],
      stack: [...closedSet],
      current,
      path: [],
      description: `从 Open 集选择 f 最小节点 ${current}（g=${gScore[current].toFixed(2)}, h=${hScore[current].toFixed(2)}, f=${fScore[current].toFixed(2)}）`,
      codeLine: 2,
      visitedCount: closedSet.size,
      pathLength: gScore[endId] ?? INF,
      comparisons,
      gScores: { ...gScore },
      fScores: { ...fScore },
      hScores: { ...hScore },
    });

    if (current === endId) { found = true; break; }

    for (const { to: neighbor, weight } of adj[current]) {
      if (closedSet.has(neighbor)) continue;
      comparisons++;
      const tentativeG = gScore[current] + weight;

      edgeStates[edgeKey(current, neighbor)] = 'exploring';
      if (!graphData.directed) edgeStates[edgeKey(neighbor, current)] = 'exploring';

      if (tentativeG < (gScore[neighbor] ?? INF)) {
        prev[neighbor] = current;
        gScore[neighbor] = tentativeG;
        fScore[neighbor] = tentativeG + heuristic(neighbor, endId);
        openSet.add(neighbor);
        if (neighbor !== endId) nodeStates[neighbor] = 'in-queue';
        edgeStates[edgeKey(current, neighbor)] = 'relaxed';
        if (!graphData.directed) edgeStates[edgeKey(neighbor, current)] = 'relaxed';

        steps.push({
          nodeStates: { ...nodeStates } as GraphStep['nodeStates'],
          edgeStates: { ...edgeStates } as GraphStep['edgeStates'],
          distances: { ...gScore },
          queue: [...openSet],
          stack: [...closedSet],
          current,
          path: [],
          description: `更新邻居 ${neighbor}：g=${tentativeG.toFixed(2)}, h=${heuristic(neighbor, endId).toFixed(2)}, f=${fScore[neighbor].toFixed(2)}`,
          codeLine: 3,
          visitedCount: closedSet.size,
          pathLength: gScore[endId] ?? INF,
          comparisons,
          gScores: { ...gScore },
          fScores: { ...fScore },
          hScores: { ...hScore },
        });
      }
    }

    if (current !== startId && current !== endId) nodeStates[current] = 'visited';
  }

  const path: string[] = [];
  if (found) {
    let cur: string | null = endId;
    while (cur !== null) { path.unshift(cur); cur = prev[cur] ?? null; }
    path.forEach(n => { if (n !== startId && n !== endId) nodeStates[n] = 'path'; });
    for (let i = 0; i < path.length - 1; i++) {
      edgeStates[edgeKey(path[i], path[i + 1])] = 'path';
      if (!graphData.directed) edgeStates[edgeKey(path[i + 1], path[i])] = 'path';
    }
  }

  steps.push({
    nodeStates: { ...nodeStates } as GraphStep['nodeStates'],
    edgeStates: { ...edgeStates } as GraphStep['edgeStates'],
    distances: { ...gScore },
    queue: [],
    stack: [],
    current: null,
    path,
    description: found
      ? `✓ A* 完成！最短路径长度 = ${gScore[endId].toFixed(2)}`
      : `✗ A* 完成！未找到路径`,
    codeLine: 4,
    visitedCount: closedSet.size,
    pathLength: gScore[endId] ?? INF,
    comparisons,
    gScores: { ...gScore },
    fScores: { ...fScore },
    hScores: { ...hScore },
  });

  return steps;
}
