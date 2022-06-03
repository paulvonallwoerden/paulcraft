import { Block } from "./block";
import { BlockFaces } from "./block-face";
import { BlockModel } from "./block-model/block-model";

export const WaterBlockModel: BlockModel = {
    itemTexture: 'textures/items/water_bucket.png',
    elements: [
        {
            from: [0, 0, 0],
            to: [15, 13, 15],
            faces: BlockFaces.reduce((faces, face) => ({
                ...faces,
                [face]: {
                    cull: true,
                    texture: 'textures/blocks/water.png',
                },
            }), {}),
        },
    ],
}

export class WaterBlock extends Block {
    public readonly blocksLight = false;

    public constructor() {
        super('water', 'Water', [WaterBlockModel]);
    }

    public isCollidable(): boolean {
        return false;
    }
}
