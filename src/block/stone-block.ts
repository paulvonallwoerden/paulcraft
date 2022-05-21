import { Block } from "./block";
import { BlockFaces } from "./block-face";
import { BlockModel } from "./block-model/block-model";

export const StoneBlockModel: BlockModel = {
    elements: [
        {
            from: [0, 0, 0],
            to: [15, 15, 15],
            faces: BlockFaces.reduce((faces, face) => ({
                ...faces,
                [face]: {
                    cull: true,
                    texture: 'textures/blocks/stone.png',
                },
            }), {}),
        },
    ],
}

export class StoneBlock extends Block {
    public constructor() {
        super('stone', [StoneBlockModel]);
    }

    public getBlockModel(): number {
        return 0;
    }
}
