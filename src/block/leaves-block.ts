import { Block } from "./block";
import { BlockFaces } from "./block-face";
import { BlockModel } from "./block-model/block-model";

export const LeavesBlockModel: BlockModel = {
    elements: [
        {
            from: [0, 0, 0],
            to: [15, 15, 15],
            faces: BlockFaces.reduce((faces, face) => ({
                ...faces,
                [face]: {
                    texture: 'textures/blocks/oak_leaves.png',
                },
            }), {}),
        },
    ],
}

export class LeavesBlock extends Block {
    public readonly isFoliage = true;
    public readonly blocksLight = false;

    public constructor() {
        super('leaves', [LeavesBlockModel]);
    }
}
