import {
    Component,
    ElementRef,
    ViewChild,
    AfterViewInit,
    OnDestroy,
    computed,
    effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { StructureType } from './renderers/structure-renderer.types';
import { STRUCTURE_INFO } from './data/structure-info';
import { ArrayRenderer } from './renderers/array.renderer';
import { StackRenderer } from './renderers/stack.renderer';
import { QueueRenderer } from './renderers/queue.renderer';
import { LinkedListRenderer } from './renderers/linked-list.renderer';
import { BinaryTreeRenderer } from './renderers/binary-tree.renderer';
import { BPlusTreeRenderer } from './renderers/b-plus-tree.renderer';
import { AlgorithmStore } from '../../store/algorithm.store';

@Component({
    selector: 'app-vr-3d-visualizer',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './vr-3d-visualizer.component.html',
})
export class Vr3dVisualizerComponent implements AfterViewInit, OnDestroy {
    @ViewChild('canvasContainer', { static: true })
    canvasContainer!: ElementRef<HTMLDivElement>;

    selected = computed(() => this.store.vr3dStructure());

    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private renderer!: THREE.WebGLRenderer;
    private controls!: OrbitControls;
    private animationId: number | null = null;
    private objects: THREE.Object3D[] = [];
    private threeReady = false;

    structureTypes = [
        { id: 'array' as const, label: '数组' },
        { id: 'stack' as const, label: '栈' },
        { id: 'queue' as const, label: '队列' },
        { id: 'linked-list' as const, label: '链表' },
        { id: 'binary-tree' as const, label: '二叉树' },
        { id: 'b-plus-tree' as const, label: 'B+ 树' },
    ];

    constructor(public store: AlgorithmStore) {
        effect(() => {
            this.store.vr3dStructure();
            this.store.vr3dData();

            if (this.threeReady) {
                this.renderStructure();
            }
        });
    }

    get currentInfo() {
        return STRUCTURE_INFO[this.selected()];
    }

    ngAfterViewInit(): void {
        this.initThree();
        this.threeReady = true;
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
        this.store.setVr3dStructure(type);
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

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.resetCameraView();

        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambient);

        const directional = new THREE.DirectionalLight(0xffffff, 1);
        directional.position.set(8, 10, 8);
        this.scene.add(directional);
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
    }

    private resetCameraView(): void {
        if (this.selected() === 'b-plus-tree') {
            this.camera.position.set(0, 5.5, 24);
            this.controls.target.set(0, 1.2, 0);
        } else if (this.selected() === 'binary-tree') {
            this.camera.position.set(0, 5.5, 20);
            this.controls.target.set(0, 1.4, 0);
        } else {
            this.camera.position.set(0, 4.5, 14);
            this.controls.target.set(0, 2.4, 0);
        }

        this.controls.update();
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