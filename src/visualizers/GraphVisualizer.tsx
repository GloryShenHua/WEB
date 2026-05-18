import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useAlgorithmStore } from '../store';
import type { GraphData, GraphNode, GraphEdge, GraphStep } from '../types';

const NODE_RADIUS = 22;

const NODE_COLORS: Record<string, string> = {
  unvisited: '#475569',
  'in-queue': '#f59e0b',
  visiting: '#06b6d4',
  visited: '#64748b',
  current: '#3b82f6',
  path: '#a855f7',
  start: '#22c55e',
  end: '#ef4444',
  mst: '#22c55e',
};

const EDGE_COLORS: Record<string, string> = {
  default: '#334155',
  exploring: '#f59e0b',
  tree: '#3b82f6',
  path: '#a855f7',
  rejected: '#374151',
  mst: '#22c55e',
  relaxed: '#06b6d4',
};

interface GraphConfigProps {
  onClose: () => void;
}

const GraphConfig: React.FC<GraphConfigProps> = ({ onClose }) => {
  const { graphData, graphStart, graphEnd, setGraphData, setGraphStart, setGraphEnd, runAlgorithm, selectedAlgorithm } = useAlgorithmStore();

  const generateRandom = (n: number, directed: boolean) => {
    const nodes: GraphNode[] = Array.from({ length: n }, (_, i) => ({
      id: String.fromCharCode(65 + i),
      label: String.fromCharCode(65 + i),
      x: 150 + Math.cos((i * 2 * Math.PI) / n) * 160,
      y: 170 + Math.sin((i * 2 * Math.PI) / n) * 140,
    }));

    const edgeSet = new Set<string>();
    const edges: GraphEdge[] = [];

    // Ensure connected
    for (let i = 1; i < n; i++) {
      const from = nodes[Math.floor(Math.random() * i)].id;
      const to = nodes[i].id;
      const key = `${from}-${to}`;
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edges.push({ from, to, weight: Math.floor(Math.random() * 9) + 1, directed });
      }
    }

    // Add extra edges
    const extra = Math.floor(n * 0.8);
    for (let i = 0; i < extra; i++) {
      const a = nodes[Math.floor(Math.random() * n)].id;
      const b = nodes[Math.floor(Math.random() * n)].id;
      if (a !== b) {
        const key = `${a}-${b}`;
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          edges.push({ from: a, to: b, weight: Math.floor(Math.random() * 9) + 1, directed });
        }
      }
    }

    setGraphData({ nodes, edges, directed, weighted: true });
    setGraphStart(nodes[0].id);
    setGraphEnd(nodes[n - 1].id);
    runAlgorithm();
    onClose();
  };

  const isMST = selectedAlgorithm === 'prim' || selectedAlgorithm === 'kruskal';
  const nodes = graphData.nodes.map(n => n.id);

  return (
    <div className="absolute top-2 left-2 z-10 bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-2xl w-72">
      <h3 className="font-semibold text-white mb-3">图配置</h3>
      <div className="space-y-2 mb-3">
        {!isMST && (
          <>
            <div>
              <label className="text-xs text-slate-400">起点</label>
              <select value={graphStart} onChange={e => setGraphStart(e.target.value)} className="w-full mt-1 bg-slate-800 border border-slate-600 rounded p-1.5 text-white text-sm">
                {nodes.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400">终点</label>
              <select value={graphEnd} onChange={e => setGraphEnd(e.target.value)} className="w-full mt-1 bg-slate-800 border border-slate-600 rounded p-1.5 text-white text-sm">
                {nodes.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <button onClick={() => generateRandom(6, false)} className="bg-slate-700 hover:bg-slate-600 text-white text-xs py-2 rounded-lg">随机图 (6)</button>
        <button onClick={() => generateRandom(8, false)} className="bg-slate-700 hover:bg-slate-600 text-white text-xs py-2 rounded-lg">随机图 (8)</button>
      </div>
      <div className="flex gap-2">
        <button onClick={() => { runAlgorithm(); onClose(); }} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-1.5 rounded-lg">运行</button>
        <button onClick={onClose} className="bg-slate-800 text-slate-400 text-sm py-1.5 px-3 rounded-lg">✕</button>
      </div>
    </div>
  );
};

type DrawMode = 'none' | 'add-node' | 'add-edge' | 'delete';

const MODE_HELP: Record<DrawMode, string> = {
  none: '拖拽移动节点 | 右键设置起点 | Shift+右键设置终点',
  'add-node': '点击空白处添加节点',
  'add-edge': '点击起始节点 → 再点击目标节点添加边 | 右键或点击空白取消',
  delete: '点击节点删除节点及其连边 | 点击边中间删除单条边',
};

export const GraphVisualizer: React.FC = () => {
  const {
    graphData, setGraphData,
    graphStart, graphEnd, setGraphStart, setGraphEnd,
    steps, currentStep, selectedAlgorithm, runAlgorithm,
  } = useAlgorithmStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const [drawMode, setDrawMode] = useState<DrawMode>('none');
  const [edgeStart, setEdgeStart] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [newEdgeWeight, setNewEdgeWeight] = useState(1);
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 420 });
  const [flashMsg, setFlashMsg] = useState<string | null>(null);

  const step = steps[currentStep] as GraphStep | undefined;
  const isMST = selectedAlgorithm === 'prim' || selectedAlgorithm === 'kruskal';

  // Resize canvas to match container element
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (width > 10 && height > 10) {
        setCanvasSize({ w: Math.floor(width), h: Math.floor(height) });
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Escape key to exit edge-drawing / cancel mode
  useEffect(() => {
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') { setEdgeStart(null); setDrawMode('none'); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Convert CSS mouse coords → canvas pixel coords (handles CSS vs attribute size mismatch)
  const getCanvasPos = useCallback((ev: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (ev.clientX - rect.left) * (canvas.width / rect.width),
      y: (ev.clientY - rect.top) * (canvas.height / rect.height),
    };
  }, []);

  const getNodeAt = useCallback((x: number, y: number): GraphNode | null => {
    return graphData.nodes.find(n => {
      const dx = n.x - x, dy = n.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= NODE_RADIUS;
    }) ?? null;
  }, [graphData.nodes]);

  // Point-to-line-segment distance for edge click detection
  const getEdgeAt = useCallback((px: number, py: number): GraphEdge | null => {
    for (const edge of graphData.edges) {
      const from = graphData.nodes.find(n => n.id === edge.from);
      const to = graphData.nodes.find(n => n.id === edge.to);
      if (!from || !to) continue;
      const dx = to.x - from.x, dy = to.y - from.y;
      const len2 = dx * dx + dy * dy;
      if (len2 === 0) continue;
      const t = Math.max(0, Math.min(1, ((px - from.x) * dx + (py - from.y) * dy) / len2));
      const cx = from.x + t * dx, cy = from.y + t * dy;
      if (Math.sqrt((px - cx) ** 2 + (py - cy) ** 2) <= 10) return edge;
    }
    return null;
  }, [graphData]);

  // Generate a unique node ID not conflicting with existing nodes
  const generateNodeId = useCallback(() => {
    const existing = new Set(graphData.nodes.map(n => n.id));
    for (let i = 0; i < 26; i++) {
      const id = String.fromCharCode(65 + i);
      if (!existing.has(id)) return id;
    }
    let n = graphData.nodes.length + 1;
    while (existing.has(String(n))) n++;
    return String(n);
  }, [graphData.nodes]);

  const showFlash = (msg: string) => {
    setFlashMsg(msg);
    setTimeout(() => setFlashMsg(null), 1800);
  };

  const switchMode = (mode: DrawMode) => {
    setDrawMode(mode);
    setEdgeStart(null);
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const nodeStates = step?.nodeStates ?? {};
    const edgeStates = step?.edgeStates ?? {};

    // Draw edges
    graphData.edges.forEach(edge => {
      const from = graphData.nodes.find(n => n.id === edge.from);
      const to = graphData.nodes.find(n => n.id === edge.to);
      if (!from || !to) return;

      const key = `${edge.from}-${edge.to}`;
      const state = edgeStates[key] ?? 'default';
      const color = EDGE_COLORS[state] ?? EDGE_COLORS.default;
      const lineWidth = state !== 'default' && state !== 'rejected' ? 3 : 1.5;

      const dx = to.x - from.x, dy = to.y - from.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist === 0) return;
      const ux = dx / dist, uy = dy / dist;

      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      if (state === 'mst' || state === 'path') { ctx.shadowColor = color; ctx.shadowBlur = 8; }

      ctx.beginPath();
      ctx.moveTo(from.x + ux * NODE_RADIUS, from.y + uy * NODE_RADIUS);
      ctx.lineTo(to.x - ux * NODE_RADIUS, to.y - uy * NODE_RADIUS);
      ctx.stroke();

      // Arrow for directed
      if (graphData.directed) {
        const ax = to.x - ux * NODE_RADIUS, ay = to.y - uy * NODE_RADIUS;
        const angle = Math.atan2(dy, dx);
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax - 12 * Math.cos(angle - 0.4), ay - 12 * Math.sin(angle - 0.4));
        ctx.lineTo(ax - 12 * Math.cos(angle + 0.4), ay - 12 * Math.sin(angle + 0.4));
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
      }

      // Weight label with background bubble
      if (graphData.weighted) {
        const wx = (from.x + to.x) / 2 - uy * 13;
        const wy = (from.y + to.y) / 2 + ux * 13;
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(wx, wy, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = state !== 'default' ? '#fff' : '#94a3b8';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(edge.weight), wx, wy);
      }
      ctx.restore();
    });

    // Draw nodes
    graphData.nodes.forEach(node => {
      const state = nodeStates[node.id] ?? 'unvisited';
      const color = NODE_COLORS[state] ?? NODE_COLORS.unvisited;
      const isActive = node.id === step?.current;

      ctx.save();
      if (isActive || state === 'path' || state === 'start' || state === 'end') {
        ctx.shadowColor = color; ctx.shadowBlur = 16;
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = isActive ? '#fff' : '#1e293b';
      ctx.lineWidth = isActive ? 3 : 1.5;
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x, node.y);

      // Distance label (Dijkstra / A*)
      const d = step?.distances?.[node.id];
      if (d !== undefined && d !== Infinity) {
        ctx.font = '10px monospace';
        ctx.fillStyle = '#f59e0b';
        ctx.fillText(typeof d === 'number' ? d.toFixed(1) : String(d), node.x, node.y + NODE_RADIUS + 13);
      }
      ctx.restore();
    });

    // Edge-drawing preview: dashed ring on selected source + line to cursor
    if (drawMode === 'add-edge' && edgeStart) {
      const src = graphData.nodes.find(n => n.id === edgeStart);
      if (src) {
        ctx.save();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.arc(src.x, src.y, NODE_RADIUS + 7, 0, Math.PI * 2);
        ctx.stroke();
        if (mousePos) {
          ctx.strokeStyle = '#f59e0b88';
          ctx.beginPath();
          ctx.moveTo(src.x, src.y);
          ctx.lineTo(mousePos.x, mousePos.y);
          ctx.stroke();
        }
        ctx.restore();
      }
    }
  }, [graphData, step, edgeStart, drawMode, mousePos]);

  useEffect(() => { draw(); }, [draw]);

  // ---- Event handlers ----

  const handleCanvasMouseDown = (ev: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasPos(ev);
    const node = getNodeAt(x, y);

    if (drawMode === 'add-node') {
      if (!node) {
        const id = generateNodeId();
        setGraphData({ ...graphData, nodes: [...graphData.nodes, { id, label: id, x, y }] });
      }
      return;
    }

    if (drawMode === 'add-edge') {
      if (!node) {
        // Tapped empty space — cancel
        setEdgeStart(null);
        return;
      }
      if (!edgeStart) {
        setEdgeStart(node.id);
      } else if (edgeStart === node.id) {
        // Same node — cancel
        setEdgeStart(null);
      } else {
        // Check for duplicate edge
        const dup = graphData.edges.some(ed =>
          (ed.from === edgeStart && ed.to === node.id) ||
          (!graphData.directed && ed.from === node.id && ed.to === edgeStart)
        );
        if (dup) {
          showFlash('该边已存在！');
        } else {
          setGraphData({ ...graphData, edges: [...graphData.edges, { from: edgeStart, to: node.id, weight: newEdgeWeight }] });
        }
        setEdgeStart(null);
      }
      return;
    }

    if (drawMode === 'delete') {
      if (node) {
        const remainingNodes = graphData.nodes.filter(n => n.id !== node.id);
        // Fix dangling start/end references
        if (node.id === graphStart && remainingNodes.length > 0) setGraphStart(remainingNodes[0].id);
        if (node.id === graphEnd && remainingNodes.length > 0) setGraphEnd(remainingNodes[remainingNodes.length - 1].id);
        setGraphData({
          ...graphData,
          nodes: remainingNodes,
          edges: graphData.edges.filter(ed => ed.from !== node.id && ed.to !== node.id),
        });
      } else {
        const edge = getEdgeAt(x, y);
        if (edge) {
          setGraphData({ ...graphData, edges: graphData.edges.filter(ed => ed !== edge) });
        }
      }
      return;
    }

    // 'none' mode — drag
    if (node) setDragging(node.id);
  };

  const handleCanvasMouseMove = (ev: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasPos(ev);
    setMousePos({ x, y });
    if (dragging && drawMode === 'none') {
      setGraphData({ ...graphData, nodes: graphData.nodes.map(n => n.id === dragging ? { ...n, x, y } : n) });
    }
  };

  const handleCanvasMouseUp = () => setDragging(null);
  const handleMouseLeave = () => { setDragging(null); setMousePos(null); };

  const handleRightClick = (ev: React.MouseEvent<HTMLCanvasElement>) => {
    ev.preventDefault();
    if (drawMode === 'add-edge') { setEdgeStart(null); return; }
    if (drawMode !== 'none') return;
    const { x, y } = getCanvasPos(ev);
    const node = getNodeAt(x, y);
    if (!node) return;
    if (ev.shiftKey) {
      setGraphEnd(node.id);
    } else {
      setGraphStart(node.id);
      runAlgorithm();
    }
  };

  const cursorStyle = drawMode === 'add-node'
    ? 'crosshair'
    : drawMode === 'delete'
      ? 'not-allowed'
      : dragging
        ? 'grabbing'
        : drawMode === 'none'
          ? 'grab'
          : 'default';

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {showConfig && <GraphConfig onClose={() => setShowConfig(false)} />}

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800 text-xs flex-wrap">
        <button onClick={() => switchMode('none')} className={`px-3 py-1 rounded-lg transition-colors ${drawMode === 'none' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
          ✋ 拖拽
        </button>
        <button onClick={() => switchMode('add-node')} className={`px-3 py-1 rounded-lg transition-colors ${drawMode === 'add-node' ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
          ＋ 节点
        </button>
        <button onClick={() => switchMode('add-edge')} className={`px-3 py-1 rounded-lg transition-colors ${drawMode === 'add-edge' ? 'bg-yellow-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
          ↔ 连边
        </button>
        <button onClick={() => switchMode('delete')} className={`px-3 py-1 rounded-lg transition-colors ${drawMode === 'delete' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
          ✕ 删除
        </button>
        {drawMode === 'add-edge' && (
          <div className="flex items-center gap-1 ml-1">
            <span className="text-slate-500">权重:</span>
            <input
              type="number" min={1} max={99} value={newEdgeWeight}
              onChange={ev => setNewEdgeWeight(Math.max(1, Math.min(99, Number(ev.target.value))))}
              className="w-12 bg-slate-800 border border-slate-700 rounded text-white text-center text-xs p-1"
            />
          </div>
        )}
        <div className="ml-auto flex gap-3 items-center">
          {Object.entries({
            '起点': NODE_COLORS.start,
            '终点': NODE_COLORS.end,
            '当前': NODE_COLORS.current,
            '队列中': NODE_COLORS['in-queue'],
            '已访问': NODE_COLORS.visited,
            [isMST ? 'MST' : '路径']: NODE_COLORS.path,
          }).map(([label, color]) => (
            <div key={label} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ background: color }} />
              <span className="text-slate-500">{label}</span>
            </div>
          ))}
          <button onClick={() => setShowConfig(!showConfig)} className="text-blue-400 bg-slate-800 px-3 py-1 rounded-lg">⚙ 配置</button>
        </div>
      </div>

      {/* Context-sensitive help bar */}
      <div className="bg-slate-900/60 text-slate-500 text-xs px-4 py-1 flex items-center gap-4 min-h-[24px]">
        <span>{MODE_HELP[drawMode]}</span>
        {!isMST && drawMode === 'none' && (
          <span>起点: <strong className="text-green-400">{graphStart}</strong>　终点: <strong className="text-red-400">{graphEnd}</strong></span>
        )}
        {drawMode === 'add-edge' && edgeStart && (
          <span className="text-yellow-400">已选 <strong>{edgeStart}</strong>，点击目标节点完成连边</span>
        )}
        {flashMsg && <span className="text-red-400 font-semibold">{flashMsg}</span>}
      </div>

      {/* Canvas container — fills remaining space */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          width={canvasSize.w}
          height={canvasSize.h}
          className="absolute inset-0"
          style={{ background: '#0f172a', cursor: cursorStyle }}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleMouseLeave}
          onContextMenu={handleRightClick}
        />

        {step?.mstCost !== undefined && (
          <div className="absolute bottom-4 right-4 bg-slate-800 rounded-lg px-4 py-2 text-sm pointer-events-none">
            <span className="text-slate-400">MST 总代价: </span>
            <span className="text-green-400 font-bold">{step.mstCost}</span>
          </div>
        )}

        {step?.gScores && step.current && (
          <div className="absolute bottom-4 left-4 bg-slate-800 rounded-lg px-4 py-2 text-xs font-mono pointer-events-none">
            <div className="text-slate-400 mb-1">当前节点 {step.current}:</div>
            <div>g = {step.gScores[step.current]?.toFixed(2) ?? '∞'}</div>
            <div>h = {step.hScores?.[step.current]?.toFixed(2) ?? '∞'}</div>
            <div>f = {step.fScores?.[step.current]?.toFixed(2) ?? '∞'}</div>
          </div>
        )}
      </div>
    </div>
  );
};
