import * as THREE from 'three';
import { StructureRendererContext } from './structure-renderer.types';
import { ThreeObjectFactory } from './three-object-factory';

export class BinaryTreeRenderer {
    static render(ctx: StructureRendererContext): void {
        const values = ctx.data.values.length > 0
            ? ctx.data.values
            : ['8', '4', '12', '2', '6', '10', '14'];

        const nodes = values.map((value, index) => {
            const level = Math.floor(Math.log2(index + 1));
            const firstIndexOfLevel = Math.pow(2, level) - 1;
            const indexInLevel = index - firstIndexOfLevel;
            const nodesInLevel = Math.pow(2, level);
            const gap = 8 / Math.max(nodesInLevel, 1);

            return {
                v: value,
                x: (indexInLevel - (nodesInLevel - 1) / 2) * gap,
                y: 5 - level * 2,
                z: 0,
                index,
            };
        });

        nodes.forEach(node => {
            const sphere = ThreeObjectFactory.createSphere(node.v, 0xa855f7);
            sphere.position.set(node.x, node.y, node.z);
            ctx.addObject(sphere);
        });

        nodes.forEach(node => {
            if (node.index === 0) {
                return;
            }

            const parentIndex = Math.floor((node.index - 1) / 2);
            const parent = nodes[parentIndex];

            if (!parent) {
                return;
            }

            const line = ThreeObjectFactory.createLine(
                new THREE.Vector3(parent.x, parent.y, parent.z),
                new THREE.Vector3(node.x, node.y, node.z),
                0x94a3b8
            );

            ctx.addObject(line);
        });
    }
}