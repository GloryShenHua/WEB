import { StructureRendererContext } from './structure-renderer.types';
import { ThreeObjectFactory } from './three-object-factory';

export class ArrayRenderer {
    static render(ctx: StructureRendererContext): void {
        const values = [10, 20, 30, 40, 50];

        values.forEach((value, i) => {
            const cube = ThreeObjectFactory.createBox(String(value), 0x2563eb);
            cube.position.set((i - 2) * 2, 1, 0);
            ctx.addObject(cube);
        });
    }
}