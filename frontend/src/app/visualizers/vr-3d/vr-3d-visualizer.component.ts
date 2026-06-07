import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { AlgorithmStore } from '../../store/algorithm.store';
import { StructureType } from './renderers/structure-renderer.types';
import { STRUCTURE_INFO } from './data/structure-info';
import { ArrayRenderer } from './renderers/array.renderer';
import { StackRenderer } from './renderers/stack.renderer';
import { QueueRenderer } from './renderers/queue.renderer';
import { LinkedListRenderer } from './renderers/linked-list.renderer';
import { BinaryTreeRenderer } from './renderers/binary-tree.renderer';
import { BPlusTreeRenderer } from './renderers/b-plus-tree.renderer';
import { AnimationContext, StructureAnimator } from './animators/structure-animator.interface';
import { BasicStructureAnimator } from './animators/basic-structure.animator';
import { BPlusTreeAnimator } from './animators/b-plus-tree.animator';

interface StructureOption {
  type: StructureType;
  label: string;
}

@Component({
  selector: 'app-vr-3d-visualizer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vr-3d-visualizer.component.html',
})
export class Vr3dVisualizerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvasContainer', { static: true })
  canvasContainer!: ElementRef<HTMLDivElement>;

  readonly structureOptions: StructureOption[] = [
    { type: 'array', label: '数组' },
    { type: 'stack', label: '栈' },
    { type: 'queue', label: '队列' },
    { type: 'linked-list', label: '链表' },
    { type: 'binary-tree', label: '二叉树' },
    { type: 'b-plus-tree', label: 'B+ 树' },
  ];

  selected = computed(() => this.store.vr3dStructure());
  operationStatus = '选择一个结构操作，系统会在 3D 场景中高亮关键步骤。';
  practiceAnswer = '';
  practiceFeedback: { ok: boolean; text: string } | null = null;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private animationId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private objects: THREE.Object3D[] = [];
  private tempObjects: THREE.Object3D[] = [];
  private threeReady = false;
  private isAnimating = false;
  private animatorsMap = new Map<StructureType, StructureAnimator>();

  constructor(public store: AlgorithmStore) {
    effect(() => {
      this.store.vr3dStructure();
      this.store.vr3dData();

      if (this.threeReady) {
        this.renderStructure();
        this.resetPractice();
      }
    });
  }

  get currentInfo() {
    return STRUCTURE_INFO[this.selected()];
  }

  get practicePrompt(): string {
    switch (this.selected()) {
      case 'stack':
        return '练习：当前栈顶元素是什么？';
      case 'queue':
        return '练习：当前队头元素是什么？';
      case 'array':
        return '练习：数组下标 0 的元素是什么？';
      case 'linked-list':
        return '练习：链表头节点是什么？';
      case 'binary-tree':
        return '练习：当前根节点是什么？';
      case 'b-plus-tree':
        return '练习：最左侧叶子节点的第一个关键字是什么？';
    }
  }

  ngAfterViewInit(): void {
    this.initThree();
    this.initAnimators();
    this.threeReady = true;
    this.renderStructure();
    this.observeCanvasSize();
    this.animate();
    window.addEventListener('resize', this.handleResize);
  }

  ngOnDestroy(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }

    this.resizeObserver?.disconnect();
    window.removeEventListener('resize', this.handleResize);
    this.controls?.dispose();
    this.renderer?.dispose();
    this.clearObjects();
    this.clearTemporaryObjects();
  }

  selectStructure(type: StructureType): void {
    this.store.setVr3dStructure(type);
    this.operationStatus = '已切换结构，可以运行操作动画或完成右侧练习。';
  }

  performOperation(opName: string): void {
    this.onOperate(opName).then();
  }

  async onOperate(operationName: string): Promise<void> {
    if (this.isAnimating) {
      alert('动画正在进行中，请稍后再试');
      return;
    }

    const animator = this.animatorsMap.get(this.selected());
    if (!animator) {
      alert(`${this.currentInfo.title} 的操作动画尚未实现`);
      return;
    }

    this.isAnimating = true;
    this.operationStatus = `正在演示：${operationName}`;
    this.controls.enabled = false;

    try {
      const ctx: AnimationContext = {
        scene: this.scene,
        camera: this.camera,
        controls: this.controls,
        structureType: this.selected(),
        addTemporaryObject: obj => {
          this.tempObjects.push(obj);
          this.scene.add(obj);
        },
        clearTemporaryObjects: () => this.clearTemporaryObjects(),
        data: this.store.vr3dData(),
        updateData: newData => {
          this.store.setVr3dData(newData.values);
          setTimeout(() => this.renderStructure(), 100);
        },
        announce: message => {
          this.operationStatus = message;
        },
      };

      await animator.performOperation(operationName, ctx);
    } catch (err) {
      console.error(err);
      this.operationStatus = '操作演示失败，请查看控制台错误。';
    } finally {
      this.isAnimating = false;
      this.controls.enabled = true;
      this.clearTemporaryObjects();
    }
  }

  randomData(): void {
    this.store.randomVr3dData();
    this.operationStatus = '已生成一组新的练习数据。';
  }

  checkPractice(): void {
    const answer = this.practiceAnswer.trim();
    const expected = this.getPracticeExpectedAnswer();

    if (!answer) {
      this.practiceFeedback = { ok: false, text: '请先填写答案。' };
      return;
    }

    const ok = answer === expected;
    this.practiceFeedback = {
      ok,
      text: ok ? '回答正确，关键位置判断准确。' : `还差一点，正确答案是 ${expected}。`,
    };
  }

  resetPractice(): void {
    this.practiceAnswer = '';
    this.practiceFeedback = null;
  }

  resetView(): void {
    this.resetCameraView();
    this.operationStatus = '视角已重置。';
  }

  private initThree(): void {
    const container = this.canvasContainer.nativeElement;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x020617);

    this.camera = new THREE.PerspectiveCamera(58, 1, 0.1, 1000);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.65));

    const directional = new THREE.DirectionalLight(0xffffff, 1);
    directional.position.set(8, 10, 8);
    this.scene.add(directional);

    const grid = new THREE.GridHelper(24, 24, 0x334155, 0x1e293b);
    grid.position.y = -0.05;
    this.scene.add(grid);

    this.resizeRendererToContainer();
  }

  private initAnimators(): void {
    const basicAnimator = new BasicStructureAnimator();
    this.animatorsMap.set('array', basicAnimator);
    this.animatorsMap.set('stack', basicAnimator);
    this.animatorsMap.set('queue', basicAnimator);
    this.animatorsMap.set('linked-list', basicAnimator);
    this.animatorsMap.set('binary-tree', basicAnimator);
    this.animatorsMap.set('b-plus-tree', new BPlusTreeAnimator());
  }

  private renderStructure(): void {
    this.clearObjects();

    const ctx = {
      addObject: (obj: THREE.Object3D) => this.addObject(obj),
      data: this.store.vr3dData(),
    };

    switch (this.selected()) {
      case 'array':
        ArrayRenderer.render(ctx);
        break;
      case 'stack':
        StackRenderer.render(ctx);
        break;
      case 'queue':
        QueueRenderer.render(ctx);
        break;
      case 'linked-list':
        LinkedListRenderer.render(ctx);
        break;
      case 'binary-tree':
        BinaryTreeRenderer.render(ctx);
        break;
      case 'b-plus-tree':
        BPlusTreeRenderer.render(ctx);
        break;
    }

    this.resetCameraView();
    this.resizeRendererToContainer();
  }

  private resetCameraView(): void {
    if (!this.camera || !this.controls) return;

    if (this.selected() === 'b-plus-tree') {
      this.camera.position.set(0, 4.2, 22);
      this.controls.target.set(0, 1.1, 0);
    } else if (this.selected() === 'binary-tree') {
      this.camera.position.set(0, 4.3, 18);
      this.controls.target.set(0, 1.8, 0);
    } else if (this.selected() === 'stack') {
      this.camera.position.set(0, 3.8, 12);
      this.controls.target.set(0, 1.8, 0);
    } else {
      this.camera.position.set(0, 3.2, 12);
      this.controls.target.set(0, 1.0, 0);
    }

    this.controls.update();
  }

  private observeCanvasSize(): void {
    this.resizeObserver = new ResizeObserver(() => this.resizeRendererToContainer());
    this.resizeObserver.observe(this.canvasContainer.nativeElement);
  }

  private resizeRendererToContainer(): void {
    if (!this.renderer || !this.camera) return;

    const container = this.canvasContainer.nativeElement;
    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
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

  private clearTemporaryObjects(): void {
    for (const obj of this.tempObjects) {
      this.scene.remove(obj);
      this.disposeObject(obj);
    }
    this.tempObjects = [];
  }

  private disposeObject(obj: THREE.Object3D): void {
    obj.traverse(child => {
      const mesh = child as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();

      const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(material)) {
        material.forEach(item => item.dispose());
      } else if (material) {
        material.dispose();
      }

      if (child instanceof THREE.Sprite) {
        const material = child.material as THREE.SpriteMaterial;
        material.map?.dispose();
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
    this.resizeRendererToContainer();
  };

  private getPracticeExpectedAnswer(): string {
    const values = this.store.vr3dData().values;
    return this.selected() === 'stack' ? values.at(-1) ?? '' : values[0] ?? '';
  }
}
