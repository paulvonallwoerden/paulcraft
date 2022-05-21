import { Vector3 } from "three";
import { Level } from "../level";
import { Block } from "./block";
import { BlockFace, BlockFaces } from "./block-face";
import { BlockModel, BlockModelElement } from "./block-model/block-model";
import { BlockPos } from "./block-pos";
import { BlockState, BlockStateValues } from "./block-state/block-state";
import { Blocks } from "./blocks";

const CauldronBlockModelSideFaces: BlockModelElement['faces'] = {
    [BlockFace.TOP]: { texture: 'textures/blocks/cauldron_top.png' },
    [BlockFace.BOTTOM]: { texture: 'textures/blocks/cauldron_bottom.png' },
    [BlockFace.LEFT]: { texture: 'textures/blocks/cauldron_side.png' },
    [BlockFace.RIGHT]: { texture: 'textures/blocks/cauldron_side.png' },
    [BlockFace.FRONT]: { texture: 'textures/blocks/cauldron_side.png' },
    [BlockFace.BACK]: { texture: 'textures/blocks/cauldron_side.png' },
}

export function makeCauldronBlockModel(level: number): BlockModel {
    const model: BlockModel = {
        elements: [
            // Sides
            {
                from: [0, 2, 0],
                to: [15, 15, 2],
                faces: CauldronBlockModelSideFaces,
            },
            {
                from: [0, 2, 13],
                to: [15, 15, 15],
                faces: CauldronBlockModelSideFaces,
            },
            {
                from: [0, 2, 2],
                to: [2, 15, 13],
                faces: CauldronBlockModelSideFaces,
            },
            {
                from: [13, 2, 2],
                to: [15, 15, 13],
                faces: CauldronBlockModelSideFaces,
            },
            // Legs
            {
                from: [0, 0, 0],
                to: [5, 2, 5],
                faces: BlockFaces.reduce((faces, face) => ({
                    ...faces,
                    [face]: {
                        cull: false,
                        texture: 'textures/blocks/cauldron_side.png',
                    },
                }), {}),
            },
            {
                from: [13, 0, 0],
                to: [15, 4, 2],
                faces: BlockFaces.reduce((faces, face) => ({
                    ...faces,
                    [face]: {
                        cull: false,
                        texture: 'textures/blocks/cauldron_side.png',
                    },
                }), {}),
            },
            {
                from: [0, 0, 13],
                to: [2, 4, 15],
                faces: BlockFaces.reduce((faces, face) => ({
                    ...faces,
                    [face]: {
                        cull: false,
                        texture: 'textures/blocks/cauldron_side.png',
                    },
                }), {}),
            },
            {
                from: [13, 0, 13],
                to: [15, 4, 15],
                faces: BlockFaces.reduce((faces, face) => ({
                    ...faces,
                    [face]: {
                        cull: false,
                        texture: 'textures/blocks/cauldron_side.png',
                    },
                }), {}),
            },
        ],
    };

    if (level <= 0) {
        return model;
    }

    model.elements.push({
        from: [2, 3 + (level - 1) * 5, 2],
        to: [13, 3 + (level - 1) * 5, 13],
        faces: {
            [BlockFace.TOP]: {
                cull: false,
                texture: 'textures/blocks/water.png',
            }
        },
    });

    return model;
};

export interface IBlockState<T extends BlockStateValues> {
    getDefaultState(): T;
}

export class CauldronBlock extends Block implements IBlockState<{ level: number }> {
    public constructor() {
        super('cauldron', [
            makeCauldronBlockModel(0),
            makeCauldronBlockModel(1),
            makeCauldronBlockModel(2),
            makeCauldronBlockModel(3),
        ]);
    }

    public getDefaultState(): { level: number; } {
        return { level: 0 };
    }

    public getBlockModel(level: Level, pos: BlockPos): number {
        return 3;
    }
}
