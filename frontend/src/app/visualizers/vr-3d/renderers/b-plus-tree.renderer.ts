import * as THREE from 'three';
import { StructureRendererContext } from './structure-renderer.types';
import { ThreeObjectFactory } from './three-object-factory';

export class BPlusTreeRenderer {
    static render(ctx: StructureRendererContext): void {
        const values = ctx.data.values.length > 0
            ? ctx.data.values
            : ['10', '20', '30', '40', '50', '60', '70', '80'];

        const leafGroups = this.chunk(values, 3);
        const rootText = leafGroups.map(group => group[0]).join(' | ');

        const root = ThreeObjectFactory.createWideBox(rootText, 0xf59e0b);
        root.position.set(0, 5, 0);
        ctx.addObject(root);

        const center = (leafGroups.length - 1) / 2;

        leafGroups.forEach((group, i) => {
            const x = (i - center) * 5;
            const y = 3;
            const text = group.join(' | ');

            const box = ThreeObjectFactory.createWideBox(text, 0x10b981);
            box.position.set(x, y, 0);
            ctx.addObject(box);

            const edge = ThreeObjectFactory.createLine(
                new THREE.Vector3(0, 4.5, 0),
                new THREE.Vector3(x, y + 0.5, 0),
                0x94a3b8
            );
            ctx.addObject(edge);
        });

        for (let i = 0; i < leafGroups.length - 1; i++) {
            const fromX = (i - center) * 5;
            const toX = (i + 1 - center) * 5;

            const arrow = ThreeObjectFactory.createArrow(
                new THREE.Vector3(fromX + 1.6, 3, 0),
                new THREE.Vector3(toX - 1.6, 3, 0),
                0x22d3ee
            );

            ctx.addObject(arrow);
        }
    }

    private static chunk(values: string[], size: number): string[][] {
        const result: string[][] = [];

        for (let i = 0; i < values.length; i += size) {
            result.push(values.slice(i, i + size));
        }

        return result;
    }
}