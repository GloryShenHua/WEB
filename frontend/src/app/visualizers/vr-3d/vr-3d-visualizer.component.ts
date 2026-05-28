import {
    Component,
    ElementRef,
    ViewChild,
    AfterViewInit,
    OnDestroy,
    signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

type StructureType =
    | 'array'
    | 'stack'
    | 'queue'
    | 'linked-list'
    | 'binary-tree'
    | 'b-plus-tree';

interface StructureInfo {
    title: string;
    definition: string;
    features: string[];
    operations: { name: string; complexity: string; description: string }[];
    useCases: string[];
}

@Component({
    selector: 'app-vr-3d-visualizer',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './vr-3d-visualizer.component.html',
})
export class Vr3dVisualizerComponent implements AfterViewInit, OnDestroy {
    @ViewChild('canvasContainer', { static: true })
    canvasContainer!: ElementRef<HTMLDivElement>;

    selected = signal<StructureType>('array');

    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private renderer!: THREE.WebGLRenderer;
    private controls!: OrbitControls;
    private animationId: number | null = null;
    private objects: THREE.Object3D[] = [];

    structureTypes = [
        { id: 'array' as const, label: '数组' },
        { id: 'stack' as const, label: '栈' },
        { id: 'queue' as const, label: '队列' },
        { id: 'linked-list' as const, label: '链表' },
        { id: 'binary-tree' as const, label: '二叉树' },
        { id: 'b-plus-tree' as const, label: 'B+ 树' },
    ];

    infoMap: Record<StructureType, StructureInfo> = {
        array: {
            title: '数组 Array',
            definition: '数组是一组连续存储的元素，支持通过下标进行随机访问。',
            features: ['连续内存', '随机访问快', '插入删除可能需要移动元素'],
            operations: [
                { name: '访问', complexity: 'O(1)', description: '通过下标直接访问元素。' },
                { name: '查找', complexity: 'O(n)', description: '顺序扫描直到找到目标。' },
                { name: '插入', complexity: 'O(n)', description: '可能需要移动后续元素。' },
                { name: '删除', complexity: 'O(n)', description: '可能需要移动后续元素。' },
            ],
            useCases: ['顺序表', '缓存', '矩阵', '动态数组底层结构'],
        },
        stack: {
            title: '栈 Stack',
            definition: '栈是一种后进先出 LIFO 的线性数据结构。',
            features: ['只允许在栈顶操作', '后进先出', '操作简单高效'],
            operations: [
                { name: 'push', complexity: 'O(1)', description: '向栈顶压入元素。' },
                { name: 'pop', complexity: 'O(1)', description: '弹出栈顶元素。' },
                { name: 'peek', complexity: 'O(1)', description: '查看栈顶元素。' },
            ],
            useCases: ['函数调用栈', '括号匹配', '表达式求值', '撤销操作'],
        },
        queue: {
            title: '队列 Queue',
            definition: '队列是一种先进先出 FIFO 的线性数据结构。',
            features: ['队尾入队', '队头出队', '先进先出'],
            operations: [
                { name: 'enqueue', complexity: 'O(1)', description: '向队尾加入元素。' },
                { name: 'dequeue', complexity: 'O(1)', description: '从队头移除元素。' },
                { name: 'front', complexity: 'O(1)', description: '查看队头元素。' },
            ],
            useCases: ['任务调度', '消息队列', 'BFS', '缓冲区'],
        },
        'linked-list': {
            title: '链表 Linked List',
            definition: '链表由节点组成，每个节点保存数据和指向下一个节点的引用。',
            features: ['非连续存储', '插入删除灵活', '随机访问较慢'],
            operations: [
                { name: '访问', complexity: 'O(n)', description: '需要从头节点逐个遍历。' },
                { name: '查找', complexity: 'O(n)', description: '逐个比较节点值。' },
                { name: '头插', complexity: 'O(1)', description: '直接修改头指针。' },
                { name: '删除', complexity: 'O(1) / O(n)', description: '已知前驱为 O(1)，否则需查找。' },
            ],
            useCases: ['链式栈', '链式队列', '邻接表', '内存管理'],
        },
        'binary-tree': {
            title: '二叉树 Binary Tree',
            definition: '二叉树是每个节点最多有两个子节点的树形结构。',
            features: ['层级结构', '递归定义', '适合表达搜索和层级关系'],
            operations: [
                { name: '查找', complexity: 'O(log n) / O(n)', description: '平衡时较快，退化时为线性。' },
                { name: '插入', complexity: 'O(log n) / O(n)', description: '按规则插入到子树中。' },
                { name: '遍历', complexity: 'O(n)', description: '前序、中序、后序或层序访问所有节点。' },
            ],
            useCases: ['表达式树', '搜索树', '堆', '语法分析'],
        },
        'b-plus-tree': {
            title: 'B+ 树 B+ Tree',
            definition: 'B+ 树是一种多路平衡搜索树，常用于数据库索引。',
            features: ['多路平衡', '内部节点只存索引', '数据集中在叶子节点', '叶子节点链表便于范围查询'],
            operations: [
                { name: '查找', complexity: 'O(logₘ n)', description: '从根节点沿索引向下查找到叶子。' },
                { name: '插入', complexity: 'O(logₘ n)', description: '插入到叶子节点，必要时分裂。' },
                { name: '删除', complexity: 'O(logₘ n)', description: '删除后可能合并或借位。' },
                { name: '范围查询', complexity: 'O(logₘ n + k)', description: '定位起点后沿叶子链表顺序扫描。' },
            ],
            useCases: ['数据库索引', '文件系统索引', '范围查询', '磁盘块管理'],
        },
    };

    get currentInfo(): StructureInfo {
        return this.infoMap[this.selected()];
    }

    ngAfterViewInit(): void {
        this.initThree();
        this.renderStructure();
        this.animate();
        window.addEventListener('resize', this.handleResize);
    }

    ngOnDestroy(): void {
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
        }

        window.removeEventListener('resize', this.handleResize);

        this.controls?.dispose();
        this.renderer?.dispose();

        for (const obj of this.objects) {
            this.disposeObject(obj);
        }
    }

    selectStructure(type: StructureType): void {
        this.selected.set(type);
        this.renderStructure();
    }

    private initThree(): void {
        const container = this.canvasContainer.nativeElement;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x020617);

        this.camera = new THREE.PerspectiveCamera(
            60,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 6, 14);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.target.set(0, 0, 0);
        this.controls.update();

        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambient);

        const directional = new THREE.DirectionalLight(0xffffff, 1);
        directional.position.set(8, 10, 8);
        this.scene.add(directional);

        //const grid = new THREE.GridHelper(24, 24, 0x334155, 0x1e293b);
        //this.scene.add(grid);
    }

    private renderStructure(): void {
        this.clearObjects();

        switch (this.selected()) {
            case 'array':
                this.renderArray();
                break;
            case 'stack':
                this.renderStack();
                break;
            case 'queue':
                this.renderQueue();
                break;
            case 'linked-list':
                this.renderLinkedList();
                break;
            case 'binary-tree':
                this.renderBinaryTree();
                break;
            case 'b-plus-tree':
                this.renderBPlusTree();
                break;
        }
    }

    private renderArray(): void {
        const values = [10, 20, 30, 40, 50];
        values.forEach((value, i) => {
            const cube = this.createBox(String(value), 0x2563eb);
            cube.position.set((i - 2) * 2, 1, 0);
            this.addObject(cube);
        });
    }

    private renderStack(): void {
        const values = [10, 20, 30, 40, 50];
        values.forEach((value, i) => {
            const cube = this.createBox(String(value), i === values.length - 1 ? 0xfacc15 : 0x22c55e);
            cube.position.set(0, i + 0.6, 0);
            this.addObject(cube);
        });
    }

    private renderQueue(): void {
        const values = [10, 20, 30, 40, 50];
        values.forEach((value, i) => {
            const cube = this.createBox(String(value), i === 0 ? 0xf97316 : i === values.length - 1 ? 0x8b5cf6 : 0x06b6d4);
            cube.position.set((i - 2) * 2, 1, 0);
            this.addObject(cube);
        });
    }

    private renderLinkedList(): void {
        const values = [10, 20, 30, 40];

        values.forEach((value, i) => {
            const node = this.createSphere(String(value), 0x38bdf8);
            node.position.set((i - 1.5) * 3, 1.5, 0);
            this.addObject(node);

            if (i < values.length - 1) {
                const arrow = this.createArrow(
                    new THREE.Vector3((i - 1.5) * 3 + 0.8, 1.5, 0),
                    new THREE.Vector3((i - 0.5) * 3 - 0.8, 1.5, 0),
                    0xfacc15
                );
                this.addObject(arrow);
            }
        });
    }

    private renderBinaryTree(): void {
        const nodes = [
            { v: '8', x: 0, y: 5, z: 0 },
            { v: '4', x: -4, y: 3, z: 0 },
            { v: '12', x: 4, y: 3, z: 0 },
            { v: '2', x: -6, y: 1, z: 0 },
            { v: '6', x: -2, y: 1, z: 0 },
            { v: '10', x: 2, y: 1, z: 0 },
            { v: '14', x: 6, y: 1, z: 0 },
        ];

        const edges = [
            [0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6],
        ];

        nodes.forEach(node => {
            const sphere = this.createSphere(node.v, 0xa855f7);
            sphere.position.set(node.x, node.y, node.z);
            this.addObject(sphere);
        });

        edges.forEach(([from, to]) => {
            const a = nodes[from];
            const b = nodes[to];
            const line = this.createLine(
                new THREE.Vector3(a.x, a.y, a.z),
                new THREE.Vector3(b.x, b.y, b.z),
                0x94a3b8
            );
            this.addObject(line);
        });
    }

    private renderBPlusTree(): void {
        const levels = [
            [{ text: '30 | 60', x: 0, y: 5 }],
            [
                { text: '10 | 20', x: -5, y: 3 },
                { text: '30 | 40 | 50', x: 0, y: 3 },
                { text: '60 | 70 | 80', x: 5, y: 3 },
            ],
        ];

        const root = this.createWideBox(levels[0][0].text, 0xf59e0b);
        root.position.set(0, 5, 0);
        this.addObject(root);

        levels[1].forEach(leaf => {
            const box = this.createWideBox(leaf.text, 0x10b981);
            box.position.set(leaf.x, leaf.y, 0);
            this.addObject(box);

            const edge = this.createLine(
                new THREE.Vector3(0, 4.5, 0),
                new THREE.Vector3(leaf.x, leaf.y + 0.5, 0),
                0x94a3b8
            );
            this.addObject(edge);
        });

        for (let i = 0; i < levels[1].length - 1; i++) {
            const from = levels[1][i];
            const to = levels[1][i + 1];
            const arrow = this.createArrow(
                new THREE.Vector3(from.x + 1.6, from.y, 0),
                new THREE.Vector3(to.x - 1.6, to.y, 0),
                0x22d3ee
            );
            this.addObject(arrow);
        }
    }

    private createBox(label: string, color: number): THREE.Group {
        const group = new THREE.Group();

        const geometry = new THREE.BoxGeometry(1.3, 1.3, 1.3);
        const material = new THREE.MeshStandardMaterial({
            color,
            transparent: true,
            opacity: 0.35,
            roughness: 0.25,
            metalness: 0.15,
            emissive: color,
            emissiveIntensity: 0.12,
            side: THREE.DoubleSide,
            depthWrite: false,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.renderOrder = 1;
        group.add(mesh);

        const text = this.createTextSprite(label);
        text.position.set(0, 0, 0.72);
        group.add(text);

        return group;
    }

    private createWideBox(label: string, color: number): THREE.Group {
        const group = new THREE.Group();

        const geometry = new THREE.BoxGeometry(3.2, 1.1, 1.1);
        const material = new THREE.MeshStandardMaterial({
            color,
            transparent: true,
            opacity: 0.35,
            roughness: 0.25,
            metalness: 0.15,
            emissive: color,
            emissiveIntensity: 0.12,
            side: THREE.DoubleSide,
            depthWrite: false,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.renderOrder = 1;
        group.add(mesh);

        const text = this.createTextSprite(label);
        text.position.set(0, 0, 0.65);
        group.add(text);

        return group;
    }

    private createSphere(label: string, color: number): THREE.Group {
        const group = new THREE.Group();

        const geometry = new THREE.SphereGeometry(0.75, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            color,
            transparent: true,
            opacity: 0.4,
            roughness: 0.25,
            metalness: 0.15,
            emissive: color,
            emissiveIntensity: 0.1,
            side: THREE.DoubleSide,
            depthWrite: false,
        });
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);

        const text = this.createTextSprite(label);
        text.position.set(0, 0, 0.85);
        group.add(text);

        return group;
    }

    private createTextSprite(text: string): THREE.Sprite {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;

        const ctx = canvas.getContext('2d')!;

        // 保持 canvas 背景完全透明
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 40px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
        });

        const sprite = new THREE.Sprite(material);
        sprite.scale.set(1.8, 0.9, 1);
        sprite.renderOrder = 2;

        return sprite;
    }

    private createLine(start: THREE.Vector3, end: THREE.Vector3, color: number): THREE.Line {
        const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
        const material = new THREE.LineBasicMaterial({ color, linewidth: 2 });
        return new THREE.Line(geometry, material);
    }

    private createArrow(start: THREE.Vector3, end: THREE.Vector3, color: number): THREE.ArrowHelper {
        const direction = new THREE.Vector3().subVectors(end, start).normalize();
        const length = start.distanceTo(end);
        return new THREE.ArrowHelper(direction, start, length, color, 0.35, 0.2);
    }

    private addObject(obj: THREE.Object3D): void {
        this.objects.push(obj);
        this.scene.add(obj);
    }

    private clearObjects(): void {
        for (const obj of this.objects) {
            this.scene.remove(obj);
            this.disposeObject(obj);
        }
        this.objects = [];
    }

    private disposeObject(obj: THREE.Object3D): void {
        obj.traverse(child => {
            const mesh = child as THREE.Mesh;
            if (mesh.geometry) {
                mesh.geometry.dispose();
            }

            const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
            if (Array.isArray(material)) {
                material.forEach(m => m.dispose());
            } else if (material) {
                material.dispose();
            }
        });
    }

    private animate = (): void => {
        this.animationId = requestAnimationFrame(this.animate);
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    };

    private handleResize = (): void => {
        const container = this.canvasContainer.nativeElement;
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    };
}