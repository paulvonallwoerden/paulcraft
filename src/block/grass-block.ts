import { Vector3 } from "three";
import { Level } from "../level";
import { Block } from "./block";
import { BlockFace, BlockFaces } from "./block-face";
import { BlockModel } from "./block-model/block-model";
import { BlockPos } from "./block-pos";
import { Blocks } from "./blocks";

export const GrassBlockModel: BlockModel = {
    elements: [
        {
            from: [0, 0, 0],
            to: [15, 15, 15],
            faces: {
                [BlockFace.TOP]: {
                    cull: true,
                    texture: 'textures/blocks/grass_block_top.png',
                },
                [BlockFace.LEFT]: {
                    cull: true,
                    texture: 'textures/blocks/grass_block_side.png',
                },
                [BlockFace.RIGHT]: {
                    cull: true,
                    texture: 'textures/blocks/grass_block_side.png',
                },
                [BlockFace.FRONT]: {
                    cull: true,
                    texture: 'textures/blocks/grass_block_side.png',
                },
                [BlockFace.BACK]: {
                    cull: true,
                    texture: 'textures/blocks/grass_block_side.png',
                },
                [BlockFace.BOTTOM]: {
                    cull: true,
                    texture: 'textures/blocks/dirt.png',
                },
            }
        },
    ],
}

export class GrassBlock extends Block {
    public constructor() {
        super('grass', [GrassBlockModel]);
    }

    public onRandomTick(level: Level, pos: BlockPos): void {
        const blockAbove = level.getBlockAt(new Vector3(pos.x, pos.y + 1, pos.z));
        if (!blockAbove || !blockAbove.blocksLight) {
            return;
        }

        level.setBlockAt(new Vector3(pos.x, pos.y, pos.z), Blocks.DIRT);
    }
}
