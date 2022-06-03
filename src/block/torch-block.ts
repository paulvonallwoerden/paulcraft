import { Player } from '../player/player';
import { World } from '../world/world';
import { Block } from './block';
import { BlockFace } from './block-face';
import { BlockModel } from './block-model/block-model';
import { BlockPos } from './block-pos';
import { BlockState } from './block-state/block-state';
import { Blocks } from './blocks';

const StandingTorchBlockModel: BlockModel = {
    itemTexture: 'textures/items/torch.png',
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

function makeHangingTorchBlockModel(angle: number): BlockModel {
    return {
        rotation: {
            axis: 'y',
            angle,
            origin: [0.5, 0, 0.5],
        },
        elements: [
            {
                from: [7, 4, 0],
                to: [8, 13, 1],
                rotation: {
                    axis: 'x',
                    angle: 20,
                    origin: [0, 0.5, 0],
                },
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
    };
}

type TorchBlockStateValues = {
    standing: boolean;
    facing: 0 | 1 | 2 | 3;
}

const DefaultTorchBlockStateValues: TorchBlockStateValues = {
    standing: true,
    facing: 0,
};

export class TorchBlock extends Block {
    public readonly blocksLight = false;
    public readonly occludesNeighborBlocks = false;

    public constructor() {
        super('torch', 'Torch', [
            StandingTorchBlockModel,
            makeHangingTorchBlockModel(0),
            makeHangingTorchBlockModel(90),
            makeHangingTorchBlockModel(180),
            makeHangingTorchBlockModel(270),
        ]);
    }

    public onSetBlock(world: World, pos: BlockPos): void {
        const existingState = world.getBlockState(pos);
        if (existingState !== undefined) {
            return;
        }

        world.setBlockState(pos, new BlockState({ ...DefaultTorchBlockStateValues }));
    }

    public onPlace(player: Player, world: World, pos: BlockPos): boolean {
        const facing = player.getFacingDirection();
        const standing = world.getBlock({ x: pos.x, y: pos.y - 1, z: pos.z }) !== Blocks.AIR;
        world.setBlockState(pos, new BlockState({ standing, facing }));

        return true;
    }


    public getBlockModel(state: BlockState<TorchBlockStateValues>): number {
        if (state.get('standing')) {
            return 0;
        }

        return 1 + state.get('facing');
    }

    public getLightLevel(): number {
        return 15;
    }

    public isCollidable(): boolean {
        return false;
    }
}
