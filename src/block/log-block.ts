import { Block } from "./block";
import { BlockFace } from "./block-face";
import { BlockModel } from "./block-model/block-model";

export const OakLogBlockModel: BlockModel = {
    elements: [
        {
            from: [0, 0, 0],
            to: [15, 15, 15],
            faces: {
                [BlockFace.TOP]: {
                    cull: true,
                    texture: 'textures/blocks/oak_log_top.png',
                },
                [BlockFace.BOTTOM]: {
                    cull: true,
                    texture: 'textures/blocks/oak_log_top.png',
                },
                [BlockFace.FRONT]: {
                    cull: true,
                    texture: 'textures/blocks/oak_log.png',
                },
                [BlockFace.BACK]: {
                    cull: true,
                    texture: 'textures/blocks/oak_log.png',
                },
                [BlockFace.LEFT]: {
                    cull: true,
                    texture: 'textures/blocks/oak_log.png',
                },
                [BlockFace.RIGHT]: {
                    cull: true,
                    texture: 'textures/blocks/oak_log.png',
                },
            },
        },
    ],
}

export class OakLogBlock extends Block {
    public constructor() {
        super('oak_log', [OakLogBlockModel]);
    }
}
