import * as THREE from 'three';
import { StructureRendererContext } from './structure-renderer.types';
import { ThreeObjectFactory } from './three-object-factory';

export class LinkedListRenderer {
    static render(ctx: StructureRendererContext): void {
        const values = [10, 20, 30, 40];

        values.forEach((value, i) => {
            const node = ThreeObjectFactory.createSphere(String(value), 0x38bdf8);
            node.position.set((i - 1.5) * 3, 1.5, 0);
            ctx.addObject(node);

            if (i < values.length - 1) {
                const arrow = ThreeObjectFactory.createArrow(
                    new THREE.Vector3((i - 1.5) * 3 + 0.8, 1.5, 0),
                    new THREE.Vector3((i - 0.5) * 3 - 0.8, 1.5, 0),
                    0xfacc15
                );
                ctx.addObject(arrow);
            }
        });
    }
}