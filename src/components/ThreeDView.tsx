import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

interface ThreeDViewProps {
  type?: 'tree' | 'graph' | 'array';
}

export const ThreeDView: React.FC<ThreeDViewProps> = ({ type = 'tree' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number>(0);
  const [mode, setMode] = useState<'tree' | 'bst' | 'heap' | 'graph3d'>('tree');

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    scene.fog = new THREE.Fog(0x0f172a, 20, 60);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.set(0, 6, 14);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambient = new THREE.AmbientLight(0x94a3b8, 0.5);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);
    const pointLight = new THREE.PointLight(0x3b82f6, 1.5, 20);
    pointLight.position.set(-3, 5, 3);
    scene.add(pointLight);

    // Build the 3D structure
    buildStructure(scene, mode);

    // Grid
    const grid = new THREE.GridHelper(20, 20, 0x1e293b, 0x1e293b);
    grid.position.y = -3;
    scene.add(grid);

    // Animate
    let angle = 0;
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      angle += 0.005;
      camera.position.x = Math.sin(angle) * 14;
      camera.position.z = Math.cos(angle) * 14;
      camera.lookAt(0, 1, 0);
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [mode]);

  return (
    <div className="flex-1 flex flex-col">
      {/* Mode selector */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700">
        <span className="text-slate-400 text-sm">3D 可视化模式:</span>
        {[
          { id: 'tree', label: '二叉树' },
          { id: 'bst', label: 'BST' },
          { id: 'heap', label: '堆' },
          { id: 'graph3d', label: '3D 图' },
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id as any)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              mode === m.id ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {m.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-600">自动旋转 | 使用 WebGL/Three.js 渲染</span>
      </div>

      {/* 3D viewport */}
      <div ref={containerRef} className="flex-1 relative" style={{ minHeight: 400 }}>
        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur rounded-lg px-3 py-2 text-xs text-slate-400 z-10">
          <div className="font-semibold text-white mb-1">
            {mode === 'tree' ? '完全二叉树' : mode === 'bst' ? '二叉搜索树' : mode === 'heap' ? '最大堆' : '3D 图结构'}
          </div>
          <div>节点数: {getNodeCount(mode)}</div>
          <div>高度: {getHeight(mode)}</div>
        </div>
      </div>
    </div>
  );
};

function getNodeCount(mode: string) {
  const counts: Record<string, number> = { tree: 15, bst: 11, heap: 15, graph3d: 8 };
  return counts[mode] ?? 0;
}

function getHeight(mode: string) {
  const heights: Record<string, number> = { tree: 4, bst: 4, heap: 4, graph3d: '-' as any };
  return heights[mode] ?? 0;
}

function buildStructure(scene: THREE.Scene, mode: string) {
  // Clear existing objects (except lights and grid)
  const toRemove = scene.children.filter(c => c.userData.isViz);
  toRemove.forEach(c => scene.remove(c));

  const colors = {
    node: 0x3b82f6,
    nodeActive: 0x22c55e,
    edge: 0x475569,
    highlight: 0xf59e0b,
    text: 0xffffff,
  };

  if (mode === 'tree' || mode === 'bst' || mode === 'heap') {
    // Build a binary tree
    const values = mode === 'bst'
      ? [50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45]
      : mode === 'heap'
      ? [100, 85, 90, 70, 80, 75, 88, 55, 60, 65, 70, 50, 72, 80, 82]
      : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

    const positions: THREE.Vector3[] = [];
    const nodeObjects: THREE.Mesh[] = [];

    function addNode(i: number, x: number, y: number, z: number) {
      if (i >= values.length) return;

      const pos = new THREE.Vector3(x, y, z);
      positions.push(pos);

      // Node sphere
      const geo = new THREE.SphereGeometry(0.45, 16, 16);
      const isHighlight = i === 0; // root is highlighted
      const mat = new THREE.MeshPhongMaterial({
        color: isHighlight ? colors.nodeActive : colors.node,
        shininess: 80,
        emissive: isHighlight ? 0x22c55e : 0x1e3a5f,
        emissiveIntensity: 0.3,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.userData.isViz = true;
      scene.add(mesh);
      nodeObjects.push(mesh);

      // Value ring
      const ringGeo = new THREE.TorusGeometry(0.5, 0.05, 8, 16);
      const ringMat = new THREE.MeshPhongMaterial({ color: isHighlight ? 0x22c55e : 0x1d3f7a });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(x, y, z);
      ring.userData.isViz = true;
      scene.add(ring);

      // Draw edges to children
      const leftIdx = 2 * i + 1;
      const rightIdx = 2 * i + 2;
      const spread = Math.pow(0.55, Math.floor(Math.log2(i + 1)));

      if (leftIdx < values.length) {
        const lx = x - 2.5 * spread;
        const ly = y - 1.8;
        addNode(leftIdx, lx, ly, z);
        drawEdge(scene, new THREE.Vector3(x, y, z), new THREE.Vector3(lx, ly, z), colors.edge);
      }
      if (rightIdx < values.length) {
        const rx = x + 2.5 * spread;
        const ry = y - 1.8;
        addNode(rightIdx, rx, ry, z);
        drawEdge(scene, new THREE.Vector3(x, y, z), new THREE.Vector3(rx, ry, z), colors.edge);
      }
    }

    addNode(0, 0, 3, 0);

  } else if (mode === 'graph3d') {
    // 3D graph
    const nodes3d = [
      { pos: new THREE.Vector3(-3, 2, 0), color: 0x22c55e },
      { pos: new THREE.Vector3(0, 3, 2), color: 0x3b82f6 },
      { pos: new THREE.Vector3(3, 2, 0), color: 0x3b82f6 },
      { pos: new THREE.Vector3(-2, 0, 2), color: 0x3b82f6 },
      { pos: new THREE.Vector3(2, 0, -2), color: 0xa855f7 },
      { pos: new THREE.Vector3(0, -1, 0), color: 0xef4444 },
      { pos: new THREE.Vector3(-1, 1, -3), color: 0x3b82f6 },
      { pos: new THREE.Vector3(1, 2, 3), color: 0x3b82f6 },
    ];

    const edges3d = [[0, 1], [0, 3], [1, 2], [1, 7], [2, 4], [3, 5], [4, 5], [5, 6], [6, 0], [7, 4]];

    nodes3d.forEach(({ pos, color }) => {
      const geo = new THREE.SphereGeometry(0.4, 16, 16);
      const mat = new THREE.MeshPhongMaterial({ color, shininess: 100, emissive: color, emissiveIntensity: 0.2 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(pos);
      mesh.userData.isViz = true;
      scene.add(mesh);

      // Glow ring
      const ringGeo = new THREE.RingGeometry(0.5, 0.6, 16);
      const ringMat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(pos);
      ring.userData.isViz = true;
      scene.add(ring);
    });

    edges3d.forEach(([a, b]) => {
      drawEdge(scene, nodes3d[a].pos, nodes3d[b].pos, 0x475569);
    });
  }
}

function drawEdge(scene: THREE.Scene, from: THREE.Vector3, to: THREE.Vector3, color: number) {
  const dir = new THREE.Vector3().subVectors(to, from);
  const length = dir.length();
  const geo = new THREE.CylinderGeometry(0.04, 0.04, length, 8);
  const mat = new THREE.MeshPhongMaterial({ color, transparent: true, opacity: 0.7 });
  const mesh = new THREE.Mesh(geo, mat);

  const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
  mesh.position.copy(mid);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  mesh.userData.isViz = true;
  scene.add(mesh);
}
