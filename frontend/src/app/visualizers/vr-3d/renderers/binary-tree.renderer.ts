import * as THREE from 'three';
import { StructureRendererContext } from './structure-renderer.types';
import { ThreeObjectFactory } from './three-object-factory';

export class BinaryTreeRenderer {
    static render(ctx: StructureRendererContext): void {
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
            const sphere = ThreeObjectFactory.createSphere(node.v, 0xa855f7);
            sphere.position.set(node.x, node.y, node.z);
            ctx.addObject(sphere);
        });

        edges.forEach(([from, to]) => {
            const a = nodes[from];
            const b = nodes[to];

            const line = ThreeObjectFactory.createLine(
                new THREE.Vector3(a.x, a.y, a.z),
                new THREE.Vector3(b.x, b.y, b.z),
                0x94a3b8
            );

            ctx.addObject(line);
        });
    }
}