import * as THREE from 'three';
import { StructureRendererContext } from './structure-renderer.types';
import { ThreeObjectFactory } from './three-object-factory';

export class BPlusTreeRenderer {
    static render(ctx: StructureRendererContext): void {
        const levels = [
            [{ text: '30 | 60', x: 0, y: 5 }],
            [
                { text: '10 | 20', x: -5, y: 3 },
                { text: '30 | 40 | 50', x: 0, y: 3 },
                { text: '60 | 70 | 80', x: 5, y: 3 },
            ],
        ];

        const root = ThreeObjectFactory.createWideBox(levels[0][0].text, 0xf59e0b);
        root.position.set(0, 5, 0);
        ctx.addObject(root);

        levels[1].forEach(leaf => {
            const box = ThreeObjectFactory.createWideBox(leaf.text, 0x10b981);
            box.position.set(leaf.x, leaf.y, 0);
            ctx.addObject(box);

            const edge = ThreeObjectFactory.createLine(
                new THREE.Vector3(0, 4.5, 0),
                new THREE.Vector3(leaf.x, leaf.y + 0.5, 0),
                0x94a3b8
            );
            ctx.addObject(edge);
        });

        for (let i = 0; i < levels[1].length - 1; i++) {
            const from = levels[1][i];
            const to = levels[1][i + 1];

            const arrow = ThreeObjectFactory.createArrow(
                new THREE.Vector3(from.x + 1.6, from.y, 0),
                new THREE.Vector3(to.x - 1.6, to.y, 0),
                0x22d3ee
            );

            ctx.addObject(arrow);
        }
    }
}