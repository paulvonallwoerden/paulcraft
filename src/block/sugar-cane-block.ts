import { Block } from "./block";
import { BlockFace } from "./block-face";
import { BlockModel } from "./block-model/block-model";

const SugarCaneBlockModel: BlockModel = {
    itemTexture: 'textures/items/sugar_cane.png',
    elements: [
        {
            from: [0, 0, 7.5],
            to: [15, 15, 7.5],
            rotation: {
                angle: 45,
                axis: 'y',
                origin: [0.5, 0.5, 0.5],
            },
            faces: {
                [BlockFace.FRONT]: { texture: 'textures/blocks/sugar_cane.png' },
                [BlockFace.BACK]: { texture: 'textures/blocks/sugar_cane.png' },
            },
        },
        {
            from: [0, 0, 7.5],
            to: [15, 15, 7.5],
            rotation: {
                angle: -45,
                axis: 'y',
                origin: [0.5, 0.5, 0.5],
            },
            faces: {
                [BlockFace.FRONT]: { texture: 'textures/blocks/sugar_cane.png' },
                [BlockFace.BACK]: { texture: 'textures/blocks/sugar_cane.png' },
            },
        },
    ],
}

export class SugarCaneBlock extends Block {
    public readonly blocksLight = false;

    public constructor() {
        super('sugar_cane', 'Sugarcane', [SugarCaneBlockModel]);
    }

    public isCollidable(): boolean {
        return false;
    }
}
