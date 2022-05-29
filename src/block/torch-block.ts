import { Block } from './block';
import { BlockFace } from './block-face';
import { BlockModel } from './block-model/block-model';

export const TorchBlockModel: BlockModel = {
    elements: [
        {
            from: [7, 0, 7],
            to: [8, 9, 8],
            faces: {
                [BlockFace.TOP]: {
                    texture: 'textures/blocks/tnt_top.png',
                },
                [BlockFace.BOTTOM]: {
                    texture: 'textures/blocks/oak_log_top.png',
                },
                [BlockFace.FRONT]: {
                    texture: 'textures/blocks/oak_log.png',
                },
                [BlockFace.BACK]: {
                    texture: 'textures/blocks/oak_log.png',
                },
                [BlockFace.LEFT]: {
                    texture: 'textures/blocks/oak_log.png',
                },
                [BlockFace.RIGHT]: {
                    texture: 'textures/blocks/oak_log.png',
                },
            },
        },
    ],
}

export class TorchBlock extends Block {
    public readonly blocksLight = false;
    public readonly occludesNeighborBlocks = false;

    public constructor() {
        super('torch', [TorchBlockModel]);
    }

    public getLightLevel(): number {
        return 15;
    }

    public isCollidable(): boolean {
        return false;
    }
}
