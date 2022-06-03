import { Vector3 } from "three";
import { FallingBlockEntity } from "../entity/falling-block-entity";
import { Level } from "../level";
import { World } from "../world/world";
import { Block } from "./block";
import { BlockFaces } from "./block-face";
import { BlockModel } from "./block-model/block-model";
import { BlockPos } from "./block-pos";
import { Blocks } from "./blocks";

export const SandBlockModel: BlockModel = {
    elements: [
        {
            from: [0, 0, 0],
            to: [15, 15, 15],
            faces: BlockFaces.reduce((faces, face) => ({
                ...faces,
                [face]: {
                    cull: true,
                    texture: 'textures/blocks/sand.png',
                },
            }), {}),
        },
    ],
}

export class SandBlock extends Block {
    public constructor() {
        super('sand', 'Sand', [SandBlockModel]);
    }

    public onTick(world: World, pos: BlockPos): void {
        if (world.getBlock(new Vector3(pos.x, pos.y - 1, pos.z)) !== Blocks.AIR) {
            return;
        }

        world.setBlock(pos, Blocks.AIR);
        const fallingBlock = new FallingBlockEntity(world, this, pos);
        world.entityManager.add(fallingBlock);
    }
}
