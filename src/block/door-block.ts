import { Player } from '../player/player';
import { World } from '../world/world';
import { Block } from './block';
import { BlockFaces } from './block-face';
import { BlockModel } from './block-model/block-model';
import { BlockPos } from './block-pos';
import { BlockState } from './block-state/block-state';
import { Blocks } from './blocks';

export function makeDoorBlockModel(open: boolean, rotation: number, texture: string): BlockModel {
    return {
        rotation: {
            angle: rotation,
            axis: 'y',
            origin: [0.5, 0.5, 0.5],
        },
        elements: [
            {
                from: [0, 0, 0],
                to: open ? [15, 15, 2] : [2, 15, 15],
                faces: BlockFaces.reduce((faces, face) => ({
                    ...faces,
                    [face]: { texture },
                }), {}),
            },
        ],
    };
}

const DefaultDoorBlockStateValues = { open: false, isTop: false, facing: 0 };
type DoorBlockStateValues = typeof DefaultDoorBlockStateValues;

export class DoorBlock extends Block {
    public constructor() {
        super('door', [
            makeDoorBlockModel(false, 90, 'textures/blocks/oak_door_bottom.png'),
            makeDoorBlockModel(true, 90, 'textures/blocks/oak_door_bottom.png'),
            makeDoorBlockModel(false, 90, 'textures/blocks/oak_door_top.png'),
            makeDoorBlockModel(true, 90, 'textures/blocks/oak_door_top.png'),

            makeDoorBlockModel(false, 180, 'textures/blocks/oak_door_bottom.png'),
            makeDoorBlockModel(true, 180, 'textures/blocks/oak_door_bottom.png'),
            makeDoorBlockModel(false, 180, 'textures/blocks/oak_door_top.png'),
            makeDoorBlockModel(true, 180, 'textures/blocks/oak_door_top.png'),

            makeDoorBlockModel(false, 270, 'textures/blocks/oak_door_bottom.png'),
            makeDoorBlockModel(true, 270, 'textures/blocks/oak_door_bottom.png'),
            makeDoorBlockModel(false, 270, 'textures/blocks/oak_door_top.png'),
            makeDoorBlockModel(true, 270, 'textures/blocks/oak_door_top.png'),

            makeDoorBlockModel(false, 0, 'textures/blocks/oak_door_bottom.png'),
            makeDoorBlockModel(true, 0, 'textures/blocks/oak_door_bottom.png'),
            makeDoorBlockModel(false, 0, 'textures/blocks/oak_door_top.png'),
            makeDoorBlockModel(true, 0, 'textures/blocks/oak_door_top.png'),
        ]);
    }

    public getBlockModel(blockState: BlockState<DoorBlockStateValues>): number {
        const open = blockState.get('open');
        const top = blockState.get('isTop');
        const facing = blockState.get('facing');

        return (top ? 2 : 0) + (open ? 1 : 0) + facing * 4;
    }

    public onSetBlock(world: World, pos: BlockPos): void {
        const existingState = world.getBlockState(pos);
        if (existingState !== undefined) {
            return;
        }

        world.setBlockState(pos, new BlockState({ ...DefaultDoorBlockStateValues }));
    }

    public onPlace(player: Player, world: World, pos: BlockPos): boolean {
        const facing = player.getFacingDirection();
        world.setBlockState(pos, new BlockState({ ...DefaultDoorBlockStateValues, facing }));

        const topPos = { ...pos, y: pos.y + 1 };
        world.setBlockState(topPos, new BlockState({ ...DefaultDoorBlockStateValues, isTop: true, facing }));
        world.setBlock(topPos, Blocks.DOOR);

        return true;
    }

    public onInteract(world: World, pos: BlockPos): boolean {
        const topPos = { ...pos, y: pos.y + 1 };
        const top = world.getBlock(topPos);
        if (top instanceof DoorBlock) {
            top.toggleOpen(world, topPos);
            this.toggleOpen(world, pos, true);
        } else {
            const bottomPos = { ...pos, y: pos.y - 1 };
            const bottom = world.getBlock(bottomPos);
            if (bottom instanceof DoorBlock) {
                bottom.toggleOpen(world, bottomPos);
                this.toggleOpen(world, pos, true);
            }
        }

        return true;
    }

    public onBreak(world: World, pos: BlockPos): void {
        const topPos = { ...pos, y: pos.y + 1 };
        const top = world.getBlock(topPos);
        if (top instanceof DoorBlock) {
            world.setBlock(topPos, Blocks.AIR);
        } else {
            const bottomPos = { ...pos, y: pos.y - 1 };
            const bottom = world.getBlock(bottomPos);
            if (bottom instanceof DoorBlock) {
                world.setBlock(bottomPos, Blocks.AIR);
            }
        }
    }

    public isCollidable(world: World, pos: BlockPos): boolean {
        const state = world.getBlockState<DoorBlockStateValues>(pos)!;

        return !state.get('open');
    }

    protected toggleOpen(world: World, pos: BlockPos, playSound = false) {
        const state = world.getBlockState(pos)!;
        const isOpen = state.get('open');
        state.set('open', !isOpen);
        world.setBlockState(pos, state);

        if (playSound) {
            if (!isOpen) world.playSound('block.door.open');
            if (isOpen) world.playSound('block.door.close');
        }
    }
}
