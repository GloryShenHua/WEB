import * as THREE from 'three';
import { CustomStructureData } from '../renderers/structure-renderer.types';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";

export interface AnimationContext {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls; // 用于临时禁用
    addTemporaryObject: (obj: THREE.Object3D) => void; // 临时对象（高亮、箭头等）
    clearTemporaryObjects: () => void;
    data: CustomStructureData;
    updateData: (newData: CustomStructureData) => void; // 动画完成后更新数据
}

export interface StructureAnimator {
    // 执行操作，返回值可选用于等待结束
    performOperation(
        operationName: string,
        ctx: AnimationContext,
        options?: any // 如插入/删除需要的值
    ): Promise<void>;
}