import { StructureRendererContext } from './structure-renderer.types';
import { ThreeObjectFactory } from './three-object-factory';

export class StackRenderer {
    static render(ctx: StructureRendererContext): void {
        const values = [10, 20, 30, 40, 50];

        values.forEach((value, i) => {
            const cube = ThreeObjectFactory.createBox(
                String(value),
                i === values.length - 1 ? 0xfacc15 : 0x22c55e
            );
            cube.position.set(0, i + 0.6, 0);
            ctx.addObject(cube);
        });
    }
}