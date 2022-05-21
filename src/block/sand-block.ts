import { Vector3 } from "three";
import { Level } from "../level";
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
        super('sand', [SandBlockModel]);
    }

    public getBlockModel(): number {
        return 0;
    }

    public onRandomTick(level: Level, pos: BlockPos): void {
        if (level.getBlockAt(new Vector3(pos.x, pos.y - 1, pos.z)) !== Blocks.AIR) {
            return;
        }

        level.setBlockAt(new Vector3(pos.x, pos.y, pos.z), Blocks.AIR);
        level.setBlockAt(new Vector3(pos.x, pos.y - 1, pos.z), Blocks.SAND);
    }
}
