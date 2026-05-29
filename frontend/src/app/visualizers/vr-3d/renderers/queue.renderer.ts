import { StructureRendererContext } from './structure-renderer.types';
import { ThreeObjectFactory } from './three-object-factory';

export class QueueRenderer {
    static render(ctx: StructureRendererContext): void {
        const values = [10, 20, 30, 40, 50];

        values.forEach((value, i) => {
            const cube = ThreeObjectFactory.createBox(
                String(value),
                i === 0 ? 0xf97316 : i === values.length - 1 ? 0x8b5cf6 : 0x06b6d4
            );
            cube.position.set((i - 2) * 2, 1, 0);
            ctx.addObject(cube);
        });
    }
}